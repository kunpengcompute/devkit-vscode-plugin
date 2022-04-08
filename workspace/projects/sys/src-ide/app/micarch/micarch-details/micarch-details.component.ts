import { Component, OnInit, Input, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import {hasParentProp, VscodeService} from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { TiTableColumns, TiTableSrcData, TiPageSizeConfig } from '@cloud/tiny3';
import { TableService } from '../../service/table.service';
import { Utils } from '../../service/utils.service';

@Component({
    selector: 'app-micarch-details',
    templateUrl: './micarch-details.component.html',
    styleUrls: ['./micarch-details.component.scss']
})
export class MicarchDetailsComponent implements OnInit {
    @Input() taskid: any;
    @Input() nodeid: any;

    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() isActive: any;
    @Input() configuration: any;

    @ViewChild('subModuleFunction', { static: false }) subModuleFunction: any;

    public i18n: any;
    public functionOptions: Array<any> = [];
    public functionSelected: any = '';

    public selectOption: any;
    public optionList = [
        {
            list: [ // 函数/调用栈
                { key: 'Function' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: '',
            checked: true
        }, {
            list: [ // 模块 函数 调用栈
                { key: 'Module' },
                { key: 'Function' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: ''
        }, {
            list: [
                { key: 'Thread' },
                { key: 'Function' },
                { key: 'Call Stack' },
            ],
            label: ''
            , value: ''
        }, {
            list: [
                { key: 'Core' },
                { key: 'Thread' },
                { key: 'Function' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: ''
        }, {
            list: [
                { key: 'Process' },
                { key: 'Function' },
                { key: 'Thread' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: ''
        }, {
            list: [
                { key: 'Process' },
                { key: 'Thread' },
                { key: 'Module' },
                { key: 'Function' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: ''
        }, {
            list: [
                { key: 'Process' },
                { key: 'Module' },
                { key: 'Thread' },
                { key: 'Function' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: '',
        }, {
            list: [
                { key: 'Process' },
                { key: 'Module' },
                { key: 'Function' },
                { key: 'Thread' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: '',
        }, {
            list: [
                { key: 'Function' },
                { key: 'Thread' },
                { key: 'Core' },
                { key: 'Call Stack' },
            ],
            label: '',
            value: '',
        },
    ];

    public columns: Array<TiTableColumns> = [];
    // 列表中的 field 不转换为百分比
    public notTurnIntoPercentageProp = ['name', 'Cycles', 'Instructions', 'IPC', 'ModulePath', 'pid', 'tid'];
    // 需要添加百分号的字段【不添加百分号的字段比较少，所以每次计算columns时在计算下这个】
    public addPercentSignFields = [];
    public allColumns = [];
    public theads = [];
    public tableData = [];
    public srcData: TiTableSrcData;
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: TiPageSizeConfig = {
        options: [10, 20, 50, 100],
        width: '60px',
        size: 20
    };
    public showLoading = false;

    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        public mytip: MytipService,
        public tableService: TableService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.i18n = this.i18nService.I18n();

        // 下拉框
        const optionKeyList = {
            Function: this.i18n.common_term_task_tab_summary_function,
            'Call Stack': this.i18n.common_term_task_tab_summary_callstack,
            Module: this.i18n.common_term_task_tab_summary_module,
            Thread: this.i18n.common_term_task_tab_summary_thread,
            Core: this.i18n.common_term_task_tab_summary_core,
            Class: this.i18n.common_term_task_tab_summary_class,
            Method: this.i18n.common_term_task_tab_summary_method,
            Process: this.i18n.common_term_projiect_task_process,
        };

        this.optionList.forEach(option => {
            if (!option.label && option.list) {
                option.label = option.list.map(item => optionKeyList[item.key]).join('/');
            }
        });

        this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
            // 已经做过的，tiny就不再做了
            // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
            // 本示例中，开发者没有设置分页、搜索和排序这些特性，因此tiny不会对数据进行进一步的处理
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }

    /**
     * 初始化函数
     */
    ngOnInit() {
        setTimeout(() => {
            this.subModuleFunction.init({});
        }, 0);
        this.updateWebViewPage();
    }

    /**
     * 展开表头
     * @param column 列
     */
    public expandColumn(column) {
        column.expand = !column.expand;
        // 计算出表头
        // rowspan: 最下一层的rowspan为最大层级减去item的层级，用isLastRow标识
        // colspan: 如果index不为0，则依次递归父级colspan++
        const heads = [];
        const columns = [];
        let maxLevel = 1;
        function addHead({ list, parentList, level }) {
            list.forEach((item, index) => {
                if (!heads[level]) {
                    heads[level] = [];
                }

                item.isLastRow = true;
                item.level = level;
                item.colspan = 1;
                heads[level].push(item);
                columns.push(item);
                if (index) {
                    parentList.forEach(parent => {
                        parent.colspan++;
                    });
                }

                if (item.expand && item.children) {
                    item.isLastRow = false;
                    item.rowspan = 1;
                    item.align = 'center';
                    columns.pop();
                    if (level + 2 > maxLevel) {
                        maxLevel = level + 2;
                    }
                    addHead({
                        list: item.children,
                        parentList: [...parentList, item],
                        level: level + 1
                    });
                }
            });
        }
        addHead({
            list: this.allColumns[0].children,
            parentList: [this.allColumns[0]],
            level: 0,
        });

        // 处理rowspan
        heads.forEach(head => {
            head.forEach(item => {
                if (item.isLastRow) {
                    item.rowspan = maxLevel - item.level;
                }
            });
        });

        this.theads = heads;
        this.columns = columns;

        // 解决最大值的问题
        // 需要比较大小的字段列表
        const fields = [];
        columns.forEach(item => {
            if (!this.notTurnIntoPercentageProp.includes(item.prop)) {
                fields.push(item.prop);
            }
        });
        this.addPercentSignFields = fields;
        function calcMax(children) {
            children.forEach(child => {
                let maxValue = -Infinity;
                fields.forEach(field => {
                    if (+child[field] > maxValue) {
                        maxValue = +child[field];
                        child.maximumField = field;
                    }
                });

                if (child.children) {
                    calcMax(child.children);
                }
            });
        }
        calcMax(this.tableData);
    }

    /**
     * 下拉框的选项改变时
     * @param param0 option
     */
    public selectChange({ option }): void {
        this.selectOption = option;

        this.tableData = [];

        this.allColumns = [{
            title: 'all',
            prop: 'all',
            expand: false,
            rowspan: 1,
            colspan: 1,
            children: []
        }];

        this.getChildren({
            node: {
                children: this.tableData,
                levelIndex: -1,
            }
        });
        this.updateWebViewPage();
    }

    /**
     * 获取子数据
     * @param param0 node
     */
    public getChildren({ node }): void {
        // 如果选项禁用，跳出
        if (node.disabled) {
            return;
        }

        node.expand = !node.expand;

        if (node.expand && !node.hasGetChildren) {
            this.getTableData({
                tableData: node.children,
                node
            });
        } else {
            this.srcData.data = this.getTreeTableArrAndColumns(this.tableData);
            this.totalNumber = this.srcData.data.length;
        }
        this.updateWebViewPage();
    }

    /**
     * 获取表格数据
     * @param param0 func
     */
    public getTableData({ tableData, node }) {
        this.showLoading = true;
        const params: any = {
            nodeId: this.nodeid,
        };
        const list = this.selectOption.list.map(option => option.key);

        const levelIndex = node.levelIndex + 1;
        const level = list[levelIndex];
        const nextLevel = list[levelIndex + 1];
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
          params.metric = level === 'Call Stack' ? 'Call+Stack' : level;
        } else {
          params.metric = level;
        }
        const options = {
            url:
                `/tasks/${this.taskid}/microarchitecture/func-callstacks/?nodeId=${this.nodeid}&metric=${params.metric}`
        };
        if (levelIndex) {
            params.filter = list.slice(0, levelIndex).join('|');
            params.value = node.interfaceValue;
            options.url += `&filter=${encodeURIComponent(params.filter)}&value=${encodeURIComponent(params.value)}`;
        }
        this.vscodeService.get(options, data => {
            const detail = data.data.detail;
            const levelInfo = this.selectOption.list.find(option => option.key === level);

            // 如果是空数据，去掉前面的展开按钮
            if (!detail.content || !detail.content.length) {
                node.children = undefined;
            } else {
                // callstack使用详情展开+表格嵌套
                if (level === 'Call Stack') {
                    node.details = {
                        currentPage: 1,
                        totalNumber: detail.content.length,
                        displayed: [],
                        pageSize: {
                            options: [10, 20, 50, 100],
                            width: '60px',
                            size: 10
                        },
                        columns: [
                            { title: this.i18n.common_term_task_tab_summary_callstack, prop: 'callstack' },
                            { title: this.i18n.common_term_task_tab_summary_cycles, prop: 'cycles' },
                            {
                                title: this.i18n.common_term_task_tab_summary_cyclesProportion,
                                prop: 'cycles proportion'
                            },
                            { title: this.i18n.common_term_task_tab_summary_instructions, prop: 'instructions' },
                            {
                                title: this.i18n.common_term_task_tab_summary_instructionProportion,
                                prop: 'instruction proportion'
                            },
                            { title: this.i18n.common_term_task_tab_summary_ipc, prop: 'ipc' },
                        ],
                        srcData: {
                            data: detail.content.map(item => {
                                return {
                                    callstack: item[0],
                                    cycles: item[1],
                                    'cycles proportion': item[2] === 'NaN'
                                        ? 'NaN' : ((item[2] * 100).toFixed(2) + '%'),
                                    instructions: item[3],
                                    'instruction proportion': item[4] === 'NaN'
                                        ? 'NaN' : ((item[4] * 100).toFixed(2) + '%'),
                                    ipc: item[5],
                                };
                            }),
                            state: {
                                searched: false, // 源数据未进行搜索处理
                                sorted: false, // 源数据未进行排序处理
                                paginated: false // 源数据未进行分页处理
                            }
                        }
                    };
                } else {
                    // 计算数据列在表头中的对应
                    const { expandColumns } = this.parseTitle(detail.title);

                    // -- 填充数据 --
                    detail.content.forEach((content, index) => {

                        const rowData: any = {};
                        expandColumns.forEach((column, columnIndex) => {
                            rowData[column.prop] =
                                typeof column.parseData === 'function'
                                    ? column.parseData(content[columnIndex]) : content[columnIndex];
                        });
                        // 查询下级时的筛选条件,模块是传模块路径；其他的是传名称
                        const interfaceValue = level === 'Module' ? rowData.ModulePath : rowData.name;
                        const row: any = {
                            expand: false,
                            interfaceValue: node.interfaceValue
                                ? `${node.interfaceValue}|${interfaceValue}` : interfaceValue,
                            children: [],
                            hasGetChildren: false,
                            level,
                            levelIndex,
                            id: `${Date.now()}_${index}`,
                            disabled: levelInfo.disabled,
                            tip: levelInfo.tip,
                            ...rowData,
                        };

                        if (nextLevel === 'Call Stack') {
                            row.hasDetails = true;
                        }

                        if (!index) { // 保存下表头信息，用来在展开折叠列时动态计算表头【接口获取的title都是重复的，保存一个就够了】
                            row.title = JSON.stringify(detail.title);
                        }

                        tableData.push(row);
                    });

                    // 如果是顶层数据
                    if (level === this.selectOption.list[0].key) {
                        // 算下总条数
                        this.totalNumber = this.srcData.data.length;
                    }

                    this.srcData.data = this.getTreeTableArrAndColumns(this.tableData);
                    this.totalNumber = this.srcData.data.length;
                }

                node.hasGetChildren = true;
                this.showLoading = false;
                this.updateWebViewPage();
            }
        });
    }


    /**
     * 将有层级结构的树表数据扁平化，同时动态计算表头
     */
    public getTreeTableArrAndColumns(tableData) {
        const data = [];
        const nameList = this.selectOption.list.map(option => option.key);
        const finalTitle = {}; // 最终的表头
        const addToFinalTitle = (field: any, title: any, prefix: any, numIterator: any) => {
            if (finalTitle[field]) { // 例：如果5-1已存在，则改为5-2再次循环
                addToFinalTitle(`${prefix}${++numIterator}`, title, prefix, numIterator);
            } else {
                finalTitle[field] = title;
            }
        };
        const titleList = []; // 所有的title，如果没有再添加
        const hasCalcTitle = []; // 每次先判断下 title 是否计算过，可以提高性能

        const addData = children => {
            children.forEach(child => {
                data.push(child);

                if (child.title && !hasCalcTitle.includes(child.title)) {  // 如果 child 有 title ，且是新类型，才计算
                    this.sortTitle(JSON.parse(child.title)).forEach((column: any) => {
                        if (!titleList.includes(column.title)) {
                            addToFinalTitle(column.field, column.title, column.prefix, column.numIterator);
                            titleList.push(column.title);
                        }
                    });
                    hasCalcTitle.push(child.title);
                }

                if (child.expand && child.children) {
                    addData(child.children);
                }
            });
        };
        addData(tableData);
        // 计算表头
        const { columns } = this.parseTitle(finalTitle);
        this.allColumns[0].children = columns;
        this.expandColumn(this.allColumns);

        return data;
    }
    // 对后端返回title字段进行排序
    private sortTitle(titleList) {
        /**
         * 根据 title 生成表头，目前图灵返回的数据是以深度优先进行排序，以
         * Field 4: "Retiring"
         * Field 5: "Front-End Bound"
         * Field 5-0: "Fetch Latency Bound"
         * Field 5-1: "Fetch Bandwidth Bound"
         * Field 6: "Bad Speculation"为例：
         *  1、判断Filed 4，有，添加Filed 4，深入
         *  2、判断Field 4-0，无，且不是最外层，跳出
         *  3、判断Field 5，有，添加Field 5，深入
         *  4、判断Filed 5-0，有，添加Filed 5-0，深入
         *  5、判断Field 5-0-0，无，且不是最外层，跳出
         *  6、判断Field 5-1，有，添加Field 5-1，深入
         *  7、判断Field 5-1-0，无，且不是最外层，跳出
         *  8、判断Field 5-2，无，且不是最外层，跳出
         *  9、判断Filed 6，有，添加Filed 6，深入
         *  10、判断Field 6-0，无，且不是最外层，跳出
         *  11、判断Field 7，无，且已是最外层，结束
         */

        const columns = []; // 排序之后的titleList
        const nameList = this.selectOption.list.map(option => option.key);

        const addTitle = ({ history, current }: {
            history: any[], // current的迭代
            current: {  // 当前需要判断的
                prefix: string, // 前缀
                numIterator: number,  // 偏移
            },
        }) => {
            const field = `${current.prefix}${current.numIterator}`;
            const title = nameList.includes(titleList[field]) ? 'name' : titleList[field];

            if (title) {  // 有
                // 1、添加
                columns.push({
                    field,
                    title,
                    prefix: current.prefix,
                    numIterator: current.numIterator
                });

                // 2、深入
                addTitle({
                    history: history.concat(current),
                    current: {
                        prefix: `${current.prefix}${current.numIterator}-`,
                        numIterator: 0,
                    },
                });
            } else {  // 无
                // 1、判断是否是最外层
                if (history.length) { // 不是最外层，跳出
                    current = history.pop();
                    addTitle({
                        history,
                        current: {
                            prefix: current.prefix,
                            numIterator: ++current.numIterator,
                        },
                    });
                } else {  // 是最外层，结束
                    return;
                }
            }
        };

        addTitle({
            history: [],
            current: {
                prefix: 'Field ',
                numIterator: 0,
            },
        });

        return columns;
    }

    /**
     * 将数据返回的 title 转换为需要的 columns 和 expandColumns
     */
    public parseTitle(titleList) {
        /**
         * 根据 title 生成表头，目前图灵返回的数据是以深度优先进行排序，以
         * Field 4: "Retiring"
         * Field 5: "Front-End Bound"
         * Field 5-0: "Fetch Latency Bound"
         * Field 5-1: "Fetch Bandwidth Bound"
         * Field 6: "Bad Speculation"为例：
         *  1、判断Filed 4，有，添加Filed 4，深入
         *  2、判断Field 4-0，无，且不是最外层，跳出
         *  3、判断Field 5，有，添加Field 5，深入
         *  4、判断Filed 5-0，有，添加Filed 5-0，深入
         *  5、判断Field 5-0-0，无，且不是最外层，跳出
         *  6、判断Field 5-1，有，添加Field 5-1，深入
         *  7、判断Field 5-1-0，无，且不是最外层，跳出
         *  8、判断Field 5-2，无，且不是最外层，跳出
         *  9、判断Filed 6，有，添加Filed 6，深入
         *  10、判断Field 6-0，无，且不是最外层，跳出
         *  11、判断Field 7，无，且已是最外层，结束
         */
        const columns = []; // 用来生成表头
        const expandColumns = []; // 用来给接口返回的 content 提供位置对应
        const predefinedColumn = {  // 预定义的表头
            name: {
                title: this.selectOption.label,
                prop: 'name',
            },
            Cycles: {
                title: this.i18n.common_term_task_tab_summary_cycles,
                prop: 'Cycles',
            },
            Instructions: {
                title: this.i18n.common_term_task_tab_summary_instructions,
                prop: 'Instructions',
            },
            Ipc: {
                title: this.i18n.common_term_task_tab_summary_ipc,
                prop: 'Ipc',
            },
            ModulePath: {
                title: this.i18n.common_term_task_tab_summary_modulePath,
                prop: 'ModulePath',
            },
            pid: {
                title: this.i18n.common_term_task_crate_pid,
                prop: 'pid',
            },
            tid: {
                title: this.i18n.common_term_task_crate_tid,
                prop: 'tid',
            },
        };
        const expandTheads = this.tableService.flat(this.allColumns[0].children);

        const addColumns = ({ history, current }: {
            history: any[], // current的迭代
            current: {  // 当前需要判断的
                column: object, // 局部列
                prefix: string, // 前缀
                numIterator: number,  // 偏移
            },
        }) => {
            let title = titleList[`${current.prefix}${current.numIterator}`];
            if (`${current.prefix}${current.numIterator}` === 'Field 0') { // Filed 0 是 name 字段
                title = 'name';
            }

            if (title) {  // 有
                // 1、添加
                let prop = title;
                if (predefinedColumn[title]) {
                    prop = predefinedColumn[title].prop;
                    title = predefinedColumn[title].title;
                }
                const thead = expandTheads.find(item => item.prop === prop);
                let column;

                if (thead) {  // 如果该表头之前就存在
                    column = {
                        ...thead,
                        children: [],
                    };
                } else {
                    column = {
                        title,
                        prop,
                        expand: false,
                        rowspan: 1,
                        colspan: 1,
                        children: [],
                    };
                }
                expandColumns.push(column);
                if (!['cmdline'].includes(prop)) { // cmdline 不需要添加表头
                    current.column[current.numIterator] = column;

                    // 2、深入
                    addColumns({
                        history: history.concat(current),
                        current: {
                            column: current.column[current.numIterator].children,
                            prefix: `${current.prefix}${current.numIterator}-`,
                            numIterator: 0,
                        },
                    });
                } else {
                    addColumns({
                        history,
                        current: {
                            column: current.column,
                            prefix: current.prefix,
                            numIterator: ++current.numIterator,
                        },
                    });
                }
            } else {  // 无
                // 1、判断是否是最外层
                if (history.length) { // 不是最外层，跳出
                    current = history.pop();
                    addColumns({
                        history,
                        current: {
                            column: current.column,
                            prefix: current.prefix,
                            numIterator: ++current.numIterator,
                        },
                    });
                } else {  // 是最外层，结束
                    return;
                }
            }
        };

        addColumns({
            history: [],
            current: {
                column: columns,
                prefix: 'Field ',
                numIterator: 0,
            },
        });
        return { columns, expandColumns };
    }

    /**
     * 跳转至源码界面
     */
    public addFunctionTab(row) {
        let url1 = '?nodeId=' + this.nodeid + '&func=' + row.name;
        url1 += '&module=' + encodeURIComponent(row.ModulePath) + '&srcDir='
            + this.configuration.taskParam.sourceLocation;
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/microarchitecture/code-mapping/' + url1
        }, async res => {
            const data = res.data.code_mapping ? res.data.code_mapping : res.data;

            if (data.src || data.bbb || data.svg) {

                let total = 0;
                // 格式化源代码
                let sourceCodeData = [];
                if (data.src && Array.isArray(data.src.content)) {
                    const sourceIndex = {
                        line: data.src.title.indexOf('SrcLine'),
                        line_code: data.src.title.indexOf('SrcCode'),
                        count: data.src.title.indexOf('PmuCount'),
                        proportion: data.src.title.indexOf('Proportion'),
                    };

                    sourceCodeData = data.src.content.map((item, index) => {
                        return {
                            id: `source_${index}`,
                            line: +item[sourceIndex.line],
                            line_code: item[sourceIndex.line_code],
                            count: +item[sourceIndex.count],
                            proportion: item[sourceIndex.proportion] === '0'
                                ? 0 : ((item[sourceIndex.proportion] * 100).toFixed(3) + '%'),
                        };
                    });
                }

                // 格式化汇编代码
                const assemblyCodeData = [];
                if (Array.isArray(data.bbb)) {
                  data.bbb.forEach((item, index) => {
                    const obj = {
                      id: item.id,
                      offset: item.IP || item.end,
                      line: +item.SrcLine,
                      ins: item.Instruct || item.ins,
                      count: +item.PmuCount,
                      proportion: item.Proportion === '0' ? 0 : ((item.Proportion * 100).toFixed(3) + '%'),
                      children: [],
                    };
                    if (hasParentProp(item)) {
                      total += +item.PmuCount;
                      assemblyCodeData.push(obj);
                    } else {
                      assemblyCodeData.find(block => block.id === item.parent).children.push(obj);
                    }
                  });
                }
                // 代码流
                let svgpath;
                if (data.svg) {

                    const params = {
                        'svg-name': data.svg,
                        nodeid: data.nodeid,
                    };
                    this.vscodeService.get({
                        url: `/tasks/${this.taskid}/c-analysis/svg-content/?` + Utils.converUrl(params)
                    }, (async svgResp => {
                        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                            svgpath = svgResp.data;
                        }
                        if (svgResp.length > 0) {
                            svgpath = svgResp;
                        }
                    }));
                }

                setTimeout(() => {
                    const message = {
                        functionName: row.name,
                        nodeid: this.nodeid,
                        taskid: this.taskid,
                        taskType: 'lock',
                        headers: JSON.stringify([
                            { label: this.i18n.common_term_task_tab_function_hard, content: 'CPU Cycles' },
                            { label: this.i18n.common_term_task_tab_function_total, content: total },
                            {
                                label: this.i18n.common_term_task_tab_function_name,
                                content: this.configuration.taskParam.sourceLocation
                            }
                        ]),
                        functionDetails: JSON.stringify({
                            sourceCode: {
                                data: sourceCodeData,
                            },
                            assemblyCode: {
                                data: assemblyCodeData,
                            },
                            codeStream: { svgpath },
                        }),
                    };
                    if (sourceCodeData.length >= 0 || assemblyCodeData.length >= 0) {
                        this.vscodeService.postMessage({
                            cmd: 'openNewPage',
                            data: {
                                router: 'addfunction',
                                panelId: 'microarchitectureFunction' + new Date().getTime(),
                                viewTitle: row.name,
                                message
                            }
                        }, null);
                    }
                }, 500);
            } else {
                const message = (res.code === 'SysPerf.Success')
                    ? this.i18n.common_term_task_nodata : res.message ? res.message : this.i18n.common_term_task_nodata;
                this.vscodeService.showInfoBox(message, 'warn');
            }
        });
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
