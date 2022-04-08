import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { PortsetComponent } from './port-setting.component';

// 下拉框选择参数
const LABLE_YES = 1;
const LABLE_NO = 0;

/**
 * 登录设置
 */
export class LoginConfig {

    public static instance: LoginConfig;
    elementRef: any;
    i18n: any;

    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        LoginConfig.instance = this;
    }

    // 记住密码自动登录
    public isSystem = true;
    public rememberPwd = false;
    public autoLogin = false;
    public configFlag = false;
    public autoUserFlag = false;
    public disAutoSet = false;
    public config: any;
    public autoLoginUser: string;
    public rememberConfig: boolean;
    public autoConfig: boolean;

    /**
     * 获取自动登录配置信息
     */
    getLoginConfig(portSet: PortsetComponent) {

        // 获取配置文件中的登录配置信息
        const msgData = { cmd: 'readConfig' };
        this.vscodeService.postMessage(msgData, (data: any) => {
            this.config = data;
            this.rememberPwd = false;
            this.autoLogin = false;
            this.disAutoSet = false;

            if (this.config.portAuto.length > 0) {
                this.autoLoginUser = this.config.portAuto[0].user;
                this.rememberConfig = this.config.portAuto[0].remember;
                this.autoConfig = this.config.portAuto[0].auto;
            }

            if (this.autoLoginUser && this.autoLoginUser === portSet.username) {
                this.rememberPwd = this.rememberConfig;
                this.autoLogin = this.autoConfig;
                this.disAutoSet = true;
            }
            this.showAutoSet(portSet);
        });
    }

    /**
     * 将记住密码自动登录配置写入配置文件
     */
    saveConfig(portSet: PortsetComponent) {
        this.getConfigFlag(portSet);
        if (!this.rememberPwd) {
            const msg = {
                cmd: 'deletePwd',
                data: {
                    username: ((self as any).webviewSession || {}).getItem('username')
                }
            };
            this.disAutoSet = false;
            this.vscodeService.postMessage(msg, () => {});
        }
        if (this.rememberPwd || this.autoLogin) {
            this.config.portAuto = [];
            this.config.portAuto.push({ user: portSet.username, remember: this.rememberPwd, auto: this.autoLogin });
            this.vscodeService.postMessage({
                cmd: 'saveConfig',
                data: {
                    data: JSON.stringify(this.config),
                    type: 'auto',
                },
            }, null);
        } else if (this.autoLoginUser === portSet.username) {
            this.config.portAuto = [];
            this.vscodeService.postMessage({
                cmd: 'saveConfig',
                data: {
                    data: JSON.stringify(this.config),
                    type: 'auto',
                },
            }, null);
        }
        portSet.changeLogin = false;
    }

    /**
     * 取消自动登录配置
     * @param portSet porset实例
     */
    public configCancel(portSet: PortsetComponent) {
        portSet.changeLogin = false;
        this.getLoginConfig(portSet);
    }

    /**
     * 打开自动登录配置
     * @param portSet porset实例
     */
    public modifyLogin(portSet: PortsetComponent) {
        portSet.changeLogin = true;
    }

    /**
     * 页面展示转换
     * @param portSet porset实例
     */
    showAutoSet(portSet: PortsetComponent) {
        if (this.rememberPwd) {
            portSet.rememberPwdSelect.selected = {
                label: portSet.i18n.common_term_yes,
                value: LABLE_YES
            };
        } else {
            portSet.rememberPwdSelect.selected = {
                label: portSet.i18n.common_term_no,
                value: LABLE_NO
            };
        }

        if (this.autoLogin) {
            portSet.autoLoginSelect.selected = {
                label: portSet.i18n.common_term_yes,
                value: LABLE_YES
            };
        } else {
            portSet.autoLoginSelect.selected = {
                label: portSet.i18n.common_term_no,
                value: LABLE_NO
            };
        }

    }

    /**
     * 联动获取Auto的设置
     * @param portSet porset实例
     */
    getAutoSet(portSet: PortsetComponent) {
        this.getConfigFlag(portSet);
        if (!this.rememberPwd) {
            this.autoLogin = false;
        }
        this.showAutoSet(portSet);
    }

    /**
     * 联动获取Remember的设置
     * @param portSet porset实例
     */
    getRememberSet(portSet: PortsetComponent) {
        this.getConfigFlag(portSet);
        if (this.autoLogin) {
            this.rememberPwd = true;
        }
        this.showAutoSet(portSet);
    }

    /**
     * 根据输入值映射flag
     * @param portSet porset实例
     */
    getConfigFlag(portSet: PortsetComponent) {
        this.rememberPwd = false;
        this.autoLogin = false;

        if (portSet.loginConfigForm.get('rememberPwdSelect').value.value) {
            this.rememberPwd = true;
        }
        if (portSet.loginConfigForm.get('autoLoginSelect').value.value) {
            this.autoLogin = true;
        }
    }
}
