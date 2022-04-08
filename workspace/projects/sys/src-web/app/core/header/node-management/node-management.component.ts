import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
  FormGroup,
} from '@angular/forms';
import {
  TiModalService,
  TiValidators,
  TiValidationConfig,
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
} from '@cloud/tiny3';

import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { AnsiUpService } from 'projects/sys/src-web/app/service/ansi-up.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import '../../../../string.extensions';
import { CustomValidatorsService } from 'projects/sys/src-web/app/service';
import { QueryNodeInfoService } from 'projects/sys/src-web/app/service/query-node-info.service';
import { InterfaceService } from './service/interface.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { fillPlaceholder } from 'projects/sys/src-web/app/util';
import { NodeListComponent } from '../../../shared/components/node-list/node-list.component';
import { ToolType } from 'projects/domain';
import {
  DispatchInfo,
  StateController,
} from 'sys/src-com/app/node-management/model';
import { BatchOptType } from 'sys/src-com/app/node-management/domain/batch-opt-type.enum';
import { BatchOptEvent } from 'sys/src-com/app/node-management/domain';

interface AgentMaskTip {
  warnText: string;
  displayed: Array<any>;
  srcData: TiTableSrcData;
  columns: Array<TiTableColumns>;
}

@Component({
  selector: 'app-node-management',
  templateUrl: './node-management.component.html',
  styleUrls: ['./node-management.component.scss'],
})
export class NodeManagementComponent implements OnInit {
  @ViewChild('nodeListComponent') nodeListComponent: NodeListComponent;
  @ViewChild('agentMaskTip') agentMaskTip: any;

  public isMaxNodeAllow = true;
  public i18n: any;
  public role = sessionStorage.getItem('role');
  public nodeList: any = [];
  /** 认证方式列表 */
  public authenticationModeList: Array<any> = [];
  public validation: TiValidationConfig = {
    // [tiValidation]='validation' 可以更改提示规则
    type: 'blur',
  };

  // -- 添加节点 --
  @ViewChild('addNodeModalComponent') addNodeModalComponent: ElementRef;
  public addNodeModal: any;
  public addNodeForm = {
    formGroup: {} as FormGroup,
  };

  // -- 修改节点内容 --
  @ViewChild('editNodeNameModalComponent')
  editNodeNameModalComponent: ElementRef;
  public editNodeNameModal: any;
  public editNodeNameForm = {
    formGroup: {} as FormGroup,
  };

  // -- 删除节点 --
  @ViewChild('deleteNodeModalComponent') deleteNodeModalComponent: ElementRef;
  public deleteNodeModal: any;
  public deleteNodeTip: any;
  public deleteNodeForm = {
    formGroup: {} as FormGroup,
  };

  // -- 删除节点失败 --
  @ViewChild('deleteNodeFailedModalComponent')
  deleteNodeFailedModalComponent: ElementRef;
  public deleteNodeFailedModal: any;
  public deleteNodeFailedReason: any = {
    columns: [],
    displayed: [],
    srcData: {},
  };

  // -- 查看安装日志 --
  @ViewChild('viewLogsModalComponent') viewLogsModalComponent: ElementRef;
  public viewLogsModal: any;

  // -- 确认指纹/root用户二次确认弹框 --
  @ViewChild('fingerPrintConfirmationModalComponent')
  fingerPrintConfirmationModalComponent: ElementRef;
  public fingerPrintConfirmationModal: any;
  public fingerPrintConfirmationTable: any = {
    columns: [] as Array<TiTableColumns>,
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false, // 源数据未进行分页处理
      },
    } as TiTableSrcData,
  };
  public ifLeftMenuShow = '';
  public title: string;
  public sysTuningConfig = {
    agentWarnDeadline: {
      label: '',
      range: [7, 180],
    },
  };
  public agentWarnDeadlineValue = ''; // Agent服务证书自动告警时间(天)
  public myTip: {
    sameValue: () => void;
    editeOk: () => void;
    editeError: () => void;
  };
  public isLoading: any = false;
  public agentMaskTipData: AgentMaskTip = {
    warnText: '',
    displayed: [],
    srcData: {
      data: [],
      state: { searched: false, sorted: false, paginated: false },
    },
    columns: [],
  };
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;

  private batchController: StateController;

  private url: any;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private tiModal: TiModalService,
    public router: Router,
    public route: ActivatedRoute,
    public location: Location,
    public mytipService: MytipService,
    public ansiUp: AnsiUpService,
    private sanitizer: DomSanitizer,
    public msgService: MessageService,
    public customValidatorsService: CustomValidatorsService,
    private queryNodeInfoService: QueryNodeInfoService,
    private interfaceService: InterfaceService,
    private urlService: UrlService
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    this.authenticationModeList = [
      {
        label: this.i18n.nodeManagement.passwordAuth,
        value: 'password',
        prop: 'password',
        checked: true,
      },
      {
        label: this.i18n.nodeManagement.private_key_auth,
        value: 'private_key',
        prop: 'key',
      },
    ];
    this.sysTuningConfig.agentWarnDeadline.label =
      this.i18n.system_config.agent_deadline;
    this.myTip = this.myTipBuilder();
    // mask 提示
    this.agentMaskTipData.columns = [
      {
        title: this.i18n.certificate.nodeIp,
        width: '19%',
      },
      {
        title: this.i18n.certificate.name,
        width: '27%',
      },
      {
        title: this.i18n.certificate.validTime,
        width: '30%',
      },
      {
        title: this.i18n.certificate.certStatusName,
        width: '24%',
      },
    ];
    // 生成 添加节点 表单
    this.generateAddNodeForm();

    // 生成 修改节点内容 表单
    this.generateEditNodeNameForm();

    // 生成 删除节点 表单
    this.generateDeleteNodeForm();

    // -- 删除节点失败 --
    this.deleteNodeFailedReason.columns = [
      {
        prop: 'projectName',
        title: this.i18n.common_term_projiect_name,
        width: '50%',
      },
      {
        prop: 'tool',
        title: this.i18n.common_term_projiect_owning_Tool,
        width: '50%',
      },
    ];

    this.initFingerPrintConfirmationTable();
  }

  ngOnInit() {
    this.route.params.subscribe((data) => {
      this.onSwitchMenu(data.item);
    });

    this.requestConfigData();
  }

  // -- 添加节点 --
  /** 生成添加节点表单 */
  public generateAddNodeForm() {
    const formGroup = new FormBuilder().group({
      nodeName: new FormControl(null, [
        this.customValidatorsService.nodeNameValidator,
      ]),
      installPath: new FormControl(null),
      nodeIP: new FormControl(null, [TiValidators.required]),
      port: new FormControl(null, [
        TiValidators.required,
        this.customValidatorsService.checkInteger(),
        CustomValidators.rangeValidate(1, 65535, this.i18n.validata.overRange),
      ]),
      username: new FormControl(null, [
        TiValidators.required,
        this.customValidatorsService.userNameValidator,
      ]),
      authenticationMode: new FormControl(null, [TiValidators.required]),
      password: new FormControl(null, [TiValidators.required]),
      keyFile: new FormControl(null, [TiValidators.required]),
      passphrase: new FormControl(null),
      rootPassword: new FormControl(null, [TiValidators.required]),
      sshTip: new FormControl(false, [TiValidators.required, this.customValidatorsService.checkRead()]),
    });

    this.addNodeForm.formGroup = formGroup;

    // 认证方式的修改
    formGroup.get('password').disable();
    formGroup.get('keyFile').disable();
    formGroup.get('passphrase').disable();
    formGroup.get('authenticationMode').valueChanges.subscribe((val) => {
      if (val.prop === 'password') {
        formGroup.get('password').enable();
        formGroup.get('keyFile').disable();
        formGroup.get('passphrase').disable();
      } else {
        formGroup.get('password').disable();
        formGroup.get('keyFile').enable();
        formGroup.get('passphrase').enable();
      }
    });

    // 用户名不是root时，添加root口令输入框
    formGroup.get('rootPassword').disable();
    formGroup.get('username').valueChanges.subscribe((val) => {
      if (val === 'root') {
        formGroup.get('rootPassword').disable();
        formGroup.get('rootPassword').reset();
      } else {
        formGroup.get('rootPassword').enable();
      }
    });

    this.resetAddNodeForm();
  }

  /** 重置添加节点表单 */
  public resetAddNodeForm() {
    if (!this.addNodeForm.formGroup) {
      return;
    }
    this.addNodeForm.formGroup.reset({
      installPath: '/opt',
      port: 22,
      username: 'root',
      authenticationMode: this.authenticationModeList.find(
        (item) => item.value === 'password'
      ),
    });
  }

  /** 打开添加节点弹框 */
  public openAddNodeModal() {
    this.resetAddNodeForm();

    this.addNodeModal = this.tiModal.open(this.addNodeModalComponent, {
      id: 'addNodeModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'nodeManagementModal custemModal',
      context: {
        interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
        confirm: (context: any) => {
          // 点击确定
          const formGroup = this.addNodeForm.formGroup;
          const values = formGroup.getRawValue();

          this.openFingerPrintConfirmationModal(
            values.nodeIP,
            values.port,
            values.username === 'root'
          )
            .then(() => {
              const params = {
                ip: values.nodeIP,
                port: values.port,
                user_name: values.username,
                verification_method: values.authenticationMode.value,
                node_name: values.nodeName?.trim(),
                agent_install_path: values.installPath,
                password: values.password,
                identity_file: values.keyFile,
                passphrase: values.passphrase,
                root_password: values.rootPassword,
              };

              context.interfacing = true;
              this.interfaceService
                .addNode(params)
                .then(() => {
                  this.mytipService.alertInfo({
                    type: 'success',
                    content: this.i18n.tip_msg.create_ok,
                    time: 3500,
                  });

                  context.close();

                  // 添加节点成功需要立即获取一次容量监控信息
                  this.msgService.sendMessage({
                    type: 'getAlarmInfoOnce',
                    status: true,
                  });
                })
                .catch(() => {})
                .finally(() => {
                  // 添加节点成功或失败后清空口令信息
                  this.addNodeForm.formGroup.controls.password.patchValue('');

                  context.interfacing = false;
                });
            })
            .catch(() => {});
        },
      },
      dismiss: (modalRef) => {},
    });
  }

  // -- 修改节点内容 --
  /** 生成修改节点表单 */
  public generateEditNodeNameForm() {
    const formGroup = new FormBuilder().group({
      nodeName: new FormControl(null, [
        this.customValidatorsService.checkEmpty(),
        this.customValidatorsService.nodeNameValidator,
        TiValidators.required,
      ]),
    });

    this.editNodeNameForm.formGroup = formGroup;

    this.resetEditNodeForm();
  }

  /** 重置修改节点表单 */
  public resetEditNodeForm() {
    if (!this.editNodeNameForm.formGroup) {
      return;
    }
    this.editNodeNameForm.formGroup.reset({});
  }

  /** 打开修改节点弹框 */
  public showEditNodeNameModal(node: any) {
    const formGroup = this.editNodeNameForm.formGroup;
    this.resetEditNodeForm();
    formGroup.controls.nodeName.setValue(node.nodeName);

    this.editNodeNameModal = this.tiModal.open(
      this.editNodeNameModalComponent,
      {
        id: 'editNodeNameModal', // 定义id防止同一页面出现多个相同弹框
        modalClass: 'nodeManagementModal custemModal',
        context: {
          nodeIP: node.nodeIP,
          interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
          confirm: (context: any) => {
            // 点击确定
            const values = formGroup.getRawValue();
            const params = {
              ipaddr: node.nodeIP,
              nickName: values.nodeName?.trim(),
            };

            context.interfacing = true;
            const type = this.isDiagnose
              ? '?analysis-type=memory_diagnostic'
              : '';
            this.Axios.axios
              .put(`/nodes/${encodeURIComponent(node.id)}/${type}`, params)
              .then((res: any) => {
                this.mytipService.alertInfo({
                  type: 'success',
                  content: this.i18n.tip_msg.edite_ok,
                  time: 3500,
                });

                context.close();

                // 通知节点列表界面刷新下列表
                this.nodeListComponent.getNodes();
              })
              .finally(() => {
                context.interfacing = false;
              });
          },
        },
      }
    );
  }

  // -- 删除节点 --
  /** 生成删除节点表单 */
  public generateDeleteNodeForm() {
    const formGroup = new FormBuilder().group({
      username: new FormControl(null, [
        this.customValidatorsService.userNameValidator,
      ]),
      authenticationMode: new FormControl(null, [TiValidators.required]),
      password: new FormControl(null, [TiValidators.required]),
      keyFile: new FormControl(null, [TiValidators.required]),
      passphrase: new FormControl(null),
      rootPassword: new FormControl(null, [TiValidators.required]),
      sshTip: new FormControl(false, [TiValidators.required, this.customValidatorsService.checkRead()]),
    });

    this.deleteNodeForm.formGroup = formGroup;

    // 认证方式的修改
    formGroup.get('password').disable();
    formGroup.get('keyFile').disable();
    formGroup.get('passphrase').disable();
    formGroup.get('authenticationMode').valueChanges.subscribe((val) => {
      if (val.prop === 'password') {
        formGroup.get('password').enable();
        formGroup.get('keyFile').disable();
        formGroup.get('passphrase').disable();
      } else {
        formGroup.get('password').disable();
        formGroup.get('keyFile').enable();
        formGroup.get('passphrase').enable();
      }
    });

    // 用户名不是root时，添加root口令输入框
    formGroup.get('rootPassword').disable();
    formGroup.get('username').valueChanges.subscribe((val) => {
      if (val === 'root') {
        formGroup.get('rootPassword').disable();
        formGroup.get('rootPassword').reset();
      } else {
        formGroup.get('rootPassword').enable();
      }
    });

    this.resetDeleteNodeForm();
  }

  /** 重置删除节点表单 */
  public resetDeleteNodeForm() {
    if (!this.deleteNodeForm.formGroup) {
      return;
    }
    this.deleteNodeForm.formGroup.reset({
      authenticationMode: this.authenticationModeList.find(
        (item) => item.value === 'password'
      ),
    });
  }

  /** 打开删除节点弹框 */
  public showDeleteNodeModal(node: any) {
    // 查询节点是否被工程引用
    const type = this.isDiagnose ? '?analysis-type=memory_diagnostic' : '';
    this.Axios.axios
      .get(`/nodes/${encodeURIComponent(node.id)}/projects/${type}`)
      .then((res: any) => {
        const data = res.data;
        const memoryProjectList: any = [];
        const sysProjectList: any = [];
        const optimizationProjectList: any = [];
        data.memoryProjectList.map((item: any) => {
          memoryProjectList.push(
            Object.assign({}, item, { tool: this.i18n.common_term_mem_name })
          );
        });
        data.projectList.map((item: any) => {
          sysProjectList.push(
            Object.assign({}, item, { tool: this.i18n.common_term_pro_name })
          );
        });
        data.optimizationProjectList.map((item: any) => {
          optimizationProjectList.push(
            Object.assign({}, item, {
              tool: this.i18n.common_tern_tunning_helper_name,
            })
          );
        });
        const projectList = [
          ...memoryProjectList,
          ...sysProjectList,
          ...optimizationProjectList,
        ];
        if (projectList.length) {
          this.showDeleteNodeFailedModal(projectList);
        } else {
          this.resetDeleteNodeForm();
          const formGroup = this.deleteNodeForm.formGroup;
          formGroup.controls.username.setValue(node.username);

          this.deleteNodeTip = fillPlaceholder(
            this.i18n.nodeManagement.deleteNodeTip,
            node.nodeIP
          );
          this.deleteNodeModal = this.tiModal.open(
            this.deleteNodeModalComponent,
            {
              id: 'deleteNodeModal', // 定义id防止同一页面出现多个相同弹框
              modalClass: 'nodeManagementModal custemModal',
              context: {
                node,
                interfacing: false,
                confirm: (context: any) => {
                  const values = formGroup.getRawValue();

                  this.openFingerPrintConfirmationModal(
                    context.node.nodeIP,
                    context.node.port,
                    values.username === 'root'
                  )
                    .then(() => {
                      const params = {
                        ip: context.node.nodeIP,
                        user_name: values.username,
                        verification_method: values.authenticationMode.value,
                        password: values.password,
                        identity_file: values.keyFile,
                        passphrase: values.passphrase,
                        root_password: values.rootPassword,
                      };

                      context.interfacing = true;
                      this.interfaceService
                        .deleteNode(context.node.id, params)
                        .then(() => {
                          this.mytipService.alertInfo({
                            type: 'success',
                            content: this.i18n.tip_msg.delete_ok,
                            time: 3500,
                          });

                          context.close();
                        })
                        .catch(() => {})
                        .finally(() => {
                          context.interfacing = false;
                        });
                    })
                    .catch(() => {});
                },
              },
              dismiss: (modalRef) => {},
            }
          );
        }
      })
      .catch((error: any) => {});
  }

  // 删除节点失败
  public showDeleteNodeFailedModal(projectList: any) {
    this.deleteNodeFailedReason.srcData = {
      // 表格源数据，开发者对表格的数据设置请在这里进行
      data: projectList.map((item: any) => {
        return {
          projectName: item.projectname,
          tool: item.tool,
        };
      }),
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false, // 源数据未进行分页处理
      },
    };

    this.deleteNodeFailedModal = this.tiModal.open(
      this.deleteNodeFailedModalComponent,
      {
        id: 'deleteNodeFailedModal', // 定义id防止同一页面出现多个相同弹框
        modalClass: 'deleteNodeFailedModal nodeManagementModal custemModal',
      }
    );
  }

  // -- 查看安装日志 --
  public viewLogs(node: any) {
    const type = this.isDiagnose ? '?analysis-type=memory_diagnostic' : '';
    this.Axios.axios
      .get(`/nodes/${encodeURIComponent(node.id)}/logs/${type}`)
      .then((res: any) => {
        const content: any = this.sanitizer.bypassSecurityTrustHtml(
          this.ansiUp.ansi_to_html(res.data.log_msg)
        );
        const contentWithoutTag = this.ansiUp.ansi_to_html(
          res.data.log_msg,
          false
        );

        this.viewLogsModal = this.tiModal.open(this.viewLogsModalComponent, {
          id: 'viewLogsModal', // 定义id防止同一页面出现多个相同弹框
          modalClass: 'custemModal viewLogsModal autoWidth',
          context: {
            content,
            copy: () => {
              const textarea = document.createElement('textarea');
              textarea.value = contentWithoutTag;
              textarea.style.position = 'fixed';
              textarea.style.top = '100%';
              textarea.style.left = '100%';
              document.body.appendChild(textarea);
              textarea.focus();
              textarea.select();

              if (document.execCommand('copy')) {
                this.mytipService.alertInfo({
                  type: 'success',
                  content: this.i18n.nodeManagement.copySucceeded,
                  time: 3500,
                });
              } else {
                this.mytipService.alertInfo({
                  type: 'error',
                  content: this.i18n.nodeManagement.copyFailed,
                  time: 3500,
                });
              }

              document.body.removeChild(textarea);
            },
            download: () => {
              if (window.navigator.msSaveOrOpenBlob) {
                // IE
                window.navigator.msSaveBlob(
                  new Blob([contentWithoutTag], {
                    type: 'text/plain',
                  }),
                  `${this.i18n.nodeManagement.installationLog.format(
                    node.nodeIP
                  )}.txt`
                );
              } else {
                const aTag = document.createElement('a');

                aTag.setAttribute(
                  'href',
                  'data:text/plain;charset=utf-8,' +
                    encodeURIComponent(contentWithoutTag)
                );
                aTag.setAttribute(
                  'download',
                  `${this.i18n.nodeManagement.installationLog.format(
                    node.nodeIP
                  )}.txt`
                );

                aTag.style.display = 'none';
                document.body.appendChild(aTag);

                aTag.click();

                document.body.removeChild(aTag);
              }
            },
            ...node,
          },
        });
      });
  }

  onMaxNodeAllow(allow: boolean) {
    this.isMaxNodeAllow = allow;
  }

  // -- 确认指纹/root用户二次确认弹框 --
  /** 初始化指纹确认表格 */
  private initFingerPrintConfirmationTable() {
    this.fingerPrintConfirmationTable.columns = [
      {
        prop: 'hashType',
        title: this.i18n.nodeManagement.hashType,
        width: '100px',
      },
      {
        prop: 'keyType',
        title: this.i18n.nodeManagement.keyType,
        width: '100px',
      },
      { prop: 'fingerPrint', title: this.i18n.nodeManagement.fingerPrint },
    ];
  }

  /**
   * 确认指纹/root用户二次确认
   * @param nodeIP 节点IP
   * @param port 端口
   * @param isRoot 是否是root账号，root账号二次确认
   */
  private openFingerPrintConfirmationModal(
    nodeIP: string,
    port?: number,
    isRoot?: boolean
  ) {
    return new Promise<void>((resolve, reject) => {
      this.queryNodeInfoService
        .getFingerPrint(nodeIP, port)
        .then((fingerPrint) => {
          const fingerPrintList: Array<TiTableRowData> = [];
          Object.keys(fingerPrint).forEach(
            (hashType: keyof typeof fingerPrint) => {
              fingerPrint[hashType].forEach((item) => {
                fingerPrintList.push({
                  hashType: item.hash_type,
                  keyType: item.key_type,
                  fingerPrint: item.finger_print,
                });
              });
            }
          );
          this.fingerPrintConfirmationTable.srcData.data = fingerPrintList;

          const content = isRoot
            ? this.i18n.nodeManagement.sshUseRootConfirmText
            : this.i18n.nodeManagement.sshConfirmText;
          this.fingerPrintConfirmationModal = this.tiModal.open(
            this.fingerPrintConfirmationModalComponent,
            {
              id: 'fingerPrintConfirmationModal', // 定义id防止同一页面出现多个相同弹框
              modalClass:
                'fingerPrintConfirmationModal nodeManagementModal custemModal',
              context: {
                tipInfo: fillPlaceholder(content, nodeIP),
                confirm: (context: any) => {
                  // 点击确定
                  context.close();
                  resolve();
                },
              },
              dismiss: (): void => {
                reject();
              },
            }
          );
        });
    });
  }
  public closeLeftMenu() {
    this.router.navigate(['/home']);
  }

  // 切换 左侧菜单栏
  public onSwitchMenu(item: any) {
    this.ifLeftMenuShow = item;
    switch (item) {
      case 'nodeManagement':
        this.title = this.i18n.nodeManagement.nodeManagement;
        break;
      case 'agentTitle':
        this.title = this.i18n.certificate.agentTitle;
        break;
    }
  }

  /**
   * 请求接口数据
   */
  private requestConfigData() {
    this.isLoading = true;
    // 获取 agent 证书的自动告警时间、日志老化时间
    this.Axios.axios
      .get(this.url.configSystem, { headers: { showLoading: false } })
      .then(({ data }: any) => {
        this.agentWarnDeadlineValue =
          data.CERT_ADVANCED_DAYS == null
            ? ''
            : parseInt(data.CERT_ADVANCED_DAYS, 10).toString();
      })
      .catch(() => {
        this.isLoading = false;
      });
  }

  public onAgentWarnDeadlineConfirm(val: any) {
    if (val === this.agentWarnDeadlineValue) {
      return;
    }
    this.isLoading = true;

    const temp = this.agentWarnDeadlineValue;
    this.agentWarnDeadlineValue = val;
    const params = {
      system_config: { CERT_ADVANCED_DAYS: val },
    };
    this.Axios.axios
      .put(this.url.configSystem, params, { headers: { showLoading: false } })
      .then(() => {
        this.myTip.editeOk();
        this.verifyAgentCertificate();
        this.isLoading = false;
      })
      .catch(() => {
        this.agentWarnDeadlineValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
      });
  }

  /**
   * 验证 agent 证书是否有快到期或已经到期的
   */
  private verifyAgentCertificate(): void {
    this.isLoading = true;
    this.Axios.axios
      .get(this.url.certificates, { headers: { showLoading: false } })
      .then((res: any) => {
        let data: {
          nodeIp: string;
          certName: string;
          certExpTime: string;
          certStatus: '0' | '1' | '2';
          certStatusText: string;
        }[] = [];
        const certStatusDict: any = {
          0: '',
          1: this.i18n.certificate.certStatus1,
          2: this.i18n.certificate.certStatus2,
        }; // 证书状态对照表
        this.isLoading = false;

        // 扁平化数据结构
        for (const item of res.data) {
          const { nodeIp } = item;
          for (const it of item.certInfo) {
            const { certName, certExpTime, certStatus } = it;
            data.push({
              nodeIp,
              certName,
              certExpTime,
              certStatus,
              certStatusText: certStatusDict[certStatus],
            });
          }
        }

        // 过滤掉证书状态为0（certStatus='0'）的数据项
        data = data.filter((item) => {
          return +item.certStatus > 0;
        });

        if (data.length > 0) {
          this.agentMaskTipData.warnText =
            this.i18n.certificate.agentWarnNotice;
          this.agentMaskTipData.srcData.data = data;
          this.agentMaskTip.Open();
        }
      })
      .catch(() => {
        this.isLoading = false;
      });
  }

  public onClickAgentMaskTip() {
    this.agentMaskTip.Close();
  }

  /**
   * 响应批量导入事件的点击
   * @param _ 无用参数
   */
  onBatchImportClick(_: any) {
    this.batchController?.action(BatchOptType.Import);
  }

  /**
   * 响应批量删除事件的点击
   * @param  _ 无用参数
   */
  onBatchDeleteClick(_: any) {
    this.batchController?.action(BatchOptType.Delete);
  }

  /**
   * 响应批量操作组件的初始化
   * @param ctl 批量操作的状态控制器
   */
  onBatchInited(ctl: StateController) {
    this.batchController = ctl;
  }

  /**
   * 响应批量操作组件的分发
   * @param ctl 批量操作的状态控制器
   */
  onBatchDispatsh(dispatchInfo: DispatchInfo) {
    if ([BatchOptEvent.DeleteSuccess, BatchOptEvent.ImportSuccess].includes(
      dispatchInfo.event
    )) {
      this.nodeListComponent.getNodes(false);
    }
  }

  /**
   * 提示生成器，因为使用 this.i18n ，所以应在 constructor 中“实例化”
   */
  private myTipBuilder() {
    const sameValueTip = this.i18n.tip_msg.system_setting_input_same_value;
    const editeOkTip = this.i18n.tip_msg.edite_ok;
    const editeErrorTip = this.i18n.tip_msg.edite_error;

    const sameValue = () => {
      this.mytipService.alertInfo({
        type: 'warn',
        content: sameValueTip,
        time: 3500,
      });
    };

    const editeOk = () => {
      this.mytipService.alertInfo({
        type: 'success',
        content: editeOkTip,
        time: 3500,
      });
    };

    const editeError = () => {
      this.mytipService.alertInfo({
        type: 'error',
        content: editeErrorTip,
        time: 3500,
      });
    };

    return { sameValue, editeOk, editeError };
  }
}

// 自定义校验规则
export class CustomValidators {
  // 使用正则校验
  public static regValidate(reg: any, tip: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !reg.test(control.value)) {
        return {
          res: {
            tiErrorMessage: tip,
            type: 'blur',
          },
        };
      } else {
        return null;
      }
    };
  }

  // 校验范围【只针对number类型】
  public static rangeValidate(
    minValue: any,
    maxValue: any,
    tip: any
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const judgeMinValue = () => {
        return !isNaN(minValue) ? control.value < minValue : true;
      };
      const judgeMaxValue = () => {
        return !isNaN(maxValue) ? control.value > maxValue : true;
      };

      if (!isNaN(control.value) && (judgeMinValue() || judgeMaxValue())) {
        return {
          res: {
            tiErrorMessage: tip,
            type: 'blur',
          },
        };
      } else {
        return null;
      }
    };
  }
}
