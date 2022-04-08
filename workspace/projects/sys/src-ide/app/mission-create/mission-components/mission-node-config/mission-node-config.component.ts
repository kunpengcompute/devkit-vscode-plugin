import {
  Component, OnInit, Input, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges, NgZone, ChangeDetectorRef
} from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import {
  TiTableColumns, TiTableRowData, TiTableSrcData, TiModalService, TiModalRef
} from '@cloud/tiny3';
import { TaskService } from '../../../service/taskService/nodeList.service';
import { __core_private_testing_placeholder__ } from '@angular/core/testing';
import { VscodeService, COLOR_THEME, currentTheme } from '../../../service/vscode.service';
import { FormControl } from '@angular/forms';
import { RunUserDataObj, LaunchRunUser } from './../../mission-domain/index';
import { CustomValidatorsService } from 'sys/src-ide/app/service';

interface NodeItem {
  label: string;
  value: string | boolean;
  required: boolean;
}
interface NodeConfig {
  [key: string]: NodeItem;
}

@Component({
  selector: 'app-mission-node-config',
  templateUrl: './mission-node-config.component.html',
  styleUrls: ['./mission-node-config.component.scss']
})
export class MissionNodeConfigComponent implements OnInit, OnChanges {
  constructor(
      public i18nService: I18nService,
      public taskServices: TaskService,
      public vscodeService: VscodeService,
      private tiModal: TiModalService,
      private zone: NgZone,
      public changeDetectorRef: ChangeDetectorRef,
      public customValidatorsService: CustomValidatorsService
  ) {
      this.i18n = this.i18nService.I18n();
  }
  @ViewChild('mission_config', { static: false }) missionConfig: any;
  @ViewChild('modifyNodeComponent', { static: false }) modifyNodeComponent: any;
  @Input() labelWidth: string;
  @Input() formData: any;
  @Input() isAbled: boolean;
  @Input() taskType: string;
  @Input() projectId: number;
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;
  @Input() runUserData: {
      runUser: boolean,
      user: string,
      password: string
  };
  @Input() modeAppPathAllow: string;
  @Input() isModifySchedule: boolean;
  @Input() nodeList: any[];

  @Output() onsControlNode = new EventEmitter<any>();
  @Output() onsOpentNode = new EventEmitter<any>();
  @Output() openRunUserConfig = new EventEmitter<any>();
  @Output() selectNodeDisable = new EventEmitter<boolean>();
  // 控制switch
  public switchStatus = false;
  // 节点列表
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public columns: Array<TiTableColumns> = [];
  // 国际化
  public i18n: any;
  // 控制开关
  public controlOpen: any;
  // 接收参数值，发布订阅
  public parmasObj: any;

  // 获取节点ip列表
  public nodeDatas = new Array();
  public isModifyNode = false;
  public CPath: any;
  public nodeStatus = false;
  public number: number;
  // 当只有一个节点的时候页面元素不展示
  public isShow: any = false;
  public analysisType: string;
  public cplusWindowData: NodeItem[];
  public disabled: boolean;
  // 获取主题颜色
  public currTheme = COLOR_THEME.Dark;
  public ColorTheme = {
      Dark: COLOR_THEME.Dark,
      Light: COLOR_THEME.Light
  };
  public modifyNodeModal: TiModalRef;
  public nodeConfig: NodeConfig = {};
  public runUserValid = true;
  public runUserMsg: string;
  // openMp校验失败提示信息
  public openMpValid = true;
  public openMpErrorMsg: string;
  public runPasswordValid = true;
  public passwordInputType = 'password';

  public hpcProcessPidParam: any;
  public inputWidth = '400px';
  public appPathValid = false;   // 应用路径是否校验成功 true成功
  public appPathWarnMsg: string;  // 校验之后的信息
  /** 应用模式下，应用路径有效性判断的方法。判断时机：内容输入时。目的为： 控制判断时机，方便调用 */
  public appPathVildChangeAction = () => { };

  /**
   * 初始化
   */
  async ngOnInit() {
      this.openMpErrorMsg = this.i18n.hpc.mission_create.openMpParams_validate;
      // vscode颜色主题适配
      this.currTheme = currentTheme();
      this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
          this.currTheme = msg.colorTheme;
      });

      this.CPath = new FormControl('');
      this.columns = [
          {
              title: '',
          },
          {
              title: this.i18n.nodeConfig.nickName,
          },
          {
              title: this.i18n.nodeConfig.node,
          },
          {
              title: this.i18n.nodeConfig.status,
          },
          {
              title: this.i18n.nodeConfig.action,
          },
      ];
      this.srcData = {
          // 表格源数据，开发者对表格的数据设置请在这里进行
          data: [], // 源数据
          // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
          // 已经做过的，tiny就不再做了
          // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
          // 本示例中，开发者设置了分页特性，且源数据未进行分页处理，因此tiny会对数据进行分页处理
          state: {
              searched: false, // 源数据未进行搜索处理
              sorted: false, // 源数据未进行排序处理
              paginated: false, // 源数据未进行分页处理
          },
      };
      this.isShow = await this.checkNodeConfigCompoent();
  }

  /**
   * 检测变化
   * @param changes 改变
   */
  ngOnChanges(changes: SimpleChanges) {
      for (const propName of Object.keys(changes)) {
          switch (propName) {
              case 'nodeConfigedData':
                  const data = changes.nodeConfigedData.currentValue;
                  if (data && Object.keys(data).length !== 0) {
                      const nickName = data.nickName;
                      this.srcData.data.forEach((item) => {
                          if (item.nickName === nickName) {
                              item.params = Object.assign({}, item.params, data.formData);
                              item.params.status = true;
                              item.runUser = Object.assign({}, item.runUser, data.runUser);
                          }
                      });
                  }

                  break;
              default: break;
          }
      }
  }
  /**
   * 检测页面节点数量，判断是否显示节点配置模块
   */
  public checkNodeConfigCompoent() {
      return new Promise((resolve) => {
          this.vscodeService.get({ url: `/projects/${this.projectId}/info/` }, (res: any) => {
              if (res.data.nodeList && res.data.nodeList.length > 1) {
                  resolve(true);
              } else {
                  resolve(false);
              }
          });
      });
  }
  /**
   * 控制开启开关
   * @param event event事件
   */
  public onSwitchChange(event: any) {
      this.selectNodeDisable.emit(event);
      if (event) {
          this.onsControlNode.emit(this.taskType);
          this.getProjectNodes();
      } else {
          this.onsControlNode.emit('');
          this.clear();
      }
      this.switchStatus = event;
      this.updateWebViewPage();
  }
  /**
   * getProjectNodes  获取节点信息
   */
  public getProjectNodes() {
      this.vscodeService.get({ url: `/projects/${this.projectId}/info/` }, (res: any) => {
            let nodeList = res.data.nodeList;
            if (this.nodeList) {
                nodeList = this.nodeList;
            }
            this.srcData.data = nodeList.map((item:
                { nickName: any; nodeIp: any; nodeStatus: any; nodeId: any; id: any; }) => {
                const nickName = item.nickName;
                const node = item.nodeIp;
                const nodeState = item.nodeStatus;
                const nodeId = item.nodeId;
                const id = item.id;
                const params = {
                    status: false,
                };
                return {
                    nickName,
                    node,
                    nodeState,
                    params,
                    nodeId,
                    id,
                };
            });
            this.updateWebViewPage();
      });
  }
  /**
   * 打开配置参数二级框
   * @param i 索引
   */
  public onConfigParams(i: number) {
      this.appPathValid = true;
      this.runUserValid = true;
      this.runPasswordValid = true;
      this.appPathWarnMsg = '';
      if (this.nodeConfigedData) {
          this.CPath.value = this.nodeConfigedData[i].taskParam.sourceLocation || this.displayed[i].cpath;
      } else {
          this.CPath.value = this.displayed[i].cpath;
      }
      this.number = i;
      if (!('cpath' in this.displayed[i])) {
          this.displayed[i].cpath = '';
      }
      const target = this.formData
          ? this.formData['analysis-target'] || this.formData.analysisTarget
          : this.displayed[i].params['analysis-target'] || this.displayed[i].params.analysisTarget;
      this.analysisType =
          target?.indexOf('Launch') !== -1
              ? 'launch'
              : target?.indexOf('Attach') !== -1
                  ? 'attach'
                  : 'profile';

      const beginObj: NodeConfig = {
          nodeName: {
              label: this.i18n.nodeConfig.nodeName,
              value: this.displayed[i].nickName,
              required: false
          },
          nodeIp:
          {
              label: this.i18n.nodeConfig.node,
              value: this.displayed[i].node,
              required: false
          },
      };
      if (this.taskType === 'microarchitecture') {
          const endObj: NodeConfig = {
              sourceLocation: {
                  label: this.i18n.common_term_task_crate_c_path,
                  value: this.srcData.data[i].sourceLocation || this.formData.sourceLocation,
                  required: false
              }
          };
          let interObj: NodeConfig = {};
          if (this.analysisType === 'profile') {
              interObj = {
                  cpu_kernel: {
                      label: this.i18n.micarch.cpu_kernel,
                      value: this.srcData.data[i].cpuMask || this.formData.cpuMask,
                      required: false
                  }
              };
          } else if (this.analysisType === 'launch') {
              interObj = {
                  appDir: {
                      label: this.i18n.common_term_task_crate_app_path,
                      value: this.srcData.data[i].appDir || this.formData.appDir,
                      required: true
                  },
                  appParameters: {
                      label: this.i18n.nodeConfig.parameters,
                      value: this.srcData.data[i].appParameters || this.formData.appParameters,
                      required: false
                  },
                  runUserStates: {
                      label: this.i18n.common_term_task_crate_app_runUser,
                      value: this.runUserData.runUser,
                      required: false
                  },
                  user_name: {
                      label: this.i18n.common_term_task_crate_app_user,
                      value: this.runUserData.user,
                      required: this.runUserData.runUser
                  },
                  password: {
                      label: this.i18n.common_term_task_crate_app_passWord,
                      value: this.runUserData.password,
                      required: this.runUserData.runUser
                  }
              };
          } else if (this.analysisType === 'attach') {
              interObj = {
                  process_name: {
                      label: this.i18n.common_term_task_crate_processName,
                      value: decodeURIComponent(this.srcData.data[i].process_name || this.formData.process_name),
                      required: false
                  },
                  pid: {
                      label: this.i18n.common_term_task_crate_pid,
                      value: this.srcData.data[i].targetPid || this.formData.targetPid,
                      required: false
                  },
              };
          }
          this.nodeConfig = { ...beginObj, ...interObj, ...endObj };
          this.isDisabled();
      } else if (this.taskType === 'C/C++ Program') {
          const endObj: NodeConfig = {
              assemblyLocation: {
                  label: this.i18n.common_term_task_crate_bs_path,
                  value: this.srcData.data[i].assemblyLocation || this.formData.assemblyLocation,
                  required: false
              },
              c_path: {
                  label: this.i18n.nodeConfig.c_path,
                  value: this.srcData.data[i].sourceLocation || this.formData.sourceLocation,
                  required: false
              },
          };
          let interObj: NodeConfig = {};
          if (this.analysisType === 'profile') {
              interObj = {
                  cpu_kernel: {
                      label: this.i18n.micarch.cpu_kernel,
                      value: this.srcData.data[i]['cpu-mask'] || this.formData['cpu-mask'],
                      required: false
                  },
              };
          } else if (this.analysisType === 'launch') {
              interObj = {
                  appDir: {
                      label: this.i18n.common_term_task_crate_app_path,
                      value: this.srcData.data[i]['app-dir'] || this.formData['app-dir'],
                      required: true
                  },
                  appParameters: {
                      label: this.i18n.nodeConfig.parameters,
                      value: this.srcData.data[i]['app-parameters'] || this.formData['app-parameters'],
                      required: false
                  },
                  runUserStates: {
                      label: this.i18n.common_term_task_crate_app_runUser,
                      value: this.runUserData.runUser,
                      required: false
                  },
                  user_name: {
                      label: this.i18n.common_term_task_crate_app_user,
                      value: this.runUserData.user,
                      required: this.runUserData.runUser
                  },
                  password: {
                      label: this.i18n.common_term_task_crate_app_passWord,
                      value: this.runUserData.password,
                      required: this.runUserData.runUser
                  }
              };
          } else if (this.analysisType === 'attach') {
              interObj = {
                  process_name: {
                      label: this.i18n.common_term_task_crate_processName,
                      value: decodeURIComponent(this.srcData.data[i].process_name || this.formData.process_name),
                      required: false
                  },
                  pid: {
                      label: this.i18n.common_term_task_crate_pid,
                      value: this.srcData.data[i]['target-pid'] || this.formData['target-pid'],
                      required: false
                  },
              };
          }
          this.nodeConfig = { ...beginObj, ...interObj, ...endObj };
          this.isDisabled();
      } else if (this.taskType === 'resource_schedule') {
          const endObj: NodeConfig = {
              assemblyLocation: {
                  label: this.i18n.common_term_task_crate_bs_path,
                  value: this.srcData.data[i].assemblyLocation || this.formData.assemblyLocation,
                  required: false
              }
          };
          let interObj: NodeConfig = {};
          if (this.analysisType === 'launch') {
              interObj = {
                  appDir: {
                      label: this.i18n.common_term_task_crate_app_path,
                      value: this.srcData.data[i]['app-dir'] || this.formData['app-dir'],
                      required: true
                  },
                  appParameters: {
                      label: this.i18n.nodeConfig.parameters,
                      value: this.srcData.data[i]['app-parameters'] || this.formData['app-parameters'],
                      required: false
                  },
                  runUserStates: {
                      label: this.i18n.common_term_task_crate_app_runUser,
                      value: this.runUserData.runUser,
                      required: false
                  },
                  user_name: {
                      label: this.i18n.common_term_task_crate_app_user,
                      value: this.runUserData.user,
                      required: this.runUserData.runUser
                  },
                  password: {
                      label: this.i18n.common_term_task_crate_app_passWord,
                      value: this.runUserData.password,
                      required: this.runUserData.runUser
                  }
              };
          } else if (this.analysisType === 'attach') {
              interObj = {
                  process_name: {
                      label: this.i18n.common_term_task_crate_processName,
                      value: this.srcData.data[i]['process-name']
                          ? decodeURIComponent(this.srcData.data[i]['process-name'])
                          : decodeURIComponent(this.formData['process-name']),
                      required: false
                  },
                  pid: {
                      label: this.i18n.common_term_task_crate_pid,
                      value: this.srcData.data[i]['target-pid'] || this.formData['target-pid'],
                      required: false
                  }
              };
          }
          this.nodeConfig = { ...beginObj, ...interObj, ...endObj };
          this.isDisabled();
      } else if (this.taskType === 'system_lock') {
          const endObj: NodeConfig = {
              assemblyLocation: {
                  label: this.i18n.common_term_task_crate_bs_path,
                  value: this.srcData.data[i].assemblyLocation || this.formData.assemblyLocation,
                  required: false
              },
              sourceLocation: {
                  label: this.i18n.nodeConfig.c_path,
                  value: this.srcData.data[i].sourceLocation || this.formData.sourceLocation,
                  required: false
              }
          };
          let interObj: NodeConfig = {};
          if (this.analysisType === 'launch') {
              interObj = {
                  appDir: {
                      label: this.i18n.common_term_task_crate_app_path,
                      value: this.srcData.data[i]['app-dir'] || this.formData['app-dir'],
                      required: true
                  },
                  appParameters: {
                      label: this.i18n.nodeConfig.parameters,
                      value: this.srcData.data[i]['app-parameters'] || this.formData['app-parameters'],
                      required: false
                  },
                  runUserStates: {
                      label: this.i18n.common_term_task_crate_app_runUser,
                      value: this.runUserData.runUser,
                      required: false
                  },
                  user_name: {
                      label: this.i18n.common_term_task_crate_app_user,
                      value: this.runUserData.user,
                      required: this.runUserData.runUser
                  },
                  password: {
                      label: this.i18n.common_term_task_crate_app_passWord,
                      value: this.runUserData.password,
                      required: this.runUserData.runUser
                  }
              };
          } else if (this.analysisType === 'attach') {
              interObj = {
                  process_name: {
                      label: this.i18n.common_term_task_crate_processName,
                      value: decodeURIComponent(this.srcData.data[i].process_name || this.formData.process_name),
                      required: false
                  },
                  pid: {
                      label: this.i18n.common_term_task_crate_pid,
                      value: this.srcData.data[i]['target-pid'] || this.formData['target-pid'],
                      required: false
                  },
              };
          }
          this.nodeConfig = { ...beginObj, ...interObj, ...endObj };
          this.isDisabled();
      } else if (this.taskType === 'ioperformance') {
          let interObj: NodeConfig = {};
          if (this.analysisType === 'launch') {
              interObj = {
                  appDir: {
                      label: this.i18n.common_term_task_crate_app_path,
                      value: this.srcData.data[i].appDir || this.formData.appDir,
                      required: true
                  },
                  appParameters: {
                      label: this.i18n.nodeConfig.parameters,
                      value: this.srcData.data[i]['app-parameters'] || this.formData['app-parameters'],
                      required: false
                  },
                  runUserStates: {
                      label: this.i18n.common_term_task_crate_app_runUser,
                      value: this.runUserData.runUser,
                      required: false
                  },
                  user_name: {
                      label: this.i18n.common_term_task_crate_app_user,
                      value: this.runUserData.user,
                      required: this.runUserData.runUser
                  },
                  password: {
                      label: this.i18n.common_term_task_crate_app_passWord,
                      value: this.runUserData.password,
                      required: this.runUserData.runUser
                  }
              };
          } else if (this.analysisType === 'attach') {
              interObj = {
                  process_name: {
                      label: this.i18n.common_term_task_crate_processName,
                      value: decodeURIComponent(this.srcData.data[i].process_name || this.formData.process_name),
                      required: false
                  },
                  pid: {
                      label: this.i18n.common_term_task_crate_pid,
                      value: this.srcData.data[i].targetPid || this.formData.targetPid,
                      required: false
                  },
              };
          }
          this.nodeConfig = { ...beginObj, ...interObj };
          this.isDisabled();
      } else if (this.taskType === 'process-thread-analysis') {
          let interObj: NodeConfig = {};
          if (this.analysisType === 'launch') {
              interObj = {
                  appDir: {
                      label: this.i18n.common_term_task_crate_app_path,
                      value: this.srcData.data[i]['app-dir'] || this.formData['app-dir'],
                      required: true
                  },
                  appParameters: {
                      label: this.i18n.nodeConfig.parameters,
                      value: this.srcData.data[i]['app-parameters'] || this.formData['app-parameters'],
                      required: false
                  },
                  runUserStates: {
                      label: this.i18n.common_term_task_crate_app_runUser,
                      value: this.runUserData.runUser,
                      required: false
                  },
                  user_name: {
                      label: this.i18n.common_term_task_crate_app_user,
                      value: this.runUserData.user,
                      required: this.runUserData.runUser
                  },
                  password: {
                      label: this.i18n.common_term_task_crate_app_passWord,
                      value: this.runUserData.password,
                      required: this.runUserData.runUser
                  }
              };
          } else if (this.analysisType === 'attach') {
              interObj = {
                  process_name: {
                      label: this.i18n.common_term_task_crate_processName,
                      value: decodeURIComponent(this.srcData.data[i].process_name || this.formData.process_name),
                      required: false
                  },
                  pid: {
                      label: this.i18n.common_term_task_crate_pid,
                      value: this.srcData.data[i].targetPid || this.formData.pid,
                      required: false
                  }
              };
          }
          this.nodeConfig = { ...beginObj, ...interObj };
          this.isDisabled();
      } else if (this.taskType === 'hpcOpenMP'){
          let interObj: NodeConfig = {};
          if (this.analysisType === 'launch') {
              // 初始化不显示launcher
              this.runUserData.user = this.runUserData.user === 'launcher' ? '' : this.runUserData.user;
              interObj = {
                  appDir: {
                      label: this.i18n.common_term_task_crate_app_path,
                      value: this.srcData.data[i]['app-dir'] || this.formData['app-dir'],
                      required: true
                  },
                  appParameters: {
                      label: this.i18n.nodeConfig.parameters,
                      value: this.srcData.data[i]['app-parameters'] || this.formData['app-parameters'],
                      required: false
                  },
                  runUserStates: {
                      label: this.i18n.common_term_task_crate_app_runUser,
                      value: this.srcData.data[i]?.runUserStates ?? this.runUserData.runUser,
                      required: false
                  },
                  user_name: {
                      label: this.i18n.common_term_task_crate_app_user,
                      value:   this.srcData.data[i]?.user_name ?? this.runUserData.user,
                      required: this.runUserData.runUser
                  },
                  password: {
                      label: this.i18n.common_term_task_crate_app_passWord,
                      value:  this.srcData.data[i]?.password ?? this.runUserData.password,
                      required: this.runUserData.runUser
                  },
                  openMpParams: {
                    label: this.i18n.hpc.mission_create.openMpParams,
                    value: this.srcData.data[i]?.open_mp_param || this.formData.open_mp_param,
                    required: false,
                  }
              };
          } else if (this.analysisType === 'attach') {
              interObj = {
                  process_name: {
                      label: this.i18n.common_term_task_crate_processName,
                      value: decodeURIComponent(this.srcData.data[i]?.process_name ?? this.formData?.process_name),
                      required: false
                  },
                  pid: {
                      label: this.i18n.common_term_task_crate_pid,
                      value: this.srcData.data[i]?.targetPid ?? this.formData?.targetPid,
                      required: false
                  }
              };
              this.hpcProcessPidParam = {
                targetPid: this.srcData.data[i]?.targetPid ?? this.formData?.targetPid,
                processName: decodeURIComponent(this.srcData.data[i]?.process_name ?? this.formData?.process_name)
              };

          }
          this.nodeConfig = { ...beginObj, ...interObj };
          this.isDisabled();
      }
      this.modifyNodeModal = this.tiModal.open(this.modifyNodeComponent, {
          id: 'modifyNode',
          modalClass: 'modal-modifyNode',
          draggable: false,
      });
  }
  /**
   * 是否禁用确认按钮
   * @param data 表单数据
   */
  public isDisabled() {
      this.disabled = false;
      if (!this.openMpValid) { this.disabled = true; }
      Object.keys(this.nodeConfig).forEach(item => {
          if (this.nodeConfig[item].required && this.nodeConfig[item].value === '') {
              this.disabled = true;
              return;
          }
      });
      if (this.taskType === 'hpcOpenMP') {
        if (!this.appPathValid || !this.openMpValid) {
          this.disabled = true;
        }
        if (this.analysisType === 'launch'  && this.nodeConfig.runUserStates?.value) {
          if (!this.runUserValid || !this.runPasswordValid) {
            this.disabled = true;
          }
        }
      }
  }

  /**
   * 必填项失去焦点时,判断所有必填项是否存在空值,存在则禁用确认按钮
   */
  public requireBlur() {
    this.disabled = !this.appPathChange();
    this.isDisabled();
  }

  /**
   * 应用路径校验
   */
  public appPathChange(): boolean {
      const path = this.nodeConfig.appDir.value ? this.nodeConfig.appDir.value.toString().trim() : ''; // 去掉字符串的头尾空格
      // 验证一：为空判断
      if (!path) {
          this.appPathWarnMsg = this.i18n.mission_create.modeAppPath;
          this.appPathValid = false;
          return false;
      }
      // 判断二：正则验证
      // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
      if (this.customValidatorsService.pathMatch(path)) {
          this.appPathWarnMsg = this.i18n.mission_create.modeAppWarn;
          this.appPathValid = false;
          return false;
      }

      // 验证四：是否为系统配置指定路径下应用判断
      let isIncluded = false;
      const allowPathList: string[] = this.modeAppPathAllow?.split(';') || [];
      for (const allowPath of allowPathList) {
          if (path.includes(allowPath) && path.indexOf(allowPath) === 0) {
              isIncluded = true;
          }
      }
      if (!isIncluded) {
          this.appPathWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string).replace(
              '${path}', this.modeAppPathAllow
          );
          this.appPathValid = false;
          return false;
      }
      this.nodeConfig.appDir.value = path;
      this.appPathValid = true;
      this.appPathWarnMsg = '';
      return true;
  }

  /**
   * 列表校验
   */

  public validateNodeList() {
      this.srcData.data.map((item) => {
          if (item.status === false) {
              this.nodeStatus = false;
              return;
          }
      });
      this.nodeStatus = true;
  }
  /**
   * 状态小圆点
   * @param status booleam
   */
  public statusFormat(status: boolean): string {
      let statusClass = '';
      switch (status) {
          case true:
              statusClass = 'success-icon';
              break;
          default:
              statusClass = 'reserve-icon';
              break;
      }
      return statusClass;
  }
  /**
   * clear
   */
  public clear() {
      this.switchStatus = false;
      this.formData = '';
      this.srcData.data = [];
      this.onsControlNode.emit('');
  }
  /**
   * 获取多节点配置信息
   */
  public getNodesConfigParams({ formData }: {
      formData?: any  // 表单数据
  }): object {
      const nodeConfig: Array<{ nodeId: string, nickName: string, task_param: any }> = [];
      const runUserData: LaunchRunUser = {};
      for (const item of this.srcData.data) {
          const itemTemp: any = {};
          Object.keys(item).forEach(key => {
              if (key !== 'params') {
                  itemTemp[key] = item[key];
              }
          });
          runUserData[item.nickName] = {
              runUser: item.runUserStates || false,
              user_name: item.runUserStates ? item.user_name : '',
              password: item.runUserStates ? item.password : ''
          };
          nodeConfig.push({
              nodeId: item.id,
              nickName: item.nickName,
              task_param: { ...(formData || this.formData), ...itemTemp, ...item.params }
          });
      }
      return { nodeConfig, runUserData };
  }
  /**
   * importTemp
   * @param e event事件
   */
    public importTemp(e: { nodeName: any; nodeNickName: any; nodeId: any; taskParam: any; task_param: any; }[]) {
        this.switchStatus = true;
        this.onsControlNode.emit(this.taskType);
        this.selectNodeDisable.emit(this.switchStatus);
        if (this.nodeList?.length) {
            this.nodeTableDataDealwith(this.nodeList, e);
        } else {
            const url = `/projects/${this.projectId}/info/`;
            this.vscodeService.get({ url }, (res: any) => {
                this.nodeTableDataDealwith(res.data.nodeList, e);
            });
        }
    }

    /**
     * 导入数据-根据节点数据获取表格数据
     * @param nodeList 节点数据
     * @param e 任务数据
     */
    private nodeTableDataDealwith(nodeList: Array<any>, e: any) {
        this.srcData.data = e.map((items: any, index: any) => {
            let nodeState = '';
            let nodeId = '';
            let nickName = '';
            let node = '';
            let params = {};
            nodeList.forEach((item: any) => {
                if (item.id === items.nodeId) {
                    nodeState = item.nodeStatus;
                    nodeId = item.nodeId;
                    nickName = item.nickName;
                    node = item.node || item.nodeIp;
                    const taskParam = items.taskParam || items.task_param;
                    params = { ...this.formData, ...taskParam, samplingSpace: this.formData?.samplingSpace };
                }
            });
            return {
                nickName,
                node,
                nodeState,
                params,
                nodeId,
                id: items.nodeId,
            };
        });
        this.updateWebViewPage();
    }

  /**
   * 指定节点参数模板  确认
   */
  public confirm(context: { close: () => void; }) {
      if (this.taskType === 'C/C++ Program') {
          this.srcData.data[this.number].assemblyLocation = this.nodeConfig.assemblyLocation.value;
          this.srcData.data[this.number].sourceLocation = this.nodeConfig.c_path.value;
          this.srcData.data[this.number].params.assemblyLocation = this.nodeConfig.assemblyLocation.value;
          this.srcData.data[this.number].params.sourceLocation = this.nodeConfig.c_path.value;
          if (this.analysisType === 'profile') {
              this.srcData.data[this.number]['cpu-mask'] = this.nodeConfig.cpu_kernel.value;
              this.srcData.data[this.number].params['cpu-mask'] = this.nodeConfig.cpu_kernel.value;
          } else if (this.analysisType === 'launch') {
              this.srcData.data[this.number]['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number]['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].runUserStates = this.nodeConfig.runUserStates.value;
              this.srcData.data[this.number].user_name = this.nodeConfig.user_name.value;
              this.srcData.data[this.number].password = this.nodeConfig.password.value;
          } else if (this.analysisType === 'attach') {
              this.srcData.data[this.number].process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number]['target-pid'] = this.nodeConfig.pid.value;
              this.srcData.data[this.number].params.process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].params['target-pid'] = this.nodeConfig.pid.value;
          }
      } else if (this.taskType === 'resource_schedule') {
          this.srcData.data[this.number].assemblyLocation = this.nodeConfig.assemblyLocation.value;
          this.srcData.data[this.number].params.assemblyLocation = this.nodeConfig.assemblyLocation.value;
          if (this.analysisType === 'launch') {
              this.srcData.data[this.number]['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number]['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].runUserStates = this.nodeConfig.runUserStates.value;
              this.srcData.data[this.number].user_name = this.nodeConfig.user_name.value;
              this.srcData.data[this.number].password = this.nodeConfig.password.value;
          } else if (this.analysisType === 'attach') {
              this.srcData.data[this.number]['process-name'] =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number]['target-pid'] = this.nodeConfig.pid.value;
              this.srcData.data[this.number].params['process-name'] =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].params['target-pid'] = this.nodeConfig.pid.value;
          }
      } else if (this.taskType === 'microarchitecture') {
          this.srcData.data[this.number].sourceLocation = this.nodeConfig.sourceLocation.value;
          this.srcData.data[this.number].params.sourceLocation = this.nodeConfig.sourceLocation.value;
          if (this.analysisType === 'launch') {
              this.srcData.data[this.number].appDir = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].appParameters = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params.appDir = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params.appParameters = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].runUserStates = this.nodeConfig.runUserStates.value;
              this.srcData.data[this.number].user_name = this.nodeConfig.user_name.value;
              this.srcData.data[this.number].password = this.nodeConfig.password.value;
          } else if (this.analysisType === 'attach') {
              this.srcData.data[this.number].process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].targetPid = this.nodeConfig.pid.value;
              this.srcData.data[this.number].params.process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].params.targetPid = this.nodeConfig.pid.value;
          } else if (this.analysisType === 'profile') {
              this.srcData.data[this.number].cpuMask = this.nodeConfig.cpu_kernel.value;
              this.srcData.data[this.number].params.cpuMask = this.nodeConfig.cpu_kernel.value;
          }
      } else if (this.taskType === 'system_lock') {
          this.srcData.data[this.number].assemblyLocation = this.nodeConfig.assemblyLocation.value;
          this.srcData.data[this.number].sourceLocation = this.nodeConfig.sourceLocation.value;
          this.srcData.data[this.number].params.assemblyLocation = this.nodeConfig.assemblyLocation.value;
          this.srcData.data[this.number].params.sourceLocation = this.nodeConfig.sourceLocation.value;
          if (this.analysisType === 'launch') {
              this.srcData.data[this.number]['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number]['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].runUserStates = this.nodeConfig.runUserStates.value;
              this.srcData.data[this.number].user_name = this.nodeConfig.user_name.value;
              this.srcData.data[this.number].password = this.nodeConfig.password.value;
          } else if (this.analysisType === 'attach') {
              this.srcData.data[this.number].process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number]['target-pid'] = this.nodeConfig.pid.value;
              this.srcData.data[this.number].params.process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].params['target-pid'] = this.nodeConfig.pid.value;
          }
      } else if (this.taskType === 'ioperformance') {
          if (this.analysisType === 'launch') {
              this.srcData.data[this.number].appDir = this.nodeConfig.appDir.value;
              this.srcData.data[this.number]['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params.appDir = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].runUserStates = this.nodeConfig.runUserStates.value;
              this.srcData.data[this.number].user_name = this.nodeConfig.user_name.value;
              this.srcData.data[this.number].password = this.nodeConfig.password.value;
          } else if (this.analysisType === 'attach') {
              this.srcData.data[this.number].process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].targetPid = this.nodeConfig.pid.value;
              this.srcData.data[this.number].params.process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].params.targetPid = this.nodeConfig.pid.value;
          }
      } else if (this.taskType === 'process-thread-analysis') {
          if (this.analysisType === 'launch') {
              this.srcData.data[this.number].appDir = this.nodeConfig.appDir.value;
              this.srcData.data[this.number]['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params.appDir = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].runUserStates = this.nodeConfig.runUserStates.value;
              this.srcData.data[this.number].user_name = this.nodeConfig.user_name.value;
              this.srcData.data[this.number].password = this.nodeConfig.password.value;
          } else if (this.analysisType === 'attach') {
              this.srcData.data[this.number].process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].targetPid = this.nodeConfig.pid.value;
              this.srcData.data[this.number].params.process_name =
                  encodeURIComponent(this.nodeConfig.process_name.value as string);
              this.srcData.data[this.number].params.targetPid = this.nodeConfig.pid.value;
          }
      } else if (this.taskType === 'hpcOpenMP') {
          if (this.analysisType === 'launch') {
              this.srcData.data[this.number]['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number]['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params.appDir = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params['app-parameters'] = this.nodeConfig.appParameters.value;
              this.srcData.data[this.number].params['app-dir'] = this.nodeConfig.appDir.value;
              this.srcData.data[this.number].params.open_mp_param = this.nodeConfig.openMpParams.value;
              this.srcData.data[this.number].runUserStates = this.nodeConfig.runUserStates.value;
              this.srcData.data[this.number].user_name = this.nodeConfig.user_name.value;
              this.srcData.data[this.number].password = this.nodeConfig.password.value;
              this.srcData.data[this.number].open_mp_param = this.nodeConfig.openMpParams.value;
              // HPC 配置指定节点参数时，若打开应用运行用户，则禁用预约和立即启动
              let openUserSwitch = false;
              this.srcData.data.forEach((item: any) => {
                if (item.runUserStates) {
                  openUserSwitch = true;
                }
              });
              this.openRunUserConfig.emit(openUserSwitch);
          } else if (this.analysisType === 'attach') {
              this.srcData.data[this.number].process_name =
                  encodeURIComponent(this.hpcProcessPidParam.processName as string);
              this.srcData.data[this.number].targetPid = this.hpcProcessPidParam.targetPid;
              this.srcData.data[this.number].params.process_name =
                  encodeURIComponent(this.hpcProcessPidParam.processName as string);
              this.srcData.data[this.number].params.targetPid = this.hpcProcessPidParam.targetPid;
          }
      }
      this.displayed[this.number].cpath = this.CPath.value;
      context.close();
      this.displayed[this.number].params.status = true;
  }
  /**
   * openmp校验
   * @param value openMp
   */
  public checkOpenMp(value: any) {
    if (value) {
      const target = value.split('=');
      this.openMpValid = !(target[0].indexOf('OMP') || !target[1]);
    } else {
      this.openMpValid = true;
    }
    this.isDisabled();
  }
  /**
   * 校验
   * @param str string
   */
  public checkUserOrPassWord(e: any, str: string) {
      if (str === 'switch') {
          this.nodeConfig.runUserStates.value = e;
          if (typeof e === 'object' && self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.nodeConfig.runUserStates.value = e.target.value;
          }
          this.nodeConfig.user_name.required = this.nodeConfig.runUserStates.value as boolean;
          this.nodeConfig.password.required = this.nodeConfig.runUserStates.value as boolean;
          this.isDisabled();
          if (!e) {
              this.nodeConfig.user_name.value = '';
              this.nodeConfig.password.value = '';
              this.runPasswordValid = true;
          }
      } else if (str === 'user') {
          this.nodeConfig.user_name.value = e.target.value;
          if (typeof e === 'object' && self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.nodeConfig.user_name.value = e.target.value;
          }
          this.runUserValid = Boolean(this.nodeConfig.user_name.value);
          if (this.nodeConfig.user_name.value === '') {
              this.runUserMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
              this.runUserValid = false;
              this.disabled = true;
              return;
          }
          const reg = new RegExp('^[a-zA-Z._][a-zA-Z0-9._\\-]{0,127}$');
          if (!reg.test(this.nodeConfig.user_name.value as string)) {
              this.runUserMsg = this.i18n.tip_msg.system_setting_input_run_user_msg;
              this.runUserValid = false;
              this.disabled = true;
          } else {
              this.runUserValid = true;
              this.isDisabled();
          }
      } else if (str === 'password') {
          this.nodeConfig.password.value = e.target.value;
          if (typeof e === 'object' && self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.nodeConfig.password.value = e.target.value;
          }
          this.runPasswordValid = Boolean(this.nodeConfig.password.value);
          this.isDisabled();
      }
  }
   /**
    * IntellIj刷新webview页面
    */
    public updateWebViewPage() {
      if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
          this.zone.run(() => {
              this.changeDetectorRef.checkNoChanges();
              this.changeDetectorRef.detectChanges();
          });
      }
  }

  /**
   * hpc-应用attach模式改变之后的校验
   */
  public checkProcessPid(e: any) {
    this.disabled = e === 'VALID' ? false : true;
  }
  /**
   * hpc-应用attach模式参数回传
   * @param data 编辑之后的参数
   */
  public getAppParamChange(data: any) {
    this.hpcProcessPidParam = data;
  }
}
