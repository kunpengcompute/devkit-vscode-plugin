import { Component, OnInit, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';

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
  public epTime: any;
  public axiosStatus = 0;
  constructor(
    private messageService: MessageService,
    private Axios: AxiosService,
    public mytip: MytipService,
    public i18nService: I18nService,
    public tableService: TableService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public obtainingTableData = true;

  public totalResults: any = {
    Elapsed: '',
    ElapsedDigitsInfo: undefined, // Elapsed 的 管道符转换标准
    Cycles: '',
    Instructions: '',
    IPC: ''
  };
  public obtainingTotalResults = true;

  public platformInfo: any = {
    system: '',
    name: '',
    size: '',
    startTime: '',
    endTime: ''
  };
  public obtainingPlatformInfo = true;

  public language = 'zh';
  // 优化建议提示
  public suggestMsg: any = [];
  public suggestMsgTotalResult: any = [];
  public suggestMsgFunction: any = [];
  public fnMsgFlag = false;
  public resultMsgFlag = false;

  public addFunctionTab(row: any) {
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/common/code-mapping/`, {
      headers: {
        mask: false
      },
      params: {
        'node-id': this.nodeid,
        func: row.function,
        module: row.module,
        'nav-name': 'Code',
        javamix: Object.prototype.hasOwnProperty.call(row, 'Type') ? parseInt(row.Type, 10) : 0,
        field: 'CPU_CYCLES',
      }
    }).then(async (res: any) => {
      const data = res.data;

      if (data.source || data.bbb || data.svgpath || data.graph_status) {
        // 格式化源代码
        let sourceCodeData = [];
        if (data.source && Array.isArray(data.source.code)) {
          sourceCodeData = data.source.code.map((item: any, index: any) => {
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
        const assemblyCodeData: any = [];
        if (Array.isArray(data.bbb)) {
          data.bbb.forEach((item: any, index: any) => {
            const obj = {
              ...item,
              offset: item.offset,
              line: +item.line,
              ins: item.ins,
              count: +item.CPU_CYCLES_COUNT,
              proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
            };

            if (item.parent === null) {
              obj.children = [];
              assemblyCodeData.push(obj);
            } else {
              assemblyCodeData.find((block: any) => block.id === item.parent).children.push(obj);
            }
          });
        }

        // 代码流
        let svgpath;
        if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
          const svgResp: any = await this.Axios.axios.get(
            `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/svg-content/`, {
            headers: { mask: false },
            params: {
              'svg-name': data.svgpath,
              nodeid: data.nodeid,
            },
          });

          if (svgResp.length > 0) {
            svgpath = svgResp;
          }
        }

        this.messageService.sendMessage({
          function: 'functionTab',
          msg: {
            functionName: row.function,
            nodeid: this.nodeid,
            taskid: this.taskid,
            taskType: 'lock',
            headers: [
              { label: this.i18n.common_term_task_tab_function_hard, content: 'CPU Cycles' },
              { label: this.i18n.common_term_task_tab_function_total, content: data.pmutotal.CPU_CYCLES },
              { label: this.i18n.common_term_task_tab_function_name, content: data.filename || '--' },
            ],
            functionDetails: {
              sourceCode: {
                data: sourceCodeData,
                message: data?.source?.message
              },
              assemblyCode: {
                data: assemblyCodeData,
              },
              codeStream: {
                svgpath,
                graph_status: data.graph_status,
              },
            },
          }
        });
      } else {  // 无数据
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.noSourceData,
          time: 3500,
        });
      }
    }).catch((e: any) => {});
  }

  /** 获取任务信息来生成统计模块的数据采样时长 */
  private getDataCollectionTime() {
    return new Promise<void>((resolve, reject) => {
      this.Axios.axios.get(
        '/tasks/' + encodeURIComponent(this.taskid) + '/common/configuration/?node-id=' + this.nodeid, {
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
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

        resolve();
      }).catch(() => {
        reject();
      });
    });
  }

  /** 获取统计信息 */
  private getStatisticsInfo() {
    return new Promise<void>((resolve, reject) => {
      const params = {
        'node-id': this.nodeid,
        'nav-name': 'Summary'
      };

      this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/common/total-results/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((resp: any) => {
        if (resp.data) {
          resp.data.forEach((val: { metric: string; value: any; }) => {
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
          this.setFinalSuggestions();
        }

        resolve();
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public refreshStatistics() {
    this.obtainingTotalResults = true;

    Promise.all([this.getDataCollectionTime(), this.getStatisticsInfo()]).finally(() => {
      this.obtainingTotalResults = false;
    });
  }
  public refreshInfo() {
    const paramSummary = {
      nodeid: this.nodeid,

      projectname: this.projectName,

      nav_name: 'Summary'
    };

    this.obtainingPlatformInfo = true;
    this.Axios.axios.get(
      '/tasks/' + encodeURIComponent(this.taskid) + '/common/platform/?node-id=' + paramSummary.nodeid +
     '&nav-name=Summary', {
      headers: {
        showLoading: false,
      }
    })
      .then((resp: any) => {
        if (resp.data) {
          this.platformInfo.system = resp.data[0]['Operating System'];
          this.platformInfo.name = resp.data[0]['Computer Name'];
          this.platformInfo.size = resp.data[0]['Result Size'];
          this.platformInfo.startTime = resp.data[0]['Collection start time'];
          this.platformInfo.endTime = resp.data[0]['Collection end time'];
        }
      })
      .catch((error: any) => {

      })
      .finally(() => {
        this.obtainingPlatformInfo = false;
      });
  }

  /**
   * 设置优化建议集合
   */
  public setSuggestionsFunction(data: any) {
    if (data && data.length) {
      data.map((item: any) => {
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
  public setSuggestionsTotalResults(data: any) {
    if (data && data.length) {
      data.map((item: any) => {
        this.suggestMsgTotalResult.push({
          title: this.language === 'zh' ? item.title_chs : item.title_en,
          msgbody: this.language === 'zh' ? item.suggest_chs : item.suggest_en
        });
      });
    }
  }

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
    const functionURL = `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/topdown-funcs/`;
    const paramTophotspots = {
      nodeid: this.nodeid,

      projectname: this.projectName,

      nav_name: 'tophotspots'
    };

    this.obtainingTableData = true;
    this.Axios.axios.get('/tasks/' + encodeURIComponent(this.taskid) + '/common/top-hotspots/?node-id=' +
     paramTophotspots.nodeid + '&nav-name=tophotspots', {
      headers: {
        showLoading: false,
      }
    })
      .then((resp: any) => {
        if (resp.data) {
          if (JSON.stringify(resp.data) === '{}') { resp.data = []; }
          const tableData = resp.data;
          tableData.forEach((val: { [x: string]: any; time: number; cycles_num: any; cycles: string | string[]; }) => {
            const item = val;

            if (typeof val['time(s)'] === 'string') {
              val.time = +val['time(s)'];
            } else {
              val.time = val['time(s)'];
            }
            if (this.analysisType === 'C/C++ Program') {
              val.cycles_num = val.cycles;
            } else {
              val.cycles_num = Number(val.cycles.slice(0, val.cycles.indexOf('(')));
            }

            if (item.suggestion) {
              item.suggestion.forEach((suggestion: any) => {
                if (Object.prototype.toString.call(suggestion) === '[object Object]') {
                  item.tipStr = suggestion.suggest_chs
                    ? this.language === 'zh'
                      ? suggestion.suggest_chs : suggestion.suggest_en : 'NULL';
                } else if (suggestion.indexOf('https') > -1) {
                  let urlString = suggestion.slice(suggestion.indexOf('https'));
                  if (urlString.charAt(urlString.length - 1) === '.') {
                    urlString = urlString.slice(0, urlString.length - 1);
                  }
                  item.suggestion_url = suggestion.replace(urlString, '');
                  item.urlArr = urlString.split(' ').filter((el: any) => el);
                }
              });
            } else if (item.Function === 'do_csum.part.0') {
              item.tipStr = 'NULL';
            }
        });
          // 获取所有的函数/调用栈
          this.Axios.axios.get(functionURL, {
            params: functionparam,
            headers: {
              showLoading: false,
            }
          }).then((res: any) => {
            tableData.forEach((target: any) => {
              const temp = res.data.find((item: any) => {
                return item.Function === target.function;
              });
              if (temp !== undefined) {
                if (Object.prototype.hasOwnProperty.call(temp, 'Type')) {
                  target.Type = parseInt(temp.Type, 10);
                } else {
                  target.Type = 0;
                }
              } else {
                target.Type = 0;
              }
              this.srcData.data = tableData;
              if (tableData.length === 0) {
                this.axiosStatus = 2;
              }
            });

            this.setSuggestionsFunction(res.data);
            this.fnMsgFlag = true;
            this.setFinalSuggestions();
          }).catch(() => {
            this.srcData.data = tableData;
            this.axiosStatus = 2;
          }).finally(() => {
            this.obtainingTableData = false;
          });

        }
      })
      .catch((error: any) => {
        this.axiosStatus = 2;
        this.obtainingTableData = false;
      });

    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
      // 已经做过的，tiny就不再做了
      // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
      // 本示例中，开发者设置了分页特性，且对源数据未进行分页处理，因此tiny会对数据进行分页处理
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }
  // 复制URL
  public copyUrl(num: any) {
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
      this.mytip.alertInfo({ type: 'success', content: this.i18n.sys.copy_success, time: 3500 });
    }
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }
    this.initCol();
    this.refreshStatistics();
    this.refreshInfo();
    this.refreshTop10();
  }
  public initCol() {
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
  }

  /**
   * 转换 时钟周期百分比
   */
  public getPercent(row: any) {
    return row.cycles_percent ? ((Number(row.cycles_percent) * 100).toFixed(2)) + '%' : '0%';
  }

  public isNaN(num: any){
    return isNaN(num);
  }
}
