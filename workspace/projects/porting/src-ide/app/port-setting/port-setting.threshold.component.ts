import { VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';
import { PortsetComponent } from './port-setting.component';

// 阈值设置初始值设置
const MIN_THRESHOLD_VALUE = 20;
const MAX_THRESHOLD_VALUE = 30;
const MIN_REPORT_VALUE = 1;
const MAX_REPORT_VALUE = 50;

// 结果状态
const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}

const enum LANGUAGE_TYPE {
    ZH = 0,
    EN = 1,
}

export class ThresholdSet {
    public static instance: ThresholdSet;
    minValue = MIN_THRESHOLD_VALUE;
    maxValue = MAX_THRESHOLD_VALUE;
    public dangerousnumsFlag = false;
    public safenumsFlag = false;
    public topLarge = false;
    reportmin = MIN_REPORT_VALUE;
    reportmax = MAX_REPORT_VALUE;
    safenum = MIN_THRESHOLD_VALUE;
    dangerousnum = MAX_THRESHOLD_VALUE;
    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        ThresholdSet.instance = this;
    }

    public currLang: any;

    /**
     * 展示历史报告阈值设置
     */
    showReportMask() {
        const option = {
            url: '/portadv/tasks/histasknums/'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.safenum = data.data.safenums;
                this.dangerousnum = data.data.dangerousnums;
            }
        });
    }

    /**
     * 修改历史报告阈值
     */
    public changeReport(portset: PortsetComponent) {
        portset.changeRe = true;
        this.minValue = this.safenum;
        this.maxValue = this.dangerousnum;
    }

    /**
     * 取消修改历史报告阈值
     */
    changeReportCancel(portset: PortsetComponent) {
        portset.changeRe = false;
        this.dangerousnumsFlag = false;
        this.safenumsFlag = false;
        this.showReportMask();
    }

    /**
     * 成功修改历史报告阈值设置
     */
    public reportOk(portset: PortsetComponent) {
        if (this.safenum === this.minValue && this.maxValue === this.dangerousnum){
            this.showInfoBox(portset.i18n.system_setting.info, 'warn');
            this.changeReportCancel(portset);
            return;
        }
        if (this.safenumsFlag || this.dangerousnumsFlag) {
            return;
        }
        const param = {
            safenums: Number(this.minValue),
            dangerousnums: Number(this.maxValue)
        };
        const option = {
            url: '/portadv/tasks/modifyhistasknums/',
            params: param
        };
        // 历史报告阈值修改成功，Vscode交互
        this.vscodeService.post(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.vscodeService.postMessage({
                    cmd: 'modifyThreshold',
                    data: {
                        safenums: this.minValue,
                        dangerousnums: this.maxValue
                    }
                }, null);
                this.safenum = this.minValue;
                this.dangerousnum = this.minValue;
            } else {
                this.showMessageByLang(data, 'error');
            }
            this.showReportMask();
        });
        portset.changeRe = false;
    }

    // 发送消息中英文判断
    showMessageByLang(data: any, type: any) {
        this.currLang = I18nService.getLang();
        if (this.currLang === LANGUAGE_TYPE.ZH) {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }

    // 发送消息给vscode, 右下角弹出提醒框
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 报告提示阈值异常判断
     */
    safenumsCheck() {
        let minValueTemp: any = this.minValue;
        let maxValueTemp: any = this.maxValue;
        this.safenumsFlag = false;
        this.topLarge = false;
        const reportreg = new RegExp(/(^[1-9]\d*$)/);

        // 安全值非数值检验
        this.safenumsFlag = !reportreg.test(minValueTemp);

        if (!this.safenumsFlag) {
            minValueTemp = Number(minValueTemp);
            maxValueTemp = Number(maxValueTemp);
            if (minValueTemp >= this.reportmin && minValueTemp < this.reportmax) {
                if (maxValueTemp <= minValueTemp && maxValueTemp !== 0) {
                    this.topLarge = true;
                }
            } else {
                this.safenumsFlag = true;
            }
        } else if (minValueTemp === '') {
            this.safenumsFlag = true;
        }
    }

    /**
     * 报告最大阈值异常判断
     */
    dangerousnumsCheck() {

        let minValueTemp: any = this.minValue;
        let maxValueTemp: any = this.maxValue;
        this.dangerousnumsFlag = false;
        this.topLarge = false;
        const reportreg = new RegExp(/(^[1-9]\d*$)/);

        // 危险值非数值校验
        this.dangerousnumsFlag = !reportreg.test(maxValueTemp);

        // 危险值异常校验
        if (!this.dangerousnumsFlag) {
            minValueTemp = Number(minValueTemp);
            maxValueTemp = Number(maxValueTemp);
            if (maxValueTemp > this.reportmin && maxValueTemp <= this.reportmax) {
                if (maxValueTemp <= minValueTemp) {
                    this.topLarge = true;
                }
            } else {
                this.dangerousnumsFlag = true;
            }
        } else if (maxValueTemp === '') {
            this.dangerousnumsFlag = true;
        }
    }

}
