import {
  Component,
  Output,
  EventEmitter,
  Input,
  AfterViewInit,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NetIoTransFormUtil, NetIoTransRawUtil } from '../../util';
import { DiagnoseFunc, DialTestScene, NetioTaskInfoRaw } from '../../domain';
import { NetIoDataService } from '../../service';
import { ProjectInfo } from 'sys/src-com/app/domain';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-net-io-schedule',
  templateUrl: './net-io-schedule.component.html',
  styleUrls: ['./net-io-schedule.component.scss'],
})
export class NetIoScheduleComponent implements AfterViewInit {
  @Input() taskData: NetioTaskInfoRaw;
  @Input() scheduleTaskId: number;
  @Input() projectId: number;

  @Output() confirmModify = new EventEmitter<string>();
  @Output() cancelModify = new EventEmitter<void>();

  projectInfo: ProjectInfo;
  formGroup: FormGroup;

  outsideLabelWidth = '191px';
  insideLabelWidth = '167px';
  dialTestSceneEnum = DialTestScene;
  diagnoseFuncEnum = DiagnoseFunc;
  nodeOptions: { label: string; value: string }[] = [];
  theme$: Observable<HyTheme>;

  // 配置项
  formOption = {
    taskNodeIp: { display: true },
    dialing: { display: true },
    packetLoss: { display: false },
    netCaught: { display: false },
    load: { display: false },
    doOrder: { display: false },
    orderConfig: { display: false },
    taskStartNow: { display: true },
  };

  constructor(
    private dataServe: NetIoDataService,
    private themeService: HyThemeService
  ) {
    this.theme$ = this.themeService.getObservable();

    // 新建表单
    this.formGroup = this.initFormGroup();

    // 设置表单响应事件
    // 响应事件1 : 诊断功能监听
    this.formGroup.get('functions').valueChanges.subscribe((val) => {
      this.setFormOptionAndState(this.formOption, this.formGroup, val);
    });
    // 响应事件2 : 预约任务启动按钮监听
    this.formGroup.get('doOrder').valueChanges.subscribe((val) => {
      this.formOption.orderConfig.display = val;
      if (val) {
        this.formGroup.get('orderConfig').enable();
        this.formGroup.get('taskStartNow').setValue(false);
        this.formOption.taskStartNow.display = false;
      } else {
        this.formGroup.get('orderConfig').disable();
        this.formGroup.get('taskStartNow').setValue(true);
        this.formOption.taskStartNow.display = true;
      }
    });
  }

  async ngAfterViewInit() {
    // 请求工程信息
    const projRes = await this.dataServe.pullProjectInfo(this.projectId);
    this.projectInfo = projRes.data;

    // 计算任务节点选项
    this.nodeOptions = this.projectInfo.nodeList.map((item) => {
      return { label: item.nodeIp, value: item.nodeIp };
    });
    // 回写表单值
    const formData = NetIoTransFormUtil.transFormData(this.taskData);
    this.formGroup.patchValue(formData);
  }

  onConfirm() {
    const rawData = NetIoTransRawUtil.transRawData(
      this.formGroup.value,
      this.taskData.projectName,
      this.taskData.taskName,
      this.projectInfo.nodeList
    );
    this.dataServe.pushScheduleData(
      this.scheduleTaskId,
      rawData,
      this.confirmModify
    );
  }

  onCancel() {
    this.cancelModify.emit();
  }

  private initFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      functions: new FormControl(),
      taskNodeIp: new FormControl(),
      dialing: new FormControl(),
      packetLoss: new FormControl(),
      netCaught: new FormControl(),
      load: new FormControl(),
      doOrder: new FormControl(), // 预约定时启动
      orderConfig: new FormControl(), // 预约定时编辑控件
      taskStartNow: new FormControl(), // 立即启动
    });

    return formGroup;
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
}
