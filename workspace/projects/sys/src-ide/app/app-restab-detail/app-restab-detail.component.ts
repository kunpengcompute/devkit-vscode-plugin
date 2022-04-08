import { Component, OnInit, Input, ViewChild, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { LeftShowService } from './../service/left-show.service';
import { VscodeService } from '../service/vscode.service';
import { ViewDetailsService } from '../service/view-details.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-restab-detail',
    templateUrl: './app-restab-detail.component.html',
    styleUrls: ['./app-restab-detail.component.scss'],
})
export class AppRestabDetailComponent implements OnInit, OnDestroy {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() status: any;
    @Input() id: any;
    @Input() nodeid: any;
    @ViewChild('cpuSche', { static: false }) cpuSche: any;
    public subscription: any;
    public configuration: any;
    i18n: any;
    public detailList: Array<any> = [];
    public view: Subscription;
    public tpItem: any;
    public numaItem: any;
    // 优化建议提示
    public suggestMsg: any = [];
    public language = 0;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        public leftShowService: LeftShowService,
        private viewDetails: ViewDetailsService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.language = I18nService.getLang();

        this.detailList = [
            {
                title: this.i18n.common_term_task_tab_summary,
                active: true,
            },
            {
                title: this.i18n.sys_res.tab.cpu,
                active: false,
            },
            {
                title: this.i18n.sys_res.tab.pro,
                active: false,
            },
            {
                title: this.i18n.common_term_task_tab_congration,
                disable: false,
                active: false,
            },
            {
                title: this.i18n.common_term_task_tab_log,
                disable: false,
                active: false,
            }
        ];
        if (this.status === 'Completed' || this.status === 'Aborted') {
            this.detailList[0].active = true;
            this.detailList[0].disable = false;
            this.detailList[1].disable = false;
            setTimeout(() => {
                this.detailList[2].disable = false;
            }, 200);
            setTimeout(() => {
                this.detailList[3].disable = false;
            }, 400);
            this.view = this.viewDetails.subject.subscribe({
                next: (item) => {
                    this.detailList[0].active = false;
                    setTimeout(() => {
                        if (item[0] === 'tp') {
                            this.detailList[1].disable = false;
                            this.detailList[1].active = true;
                            this.tpItem = item[1];
                        }
                    }, 300);

                }
            });
        } else if (this.status === 'Created') {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration,
                    disable: false,
                    active: true,
                }
            ];
        } else {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration,
                    disable: false,
                    active: true,
                },
                {
                    title: this.i18n.common_term_task_tab_log,
                    disable: false,
                    active: false,
                }
            ];
        }

        this.getConfiguration();
    }

    /**
     * 获取配置信息
     */
    public getConfiguration() {
        const option = {
            url: `/tasks/${this.id}/common/configuration/?node-id=${this.nodeid}`
        };
        this.vscodeService.get(option, res => {
            if (res.data) {
                this.configuration = res.data.nodeConfig.find(item => item.nodeId = this.nodeid);

                // 防止接口还没完成，CPU组件就已经加载
                if (this.cpuSche) {
                    this.cpuSche.init();
                }
            }
        });
    }

    /**
     * 改变
     */
    public change() {
        this.leftShowService.leftIfShow.next();
    }

    /**
     * 设置优化建议集合
     */
    public setSuggestions(data) {
        if (data && data.suggestion && data.suggestion.length) {
            const suggestions = data.suggestion;
            suggestions.map(item => {
                this.suggestMsg.push({
                    title: this.language === 0 ? item.title_chs : item.title_en,
                    msgbody: this.language === 0 ? item.suggest_chs : item.suggest_en
                });
            });
        }
    }

    /**
     * 取消订阅
     */
    ngOnDestroy() {
        if (this.view) {
            this.view.unsubscribe();
        }
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
