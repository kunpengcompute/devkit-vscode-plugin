import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Subscription } from 'rxjs';
import {
  PortWorkerStatusService, AxiosService, I18nService,
  MessageService, CommonService
} from '../../../../service';

const enum Status {
    PROGRESS_RUNNING_STATUS = '0x0d0202', // 任务正在运行中
    PROGRESS_FINISH_STATUS = '0x0d0207',  // 任务已执行完成
}
@Component({
    selector: 'app-source-code-progress',
    templateUrl: './source-code-progress.component.html',
    styleUrls: ['./source-code-progress.component.scss']
})
export class SourceCodeProgressComponent implements OnInit, OnDestroy {

    constructor(
        private Axios: AxiosService,
        public i18nService: I18nService,
        private msgService: MessageService,
        private commonService: CommonService,
        public portWorkerStatusService: PortWorkerStatusService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    @Input() reportId: any;
    @Output() createSucc = new EventEmitter();

    public formatReport: string;

    public isSuccess = false; // 是否显示创建成功弹框
    public barWidth = 0;
    public totalBar = 440; // 进度条总宽
    public progess = 0; // 目前数据大小
    public totalProgress = 100;  // 总的数据大小
    public progessValue: string;  // 显示的进度值
    public phaseValue: string;  // 显示的进度值
    public i18n: any;

    private timer: any = null;
    private cancels: any = [];
    private closeTaskSub: Subscription;
    public progressStatus: string;  // 分析进度状态码

    ngOnInit() {
        this.getReport();
        this.closeTaskSub = this.msgService.getMessage().subscribe(message => {
            if (message.type === 'closeTaskMsg' && message.data.result.subType === 'SourceCode') {
                this.Axios.axios.delete(`/portadv/tasks/${encodeURIComponent(this.reportId)}/`)
                    .then((resp: any) => {
                        const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                        while (this.cancels.length > 0) {
                            this.cancels.pop()();
                        }
                        if (this.commonService.handleStatus(resp) === 0) {
                            this.createSucc.emit({ id: this.reportId, type: 'SourceCode', state: 'stop_success', msg });
                            return;
                        }
                        this.createSucc.emit({ id: this.reportId, type: 'SourceCode', state: 'stop_failed', msg });
                    });
            }
        });
    }
    getReport() {
        this.Axios.axios.defaults.headers.notit = true;
        const CancelToken = axios.CancelToken;
        this.Axios.axios.get(`/task/progress/?task_type=0&task_id=${encodeURIComponent(this.reportId)}`, {
            cancelToken: new CancelToken(c1 => (this.cancels.push(c1)))
        })
        .then((resp: any) => {
            this.progressStatus = resp.status;
            if (this.commonService.handleStatus(resp) === 0) {
                this.progess = resp.data.progress;
                this.formatReport = this.formatCreatedId(this.reportId);
                this.progessValue = this.progess + '%';
                this.phaseValue = resp.data.phase;
                this.barWidth = Math.floor(this.progess / this.totalProgress * this.totalBar);

                // resp.data.status: 1：运行中，255: 等待中
                if (Status.PROGRESS_RUNNING_STATUS === resp.status
                    || this.portWorkerStatusService.progressWaitWorkerStatus === resp.status) {
                    // 任务等待中或者任务运行中 轮询查询
                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }
                    this.msgService.sendMessage({
                        type: 'creatingSourceCodeProgress',
                        data: true
                    });
                    this.timer = setTimeout(() => { this.getReport(); }, 1000);
                } else {
                    clearTimeout(this.timer);
                    this.timer = null;
                    this.isSuccess = true;
                    const flag = Object.keys(resp.data.portingresult).length > 0;
                    const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
                    setTimeout(() => {
                        this.createSucc.emit({ id: this.reportId, type: 'SourceCode', state: 'success', msg, flag });
                        this.msgService.sendMessage({ type: 'creatingSourceCodeProgress', data: false });
                    }, 3000);
                }
            } else {
                const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
                this.createSucc.emit({ id: this.reportId, type: 'SourceCode', state: 'failed', msg });
                this.msgService.sendMessage({ type: 'creatingSourceCodeProgress', data: true });
            }
        })
        .catch((err: any) => {
            this.createSucc.emit({ id: this.reportId, type: 'SourceCode', state: 'failed', msg: '' });
            this.msgService.sendMessage({ type: 'creatingSourceCodeProgress', data: false });
        });
        this.Axios.axios.defaults.headers.notit = false;
    }

    public closeTask() {
        const resultMsg = {
            id: this.reportId,
            type: 'stopConfirm',
            subType: 'SourceCode',
            state: 'prompt',
        };
        this.msgService.sendMessage({
            type: 'creatingResultMsg',
            data: resultMsg
        });
    }

    ngOnDestroy(): void {
        if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
    }


    formatCreatedId(data: any) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }
}
