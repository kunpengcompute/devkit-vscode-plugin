import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { CustomValidatorsService } from 'projects/sys/src-web/app/service';
import {
  TiTableColumns, TiValidationConfig, TiTableSrcData, TiValidators, TiModalService, TiTableRowData
} from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { certStatus, NodeInfo, NoticeInfo, NodeAuthParams } from './domain/index';
import { InterfaceService } from './service/interface.service';
import { QueryNodeInfoService } from 'projects/sys/src-web/app/service/query-node-info.service';
import { fillPlaceholder } from 'projects/sys/src-web/app/util';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';

@Component({
  selector: 'app-header-certificate-agent',
  templateUrl: './header-certificate-agent.component.html',
  styleUrls: ['./header-certificate-agent.component.scss']
})
export class HeaderCertificateAgentComponent implements OnInit {
  public i18n: any;
  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  /** 证书状态属性列表 */
  public certStatusList: any;

  // 证书列表
  public agentData = {
    columns: ([] as Array<TiTableColumns>),
    displayed: ([] as Array<NodeInfo>),
    srcData: ({
      data: ([] as Array<NodeInfo>),
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    } as TiTableSrcData),
    currentPage: 1,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };

  // 已过期或即将过期的证书列表
  @ViewChild('noticeModalComponent') noticeModalComponent: ElementRef;
  public agentMaskTipData = {
    columns: ([] as Array<TiTableColumns>),
    displayed: ([] as Array<NoticeInfo>),
    srcData: ({
      data: ([] as Array<NoticeInfo>),
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    } as TiTableSrcData),
    currentPage: 1,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };

  // 节点认证
  @ViewChild('nodeAuthModalComponent') nodeAuthModalComponent: ElementRef;
  /** 节点认证表单管理器 */
  public nodeAuthFormGroup: FormGroup;
  /** 认证方式列表 */
  public authenticationModeList: Array<{ label: string, value: string }> = [];
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };

  // -- 确认指纹/root用户二次确认弹框 --
  @ViewChild('fingerPrintConfirmationModalComponent') fingerPrintConfirmationModalComponent: ElementRef;
  public fingerPrintConfirmationModal: any;
  public fingerPrintConfirmationTable: any = {
    columns: ([] as Array<TiTableColumns>),
    displayed: ([] as Array<TiTableRowData>),
    srcData: ({
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    } as TiTableSrcData),
  };
  private url: any;
  constructor(
    public i18nService: I18nService,
    public mytip: MytipService,
    public Axios: AxiosService,
    public timessage: MessageModalService,
    private tiModal: TiModalService,
    private interfaceService: InterfaceService,
    private customValidatorsService: CustomValidatorsService,
    private queryNodeInfoService: QueryNodeInfoService,
    private urlService: UrlService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
  }
  public isLoading: any = false;
  ngOnInit() {
    this.certStatusList = {
      valid: { label: this.i18n.certificate.valid },
      nearFailure: { label: this.i18n.certificate.nearFailure },
      failure: { label: this.i18n.certificate.failure },
    };

    this.agentData.columns = [
      { title: this.i18n.certificate.nodeIp, width: '16%' },
      { title: this.i18n.certificate.nodeNickname, width: '16%' },
      { title: this.i18n.certificate.name, width: '18%' },
      { title: this.i18n.certificate.validTime, width: '18%' },
      { title: this.i18n.certificate.status, width: '10%' },
    ];
    if (this.isAdmin) {
      this.agentData.columns.push({ title: this.i18n.certificate.operation, width: '22%' });
    }

    this.authenticationModeList = [
      { label: this.i18n.nodeManagement.passwordAuth, value: 'password' },
      { label: this.i18n.nodeManagement.private_key_auth, value: 'private_key' },
    ];

    this.getCertifigcate();
    this.initNodeAuthFormGroup();

    this.initFingerPrintConfirmationTable();
  }

  /** 获取证书列表数据 */
  private getCertifigcate() {
    this.isLoading = true;
    this.Axios.axios.get(this.url.certificates, { headers: { showLoading: false } })
    .then((res: { data: Array<any> }) => {
      this.isLoading = false;
      const warningCertList: NoticeInfo[] = []; // 快到期或已经到期的证书列表
      const certStatusList: certStatus[] = ['valid', 'nearFailure', 'failure'];

      res.data.forEach((nodeInfo: any) => {
        nodeInfo.certInfo.forEach((certInfo: any) => {
          // 后端返回的是0/1/2，转换成 certStatusList 中有语义的值
          certInfo.certStatus = certStatusList[+certInfo.certStatus];

          if (certInfo.certStatus !== 'valid') {
            warningCertList.push({
              nodeIp: nodeInfo.nodeIp,
              certName: certInfo.certName,
              certExpTime: certInfo.certExpTime,
              certStatus: certInfo.certStatus,
            });
          }
        });
      });

      if (warningCertList.length) {
        this.agentMaskTipData.srcData.data = warningCertList;
        this.showNoticeModal();
      }

      this.agentData.srcData.data = res.data;
    });
  }

  /** 提示快到期或已经到期的证书 */
  private showNoticeModal() {
    this.tiModal.open(this.noticeModalComponent, {
      id: 'noticeModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'noticeModal agent-mask custemModal',
      context: {},
    });
  }

  /** 生成证书 */
  public createCert() {
    this.isLoading = true;
    this.interfaceService.createCert().then(() => {
      this.isLoading = false;
      this.mytip.alertInfo({ type: 'success', content: this.i18n.certificate.createSuccess, time: 3500 });
    }).catch(() => {
      this.isLoading = false;
    });
  }


  // -- 节点认证 --
  /** 初始化节点认证表单 */
  private initNodeAuthFormGroup() {
    const formGroup = new FormBuilder().group({
      username: new FormControl(null, [TiValidators.required, this.customValidatorsService.userNameValidator]),
      authenticationMode: new FormControl(null, [TiValidators.required]),
      password: new FormControl(null, [TiValidators.required]),
      keyFile: new FormControl(null, [TiValidators.required]),
      passphrase: new FormControl(null),
      rootPassword: new FormControl(null, [TiValidators.required]),
      sshTip: new FormControl(false, [TiValidators.required, this.customValidatorsService.checkRead()]),
    });

    this.nodeAuthFormGroup = formGroup;

    // 认证方式的修改
    formGroup.get('password').disable();
    formGroup.get('keyFile').disable();
    formGroup.get('passphrase').disable();
    formGroup.get('authenticationMode').valueChanges.subscribe(val => {
      if (val.value === 'password') {
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
    formGroup.get('username').valueChanges.subscribe(val => {
      if (val === 'root') {
        formGroup.get('rootPassword').disable();
        formGroup.get('rootPassword').reset();
      } else {
        formGroup.get('rootPassword').enable();
      }
    });

    this.resetNodeAuthFormGroup();
  }

  /** 重置节点认证表单 */
  private resetNodeAuthFormGroup() {
    this.nodeAuthFormGroup.reset({
      authenticationMode: this.authenticationModeList.find(item => item.value === 'password'),
    });
  }

  /**
   * 打开更换证书弹框
   * @param title 标题
   * @param nodeIP 节点IP
   * @param userName 用户名
   * @param confirmCallback 确认时的回调
   */
  private showNodeAuthModal(
    title: string,
    nodeIP: string,
    userName: string,
    confirmCallback: (extraParams: {}) => Promise<void>
    ) {
    const formGroup = this.nodeAuthFormGroup;
    this.resetNodeAuthFormGroup();
    formGroup.controls.username.setValue(userName);

    this.tiModal.open(this.nodeAuthModalComponent, {
      id: 'nodeAuthModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'nodeAuthModal custemModal',
      context: {
        title,
        nodeIP,
        interfacing: false, // 接口调用中
        confirm: (context: any) => {
          if (TiValidators.check(formGroup) || context.interfacing) { return; }

          const values = formGroup.getRawValue();
          this.openFingerPrintConfirmationModal(nodeIP, undefined, values.username === 'root').then(() => {
            const authenticationMode = values.authenticationMode.value;
            const params: NodeAuthParams = {
              user_name: values.username,
              verification_method: authenticationMode,
              password: authenticationMode === 'password' ? values.password : undefined,
              identity_file: authenticationMode === 'private_key' ? values.keyFile : undefined,
              root_password: values.username !== 'root' ? values.rootPassword : undefined,
            };

            context.interfacing = true;

            confirmCallback(params)
              .then(() => context.close())
              .finally(() => context.interfacing = false);
          }).catch(() => { });
        },
      },
      close: (): void => {
        this.isLoading = false;
      },
      dismiss: (): void => {
        this.isLoading = false;
      }
    });
  }

  // -- 确认指纹/root用户二次确认弹框 --
  /** 初始化指纹确认表格 */
  private initFingerPrintConfirmationTable() {
    this.fingerPrintConfirmationTable.columns = [
      { prop: 'hashType', title: this.i18n.nodeManagement.hashType, width: '100px' },
      { prop: 'keyType', title: this.i18n.nodeManagement.keyType, width: '100px' },
      { prop: 'fingerPrint', title: this.i18n.nodeManagement.fingerPrint },
    ];
  }

  /**
   * 确认指纹/root用户二次确认
   * @param nodeIP 节点IP
   * @param port 端口
   * @param isRoot 是否是root账号，root账号二次确认
   */
  private openFingerPrintConfirmationModal(nodeIP: string, port?: number, isRoot?: boolean) {
    return new Promise<void>((resolve, reject) => {
      this.queryNodeInfoService.getFingerPrint(nodeIP, port).then((fingerPrint) => {
        const fingerPrintList: Array<TiTableRowData> = [];
        Object.keys(fingerPrint).forEach((hashType: keyof typeof fingerPrint) => {
          fingerPrint[hashType].forEach(item => {
            fingerPrintList.push({
              hashType: item.hash_type,
              keyType: item.key_type,
              fingerPrint: item.finger_print,
            });
          });
        });
        this.fingerPrintConfirmationTable.srcData.data = fingerPrintList;

        const content = isRoot ? this.i18n.nodeManagement.sshUseRootConfirmText
                        : this.i18n.nodeManagement.sshConfirmText;
        this.fingerPrintConfirmationModal = this.tiModal.open(this.fingerPrintConfirmationModalComponent, {
          id: 'fingerPrintConfirmationModal', // 定义id防止同一页面出现多个相同弹框
          modalClass: 'fingerPrintConfirmationModal nodeManagementModal custemModal',
          context: {
            tipInfo: fillPlaceholder(content, nodeIP),
            confirm: (context: any) => { // 点击确定
              context.close();
              resolve();
            },
          },
          dismiss: (): void => {
            reject();
          }
        });
      });
    });
  }


  // -- 更换证书 --
  public replaceCert(node: any) {
    this.isLoading = true;
    const replaceCert = (extraParams?: {}) => {
      return new Promise<void>((resolve, reject) => {
        this.interfaceService.replaceCert({
          ip: node.nodeIp,
          node_name: node.nodeName,
          ...extraParams,
        }).then(() => {
          this.isLoading = false;
          this.mytip.alertInfo({ type: 'success', content: this.i18n.certificate.createUpdate, time: 3500 });
          resolve();
        }).catch((e: Error) => {
          this.isLoading = false;
          reject(e);
        });
      });
    };

    if (node.isLocal) { // 本机IP直接调用接口
      replaceCert();
    } else {  // 非本机IP需要认证
      this.isLoading = false;
      const title = this.i18n.agentCertificate.update_certificate;
      this.showNodeAuthModal(title, node.nodeIp, node.userName, replaceCert);
    }
  }


  // -- 更换工作秘钥 --
  public replaceWorkingSecretKey(node: any) {
    this.isLoading = true;
    const replaceCert = (extraParams?: {}) => {
      return new Promise<void>((resolve, reject) => {
        this.interfaceService.replaceWorkingSecretKey({
          ip: node.nodeIp,
          node_name: node.nodeName,
          ...extraParams,
        }).then(() => {
          this.isLoading = false;
          this.mytip.alertInfo({ type: 'success', content: this.i18n.certificate.workUpdate, time: 3500 });
          resolve();
        }).catch((e: Error) => {
          this.isLoading = false;
          reject(e);
        });
      });
    };

    if (node.isLocal) { // 本机IP直接调用接口
      replaceCert();
    } else {  // 非本机IP需要认证
      const title = this.i18n.agentCertificate.update_work_key;
      this.showNodeAuthModal(title, node.nodeIp, node.userName, replaceCert);
    }
  }
}
