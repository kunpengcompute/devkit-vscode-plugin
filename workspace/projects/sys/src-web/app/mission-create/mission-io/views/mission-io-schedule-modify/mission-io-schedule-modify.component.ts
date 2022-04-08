import {
  Component, OnInit, Output, Input, EventEmitter,
  OnChanges, SimpleChange, ChangeDetectorRef,
} from '@angular/core';
import { AnalysisTarget, SpinnerBlurInfo } from 'projects/sys/src-web/app/domain';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18nService } from '../../../../service/i18n.service';
import { HttpService } from 'sys/src-com/app/service';
import { ScheduleModifyService } from './service/schedule-modify.service';
import { IoFormControls, RawDataIO } from '../../io-domain';
import { MytipService } from '../../../../service/mytip.service';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';

/**
 * 汇集父组件传递的参数，确定分析对象 和 创建方式
 */
@Component({
  selector: 'app-mission-io-schedule-modify',
  templateUrl: './mission-io-schedule-modify.component.html',
  styleUrls: ['./mission-io-schedule-modify.component.scss']
})
export class MissionIoScheduleModifyComponent implements OnInit, OnChanges {
  @Output() cancelModify = new EventEmitter<void>();
  @Output() confirmModify = new EventEmitter<string>();

  /** 工程名称 */
  @Input() taskInfo: RawDataIO;
  @Input() scheduleTaskId: string;
  @Input() isModifySchedule: boolean;
  @Input() labelWidth: string;
  /** 任务ID */
  @Input() projectId: number;

  /** 分析对象 */
  public analysisMode: AnalysisTarget;

  /** 表单控件 */
  public formGroup: FormGroup;
  /** 表单控件组 */
  public ctl: IoFormControls;

  public i18n: any;
  /** 是否可以创建和保存 */
  public opreationEnable = false;
  /** 使用TiValidation定义接口类型 */
  public validation: TiValidationConfig = {
    type: 'blur'
  };
  public analysisTagValue: string;

  // /** 配置表 */
  public formOption = {
    taskName: { display: true },
    analysisType: { display: true },
    analysisTarget: { display: true },
    analysisMode: { display: true },
    appAndParams: { display: true },
    pidProcess: { display: true },
    selectNodeList: { display: false },
    duration: { display: true },
    statistical: { display: true },
    size: { display: true },
    stack: { display: true },
    doOrder: { display: false },
    orderConfig: { display: true },
    doNodeConfig: { display: true },
    nodeConfig: { display: true },
    taskStartNow: { display: true },
  };

  constructor(
    public i18nService: I18nService,
    private modifyService: ScheduleModifyService,
    private fb: FormBuilder,
    private http: HttpService,
    private mytip: MytipService,
  ) {
    this.i18n = i18nService.I18n();
    this.formGroup = this.fb.group({
      taskName: [], // 任务名称
      appAndParams: [], // 应用和应用参数
      pidProcess: [], // 进程ID和进程名称
      nodeList: [],
      duration: [30, [TiValidators.required, TiValidators.minValue(2), TiValidators.maxValue(300)]], // 采样时长
      statistical: [1, [TiValidators.required, TiValidators.minValue(1), TiValidators.maxValue(5)]], // 统计周期
      size: [100, [TiValidators.required, TiValidators.minValue(10), TiValidators.maxValue(500)]], // 采集文件大小
      stack: [false], // 采集调用栈
      doOrder: [false], // 是否预约定时启动
      orderConfig: [], // 预约配置参数
      doNodeConfig: [false], // 是否进行节点参数配置
      nodeConfig: [], // 配置节点参数
      taskStartNow: [true], // 立即启动
    });
    this.ctl = this.formGroup.controls;
  }

  public intervalBlur: SpinnerBlurInfo;
  public collectFileBlur: SpinnerBlurInfo;
  public samplingDurationBlur: SpinnerBlurInfo;
  // 工程下节点信息
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;

  ngOnInit() {
    this.getProjectNodes();
    // 为分析对象赋值
    const analysisTaretMap = new Map<AnalysisTarget, string>(
      [[AnalysisTarget.PROFILE_SYSTEM, this.i18n.common_term_projiect_task_system],
      [AnalysisTarget.ATTACH_TO_PROCESS, this.i18n.common_term_task_crate_path],
      [AnalysisTarget.LAUNCH_APPLICATION, this.i18n.common_term_task_crate_path]]
    );
    this.analysisTagValue
      = analysisTaretMap.get((this.taskInfo?.analysisTarget as AnalysisTarget)) || '--';

    // 校验
    this.formGroup.statusChanges.subscribe((status: string) => {
      if (status === 'INVALID') {
        this.opreationEnable = false;
      } else {
        this.opreationEnable = true;
      }
    });


    // 设置显示和隐藏
    this.formOption.taskStartNow.display = false;
    switch (this.analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        this.formOption.analysisMode.display = false;
        this.formOption.doNodeConfig.display = false;
        this.formOption.nodeConfig.display = false;
        this.formOption.pidProcess.display = false;
        this.formOption.appAndParams.display = false;
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        this.formOption.pidProcess.display = false;
        this.formOption.doNodeConfig.display = this.taskInfo.nodeConfig.length > 1;
        this.ctl.doNodeConfig.valueChanges.subscribe(doConfig => {
          this.formOption.nodeConfig.display = doConfig;
          doConfig ? this.ctl.appAndParams.disable() : this.ctl.appAndParams.enable();
          this.isSelectNodeDisabled = doConfig;
        });
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        this.formOption.appAndParams.display = false;
        this.formOption.doNodeConfig.display = this.taskInfo.nodeConfig.length > 1;
        this.ctl.doNodeConfig.valueChanges.subscribe(doConfig => {
          this.formOption.nodeConfig.display = doConfig;
          doConfig ? this.ctl.pidProcess.disable() : this.ctl.pidProcess.enable();
          this.isSelectNodeDisabled = doConfig;
        });
        break;
      default:
    }
    this.ctl.doOrder.disable();

    // 修正表单控件组
    this.modifyService.amendFormGroup(this.formGroup, this.analysisMode);

    // 将数据填入表单
    this.modifyService.setControlsByRawData(this.formGroup, this.taskInfo, this.analysisMode);
    this.formGroup.get('nodeList').setValue(this.taskInfo.nodeConfig);
    this.formGroup.get('nodeList').valueChanges.subscribe(val => {
      let nodeConfig = [];
      nodeConfig = val.map((item: any) => {
        const nodeItem: any = {
          nickName: item.nickName,
          nodeId: item.id,
          nodeIp: item.nodeIp,
          nodeStatus: item.nodeStatus,
        };
        switch (this.analysisMode) {
          case AnalysisTarget.LAUNCH_APPLICATION:
            nodeItem.taskParam = {
              appDir: this.formGroup.get('appAndParams').value.app,
              'app-parameters': this.formGroup.get('appAndParams').value.params,
              status: false,
            };
            break;
          case AnalysisTarget.ATTACH_TO_PROCESS:
            nodeItem.taskParam = {
              process_name: this.formGroup.get('pidProcess').value.process,
              targetPid: this.formGroup.get('pidProcess').value.pid,
              status: false
            };
            break;
          default:
            break;
        }
        return nodeItem;
      });
      this.formGroup.get('nodeConfig')?.setValue(nodeConfig);
    });

    this.setSpinnerBlur();
  }

  /**
   * 监控 Input 参数的变化, 并初始化 分析模式 和 分析对象
   * @param changes 变化的 Input 参数
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'taskInfo':
          switch (this.taskInfo.analysisTarget) {
            case 'Profile System':
              this.analysisMode = AnalysisTarget.PROFILE_SYSTEM;
              break;
            case 'Launch Application':
              this.analysisMode = AnalysisTarget.LAUNCH_APPLICATION;
              break;
            case 'Attach to Process':
              this.analysisMode = AnalysisTarget.ATTACH_TO_PROCESS;
              break;
            default:
          }
          break;
        default:
      }
    }
  }

  /**
   * 获取工程下节点信息
   */
  getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // 存储工程下的节点信息
        this.nodeList = res.data.nodeList;
      }
      // 获取工程
      this.sceneName = res.data.sceneName;
      if (this.sceneName === 'HPC'){
        this.formOption.selectNodeList.display = true;
        this.formGroup.get('nodeList').enable();
      } else {
        this.formOption.selectNodeList.display = false;
        this.formGroup.get('nodeList').disable();
      }
    });
  }

  /**
   * 事件处理：关闭操作页面
   */
  public onClose() {
    this.cancelModify.emit();
  }

  /**
   * 事件处理：确认修改
   */
  public async onModifyClick() {
    const params = this.modifyService.getRawDataByControls(this.formGroup, this.taskInfo, this.analysisMode);
    this.http.put('/schedule-tasks/' + this.scheduleTaskId + '/', params).then((res: any) => {
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      this.confirmModify.emit('on');
    });
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.intervalBlur = {
      control: this.formGroup.controls.statistical,
      min: 1,
      max: 5,
    };
    this.collectFileBlur = {
      control: this.formGroup.controls.size,
      min: 10,
      max: 500,
    };
    this.samplingDurationBlur = {
      control: this.formGroup.controls.duration,
      min: 2,
      max: 300,
    };
  }
}
