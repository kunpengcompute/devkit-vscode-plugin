import { Component, OnInit, Input, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef} from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import {COLOR_THEME, currentTheme, VscodeService, hasParentProp} from '../../service/vscode.service';
import { Utils } from '../../service/utils.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-function',
    templateUrl: './function.component.html',
    styleUrls: ['./function.component.scss']
})
export class FunctionComponent implements OnInit, AfterViewInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @ViewChild('table1', { static: true }) table1;
    tabName: any = { name: '_do_soft' };
    @Input()
    public set select(item: any) {
        this.flameSelect = item;
        this.flameFunction = item.functionName;
    }
    public get select() {
        return this.flameSelect;
    }
    public flameSelect: any;
    public flameFunction = ''; // 不为''来判断是从火焰图跳转来的
    public i18n: any;
    public language = 'zh';
    public commonTerms;
    public isLoading = false;
    public widthArr = [{
        outer: 2,
        inside: 24
    }, {
        outer: 20,
        inside: 24
    }, {
        outer: 38,
        inside: 44
    }, {
        outer: 56,
        inside: 66
    }, {
        outer: 74,
        inside: 76
    }];
    constructor(
        public sanitizer: DomSanitizer,
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        private zone: NgZone,
        public changeDetectorRef: ChangeDetectorRef,
        public mytip: MytipService
    ) {
        this.i18n = this.i18nService.I18n();

        // 公共术语对应表
        const commonTerms = {
            Function: this.i18n.common_term_task_tab_summary_function,
            Callstack: this.i18n.common_term_task_tab_summary_callstack,
            Module: this.i18n.common_term_task_tab_summary_module,
            Thread: this.i18n.common_term_task_tab_summary_thread,
            Core: this.i18n.common_term_task_tab_summary_core,
            Class: this.i18n.common_term_task_tab_summary_class,
            Method: this.i18n.common_term_task_tab_summary_method
        };
        this.commonTerms = commonTerms;

        // 解决中英文混杂问题，label后续有用到，就暂时新增了title来作为label，以防影响未知的东西
        this.allOptions = [
            {
                label: 'Function/Callstack View',
                title: `${commonTerms.Function}/${commonTerms.Callstack}`,
                type: 'all'
            },
            {
                label: 'Module/Function/Callstack',
                title: `${commonTerms.Module}/${commonTerms.Function}/${commonTerms.Callstack}`,
                type: 'all'
            },
            {
                label: 'Thread/Function/Callstack',
                title: `${commonTerms.Thread}/${commonTerms.Function}/${commonTerms.Callstack}`,
                type: 'all'
            },
            {
                label: 'Core/Function/Callstack',
                title: `${commonTerms.Core}/${commonTerms.Function}/${commonTerms.Callstack}`,
                type: 'Core'
            },
            {
                label: 'Class/Method/Callstack',
                title: `${commonTerms.Class}/${commonTerms.Method}/${commonTerms.Callstack}`,
                type: 'Class'
            },
            {
                label: 'Function/Thread/Core/Callstack View',
                title: `${commonTerms.Function}/${commonTerms.Thread}/${commonTerms.Core}/${commonTerms.Callstack}`,
                nameList: ['function', 'thread', 'core', 'callstack'],
                type: 'all',
            },
        ];

        this.selectOption = this.allOptions[0];
    }
    public currTheme = COLOR_THEME.Dark;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public id = 0;
    public showTable = true;
    public searchKeys = ['showinTable'];
    public searchWords = ['yes'];
    public moduleName;
    public functionName;
    public coreName;
    public tidName;
    public className;
    public methodNode;
    public notShowList = {};
    public noDataInfo: string;
    public allOptions: Array<any> = [];
    public options: Array<any> = [];
    public selectOption: any;
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    public showFlameTable = true;
    private data: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];
    public treeData: Array<any> = [];

    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 20
    };
    public refreshImgStatus = './assets/img/refreshNormal.svg';
    public refreshImgStatusList = {
        normal: './assets/img/refreshNormal.svg',
        hover: './assets/img/refreshHover.svg',
        click: './assets/img/refreshClick.svg',
    };

    /**
     * 下钻
     * @param row 列
     */
    public addFunctionTab(row) {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            if (row.name !== 'function') { return; }
        }else{
            if (row.name !== 'function') { return; }
            this.isLoading = true;
        }
        const params = {
            'node-id': encodeURIComponent(this.nodeid),
            func: encodeURIComponent(row.Function),
            module: encodeURIComponent(row.Module),
            'nav-name': 'Code',
            javamix: row.hasOwnProperty('Type') ? parseInt(row.Type, 10) : 0,
            field: 'CPU_CYCLES',
        };
        this.vscodeService.get({
            url: `/tasks/${this.taskid}/common/code-mapping/?` + Utils.converUrl(params)
        }, (async res => {
            this.isLoading = false;
            const data = res.data;
            if (data.source || data.bbb || data.svgpath || data.graph_status) {
                // 格式化源代码
                let sourceCodeData = [];
                if (data.source && Array.isArray(data.source.code)) {
                    sourceCodeData = data.source.code.map((item, index) => {
                        return {
                            ...item,
                            id: `source_${index}`,
                            line: +item.line,
                            line_code: item.line_code,
                            count: +item.CPU_CYCLES.split('(')[0],
                            proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
                        };
                    });
                    this.updateWebViewPage();
                }

                // 格式化汇编代码
                const assemblyCodeData = [];
                if (Array.isArray(data.bbb)) {
                  data.bbb.forEach((item, index) => {
                    const obj = {
                      ...item,
                      offset: item.offset,
                      line: +item.line,
                      ins: item.ins,
                      count: +item.CPU_CYCLES_COUNT,
                      proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
                    };
                    if (hasParentProp(item)) {
                      obj.children = [];
                      assemblyCodeData.push(obj);
                    } else {
                      assemblyCodeData.find(block => block.id === item.parent).children.push(obj);
                    }
                  });
                }
                // 代码流
                let svgpath;
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
                      const svgResp: any = await this.getSvgPathData(data);
                      svgpath = svgResp.data;
                    }
                  }else{
                      if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
                    const svgResp: any = await this.getSvgPathData(data);
                    if (svgResp.length > 0) {
                        svgpath = svgResp;
                    }
                }
            }
                this.vscodeService.postMessage({
                    cmd: 'openNewPage',
                    data: {
                        router: 'addfunction',
                        panelId: 'cplusFunFunction',
                        viewTitle: this.i18n.mission_create.cPlusPlus,
                        message: {
                            functionName: row.Function,
                            nodeid: this.nodeid,
                            taskid: this.taskid,
                            taskType: 'lock',
                            headers: JSON.stringify([
                                { label: this.i18n.common_term_task_tab_function_hard, content: 'CPU Cycles' },
                                { label: this.i18n.common_term_task_tab_function_total,
                                    content: data.pmutotal.CPU_CYCLES },
                                { label: this.i18n.common_term_task_tab_function_name, content: data.filename || '--' },
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
                                },
                            }),
                        }
                    }
                }, null);
            } else {  // 无数据
                this.vscodeService.showInfoBox(this.i18n.noSourceData, 'warn');
            }
        }));
    }

    /**
     * 获取代码流数据
     */
    public getSvgPathData(data) {
        return new Promise((resolve, reject) => {
            const params1 = {
                'svg-name': data.svgpath,
                nodeid: data.nodeid,
            };
            this.vscodeService.get({ url: `/tasks/${this.taskid}/c-analysis/svg-content/?` + Utils.converUrl(params1) },
                (svgResp => {
                    resolve(svgResp);
                }));
        });
    }

    /**
     *  初始化
     */
    ngOnInit(): void {
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        if (this.currTheme === this.ColorTheme.Light) {
            this.refreshImgStatus = './assets/img/light-refresh-normal.svg';
            this.refreshImgStatusList = {
                normal: './assets/img/light-refresh-normal.svg',
                hover: './assets/img/light-refresh-hover.svg',
                click: './assets/img/light-refresh-hover.svg',
            };
        }

        if (sessionStorage.getItem('language') === 'en-us') {
            this.language = 'en';
        } else {
            this.language = 'zh';
        }
        const funcName = 'replaceAll';
        String.prototype[funcName] = replaceAll;
        this.noDataInfo = this.i18n.loading;

        this.columns = [
            {
                title: this.selectOption.title,
                width: '16%',
            },
            {
                title: this.i18n.common_term_task_tab_summary_times,
                width: null,
            },
            {
                title: this.i18n.common_term_task_tab_summary_cycles,
                width: null,
            },
            {
                title: this.i18n.common_term_task_tab_summary_cyclesProportion,
                width: null,
            },
            {
                title: this.i18n.common_term_task_tab_summary_instructions,
                width: null,
            },
            {
                title: this.i18n.common_term_task_tab_summary_instructionProportion,
                width: null,
            },
            {
                title: this.i18n.common_term_task_tab_summary_ipc,
                width: null,
            },
            {
                title: this.i18n.common_term_task_tab_summary_module,
                width: null,
            }
        ];
    }
    /**
     * 周期
     */
    ngAfterViewInit() {
        this.getFunctionGroup();
    }
    /**
     * 初始化数据
     */
    public initData(dataList, add) {
        let i = 0;
        this.data = this.getTreeTableArr(dataList);

        if (this.srcData) {
            this.srcData.data.forEach((item, index) => {
                this.data.forEach(item2 => {
                    if (item.uuid === item2.uuid) {
                        if (item2.hasOwnProperty('expand')) {
                            item2.expand = item.expand;
                        }
                    }
                });
            });
        }

        const a = Object.keys(this.notShowList);
        this.data.forEach(item => {
            if (a.indexOf(item.uuid.toString()) > -1) {
                item.isShow = false;

            }
            if (item.isShow === true) { i++; }
        });

        this.totalNumber = i;
        this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: this.data, // 源数据
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
        this.srcData.data = this.data.filter(item => {

            return item.isShow === true;
        });
        this.ifShowTable();
    }

    /**
     * pArray: 父级数据， pLevel: 父级层数
     * 将有层级结构的数据扁平化
     */
    private getTreeTableArr(pArray: Array<any>, pLevel?: number, pId?: any, father?: any, add?: boolean): Array<any> {

        let tableArr: Array<any> = [];
        if (pArray === undefined) {
            return tableArr;
        }
        pLevel = pLevel === undefined ? 0 : pLevel + 1;
        pId = pId === undefined ? 'tiTableRoot' : pId;
        add = add === undefined ? false : true;
        let temp: any;
        pArray.forEach((item, index) => {
            this.id++;
            temp = this.deepClone(item);
            temp.id = this.id;
            delete temp.children;
            temp.level = pLevel;
            pLevel === 0 ? temp.isShow = true : temp.isShow = add;
            temp.pId = pId;
            if (item.hasOwnProperty('father')) {
                temp.father += item.father + '.' + index;
            } else {
                temp.father += father + '.' + index;
            }
            temp.hasChildren = false;
            temp.expand = false;
            temp.isShow = true;
            if (item.Function === 'do_csum.part.0' || item.suggestion) {
                temp.tipStr = item.suggestion == null ?
                    'NULL' : item.suggestion.suggest_chs ? this.language === 'zh' ?
                        item.suggestion.suggest_chs : item.suggestion.suggest_en : 'NULL';
            }
            temp.showinTable = 'yes';
            tableArr.push(temp); // 也可以在此循环中做其他格式化处理

            if (item.children) {
                temp.hasChildren = true;
                if (item.children.length > 0) { temp.expand = true; }

                tableArr = tableArr.concat(this.getTreeTableArr(item.children, pLevel, temp.id, temp.father, false));
            }
        });
        return tableArr;
    }
    /**
     * 返回
     */
    public getFatherInTree(node) {
        const parent = node.father.split('.');
        let str = this.treeData[0];
        for (let j = 1; j < parent.length - 1; j++) {
            str = str.children[parent[j + 1]];
        }
        return str;
    }
    /**
     * 展开
     */
    public toggle(node: any): void {
        if (node.name === 'module') {
            this.moduleName = node.Module;
        } else if (node.name === 'function') {
            this.functionName = node.Function;
            this.moduleName = node.Module;
        } else if (node.name === 'thread') {
            this.tidName = node.Thread;
        } else if (node.name === 'core') {
            this.coreName = node.Core;
        } else if (node.name === 'class') {
            this.className = node.Class;
        } else if (node.name === 'method') { this.methodNode = node; }   // 获取tip数字
        const parent = node.father.split('.');
        const test = this.getFatherInTree(node);
        if (node.expand === false) {
            if (this.selectOption.label === 'Function/Callstack View' && test.children.length === 0) {
                if (parent.length === 2) {
                    this.getFunctionList(node);
                } else if (parent.length === 3) {
                    this.getCallstack(node);
                }
            } else if (this.selectOption.label === 'Module/Function/Callstack' && test.children.length === 0) {
                if (parent.length === 2) {
                    this.getModuleList(node);
                } else if (parent.length === 3) {
                    this.getFunctionList(node);
                } else if (parent.length === 4) { this.getCallstack(node); }
            } else if (this.selectOption.label === 'Thread/Function/Callstack' && test.children.length === 0) {
                if (parent.length === 2) {
                    this.getThreadList(node);
                } else if (parent.length === 3) {
                    this.getFunctionList(node);
                } else if (parent.length === 4) { this.getCallstack(node); }
            } else if (this.selectOption.label === 'Core/Function/Callstack' && test.children.length === 0) {
                if (parent.length === 2) {
                    this.getCoreList(node);
                } else if (parent.length === 3) {
                    this.getFunctionList(node);
                } else if (parent.length === 4) {
                    this.getCallstack(node);
                }
            } else if (this.selectOption.label === 'Class/Method/Callstack' && test.children.length === 0) {
                if (parent.length === 2) {
                    this.getClassList(node);
                } else if (parent.length === 3) {
                    this.getMethodList(node);
                } else if (parent.length === 4) {
                    this.getCallstack(node);
                }
            } else if (this.selectOption.label === 'Function/Thread/Core/Callstack View'
                && test.children.length === 0
            ) {
                if (!node.level) {
                    this.getFunctionList(node);
                } else {
                    const nameList = this.selectOption.nameList;
                    const treeNode = this.getFatherInTree(node);

                    const queryParams = node.queryParams ? JSON.parse(node.queryParams) : {
                        func: '',
                        module: '',
                        tid: '',
                        core: '',
                    };

                    if (node.name === 'function') {
                        queryParams.func = node.Function;
                        queryParams.module = node.Module;
                    } else if (node.name === 'thread') {
                        queryParams.tid = node.Tid;
                    } else if (node.name === 'core') {
                        queryParams.core = node.Core;
                    }

                    const name = nameList[nameList.indexOf(node.name) + 1];

                    if (name === 'callstack') {
                        this.getCallstack(node, queryParams);
                    } else {
                        this.getTableData({ node: treeNode, queryParams, name });
                    }
                }
            }
            node.expand = true;
        } else {
            node.expand = false;
        }
        this.toggleChildren(this.data, node.id, node.expand);

        this.srcData.data = this.data.filter(item => {
            if (item.isShow === false) {
                this.notShowList[item.uuid] = item;
            } else {
                delete this.notShowList[item.uuid];
            }
            return item.isShow === true;
        });

        this.totalNumber = this.srcData.data.length;
    }

    private toggleChildren(data: Array<any>, pId: any, pExpand: boolean): void {
        let i = 0;
        for (const node of data) {
            if (node.pId === pId) {
                i++;
                node.isShow = pExpand; // 处理当前子节点
                if (pExpand === false) {// 折叠时递归处理当前节点的子节点
                    this.toggleChildren(data, node.id, false);
                } else {  // 展开时递归处理当前节点的子节点
                    if (node.expand === true) {
                        this.toggleChildren(data, node.id, true);
                    }
                }
            }
        }
        if (i === 0) {    // 当递归结束的时候  重新给srcdata赋值

            this.srcData.data = this.data.filter(item => {
                return item.isShow === true;
            });
        }
    }

    /**
     * 样式
     */
    public getLevelStyle(node: any): { 'padding-left': string } {
        return {
            'padding-left': `${node.level * 18 + 10}px`
        };
    }

    private deepClone(obj: any): any { // 深拷贝，类似于1.x中的angular.copy()
        if (typeof (obj) !== 'object' || obj === null) {
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
     * 选择数据
     */
    public doSelectOption(e) {    // 下拉框事件
        this.moduleName = '';
        this.functionName = '';
        this.tidName = '';
        this.coreName = '';
        this.className = '';
        this.methodNode = '';
        if (this.srcData) {
            this.srcData.data = [];
        }
        this.data.length = 1;
        if (this.treeData.length > 0) {
            this.treeData[0].children = [];
        }
        this.columns[0].title = e.title;
        this.notShowList = [];
        this.noDataInfo = this.i18n.loading;
        this.getFunctionTop();

        if (e.label === 'Function/Thread/Core/Callstack View') {
            const idx = this.columns.findIndex(el => {
                return el.prop === 'pid' || el.prop === 'tid';
            });
            if (idx === -1) {
                this.columns.push(...[
                    { title: this.i18n.common_term_task_crate_pid, prop: 'pid' },
                    { title: this.i18n.common_term_task_crate_tid, prop: 'tid' },
                ]);
            }
        } else {
            for (let index = 0; index < this.columns.length; index++) {
                if (['pid', 'tid'].includes(this.columns[index].prop)) {
                    this.columns.splice(index--, 1);
                }
            }
        }
    }

    /**
     * 从火焰图跳转过来,找不到函数详情,隐藏table
     */
    public ifShowTable() {
        if (this.flameFunction !== '' && this.srcData.data) {
            if (
                this.selectOption.label === 'Function/Thread/Core/Callstack View'
                || this.selectOption.label === 'Function/Callstack View'
            ) {
                this.showFlameTable = this.srcData.data.length > 1 ? true : false;
            } else {
                this.showFlameTable = this.srcData.data.length > 2 ? true : false;
            }
        }
    }
    /**
     * 获取数据
     */
    public getFunctionTop() {    // 获取总体Function统计信息

        let url = `/tasks/${this.taskid}/c-analysis/total-func-results/?`;
        if (this.analysisType === 'java-mixed-mode') {
            url = `/tasks/${this.taskid}/java-analysis/totals/?`;
        }
        const params = {
            'node-id': this.nodeid,
            'nav-name': 'Function',
            key: ''
        };
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            (async data => {

                data.data[0].children = [];
                data.data[0].id = 0;
                data.data[0].total = 'Total';
                data.data[0].name = 'totalfunction';
                data.data[0].uuid = Utils.generateConversationId(32);
                this.treeData = data.data;
                await this.initData(this.treeData, false);
                const node = this.srcData.data[0];
                if (this.selectOption.type === 'Class' && this.flameFunction !== '') {
                } else {
                    this.toggle(node);
                }
                this.updateWebViewPage();
            }));
    }
    /**
     * 获取数据组
     */
    public getFunctionGroup() {
        const params = {
            'node-id': this.nodeid,
            'nav-name': 'Configuration'
        };
        const url = `/tasks/${this.taskid}/common/function-grouping/?` + Utils.converUrl(params);
        this.vscodeService.get({ url },
            (data => {
                if (data.code.includes('Success')) {
                    const typeList = ['all'];
                    if (data.data.hasCore === 1) {
                        typeList.push('Core');
                    }
                    if (data.data.hasclass === 1) {
                        typeList.push('Class');
                    }

                    this.options = this.allOptions.filter(item => {
                        return typeList.includes(item.type);
                    });
                    this.selectOption = this.options[0];
                    let selectIndex = 0;
                    if (this.flameFunction !== '') {    // 如果是火焰图点击跳转过来的
                        this.showFlameTable = false;
                        this.options.forEach((item, index) => {
                            if (item.label.indexOf('Function/Thread') > -1) {
                                selectIndex = index;
                            }
                        });
                        this.selectOption = this.options[selectIndex];
                        this.doSelectOption(this.selectOption);
                    }
                    this.getFunctionTop();
                } else {
                    this.getFunctionTop();
                }
                this.updateWebViewPage();
            }));
    }
    /**
     * 获取模式数据
     */
    public getModuleList(node) {
        let url = `/tasks/${this.taskid}/c-analysis/topdown-modules/?`;
        if (this.analysisType === 'java-mixed-mode') {
            url = `/tasks/${this.taskid}/java-analysis/modules/?`;
        }

        const fatherInTree = this.getFatherInTree(node);
        const params = {
            'node-id': this.nodeid,
            func: this.flameFunction,
            'nav-name': 'Configuration',
            key: ''
        };
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            (async data => {
                if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
                    data.data = data.data.filter(item => {
                        item.children = item.Module === '[unknown]' ? undefined : [];
                        item.next = 'function';
                        item.name = 'module';
                        item.uuid = Utils.generateConversationId(32);
                        return item['Time(s)'] !== 0;
                    });
                    fatherInTree.children = data.data;
                    await this.initData(this.treeData, true);
                    if (this.flameFunction !== '') {
                        const param = this.srcData.data[1];
                        this.toggle(param);
                    }
                } else {
                    this.noDataInfo = this.i18n.common_term_task_nodata2;
                }
                this.updateWebViewPage();
            }));
    }
    /**
     * 获取theead数据
     */
    public getThreadList(node) {
        let url = `/tasks/${this.taskid}/c-analysis/topdown-threads/?`;
        if (this.analysisType === 'java-mixed-mode') {
            url = `/tasks/${this.taskid}/java-analysis/threads/?`;
        }
        const fatherInTree = this.getFatherInTree(node);
        const params = {
            'node-id': this.nodeid,
            'nav-name': 'Configuration',
            func: this.flameFunction,
            key: ''
        };
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            async data => {
                if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
                    const conData = data.data.filter(item => {
                        item.children = [];
                        item.next = 'function';
                        item.name = 'thread';
                        item.ThreadName = item.Common + '(TID:' + item.Thread + ')';
                        item.uuid = Utils.generateConversationId(32);
                        return item['Time(s)'] !== 0;
                    });
                    fatherInTree.children = conData;
                    node.expand = true;
                    await this.initData(this.treeData, true);
                    if (this.flameFunction !== '') {
                        const param = this.srcData.data[1];
                        this.toggle(param);
                    }
                } else {
                    this.noDataInfo = this.i18n.common_term_task_nodata2;
                }
                this.updateWebViewPage();
            });
    }
    /**
     * 获取core数据
     */
    public getCoreList(node) {
        const fatherInTree = this.getFatherInTree(node);
        const params = {
            'node-id': this.nodeid,
            func: this.flameFunction,
            'nav-name': 'Configuration',
            key: ''
        };
        let url = `/tasks/${this.taskid}/c-analysis/topdown-cores/?`;
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            async data => {
                if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
                    const conData = data.data.filter(item => {
                        item.children = [];
                        item.next = 'function';
                        item.name = 'core';
                        item.uuid = Utils.generateConversationId(32);
                        return item['Time(s)'] !== 0;
                    });
                    const conData1 = conData.sort((a, b) => a.Core - b.Core);  // 排序
                    fatherInTree.children = conData1;
                    await this.initData(this.treeData, true);
                    if (this.flameFunction !== '') {
                        const param = this.srcData.data[1];
                        this.toggle(param);
                    }
                } else {
                    this.noDataInfo = this.i18n.common_term_task_nodata2;
                }
                this.updateWebViewPage();
            });
    }
    /**
     * 获取class数据
     */
    public getClassList(node) {
        const fatherInTree = this.getFatherInTree(node);
        const params = {
            'node-id': this.nodeid,
            'nav-name': 'Configuration',
            key: ''
        };
        let url = `/tasks/${this.taskid}/java-analysis/classes/?`;
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            data => {
                if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
                    data.data = data.data.filter(item => {
                        item.children = [];
                        item.next = 'method';
                        item.name = 'class';
                        item.uuid = Utils.generateConversationId(32);
                        return item['Time(s)'] !== 0;
                    });
                    data.data = data.data.data.sort((a, b) => a.Core - b.Core);  // 排序
                    fatherInTree.children = data.data;
                    this.initData(this.treeData, true);
                } else {
                    this.noDataInfo = this.i18n.common_term_task_nodata2;
                }
                this.updateWebViewPage();
            });
    }
    /**
     * 获取menthod数据
     */
    public getMethodList(node) {
        const fatherInTree = this.getFatherInTree(node);
        const params = {
            'node-id': this.nodeid,
            'nav-name': 'Configuration',
            key: '',
            class: this.className
        };
        let url = `/tasks/${this.taskid}/java-analysis/methods/?`;
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            data => {
                if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
                    data.data = data.data.filter(item => {
                        item.children = [];
                        item.next = 'callstack';
                        item.name = 'method';
                        item.uuid = Utils.generateConversationId(32);
                        return item['Time(s)'] !== 0;
                    });
                    data.data = data.data.sort((a, b) => a.Core - b.Core);  // 排序
                    fatherInTree.children = data.data;
                    this.initData(this.treeData, true);
                } else {
                    this.noDataInfo = this.i18n.common_term_task_nodata2;
                }
                this.updateWebViewPage();
            });
    }

    /**
     * 获取所有函数/调用栈
     */
    public getFunctionList(node) {
        let url = `/tasks/${this.taskid}/c-analysis/topdown-funcs/?`;
        if (this.analysisType === 'java-mixed-mode') {
            url = `/tasks/${this.taskid}/java-analysis/funcs/?`;
        }
        const fatherInTree = this.getFatherInTree(node);
        const params = {
            'node-id': this.nodeid,

            'nav-name': 'Configuration',
            key: '',
            core: this.coreName || '',
            module: this.moduleName || '',
            tid: this.tidName || ''
        };
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            data => {
                if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
                    const conData = data.data.filter(item => {
                        item.children = (item.Function === 'unknown' && item.Module === '[unknown]') ? undefined : [];
                        item.next = 'callstack';
                        item.name = 'function';
                        item.uuid = Utils.generateConversationId(128);
                        return item['Time(s)'] !== 0;
                    });
                    if (this.flameFunction !== '') {
                        fatherInTree.children = data.data.filter(item => {
                            return item.Function.indexOf(this.flameFunction) > -1;
                        });
                        this.noDataInfo = fatherInTree.children.length > 0
                        ? this.i18n.loading : this.i18n.common_term_task_nodata2;
                    } else {
                        fatherInTree.children = conData;
                    }
                    node.expand = true;
                    this.initData(this.treeData, true);
                } else {
                    this.noDataInfo = this.i18n.common_term_task_nodata2;
                }
                this.updateWebViewPage();
            });
        this.updateWebViewPage();
    }

    /**
     * 获取callstack数据
     */
    public getCallstack(node, queryParams?) {
        let url = `/tasks/${this.taskid}/c-analysis/func-callstacks/?`;
        if (this.analysisType === 'java-mixed-mode') {
            url = `/tasks/${this.taskid}/java-analysis/callstacks/?`;
        }
        const fatherInTree = this.getFatherInTree(node);
        const parent = node.father.split('.');
        if (!queryParams) {
            queryParams = {
                key: '',
                module: this.moduleName || '',
                tid: this.tidName || '',
                func: encodeURIComponent(this.functionName) || '',
                core: this.coreName || '',
            };

            if (this.analysisType === 'Java-Mixed-Mode' && this.selectOption.label === 'Class/Method/Callstack') {
                queryParams.func = encodeURIComponent(this.className + ';::' + this.methodNode.Method);
                queryParams.module = this.methodNode.Module;
            }
        }
        const params = {
            'node-id': this.nodeid,
            'nav-name': 'Configuration',
            ...queryParams,
        };
        url += Utils.converUrl(params);
        this.vscodeService.get({ url },
            data => {
                if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
                    data.data = data.data.filter(item => {
                        item.name = 'callstack';
                        item.uuid = Utils.generateConversationId(32);
                        return item['Time(s)'] !== 0;
                    });
                    fatherInTree.children = data.data;

                    this.initData(this.treeData, true);
                } else {
                    fatherInTree.children = undefined;
                    this.initData(this.treeData, true);
                    this.vscodeService.showInfoBox(
                        this.i18nService.I18nReplace(this.i18n.function.noChildren, {
                            0: this.commonTerms.Function,
                            1: this.commonTerms.Callstack,
                        }),
                        'warn',
                    );
                }
                this.updateWebViewPage();
            });
        this.updateWebViewPage();
    }

    /**
     * 获取表格数据
     */
    public getTableData({ node, queryParams, name }) {
        const nameList = this.selectOption.nameList;
        const params = {
            'node-id': this.nodeid,
            'nav-name': 'Configuration',
            ...queryParams,
        };
        const nodeNamePropList = {  // 不同组织方式下的nodeName
            function: param => param.Function,
            thread: param => `Thread(TID:${param.Tid})`,
            core: param => param.Core,
        };
        const option = {
            url: `/tasks/${this.taskid}/c-analysis/topdown-funcsfilter/`,
            params
        };
        this.vscodeService.post(option, (res: any) => {
            node.children = res.data.map((item, index) => {
                return {
                    index,
                    name,
                    nodeName: nodeNamePropList[name](item),
                    uuid: Utils.generateConversationId(32),
                    children: (name === nameList.slice(-1)[0]) ? undefined : [],
                    queryParams: JSON.stringify(queryParams),
                    ...item,
                };
            });
            this.initData(this.treeData, true);
        });
        this.updateWebViewPage();
    }

    /**
     * 将从火焰图跳转过来的筛选状态刷新到初始状态/从分页展开状态刷新到初始状态
     */
    public refreshFunction() {
        this.noDataInfo = this.i18n.loading;
        this.showFlameTable = true;
        this.flameFunction = '';
        this.doSelectOption(this.selectOption);
        this.updateWebViewPage();
    }

    /**
     * 刷新图标状态变化
     */
    public imgStatusChange(status: string) {
        this.refreshImgStatus = this.refreshImgStatusList[status];
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

function replaceAll(s1: any, s2: any) {
    return this.replace(new RegExp(s1, 'gm'), s2);
}


