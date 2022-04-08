import { SystemSettingComponent } from './system-setting/system-setting.component';
import { VscodeService } from '../service/vscode.service';
const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}
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
     * @param portSet port-setting实例
     */
    public changeNum(portSet: SystemSettingComponent) {
        if (this.finnaluserNum === this.spinnerValue){
            portSet.showInfoBox(portSet.i18n.system_setting.info, 'warn');
            this.closeNumChange();
            return false;
        }

        const param = {
            new_timeout_configuration: Number(this.spinnerValue)
        };
        const option = {
            url: `/admin/timeout/`,
            params: param
        };
        portSet.vscodeService.post(option, (data: any) => {
            if (data.status === 0) {
                this.finnaluserNum = this.spinnerValue;
            }
            portSet.modifyDepParaSuc(data);
        });
        this.timeInput = false;
        return true;
    }
    /**
     *  查询超时时间
     */
    public showConfig() {
        this.timeInput = false;
        const option = {
            url: '/admin/timeout/'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.finnaluserNum = data.data.timeout_configuration;

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
        const reg = new RegExp(/^(?:[1-9]\d|240|[1][0-9][0-9]|[2][0-3][0-9])$/);
        this.userNumsFlag = !reg.test(spinnerValueTemp);
    }



}
