import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { MessageService } from '../service/message.service';
import { PortWorkerStatus } from '../service/constant';

const enum LANGUAGE_TYPE {
    ZH = 0,
    EN = 1,
}

const enum PROCESS_STATE {
    PORT_PRECHECK = 5,
    PORT_CANCELPRECHECK = 12,
    NOT_SHOW = -1,
}

@Component({
    selector: 'app-webpack-situation',
    templateUrl: './webpack-situation.component.html',
    styleUrls: ['./webpack-situation.component.scss']
})

export class WebpackSituationComponent implements OnInit {
    @Input() situation: any;
    @Input() info: any;
    @Input() progessValue: any;
    @Input() barWidth: any;
    @Input() packResult: any;
    @Input() progressStatus: string;
    public i18n: any;
    public currLang: any;
    public progressWaitWorkerStatus: string;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private msgService: MessageService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    ngOnInit() {
        this.progressWaitWorkerStatus = PortWorkerStatus.PROGRESS_WAIT_WORKER_STATUS;
        // 实时接收64位预检任务结束消息
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'getTaskIdMsg') {
                this.confirmEndTask();
            }
        });
    }

    /**
     * 结束64位预检任务
     */
    public endPreCheckTask() {
        this.situation = PROCESS_STATE.PORT_CANCELPRECHECK;
    }

    /**
     * 确认结束64位预检任务
     */
    public confirmEndTask() {
        this.msgService.sendMessage({ type: 'closePreCheckTaskMsg', value: 'closePreCheckTaskMsg' });
        this.situation = PROCESS_STATE.NOT_SHOW;
    }

    /**
     * 取消结束64位预检任务
     */
    public cancelEndPreCheckTask() {
        this.situation = PROCESS_STATE.PORT_PRECHECK;
    }

    /**
     * 结束64位预检任务标题
     */
    public stopMsgTip() {
        return this.i18nService.I18nReplace(this.i18n.plugins_porting_close_task_confirm_tip,
            { 0: this.i18n.plugins_porting_precheck_label });
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
