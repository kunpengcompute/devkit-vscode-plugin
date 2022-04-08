import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME, DEFAULT_PORT } from '../service/vscode.service';
import { ActivatedRoute } from '@angular/router';
import { DEFAULT_IP, ENV_APP_NAME, HttpStatus } from '../service/constant';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
    private static CONFIG_RADIX = 10;
    @ViewChild('saveConfirmTip', { static: false }) saveConfirmTip: { Close: () => void; Open: () => void; };

    public i18n: any;
    public tempIP: string;
    public saveIp: string;
    public tempPort = '';
    public savePort = DEFAULT_PORT.PORTING_DEFAULT_PORT;
    public portToolTip: string;
    public config: any;
    public hasConfig = false;
    public ipCheck = false;
    public portCheck = false;
    public showCertificate = false;
    public firstConfig = true;
    public currLang: number;
    public currTheme = COLOR_THEME.Dark;
    public filePath = '';
    public isAffinity = false;
    public fileName = '';
    public isSingle: string; // 是否单文件
    public radioList: Array<any> = [];
    public selected = 'trust';
    public primitiveSelected = '';
    public selectCertificate = true;
    public selectedChange = false;
    public saveLocalfilepath: any = null;
    public localfilepath: any = null;
    public certificateSettingsTipStr1: string;
    public certificateSettingsTipStr2: string;
    public showLoading = false;
    public isCloudIDE = false;
    public pluginUrlCfg: any = {};
    public curAppName: string;  // 当前环境名称

    constructor(
        private route: ActivatedRoute, private i18nService: I18nService,
        private elementRef: ElementRef, public vscodeService: VscodeService) {
    }

    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        // vscode颜色主题
        if (document.body.className === 'vscode-light') {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.postMessage({ cmd: 'getCurrentAppName' }, (appName: string) => {
            if (appName === ENV_APP_NAME.CLOUDIDE) {  // cloudIDE环境
                this.isCloudIDE = true;
            } else {
                this.isCloudIDE = false;
            }
            this.curAppName = appName;
        });

        this.route.queryParams.subscribe((data) => {

            // 如果是右键发起跳转到该页面
            if (data.filePath) {
                this.filePath = data.filePath;
                this.fileName = data.fileName;
                this.isSingle = data.isSingle;
                this.isAffinity = data.isAffinity;
            }
        });

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        // 设置国际化
        this.i18n = this.i18nService.I18n();
        this.currLang = I18nService.getLang();
        this.certificateSettingsTipStr1 = this.i18n.plugins_common_service_certificate_settings_tip1;
        this.certificateSettingsTipStr2 = this.i18n.plugins_common_service_certificate_settings_tip2;
        this.radioList = [{
            value: 'specifying',
            label: this.i18n.plugins_common_specifying_root_certificate
        }, {
            value: 'trust',
            label: this.i18n.plugins_common_trust_current_service_certificate
        }];
        this.readConfig();
        this.portToolTip = this.i18nService.I18nReplace(this.i18n.plugins_porting_label_default_port,
            { 0: DEFAULT_PORT.PORTING_DEFAULT_PORT });
    }
    ngModelChange($event: any): void {
        this.selected = $event;
        if (this.primitiveSelected === $event) {
            this.selectedChange = false;
        } else {
            this.selectedChange = true;
        }
        if ($event === 'trust') {
            this.localfilepath = '';
            this.selectCertificate = false;
        } else if ($event === 'specifying') {
            this.selectCertificate = true;
        }
    }
    /**
     * 上传证书
     */
    fileUpload() {
        this.elementRef.nativeElement.querySelector('#uploadFile').value = '';
        this.elementRef.nativeElement.querySelector('#uploadFile').click();
    }

    /**
     * 导入证书
     */
    uploadFile() {
        const localFile = this.elementRef.nativeElement.querySelector('#uploadFile').files[0];
        this.localfilepath = localFile.path.replace(/\\/g, '/');
    }

    /**
     * 读取ip端口配置
     */
    readConfig() {
        this.vscodeService.postMessage({ cmd: 'readConfig' }, (data: any) => {
            this.config = data;
            if (this.config.portConfig.length > 0) {
                this.hasConfig = true;
                this.firstConfig = false;
                this.tempIP = this.config.portConfig[0].ip;
                this.selectCertificate = this.config.portConfig[0].selectCertificate;
                this.localfilepath = this.config.portConfig[0].localfilepath;
                this.tempPort = this.config.portConfig[0].port;
                this.saveIp = this.config.portConfig[0].ip;
                this.savePort = this.config.portConfig[0].port;
                this.saveLocalfilepath = this.config.portConfig[0].localfilepath;
            } else {
                if (this.curAppName === ENV_APP_NAME.CLOUDIDE) {  // cloudIDE环境
                    this.tempIP = DEFAULT_IP.CLOUDIDE_DEFAULT_IP;
                    this.selectCertificate = false;
                    this.hasConfig = true;
                }
            }
            if (this.selectCertificate) {
                this.selected = this.radioList[0].value;
            } else {
                this.selected = this.radioList[1].value;
            }
            this.primitiveSelected = this.selected;
        });
    }

    /**
     * ip校验
     *
     * @returns 校验结果
     */
    checkIP() {
        const reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        const invalidIp = /0.0.0.0|255.255.255.255/;
        this.ipCheck = !reg.test(this.tempIP) || invalidIp.test(this.tempIP);
    }

    /**
     * port校验
     *
     * @returns 校验结果
     */
    checkPort() {
        if ((/^[1-9]\d*$/.test(this.tempPort)
            && 1024 <= parseInt(this.tempPort, ConfigComponent.CONFIG_RADIX)
            && parseInt(this.tempPort, ConfigComponent.CONFIG_RADIX) <= 65535)) {
            this.portCheck = false;
        } else {
            this.portCheck = true;
        }
    }

    /**
     * 未登录直接保存，登录时弹窗确认
     */
    saveConfirm() {
        const data = { cmd: 'isLogin' };
        this.vscodeService.postMessage(data, (resp: any) => {
            if (resp === true) {
                // 登录状态，再次确认
                if (this.tempIP === this.saveIp
                    && this.tempPort === this.savePort
                    && this.localfilepath === this.saveLocalfilepath
                ) {
                    this.primitiveSelected = this.selected;
                    this.selectedChange = false;
                    this.cancel();
                } else {
                    this.saveConfirmTip.Open();
                }
            } else {
                // 未登录状态，直接保存
                this.save();
            }
        });
    }

    /**
     * 将ip port配置写入配置文件
     */
    save() {
        this.primitiveSelected = this.selected;
        this.selectedChange = false;
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        if (!this.ipCheck && !this.portCheck) {
            this.showLoading = true;
            this.config.portConfig = [];
            this.config.portAuto = [];
            this.config.portConfig.push({
                ip: this.tempIP, port: this.tempPort,
                selectCertificate: this.selectCertificate, localfilepath: this.localfilepath
            });
            let data;
            if (this.filePath.length > 0) { // 右键源码迁移
                data = {
                    cmd: 'saveConfig', data: {
                        data: JSON.stringify(this.config), showInfoBox: true,
                        filePath: this.filePath, fileName: this.fileName, isSingle: this.isSingle,
                        selected: this.selected, isAffinity: this.isAffinity
                    }
                };
            } else {
                data = {
                    cmd: 'saveConfig', data: {
                        data: JSON.stringify(this.config), showInfoBox: true
                    }
                };
            }
            this.vscodeService.postMessage(data, (res: any) => {
                if (res && res.realStatus === HttpStatus.STATUS_SUCCESS_200) {
                    this.hasConfig = true;
                } else {
                    this.modify();
                }
                this.showLoading = false;
            });
            this.readConfig();
        }
    }

    /**
     * 修改配置
     */
    modify() {
        this.selected = this.radioList[0].value;
        this.selectCertificate = true;
        this.hasConfig = false;
        this.firstConfig = false;
    }

    /**
     * 取消配置操作
     */
    cancel() {
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        this.ipCheck = false;
        this.portCheck = false;
        this.readConfig();
    }

    /**
     * 跳转install页面
     */
    openInstallPage() {
        const data = {
            cmd: 'openNewPage', data: {
                router: 'install',
                panelId: 'portInstall',
                viewTitle: this.i18n.common_install_panel_title,
                message: {}
            }
        };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * 跳转免费试用远程服务页面
     */
     openFreeTrialRemoteEnv() {
        const data = {
            cmd: 'openNewPage',
            data: {
                router: 'freeTrialProcessEnvironment',
                panelId: 'portFreeTrialRemoteEnvironment',
                viewTitle: this.i18n.plugins_porting_free_trial_remote_environment,
                message: {}
            }
        };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * 登录状态修改配置再次确认页面
     */
    confirmMsgTip() {
        this.saveConfirmTip.Close();
        this.save();
    }

    /**
     * 登录状态修改配置再次确认页面
     */
    cancelMsgTip() {
        this.saveConfirmTip.Close();
    }
}
