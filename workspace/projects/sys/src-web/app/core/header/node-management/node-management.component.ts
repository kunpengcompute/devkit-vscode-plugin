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
  /** ?????????????????? */
  public authenticationModeList: Array<any> = [];
  public validation: TiValidationConfig = {
    // [tiValidation]='validation' ????????????????????????
    type: 'blur',
  };

  // -- ???????????? --
  @ViewChild('addNodeModalComponent') addNodeModalComponent: ElementRef;
  public addNodeModal: any;
  public addNodeForm = {
    formGroup: {} as FormGroup,
  };

  // -- ?????????????????? --
  @ViewChild('editNodeNameModalComponent')
  editNodeNameModalComponent: ElementRef;
  public editNodeNameModal: any;
  public editNodeNameForm = {
    formGroup: {} as FormGroup,
  };

  // -- ???????????? --
  @ViewChild('deleteNodeModalComponent') deleteNodeModalComponent: ElementRef;
  public deleteNodeModal: any;
  public deleteNodeTip: any;
  public deleteNodeForm = {
    formGroup: {} as FormGroup,
  };

  // -- ?????????????????? --
  @ViewChild('deleteNodeFailedModalComponent')
  deleteNodeFailedModalComponent: ElementRef;
  public deleteNodeFailedModal: any;
  public deleteNodeFailedReason: any = {
    columns: [],
    displayed: [],
    srcData: {},
  };

  // -- ?????????????????? --
  @ViewChild('viewLogsModalComponent') viewLogsModalComponent: ElementRef;
  public viewLogsModal: any;

  // -- ????????????/root???????????????????????? --
  @ViewChild('fingerPrintConfirmationModalComponent')
  fingerPrintConfirmationModalComponent: ElementRef;
  public fingerPrintConfirmationModal: any;
  public fingerPrintConfirmationTable: any = {
    columns: [] as Array<TiTableColumns>,
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false, // ??????????????????????????????
        sorted: false, // ??????????????????????????????
        paginated: false, // ??????????????????????????????
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
  public agentWarnDeadlineValue = ''; // Agent??????????????????????????????(???)
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
    // mask ??????
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
    // ?????? ???????????? ??????
    this.generateAddNodeForm();

    // ?????? ?????????????????? ??????
    this.generateEditNodeNameForm();

    // ?????? ???????????? ??????
    this.generateDeleteNodeForm();

    // -- ?????????????????? --
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

  // -- ???????????? --
  /** ???????????????????????? */
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

    // ?????????????????????
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

    // ???????????????root????????????root???????????????
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

  /** ???????????????????????? */
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

  /** ???????????????????????? */
  public openAddNodeModal() {
    this.resetAddNodeForm();

    this.addNodeModal = this.tiModal.open(this.addNodeModalComponent, {
      id: 'addNodeModal', // ??????id??????????????????????????????????????????
      modalClass: 'nodeManagementModal custemModal',
      context: {
        interfacing: false, // ??????????????????????????????????????????????????????
        confirm: (context: any) => {
          // ????????????
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

                  // ????????????????????????????????????????????????????????????
                  this.msgService.sendMessage({
                    type: 'getAlarmInfoOnce',
                    status: true,
                  });
                })
                .catch(() => {})
                .finally(() => {
                  // ????????????????????????????????????????????????
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

  // -- ?????????????????? --
  /** ???????????????????????? */
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

  /** ???????????????????????? */
  public resetEditNodeForm() {
    if (!this.editNodeNameForm.formGroup) {
      return;
    }
    this.editNodeNameForm.formGroup.reset({});
  }

  /** ???????????????????????? */
  public showEditNodeNameModal(node: any) {
    const formGroup = this.editNodeNameForm.formGroup;
    this.resetEditNodeForm();
    formGroup.controls.nodeName.setValue(node.nodeName);

    this.editNodeNameModal = this.tiModal.open(
      this.editNodeNameModalComponent,
      {
        id: 'editNodeNameModal', // ??????id??????????????????????????????????????????
        modalClass: 'nodeManagementModal custemModal',
        context: {
          nodeIP: node.nodeIP,
          interfacing: false, // ??????????????????????????????????????????????????????
          confirm: (context: any) => {
            // ????????????
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

                // ???????????????????????????????????????
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

  // -- ???????????? --
  /** ???????????????????????? */
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

    // ?????????????????????
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

    // ???????????????root????????????root???????????????
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

  /** ???????????????????????? */
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

  /** ???????????????????????? */
  public showDeleteNodeModal(node: any) {
    // ?????????????????????????????????
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
              id: 'deleteNodeModal', // ??????id??????????????????????????????????????????
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

  // ??????????????????
  public showDeleteNodeFailedModal(projectList: any) {
    this.deleteNodeFailedReason.srcData = {
      // ?????????????????????????????????????????????????????????????????????
      data: projectList.map((item: any) => {
        return {
          projectName: item.projectname,
          tool: item.tool,
        };
      }),
      state: {
        searched: false, // ??????????????????????????????
        sorted: false, // ??????????????????????????????
        paginated: false, // ??????????????????????????????
      },
    };

    this.deleteNodeFailedModal = this.tiModal.open(
      this.deleteNodeFailedModalComponent,
      {
        id: 'deleteNodeFailedModal', // ??????id??????????????????????????????????????????
        modalClass: 'deleteNodeFailedModal nodeManagementModal custemModal',
      }
    );
  }

  // -- ?????????????????? --
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
          id: 'viewLogsModal', // ??????id??????????????????????????????????????????
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

  // -- ????????????/root???????????????????????? --
  /** ??????????????????????????? */
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
   * ????????????/root??????????????????
   * @param nodeIP ??????IP
   * @param port ??????
   * @param isRoot ?????????root?????????root??????????????????
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
              id: 'fingerPrintConfirmationModal', // ??????id??????????????????????????????????????????
              modalClass:
                'fingerPrintConfirmationModal nodeManagementModal custemModal',
              context: {
                tipInfo: fillPlaceholder(content, nodeIP),
                confirm: (context: any) => {
                  // ????????????
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

  // ?????? ???????????????
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
   * ??????????????????
   */
  private requestConfigData() {
    this.isLoading = true;
    // ?????? agent ????????????????????????????????????????????????
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
   * ?????? agent ??????????????????????????????????????????
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
        }; // ?????????????????????
        this.isLoading = false;

        // ?????????????????????
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

        // ????????????????????????0???certStatus='0'???????????????
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
   * ?????????????????????????????????
   * @param _ ????????????
   */
  onBatchImportClick(_: any) {
    this.batchController?.action(BatchOptType.Import);
  }

  /**
   * ?????????????????????????????????
   * @param  _ ????????????
   */
  onBatchDeleteClick(_: any) {
    this.batchController?.action(BatchOptType.Delete);
  }

  /**
   * ????????????????????????????????????
   * @param ctl ??????????????????????????????
   */
  onBatchInited(ctl: StateController) {
    this.batchController = ctl;
  }

  /**
   * ?????????????????????????????????
   * @param ctl ??????????????????????????????
   */
  onBatchDispatsh(dispatchInfo: DispatchInfo) {
    if ([BatchOptEvent.DeleteSuccess, BatchOptEvent.ImportSuccess].includes(
      dispatchInfo.event
    )) {
      this.nodeListComponent.getNodes(false);
    }
  }

  /**
   * ?????????????????????????????? this.i18n ??????????????? constructor ??????????????????
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

// ?????????????????????
export class CustomValidators {
  // ??????????????????
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

  // ????????????????????????number?????????
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
