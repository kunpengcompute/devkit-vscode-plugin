import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { TunsetComponent } from './tun-setting.component';

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
    getLoginConfig(tunSet: TunsetComponent) {
        // 获取配置文件中的登录配置信息
        const msgData = { cmd: 'readConfig' };
        this.vscodeService.postMessage(msgData, (data: any) => {
            this.config = data;
            this.rememberPwd = false;
            this.autoLogin = false;
            this.disAutoSet = false;

            if (this.config.autoLoginConfig.length > 0) {
                this.autoLoginUser = this.config.autoLoginConfig[0].user;
                this.rememberConfig = this.config.autoLoginConfig[0].remember;
                this.autoConfig = this.config.autoLoginConfig[0].auto;
            }

            if (this.autoLoginUser && this.autoLoginUser === tunSet.username) {
                this.rememberPwd = this.rememberConfig;
                this.autoLogin = this.autoConfig;
                this.disAutoSet = true;
            }
            this.showAutoSet(tunSet);
        });
    }

    /**
     * 将记住密码自动登录配置写入配置文件
     */
    saveConfig(tunSet: TunsetComponent) {
        this.getConfigFlag(tunSet);
        if (this.rememberPwd || this.autoLogin) {
            this.config.autoLoginConfig = [];
            this.config.autoLoginConfig.push({
                user: tunSet.username,
                remember: this.rememberPwd,
                auto: this.autoLogin
            });
            this.vscodeService.postMessage({
                cmd: 'saveConfig',
                data: {
                    data: JSON.stringify(this.config),
                    type: 'auto',
                },
            }, null);
        } else if (this.autoLoginUser === tunSet.username) {
            this.config.autoLoginConfig = [];
            this.vscodeService.postMessage({
                cmd: 'saveConfig',
                data: {
                    data: JSON.stringify(this.config),
                    type: 'auto',
                },
            }, null);
        }
        tunSet.changeLogin = false;
    }

    /**
     * 取消自动登录配置
     * @param tunSet porset实例
     */
    public configCancel(tunSet: TunsetComponent) {
        tunSet.changeLogin = false;
        this.getLoginConfig(tunSet);
    }

    /**
     * 打开自动登录配置
     * @param tunSet porset实例
     */
    public modifyLogin(tunSet: TunsetComponent) {
        tunSet.changeLogin = true;
    }

    /**
     * 页面展示转换
     * @param tunSet porset实例
     */
    showAutoSet(tunSet: TunsetComponent) {
        if (this.rememberPwd) {
            tunSet.rememberPwdSelect.selected = {
                label: tunSet.i18n.plugins_common_term_yes,
                value: LABLE_YES
            };
        } else {
            tunSet.rememberPwdSelect.selected = {
                label: tunSet.i18n.plugins_common_term_no,
                value: LABLE_NO
            };
        }

        if (this.autoLogin) {
            tunSet.autoLoginSelect.selected = {
                label: tunSet.i18n.plugins_common_term_yes,
                value: LABLE_YES
            };
        } else {
            tunSet.autoLoginSelect.selected = {
                label: tunSet.i18n.plugins_common_term_no,
                value: LABLE_NO
            };
        }

    }

    /**
     * 联动获取Auto的设置
     * @param tunSet porset实例
     */
    getAutoSet(tunSet: TunsetComponent) {
        this.getConfigFlag(tunSet);
        if (!this.rememberPwd) {
            this.autoLogin = false;
        }
        this.showAutoSet(tunSet);
    }

    /**
     * 联动获取Remember的设置
     * @param tunSet porset实例
     */
    getRememberSet(tunSet: TunsetComponent) {
        this.getConfigFlag(tunSet);
        if (this.autoLogin) {
            this.rememberPwd = true;
        }
        this.showAutoSet(tunSet);
    }

    /**
     * 根据输入值映射flag
     * @param tunSet porset实例
     */
    getConfigFlag(tunSet: TunsetComponent) {
        this.rememberPwd = false;
        this.autoLogin = false;

        if (tunSet.loginConfigForm.get('rememberPwdSelect').value.value) {
            this.rememberPwd = true;
        }
        if (tunSet.loginConfigForm.get('autoLoginSelect').value.value) {
            this.autoLogin = true;
        }
    }
}
