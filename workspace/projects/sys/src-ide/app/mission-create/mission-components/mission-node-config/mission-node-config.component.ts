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
  // ??????switch
  public switchStatus = false;
  // ????????????
  public displayed: Array<TiTableRowData> = []; // ????????????????????????????????????????????????????????????[]?????????
  public srcData: TiTableSrcData;
  public checkedList: Array<TiTableRowData> = []; // ???????????????
  public columns: Array<TiTableColumns> = [];
  // ?????????
  public i18n: any;
  // ????????????
  public controlOpen: any;
  // ??????????????????????????????
  public parmasObj: any;

  // ????????????ip??????
  public nodeDatas = new Array();
  public isModifyNode = false;
  public CPath: any;
  public nodeStatus = false;
  public number: number;
  // ???????????????????????????????????????????????????
  public isShow: any = false;
  public analysisType: string;
  public cplusWindowData: NodeItem[];
  public disabled: boolean;
  // ??????????????????
  public currTheme = COLOR_THEME.Dark;
  public ColorTheme = {
      Dark: COLOR_THEME.Dark,
      Light: COLOR_THEME.Light
  };
  public modifyNodeModal: TiModalRef;
  public nodeConfig: NodeConfig = {};
  public runUserValid = true;
  public runUserMsg: string;
  // openMp????????????????????????
  public openMpValid = true;
  public openMpErrorMsg: string;
  public runPasswordValid = true;
  public passwordInputType = 'password';

  public hpcProcessPidParam: any;
  public inputWidth = '400px';
  public appPathValid = false;   // ?????????????????????????????? true??????
  public appPathWarnMsg: string;  // ?????????????????????
  /** ?????????????????????????????????????????????????????????????????????????????????????????????????????? ????????????????????????????????? */
  public appPathVildChangeAction = () => { };

  /**
   * ?????????
   */
  async ngOnInit() {
      this.openMpErrorMsg = this.i18n.hpc.mission_create.openMpParams_validate;
      // vscode??????????????????
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
          // ?????????????????????????????????????????????????????????????????????
          data: [], // ?????????
          // ???????????????????????????????????????????????????????????????????????????????????????
          // ??????????????????tiny???????????????
          // ???????????????tiny?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????displayedData????????????
          // ??????????????????????????????????????????????????????????????????????????????????????????tiny??????????????????????????????
          state: {
              searched: false, // ??????????????????????????????
              sorted: false, // ??????????????????????????????
              paginated: false, // ??????????????????????????????
          },
      };
      this.isShow = await this.checkNodeConfigCompoent();
  }

  /**
   * ????????????
   * @param changes ??????
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
   * ???????????????????????????????????????????????????????????????
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
   * ??????????????????
   * @param event event??????
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
   * getProjectNodes  ??????????????????
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
   * ???????????????????????????
   * @param i ??????
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
              // ??????????????????launcher
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
   * ????????????????????????
   * @param data ????????????
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
   * ????????????????????????,???????????????????????????????????????,???????????????????????????
   */
  public requireBlur() {
    this.disabled = !this.appPathChange();
    this.isDisabled();
  }

  /**
   * ??????????????????
   */
  public appPathChange(): boolean {
      const path = this.nodeConfig.appDir.value ? this.nodeConfig.appDir.value.toString().trim() : ''; // ??????????????????????????????
      // ????????????????????????
      if (!path) {
          this.appPathWarnMsg = this.i18n.mission_create.modeAppPath;
          this.appPathValid = false;
          return false;
      }
      // ????????????????????????
      // ?????????????????????1???????????? /; 2??????????????????^ ` | ; & $ > < \ ! ??????????????????; 4???????????? / ??????; 3??????????????????//
      if (this.customValidatorsService.pathMatch(path)) {
          this.appPathWarnMsg = this.i18n.mission_create.modeAppWarn;
          this.appPathValid = false;
          return false;
      }

      // ????????????????????????????????????????????????????????????
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
   * ????????????
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
   * ???????????????
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
   * ???????????????????????????
   */
  public getNodesConfigParams({ formData }: {
      formData?: any  // ????????????
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
   * @param e event??????
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
     * ????????????-????????????????????????????????????
     * @param nodeList ????????????
     * @param e ????????????
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
   * ????????????????????????  ??????
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
              // HPC ??????????????????????????????????????????????????????????????????????????????????????????
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
   * openmp??????
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
   * ??????
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
    * IntellIj??????webview??????
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
   * hpc-??????attach???????????????????????????
   */
  public checkProcessPid(e: any) {
    this.disabled = e === 'VALID' ? false : true;
  }
  /**
   * hpc-??????attach??????????????????
   * @param data ?????????????????????
   */
  public getAppParamChange(data: any) {
    this.hpcProcessPidParam = data;
  }
}
