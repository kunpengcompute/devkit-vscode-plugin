import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { Axios2vscodeServiceService } from '../../../service/axios2vscode-service.service';
import { MytipService } from '../../../service/mytip.service';
import { TableService } from '../../../service/table.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from '../../../service/message.service';
import {COLOR_THEME, currentTheme, VscodeService} from '../../../service/vscode.service';

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
  public sortList = [];

  public summaryTable = {
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
    columns: ([] as Array<TiTableColumns>),
  };
  public closeOtherDetails = true; // 设置为true时，则点击展开某一行的详情时，收起其它行的详情；默认不收起其他行
  // 获取主题颜色
  public currTheme = COLOR_THEME.Dark;
  public ColorTheme = {
    Dark: COLOR_THEME.Dark,
    Light: COLOR_THEME.Light
  };

  constructor(
    public i18nService: I18nService,
    public Axios: Axios2vscodeServiceService,
    public mytip: MytipService,
    public tableService: TableService,
    public messageService: MessageService,
    public vscodeService: VscodeService,
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

    this.suggestMsg = [{
      title: this.i18n.optimization,
      msgbody: this.i18n.falsesharing.suggestMsg.map(msg => `<p>${msg}</p>`).join(''),
    }];
  }

  /**
   * 组件初始化
   */
  ngOnInit() {
    // vscode颜色主题适配
    this.currTheme = currentTheme();
    this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
      this.currTheme = msg.colorTheme;
    });

    this.init();
  }

  /**
   * init
   */
  public init() {
    this.getSummaryData();
  }

  /**
   * 获取 summary 数据
   */
  public getSummaryData() {
    const params = {
      nodeId: this.nodeid,
      query_target: 'summary'
    };

    this.Axios.axios.get(`/tasks/${this.taskid}/false_sharing/`, { params }).then(res => {
      const data = res.data.falsesharing.summary;

      this.summaryTable.srcData.data = data.map((item, index) => {
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
    });
  }

  /**
   * 获取 detail 数据
   */
  public getDetailsData(row) {
    const params = {
      nodeId: this.nodeid,
      query_target: 'detail',
      address: row.address,
    };

    return new Promise((resolve, reject) => {
      this.Axios.axios.get(`/tasks/${this.taskid}/false_sharing/`, { params }).then(res => {
        resolve(res.data.falsesharing.detail);
      }).catch(e => {
        reject(e);
      });
    });
  }

  /**
   * 切换详情
   */
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
      });
    }
  }

  /**
   * 跳转至源码界面
   */
  public addFunctionTab(row) {
    this.Axios.axios.get(`/tasks/${this.taskid}/false_sharing/`, {
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
    }).then(async res => {
      row.visited = true;
      const data = res.data.falsesharing.data;

      if (data.source || data.bbb || data.graph_status) {
        // 格式源代码
        let sourceCodeData = [];
        if (Array.isArray(data.source)) {
          sourceCodeData = data.source.map((item, index) => {
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
        const assemblyCodeData = [];
        if (Array.isArray(data.bbb)) {
          data.bbb.forEach((item, index) => {
            const obj = {
              ...item,
              offset: item.offset,
              line: +item.line,
              ins: item.ins,
              count: +item.FS_COUNT.split('(')[0],
              proportion: item.FS_COUNT.split('(')[1].split(')')[0],
            };

            if (item.ins_list) {
              obj.children = item.ins_list.map(ins => {
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
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
          if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
            const svgResp = await this.Axios.axios.get(`/tasks/${this.taskid}/c-analysis/svg-content/`, {
              headers: {mask: false},
              params: {
                'svg-name': data.svgpath,
              },
            });

            svgpath = svgResp.data;
          }
        } else {
          if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
            const svgResp = await this.Axios.axios.get(`/tasks/${this.taskid}/c-analysis/svg-content/`, {
              headers: {mask: false},
              params: {
                'svg-name': data.svgpath,
              },
            });

            if (svgResp.length > 0) {
              svgpath = svgResp;
            }
          }
        }

        this.vscodeService.postMessage({
          cmd: 'openNewPage', data: {
            router: 'addfunction',
            panelId: 'falsesharingFunction' + new Date().getTime(),
            viewTitle: this.i18n.mission_create.falsesharing,
            message: {
              functionName: row.symbol,
              nodeid: this.nodeid,
              taskid: this.taskid,
              taskType: 'lock',
              headers: JSON.stringify([
                { label: this.i18n.falsesharing.records, content: row.records },
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
      } else {  // no data
        // 发送消息给vscode, 右下角弹出提醒框
        this.vscodeService.postMessage({
          cmd: 'showInfoBox',
          data: {
            info: this.i18n.noSourceData,
            type: 'error'
          }
        }, null);
      }
    }).catch((err) => {
      if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
        const sendMsg = { operation: err.message };
        this.vscodeService.showTuningInfo(JSON.stringify(sendMsg), 'error', 'paramError');
      }
    });
  }
}
