import { TunsetComponent } from './tun-setting.component';
import { HTTP_STATUS_CODE, VscodeService } from '../service/vscode.service';
export class TimeOutManager {
    // 静态实例常量
    constructor(
        public vscodeService: VscodeService,
    ) {

    }
    // 定义修改超时时间数变量
    public timeInput = false;
    public userNumsFlag = false;
    public finnaluserNum = 30;
    public currLang: any;
    public tunSet: TunsetComponent;
    spinnerValue = 30;
    /**
     * 修改超时时间------打开修改页面
     */
    public openNumChange() {
        this.timeInput = true;
        this.spinnerValue = this.finnaluserNum;
    }

    /**
     * 修改超时时间------提交确认修改超时时间
     */
    public changeNum(tunSet: TunsetComponent) {
        if (this.userNumsFlag) {
            return false;
        }
        if (this.spinnerValue === this.finnaluserNum) {
            this.timeInput = false;
            return true;
        }
        const param = {
            user_config: { USER_TIMEOUT: this.spinnerValue },
        };
        const option = {
            url: `/config/userconf/`,
            params: param,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        tunSet.vscodeService.put(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = this.spinnerValue;
            }
            this.modifySuc(data, tunSet);
        });
        this.timeInput = false;
        return true;
    }
    /**
     *  与vscode的交互
     */
    modifySuc(data: any, tunSet: any) {
        if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
            this.showMessageByLang(data, 'info', tunSet);
        } else {
            this.showMessageByLang(data, 'error', tunSet);
        }
    }
    /**
     * 发送消息中英文判断
     */
    showMessageByLang(data: any, type: any, tunSet: any) {
        if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
            this.vscodeService.showInfoBox(tunSet.changeMinNumsTips, 'info');
        } else {
            this.vscodeService.showInfoBox(data.message, type);
        }
    }

    /**
     *  查询超时时间
     */
    public showConfig() {
        this.timeInput = false;
        const option = {
            url: '/config/userconf/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = data.data.USER_TIMEOUT;
            }
        });
    }
    /**
     * 修改超时时间------取消修改超时时间
     */
    public closeNumChange() {
        this.timeInput = false;
        this.userNumsFlag = false;
    }

    /**
     * 修改超时时间------校验超时时间是否输入正确
     */
    checkNums() {
        const spinnerValueTemp: any = this.spinnerValue;
        const reg = new RegExp(/^(?:[1-9][0-9]|1[0-9][0-9]|2[0-3][0-9]|240)$/);
        this.userNumsFlag = !reg.test(spinnerValueTemp);
    }
}
