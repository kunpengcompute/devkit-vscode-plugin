import {Component, OnInit, Input, ChangeDetectorRef, NgZone} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent } from '@cloud/tiny3';
import { VscodeService } from '../../service/vscode.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';

@Component({
    selector: 'app-lock-summury',
    templateUrl: './lock-summury.component.html',
    styleUrls: ['./lock-summury.component.scss']
})
export class LockSummuryComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public leftSug: any;
    public rightSug: any;
    public lang: string;
    public srcData: TiTableSrcData;
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public columns: Array<TiTableColumns> = [

    ];
    public displayedPoint: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcPointData: TiTableSrcData;
    public currentPagePoint = 1;
    public totalNumberPoint = 0;
    public pageSizePoint: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public columnsPoint: Array<TiTableColumns> = [

    ];
    public i18n: any;
    public srcDataShowLoading = false;
    public srcPointDataShowLoading = false;
    public pointNoData: string;
    /** 表格行索引 */
    rowIndex: number;

    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * downloadCsv1
     */
    public downloadCsv1() {
        const list = ['lock_comm', 'lock_dso', 'lock_symbol', 'lock_call_time'];
        let str = '';
        this.columns.forEach(ele => {
            if (ele.hasOwnProperty('sortKey')) {
                str += ele.title + ',';
            }
        });
        str += '\n';
        this.srcData.data.forEach(val => {
            for (const item in val) {
                if (list.indexOf(item) > -1) {
                    if (item === 'lock_comm') {
                        str += val[item] + '(TID:' + val.lock_tid + '),';
                    } else {
                        const strEl1 = val[item];
                        str += '"' + strEl1 + '"' + '\t,';
                    }
                }
            }
            str += '\n';
        });

        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.mission_modal.lockSummary.lock_and_wait_info + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * downloadCsv2
     */
    public downloadCsv2() {
        const list = ['lock_time', 'lock_call_dso', 'lock_call_symbol', 'lock_code', 'lock_line'];
        let str = '';
        this.columnsPoint.forEach(ele => {
            if (ele.hasOwnProperty('sortKey')) {
                str += ele.title + ',';
            }
        });
        str += '\n';
        this.srcPointData.data.forEach(val => {
            for (const item in val) {
                if (list.indexOf(item) > -1) {
                    const strEl1 = val[item];
                    str += '"' + strEl1 + '"' + '\t,';
                }
            }
            str += '\n';
        });

        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.mission_modal.lockSummary.call_site_info + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.pointNoData = this.i18n.mission_modal.lockSummary.point_no_data;
        this.srcDataShowLoading = true;
        this.srcPointDataShowLoading = true;
        this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
            // 已经做过的，tiny就不再做了
            // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
            // 本示例中，开发者设置了分页特性，且对源数据未进行分页处理，因此tiny会对数据进行分页处理
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false// 源数据未进行分页处理
            }
        };
        this.columns = [
            {
                title: this.i18n.mission_modal.lockSummary.task_name,
                width: '24%',
                sortKey: 'lock_tid'
            },
            {
                title: this.i18n.mission_modal.lockSummary.module_name,
                width: '24%',
                sortKey: 'lock_dso'
            },
            {
                title: this.i18n.mission_modal.lockSummary.function_name,
                width: '24%',
                sortKey: 'lock_symbol'
            },
            {
                title: this.i18n.mission_modal.lockSummary.call_times,
                width: '14%',
                sortKey: 'lock_call_time'
            },
            {
                title: this.i18n.common_term_operate,
                width: '14%',

            },
        ];

        this.srcPointData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
            // 已经做过的，tiny就不再做了
            // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
            // 本示例中，开发者设置了分页特性，且对源数据未进行分页处理，因此tiny会对数据进行分页处理
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false// 源数据未进行分页处理
            }
        };
        this.columnsPoint = [
            {
                title: this.i18n.mission_modal.lockSummary.timing,
                width: '12%',
                sortKey: 'lock_time'
            },
            {
                title: this.i18n.mission_modal.lockSummary.call_site_module_nama,
                width: '23%',
                sortKey: 'lock_call_dso'
            },
            {
                title: this.i18n.mission_modal.lockSummary.call_site_function_nama,
                width: '18%',
                sortKey: 'lock_call_symbol'
            },

            {
                title: this.i18n.mission_modal.lockSummary.call_site_source_code_name,
                width: '21%',
                sortKey: 'lock_code'
            },
            {
                title: this.i18n.mission_modal.lockSummary.call_site_row_num,
                width: '15%',
                sortKey: 'lock_line'
            },
            {
                title: this.i18n.common_term_operate,
                width: '11%',
            },
        ];
        this.init();
        this.srcPointData.data = [];
        this.updateWebViewPage();
    }

    /**
     * 【由于排序问题，先改成前端分页】
     */
    private init() {
        const params = {
            'node-id': this.nodeid,
            'query-type': 'summary',
            'query-target': 'calltime',
            page: this.currentPage,
            'per-page': this.pageSize.size
        };

        const option = {
            url: `/tasks/${this.taskid}/sys-lock/summary/?` + Utils.converUrl(params),
        };
        this.vscodeService.get(option, (res: any) => {
            // 得到总个数再获取一次全部的
            const subParams = {
                'node-id': this.nodeid,
                'query-type': 'summary',
                'query-target': 'calltime',
                page: this.currentPage,
                'per-page': res.data.totalCounts
            };

            const subOption = {
                url: `/tasks/${this.taskid}/sys-lock/summary/?` + Utils.converUrl(subParams),
            };

            this.vscodeService.get(subOption, (totalRes: any) => {
                this.srcData.data = totalRes.data.value;
                this.totalNumber = totalRes.data.totalCounts;
                // FIXME: 语言判断方法有误
                if ((self as any).webviewSession.getItem('language') === 'zh-cn') {
                    this.leftSug = totalRes.data.suggestion.ch;
                    this.lang = 'ch';
                } else {
                    this.leftSug = totalRes.data.suggestion.en;
                    this.lang = 'en';
                }
                this.srcDataShowLoading = false;
                this.srcPointDataShowLoading = false;
                this.updateWebViewPage();
            });
        });
    }

    /**
     * 锁与等待信息变化时
     * @param datas 当前表格项
     */
    public displayedDataChange(datas: any[]) {
        // 当前索引置空
        this.rowIndex = null;
        if (datas.length) {
          this.getdetail(datas[0], 0);
        }
        this.updateWebViewPage();
    }

    /**
     * 【由于排序问题，先改成前端分页
     * @param row 参数
     * @param rowIndex 行索引
     */
    public getdetail(row: TiTableRowData, rowIndex: number) {
        if (rowIndex === this.rowIndex) {
          return;
        }
        this.rowIndex = rowIndex;
        this.currentPagePoint = 1;
        this.pageSizePoint.size = 10;
        const params = {
            'node-id': this.nodeid,
            'query-type': 'summary',
            'query-target': 'addr2line',
            'lock-tid': row.lock_tid,
            'lock-dso': row.lock_dso,
            'lock-symbol': row.lock_symbol,
            'lock-comm': row.lock_comm,
            page: this.currentPagePoint,
            'per-page': this.pageSizePoint.size,
        };
        const option = {
            url: `/tasks/${this.taskid}/sys-lock/call-point/?` + Utils.converUrl(params),
        };

        this.vscodeService.get(option, (res: any) => {
            // 得到总个数再获取一次全部的
            const subParams = {
                'node-id': this.nodeid,
                'query-type': 'summary',
                'query-target': 'addr2line',
                'lock-tid': row.lock_tid,
                'lock-dso': row.lock_dso,
                'lock-symbol': row.lock_symbol,
                'lock-comm': row.lock_comm,
                page: this.currentPagePoint,
                'per-page': res.data.totalCounts,
            };

            const subOption = {
                url: `/tasks/${this.taskid}/sys-lock/call-point/?` + Utils.converUrl(subParams),
            };

            this.vscodeService.get(subOption, (totalRes: any) => {

                this.srcPointData.data = totalRes.data.value;
                this.totalNumberPoint = totalRes.data.totalCounts;
                if ((self as any).webviewSession.getItem('language') === 'zh-cn') {
                    this.rightSug = totalRes.data.suggestion.ch;
                } else {
                    this.rightSug = totalRes.data.suggestion.en;
                }
                this.srcPointDataShowLoading = false;
                this.updateWebViewPage();
            });
        });
    }

    /**
     * addFunctionTab
     * @param row 参数
     * @param whitch 参数
     */
    addFunctionTab(row: any, whitch: 'sum'| 'detail') {
        const params = {
            'node-id': this.nodeid,
            'query-type': 'source_code',
            'lock-tid': row.lock_tid,
            'lock-dso': whitch === 'sum' ? row.lock_dso : row.lock_call_dso,
            'lock-symbol': whitch === 'sum' ? row.lock_symbol : row.lock_call_symbol,
        };
        const option = {
            url: `/tasks/${this.taskid}/sys-lock/func-code/?` + Utils.converUrl(params),
            headers: { mask: false },
        };

        this.vscodeService.get(option, async (resp: any) => {
            const data = resp.data;
            if (Object.keys(data).length) {
                // 格式化源代码
                let sourceCodeData = [];
                if (Array.isArray(data.source)) {
                    sourceCodeData = data.source.map((item: any, index: number) => {
                        return {
                            ...item,
                            id: `source_${index}`,
                            line: +item.line,
                            line_code: item.line_code,
                            count: +item.CPU_CYCLES.split('(')[0],
                            proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
                        };
                    });
                }

                // 格式化汇编代码
                const assemblyCodeData: any[] = [];
                if (Array.isArray(data.bbb)) {
                    data.bbb.forEach((item: any) => {
                        const obj = {
                            ...item,
                            offset: item.offset,
                            line: +item.line,
                            ins: item.ins,
                            count: +item.CPU_CYCLES.split('(')[0],
                            proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
                        };

                        if (item.ins_list) {
                            obj.children = item.ins_list.map((ins: any) => {
                                return {
                                    ...ins,
                                    offset: ins.offset,
                                    line: +ins.line,
                                    ins: ins.ins,
                                    count: +ins.CPU_CYCLES.split('(')[0],
                                    proportion: ins.CPU_CYCLES.split('(')[1].split(')')[0],
                                };
                            });
                        }

                        assemblyCodeData.push(obj);
                    });
                }

                // 代码流
                let svgpath;
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                  if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
                    const svgResp: any = await this.requestSvgpath(data);
                    svgpath = svgResp.data;
                  }
                }else {
                  if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
                      const svgResp: any = await this.requestSvgpath(data);
                      if (svgResp.length > 0) {
                          svgpath = svgResp;
                      }
                  }
                }

                this.vscodeService.postMessage({
                        cmd: 'openNewPage', data: {
                        router: 'addfunction',
                        panelId: 'perfInstall',
                        viewTitle: this.i18n.mission_create.lock,
                        message: {
                            functionName: whitch === 'sum' ? row.lock_symbol : row.lock_call_symbol,
                            nodeid: this.nodeid,
                            taskid: this.taskid,
                            taskType: 'lock',
                            headers: JSON.stringify([
                                { label: this.i18n.common_term_task_tab_function_hard, content: 'CPU Cycles' },
                                {
                                    label: this.i18n.common_term_task_tab_function_total,
                                    content: data.pmutotal.CPU_CYCLES || '--'
                                },
                                {
                                    label: this.i18n.common_term_task_tab_function_name,
                                    content: data.filename || '--'
                                },
                            ]),
                            functionDetails: JSON.stringify({
                                sourceCode: {
                                    data: sourceCodeData,
                                },
                                assemblyCode: {
                                    data: assemblyCodeData,
                                },
                                codeStream: {
                                    svgpath,
                                    graph_status: data.graph_status,
                                }
                            }),
                        }
                    }
                }, null);
            } else {  // no data
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: this.i18n.noSourceData,
                        type: 'warn'
                    }
                };
                this.vscodeService.postMessage(message, null);
            }
        });
    }

    /**
     * 获取代码流
     */
    public requestSvgpath(data: any) {
        const subParams = { 'svg-name': data.svgpath };
        const subOption = {
            url: `/tasks/${this.taskid}/c-analysis/svg-content/?` + Utils.converUrl(subParams),
            headers: { mask: false }
        };
        return new Promise((resolve, reject) => {
            this.vscodeService.get(subOption, (res: any) => {
                resolve(res);
            });
        });
    }

    /**
     * stateUpdate
     * @param tiTable 参数三
     */
    public stateUpdate(tiTable: TiTableComponent): void {
        this.init();
    }

    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
      if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
        this.zone.run(() => {
          this.changeDetectorRef.detectChanges();
          this.changeDetectorRef.checkNoChanges();
        });
      }
    }
}
