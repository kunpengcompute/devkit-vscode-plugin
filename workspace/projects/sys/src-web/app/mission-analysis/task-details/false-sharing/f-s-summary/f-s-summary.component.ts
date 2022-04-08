import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { TiTableColumns, TiTableComponent, TiTableDataState, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-f-s-summary',
  templateUrl: './f-s-summary.component.html',
  styleUrls: ['./f-s-summary.component.scss']
})
export class FSSummaryComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  i18n: any;
  // 优化建议提示
  public suggestMsg: any = [];

  public language = 'zh';
  public sortList: any = [];
  public explorer: any;

  public summaryTable = {
    obtainingData: false,
    displayed: ([] as Array<TiTableRowData>),
    srcData: ({} as TiTableSrcData),
    columns: ([] as Array<TiTableColumns>),
    pageNo: 1,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
    total: 0,
  };
  public detailsTable = {
    obtainingData: false,
    columns: ([] as Array<TiTableColumns>),
  };
  public closeOtherDetails = true; // 设置为true时，则点击展开某一行的详情时，收起其它行的详情；默认不收起其他行

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public mytip: MytipService,
    public tableService: TableService,
    public messageService: MessageService,
    private domsanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();

    this.summaryTable.columns = [
      { label: '', prop: 'detailsIcon' },
      { label: this.i18n.falsesharing.address, prop: 'address' },
      { label: this.i18n.falsesharing.records, prop: 'records', sortKey: 'records', sortStatus: '' },
      { label: this.i18n.falsesharing.rate, prop: 'rate', sortKey: 'rate', sortStatus: '', compareType: 'number' },
    ];
    this.summaryTable.srcData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

    this.detailsTable.columns = [
      { label: this.i18n.falsesharing.address, prop: 'address' },
      { label: this.i18n.falsesharing.records, prop: 'records' },
      { label: this.i18n.falsesharing.rate, prop: 'rate' },
      { label: this.i18n.falsesharing.offset, prop: 'offset' },
      { label: this.i18n.common_term_task_crate_pid, prop: 'pid' },
      { label: this.i18n.falsesharing.codeAddress, prop: 'codeAddress' },
      { label: this.i18n.falsesharing.symbol, prop: 'symbol' },
      { label: this.i18n.falsesharing.sharedObject, prop: 'sharedObject' },
      { label: this.i18n.falsesharing.source, prop: 'source' },
      { label: this.i18n.falsesharing.numaNode, prop: 'numaNode' },
    ];

    this.explorer = this.getExplorer();

    this.suggestMsg = [{
      title: this.i18n.optimization,
      msgbody: this.i18n.falsesharing.suggestMsg.map((msg: any) =>
       `<p>${this.domsanitizer.sanitize(SecurityContext.HTML, msg)}</p>`).join(''),
    }];
  }

  ngOnInit() {
    this.init();
  }

  public init() {
    this.getSummaryData();
  }

  // 获取 summary 数据
  public getSummaryData() {
    const params = {
      nodeId: this.nodeid,
      query_target: 'summary'
    };

    this.summaryTable.obtainingData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/false_sharing/`, {
      params,
      headers: {
        showLoading: false,
      },
    }).then((res: any) => {
      const data = res.data.falsesharing.summary;

      this.summaryTable.srcData.data = data.map((item: any, index: any): any => {
        return {
          index,
          id: item[0],
          address: item[1],
          records: item[2],
          rate: item[3],
          showDetails: false,
          details: {
            hasGet: false,
            displayed: [],
            srcData: {
              data: [],
              state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
              }
            }
          },
        };
      });

      this.summaryTable.total = data.length;
    }).finally(() => {
      this.summaryTable.obtainingData = false;
    });
  }

  // 获取 detail 数据
  public getDetailsData(row: any) {
    const params = {
      nodeId: this.nodeid,
      query_target: 'detail',
      address: row.address,
    };

    this.detailsTable.obtainingData = true;
    return new Promise((resolve, reject) => {
      this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/false_sharing/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        const data = res.data.falsesharing.detail;
        resolve(data);
      }).catch((e: any) => {
        reject(e);
      }).finally(() => {
        this.detailsTable.obtainingData = false;
      });
    });
  }

  // 切换详情
  public beforeToggle(row: TiTableRowData): void {
    row.showDetails = !row.showDetails;

    if (!row.details.hasGet) {
      const details = this.getDetailsData(row).then((data: any[]) => {
        row.details.srcData.data = data.map((item, index) => {
          return {
            index,
            address: item[0],
            records: item[1],
            rate: item[2],
            offset: item[3],
            pid: item[4],
            codeAddress: item[5],
            symbol: item[6],
            sharedObject: item[7],
            source: item[8],
            numaNode: item[9],
          };
        });

        row.details.hasGet = true;
      }).catch(e => {});
    }
  }

  // 跳转至源码界面
  public addFunctionTab(row: any) {
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/false_sharing/`, {
      params: {
        nodeId: this.nodeid,
        query_target: 'code',
        address: row.address,
        target_fun: row.symbol,
        src_location: row.source,
        asm_location: row.codeAddress,
        module: row.sharedObject,
        total_records: row.records,
        HITM_Lc1: row.rate,
      },
    }).then(async (res: any) => {
      row.visited = true;
      const data = res.data.falsesharing.data;

      if (data.source || data.bbb || data.graph_status) {
        // 格式源代码
        let sourceCodeData = [];
        if (Array.isArray(data.source)) {
          sourceCodeData = data.source.map((item: any, index: any) => {
            return {
              ...item,
              id: `source_${index}`,
              line: +item.line,
              line_code: item.line_code,
              count: +item.FS_COUNT.split('(')[0],
              proportion: item.FS_COUNT.split('(')[1].split(')')[0],
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
              count: +item.FS_COUNT.split('(')[0],
              proportion: item.FS_COUNT.split('(')[1].split(')')[0],
            };

            if (item.ins_list) {
              obj.children = item.ins_list.map((ins: any) => {
                return {
                  ...ins,
                  offset: ins.offset,
                  line: +ins.line,
                  ins: ins.ins,
                  count: +ins.FS_COUNT.split('(')[0],
                  proportion: ins.FS_COUNT.split('(')[1].split(')')[0],
                };
              });
            }

            assemblyCodeData.push(obj);
          });
        }

        // 代码流
        let svgpath;
        if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
          const svgResp = await this.Axios.axios.get(
            `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/svg-content/`, {
            headers: { mask: false },
            params: {
              'svg-name': data.svgpath,
            },
          });

          if (svgResp.length > 0) {
            svgpath = svgResp;
          }
        }

        this.messageService.sendMessage({
          function: 'functionTab',
          msg: {
            functionName: row.symbol,
            nodeid: this.nodeid,
            taskid: this.taskid,
            taskType: 'lock',
            headers: [
              { label: this.i18n.falsesharing.records, content: row.records },
              { label: this.i18n.common_term_task_tab_function_name, content: data.filename },
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
      } else {  // no data
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.noSourceData,
          time: 3500,
        });
      }
    }).catch(() => { });
  }

  // 获取浏览器版本
  public getExplorer(): any {
    const explorer = window.navigator.userAgent;
    const ie11 = 'ActiveXObject' in window;

    if (explorer.indexOf('MSIE') >= 0 || ie11) {
      return 'ie';
    } else if (explorer.indexOf('Firefox') && !ie11) {
      return 'Firefox';
    } else if (explorer.indexOf('Chrome') && !ie11) {
      return 'Chrome';
    } else if (explorer.indexOf('Opera') && !ie11) {
      return 'Opera';
    } else if (explorer.indexOf('Safari') && !ie11) {
      return 'Safari';
    }
  }
}
