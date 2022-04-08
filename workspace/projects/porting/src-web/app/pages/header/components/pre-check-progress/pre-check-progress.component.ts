import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Subscription } from 'rxjs';
import {
    PortWorkerStatusService, I18nService, MytipService,
    MessageService, CommonService, AxiosService
} from '../../../../service';

const enum Status {
    PROGRESS_RUNNING_STATUS = '0x0d0501', // 任务扫描中
}
@Component({
    selector: 'app-pre-check-progress',
    templateUrl: './pre-check-progress.component.html',
    styleUrls: ['./pre-check-progress.component.scss']
})
export class PreCheckProgressComponent implements OnInit, OnDestroy {

    public i18n: any;
    constructor(
        private i18nService: I18nService,
        public Axios: AxiosService,
        private mytip: MytipService,
        private msgService: MessageService,
        private commonService: CommonService,
        public portWorkerStatusService: PortWorkerStatusService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    @Input() reportId: string;
    @Input() reportType: string;
    @Output() createSucc = new EventEmitter();

    private maxCount = 3; // 异常情况下最多轮询次数
    private curCount = 0; // 异常情况下轮询次数
    private getStatusTimer: any = null;
    private currLang = 'zh-cn';

    public situation = -1;
    public msgInfo = '';
    private cancels: any = [];
    private closeTaskSub: Subscription;
    private closeFlag = false;
    public progressStatus: string;  // 64位分析进度状态码

    ngOnInit() {
        this.currLang = sessionStorage.getItem('language');
        this.getStatus(this.reportId);
        this.closeTaskSub = this.msgService.getMessage().subscribe(message => {
            if (message.type === 'closeTaskMsg' && message.data.result.subType === 'PortingPreCheck') {
                this.Axios.axios.delete(`/portadv/tasks/migrationscan/${encodeURIComponent(this.reportId)}/`)
                    .then((resp: any) => {
                        const msg = this.currLang ? resp.infochinese : resp.info;
                        this.clearTimer();
                        while (this.cancels.length > 0) {
                            this.cancels.pop()();
                        }
                        this.closeFlag = true;
                        if (this.commonService.handleStatus(resp) === 0) {
                            this.createSucc.emit({
                              id: this.reportId,
                              type: 'PortingPreCheck',
                              state: 'stop_success',
                              msg });
                            return;
                        }
                        this.createSucc.emit({ id: this.reportId, type: 'PortingPreCheck', state: 'stop_failed', msg });
                    });
            }
        });
    }

    ngOnDestroy(): void {
        if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
    }

    public closeTask() {
        const resultMsg = {
            id: this.reportId,
            type: 'stopConfirm',
            subType: 'PortingPreCheck',
            state: 'prompt',
        };
        this.msgService.sendMessage({
            type: 'creatingResultMsg',
            data: resultMsg
        });
    }
    /**
     * 查询进度-64位环境迁移预检-编译预检-迁移预检
     */
    public getStatus(id: any) {
        // 进度条接口
        const CancelToken = axios.CancelToken;
        if (this.closeFlag) { return; }
        this.Axios.axios.get(`/task/progress/?task_type=5&task_id=${encodeURIComponent(id)}`, {
            cancelToken: new CancelToken(c1 => (this.cancels.push(c1)))
        }).then((data: any) => {
            this.progressStatus = data.status;
            if (this.commonService.handleStatus(data) === 0) {
                this.curCount = 0;
                if (Status.PROGRESS_RUNNING_STATUS === data.status
                    || this.portWorkerStatusService.progressWaitWorkerStatus === data.status) {
                    this.curCount = 0;
                    this.clearTimer();
                    this.msgInfo = data.data.scan_current_file;
                    this.situation = 5;
                    this.getStatusTimer = setTimeout(() => this.getStatus(id), 3000);
                } else if (data.data.status === 2) {
                    this.curCount = 0;
                    this.clearTimer();
                    if (data.data.scan_result === '') {
                        this.situation = 9;
                        this.msgInfo = this.i18n.common_term_pre_check_success_tip1;
                        this.createSucc.emit({
                            id: this.reportId,
                            type: 'PortingPreCheck',
                            state: 'success',
                            situation: 9,
                            msg: this.msgInfo
                        });
                        sessionStorage.setItem('situation', '9');
                        sessionStorage.setItem('msgInfo', this.msgInfo);
                        setTimeout(() => {
                            this.situation = -1;
                            sessionStorage.setItem('situation', '-1');
                        }, 3000);
                    } else {
                        this.msgInfo = this.formatCreatedId(data.data.task_name);
                        this.situation = 7;
                        sessionStorage.setItem('situation', '7');
                        sessionStorage.setItem('info', this.msgInfo);
                        const param = {
                            queryParams: {
                                created: this.msgInfo,
                                id: data.data.task_name,
                                result_path: Object.keys(data.data.scan_result),
                            }
                        };
                        this.createSucc.emit({
                            id: this.reportId,
                            type: 'PortingPreCheck',
                            state: 'success',
                            msg: this.i18n.common_term_pre_check_success_tip,
                            situation: 7,
                            data: param
                        });
                    }

                }
            } else if (this.commonService.handleStatus(data) === 1) {
                this.situation = -1;
                this.curCount = 0;
                this.clearTimer();
                this.msgInfo = data.data.status === 3
                  ? this.i18n.bit_operating_mode_check.err_info_3
                  : (
                    this.currLang === 'zh-cn' ? data.data.info_chinese : data.data.error_info
                  );
                this.situation = 6;
                this.createSucc.emit({
                  id: this.reportId,
                  type: 'PortingPreCheck',
                  state: 'failed',
                  situation: 6,
                  msg: this.msgInfo });
                sessionStorage.setItem('situation', '6');
                sessionStorage.setItem('info', this.msgInfo);
            } else {
                this.curCount++;
                if (this.curCount <= this.maxCount) {
                    this.clearTimer();
                    this.getStatusTimer = setTimeout(() => this.getStatus(id), 3000);
                } else {
                }
            }
            this.msgService.sendMessage({ type: 'CreatingPreCheckProgress', data: true });
        }).catch((error: any) => {
            this.curCount++;
            if (this.curCount <= this.maxCount) {
                this.clearTimer();
                this.getStatusTimer = setTimeout(() => this.getStatus(id), 3000);
            } else {
                this.msgService.sendMessage({ type: 'CreatingPreCheckProgress', data: false });
            }
        });
    }

    public closeModal() {
        sessionStorage.setItem('situation', '0');
        sessionStorage.setItem('info', '');
        this.situation = -1;
    }

    private formatCreatedId(data: any) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    private clearTimer() {
        if (this.getStatusTimer) {
            clearTimeout(this.getStatusTimer);
            this.getStatusTimer = null;
        }
    }

}
