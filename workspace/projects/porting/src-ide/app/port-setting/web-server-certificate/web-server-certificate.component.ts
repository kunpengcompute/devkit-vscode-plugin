import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
    TiFilter, TiMenuItem, TiMessageService,
    TiModalService, TiTableColumns, TiTableSrcData,
    TiValidationConfig
} from '@cloud/tiny3';
import { fileSize } from '../../global/globalData';
import { HttpStatus } from '../../service/constant';
import { I18nService } from '../../service/i18n.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';

const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}

// 证书状态
const enum CERT_STATE {
    STATE_VALID = '1',
    STATE_EXPIRING = '0',
    STATE_EXPIRED = '-1'
}

// 证书验证规则类
export class ServerValidators {
    /**
     * 国家验证规则
     */
    public static country(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[a-zA-Z]{2}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { country: { tiErrorMessage: i18n.common_term_required_tip } };
            }
            if (reg.test(control.value) === false || !control.value) {
                return {
                  country: { tiErrorMessage: i18n.plugins_porting_webServerCertificate.country_Verification_Tips }
                };
            }
            return null;
        };
    }

    /**
     * 省验证规则
     */
    public static province(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (reg.test(control.value) === false) {
                return {
                  province: { tiErrorMessage: i18n.plugins_porting_webServerCertificate.province_Verification_Tips }
                };
            }
            return null;
        };
    }
    /**
     * 市验证规则
     */
    public static city(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (reg.test(control.value) === false) {
                return { city: { tiErrorMessage: i18n.plugins_porting_webServerCertificate.city_Verification_Tips } };
            }
            return null;
        };
    }
    /**
     * 组织验证规则
     */
    public static organization(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,64}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (reg.test(control.value) === false) {
                return {
                  organization: {
                    tiErrorMessage: i18n.plugins_porting_webServerCertificate.organization_Verification_Tips
                  }
                };
            }
            return null;
        };
    }
    /**
     * 部门验证规则
     */
    public static department(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,64}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (reg.test(control.value) === false) {
                return {
                  department: {
                    tiErrorMessage: i18n.plugins_porting_webServerCertificate.department_Verification_Tips
                  }
                };
            }
            return null;
        };
    }
    /**
     * 常用名验证规则
     */
    public static commonName(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[\s.\-_a-zA-Z0-9]{0,64}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { commonName: { tiErrorMessage: i18n.common_term_required_tip } };
            }
            if (reg.test(control.value) === false || !control.value) {
                return {
                  commonName: {
                    tiErrorMessage: i18n.plugins_porting_webServerCertificate.commonName_Verification_Tips
                  }
                };
            }
            return null;
        };
    }
}

@Component({
    selector: 'app-web-server-certificate',
    templateUrl: './web-server-certificate.component.html',
    styleUrls: ['./web-server-certificate.component.scss']
})
export class WebServerCertificateComponent implements OnInit {

    public i18n: any;
    public tip1Context: any = {
        label: 'this is a tip'
    };
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    // maxCount定义为1时，代表单文件上传
    filters: Array<TiFilter> = [{
        name: 'maxCount',
        params: [1]
    }];
    public url = 'api/v2.2/certificates/';
    public role = ((self as any).webviewSession || {}).getItem('role') === 'Admin';
    public currTheme = COLOR_THEME.Dark;
    public autoUpload = false;
    public csrFrom: FormGroup;
    public csrLeadFrom: FormGroup;
    public updateKeyFrom: FormGroup;
    public displayed: any = [];
    public value = '';
    public moreShow = 'none';
    public csrSubmitBtn = false;
    // Web服务端证书列表
    public webCertData: TiTableSrcData;
    public columns: Array<TiTableColumns> = [];
    public searchWords: Array<string> = [''];
    public label = {
        country: '',
        province: '',
        city: '',
        organization: '',
        department: '',
        commonName: '',
        csrFile: ''
    };
    public csrLeadList = {
        csrFile: '',
    };
    public file: any;
    public alertInfo: string;
    public typePrompt: string;
    public open = false;
    public dismissOnTimeout = 5000;
    public hasArrow = false;
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {}
    };
    public iconColor = '';
    public currLang: any;
    public changeFlag = false;
    public showLoading = false;
    public pluginUrlCfg: any = {};

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public timessage: TiMessageService,
        private elementRef: ElementRef,
        public tiModal: TiModalService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('csrModal', { static: false }) csrModal: any;
    @ViewChild('csrLeadModal', { static: false }) csrLeadModal: any;
    @ViewChild('updateKey', { static: false }) updateKeyModal: any;
    /**
     * ngOnInit
     */
    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        this.currLang = I18nService.getLang();
        // vscode颜色主题
        if (document.body.className === 'vscode-light') {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.label = {
            country: this.i18n.plugins_porting_webServerCertificate.country,
            province: this.i18n.plugins_porting_webServerCertificate.province,
            city: this.i18n.plugins_porting_webServerCertificate.city,
            organization: this.i18n.plugins_porting_webServerCertificate.organization,
            department: this.i18n.plugins_porting_webServerCertificate.department,
            commonName: this.i18n.plugins_porting_webServerCertificate.commonName,
            csrFile: this.i18n.plugins_porting_webServerCertificate.csrFile
        };
        this.validation.errorMessage.required = this.i18n.plugins_porting_webServerCertificate.keyFileText;
        this.csrFrom = new FormGroup({
            country: new FormControl('', [ServerValidators.country(this.i18n)]),
            province: new FormControl('', [ServerValidators.province(this.i18n)]),
            city: new FormControl('', [ServerValidators.city(this.i18n)]),
            organization: new FormControl('', [ServerValidators.organization(this.i18n)]),
            department: new FormControl('', [ServerValidators.department(this.i18n)]),
            commonName: new FormControl('', [ServerValidators.commonName(this.i18n)]),
        });
        this.csrLeadFrom = new FormGroup({
            csrFile: new FormControl(''),
        });
        this.updateKeyFrom = new FormGroup({});
        if (LANGUAGE_TYPE.ZH === this.currLang) {
            this.columns = [
                {
                    title: this.i18n.plugins_porting_webServerCertificate.name,
                    width: '20%'
                },
                {
                    title: this.i18n.plugins_porting_webServerCertificate.validTime,
                    width: '20%'
                },
                {
                    title: this.i18n.plugins_porting_webServerCertificate.status,
                    width: '15%'
                },
                {
                    title: this.i18n.plugins_porting_webServerCertificate.operate,
                    width: '35%'
                },
            ];
        } else {
            this.columns = [
                {
                    title: this.i18n.plugins_porting_webServerCertificate.name,
                    width: '15%'
                },
                {
                    title: this.i18n.plugins_porting_webServerCertificate.validTime,
                    width: '20%'
                },
                {
                    title: this.i18n.plugins_porting_webServerCertificate.status,
                    width: '10%'
                },
                {
                    title: this.i18n.plugins_porting_webServerCertificate.operate,
                    width: '45%'
                },
            ];
        }
        if (!this.role) {
            this.columns.pop();
        }
        this.webCertData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            state: {
                searched: true, // 后台搜索，源数据已进行过搜索处理
                sorted: false, // 后台排序，源数据已进行过排序处理
                paginated: true // 后台分页，源数据已进行过分页处理
            }
        };
        this.showLoading = true;
        setTimeout(() => {
            this.getCertifigcate();
        }, 600);
    }

    /**
     * 查询证书列表
     */
    public getCertifigcate() {
        this.showLoading = true;
        const option = {
            url: '/cert/',
        };
        this.vscodeService.get(option, (res: any) => {
            if (res && res.status === 0) {
                const certExpired = res.data.cert_expired.replace('T', ' ');
                const webCert = [
                  {
                    name: 'cert.pem',
                    validTime: certExpired,
                    certStatus: this.handelStatus(res.data.cert_flag)
                  }
                ];
                this.webCertData.data = webCert;
            }

            this.showLoading = false;
        });
    }

    /**
     * 根据状态显示文字
     */
    public handelStatus(certStatus: string | number) {
        let status = '';
        if (certStatus === '1') {
            status = this.i18n.plugins_porting_webServerCertificate.valid;
            this.iconColor = 'valid-icon';
        }
        if (certStatus === '0') {
            status = this.i18n.plugins_porting_webServerCertificate.nearFailure;
            this.iconColor = 'nearFailure-icon';
        }
        if (certStatus === '-1') {
            status = this.i18n.plugins_porting_webServerCertificate.failure;
            this.iconColor = 'failed-icon';
        }
        return status;
    }

    /**
     * 根据接口返回JSON生成证书文件
     */
    public confirm(context: any) {
        // 防止短时间内连续点击按钮发送多次请求
        this.csrSubmitBtn = true;
        const params = {
            country: this.csrFrom.get('country').value,
            state: this.csrFrom.get('province').value || '',
            locality: this.csrFrom.get('city').value || '',
            organization: this.csrFrom.get('organization').value || '',
            organizational_unit: this.csrFrom.get('department').value || '',
            common_name: this.csrFrom.get('commonName').value || '',
        };
        const option = {
            url: '/cert/csr/',
            params,
            responseType: 'json'
        };
        this.vscodeService.post(option, (res: any) => {
            context.close();
            this.csrSubmitBtn = false;
            this.csrFrom.reset();
            if (res && res.status === 0) {
                const param = {
                    data: res.data.content,
                    fileName: 'cert.csr',
                    status: '1'
                };
                const msg = {
                    cmd: 'downloadCsrFile',
                    data: param
                };
                this.vscodeService.postMessage(msg, null);
            } else {
                this.showMessageByLang(res);
            }

        });
    }

    /**
     * 关闭模态框
     */
    public cancel(type: string) {
        if (type === 'lead') {
            this.csrLeadFrom.reset();
            this.csrLeadModal.Close();
        } else if (type === 'updateKey') {
            this.updateKeyFrom.reset();
            this.updateKeyModal.Close();
        } else {
            this.csrFrom.reset();
            this.csrModal.close();
        }
    }

    /**
     * 打开生成CSR文件或者导入证书窗口
     * @param type 打开窗口类型
     */
    public createCSR(type: string) {
        if (type === 'lead') {
            this.csrLeadModal.Open();
        } else {
            this.tiModal.open(this.csrModal, {
                id: 'csrModal',
                modalClass: 'csrModal',
                draggable: false,
                dismiss: (): void => {
                    this.csrFrom.reset();
                }
            });
        }
    }

    // 打开更换密钥确认窗口
    public creatUpdateKey() {
        this.updateKeyModal.Open();
    }
    /**
     * 重启服务
     */
    public serverReast() {
        const option = {
            url: '/cert/nginx/reload/',
        };
        this.vscodeService.post(option, (res: any) => {
            if (res && HttpStatus.STATUS_SUCCESS_200 === res.httpsStatus) {
                if (res.status === 0) {
                    // 重启成功，获取证书信息
                    setTimeout(() => {
                        this.getCertInfo(res);
                    }, 6000);
                } else {
                    this.showMessageByLang(res);
                }
            } else {
                // 提示重启需要5-10秒
                this.showInfoBox(
                    this.i18n.plugins_porting_webServerCertificate.common_term_webcert_restart_tip, 'info');
            }
        });
    }

    /**
     * 获取证书信息
     * @param msg 重启成功返回的数据
     */
    private getCertInfo(msg: any) {
        const oriCertExpired = this.webCertData.data[0].validTime;
        const info = {
            url: '/cert/',
        };
        this.vscodeService.get(info, (data: any) => {
            if (data) {
                const certExpired = data.data.cert_expired.replace('T', ' ');
                if (oriCertExpired === certExpired && msg !== '') {
                    this.showMessageByLang(msg);
                } else {
                    this.webCertData.data[0].validTime = certExpired;
                }
            }
        });
    }
    /**
     * 打开更多
     * @param status 状态值
     */
    public showMore(status: string) {
        if (status === 'none') {
            this.moreShow = 'block';
        } else {
            this.moreShow = 'none';
        }
    }
    /**
     * 更换工作密钥
     */
    public changeSecret() {
        this.cancel('updateKey');
        const option = {
            url: '/admin/workkey/',
        };
        this.vscodeService.post(option, (res: any) => {
            this.showMessageByLang(res);
        });
    }

    /**
     * 上传文件
     */
    public fileUpload() {
        this.elementRef.nativeElement.querySelector('#uploadCert').value = '';
        this.elementRef.nativeElement.querySelector('#uploadCert').click();
    }
    /**
     * 选择文件
     */
    public uploadFile() {
        this.file = this.elementRef.nativeElement.querySelector('#uploadCert').files[0];
        // 文件格式校验：仅支持.crt、.cer、.pem文件
        if (!(/.crt$|.cer$|.pem$/).test(this.file.name)) {
            this.showInfoBox(this.i18n.plugins_porting_webServerCertificate.upload_failed_tip, 'error');
            return;
        }
        const size = this.file.size / 1024 / 1024;
        // web服务端证书大小不能超过1MB
        if (size > 1) {
            this.showInfoBox(this.i18n.plugins_porting_message_certExceedMaxSize, 'error');
            return;
        }
        this.csrLeadList.csrFile = this.file.name;
    }
    /**
     * 导入证书
     */
    public uploadWebCert() {
        let localfilepath = '';
        localfilepath = this.file.path.replace(/\\/g, '/');
        const uploadMsg = {
            cmd: 'uploadProcess',
            data: {
                msgID: 'uploadFile',
                url: '/cert/cert/',
                fileUpload: 'true',
                filePath: localfilepath,
                fileSize: this.file.size,
                need_unzip: false,
                fileName: this.csrLeadList.csrFile,
                needHeaderFileName: true,
                uploadPrefix: this.i18n.plugins_porting_menu_certificate_settings
            }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
            if (resp.status === STATUS.SUCCESS) {
                this.cancel('lead');
            }
            this.showMessageByLang(resp);
        });
    }
    private showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    // 发送消息给vscode, 右下角弹出提醒框
    private showMessageByLang(data: any) {
        let type = 'info';
        if (data.status !== 0) {
            type = 'error';
        }
        if (LANGUAGE_TYPE.ZH === this.currLang) {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }

    public dataToItemsFn: (data: any) => Array<TiMenuItem> = () => {
        const items: Array<TiMenuItem> = [{
            label: this.i18n.plugins_porting_webServerCertificate.createCsr,
            association: 'switch',
            id: '1'
        }, {
            label: this.i18n.plugins_porting_webServerCertificate.leadCsr,
            association: 'switch',
            id: '2'
        }, {
            label: this.i18n.plugins_porting_webServerCertificate.resetServer,
            id: '3'
        }, {
            label: this.i18n.plugins_porting_webServerCertificate.changeCipher,
            id: '4'
        }];
        return items;
    }

    onSelect(item: any): void {
        switch (item.id) {
            case '1':
                this.createCSR('csrinput');
                break;
            case '2':
                this.createCSR('lead');
                break;
            case '3':
                this.serverReast();
                break;
            case '4':
                this.creatUpdateKey();
                break;
            default:
                break;
        }
    }
}

