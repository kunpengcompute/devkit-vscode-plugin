import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TiTableColumns, TiTableSrcData, TiValidators, TiValidationConfig, TiFilter } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';

@Component({
    selector: 'app-webcertficate',
    templateUrl: './header-web-cert-ficate.component.html',
    styleUrls: ['./header-web-cert-ficate.component.scss']
})

export class WebcertficateComponent implements OnInit {
    public tip1Context: any = {
        label: ''
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
    public role = VscodeService.isAdmin();
    public currTheme = COLOR_THEME.Dark;
    public autoUpload = false;
    public csrFrom: FormGroup;
    public csrLeadFrom: FormGroup;
    public i18n: any;
    public displayed = [];
    public value = '';
    public moreShow = 'none';
    // Web服务端证书列表
    public webCertData: TiTableSrcData;
    public columns: Array<TiTableColumns> = [];
    public statusList = [];
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
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private elementRef: ElementRef,
        private validatorsServe: CustomValidatorsService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('csrModal', { static: false }) csrModal;
    @ViewChild('csrLeadModal', { static: false }) csrLeadModal;
    @ViewChild('restartService', { static: false }) restartService;

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.getCertifigcate();
        this.label = {
            country: this.i18n.certificate.country,
            province: this.i18n.certificate.province,
            city: this.i18n.certificate.city,
            organization: this.i18n.certificate.organization,
            department: this.i18n.certificate.department,
            commonName: this.i18n.certificate.commonName,
            csrFile: this.i18n.certificate.csrFile
        };
        this.validation.errorMessage.required = this.i18n.validata.req;
        this.csrFrom = new FormGroup({
            country: new FormControl('', [this.validatorsServe.csrCountryValidator]),
            province: new FormControl('', [this.validatorsServe.csrAddressValidator]),
            city: new FormControl('', [this.validatorsServe.csrAddressValidator]),
            organization: new FormControl('', [this.validatorsServe.csrOtherNameValidator]),
            department: new FormControl('', [this.validatorsServe.csrOtherNameValidator]),
            commonName: new FormControl('', [this.validatorsServe.csrOtherNameValidator]),
        });
        this.csrLeadFrom = new FormGroup({
            csrFile: new FormControl('', [TiValidators.required]),
        });
        this.columns = [
            {
                title: this.i18n.certificate.name,
                width: '25%'
            },
            {
                title: this.i18n.certificate.validTime,
                width: '25%'
            },
            {
                title: this.i18n.certificate.status,
                width: '20%'
            },
            {
                title: this.i18n.certificate.operate,
                width: '30%'
            },
        ];
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
        this.statusList = [
            this.i18n.certificate.valid,
            this.i18n.certificate.nearFailure,
            this.i18n.certificate.failure
        ];
    }

    /**
     * 请求数据的方法
     */
    public getCertifigcate() {
        const option = {
            url: '/certificates/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (res) => {
            this.webCertData.data = res.data.map(item => {
                const name = item.certName;
                const validTime = item.expireDate;
                const certStatus = +item.certStatus;
                const status = this.handelStatus(item.certStatus);
                return {
                    name,
                    validTime,
                    certStatus,
                    status
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
            case 0:
                iconColor = 'analyzing-icon';
                break;
            case 1:
                iconColor = 'stopping-icon';
                break;
            case 2:
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
     * 根据接口返回JSON生成证书文件
     */
    public confirm() {
        const params = {
            country: this.csrFrom.get('country').value,
            province: this.csrFrom.get('province').value || '',
            city: this.csrFrom.get('city').value || '',
            organization: this.csrFrom.get('organization').value || '',
            department: this.csrFrom.get('department').value || '',
            commonName: this.csrFrom.get('commonName').value || '',
        };
        const option = {
            url: '/certificates/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
            params,
            responseType: 'json'
        };
        this.vscodeService.post(option, (res) => {
            this.csrModal.Close();
            this.csrFrom.reset();
            const message = {
                cmd: 'downloadFile',
                data: {
                    fileName: 'server.csr',
                    fileContent: res.data.certificate.replace(/\\n/g, ''),
                    contentType: 'json',
                    invokeLocalSave: true
                }
            };
            this.vscodeService.postMessage(message, null);
        });
    }

    /**
     * 关闭弹窗
     */
    public cancle(type: string) {
        if (type === 'lead') {
            this.csrLeadFrom.reset();
            this.csrLeadModal.Close();
        } else if (type === 'csrinput') {
            this.csrFrom.reset();
            this.csrModal.Close();
        } else if (type === 'restartService') {
            this.restartService.Close();
        }
    }

    /**
     * 打开生成CSR文件或者导入证书窗口
     * @param type 打开窗口类型
     */
    public createCSR(type: string) {
        if (type === 'lead'){
            this.csrLeadModal.Open();
            this.csrLeadFrom.controls.csrFile.disable();
        } else {
            this.csrModal.Open();
        }
    }

    /**
     * 重启服务
     */
    public serverReast() {
        this.restartService.Open();
    }

    /**
     * 确认重启服务
     */
    public confirmRestart() {
        const option = {
            url: '/certificates/cert_active/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.showInfoBox(this.i18n.certificate.common_term_webcert_restart_tip, 'info');
        this.vscodeService.get(option, () => { });
        this.restartService.Close();
    }

    /**
     * 打开更多
     * @param status 状态值
     */
    public showMore(status) {
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
        const option = {
            url: '/work-keys/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.put(option, (res) => {
            this.vscodeService.showInfoBox(res.message, 'info');
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
        this.csrLeadList.csrFile = this.file.name;
        this.csrLeadFrom.controls.csrFile.enable();
    }
    /**
     * 导入证书
     */
    public uploadWebCert() {
        let localfilepath = '';
        localfilepath = this.file.path.replace(/\\/g, '/');
        const option = {
            url: '/certificates/',
            fileUpload: true,
            filePath: localfilepath,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
        };
        this.vscodeService.put(option, (res) => {
            if (res.code === 'UserManage.Success') {
                this.vscodeService.showInfoBox(this.i18n.certificate.common_webcert_import_success, 'info');
                this.csrLeadFrom.reset();
                this.csrLeadModal.Close();
            } else {
                this.csrLeadFrom.reset();
                this.csrLeadFrom.controls.csrFile.disable();
                this.vscodeService.showInfoBox(res.message, 'info');
            }
        });
    }
}

