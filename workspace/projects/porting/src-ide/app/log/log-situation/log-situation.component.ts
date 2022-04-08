import { Component, OnInit, Input, Output, TemplateRef, SimpleChanges, OnChanges } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
import { MytipService } from '../../service/mytip.service';
import { TiModalService } from '@cloud/tiny3';
import { MessageService } from '../../service/message.service';

const enum LANGUAGE_TYPE {
    ZH = 0,
    EN = 1,
}

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}

const enum PROCESS_STATE {
    PORT_RUNLOG = 5,
    PORT_CANCELRUNLOG = 12,
    NOT_SHOW = -1,
}

@Component({
    selector: 'app-log-situation',
    templateUrl: './log-situation.component.html',
    styleUrls: ['./log-situation.component.scss']
})

export class LogSituationComponent implements OnInit {
    @Input() situation: any;
    @Input() info: any;
    public i18n: any;
    public currLang: any;
    stopRunLogFlag: boolean;
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public mytip: MytipService,
        private tiModal: TiModalService,
        private msgService: MessageService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    ngOnInit() {
    }

    /**
     * 结束运行日志任务
     */
    public endRunLogTask() {
        this.situation = PROCESS_STATE.PORT_CANCELRUNLOG;
    }

    /**
     * 确认结束运行日志任务
     */
    public confirmEndTask() {
        this.msgService.sendMessage({ type: 'closeRunLogTaskMsg', value: 'closeRunLogTaskMsg' });
        this.situation = PROCESS_STATE.NOT_SHOW;
    }

    /**
     * 取消结束运行日志任务
     */
    public cancelEndRunLogTask() {
        this.situation = PROCESS_STATE.PORT_RUNLOG;
    }

    /**
     * 结束运行日志任务标题
     */
    public stopMsgTip() {
        return this.i18nService.I18nReplace(this.i18n.plugins_porting_close_task_confirm_tip,
            { 0: this.i18n.plugins_porting_log_label });
    }

    /**
     * 发送消息中英文判断
     * @param data 响应数据
     * @param type 响应类型
     */
    showMessageByLang(data: any, msg: any, type: any) {
        this.currLang = I18nService.getLang();
        if (this.currLang === LANGUAGE_TYPE.ZH) {
            this.showInfoBox(data.infochinese + msg, type);
        } else {
            this.showInfoBox(data.info + msg, type);
        }
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info 响应数据
     * @param type 响应数据
     */
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

}
