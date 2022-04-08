import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChange,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { PartialObserver } from 'rxjs';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { INodeInfo } from '../../../domain';
import {
  AnalysisTarget,
  HpcPresetType,
  SpinnerBlurInfo,
  CollectionType,
} from 'projects/sys/src-web/app/domain';
import { IHpcFormGroupValue, IHpcSchTaskInfo } from '../../domain';
import { MissionHpcDataService, MissionHpcFormService } from '../../serivices';
import { AxiosService } from '../../../../service/axios.service';
import { CustomValidatorsService } from '../../../../service';
import { AnalysisType } from 'projects/sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-mission-hpc-schedule',
  templateUrl: './mission-hpc-schedule.component.html',
  styleUrls: ['./mission-hpc-schedule.component.scss'],
})
export class MissionHpcScheduleComponent implements OnInit, OnChanges {
  @Output() cancelModify = new EventEmitter<void>();
  @Output() confirmModify = new EventEmitter<string>();
  @Output() private handleNodeEmitIndex = new EventEmitter<any>();

  @Input() taskInfo: IHpcSchTaskInfo;
  @Input() scheduleTaskId: number;
  /** 进程名称和PID校验是否通过 */
  @Input() modePidValid: boolean;
  @Input() projectId: string;
  @Input() projectName: string;
  @Input() nodeConfigedData: any; // 配置节点返回数据

  @ViewChild('nodeConfigC') nodeConfigC: any;

  analysisMode: AnalysisTarget;

  formGroup: FormGroup;
  hpcPresetOption = HpcPresetType;
  collectionType = CollectionType;
  nodeInfo: INodeInfo[];

  i18n: any;
  labelWidth = '240px';
  analysisTagValue: string;
  public analysisType = AnalysisType;
  public formDatas: any;
  public runUserData = {
    runUser: false,
    user_name: '',
    password: '',
  };
  public runUserDataObj: {
    [key: string]: {
      user_name: string;
      password: string;
      runUser?: boolean;
    };
  } = {};

  /** 配置表 */
  formOption = {
    taskName: { display: true },
    analysisType: { display: true },
    analysisTarget: { display: true },
    analysisMode: { display: true },
    appAndParams: { display: true },
    pidProcess: { display: true },
    selectNodeList: { display: false },
    duration: { display: true },
    preset: { display: true },
    collection: { display: true },
    openMpParams: { display: false },
    mpiStatus: { display: true },
    mpiEnvDir: { display: true },
    rank: { display: true },
    doOrder: { display: false },
    orderConfig: { display: true },
    taskStartNow: { display: false },
    doNodeConfig: { display: false },
  };

  public samplingDurationBlur: SpinnerBlurInfo;
  public rankBlur: SpinnerBlurInfo;

  // 所允许的所有应用路径，如： /opt/;/home/
  public modeAppPathAllow = '';

  // 工程下节点信息
  nodeList: any[] = [];
  isSelectNodeDisabled: boolean;

  constructor(
    private fb: FormBuilder,
    private i18nService: I18nService,
    private dataService: MissionHpcDataService,
    private formService: MissionHpcFormService,
    public Axios: AxiosService,
    public customValidatorsService: CustomValidatorsService,
    private http: HttpService
  ) {
    this.i18n = this.i18nService.I18n();
    this.formGroup = this.fb.group({
      taskName: [],
      appAndParams: [],
      pidProcess: [], // 进程ID和进程名称
      nodeList: [],
      duration: [
        60,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(3600),
        ],
      ],
      preset: [HpcPresetType.Summary], // HPC 分析模式
      openMpParams: [null, this.customValidatorsService.checkOpenMPParam()],
      mpiStatus: [false],
      mpiEnvDir: [
        { value: '', disabled: true },
        this.customValidatorsService.checkFilePath(),
      ],
      rank: [
        4,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(128),
        ],
      ],
      doOrder: [true],
      orderConfig: [],
      taskStartNow: [{ value: true, disabled: true }],
      doNodeConfig: [false], // 是否进行节点参数配置
    });

    // 设置 MPI 状态的响应
    const mpiStatusOberver: PartialObserver<boolean> = {
      next: (status: boolean) => {
        this.formOption.mpiEnvDir.display = status;
        this.formOption.rank.display = status;
        if (status) {
          this.formGroup.get('mpiEnvDir').enable();
          this.formGroup.get('rank').enable();
        } else {
          this.formGroup.get('mpiEnvDir').disable();
          this.formGroup.get('rank').disable();
        }
      },
    };
    this.formGroup.get('mpiStatus').valueChanges.subscribe(mpiStatusOberver);
  }

  /**
   * 监控 Input 参数的变化, 并初始化 分析模式 和 分析对象
   * @param changes 变化的 Input 参数
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'taskInfo':
          this.analysisMode = this.taskInfo[
            'analysis-target'
          ] as AnalysisTarget;
          break;
        case 'modeApplicationUser':
          if (changes.modeApplicationUser.currentValue) {
            this.runUserData.user_name =
              changes.modeApplicationUser.currentValue;
          }
          break;
        case 'modeApplicationPassWord':
          if (changes.modeApplicationPassWord.currentValue) {
            this.runUserData.password =
              changes.modeApplicationPassWord.currentValue;
          }
          break;
        default:
      }
    }
  }

  async ngOnInit() {
    this.getProjectNodes();
    // 获取 应用路径
    this.Axios.axios.get('config/system/').then(({ data }: any) => {
      this.modeAppPathAllow =
        data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
    });
    // 为分析对象赋值
    const analysisTagMap = new Map<AnalysisTarget, string>([
      [
        AnalysisTarget.PROFILE_SYSTEM,
        this.i18n.common_term_projiect_task_system,
      ],
      [
        AnalysisTarget.LAUNCH_APPLICATION,
        this.i18n.common_term_task_crate_path,
      ],
      [AnalysisTarget.ATTACH_TO_PROCESS, this.i18n.common_term_task_crate_path],
    ]);
    this.analysisTagValue = analysisTagMap.get(
      this.taskInfo['analysis-target']
    );

    // 设置显示和隐藏
    this.formOption.taskStartNow.display = false;
    switch (this.analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        this.formOption.mpiStatus.display = false;
        this.formGroup.get('mpiStatus').disable();
        this.formOption.appAndParams.display = false;
        this.formGroup.get('appAndParams').disable();
        this.formOption.analysisMode.display = false;
        this.formGroup.get('pidProcess').disable();
        this.formOption.pidProcess.display = false;
        this.formOption.doNodeConfig.display = false;
        this.formOption.collection.display = false;
        this.formGroup.get('mpiStatus').disable();
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        this.formOption.mpiStatus.display = true;
        this.formOption.openMpParams.display = true;
        this.formGroup.get('mpiStatus').enable();
        this.formOption.appAndParams.display = true;
        this.formGroup.get('appAndParams').enable();
        this.formOption.pidProcess.display = false;
        this.formGroup.get('pidProcess').disable();
        this.formOption.doNodeConfig.display = true;
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        this.formOption.mpiStatus.display = false;
        this.formGroup.get('mpiStatus').disable();
        this.formOption.appAndParams.display = false;
        this.formGroup.get('appAndParams').disable();
        this.formOption.pidProcess.display = true;
        this.formGroup.get('pidProcess').enable();
        this.formOption.doNodeConfig.display = true;
        this.formOption.collection.display = false;
        this.formGroup.get('mpiStatus').disable();
        break;
      default:
    }
    // 将数据填入表单
    const formData: IHpcFormGroupValue = this.formService.transForm(
      this.taskInfo
    );
    this.formGroup.get('nodeList').setValue(this.taskInfo.nodeConfig);
    this.formGroup.patchValue(formData);
    setTimeout(() => {
      if (this.taskInfo.switch && this.nodeConfigC) {
        this.nodeConfigC.importTemp(this.taskInfo.nodeConfig);
      }
    });

    this.setSpinnerBlur();
  }

  onClose() {
    this.cancelModify.emit();
  }

  async onModifyClick() {
    const nodeList = this.formGroup.get('nodeList').value;
    const nodeInfo: INodeInfo[] = nodeList.map((item: any) => {
      return {
        nickName: item.nickName,
        nodeId: item.id,
        nodeIp: item.nodeIp,
        nodeStatus: '',
        taskParam: { status: item?.task_param?.status || false },
      };
    });

    const params = this.formService.getRawDataByControls(
      this.analysisMode,
      this.formGroup,
      this.taskInfo.projectname,
      nodeInfo,
      this.nodeConfigC
    );

    this.dataService.pushScheduleData(
      this.scheduleTaskId,
      params,
      this.confirmModify
    );
  }

  selectNodeDisable(event: boolean) {
    this.isSelectNodeDisabled = event;
  }

  /**
   * 获取工程下的所有节点
   */
  private getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // 存储工程下的节点信息
        this.nodeList = res.data.nodeList;
      }
      // 获取工程
      const sceneName = res.data.sceneName;
      if ('HPC' === sceneName) {
        this.formOption.selectNodeList.display = true;
        this.formGroup.get('nodeList').enable();
      } else {
        this.formOption.selectNodeList.display = false;
        this.formGroup.get('nodeList').disable();
      }
    });
  }

  /**
   * 微调器回填初始化
   */
  private setSpinnerBlur() {
    this.samplingDurationBlur = {
      control: this.formGroup.controls.duration,
      min: 1,
      max: 3600,
    };
    this.rankBlur = {
      control: this.formGroup.controls.duration,
      min: 1,
      max: 128,
    };
  }

  /**
   * MPI命令所在目录输入检测
   */
  public mpiEnvDirValid(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          name: { tiErrorMessage: this.i18n.mission_create.modeAppPath },
        };
      }
      // 判断二：正则验证
      // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
      if (this.customValidatorsService.pathMatch(control.value)) {
        return {
          name: {
            tiErrorMessage: this.i18n.mission_create.modeAppWarn,
          },
        };
      }
      // 验证三：是否为系统配置指定路径下应用判断
      let isIncluded = false;
      const allowPathList: string[] = this.modeAppPathAllow.split(';');
      for (const allowPath of allowPathList) {
        if (
          control.value.includes(allowPath) &&
          control.value.indexOf(allowPath) === 0
        ) {
          isIncluded = true;
        }
      }
      if (!isIncluded) {
        return {
          name: {
            tiErrorMessage: (
              this.i18n.mission_create.modeAppPathInvalid as string
            ).replace(
              '${path}',
              this.Axios.getPathString(this.modeAppPathAllow)
            ),
          },
        };
      }
      return null;
    };
  }

  /**
   * 当点击开启参数配置时
   * @param taskName 名称
   */
  public onControlNode(taskName: any) {
    if (taskName) {
      this.formDatas = this.formService.transData(
        this.analysisMode,
        this.formGroup,
        this.projectName,
        this.nodeInfo
      );
      this.formGroup.get('appAndParams').disable();
      this.formGroup.get('openMpParams').disable();
    } else {
      this.formGroup.get('appAndParams').enable();
      this.formGroup.get('openMpParams').enable();
    }
  }

  /**
   *   传递节点参数
   */
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }
}
