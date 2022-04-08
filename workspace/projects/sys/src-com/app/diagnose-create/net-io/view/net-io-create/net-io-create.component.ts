import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NetIoTransRawUtil, NetIoTransFormUtil } from '../../util';
import { NetIoDataService } from '../../service';
import {
  IpProtocolType,
  DialTestScene,
  DiagnoseFunc,
  Pathmtudis,
  NetioTaskForm,
  TransDirection,
  ProjectInfo,
  NetioTaskInfoRaw,
} from '../../domain';
import { TiValidators } from '@cloud/tiny3';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';

enum ActionType {
  Create = 'create',
  Restart = 'restart',
  Edit = 'edit',
}

@Component({
  selector: 'app-net-io-create',
  templateUrl: './net-io-create.component.html',
  styleUrls: ['./net-io-create.component.scss'],
})
export class NetIoCreateComponent implements OnInit {
  @Input() actionType: ActionType;
  @Input() projectName: string;
  @Input() taskDetail: any;
  @Input()
  set networkinfo(val: NetioTaskInfoRaw) {
    if (null == val) {
      return;
    }
    const fgValue = NetIoTransFormUtil.transFormData(val);
    this.formGroup.patchValue(fgValue);
  }
  @Input() projectId = +sessionStorage.getItem('projectId');
  @Input()
  set taskName(val: string) {
    this.taskNameStash = val;
    this.formGroup?.get('taskName')?.setValue(val);
    this.formGroup?.updateValueAndValidity();
  }
  get taskName() {
    return this.taskNameStash;
  }

  @Output() sendMissionKeep = new EventEmitter<any>();
  @Output() closeTab = new EventEmitter<any>();

  projectInfo: ProjectInfo;
  formGroup: FormGroup;

  outsideLabelWidth = '209px';
  insideLabelWidth = '185px';
  nodeOptions: { label: string; value: string }[] = [];
  theme$: Observable<HyTheme>;

  // 配置项
  formOption = {
    taskNodeIp: { display: false },
    dialing: { display: false },
    packetLoss: { display: false },
    netCaught: { display: false },
    load: { display: false },
    doOrder: { display: true },
    orderConfig: { display: false },
    taskStartNow: { display: false },
  };

  private taskNameStash: string;

  constructor(
    private dataServe: NetIoDataService,
    private themeService: HyThemeService
  ) {
    this.theme$ = this.themeService.getObservable();

    // 新建表单
    this.formGroup = this.initFormGroup(this.taskName);

    // 设置响应事件
    // 响应事件1 : 诊断功能监听
    this.formGroup.get('functions').valueChanges.subscribe((val) => {
      this.setFormOptionAndState(this.formOption, this.formGroup, val);
    });
    // 响应事件2 : 预约任务启动按钮监听
    this.formGroup.get('doOrder').valueChanges.subscribe((val) => {
      this.formOption.orderConfig.display = val;
      if (val) {
        this.formGroup.get('orderConfig').enable();
        this.formGroup.get('taskStartNow').patchValue(false);
        this.formOption.taskStartNow.display = false;
      } else {
        this.formGroup.get('orderConfig').disable();
        this.formGroup.get('taskStartNow').patchValue(true);
        this.formOption.taskStartNow.display = true;
      }
    });
  }

  async ngOnInit() {
    // 请求工程数据
    const projRes = await this.dataServe.pullProjectInfo(this.projectId);
    this.projectInfo = projRes.data;

    // 计算任务节点选项
    this.nodeOptions = this.projectInfo.nodeList.map((item) => {
      return { label: item.nodeIp, value: item.nodeIp };
    });

    // 判断行为类型
    switch (this.actionType) {
      case ActionType.Create:
        // 设置默认值
        const defaultData = this.getDefaultTaskData();
        this.formGroup.patchValue(defaultData);
        break;
      case ActionType.Edit:
      case ActionType.Restart:
        const resp = await this.dataServe.pullRawTaskInfo(this.taskDetail.id);
        const editData = NetIoTransFormUtil.transFormData(resp.data);
        this.formGroup.patchValue(editData);
        this.formOption.doOrder.display = false;
        this.formGroup.get('doOrder').patchValue(false);
        this.formOption.taskStartNow.display = false;
        break;
      default:
        break;
    }
  }

  /**
   * 创建任务、重启任务、修改任务
   */
  onCreate() {
    if (!this.formGroup.valid) {
      this.formGroup.markAsDirty();
      return;
    }

    const formData: NetioTaskForm = this.formGroup.value;
    const rawData = NetIoTransRawUtil.transRawData(
      formData,
      this.projectName,
      this.taskName,
      this.projectInfo.nodeList
    );
    // 调优助手跳转创建任务
    if (this.taskDetail.isFromTuningHelper) {
      Object.assign(
        rawData,
        {
          // 优化建议id
          suggestionId: this.taskDetail.suggestionId,
          // 调优助手任务id
          optimizationId: this.taskDetail.optimizationId,
        }
      );
    }
    const { doOrder, taskStartNow } = formData;
    switch (this.actionType) {
      case ActionType.Create:
        this.dataServe.createNewTask(
          rawData,
          doOrder,
          taskStartNow,
          this.projectName,
          this.closeTab
        );
        break;
      case ActionType.Edit:
        this.dataServe.editTask(
          rawData,
          this.taskDetail.id,
          this.projectName,
          taskStartNow,
          this.closeTab
        );
        break;
      case ActionType.Restart:
        this.dataServe.restartTask(
          rawData,
          this.taskDetail.id,
          this.projectName,
          this.closeTab
        );
        break;
      default:
        break;
    }
  }

  /**
   * 取消任务
   */
  onCancel() {
    this.closeTab.emit({});
  }

  /**
   * 保存模板
   */
  onSaveTemplate() {
    const formData: NetioTaskForm = this.formGroup.value;
    const rawData = NetIoTransRawUtil.transRawData(
      formData,
      this.projectName,
      this.taskName,
      this.projectInfo.nodeList
    );
    this.sendMissionKeep.emit(rawData);
  }

  private setFormOptionAndState(
    formOption: any,
    formGroup: FormGroup,
    functions: DiagnoseFunc[]
  ) {
    // 设置表单项的显隐
    formOption.dialing.display = functions.includes(DiagnoseFunc.DialingTest);
    formOption.packetLoss.display = functions.includes(DiagnoseFunc.PacketLoss);
    formOption.netCaught.display = functions.includes(DiagnoseFunc.NetCaught);
    formOption.load.display = functions.includes(DiagnoseFunc.Load);
    formOption.taskNodeIp.display =
      formOption.packetLoss.display ||
      formOption.netCaught.display ||
      formOption.load.display;

    // 设置控件的失能和使能
    formOption.dialing.display
      ? formGroup.get('dialing').enable()
      : formGroup.get('dialing').disable();

    formOption.packetLoss.display
      ? formGroup.get('packetLoss').enable()
      : formGroup.get('packetLoss').disable();

    formOption.netCaught.display
      ? formGroup.get('netCaught').enable()
      : formGroup.get('netCaught').disable();

    formOption.load.display
      ? formGroup.get('load').enable()
      : formGroup.get('load').disable();

    formOption.taskNodeIp.display
      ? formGroup.get('taskNodeIp').enable()
      : formGroup.get('taskNodeIp').disable();
  }

  private initFormGroup(taskName: string): FormGroup {
    const formGroup = new FormGroup({
      taskName: new FormControl(taskName, [
        TiValidators.required,
        TiValidators.regExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$'),
      ]),
      functions: new FormControl([], [TiValidators.required]),
      packetLoss: new FormControl(),
      taskNodeIp: new FormControl([], [TiValidators.required]),
      dialing: new FormControl(),
      netCaught: new FormControl(),
      load: new FormControl(),
      // 预约定时启动
      doOrder: new FormControl(),
      // 预约定时编辑控件
      orderConfig: new FormControl(),
      // 立即启动
      taskStartNow: new FormControl(),
    });

    return formGroup;
  }

  private getDefaultTaskData(): NetioTaskForm {
    const dailingParam: NetioTaskForm['dialing'] = {
      dialScene: DialTestScene.Connection,
      connection: {
        protocolType: IpProtocolType.IPv4,
        servers: [
          {
            serverIp: '',
            sourceIp: '',
            sourceEth: '',
            destinationIp: '',
          },
        ],
        msgLen: 56,
        interval: 1000,
        duration: 10,
        pathmtudis: Pathmtudis.Want,
        ttl: 30,
      },
      tcp: {
        protocolType: IpProtocolType.IPv4,
        networkParam: {
          server: {
            serverIp: '',
            serverBindIp: '',
            listenPort: '5201',
          },
          client: {
            clientIp: '',
            sourceEth: '',
            clientBindIp: '',
            connectPort: '5201',
          },
        },

        interval: 1000,
        bandwidth: '',
        dialLimitVal: {
          duration: 10,
        },
        packetSize: '128K',
        concurrency: 1,
        MSSLen: 1460,
        zeroCopy: false,
      },
      udp: {
        protocolType: IpProtocolType.IPv4,
        networkParam: {
          server: {
            serverIp: '',
            serverBindIp: '',
            listenPort: '5201',
          },
          client: {
            // 客户端参数
            clientIp: '',
            sourceEth: '',
            clientBindIp: '',
            connectPort: '5201',
          },
        },
        interval: 1000,
        bandwidth: '1M',
        dialLimitVal: {
          duration: 10,
        },
        packetSize: '1448',
        concurrency: 1,
        zeroCopy: false,
      },
    };
    const packetLossParam: NetioTaskForm['packetLoss'] = {
      collectDuration: 10,
      isCollectKernel: false,
      fileSize: 1024,
      interval: 1,
    };
    const netCaughtParam: NetioTaskForm['netCaught'] = {
      ethName: '',
      filterCondition: {
        protocolType: IpProtocolType.IPv4,
        direction: TransDirection.Send,
      },
      caughtDuration: 10,
      blockCount: 1000,
      fileSize: 100,
      fileNumber: 1,
    };
    const loadParam: NetioTaskForm['load'] = {
      loadDuration: 10,
      loadInterval: 1,
    };

    const taskData = {
      functions: [DiagnoseFunc.DialingTest],
      dialing: dailingParam,
      packetLoss: packetLossParam,
      netCaught: netCaughtParam,
      load: loadParam,
      doOrder: false,
      taskStartNow: true,
    };

    return taskData;
  }
}
