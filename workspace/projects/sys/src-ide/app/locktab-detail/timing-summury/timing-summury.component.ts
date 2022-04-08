import { Component, OnInit, Input, ChangeDetectorRef, NgZone, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { VscodeService } from '../../service/vscode.service';

import {
    TiTableColumns,
    TiTableRowData,
    TiTableSrcData,
    TiTableComponent,
    TiModalService,
    TiPageSizeConfig,
} from '@cloud/tiny3';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-timing-summury',
    templateUrl: './timing-summury.component.html',
    styleUrls: ['./timing-summury.component.scss'],
})
export class TimingSummuryComponent implements OnInit {
    // -- 筛选弹框 --
    @ViewChild('selectMask', { static: false }) public selectMask: any;
    @ViewChild('table', { static: false }) table: TiTableComponent;
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    public data: Array<TiTableRowData> = [];
    public baseData: Array<TiTableRowData> = [];
    public forSearchBaseData = [];
    public showSearchList = false;
    public currentPage = 1;
    public totalNumber = 10;
    public finalTableData = [];
    public pageSize: { options: Array<number>; size: number } = {
        options: [10, 20, 50, 100],
        size: 10,
    };
    public columns: any;

    public tableSearchList: any[];
    public i18n: any;
    public showLoading = false;
    public taskDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public taskSrcData: TiTableSrcData = {
        data: [],
        state: {
            searched: false, // 源数据未进行搜索处理
            sorted: false, // 源数据未进行排序处理
            paginated: false, // 后台分页，源数据已进行了分页处理
        },
    };
    public taskPageSize: TiPageSizeConfig = {
        size: 10
    };
    public taskCurrentPage = 1;
    public totalTaskNumber = 0;
    public checkedList: any[] = []; // 选中线程
    public searchWords = '';
    public searchKeys: Array<string> = ['tid'];
    public filterSrc = './assets/img/filterNormal.svg';

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private tiModal: TiModalService,
        public sanitizer: DomSanitizer) {
        this.i18n = this.i18nService.I18n();

        this.columns = {
            width: ['38px', '17.6%', '10.8%', '10.8%', '13.2%', '13.2%', '13.2%', '13.2%', '8%'],
            firstRow: [
                {
                    width: '38px',
                    rowspan: 2,
                    colspan: 1,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.task_time,
                    width: '17.6%',
                    rowspan: 2,
                    colspan: 1,
                    center: true,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.lockWait,
                    width: '21.6%',
                    rowspan: 1,
                    colspan: 2,
                    center: true,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.call_site,
                    width: '52.8%',
                    rowspan: 1,
                    colspan: 4,
                    center: true,
                },
                {
                    title: this.i18n.plugins_perf_title_columsOperate,
                    width: '8%',
                    rowspan: 2,
                    colspan: 1,
                    center: true,
                },
            ],
            secondRow: [
                {
                    title: this.i18n.mission_modal.lockSummary.module_name,
                    width: '10.8%',
                    rowspan: 1,
                    colspan: 1,
                    center: false,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.function_name,
                    width: '10.8%',
                    rowspan: 1,
                    colspan: 1,
                    center: false,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.module_name,
                    width: '15.2%',
                    rowspan: 1,
                    colspan: 1,
                    center: false,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.function_name,
                    width: '15.2%',
                    rowspan: 1,
                    colspan: 1,
                    center: false,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.source_code_name,
                    width: '15.2%',
                    rowspan: 1,
                    colspan: 1,
                    center: false,
                },
                {
                    title: this.i18n.mission_modal.lockSummary.row_num,
                    width: '15.2%',
                    rowspan: 1,
                    colspan: 1,
                    center: false,
                },
            ],
        };
    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.srcData = {
            // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
            // 已经做过的，tiny就不再做了
            // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
            // 本示例中，开发者设置了分页特性，且对源数据未进行分页处理，因此tiny会对数据进行分页处理
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: true, // 后台分页，源数据已进行了分页处理
            },
        };

        this.getTids();
    }

    /**
     * 获取TID数据
     */
    public getTids() {
        this.showLoading = true;
        const param = {
            'node-id': this.nodeid,
            'query-type': 'summary',
            'query-target': 'command',
        };
        const url = `/tasks/${this.taskid}/sys-lock/timing-data/?` + Utils.converUrl(param);
        this.vscodeService.get({ url }, res => {
            const objItem: any[] = [];
            res.data.value.forEach((val, i) => {
                const obj = { tid: '', show: i <= 1 ? true : false, params: val };
                if (val.split('-').length > 2) {
                    obj.tid = val.split('-')[0] + '-' + val.split('-')[1] + '(TID:' + val.split('-')[2] + ')';
                } else {
                    obj.tid = val.split('-')[0] + '(TID:' + val.split('-')[1] + ')';
                }
                objItem.push(obj);
            });
            this.tableSearchList = objItem;
            this.taskSrcData.data = objItem;
            this.totalTaskNumber = this.taskSrcData.data.length;
            this.init(this.tableSearchList);
        });
    }

    /**
     * init
     * @param serachList 参数
     */
    public init(serachList) {
        // 整理请求tid参数
        let tidSrting = '';
        serachList.forEach(val => {
            if (val.show === true) {
                tidSrting += val.params + ',';
            }
        });
        tidSrting = tidSrting.slice(0, tidSrting.length - 1) || '-';
        tidSrting = encodeURIComponent(tidSrting);

        const params = {
            'node-id': this.nodeid,
            'query-type': 'detail',
            page: this.currentPage,
            'per-page': this.pageSize.size,
            'lock-comm-tid': tidSrting,
        };
        const url = `/tasks/${this.taskid}/sys-lock/timing-data/?` + Utils.converUrl(params);
        this.vscodeService.get({ url }, res => {
            this.baseData = [];
            let i = 0;
            const value = res.data.value;
            for (const k of Object.keys(value)) {
                const obj = {
                    tid: '',
                    show: i <= 1 ? true : false,
                    children: [],
                    lock_time: false,
                    lock_dso: '',
                    lock_symbol: '',
                    lock_call_dso: '',
                    lock_call_symbol: '',
                    lock_code: '',
                    lock_line: '',
                    id: Utils.generateConversationId(16),
                };
                if (k.split('-').length > 2) {
                    obj.tid = k.split('-')[0] + '-' + k.split('-')[1] + '(TID:' + k.split('-')[2] + ')';
                } else {
                    obj.tid = k.split('-')[0] + '(TID:' + k.split('-')[1] + ')';
                }
                for (const child of value[k]) {
                    child.id = Utils.generateConversationId(16);
                }
                obj.children = value[k];

                this.baseData.push(obj);
                i++;
            }
            this.totalNumber = res.data.totalCounts;
            this.data = [...this.baseData];
            this.forSearchBaseData = [...this.baseData];
            this.initTable();
        });
    }

    /**
     * initTable
     */
    public initTable() {
        this.finalTableData = [];
        this.data.forEach((element) => {
            this.finalTableData.push(element);
        });
        this.finalTableData = this.getTreeTableArr(this.finalTableData);
        this.srcData.data = [...this.finalTableData];
        this.showLoading = false;
        this.updateWebViewPage();
    }
    private getTreeTableArr(
        pArray: Array<any>,
        pLevel?: number,
        pId?: any
    ): Array<any> {
        let tableArr: Array<any> = [];
        if (pArray === undefined) {
            return tableArr;
        }
        pLevel = pLevel === undefined ? 0 : pLevel + 1;
        pId = pId === undefined ? 'tiTableRoot' : pId;

        let temp: any;
        for (const item of pArray) {
            temp = this.deepClone(item);
            delete temp.children;
            temp.level = pLevel;
            temp.isShow = true;
            temp.pId = pId;
            temp.hasChildren = false;
            tableArr.push(temp); // 也可以在此循环中做其他格式化处理
            if (item.children && item.children.length) {
                temp.hasChildren = true;
                temp.expand = true;
                tableArr = tableArr.concat(
                    this.getTreeTableArr(item.children, pLevel, temp.id)
                );
            }
        }

        return tableArr;
    }

    /**
     * toggle
     * @param node 参数
     */
    public toggle(node: any): void {
        node.expand = !node.expand;
        this.toggleChildren(this.finalTableData, node.id, node.expand);
        this.srcData.data = this.finalTableData.filter((item) => {
            return item.isShow === true;
        });
        this.updateWebViewPage();
    }

    private toggleChildren(data: Array<any>, pId: any, pExpand: boolean): void {
        for (const node of data) {
            if (node.pId === pId) {
                node.isShow = pExpand; // 处理当前子节点
            }
        }
    }

    /**
     * getLevelStyle
     */
    public getLevelStyle(node: any): { 'padding-left': string } {
        return {
            'padding-left': `${node.level * 18 + 10}px`,
        };
    }

    /**
     * deepClone
     * @param obj 参数
     */
    private deepClone(obj: any): any {
        // 深拷贝，类似于1.x中的angular.copy()
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        let clone: any;

        clone = Array.isArray(obj) ? obj.slice() : { ...obj };

        const keys: Array<string> = Object.keys(clone);

        for (const key of keys) {
            clone[key] = this.deepClone(clone[key]);
        }

        return clone;
    }

    /**
     * showSearch
     */
    public showSearch() {
        this.showSearchList = true;
        this.searchWords = '';
        this.checkedList = this.tableSearchList.filter((item) => {
            return item.show;
        });
        this.tiModal.open(this.selectMask, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'selectMask',
            draggable: false,
            dismiss: (): void => {
                this.showSearchList = false;
            }
        });
        this.updateWebViewPage();
    }
    public confimModal(context: any) {
        this.tableSearchList.forEach((item) => {
            item.show = this.checkedList.indexOf(item) >= 0;
        });
        context.dismiss();
        this.init(this.tableSearchList);
        this.updateWebViewPage();
    }

    /**
     * selectDelete
     * @param item 参数
     */
    public selectDelete(item) {
        this.tableSearchList.forEach(val => {
            if (val.tid === item.tid) {
                val.show = false;
            }
        });
        this.init(this.tableSearchList);
        this.updateWebViewPage();
    }

    /**
     * onSearch
     * @param value 参数
     */
    onSearch(value: string): void {
        if (value === '' || value === undefined) {
            this.tableSearchList.forEach((val) => {
                val.show = false;
            });
        } else {
            this.tableSearchList.forEach((val) => {
                val.params.indexOf(value) > -1 ? val.show = true : val.show = false;
            });
        }
        this.init(this.tableSearchList);
    }

    /**
     * fuzzyQuery
     * @param list 参数一
     * @param keyWord 参数二
     * @param value 参数三
     */
    public fuzzyQuery(list, keyWord, value) {
        // 模糊查询;
        // 修改为匹配tid由后端查询
        if (value === '' || value === undefined) {
            return list;
        }
        const arr = [];
        for (const item of list) {
            if (item[keyWord].indexOf(value) >= 0) {
                arr.push(item);
            }
        }
        return arr;
    }

    /**
     * stateUpdate
     * @param tiTable 参数
     */
    public stateUpdate(tiTable: TiTableComponent): void {
        this.init(this.tableSearchList);
    }
    /**
     * 筛选 鼠标移入
     */
    public mouseenter() {
        this.filterSrc = './assets/img/filterHover.svg';
        this.updateWebViewPage();
    }
    /**
     * 筛选 鼠标移出
     */
    public mouseleave() {
        this.filterSrc = './assets/img/filterNormal.svg';
        this.updateWebViewPage();
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
    /**
     * addFunctionTab
     * @param row 参数
     * @param whitch 参数
     */
     addFunctionTab(row: any, whitch: any) {
        this.srcData.data.forEach((item: any) => {
            if (row.pId === item.id) {
              const tid = item.tid.replace(/[^0-9]/ig, '');
              row.lockTid = tid;
            }
          });
        const params = {
            'node-id': this.nodeid,
            'query-type': 'source_code',
            'lock-tid': row.lockTid,
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
                    sourceCodeData = data.source.map((item, index) => {
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
                const assemblyCodeData = [];
                if (Array.isArray(data.bbb)) {
                    data.bbb.forEach((item) => {
                        const obj = {
                            ...item,
                            offset: item.offset,
                            line: +item.line,
                            ins: item.ins,
                            count: +item.CPU_CYCLES.split('(')[0],
                            proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
                        };

                        if (item.ins_list) {
                            obj.children = item.ins_list.map(ins => {
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
}
