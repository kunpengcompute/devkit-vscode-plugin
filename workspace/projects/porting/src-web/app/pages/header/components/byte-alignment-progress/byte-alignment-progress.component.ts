import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  PortWorkerStatusService, AxiosService, I18nService,
  MytipService, MessageService, CommonService
} from '../../../../service';

const enum Status {
    PROGRESS_RUNNING_STATUS = '0x0d0401', // 任务扫描中
}
@Component({
    selector: 'app-byte-alignment-progress',
    templateUrl: './byte-alignment-progress.component.html',
    styleUrls: ['./byte-alignment-progress.component.scss']
})
export class ByteAlignmentProgressComponent implements OnInit, OnDestroy {

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
    private curCountByteAlign = 0; // 异常情况下轮询次数-对齐检查
    private getStatusTimerByteAlign: any = null;
    private currLang: string;

    public situation = -1;
    public msgInfo = '';
    private cancels: any = [];
    private closeTaskSub: Subscription;

    public barWidth = 0;
    public totalBar = 440; // 进度条总宽
    public progress = 0; // 目前数据大小
    public totalProgress = 100;  // 总的数据大小
    public progressValue: any;  // 显示的进度值
    public phaseValue: string;  // 显示的进度值
    public progressStatus: string;  // 分析进度状态码

    ngOnInit() {
        this.currLang = sessionStorage.getItem('language');
        this.getStatusDQJC(this.reportId);
        this.closeTaskSub = this.msgService.getMessage().subscribe(message => {
            // 终止功能接口delete
            if (message.type === 'closeTaskMsg' && message.data.result.subType === 'ByteAlignment') {
                this.Axios.axios
                    .delete(`/portadv/tasks/migration/bytealignment/task/${encodeURIComponent(this.reportId)}/`)
                      .then((resp: any) => {
                        const msg = this.currLang ? resp.infochinese : resp.info;
                        this.clearTimerByteAlign();
                        while (this.cancels.length > 0) {
                            this.cancels.pop()();
                        }
                        if (this.commonService.handleStatus(resp) === 0) {
                            this.createSucc
                                .emit({ id: this.reportId, type: 'ByteAlignment', state: 'stop_success', msg });
                            return;
                        }
                        this.createSucc.emit({ id: this.reportId, type: 'ByteAlignment', state: 'stop_failed', msg });
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
            subType: 'ByteAlignment',
            state: 'prompt',
        };
        this.msgService.sendMessage({
            type: 'creatingResultMsg',
            data: resultMsg
        });
    }
    /**
     * 查询进度-64位环境迁移预检-结构类型定义对齐检查-对齐检查
     */
    public getStatusDQJC(id: any) {
        // 进度条接口
        this.Axios.axios.get(`/task/progress/?task_type=6&task_id=${encodeURIComponent(id)}`).then((data: any) => {
            this.progressStatus = data.status;
            if (this.commonService.handleStatus(data) === 0) {
                this.curCountByteAlign = 0;
                if (Status.PROGRESS_RUNNING_STATUS === data.status
                    || this.portWorkerStatusService.progressWaitWorkerStatus === data.status) {
                    this.progress = data.data.progress;
                    this.progressValue = this.progress + '%';
                    this.barWidth = Math.floor(this.progress / this.totalProgress * this.totalBar);
                    this.curCountByteAlign = 0;
                    this.clearTimerByteAlign();
                    this.msgInfo = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                    this.situation = 5;
                    this.getStatusTimerByteAlign = setTimeout(() => this.getStatusDQJC(id), 3000);
                } else if (data.data.status === 2) {
                    this.curCountByteAlign = 0;
                    this.clearTimerByteAlign();
                    if (data.data.scan_result === '' || data.data.scan_result === []) {
                        this.situation = 9;
                        this.msgInfo = this.i18n.common_term_byte_check_success_tip1;
                        this.createSucc.emit({
                            id: this.reportId,
                            type: 'ByteAlignment',
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
                        this.msgInfo = this.formatCreatedId(data.data.task_id);
                        this.situation = 7;
                        sessionStorage.setItem('situation', '7');
                        sessionStorage.setItem('info', this.msgInfo);
                        const param = {
                            queryParams: {
                                created: this.msgInfo,
                                id: data.data.task_id,
                                result_path: data.data.scan_result,
                            }
                        };
                        this.createSucc.emit({
                            id: this.reportId,
                            type: 'ByteAlignment',
                            state: 'success',
                            msg: this.i18n.common_alignment_check.statusSuccess,
                            situation: 7,
                            data: param
                        });
                    }

                } else { // 源代码不需要修改情况
                    this.situation = -1;
                    this.clearTimerByteAlign();
                    this.msgInfo = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                    this.situation = 9;
                    this.createSucc.emit({
                      id: this.reportId,
                      type: 'ByteAlignment',
                      state: 'success',
                      situation: 9,
                      msg: this.msgInfo });
                    sessionStorage.setItem('situation', '9');
                    sessionStorage.setItem('info', this.msgInfo);
                }
            } else if (this.commonService.handleStatus(data) === 1) {
                this.situation = -1;
                this.curCountByteAlign = 0;
                this.clearTimerByteAlign();
                if (this.currLang === 'zh-cn') {
                    this.msgInfo = data.infochinese;
                } else {
                    this.msgInfo = data.info;
                }
                this.situation = 6;
                this.createSucc.emit({
                  id: this.reportId,
                  type: 'ByteAlignment',
                  state: 'failed',
                  situation: 6,
                  msg: this.msgInfo });
                sessionStorage.setItem('situation', '6');
                sessionStorage.setItem('info', this.msgInfo);
            } else {
                this.curCountByteAlign++;
                if (this.curCountByteAlign <= this.maxCount) {
                    this.clearTimerByteAlign();
                    this.getStatusTimerByteAlign = setTimeout(() => this.getStatusDQJC(id), 3000);
                } else {
                }
            }
            this.msgService.sendMessage({ type: 'CreatingByteAlignmentProgress', data: true });
        }).catch((error: any) => {
            this.curCountByteAlign++;
            if (this.curCountByteAlign <= this.maxCount) {
                this.clearTimerByteAlign();
                this.getStatusTimerByteAlign = setTimeout(() => this.getStatusDQJC(id), 3000);
            } else {
                this.msgService.sendMessage({ type: 'CreatingByteAlignmentProgress', data: false });
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

    private clearTimerByteAlign() {
        if (this.getStatusTimerByteAlign) {
            clearTimeout(this.getStatusTimerByteAlign);
            this.getStatusTimerByteAlign = null;
        }
    }

}
