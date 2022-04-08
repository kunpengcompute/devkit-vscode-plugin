// Miss事件 详情
import {Component, OnInit, Input, ViewChild, NgZone, ChangeDetectorRef} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { Axios2vscodeServiceService } from '../../service/axios2vscode-service.service';
import { MytipService } from '../../service/mytip.service';
import { LeftShowService } from './../../service/left-show.service';


@Component({
    selector: 'app-miss-detail',
    templateUrl: './miss-detail.component.html',
    styleUrls: ['./miss-detail.component.scss']
})
export class MissDetailComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any = 'miss_event';
    @Input() status: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() missNoImmediately: boolean;

    @ViewChild('missStatistics', { static: false }) missStatistics: any;

    i18n: any;
    public detailList: Array<any> = [];

    public formEl: any;
    public parentFormEl: any;
    public values: any;
    public collectionLog: any = {};

    constructor(
        public mytip: MytipService,
        private Axios: Axios2vscodeServiceService,
        public i18nService: I18nService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        public leftShowService: LeftShowService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * init
     */
    ngOnInit() {
        this.detailList = [
            { // Miss事件统计
                title: this.i18n.ddr.missEventStatistics,
                prop: 'missEventStatistics',
                disable: !['Completed', 'Aborted'].includes(this.status),
            },
            { // 配置信息
                title: this.i18n.common_term_task_tab_congration,
                prop: 'configuration',
                disable: false,
            }, {  // 任务日志
                title: this.i18n.common_term_task_tab_log,
                prop: 'log',
                active: false,
                disable: false,
            }
        ];
        if (['Completed', 'Aborted'].includes(this.status)) {
            this.switchDefaultActive('missEventStatistics');
        } else {
            this.switchDefaultActive('configuration');
            for (let index = this.detailList.length; index > 0; index--) {
                if (this.detailList[index - 1].disable) {
                    this.detailList.splice((index - 1), 1);
                }
            }
        }
        if (!this.missNoImmediately) {
            this.getTaksLog();
        }
        this.updateWebViewPage();
    }

    /**
     * 切换默认选中
     */
    public switchDefaultActive(activeProp) {
        this.detailList.forEach(item => {
            item.active = item.prop === activeProp;
        });
        this.updateWebViewPage();
    }

    /**
     * 子组件返回配置信息【不动子组件的逻辑且不重复获取】
     */
    public returnConfigInfo({ formEl, formElList, values }) {
        this.parentFormEl = formElList[0];
        this.formEl = formElList[1];
        this.values = values;

        // 如果采集成功初始化Miss事件统计界面【设个定时器异步下，不然子组件获取不到fromEl】
        if (['Completed', 'Aborted'].includes(this.status)) {
            setTimeout(() => {
                this.missStatistics.init();
            }, 0);
        }
        this.updateWebViewPage();
    }

    /**
     * 获取任务日志
     */
    public getTaksLog() {
        const params = {
            'node-id': this.nodeid,
        };

        this.Axios.axios.get(`/tasks/${this.taskid}/mem-access-analysis/collection-log/`, { params }).then(res => {
            this.collectionLog = {
                all: res.data
            };
        });
        this.updateWebViewPage();
    }

    /**
     * change
     */
    public change() {
        this.leftShowService.leftIfShow.next();
        this.updateWebViewPage();
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
