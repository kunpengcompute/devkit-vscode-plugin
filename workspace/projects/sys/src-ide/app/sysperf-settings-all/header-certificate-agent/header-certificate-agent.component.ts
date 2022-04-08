import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';
import {
    TiTableColumns, TiTableRowData, TiValidationConfig, TiTableSrcData, TiValidators, TiModalService
} from '@cloud/tiny3';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { COLOR_THEME, VscodeService, HTTP_STATUS_CODE } from '../../service/vscode.service';
import { QueryNodeInfoService } from 'projects/sys/src-ide/app/service/query-node-info.service';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';

@Component({
    selector: 'app-header-certificate-agent',
    templateUrl: './header-certificate-agent.component.html',
    styleUrls: ['./header-certificate-agent.component.scss']
})
export class HeaderCertificateAgentComponent implements OnInit {
    @ViewChild('modal', { static: false }) modal: any;
    public i18n: any;
    private url: any;
    constructor(
        public i18nService: I18nService,
        public mytip: MytipService,
        public Axios: AxiosService,
        private cdr: ChangeDetectorRef,
        private elementRef: ElementRef,
        public timessage: TiModalService,
        private queryNodeInfoService: QueryNodeInfoService,
        private customValidatorsService: CustomValidatorsService,
        public vscodeService: VscodeService,
        private urlService: UrlService,
    ) {
        this.url = this.urlService.Url();
        this.i18n = this.i18nService.I18n();
    }
    public role = VscodeService.isAdmin();
    public statusList = [];
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    private data: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];

    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {}
    };
    public certForm: FormGroup;
    public certType = {
        type1: 'password',
        type2: 'password',
        type3: 'password',
        type4: 'password',
    };
    public certFormLable = {
        nodeId: '节点',
        verificationLable: '认证方式',
        password: '口令',
        keyFile: '私钥文件',
        pwdPhrase: '密码短语'
    };
    public nodeIp: string;
    public nodeName: string;
    public opeartType = 'cert';
    public opeartTitle: string;
    public verificationType: Array<any> = [
        { label: '口令认证', status: 0 },
        { label: '密钥认证', status: 1 }
    ];
    public mySelected: any;
    public verificationChoose = 0;
    public changeCertBtn = false;
    public msg;
    public isChange = true;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    // -- 确认指纹/root用户二次确认弹框 --
    @ViewChild('fingerPrintConfirmationModalComponent',
    { static: false }) fingerPrintConfirmationModalComponent: ElementRef;
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
    public showLoading = false;
    public isLoading = false;
    public agentWarnDeadlineValue = ''; // Agent服务证书自动告警时间(天)

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.certFormLable = {
            nodeId: this.i18n.agentCertificate.nodeId,
            verificationLable: this.i18n.agentCertificate.verificationLable,
            password: this.i18n.agentCertificate.password,
            keyFile: this.i18n.agentCertificate.keyFile,
            pwdPhrase: this.i18n.agentCertificate.pwdPhrase
        };
        this.verificationType = [
            { label: this.i18n.agentCertificate.passwordAuth, status: 0 },
            { label: this.i18n.agentCertificate.private_key_auth, status: 1 }
        ];
        this.mySelected = this.verificationType[0];
        this.columns = [
            {
                title: this.i18n.certificate.nodeIp,
                width: '20%'
            },
            {
                title: this.i18n.certificate.nodeNickname,
                width: '10%'
            },
            {
                title: this.i18n.certificate.name,
                width: '20%'
            },
            {
                title: this.i18n.certificate.validTime,
                width: '20%'
            },
            {
                title: this.i18n.certificate.status,
                width: '10%'
            },
            {
                title: this.i18n.certificate.operate,
                width: '20%'
            },
        ];
        if (!this.role) {
            this.columns.pop();
        }
        this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: this.data, // 源数据
            // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
            // 已经做过的，tiny就不再做了
            // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
            // 本示例中，开发者没有设置分页、搜索和排序这些特性，因此tiny不会对数据进行进一步的处理
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
        this.statusList = [
            this.i18n.certificate.valid,
            this.i18n.certificate.nearFailure,
            this.i18n.certificate.failure
        ];

        this.getCertifigcate();
        this.initNodeAuthFormGroup();

        this.initFingerPrintConfirmationTable();

        this.vscodeService.get({ url: `${this.url.configSystem}` }, (data: any) => {
            this.agentWarnDeadlineValue = data.data.CERT_ADVANCED_DAYS == null ? ''
            : parseInt(data.data.CERT_ADVANCED_DAYS, 10).toString();
        });
    }

    /**
     * 表单提交修改(Agent服务证书过期告警阈值)
     */
    public onAgentWarnDeadlineConfirm(val: any) {
        if (val === this.agentWarnDeadlineValue) {
            const info = this.i18n.newHeader.sameValue;
            this.vscodeService.showInfoBox(info, 'warn');
            return;
        }

        this.agentWarnDeadlineValue = val;
        const params = {
            system_config: { CERT_ADVANCED_DAYS: val }
        };
        this.vscodeService.put({ url: `${this.url.configSystem}`, params }, () => {
            const info = this.i18n.tip_msg.edite_ok;
            this.vscodeService.showInfoBox(info, 'info');
        });
    }

    /**
     * 获取证书列表数据
     */
    public getCertifigcate() {
        const option = {
            url: `${this.url.certificates}`,
        };
        this.vscodeService.get(option, (res: any) => {
            this.srcData.data = res.data.map(item => {
                const nodeIp = item.nodeIp;
                const nodeNickname = item.nodeName;
                const certInfo = item.certInfo;
                const isLocal = item.isLocal;
                const userName = item.userName;
                certInfo.forEach((data) => {
                    data.certStatus = +data.certStatus;
                    data.certStatus = this.handelStatus(data.certStatus);
                });

                return {
                    nodeIp,
                    nodeNickname,
                    certInfo,
                    isLocal,
                    userName,
                };
            });
        });
    }

    /**
     * 状态小圆点
     */
    public statusFormat(certStatus) {
        let iconColor = '';
        switch (certStatus) {
            case '有效':
                iconColor = 'analyzing-icon';
                break;
            case '即将过期':
                iconColor = 'stopping-icon';
                break;
            case '已过期':
                iconColor = 'failed-icon';
                break;
            case 'Valid':
                iconColor = 'analyzing-icon';
                break;
            case 'About to expire':
                iconColor = 'stopping-icon';
                break;
            case 'Expired':
                iconColor = 'failed-icon';
                break;
            default:
                break;
        }
        return iconColor;
    }

    /**
     * 根据状态显示文字
     */
    public handelStatus(certStatus) {
        return this.statusList[certStatus];
    }

    /**
     * 生成证书
     */
    createCert() {
        const option = {
            url: `${this.url.certificates}`,
        };
        this.vscodeService.post(option, (res: any) => {
            if (res.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                this.vscodeService.showInfoBox(this.i18n.certificate.createSuccess, 'info');
            } else {
                this.vscodeService.showInfoBox(res.message, 'error');
            }
        });
    }

    /**
     * 更换证书/工作密钥表单提交
     */
    confirmCert(context) {
        this.openFingerPrintConfirmationModal(this.nodeIp).then(() => {
            const errors: ValidationErrors | null = TiValidators.check(this.certForm);
            // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
            if (errors) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const firstError: any = Object.keys(errors)[0];
                this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
                    .focus();
                this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
                    .blur();
                return false;
            }
            let params;
            if (this.certForm.get('type').value.status === 0) {
                params = {
                    ip: this.nodeIp || '',
                    user_name: this.certForm.get('username').value || '',
                    node_name: this.nodeName || '',
                    verification_method: this.certForm.get('type').value.status === 0 ? 'password' : 'private_key',
                    password: this.certForm.get('pwd').value || '',
                };
            } else {
                params = {
                    ip: this.nodeIp || '',
                    user_name: this.certForm.get('username').value || '',
                    node_name: this.nodeName || '',
                    verification_method: this.certForm.get('type').value.status === 0 ? 'password' : 'private_key',
                    identity_file: this.certForm.get('pwdFile').value || '',
                    passphrase: this.certForm.get('pwdText').value || '',
                };
            }
            if (this.certForm.get('username').value !== 'root') {
                params = { ...params, root_password: this.certForm.get('rootPassword').value || '' };
            }
            const url = this.opeartType === 'cert' ? `${this.url.certificates}` : `${this.url.workKey}`;
            const text = this.opeartType === 'cert' ? this.i18n.certificate.createUpdate
            : this.i18n.certificate.workUpdate;
            const option = { url, params };
            this.cdr.detectChanges();
            this.vscodeService.put(option, (res: any) => {
                if (res.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                    this.vscodeService.showInfoBox(text, 'info');
                    context.dismiss();
                } else {
                    this.vscodeService.showInfoBox(res.message, 'error');
                }
                this.isLoading = false;
            });
        });
    }

    /**
     *  打开更换证书表单
     */
    public changeType(content, node, type, title) {
        this.showLoading = true;
        this.nodeIp = node.nodeIp;
        this.nodeName = node.nodeNickname;
        this.opeartType = type;
        this.opeartTitle = title;
        const url = this.opeartType === 'cert' ? `${this.url.certificates}` : `${this.url.workKey}`;
        const text = this.opeartType === 'cert' ? this.i18n.certificate.createUpdate : this.i18n.certificate.workUpdate;
        this.certForm.reset();
        if (node.isLocal && this.isChange) {
            this.isChange = false;
            let params;
            let timer;
            const that = this;
            params = {
                ip: this.nodeIp,
                node_name: this.nodeName,
            };
            const option = { url, params: { ...params } };
            clearTimeout(timer);
            timer = setTimeout(() => {// 两秒钟的防抖
                that.vscodeService.put(option, (res: any) => {
                    that.isChange = true;
                    if (res.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                        this.vscodeService.showInfoBox(text, 'info');
                    } else {
                        this.vscodeService.showInfoBox(res.message, 'error');
                    }
                    this.showLoading = false;
                });
            }, 2000);

        } else if (node.isLocal && !this.isChange) {
            return false;
        } else {
            this.showLoading = false;
            this.changeCertBtn = false;
            this.msg = this.timessage.open(content, {
                id: 'add',
                modalClass: 'cert',
                draggable: false,
                closeIcon: false,
            });
            const formGroup = this.certForm;
            formGroup.controls.username.setValue(node.userName);
        }
    }

    /**
     *  表单校验
     */
    public onNgModelChange(mySelected) {
        setTimeout(() => {
            if (mySelected) {
                this.changeCertBtn = false;
                this.verificationChoose = mySelected.status;
            }
        }, 0);
        if (mySelected && mySelected.status === 0) {
            this.certForm.get('pwdFile').setValidators(null);
            this.certForm.get('pwd').setValidators(this.pwdCheck);
        }
        if (mySelected && mySelected.status === 1) {
            this.certForm.get('pwd').setValidators(null);
            this.certForm.get('pwdFile').setValidators(this.pwdFileCheck);
        }
    }

    /**
     *  口令验证规则
     */
    public pwdCheck = (control: FormControl) => {
        if (!control.value) {
            this.changeCertBtn = false;
            return { pwd: { tiErrorMessage: this.i18n.certificate.keyFileText } };
        } else {
            this.changeCertBtn = true;
        }
    }

    public pwdFileCheck = (control: FormControl) => {
        if (!control.value) {
            this.changeCertBtn = false;
            return { pwd: { tiErrorMessage: this.i18n.certificate.keyFileText } };
        } else {
            this.changeCertBtn = true;
        }
    }

    /**
     * 改变密文/明文
     */
    public eyesSwitch(type: any, text: string) {
        if (type === 1) {
            this.certType.type1 = text;
        } else if (type === 2) {
            this.certType.type2 = text;
        } else if (type === 3) {
            this.certType.type3 = text;
        } else if (type === 4) {
            this.certType.type4 = text;
        }
    }

    // -- 确认指纹/root用户二次确认弹框 --
    /** 初始化指纹确认表格 */
    private initFingerPrintConfirmationTable() {
        this.fingerPrintConfirmationTable.columns = [
            { prop: 'hashType', title: this.i18n.plugins_sysperf_message_nodeManagement.hashType, width: '100px' },
            { prop: 'keyType', title: this.i18n.plugins_sysperf_message_nodeManagement.keyType, width: '100px' },
            { prop: 'fingerPrint', title: this.i18n.plugins_sysperf_message_nodeManagement.fingerPrint },
        ];
    }

    /**
     * 确认指纹/root用户二次确认
     * @param nodeIP 节点IP
     * @param port 端口
     */
    private openFingerPrintConfirmationModal(nodeIP: string) {
        return new Promise<void>((resolve, reject) => {
            this.queryNodeInfoService.getFingerPrint(nodeIP, undefined).then((fingerPrint) => {
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

                const content = this.i18n.plugins_sysperf_message_nodeManagement.sshUseRootConfirmText;
                this.fingerPrintConfirmationModal = this.timessage.open(this.fingerPrintConfirmationModalComponent, {
                    id: 'fingerPrintConfirmationModal', // 定义id防止同一页面出现多个相同弹框
                    modalClass: 'fingerPrintConfirmationModal nodeManagementModal custemModal',
                    context: {
                        tipInfo: this.fillPlaceholder(content, nodeIP),
                        confirm: (context: any) => { // 点击确定
                            this.isLoading = true;
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

    /**
     * 填充字符串的占位符
     * 例如：'{0}事件所占总事件比例为{1}%'.format(a, b) => a事件所占总事件比例为b%
     * @param targetString 要替换的字符串
     * @param actualContent 实际内容
     */
    public fillPlaceholder(targetString: string, ...actualContent: string[]) {
        for (let i = 0; i < actualContent.length; i++) {
            targetString = targetString.replace(new RegExp(`\\{${i}\\}`, 'g'), actualContent[i]);
        }
        return targetString;
    }

    // -- 节点认证 --
    /** 初始化节点认证表单 */
    private initNodeAuthFormGroup() {
        const formGroup = new FormBuilder().group({
            username: new FormControl(null, [TiValidators.required, this.customValidatorsService.userNameValidator]),
            type: new FormControl(null, [TiValidators.required]),
            pwd: new FormControl(null, [TiValidators.required]),
            pwdFile: new FormControl(null, [TiValidators.required]),
            pwdText: new FormControl(null),
            rootPassword: new FormControl(null),
        });

        this.certForm = formGroup;
    }
}
