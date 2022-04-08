import { Component, OnInit, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import {isLightTheme, VscodeService} from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { TableService } from '../../service/table.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-micarch-summury',
    templateUrl: './micarch-summury.component.html',
    styleUrls: ['./micarch-summury.component.scss']
})
export class MicarchSummuryComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() isActive: any;
    @Input() app: any;

    public countArr = [[], [1], [1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]];
    public titleData: any;
    public chartNotShow = false;  // 判断空状态
    public i18n: any;
    public instructions: any;
    public cycles: any;
    public ipc: any;
    public icicleData: any;
    public isTable = false;
    // 表格
    public summaryData = [{
        name: 'Pipeline Slots',
        proportion: 100,
        levelIndex: 0,
        expand: true,
        children: []
    }];
    public noDataInfo = '';
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: any;
    public columns: Array<TiTableColumns> = [];
    public showLoading = false;
    public isLight = false;
    public imgObj = {
        chart: {
            url: './assets/img/micarch/chart_selected_dark.svg',
            isTable: true
        },
        table: {
            url: './assets/img/micarch/table_dark.svg',
            isTable: false
        }
    };

    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        public tableService: TableService,
        public sanitizer: DomSanitizer,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone
    ) {
        this.i18n = this.i18nService.I18n();
        this.noDataInfo = this.i18n.common_term_task_nodata;
        this.columns = [
            { title: this.i18n.micarch.eventName, prop: 'name' },
            { title: this.i18n.micarch.percentage, prop: 'proportion', sortKey: 'proportion', sortStatus: '' },
        ];
        this.srcData = {
            data: [],
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: true, // 使用自己的排序
                paginated: false // 源数据未进行分页处理
            },
        };
    }

    /**
     * init
     */
    ngOnInit() {
        if (isLightTheme) {
            this.isLight = true;
            this.imgObj = {
                chart: {
                    url: './assets/img/micarch/chart_selected_dark.svg',
                    isTable: true
                },
                table: {
                    url: './assets/img/micarch/table_light.svg',
                    isTable: false
                }
            };
        }
        this.showLoading = true;
        setTimeout(() => {
            this.getSummaryData();
        });
    }
    /**
     * 鼠标移入
     * @param type 类型
     */
    public mouseEnterChange(type: string) {
        if (type === 'chart') {
            this.imgObj.chart.url = this.isLight ? './assets/img/micarch/chart_hover_light.svg' :
                './assets/img/micarch/chart_hover_dark.svg';
        } else {
            this.imgObj.table.url = this.isLight ? './assets/img/micarch/table_hover_light.svg' :
                './assets/img/micarch/table_hover_dark.svg';
        }
    }

    /**
     * 鼠标移出
     * @param type 类型
     */
    public mouseLeaveChange(type: string) {
        if (type === 'chart') {
            if (this.imgObj.chart.isTable) {
                this.imgObj.chart.url = './assets/img/micarch/chart_selected_dark.svg';
            } else {
                this.imgObj.chart.url = this.isLight ? './assets/img/micarch/chart_light.svg'
                    : './assets/img/micarch/chart_dark.svg';
            }
        } else {
            if (this.imgObj.table.isTable) {
                this.imgObj.table.url = './assets/img/micarch/table_selected_dark.svg';
            } else {
                this.imgObj.table.url = this.isLight ? './assets/img/micarch/table_light.svg'
                    : './assets/img/micarch/table_dark.svg';
            }
        }
    }

    /**
     * 获取总览数据【好像表格和图都是一样的数据，需要改请看下表格是否要动】
     */
    public getSummaryData() {
        this.vscodeService.get({ url: `/tasks/${this.taskid}/microarchitecture/summary/?nodeId=${this.nodeid}` },
        data => {
            const summaryData: any = data.data.summary.data;
            this.instructions = summaryData.Instructions || '--';
            this.cycles = summaryData.Cycles || '--';
            this.ipc = summaryData.Ipc || '--';
            // 判断是否有数据
            if ((summaryData.hasOwnProperty('Top') && Object.keys(summaryData.Top).length > 0)) {
                this.chartNotShow = Object.keys(summaryData.Top).every(el => {
                    return !summaryData.Top[el];
                });
            } else {
                this.chartNotShow = true;
            }
            // '{0}事件所占总事件比例为{1}%'.format(a, b) => a事件所占总事件比例为b%
            (String as any).prototype.format = function func() {
                if (arguments.length === 0) {
                    return this;
                }
                const param = arguments[0];
                let s = this;
                if (typeof (param) === 'object') {
                    Object.keys(param).forEach(key => {
                        s = s.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key]);
                    });
                    return s;
                } else {
                    for (let i = 0; i < arguments.length; i++) {
                        s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), arguments[i]);
                    }
                    return s;
                }
            };

            // 【frontEndBound】=>【Front End Bound】，以对应建议列表字段
            function calcTitleKey(label) {
                const str = label[0].toUpperCase() + label.slice(1);
                const res = [];
                let word = '';
                str.split('').forEach((item, index) => {
                    const code = item.charCodeAt();
                    if (index === str.length - 1) {
                        word += item;
                        res.push(word);
                    } else if (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) {
                        if (word) {
                            res.push(word);
                        }
                        word = item;
                    } else {
                        word += item;
                    }
                });
                return res.join(' ');
            }

            // 将数据转换成统一格式
            // 将 backEndBound 的指标回填回去，保持格式统一
            ['memoryBound', 'coreBound', 'resourceBound'].forEach(item => {
                if (summaryData[item]) {
                    if (Object.prototype.toString.call(summaryData.backEndBound) !== '[object Object]') {
                        summaryData.backEndBound = {};
                    }

                    summaryData.backEndBound[item] = summaryData[item];
                }
            });

            const topData = summaryData.Top;
            Object.keys(topData).forEach(key => {
                if (summaryData[key]) {
                    const value = topData[key];
                    topData[key] = summaryData[key];
                    topData[key].parent = value;
                }
            });

            const optimizationSuggestions = this.i18n.optimizationSuggestions;
            const suggestions = this.i18n.micarch.suggestions;

            // 遍历 data 生成 summaryData
            function formatChild({ children, levelIndex, childrenData }) {
                let maxIndex = 0;
                let maxProportion = 0;

                Object.keys(childrenData).forEach((key, index) => {
                    const value = childrenData[key];
                    const child: any = {
                        name: key,
                        proportion: value,
                        levelIndex,
                        expand: false,
                        index,
                    };

                    if (Object.prototype.toString.call(value) === '[object Object]') {
                        child.proportion = value.parent;
                        delete value.parent;

                        if (Object.keys(value).length) {
                            child.children = [];
                            formatChild({
                                children: child.children,
                                levelIndex: levelIndex + 1,
                                childrenData: value,
                            });
                        }
                    }

                    if (child.proportion > maxProportion) {
                        maxProportion = child.proportion;
                        maxIndex = index;
                    }

                    const label = calcTitleKey(child.name);
                    if (optimizationSuggestions[label]) {
                        child.suggestions = optimizationSuggestions[label];
                        child.suggestions.title = suggestions.title.format(label, child.proportion);
                    }

                    children.push(child);
                });

                if (children[maxIndex]) {
                    children[maxIndex].max = true;
                }
            }

            formatChild({
                children: this.summaryData[0].children,
                levelIndex: this.summaryData[0].levelIndex + 1,
                childrenData: topData
            });
            this.icicleData = JSON.parse(JSON.stringify(this.summaryData[0]));

            this.srcData.data = this.tableService.getTreeTableArr(this.summaryData);
            this.showLoading = false;
            this.updateWebViewPage();
        });
    }

    /**
     * 树表展开
     * @param node 节点
     */
    public toggle(node) {
        node.expand = !node.expand;
        this.srcData.data = this.tableService.getTreeTableArr(this.summaryData);
    }

    /**
     * 表格排序
     * @param prop prop
     * @param order order
     */
    public doSort(prop, order) {
        this.tableService.sortTable(this.summaryData, this.columns, prop, order);
        this.srcData.data = this.tableService.getTreeTableArr(this.summaryData);
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
