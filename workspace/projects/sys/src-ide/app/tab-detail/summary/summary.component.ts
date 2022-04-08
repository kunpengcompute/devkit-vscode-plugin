import { Component, OnInit, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MytipService } from '../../service/mytip.service';
import { I18nService } from '../../service/i18n.service';
import { TableService } from '../../service/table.service';
import {COLOR_THEME, hasParentProp, VscodeService} from '../../service/vscode.service';
import { Utils } from '../../service/utils.service';
@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    i18n: any;
    public noDataInfo: any;
    public epTime;
    public axiosStatus = 0;
    constructor(
        public mytip: MytipService,
        public i18nService: I18nService,
        public tableService: TableService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public currTheme = COLOR_THEME.Dark;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    public columns: Array<TiTableColumns> = [];

    public totalResults: any = {
        Elapsed: '',
        ElapsedDigitsInfo: undefined, // Elapsed 的 管道符转换标准
        Cycles: '',
        Instructions: '',
        IPC: ''
    };

    public platformInfo: any = {
        system: '',
        name: '',
        size: '',
        startTime: '',
        endTime: ''
    };

    public language = 'zh';
    // 优化建议提示
    public suggestMsg: any = [];
    public suggestMsgTotalResult: any = [];
    public suggestMsgFunction: any = [];
    public fnMsgFlag = false;
    public resultMsgFlag = false;

    /**
     * 打开源代码也
     * @param row 列
     */
    public addFunctionTab(row) {
        const params = {
            'node-id': encodeURIComponent(this.nodeid),
            func: encodeURIComponent(row.function),
            module: encodeURIComponent(row.module),
            'nav-name': 'Code',
            javamix: row.hasOwnProperty('Type') ? parseInt(row.Type, 10) : 0,
            field: 'CPU_CYCLES',
        };
        this.vscodeService.get({
            url: `/tasks/${this.taskid}/common/code-mapping/?`
                + Utils.converUrl(params)
        }, async (res) => {
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
                }else {
                  if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
                      const svgResp: any = await this.getSvgPathData(data);
                      if (svgResp.length > 0) {
                          svgpath = svgResp;
                      }
                  }
                }

                this.vscodeService.postMessage({
                    cmd: 'openNewPage', data: {
                        router: 'addfunction',
                        panelId: 'cplusSummuryFunction',
                        viewTitle: this.i18n.mission_create.cPlusPlus,
                        message: {
                            functionName: row.function,
                            nodeid: this.nodeid,
                            taskid: this.taskid,
                            taskType: 'lock',
                            headers: JSON.stringify([
                                { label: this.i18n.common_term_task_tab_function_hard, content: 'CPU Cycles' },
                                { label: this.i18n.common_term_task_tab_function_total,
                                    content: data.pmutotal.CPU_CYCLES },
                                { label: this.i18n.common_term_task_tab_function_name, content: data.filename },
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
        });
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
     * 刷新
     */
    public refreshStatistics() {
        const paramSummary = {
            nodeid: this.nodeid,

            projectname: this.projectName,

            nav_name: 'Summary'
        };
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/common/total-results/?node-id=' +
                paramSummary.nodeid + '&nav-name=Summary'
        },
            (resp) => {
                if (resp.data) {
                    resp.data.forEach((val, i) => {
                        if (val.metric === 'Elapsed Time(s)') {
                            this.totalResults.Elapsed = val.value;
                        }
                        if (val.metric === 'Cycles') {
                            this.totalResults.Cycles = val.value;
                        }
                        if (val.metric === 'Instructions') {
                            this.totalResults.Instructions = val.value;
                        }
                        if (val.metric === 'IPC') {
                            this.totalResults.IPC = val.value;
                        }
                    });

                    const length = resp.data.length;
                    this.setSuggestionsTotalResults(resp.data[length - 1]);
                    this.resultMsgFlag = true;
                }
            });
    }
    /**
     * 刷新信息
     */
    public refreshInfo() {
        const paramSummary = {
            nodeid: this.nodeid,

            projectname: this.projectName,

            nav_name: 'Summary'
        };
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/common/platform/?node-id=' + paramSummary.nodeid + '&nav-name=Summary'
        }, (resp) => {
            if (resp.data) {
                this.platformInfo.system = resp.data[0]['Operating System'];
                this.platformInfo.name = resp.data[0]['Computer Name'];
                this.platformInfo.size = resp.data[0]['Result Size'];
                this.platformInfo.startTime = resp.data[0]['Collection start time'];
                this.platformInfo.endTime = resp.data[0]['Collection end time'];
            }
        });
    }

    /**
     * 设置优化建议集合
     */
    public setSuggestionsFunction(data) {
        if (data && data.length) {
            data.map(item => {
                if (item.suggestion) {
                    this.suggestMsgFunction.push({
                        title: this.language === 'zh' ? item.suggestion.title_chs : item.suggestion.title_en,
                        msgbody: this.language === 'zh' ? item.suggestion.suggest_chs : item.suggestion.suggest_en
                    });
                }
            });
            // 去重
            if (this.suggestMsgFunction && this.suggestMsgFunction.length > 1) {
                this.suggestMsgFunction = this.clearSuggestMsg();
            }
            this.setFinalSuggestions();
        }
    }

    /**
     * set 所有 suggestions
     */
    setFinalSuggestions() {
        if (this.fnMsgFlag && this.resultMsgFlag) {
            this.suggestMsg = [...this.suggestMsgFunction, ...this.suggestMsgTotalResult];
        }
    }

    /**
     * 去重数据
     */
    public clearSuggestMsg() {
        const cloneArr = JSON.parse(JSON.stringify(this.suggestMsgFunction));
        for (let i = 0; i < cloneArr.length; i++) {
            for (let j = i + 1; j < cloneArr.length; j++) {
                if (cloneArr[i].title === cloneArr[j].title) {
                    cloneArr.splice(j, 1);
                    j--;
                }
            }
        }

        return cloneArr;
    }

    /**
     * total-results 设置优化建议
     */
    public setSuggestionsTotalResults(data) {
        if (data && data.length) {
            data.map(item => {
                this.suggestMsgTotalResult.push({
                    title: this.language === 'zh' ? item.title_chs : item.title_en,
                    msgbody: this.language === 'zh' ? item.suggest_chs : item.suggest_en
                });
            });
        }
    }

    /**
     * 刷新top10
     */
    public refreshTop10() {
        this.axiosStatus = 1;
        const functionparam = {
            'node-id': this.nodeid,
            'nav-name': 'Configuration',
            key: '',
            core: '',
            module: '',
            tid: ''

        };
        let functionURL = '/CAnalysis/GetTopDownFuncs';
        if (this.analysisType === 'C/C++ Program') {
            functionURL = `/tasks/${this.taskid}/c-analysis/topdown-funcs/`;
        } else {
            functionURL = `/tasks/${this.taskid}/java-analysis/funcs/`;
        }
        functionURL = functionURL + '?' + Utils.converUrl(functionparam);
        const paramTophotspots = {
            nodeid: this.nodeid,

            projectname: this.projectName,

            nav_name: 'tophotspots'
        };
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/common/top-hotspots/?node-id='
                + paramTophotspots.nodeid + '&nav-name=tophotspots'
        },
            (resp) => {
                if (resp.data) {
                    if (JSON.stringify(resp.data) === '{}') { resp.data = []; }
                    const tableData = resp.data;
                    tableData.forEach((val, i) => {
                        const item = tableData[i];

                        if (typeof tableData[i]['time(s)'] === 'string') {
                            tableData[i].time = +tableData[i]['time(s)'];
                        } else {
                            tableData[i].time = tableData[i]['time(s)'];
                        }
                        if (this.analysisType === 'C/C++ Program') {
                            tableData[i].cycles_num = tableData[i].cycles;
                        } else {
                            tableData[i].cycles_num =
                                Number(tableData[i].cycles.slice(0, tableData[i].cycles.indexOf('(')));
                        }

                        if (item.suggestion) {
                            item.suggestion.forEach(suggestion => {
                                if (Object.prototype.toString.call(suggestion) === '[object Object]') {
                                    item.tipStr = suggestion.suggest_chs ? this.language === 'zh' ?
                                        suggestion.suggest_chs : suggestion.suggest_en : 'NULL';
                                } else if (suggestion.indexOf('https') > -1) {
                                    let urlString = suggestion.slice(suggestion.indexOf('https'));
                                    if (urlString.charAt(urlString.length - 1) === '.') {
                                        urlString = urlString.slice(0, urlString.length - 1);
                                    }
                                    item.suggestion_url = suggestion.replace(urlString, '');
                                    item.urlArr = urlString.split(' ').filter(el => el);
                                }
                            });
                        } else if (item.Function === 'do_csum.part.0') {
                            item.tipStr = 'NULL';
                        }
                    });
                    // 获取所有的函数/调用栈
                    this.vscodeService.get({ url: functionURL }, (res) => {
                        if (res.code.includes('Success')) {
                            tableData.forEach(target => {
                                const temp = res.data.find(item => {
                                    return item.Function === target.function;
                                });
                                if (temp !== undefined) {
                                    if (temp.hasOwnProperty('Type')) {
                                        target.Type = parseInt(temp.Type, 10);
                                    } else {
                                        target.Type = 0;
                                    }
                                } else {
                                    target.Type = 0;
                                }
                                this.srcData.data = tableData;
                            });
                            if (tableData.length === 0) {
                                this.axiosStatus = 2;
                            }

                            this.setSuggestionsFunction(res.data);
                            this.fnMsgFlag = true;
                            this.setFinalSuggestions();
                        } else {
                            this.srcData.data = tableData;
                            this.axiosStatus = 2;
                        }
                    });
                } else {
                    this.axiosStatus = 2;
                }
            });

        this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }

    /**
     *  复制URL
     * @param num  数量
     */
    public copyUrl(num) {
        let ele: any;
        if (num === 0) {
            ele = document.querySelectorAll('.url_copy')[0];
        } else if (num === 1) {
            ele = document.querySelectorAll('.url_copy')[1];
        } else {
            ele = document.querySelectorAll('.url_copy')[2];
        }
        ele.select();
        document.execCommand('copy'); // 执行浏览器复制命令
        if (document.execCommand('copy')) {
            this.vscodeService.showInfoBox(this.i18n.sys.copy_success, 'info');
        }
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        this.language = I18nService.getLang() === 0 ? 'zh' : 'en';
        this.initCol();
        this.refreshStatistics();
        this.refreshInfo();
        this.refreshTop10();
    }
    /**
     * 处理col数据
     */
    public initCol() {
        this.vscodeService.get({ url: '/tasks/' + this.taskid + '/common/configuration/?node-id=' + this.nodeid },
            (res) => {
                const ecpAnalysisType = res.data['analysis-target'];
                if (ecpAnalysisType.indexOf('Launch') > -1) {
                    this.epTime = this.i18n.common_term_task_tab_summary_launch_time;
                    this.totalResults.ElapsedDigitsInfo = '0.6-6';
                } else if (ecpAnalysisType.indexOf('Attach') > -1 || ecpAnalysisType.indexOf('Profile') > -1) {
                    this.epTime = this.i18n.common_term_task_tab_summary_other_time;
                } else {
                    this.epTime = this.i18n.common_term_task_tab_summary_launch_time;
                    this.totalResults.ElapsedDigitsInfo = '0.6-6';
                }
                this.columns = [
                    {
                        title: this.i18n.common_term_task_tab_summary_function,
                        sortKey: 'function',
                    },
                    {
                        title: this.i18n.common_term_task_tab_summary_module,
                        sortKey: 'module',
                    },
                    {
                        title: this.i18n.common_term_task_tab_summary_cycles,
                        sortKey: 'cycles_num',
                    },
                    {
                        title: this.i18n.common_term_task_tab_summary_cyclesProportion,
                        sortKey: 'cycles_percent',
                    },
                    {
                        title: this.i18n.common_term_task_tab_summary_times,
                        sortKey: 'time',
                    }
                ];
                this.noDataInfo = this.i18n.common_term_task_nodata;
            });

    }

    /**
     * 转换 时钟周期百分比
     */
    public getPercent(row) {
        return row.cycles_percent ? ((Number(row.cycles_percent) * 100).toFixed(2)) + '%' : '0%';
    }
    /**
     * 判断非number
     * @param num 输入
     * @returns boolean
     */
    public isNaN(num: any){
        return isNaN(num);
      }
}
