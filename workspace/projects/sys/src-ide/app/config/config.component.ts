import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import {VscodeService, COLOR_THEME, DEFAULT_PORT, currentTheme} from '../service/vscode.service';

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
    public savePort = DEFAULT_PORT.SYS_DEFAULT_PORT;
    public config: any;
    public hasConfig = false;
    public ipCheck = false;
    public portCheck = false;
    public showCertificate = false;
    public firstConfig = true;
    public currTheme = COLOR_THEME.Dark;
    public saveEvCheck = true;
    public radioList: Array<any> = [];
    public selected = 'trust';
    public primitiveSelected = '';
    public selectCertificate = false;
    public selectedChange = false;
    public localfilepath = null;
    public saveLocalfilepath: any = null;
    public certificateSettingsTipStr1: string;
    public certificateSettingsTipStr2: string;
    public showLoading = false;

    public pluginUrlCfg: any = {
        sysConfig_openFAQ1: '',
    };

    constructor(private i18nService: I18nService, private elementRef: ElementRef, public vscodeService: VscodeService) {
    }

    /**
     * 初始化配置
     */
    ngOnInit() {
        // vscode颜色主题
        this.currTheme = currentTheme();

        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.readConfig();
        this.i18n = this.i18nService.I18n();
        this.certificateSettingsTipStr1 = this.i18n.plugins_common_service_certificate_settings_tip1;
        this.certificateSettingsTipStr2 = this.i18n.plugins_common_service_certificate_settings_tip2;
        this.radioList = [{
            value: 'specifying',
            label: this.i18n.plugins_common_specifying_root_certificate
        }, {
            value: 'trust',
            label: this.i18n.plugins_common_trust_current_service_certificate
        }];
        setTimeout(() => {
            if (this.selectCertificate) {
                this.selected = this.radioList[0].value;
            } else {
                this.selected = this.radioList[1].value;
            }
            this.primitiveSelected = this.selected;
        }, 100);
    }
    /**
     * 选择证书状态
     */
    public ngModelChange(value) {
        this.selected = value;
        if (this.primitiveSelected === value) {
            this.selectedChange = false;
        } else {
            this.selectedChange = true;
        }
        if (value === 'trust') {
            this.localfilepath = '';
            this.saveEvCheck = false;
            this.selectCertificate = false;
        } else if (value === 'specifying') {
            this.saveEvCheck = true;
            this.selectCertificate = true;
            this.checkIPAndPort();
        }
    }
    /**
     * 上传私钥
     */
    fileUpload() {
        this.elementRef.nativeElement.querySelector('#uploadFile').value = '';
        this.elementRef.nativeElement.querySelector('#uploadFile').click();
    }
    /**
     * 选择文件路径
     */
    checkFile() {
        if (this.localfilepath) {
            this.showCertificate = false;
        } else {
            this.showCertificate = true;
        }
    }
    /**
     * 选择文件路径是否有修改校验
     * @returns 校验结果
     */
    checkFileModel() {
        if (this.showCertificate) {
            this.saveEvCheck = true;
        } else {
            this.saveEvCheck = false;
        }
    }
    /**
     * 导入私钥
     */
    uploadFile() {
        const localFile = this.elementRef.nativeElement.querySelector('#uploadFile').files[0];
        this.localfilepath = localFile.path.replace(/\\/g, '/');
        this.checkIPAndPort();
    }
    /**
     * 读取ip端口配置
     */
    readConfig() {
        const msgData = { cmd: 'readConfig' };
        this.vscodeService.postMessage(msgData, (data: any) => {
            this.config = data;
            if (this.config.sysPerfConfig.length > 0) {
                this.hasConfig = true;
                this.firstConfig = false;
                this.tempIP = this.config.sysPerfConfig[0].ip;
                this.selectCertificate = this.config.sysPerfConfig[0].selectCertificate;
                this.localfilepath = this.config.sysPerfConfig[0].localfilepath;
                this.tempPort = this.config.sysPerfConfig[0].port;
                this.saveIp = this.config.sysPerfConfig[0].ip;
                this.savePort = this.config.sysPerfConfig[0].port;
                this.saveLocalfilepath = this.config.sysPerfConfig[0].localfilepath;
                this.checkIPAndPort();
            }
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
     * ip和port是否有修改校验
     * @returns 校验结果
     */
    checkIPAndPort() {
        if (this.selected === 'trust') {
            if (!this.tempIP || !this.tempPort ) {
                this.saveEvCheck = true;
            } else {
                this.saveEvCheck = false;
            }
        } else if (this.selected === 'specifying') {
            if (!this.tempIP || !this.tempPort || !this.localfilepath) {
                this.saveEvCheck = true;
            } else {
                this.saveEvCheck = false;
            }
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
                ){
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
            this.config.sysPerfConfig = [];
            this.config.autoLoginConfig = [];
            this.config.sysPerfConfig.push({
                ip: this.tempIP, port: this.tempPort,
                selectCertificate: this.selectCertificate, localfilepath: this.localfilepath
            });
            const data = {
                cmd: 'saveConfig',
                data: { data: JSON.stringify(this.config), showInfoBox: true , selected: this.selected, }
            };
            this.vscodeService.postMessage(data, () => {
                this.showLoading = false;
            });
            this.hasConfig = true;
            this.readConfig();
        }
    }

    /**
     * 修改配置
     */
    modify() {
        if (this.selected === 'trust') {
            this.saveEvCheck = false;
        }
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
     * 取消选择证书配置
     */
    cancelSelected() {
        setTimeout(() => {
            if (this.selectedChange) {
                if (this.selected === 'trust') {
                    this.selected = this.radioList[0].value;
                    this.selectCertificate = true;
                } else if (this.selected === 'specifying') {
                    this.selected = this.radioList[1].value;
                    this.selectCertificate = false;
                }
                this.selectedChange = false;
            } else {
                if (this.selected === 'trust') {
                    this.selectCertificate = false;
                } else if (this.selected === 'specifying') {
                    this.selectCertificate = true;
                }
            }
        }, 100);
    }

    /**
     * 跳转install页面
     */
    openInstallPage() {
        const data = {
            cmd: 'openNewPage', data: {
                router: 'install',
                panelId: 'perfInstall',
                viewTitle: this.i18n.plugins_common_title_deploy,
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
                panelId: 'perfFreeTrialRemoteEnvironment',
                viewTitle: this.i18n.plugins_common_free_trial_remote_environment,
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
