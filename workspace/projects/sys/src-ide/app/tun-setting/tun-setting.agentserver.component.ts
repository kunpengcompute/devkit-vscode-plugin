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
export class AgentServerManager {
    public i18n: any;
    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    // 定义修改agent告警时间数变量
    public agentInput = false;
    public userNumsFlag = false;
    public finnaluserNum = 30;
    public currLang: any;
    public tunSet: TunsetComponent;
    spinnerValue = 30;
    /**
     * 修改agent告警时间------打开修改页面
     */
    public openNumChange() {
        this.agentInput = true;
        this.spinnerValue = this.finnaluserNum;
    }

    /**
     * 修改agent告警时间------提交确认修改agent告警时间
     */
    public changeNum(tunSet: TunsetComponent) {
        if (this.userNumsFlag) {
            return false;
        }
        if (this.spinnerValue === this.finnaluserNum) {
            this.agentInput = false;
            return true;
        }
        const param = {
            system_config: { CERT_ADVANCED_DAYS: this.spinnerValue },
        };
        const option = {
            url: `/config/system/`,
            params: param,
        };
        tunSet.vscodeService.put(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                this.finnaluserNum = this.spinnerValue;
                this.vscodeService.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
            } else {
                this.vscodeService.showInfoBox(this.i18n.tip_msg.edite_error, 'error');
            }
        });
        this.agentInput = false;
        return true;
    }

    /**
     *  查询agent告警时间
     */
    public showConfig() {
        this.agentInput = false;
        const option = {
            url: '/config/system/',
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = data.data.CERT_ADVANCED_DAYS;
            }
        });
    }
    /**
     * 修改agent告警时间------取消修改agent告警时间
     */
    public closeNumChange() {
        this.agentInput = false;
        this.userNumsFlag = false;
    }

    /**
     * 修改agent告警时间------校验agent告警时间是否输入正确
     */
    checkNums() {
        const spinnerValueTemp: any = this.spinnerValue;
        const reg = new RegExp(/^(?:[7-9]|[1-9]\d|180|[1][0-7][0-9])$/);
        this.userNumsFlag = !reg.test(spinnerValueTemp);
    }
}
