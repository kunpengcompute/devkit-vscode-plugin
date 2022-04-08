import { TunsetComponent } from './tun-setting.component';
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
export class WebServerManager {
    public i18n: any;
    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    // 定义修改web告警时间数变量
    public webInput = false;
    public userNumsFlag = false;
    public finnaluserNum = 30;
    public currLang: any;
    public tunSet: TunsetComponent;
    spinnerValue = 30;
    /**
     * 修改web告警时间------打开修改页面
     */
    public openNumChange() {
        this.webInput = true;
        this.spinnerValue = this.finnaluserNum;
    }

    /**
     * 修改web告警时间------提交确认修改web告警时间
     */
    public changeNum(tunSet: TunsetComponent) {
        if (this.userNumsFlag) {
            return false;
        }
        if (this.spinnerValue === this.finnaluserNum) {
            this.webInput = false;
            return true;
        }
        const param = {
            user_config: { CERT_ADVANCED_DAYS: this.spinnerValue },
        };
        const option = {
            url: `/config/userconf/`,
            params: param,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        tunSet.vscodeService.put(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = this.spinnerValue;
                this.vscodeService.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
            } else {
                this.vscodeService.showInfoBox(this.i18n.tip_msg.edite_error, 'error');
            }
        });
        this.webInput = false;
        return true;
    }

    /**
     *  查询web告警时间
     */
    public showConfig() {
        this.webInput = false;
        const option = {
            url: '/config/userconf/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = data.data.CERT_ADVANCED_DAYS;
            }
        });
    }
    /**
     * 修改web告警时间------取消修改web告警时间
     */
    public closeNumChange() {
        this.webInput = false;
        this.userNumsFlag = false;
    }

    /**
     * 修改web告警时间------校验web告警时间是否输入正确
     */
    checkNums() {
        const spinnerValueTemp: any = this.spinnerValue;
        const reg = new RegExp(/^(?:[7-9]|[1-9]\d|180|[1][0-7][0-9])$/);
        this.userNumsFlag = !reg.test(spinnerValueTemp);
    }
}
