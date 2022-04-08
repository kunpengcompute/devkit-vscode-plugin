import { Component, OnInit, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';

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
  public lang: any;
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
  public obtainingSummaryData = true;
  public obtainingDetailData = true;
  public pointNoData: string;
  constructor(public Axios: AxiosService, public i18nService: I18nService,
              public mytip: MytipService, private messageService: MessageService) {
    this.i18n = this.i18nService.I18n();
    this.pointNoData = this.i18n.common_term_lock_nodata;
  }

  ngOnInit() {
    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
      // 已经做过的，tiny就不再做了
      // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
      // 本示例中，开发者设置了分页特性，且对源数据未进行分页处理，因此tiny会对数据进行分页处理
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        // 源数据已进行分页处理【由于排序问题，先改成前端分页】
        paginated: false// 源数据未进行分页处理
      }
    };
    this.columns = [
      {
        title: this.i18n.mission_modal.lockSummary.task_name,
        width: '22%',
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
      }
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
        // 源数据已进行分页处理【由于排序问题，先改成前端分页】
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
        width: '19%',
        sortKey: 'lock_call_dso'
      },
      {
        title: this.i18n.mission_modal.lockSummary.call_site_function_nama,
        width: '19%',
        sortKey: 'lock_call_symbol'
      },
      {
        title: this.i18n.mission_modal.lockSummary.call_site_source_code_name,
        width: '19%',
        sortKey: 'lock_code'
      },
      {
        title: this.i18n.mission_modal.lockSummary.call_site_row_num,
        width: '15%',
        sortKey: 'lock_line'
      },
      {
        title: this.i18n.common_term_operate,
        width: '14%',
      }
    ];
    this.init();
    this.srcPointData.data = [];
  }


  // 【由于排序问题，先改成前端分页】
  public init() {
    const param = {
      'node-id': this.nodeid,
      'query-type': 'summary',
      'query-target': 'calltime',
      page: this.currentPage,
      'per-page': this.pageSize.size
    };

    this.obtainingSummaryData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/summary/`, {
      params: param,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      // 得到总个数再获取一次全部的
      const params = {
        'node-id': this.nodeid,
        'query-type': 'summary',
        'query-target': 'calltime',
        page: this.currentPage,
        'per-page': res.data.totalCounts
      };

      this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/summary/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((totalRes: any) => {
        this.obtainingSummaryData = false;
        this.obtainingDetailData = false;
        this.srcData.data = totalRes.data.value;
        this.totalNumber = totalRes.data.totalCounts;
        if (sessionStorage.getItem('language') === 'zh-cn') {
          this.leftSug = totalRes.data.suggestion.ch;
          this.lang = 'ch';
        } else {
          this.leftSug = totalRes.data.suggestion.en;
          this.lang = 'en';
        }
        // 【由于前端分页，该功能以挪至 displayedDataChange 】
      }).catch(() => {
        this.obtainingSummaryData = false;
        this.obtainingDetailData = false;
      });
    }).catch(() => {
      this.obtainingSummaryData = false;
      this.obtainingDetailData = false;
    });
  }

  // 锁与等待信息变化时
  public displayedDataChange(changes: any) {
    $('.left .transform').addClass('first');
  }

  // 【由于排序问题，先改成前端分页】
  public getdetail(row: any) {
    this.currentPagePoint = 1;
    this.pageSizePoint.size = 10;
    $('.left .transform').on('click', (e) => {
      $('.left .transform').removeClass('first');
      $('.left .transform tr').removeClass('selected');
      $(e.target).parent().addClass('selected');
    });
    const param = {
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

    this.obtainingDetailData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/call-point/`, {
      params: param,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      // 得到总个数再获取一次全部的
      const params = {
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

      this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/call-point/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((totalRes: any) => {
        this.srcPointData.data = totalRes.data.value;
        this.displayedPoint = res.data.value;
        this.totalNumberPoint = totalRes.data.totalCounts;
        if (sessionStorage.getItem('language') === 'zh-cn') {
          this.rightSug = totalRes.data.suggestion.ch;
        } else {
          this.rightSug = totalRes.data.suggestion.en;
        }
      }).finally(() => {
        this.obtainingDetailData = false;
      });
    }).catch(() => {
      this.obtainingDetailData = false;
    });
  }

  addFunctionTab(row: any, whitch: any) {
    row.visited = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/func-code/`, {
      headers: { mask: false },
      params: {
        'node-id': this.nodeid,
        'query-type': 'source_code',
        'lock-tid': row.lock_tid,
        'lock-dso': whitch === 'sum' ? row.lock_dso : row.lock_call_dso,
        'lock-symbol': whitch === 'sum' ? row.lock_symbol : row.lock_call_symbol,
      },
    }).then(async (resp: any) => {
      const data = resp.data;

      if (Object.keys(data).length) {
        // 格式化源代码
        let sourceCodeData = [];
        if (Array.isArray(data.source)) {
          sourceCodeData = data.source.map((item: any, index: any) => {
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
        if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
          const svgResp = await this.Axios.axios.get(
            `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/svg-content/`,
            {
              headers: { mask: false },
              params: {
                'svg-name': data.svgpath,
              },
            }
          );

          if (svgResp.length > 0) {
            svgpath = svgResp;
          }
        }

        this.messageService.sendMessage({
          function: 'functionTab',
          msg: {
            functionName: whitch === 'sum' ? row.lock_symbol : row.lock_call_symbol,
            nodeid: this.nodeid,
            taskid: this.taskid,
            taskType: 'lock',
            headers: [
              { label: this.i18n.common_term_task_tab_function_hard, content: 'CPU Cycles' },
              { label: this.i18n.common_term_task_tab_function_total, content: data.pmutotal.CPU_CYCLES || '--' },
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
      } else {
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.noSourceData,
          time: 3500,
        });
      }
    }).catch((error: any) => { });
  }

  public setParent(e: any) {
    $(e.target).parent().parent()[0].setAttribute('class', 'selected');
  }

  public sortCPU(sort: any, key: any, arr: any) {
    if (sort === 'up') {
      arr = arr.sort((a: any, b: any) => {
        if (typeof (a[key]) === 'object') {
          return a[key].value - b[key].value;
        } else if (typeof (a[key]) === 'string') {
          return a[key].localeCompare(b[key]);
        } else {
          return a[key] - b[key];
        }
      });
    } else {
      arr = arr.sort((a: any, b: any) => {
        if (typeof (a[key]) === 'object') {
          return b[key].value - a[key].value;
        } else if (typeof (a[key]) === 'string') {
          return b[key].localeCompare(a[key]);
        } else {
          return b[key] - a[key];
        }
      });
    }
  }
  public stateUpdate(tiTable: TiTableComponent): void {
    this.init();
  }
  public stateUpdatePoint(tiTable: TiTableComponent): void {
    if (this.totalNumber) {
      this.getdetail(this.srcData.data[0]);
    }
  }
}
