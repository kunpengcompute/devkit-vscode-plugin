import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AnalysisType } from '../../domain/analysis-type.enum';
import { TabSwitchService } from './service/tab-switch.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-diagnose-leak-detail',
    templateUrl: './diagnose-leak-detail.component.html',
    styleUrls: ['./diagnose-leak-detail.component.scss'],
})
export class DiagnoseLeakDetailComponent implements OnInit, OnDestroy {
    @Input() tabShowing: boolean; // 用于判断当前tab的状态
    @Input() projectName: string;
    @Input() taskName: string;
    @Input() status: string;
    @Input() taskId: number;
    @Input() nodeId: number;
    @Input() taskDetail: any;

    public analysisType = AnalysisType.MemoryDiagnostic;
    public diagnosticType: number;
    public i18n: any;
    public detailList: Array<{
        title: string,
        prop: string,
        disable: boolean,
        active: boolean,
    }> = [];

    private tabSwitchServiceSub: Subscription;

    constructor(
        private i18nService: I18nService,
        private tabSwitchService: TabSwitchService<string>,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public configTabs: any = [];

    ngOnInit(): void {
        this.configTabs = [
            {
                title: this.i18n.common_term_task_tab_congration,
                prop: 'configuration',
                disable: false,
                active: false,
            },
            {
                title: this.i18n.common_term_task_tab_log,
                prop: 'taskLog',
                disable: false,
                active: false,
            },
        ];
        this.detailList = this.configTabs;
        this.detailList[0].active = true;
        this.tabSwitchServiceSub = this.tabSwitchService.switchTab.subscribe({
            next: ({ tab }) => {
                this.detailList.forEach(item => {
                    if (item.prop === tab) {
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                });
            }
        });
    }

    public getConfigInfo(configInfo: any) {
        if (this.status === 'Completed' || this.status === 'Aborted') {
            if (configInfo?.diagnosticType.includes('mem_exception')) {
                this.diagnosticType = 3;
                this.detailList = [
                    {
                        title: this.i18n.diagnostic.taskParams.memory_overwriting,
                        prop: 'exception',
                        disable: false,
                        active: false,
                    },
                    ...this.configTabs,
                ];
                this.detailList[0].active = true;
                return;
            }
            this.detailList = [
                {
                    title: 'Call Tree',
                    prop: 'callTree',
                    disable: false,
                    active: false,
                },
                {
                    title: this.i18n.diagnostic.tab.sourceCode,
                    prop: 'sourceCode',
                    disable: false,
                    active: false,
                },
                ...this.configTabs,
            ];
            if (configInfo?.diagnosticType.includes('oom')) {
                this.detailList.splice(2, 0, {
                    title: 'OOM',
                    prop: 'oom',
                    disable: false,
                    active: false,
                });
            }
            if (configInfo?.diagnosticType.includes('mem_consume')) {
                this.detailList.splice(2, 0, {
                    title: this.i18n.diagnostic.consumption.consumption,
                    prop: 'consumption',
                    disable: false,
                    active: false,
                });
            }
        } else if (this.status === 'Created') {
            this.detailList = this.configTabs.slice(0, 1);
        } else {
            this.detailList = this.configTabs;
        }
        this.detailList[0].active = true;
    }

    ngOnDestroy(): void {
        this.tabSwitchService.memLeakFuncListStatus = null;
        this.tabSwitchServiceSub.unsubscribe();
    }

}
