import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiTableComponent,
} from '@cloud/tiny3';
import { TaskItem } from './domain';

@Component({
  selector: 'app-timing-summury',
  templateUrl: './timing-summury.component.html',
  styleUrls: ['./timing-summury.component.scss'],
})
export class TimingSummuryComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public data: Array<TiTableRowData> = [];
  public baseData: Array<TiTableRowData> = [];
  public forSearchBaseData: any = [];
  public currentPage = 1;
  public totalNumber = 10;
  public finalTableData: any = [];
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 10,
  };
  public columns: Array<TiTableColumns> = [];
  public allColumns: any;
  public initializing = false;
  public obtainingTableData = false;
  public confimModalDisabled = false;

  // -- 筛选 --
  public allTasks: TaskItem[] = [];
  public selectedTasks: any = [];
  public tagDisabled = false;

  // -- 筛选弹框 --
  @ViewChild('selectTaskModal') selectTaskModal: any;
  public selectTaskTable = {
    searchWords: '',  // 筛选关键字
    searchKeys: ([] as string[]), // 筛选字段
    selectedTasks: ([] as TaskItem[]),
    columns: ([] as Array<TiTableColumns>),
    displayed: ([] as Array<TaskItem>),
    srcData: ({
      data: ([] as Array<TaskItem>),
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    } as TiTableSrcData),
    pageNo: 1,
    pageSize: ({
      options: [10, 20, 50, 100],
      size: 10
    } as { options: Array<number>, size: number }),
    total: 0,
  };

  public i18n: any;
  rowHasChildren = false;

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    private messageService: MessageService
  ) {
    this.i18n = this.i18nService.I18n();

    this.allColumns = {
      firstRow: [
        {
          title: this.i18n.mission_modal.lockSummary.task_time,
          width: '15%',
          rowspan: 2,
          colspan: 1,
          center: false,
        },
        {
          title: this.i18n.mission_modal.lockSummary.lockWait,
          width: '30%',
          rowspan: 1,
          colspan: 2,
          center: true,
        },
        {
          title: this.i18n.mission_modal.lockSummary.call_site,
          width: '48%',
          rowspan: 1,
          colspan: 4,
          center: true,
        },
        {
          title: this.i18n.common_term_operate,
          width: '7%',
          rowspan: 2,
          colspan: 1,
          center: false,
        }
      ],
      secondRow: [
        {
          title: this.i18n.mission_modal.lockSummary.module_name,
          width: '15%',
          rowspan: 1,
          colspan: 1,
          center: false,
        },
        {
          title: this.i18n.mission_modal.lockSummary.function_name,
          width: '15%',
          rowspan: 1,
          colspan: 1,
          center: false,
        },
        {
          title: this.i18n.mission_modal.lockSummary.module_name,
          width: '12%',
          rowspan: 1,
          colspan: 1,
          center: false,
        },
        {
          title: this.i18n.mission_modal.lockSummary.function_name,
          width: '12%',
          rowspan: 1,
          colspan: 1,
          center: false,
        },
        {
          title: this.i18n.mission_modal.lockSummary.source_code_name,
          width: '12%',
          rowspan: 1,
          colspan: 1,
          center: false,
        },
        {
          title: this.i18n.mission_modal.lockSummary.row_num,
          width: '12%',
          rowspan: 1,
          colspan: 1,
          center: false,
        },
      ],
    };
  }

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
    this.columns = [
      {
        title: this.i18n.mission_modal.lockSummary.task_time,
        width: '15%',
      },
      {
        title: this.i18n.mission_modal.lockSummary.module_name,
        width: '15%',
      },
      {
        title: this.i18n.mission_modal.lockSummary.function_name,
        width: '15%',
      },
      {
        title: this.i18n.mission_modal.lockSummary.call_site_module_nama,
        width: '12%',
      },
      {
        title: this.i18n.mission_modal.lockSummary.call_site_function_nama,
        width: '12%',
      },
      {
        title: this.i18n.mission_modal.lockSummary.call_site_source_code_name,
        width: '12%',
      },
      {
        title: this.i18n.mission_modal.lockSummary.call_site_row_num,
        width: '12%',
      },
      {
        title: this.i18n.common_term_operate,
        width: '7%',
      }
    ];

    this.initializing = true;
    this.initTids().then(() => {
      this.init();
    }).finally(() => {
      this.initializing = false;
    });

    this.initSelectTaskModal();
  }


  // -- 筛选 --
  /** 获取TID数据 */
  private initTids() {
    return new Promise<void>((resolve, reject) => {
      const params = {
        'node-id': this.nodeid,
        'query-type': 'summary',
        'query-target': 'command',
      };

      this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/timing-data/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        const list = res?.data?.value;

        if (Array.isArray(list)) {
          this.allTasks = list.map(item => {
            // 后端返回是 name-pid 格式
            const splitIndex = item.lastIndexOf('-');
            const name = item.slice(0, splitIndex);
            const pid = item.slice(splitIndex + 1);

            return {
              label: `${name}(TID:${pid})`,
              value: item,
            };
          });
        }

        this.selectedTasks = this.allTasks.slice(0, 2); // 默认选中前两个
        this.selectTaskTable.srcData.data = this.allTasks;
        resolve();
      }).catch(() => {
        reject();
      });
    });
  }

  /**
   * 点击tag，删除选中项
   * @param taskItem taskItem
   */
  public deleteTask(taskItem: any) {
    if (this.selectedTasks.length < 2) {
      return;
    }
    this.selectedTasks.splice(this.selectedTasks.findIndex((item: any) => item.value === taskItem.value), 1);
    if (this.selectedTasks.length < 2) {
      this.selectedTasks[0].disable = true;
    }
    this.init();
  }


  // -- 筛选弹框 --
  private initSelectTaskModal() {
    this.selectTaskTable.columns = [
      { title: this.i18n.lock.taskName, prop: 'label' },
    ];
    this.selectTaskTable.searchKeys = ['label'];
  }

  /** 显示筛选弹框 */
  public showSelectTaskModal() {
    this.selectTaskTable.selectedTasks = [...this.selectedTasks];
    this.setTagDisabled(this.selectedTasks);
    this.selectTaskModal.open();
  }
  /** 监听选框变化 */
  public onMyChange(checkeds: Array<any>): void {
    checkeds.length > 0 ? this.confimModalDisabled = false : this.confimModalDisabled = true;
  }

  /** 点击筛选弹框的确定按钮 */
  public confimModal() {
    this.selectedTasks = [...this.selectTaskTable.selectedTasks];
    if (this.selectedTasks.length > 1) {
      this.selectedTasks[0].disable = false;
    }
    this.init();
    this.selectTaskModal.close();
  }


  /** 获取表格数据 */
  private async init() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      page: this.currentPage,
      'per-page': this.pageSize.size,
      'lock-comm-tid': this.selectedTasks.map((item: any) => item.value).join(',') || '-',
    };

    this.obtainingTableData = true;
    try {
      const res = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/timing-data/`, {
        params,
        headers: {
          showLoading: false,
        }
      });
      if (res.data.value) {
        this.baseData = [];
        let i = 0;
        Object.keys(res.data.value).forEach(k => {
          const obj: any = {
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
            id: this.Axios.generateConversationId(16),
          };
          if (k.split('-').length > 2) {
            obj.tid = k.split('-')[0] + '-' + k.split('-')[1] + '(TID:' + k.split('-')[2] + ')';
          } else {
            obj.tid = k.split('-')[0] + '(TID:' + k.split('-')[1] + ')';
          }
          for (const child of res.data.value[k]) {
            child.id = this.Axios.generateConversationId(16);
          }
          obj.children = res.data.value[k];

          this.baseData.push(obj);
          i++;
        });
      }
      this.totalNumber = res.data.totalCounts;
      this.data = [...this.baseData];
      this.forSearchBaseData = [...this.baseData];
      this.initTable();
    } catch (error) {
      if (error.response.status === 414) {
        this.mytip.alertInfo({ type: 'warn', content: this.i18n.mission_modal.lockSummary.urlTips, time: 3500 });
      }
    } finally {
      this.obtainingTableData = false;
    }
  }

  public initTable() {
    this.finalTableData = [];
    this.data.forEach((element, index) => {
      this.finalTableData.push(element);
    });
    this.finalTableData = this.getTreeTableArr(this.finalTableData);
    this.rowHasChildren = false;
    for (const item of this.finalTableData) {
      if (item.hasChildren) {
        this.rowHasChildren = true;
        break;
      }
    }
    this.srcData.data = [...this.finalTableData];
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
  public toggle(node: any): void {
    node.expand = !node.expand;
    this.toggleChildren(this.finalTableData, node.id, node.expand);
    this.srcData.data = this.finalTableData.filter((item: any) => {
      return item.isShow === true;
    });
  }

  private toggleChildren(data: Array<any>, pId: any, pExpand: boolean): void {
    for (const node of data) {
      if (node.pId === pId) {
        node.isShow = pExpand; // 处理当前子节点
      }
    }
  }

  private deepClone(obj: any): any {
    // 深拷贝，类似于1.x中的angular.copy() TODO: 是否需要将该方法写进组件
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

  public stateUpdate(tiTable: TiTableComponent): void {
    this.init();
  }
  public setTagDisabled(selectedTasks: any) {
    if (this.selectedTasks.length === 1) {
      this.tagDisabled = true;
    } else {
      this.tagDisabled = false;
    }
  }
  addFunctionTab(row: any, whitch: any) {
    row.visited = true;
    this.srcData.data.forEach((item: any) => {
      if (row.pId === item.id) {
        const tid = item.tid.replace(/[^0-9]/ig, '');
        row.lockTid = tid;
      }
    });
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-lock/func-code/`, {
      headers: { mask: false },
      params: {
        'node-id': this.nodeid,
        'query-type': 'source_code',
        'lock-tid': row.lockTid,
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
}
