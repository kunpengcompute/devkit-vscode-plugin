import { HTTP_STATUS_CODE, VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';

/**
 * 返回状态
 */
const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}
/**
 * 语言枚举
 */
const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}
export class PwdExpiredManager {
    public i18n: any;
    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    // 定义修改密码过期时间数变量
    public pwdInput = false;
    public userNumsFlag = false;
    public finnaluserNum = 90;
    public currLang: any;
    public spinnerValue = 90;
    /**
     * 修改密码过期时间------打开修改页面
     */
    public openNumChange() {
        this.pwdInput = true;
        this.spinnerValue = this.finnaluserNum;
    }

    /**
     * 修改密码过期时间------提交确认修改密码过期时间
     */
    public changeNum() {
        if (this.userNumsFlag) {
            return false;
        }
        if (this.spinnerValue === this.finnaluserNum) {
            this.pwdInput = false;
            return true;
        }
        const params = {
            user_config: { PASSWORD_EXPIRATION_TIME: this.spinnerValue },
        };
        const option = {
            url: `/config/userconf/`,
            params,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };

        this.vscodeService.put(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = this.spinnerValue;
                this.vscodeService.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
            } else {
                this.vscodeService.showInfoBox(this.i18n.tip_msg.edite_error, 'error');
            }
        });

        this.pwdInput = false;
        return true;
    }

    /**
     *  查询密码过期时间
     */
    public showConfig() {
        this.pwdInput = false;
        const option = {
            url: '/config/userconf/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = data.data.PASSWORD_EXPIRATION_TIME;
            }
        });
    }
    /**
     * 修改密码过期时间------取消修改密码过期时间
     */
    public closeNumChange() {
        this.pwdInput = false;
        this.userNumsFlag = false;
    }

    /**
     * 修改密码过期时间------校验a密码过期时间是否输入正确
     */
    checkNums() {
        const spinnerValueTemp: any = this.spinnerValue;
        const reg = new RegExp(/^(?:[7-9]|[1-8]\d|90)$/);
        this.userNumsFlag = !reg.test(spinnerValueTemp);
    }
}
