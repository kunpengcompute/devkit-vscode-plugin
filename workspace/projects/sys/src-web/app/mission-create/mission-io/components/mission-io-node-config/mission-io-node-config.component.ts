import { Component, Input, Output, EventEmitter, forwardRef, OnInit, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, FormControl } from '@angular/forms';
import { TiTableColumns, TiTableRowData, TiTableSrcData, } from '@cloud/tiny3';
import { NodeConfigItem } from '../../io-domain';
import { PidProcess, AppAndParams } from '../../../domain';
import { AnalysisTarget } from 'projects/sys/src-web/app/domain';
import { I18nService } from '../../../../service/i18n.service';
import { MissionPublicComponent } from '../../../mission-components/mission-node-params/mission-public/mission-public.component';
interface RunUserInfo {
  runUser: boolean;
  user: string;
  password: string;
}

@Component({
  selector: 'app-mission-io-node-config',
  templateUrl: './mission-io-node-config.component.html',
  styleUrls: ['./mission-io-node-config.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MissionIoNodeConfigComponent),
      multi: true
    }
  ],
})
export class MissionIoNodeConfigComponent implements ControlValueAccessor, OnInit {
  @ViewChild('missionPublic', { static: true }) missionPublicCpt: MissionPublicComponent;
  @Input() isModifySchedule: boolean;
  @Input() runUserData: any;
  /** 入参：label 的宽度 */
  @Input() labelWidth: string;
  /** 入参：分析模式 */
  @Input() analysisMode: AnalysisTarget;
  /** 入参：节点数据 */

  @Input()
  set nodeConfig(val: NodeConfigItem[]) {
    if (val == null) { return; }
    this.nodeConfigCopy = JSON.parse(JSON.stringify(val));
    this.srcData.data = JSON.parse(JSON.stringify(val));
  }
  get nodeConfig() {
    return this.nodeConfigCopy;
  }

  /** emit: 配置完成通知 */
  @Output() confrim = new EventEmitter<NodeConfigItem[]>();

  // 节点数据
  private nodeConfigCopy: NodeConfigItem[];
  /** 表格数据 */
  public displayed: Array<TiTableRowData> = [];
  /** 表格数据源 */
  public srcData: TiTableSrcData = {
    data: [], // 源数据
    state: { searched: false, sorted: false, paginated: false, },
  };
  /** 列数据 */
  public columns: TiTableColumns;

  // 国际化
  public i18n: any;

  /** 节点参数的表单 */
  public formGroup = new FormGroup({
    pidProcess: new FormControl(),
    appAndParams: new FormControl(),
    runUserInfo: new FormControl()
  });

  /** 当前节点的索引 */
  private currentNodeIndex: number;

  /** 当前节点 */
  public currentNode: NodeConfigItem;

  /** 控件的显隐配置 */
  public options: { [key: string]: { display: boolean } };

  /** 按钮操作的使能标志 */
  public opreationEnable = true;

  /**
   * 这里是做一个空函数体，真正使用的方法在 registerOnChange 中
   * 由框架注册，然后我们使用它把变化发回表单
   */
  private propagateChange = (_: any) => { };

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.columns = [
      { title: this.i18n.nodeConfig.nickName, },
      { title: this.i18n.nodeConfig.node, },
      { title: this.i18n.nodeConfig.status, },
      { title: this.i18n.nodeConfig.action, },
    ];
  }

  ngOnInit() {
    /** 控件的显隐控制 */
    this.options = {
      pidProcess: {
        display: this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS,
      },
      appAndParams: {
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
      },
      runUserInfo: {
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION
      }
    };

    /** 控件状态的监控 和 操作元素的状态控制 */
    switch (this.analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
        this.formGroup.get('appAndParams').disable();
        this.formGroup.get('runUserInfo').disable();
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        this.formGroup.get('pidProcess').disable();
        if (this.isModifySchedule){
          this.formGroup.get('runUserInfo').disable();
        }
        break;
      default:
    }
  }

  /**
   * 被写入
   * @param obj 写入的控件值
   */
  public writeValue(val: NodeConfigItem[]) {
    if (val != null) {
      this.nodeConfig = JSON.parse(JSON.stringify(val));
      this.srcData.data = this.nodeConfig;
    }
  }

  /**
   * 当表单控件值改变时，函数 fn 会被调用
   * 这也是我们把变化 emit 回表单的机制
   * @param fn 通知回调
   */
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * @description
   * Registers a callback function is called by the forms API on initialization
   * to update the form model on blur.
   * @param fn The callback function to register
   */
  registerOnTouched(fn: any): void { }

  /**
   * 确定配置
   */
  public onConfirm() {
    // 将数据写入父组件的控件
    const { pidProcess, appAndParams, runUserInfo } = this.formGroup.value;
    switch (this.analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
        {
          const taskParam = this.nodeConfig[this.currentNodeIndex].taskParam;
          taskParam.targetPid = (pidProcess as PidProcess).pid;
          taskParam.process_name = (pidProcess as PidProcess).process;
        }
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        {
          const taskParam = this.nodeConfig[this.currentNodeIndex].taskParam;
          taskParam.appDir = (appAndParams as AppAndParams).app;
          taskParam['app-parameters'] = (appAndParams as AppAndParams).params;
          this.nodeConfig[this.currentNodeIndex].runUserData = {
            runUser: (runUserInfo as RunUserInfo).runUser,
            user: (runUserInfo as RunUserInfo).user,
            password: (runUserInfo as RunUserInfo).password
          };
        }
        break;
      default:
    }
    this.propagateChange(this.nodeConfig);

    // 关闭侧弹窗
    this.missionPublicCpt.close();

    // 设置配置标志
    this.currentNode.taskParam.status = true;
  }

  /**
   *  取消点击
   */
  public onClose() {
    if (!this.formGroup.valid && !this.isModifySchedule) {
        const { runUserInfo } = this.formGroup.value;
        if (runUserInfo.runUser) {
          // 禁用该控件
          this.formGroup.controls.runUserInfo.disable({onlySelf: true, emitEvent: false});
        }
    }
    this.missionPublicCpt.close();
  }

  /**
   * 主要职责有：
   * - 给属性 currentNodeIndex 赋有效值；
   * - 给属性 currentNode 赋有效值；
   * - 将被点击的节点的数据赋值给其对应的表单控件；
   * - 打开节点配置的页面；
   * @param index 被点击的节点的数据的索引
   */
  public onConfigParams(index: any) {
    // 给属性 currentNodeIndex 赋有效值
    this.currentNodeIndex = index;

    // 给属性 currentNode 赋有效值
    this.currentNode = this.nodeConfig[index];

    // 将被点击的节点的数据赋值给其对应的表单控件
    const taskParam = this.nodeConfig[index].taskParam;
    let runUserInfo: RunUserInfo;
    if (this.nodeConfig[index]?.runUserData?.runUser || this.runUserData?.runUser) {
      runUserInfo = {
        runUser: this.nodeConfig[index]?.runUserData?.runUser || this.runUserData.runUser,
        user: this.nodeConfig[index]?.runUserData?.user || this.runUserData.user,
        password: this.nodeConfig[index]?.runUserData?.password || this.runUserData.password,
      };
    } else {
      runUserInfo = {
        runUser: false,
        user: '',
        password: '',
      };
    }

    const pidProcess: PidProcess = {
      pid: taskParam.targetPid,
      process: taskParam.process_name,
    };
    const appAndParams: AppAndParams = {
      app: taskParam.appDir,
      params: taskParam['app-parameters'],
    };
    switch (this.analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
        this.formGroup.controls.pidProcess.setValue(pidProcess);
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        this.formGroup.controls.appAndParams.setValue(appAndParams);
        this.formGroup.controls.runUserInfo.setValue(runUserInfo);
        if (this.formGroup.controls.runUserInfo.status === 'DISABLED'){
          this.formGroup.controls.runUserInfo.enable({onlySelf: true, emitEvent: true});
        }
        break;
      default:
    }

    // 打开节点配置的页面
    this.missionPublicCpt.open();
  }
}
