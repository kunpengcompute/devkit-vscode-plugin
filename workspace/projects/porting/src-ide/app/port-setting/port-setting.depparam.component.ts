import { VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';
import { PortsetComponent } from './port-setting.component';
import { MessageService } from '../service/message.service';

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}

const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

// 下拉框选择参数
const LABLE_YES = 1;
const LABLE_NO = 0;

export class DepParamSet {
    private static LINE_RADIX = 10;
    public static instance: DepParamSet;
    public errorpwdinfo: any;
    public errorpwdFlag = false;
    public displayset = false;
    public currLang: any;
    public changeDep = false;
    public cLineFlag = false;
    public asmLineFlag = false;

    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private messageServe: MessageService,
    ) {
        DepParamSet.instance = this;
    }

    /**
     *  查询扫描参数设置数据
     */
    public showConfigMask(portset: PortsetComponent) {
        this.errorpwdFlag = false;
        const option = {
            url: '/users/' + encodeURIComponent(portset.loginUserId) + '/config/'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                portset.configData.keepGoing.selected =
                    portset.configData.keepGoing.options[Number(!data.data.keep_going)];
                portset.configData.pMonthFlag.selected =
                    portset.configData.pMonthFlag.options[Number(!data.data.p_month_flag)];
                portset.configData.cLine.value = data.data.c_line;
                portset.configData.asmLine.value = data.data.asm_line;
            }
        });
    }

    /**
     * 开始修改扫描参数
     */
    public modifyDepParam() {
        this.displayset = true;
        this.errorpwdFlag = false;
        this.changeDep = true;
    }

    // C/C++代码前移工作量异常判断
    cLineCheck(portset: PortsetComponent) {
        const reg = new RegExp(/^[1-9]\d{0,4}$/);
        this.cLineFlag = !reg.test(portset.configData.cLine.value);
        if (!portset.configData.cLine.value.trim()) {
            this.cLineFlag = true;
        }
    }

    // 汇编代码代码前移工作量异常判断
    asmLineCheck(portset: PortsetComponent) {
        const reg = new RegExp(/^[1-9]\d{0,4}$/);
        this.asmLineFlag = !reg.test(portset.configData.asmLine.value);
        if (!portset.configData.asmLine.value.trim()) {
            this.asmLineFlag = true;
        }
    }
    /**
     * 确认修改扫描参数
     */
    public configOk(portset: PortsetComponent) {
        if (!portset.userPwd) {
            this.errorpwdFlag = true;
            this.errorpwdinfo = portset.i18n.common_term_no_password;
            return false;
        }
        const params = {
            password: portset.configForm.get('userPwd').value,
            keep_going: portset.configForm.get('keepGoing').value.value,
            c_line: parseInt(portset.configForm.get('cLine').value, DepParamSet.LINE_RADIX),
            asm_line: parseInt(portset.configForm.get('asmLine').value, DepParamSet.LINE_RADIX),
            p_month_flag: portset.configForm.get('pMonthFlag').value.value

        };
        const option = {
            url: '/users/' + encodeURIComponent(portset.loginUserId) + '/config/',
            params
        };
        this.vscodeService.post(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.modifyDepParaSuc(data);
                portset.configCancel();
                portset.userPwd = '';
            } else {
                this.errorpwdFlag = true;
                if (portset.currLang === LANGUAGE_TYPE.ZH) {
                    this.errorpwdinfo = data.infochinese;
                } else {
                    this.errorpwdinfo = data.info;
                }
            }
        });
        // 判断各个参数是否显示隐藏
        let isChange = false;
        if (
            ((self as any).webviewSession || {}).getItem('pMonthFlag') !==
                portset.configForm.get('pMonthFlag').value.value.toString()
            || ((self as any).webviewSession || {}).getItem('cLine') !==
                portset.configData.cLine.value.toString()
            || ((self as any).webviewSession || {}).getItem('asmLine') !==
                portset.configData.asmLine.value.toString()
        ) {
            isChange = true;
        } else {
            isChange = false;
        }
        this.messageServe.sendMessage({
            type: 'isConfigChange',
            value: isChange
        });

        ((self as any).webviewSession || {}).setItem('keepGoing', portset.configForm.get('keepGoing').value.value);
        ((self as any).webviewSession || {}).setItem('cLine', portset.configData.cLine.value);
        ((self as any).webviewSession || {}).setItem('asmLine', portset.configData.asmLine.value);
        ((self as any).webviewSession || {}).setItem('pMonthFlag', portset.configForm.get('pMonthFlag').value.value);
        return true;
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
     * 与vscode的交互
     */
    modifyDepParaSuc(data: any) {
        if (data.status === STATUS.SUCCESS) {
            this.showMessageByLang(data, 'info');
        } else {
            this.showMessageByLang(data, 'error');
        }
    }

    /**
     * 取消修改扫描参数
     */
    public configCancel(portset: PortsetComponent) {
        this.displayset = false;
        this.errorpwdFlag = false;
        this.cLineFlag = false;
        this.asmLineFlag = false;
        portset.userPwd = '';
        this.changeDep = false;
        portset.showConfigMask();
    }

    /**
     * 校验扫描参数密码
     */
    depparamPwdCheck() {
        this.errorpwdFlag = false;
    }
}
