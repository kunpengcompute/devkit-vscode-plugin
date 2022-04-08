import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiModalService } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
@Component({
    selector: 'app-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
    // 自定义弹出层组件
    @ViewChild('analysis', { static: false }) analysis: ElementRef;
    @Input() suggestArr: Array<any>;
    @Input() type: number;
    @Input() isLink: number;
    @Input() tabName: any;
    public hoverClose: string;
    public i18n: any;
    public configPoolSrcData: TiTableSrcData;
    public configPoolColumns: Array<TiTableColumns> = [];
    public configPoolDisplayed: Array<TiTableRowData> = [];
    constructor(
        private i18nService: I18nService,
        private tiModal: TiModalService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public tabTypeArr: any[] = [];
    public showOneData = true;
    public isIntellij = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    public suggestList: any;
    public isZhCn = (self as any).webviewSession.getItem('language') === 'zh-cn';
    public urlArr: any[] = [];
    public pluginUrlCfg = ' ';

    /**
     *  初始化
     */
    ngOnInit() {
        this.configPoolColumns = [
            {
                title: 'key',
                width: '50%'
            },
            {
                title: 'value',
                width: '50%'
            }
        ];
        this.configPoolSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        if (this.suggestArr) {
            this.suggestArr.forEach(el => {
                if (el && el.sugHeight) {
                    el.sugHeight = false;
                }
            });
        }
    }
    /**
     * 打开弹框
     */
    show(): void {
        this.tiModal.open(this.analysis, {
            id: 'isSuggest', // 定义id防止同一页面出现多个相同弹框

            // 模板上下文：一般通过context定义的是与弹出动作相关的数据，大部分数据还是建议在外部定义
            // 双向绑定的值，建议放在context对象中，每次打开弹窗都重新就行赋值。
            context: {}
        });
    }
    /**
     * 展开操作
     */
    public changeHeight(idx: any) {
        this.suggestArr[idx].sugHeight = !this.suggestArr[idx].sugHeight;
    }
    /**
     * 设置优化建议的类型
     */
    setTypeTab() {
        if (this.isIntellij) {
            this.suggestList = [];
            this.suggestArr = this.vscodeService.deduplicateSuggestions(this.suggestArr);
            this.suggestArr.map(item => {
                if (item.oldSuggestion) {
                    item.suggestion = item.oldSuggestion;
                } else {
                    item.oldSuggestion = item.suggestion;
                }
                this.suggestList.push({
                    isLink: item.oldSuggestion?.match(/<[\s\S]*>$/) ?
                        item.oldSuggestion?.match(/<[\s\S]*>$/).length > 0 :
                        false
                });
            });
        }
        this.suggestArr.forEach((el: { [x: string]: string; label: any; suggestion: string }) => {
            if (this.isIntellij) {
                if (el.suggestion.match(/htt[\s\S]+"/)) {
                    this.urlArr = el.suggestion.match(/htt[\s\S]+compiler/);
                    this.pluginUrlCfg = this.urlArr[0];
                }
                el.suggestion = el.suggestion.replace(/<[\s\S]*>$/, '');
            }
            switch (el.label) {
                case 1:
                    el.name = this.i18n.protalserver_profiling_tab.overview;
                    el.tab = 'overview';
                    this.tabTypeArr.push(el.tab);
                    break;
                case 2:
                    el.name = this.i18n.protalserver_profiling_tab.gc;
                    el.tab = 'gc';
                    this.tabTypeArr.push(el.tab);
                    break;
                case 4:
                    el.name = this.i18n.protalserver_profiling_tab.jdbcpool;
                    el.tab = 'jdbcpool';
                    this.tabTypeArr.push(el.tab);
                    break;
                case 5:
                    el.name = this.i18n.protalserver_profiling_tab.gcLog;
                    el.tab = 'gcLog';
                    this.tabTypeArr.push(el.tab);
                    break;
                default:
            }
        });
    }
    /**
     * 展开指定类型
     */
    openSetType() {
        const newarr = [...new Set(this.tabTypeArr)];
        this.showOneData = true;
        this.suggestArr.forEach((el: any) => {
            if (el && el.tab === this.tabName && this.showOneData) {
                el.sugHeight = true;
                this.showOneData = false;
            } else if ((typeof (this.tabName) === 'undefined' && this.showOneData)
                || (!newarr.includes(this.tabName) && this.showOneData)) {
                el.sugHeight = true;
                this.showOneData = false;
            } else {
                el.sugHeight = false;
            }
        });
    }
    /**
     * 下载缺失包
     * @param url 路径
     */
    openUrl(url: string) {
        // intellij走该逻辑
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: url
                }
            }, null);
        } else {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
}
