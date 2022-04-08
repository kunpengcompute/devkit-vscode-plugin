import { Component, OnInit, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-micarch',
    templateUrl: './micarch.component.html',
    styleUrls: ['./micarch.component.scss']
})
export class MicarchComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any = 'microarchitecture';
    @Input() status: any;
    @Input() id: any;
    @Input() nodeid: any;
    i18n: any;
    public isSummury = true;
    public detailList: Array<any> = [];
    public headers: any = {
        srcDir: '',
        hardwareEvent: 'CPU Cycles',
    };
    public app = '';
    public nodeApp = '';
    public collectionLog: any = {};
    public configuration: any;
    constructor(
        public i18nService: I18nService,
        private vscodeService: VscodeService,
        public router: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * init
     */
    async ngOnInit() {
        this.router.queryParams.subscribe(val => {
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.id = val.taskId;
                // intelIj 返回的nodeId 为 string 类型，会导致后续代码判断出错
                this.nodeid = Number(val.nodeId);
                this.status = val.sampleStatus;
            } else {
                const data = JSON.parse(val.sendMessage.replace(/#/g, ':'));
                this.id = data.taskId;
                this.nodeid = data.selfInfo.nodeId;
                this.status = data.selfInfo.sampleStatus;
            }
        });
        this.detailList = [];
        this.vscodeService.get({ url: `/tasks/${this.id}/common/configuration/?node-id=${this.nodeid}` }, (resp) => {
            if (resp.data) {
                this.configuration = resp.data.nodeConfig.find(item => item.nodeId === this.nodeid);
                if (resp.data.hasOwnProperty('appDir')) {
                    this.app = resp.data.appDir || '--';
                }
                this.headers.srcDir = resp.data.nodeConfig[0].taskParam.sourceLocation;
                self.webviewSession.setItem('headers', this.headers);
                if (resp.data.samplingMode === 'summary') {
                    this.isSummury = true;
                    if (this.status === 'Completed' || this.status === 'Aborted') {
                        this.detailList.push(
                            {
                                title: this.i18n.common_term_task_tab_summary,
                                active: true,
                                disable: false,
                            },
                            {
                                title: this.i18n.micarch.timing,
                                active: false,
                                disable: false,
                            },
                            {
                                title: this.i18n.common_term_task_tab_congration,
                                active: false,
                                disable: false,
                            },
                            {
                                title: this.i18n.common_term_task_tab_log,
                                active: false,
                                disable: false,
                            });
                    } else if (this.status === 'Created') {
                        this.detailList.push({
                            title: this.i18n.common_term_task_tab_congration,
                            active: true,
                            disable: false,
                        });
                    } else {
                        this.detailList.push(
                            {
                                title: this.i18n.common_term_task_tab_congration,
                                active: true,
                                disable: false,
                            },
                            {
                                title: this.i18n.common_term_task_tab_log,
                                active: false,
                                disable: false,
                            });
                    }
                } else {
                    this.isSummury = false;
                    if (this.status === 'Completed' || this.status === 'Aborted') {
                        this.detailList.push(
                            {
                                title: this.i18n.common_term_task_tab_summary,
                                active: true,
                                disable: false,
                            },
                            {
                                title: this.i18n.micarch.timing,
                                active: false,
                                disable: false,
                            },
                            {
                                title: this.i18n.micarch.details,
                                active: false,
                                disable: false,
                            },
                            {
                                title: this.i18n.common_term_task_tab_congration,
                                active: false,
                                disable: false,
                            },
                            {
                                title: this.i18n.common_term_task_tab_log,
                                active: false,
                                disable: false,
                            });
                    } else if (this.status === 'Created') {
                        this.detailList.push({
                            title: this.i18n.common_term_task_tab_congration,
                            active: true,
                            disable: false,
                        });
                    } else {
                        this.detailList.push(
                            {
                                title: this.i18n.common_term_task_tab_congration,
                                active: true,
                                disable: false,
                            },
                            {
                                title: this.i18n.common_term_task_tab_log,
                                active: false,
                                disable: false,
                            });
                    }
                }
            }
            this.updateWebViewPage();
        });

        if (this.status !== 'Created') {
            this.getTaskLog();
        }
        this.updateWebViewPage();
    }

    // 获取任务日志
    private getTaskLog() {
        this.vscodeService.get({
            url: `/tasks/${this.id}/microarchitecture/collection-log/?nodeId=${this.nodeid}`
        }, res => {
            this.collectionLog = {
                all: res.data
            };
            this.updateWebViewPage();
        });
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
