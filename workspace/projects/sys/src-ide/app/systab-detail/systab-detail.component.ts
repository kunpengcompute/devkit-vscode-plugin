import {
    Component, OnInit, ViewChild, OnChanges, SimpleChanges, Input, ElementRef, NgZone, ChangeDetectorRef
} from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { AxiosService } from '../service/axios.service';
import { MytipService } from '../service/mytip.service';
import {VscodeService, COLOR_THEME, currentTheme} from '../service/vscode.service';
@Component({
    selector: 'app-systab-detail',
    templateUrl: './systab-detail.component.html',
    styleUrls: ['./systab-detail.component.scss']
})
export class SystabDetailComponent implements OnInit, OnChanges {
    @Input() tabShowing: boolean; // 用于判断当前tab的状态，为总览页面的相同svg图之间的独立做支撑
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() status: any;
    @Input() active: any;
    @Input() id: any;
    @Input() nodeid: any = 1;
    @ViewChild('topData', { static: false }) topData: any; // top 数据
    public subscription: any;
    i18n: any;
    public sceneSolution: number; // 后端返回场景标记
    constructor(
        public mytip: MytipService,
        private Axios: AxiosService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private elementRef: ElementRef,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public detailList: Array<any> = [];
    public situation = 0;
    public scheduleData = 40;
    public showLoading = false;
    private currTheme: COLOR_THEME;

    /**
     * 感知变更事件
     * @param changes 变更
     */
    ngOnChanges(changes: SimpleChanges): void {
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.showLoading = true;
        this.detailList = [
            // 总览
            {
                title: this.i18n.common_term_task_tab_summary,
                disable: true,
                active: false
            },
            // pcie
            {
                title: this.i18n.common_term_task_tab_pcie,
                disable: false,
                active: false
            },
            // 性能
            {
                title: this.i18n.sys.performance,
                disable: true,
                active: false,
                prop: 'perf',
            },
            // 任务信息
            {
                title: this.i18n.common_term_task_tab_congration,
                disable: false,
                active: false,
                prop: 'configuration',
            },
            // 采集日志
            {
                title: this.i18n.common_term_task_tab_log,
                disable: false,
                active: false,
                prop: 'taskLog',
            }
        ];

        if (this.status === 'Completed' || this.status === 'Aborted') {
            this.initTab();
        } else if (this.status === 'Created') {
            this.detailList = [{
                title: this.i18n.common_term_task_tab_congration,
                disable: false,
                active: true,
                prop: 'configuration',
            }];
            this.showLoading = false;
        } else {
            this.detailList.forEach(item => {
                item.active = item.prop === 'configuration';
                item.disable = !['configuration', 'taskLog'].includes(item.prop);
            });
            for (let index = this.detailList.length; index > 0; index--) {
                if (this.detailList[index - 1].disable) {
                    this.detailList.splice((index - 1), 1);
                }
            }
            this.showLoading = false;
        }
        this.updateWebViewPage();
    }

    /**
     * 初始化页签
     */
    public async initTab() {
        const param = {
            'node-id': this.nodeid,
            'analysis-type': 'system',

        };
        this.vscodeService.get({
            url: '/tasks/' + this.id + '/common/configuration/?' + this.Axios.converUrl(param)
        }, (resp: any) => {
            if (resp.data) {
                const taskData = resp.data.nodeConfig.find((item: { nodeId: any; }) => item.nodeId === this.nodeid);
                if (taskData.task_param.topCheck) {
                    this.detailList.splice(this.detailList.findIndex(item => item.prop === 'configuration'), 0, {
                        title: this.i18n.sys.topData,
                        prop: 'topData',
                        disable: true,
                        active: false
                    });
                }
                if (taskData.task_param.hasOwnProperty('sceneSolution')) {
                    this.sceneSolution = taskData.task_param.sceneSolution;
                    this.detailList.splice(this.detailList.findIndex(item => item.prop === 'perf') + 1, 0, {
                        title: this.i18n.sys_summary.distributed.typicalConfiguration,
                        prop: 'typicalConfiguration',
                        disable: true,
                        active: false,
                    });
                }
                if (Object.prototype.hasOwnProperty.call(taskData.task_param, 'traceSwitch')) {
                    const hasTracing = taskData.task_param.traceSwitch;
                    if (this.sceneSolution === 2 && hasTracing) {
                      this.detailList.splice(this.detailList.findIndex(item => item.prop === 'perf') + 2, 0, {
                        title: this.i18n.sys_summary.tracing.tag,
                        prop: 'tracing',
                        disable: false,
                        active: false
                      });
                    }
                  }
            }
            this.detailList.forEach(item => item.disable = false);
            this.detailList[0].active = true;
            this.showLoading = false;
            this.updateWebViewPage();
        });
    }

    /**
     * 获取 top 数据【子组件调用，放在父组件可以让子组件更通用化】
     * @param fileIndex 文件索引
     */
    public getCodeData(fileIndex: number) {
        const params = {
            nodeId: this.nodeid,
            page: fileIndex + 1,  // 后端是从1开始的
        };
        this.vscodeService.get({
            url: '/tasks/' + this.id + '/sys-performance/top-detail/?' + this.Axios.converUrl(params)
        }, (resp: any) => {
            if (resp.data) {
                this.topData.setCodeData({
                    fileIndex,
                    fileList: resp.data.top_timestamp,
                    fileData: {
                        title: resp.data.data[0],
                        content: resp.data.data.slice(1),
                    }
                });
            }
        });
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
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
