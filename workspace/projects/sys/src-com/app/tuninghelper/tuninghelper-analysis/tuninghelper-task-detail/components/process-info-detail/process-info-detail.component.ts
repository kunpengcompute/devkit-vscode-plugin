import { Component, OnInit, OnDestroy } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiModalService, TiTreeNode } from '@cloud/tiny3';
import { HttpService, I18nService, TableService } from 'sys/src-com/app/service';
import { CurrOptimization, TuningHelperRightService } from '../../service/tuninghelper-right.service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { LANGUAGE_TYPE, STATUS_CODE } from 'sys/src-com/app/global/constant';
import { PidInfoType, TableData } from '../../domain/index';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-process-info-detail',
  templateUrl: './process-info-detail.component.html',
  styleUrls: ['./process-info-detail.component.scss'],
})
export class ProcessInfoDetailComponent implements OnInit, OnDestroy {

  private rightSub: Subscription;
  public curSelectedPid = '';
  public pidType: 'sys' | 'app' = 'sys';

  // 指标信息
  public indicatorColumns: Array<TiTableColumns> = [];
  public indicatorColTableColumns: Array<TiTableColumns> = [];
  public indicatorSrcData: TiTableSrcData = {
    data: [], // 源数据
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public indicatorDisplayed: Array<TiTableRowData> = [];
  public indicatorExpandData: any;

  // 微架构指标
  public micTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };
  public micMetricsData: any;

  // 访存分析指标
  public memoryAccessTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };

  // CPU亲和性
  public cpuAffinityTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };

  // 内存亲和性
  public memoryAffinityTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };

  // 热点函数
  public hotFunctionTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
    pageNo: 1,
    total: 0,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };
  public hotFucPage = {
    currentPage: 0,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    }
  };

  // 操作的网口
  public operationNetportTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };
  // 操作的文件
  public operationFileTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };
  // 操作的系统调用
  public systemCallTableData: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };

  public i18n: any;

  public stacksDisplayed: any = [{
    title: 'PID 11',
    expand: true,
    levelIndex: 0,
    children: [
      {
        title: 'phtyon',
        expand: false,
        child: [

        ]
      }
    ]
  },
  {
    title: 'PID 112',
    expand: false,
    levelIndex: 1,
    children: [
      {
        title: 'cache_miss',
        expand: false,
        child: [

        ]
      }
    ]
  },
  {
    title: 'PID 21',
    expand: true,
    levelIndex: 0,
    children: [
      {
        title: 'phtyon',
        expand: false,
        child: [

        ]
      }
    ]
  }];
  public hotFunStacksData: any;
  public curLanguage: any = sessionStorage.getItem('language');
  public islanguageZH = true;

  constructor(
    private http: HttpService,
    private rightService: TuningHelperRightService,
    private statusService: TuninghelperStatusService,
    private i18nService: I18nService,
    private tiModal: TiModalService,
    public tableService: TableService,
  ) {
    this.islanguageZH = this.curLanguage === LANGUAGE_TYPE.ZH;
    this.i18n = this.i18nService.I18n();
    this.rightSub = this.rightService.subscribe({
      next: (msg: any) => {
        if (msg.type === CurrOptimization.processDetail) {
          this.pidType = msg.data.pidType;
          this.getProcessDetailData(msg.data.pid);
        }
      }
    });
  }

  /**
   * 初始化
   */
  ngOnInit(): void {
    this.setTableColumn();
  }

  /**
   * 页面销毁
   */
  ngOnDestroy() {
    this.rightSub.unsubscribe();
  }

  private getProcessDetailData(pid: any) {
    this.clearAllData();
    this.curSelectedPid = pid;
    const params = {
      pid,
      'node-id': this.statusService.nodeId,
      'query-type': JSON.stringify([
        PidInfoType.IndicatorInfo,
        PidInfoType.MicMetrics,
        PidInfoType.MemoryAccessMetrics,
        PidInfoType.CpuAffinity,
        PidInfoType.MemoryAffinity,
        PidInfoType.SystemCall,
        PidInfoType.HotSpotFunc,
        PidInfoType.OperatedFiles,
        PidInfoType.OperatedNetworkPort
      ]),
    };
    this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/pid-detail/`,
      { params }
    ).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data.optimization && resp.data.optimization.data) {
        this.setTableData(resp.data.optimization.data);
      }
    }).catch((error: any) => {
    });
  }



  /**
   * 设置表格列
   */
  private setTableColumn() {
    this.indicatorColumns = [
      [
        {
          title: '',
          rowspan: 2,
          colspan: 1,
          width: '40',
          valueKey: '',
          fixedDisplay: true,
          columnSortNum: 0,
        },
        {
          title: 'PID/TID',
          rowspan: 2,
          colspan: 1,
          width: '10%',
          valueKey: 'pid',
          fixedDisplay: true,
          expandValueKey: 'tid',
          columnSortNum: 1,
        },
        {
          title: 'CPU',
          rowspan: 1,
          colspan: 4,
          width: '23.2%',
          fixedDisplay: true,
          key: 'cpu',
          columnSortNum: 17,
        },
        {
          title: 'Memory',
          rowspan: 1,
          colspan: 5,
          width: '29%',
          fixedDisplay: true,
          key: 'memory',
          columnSortNum: 18,
        },
        {
          title: 'Disk IO',
          rowspan: 1,
          colspan: 3,
          width: '17.4%',
          fixedDisplay: true,
          key: 'diskIo',
          columnSortNum: 19,
        },
        {
          title: 'Switch',
          rowspan: 1,
          colspan: 2,
          width: '11.6%',
          fixedDisplay: true,
          key: 'switch',
          columnSortNum: 20,
        },
        {
          title: 'Command',
          rowspan: 2,
          colspan: 1,
          width: '8.8%',
          fixedDisplay: true,
          valueKey: 'command',
          columnSortNum: 16,
        },
      ],
      [
        {
          title: '%user',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '23.2%',
          expendKey: 'cpu',
          fixedDisplay: true,
          valueKey: '%user',
          columnSortNum: 2,
        },
        {
          title: '%system',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '23.2%',
          expendKey: 'cpu',
          fixedDisplay: false,
          valueKey: '%system',
          columnSortNum: 3,
        },
        {
          title: '%IO wait',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '23.2%',
          expendKey: 'cpu',
          fixedDisplay: false,
          valueKey: '%IO wait',
          columnSortNum: 4,
        },
        {
          title: '%CPU',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '23.2%',
          expendKey: 'cpu',
          fixedDisplay: false,
          valueKey: '%CPU',
          columnSortNum: 5,
        },
        {
          title: 'minflt/s',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '29%',
          expendKey: 'memory',
          fixedDisplay: true,
          valueKey: 'minflt/s',
          columnSortNum: 6,
        },
        {
          title: 'majflt/s',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '29%',
          expendKey: 'memory',
          fixedDisplay: false,
          valueKey: 'majflt/s',
          columnSortNum: 7,
        },
        {
          title: 'VSZ(KiB)',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '29%',
          expendKey: 'memory',
          fixedDisplay: false,
          valueKey: 'VSZ(KB)',
          columnSortNum: 8,
        },
        {
          title: 'RSS(KiB)',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '29%',
          expendKey: 'memory',
          fixedDisplay: false,
          valueKey: 'RSS(KB)',
          columnSortNum: 9,
        },
        {
          title: '%MEM',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '29%',
          expendKey: 'memory',
          fixedDisplay: false,
          valueKey: '%MEM',
          columnSortNum: 10,
        },
        {
          title: 'rd(KiB)/s',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '17.4%',
          expendKey: 'diskIo',
          fixedDisplay: true,
          valueKey: 'rd(KB)/s',
          columnSortNum: 11,
        },
        {
          title: 'wr(KiB)/s',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '17.4%',
          expendKey: 'diskIo',
          fixedDisplay: false,
          valueKey: 'wr(KB)/s',
          columnSortNum: 12,
        },
        {
          title: 'IOdelay(tick)',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '17.4%',
          expendKey: 'diskIo',
          fixedDisplay: false,
          valueKey: 'IOdelay(tick)',
          columnSortNum: 13,
        },
        {
          title: 'Cswch/s',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '11.6%',
          expendKey: 'switch',
          fixedDisplay: true,
          valueKey: 'Cswch/s',
          columnSortNum: 14,
        },
        {
          title: 'Nvcswch/s',
          rowspan: 1,
          colspan: 1,
          width: '5.8%',
          expandWidth: '11.6%',
          expendKey: 'switch',
          fixedDisplay: false,
          valueKey: 'Nbcswch/s',
          columnSortNum: 15,
        },
      ],
    ];
    this.indicatorColTableColumns = this.flat(this.indicatorColumns).filter(column => column.colspan === 1);
    this.indicatorExpandData = {
      cpu: true,
      memory: true,
      diskIo: true,
      switch: true,
    };
    this.micTableData.columns = [
      {
        label: this.i18n.tuninghelper.taskDetail.metrics,
        width: '50%',
        key: 'metrics'
      },
      {
        label: this.i18n.tuninghelper.taskDetail.value,
        width: '50%',
        key: 'value'
      }
    ];
    this.memoryAccessTableData.columns = [
      {
        label: this.i18n.tuninghelper.taskDetail.metrics,
        width: '50%',
        key: 'metrics'
      },
      {
        label: this.i18n.tuninghelper.taskDetail.value,
        width: '50%',
        key: 'value'
      }
    ];

    this.cpuAffinityTableData.columns = [
      {
        label: '',
        width: '10%',
        key: '',
      },
      {
        label: 'PID/TID',
        width: '12%',
        key: 'pid',
        expandKey: 'tid'
      },
      {
        label: 'CPU affinity',
        width: '16%',
        key: 'cpu_affinity',
      },
      {
        label: 'CPU core',
        width: '10%',
        key: 'cpu_core',
      },
      {
        label: 'NUMA NODE',
        width: '52%',
        key: 'numa_node',
      }
    ];

    this.hotFunctionTableData.columns = [
      { label: this.i18n.storageIO.ioapis.functionName, key: 'symbol', },
      { label: '%CPU', key: 'overhead', sortKey: 'overhead', compareType: 'number' },
      { label: '%system', key: 'sys', sortKey: 'sys', compareType: 'number' },
      { label: '%user', key: 'usr', sortKey: 'usr', compareType: 'number' },
      { label: this.i18n.common_term_task_tab_summary_module, key: 'share_object' },
      { label: 'Command', key: 'command', },
    ];

    this.operationNetportTableData.columns = [
      { label: 'PID', key: 'pid', width: '10%'},
      { label: 'Protocol', key: 'protocal', width: '10%'},
      { label: 'Local IP', key: 'local_ip', width: '10%'},
      { label: 'Local  port', key: 'local_port', width: '10%' },
      { label: 'Remote IP', key: 'remote_ip', width: '10%'},
      { label: 'Remote Interface', key: 'remote_interface', width: '10%'},
      { label: 'Remote Port', key: 'remote_port', width: '10%'},
    ];

    this.operationFileTableData.columns = [
      {
        label: 'PID',
        width: '20%',
        key: 'pid',
      },
      {
        label: this.i18n.pcieDetailsinfo.disk_name,
        width: '20%',
        key: 'device',
      },
      {
        label: 'File Name',
        width: '20%',
        key: 'file_name',
      },
      {
        label: 'Mode',
        width: '20%',
        key: 'mode',
      },
    ];

    this.systemCallTableData.columns = [
      {
        label: '%time',
        width: '20%',
        key: 'time_percentage',
      },
      {
        label: 'seconds',
        width: '20%',
        key: 'seconds',
      },
      {
        label: 'usecs/call',
        width: '20%',
        key: 'usecs_call',
      },
      {
        label: 'calls',
        width: '20%',
        key: 'calls',
      },
      {
        label: 'errors',
        width: '20%',
        key: 'errors',
      },
      {
        label: 'syscall',
        width: '20%',
        key: 'syscall',
      },
    ];
  }

  /**
   * 改变表格表头展开收缩状态
   */
  public changeTableHeaderExpanded(key: any) {
    this.indicatorExpandData[key] = !this.indicatorExpandData[key];
  }


  /**
   * 设置表格数据
   */
  private setTableData(data: any) {
    if (Object.keys(data).length > 0) {
      for (const key of Object.keys(data)) {
        switch (key) {
          case PidInfoType.IndicatorInfo:
            this.setIndicatorInfoTableData(data[key]);
            break;
          case PidInfoType.MicMetrics:
            this.setMicMetricsTableData(data[key]);
            break;
          case PidInfoType.MemoryAccessMetrics:
            this.setMemoryAccessMetricsTableData(data[key]);
            break;
          case PidInfoType.CpuAffinity:
            this.setCpuAffinityTableData(data[key]);
            break;
          case PidInfoType.MemoryAffinity:
            this.setMemoryAffinityTableData(data[key]);
            break;
          case PidInfoType.OperatedNetwork:
            this.setOperatedNetworkTableData(data[key]);
            break;
          case PidInfoType.OperatedFilesResponse:
            this.setOperatedFilesTableData(data[key]);
            break;
          case PidInfoType.SystemCall:
            this.setSystemCallTableData(data[key]);
            break;
          case PidInfoType.HotSpotFunc:
            this.setHotSpotFuncTableData(data[key]);
            break;
          default:
            break;
        }
      }
    }
  }

  /**
   * 设置指标信息
   */
  private setIndicatorInfoTableData(data: any) {
    let pidData: any = {};
    if (data?.PID) {
      pidData = data.PID;
      pidData.pid = 'PID' + pidData.pid;
      pidData.expanded = false;
      if (data?.TID) {
        data.TID.forEach((item: any) => {
          item.tid = 'TID' + item.tid;
        });
        pidData.children = data.TID;
      }
    }
    this.indicatorSrcData.data = [pidData];
  }

  /**
   * 设置微架构指标信息
   * @param data 数据源
   */
  private setMicMetricsTableData(data: any) {
    this.micMetricsData = data;
    this.micMetricsData.cycles = this.micMetricsData.cycles ?? '--';
    this.micMetricsData.instructions = this.micMetricsData.instructions ?? '--';
    this.micMetricsData.IPC = this.micMetricsData.IPC ?? '--';
    const srcData = [];
    const notContainKeys = ['cycles', 'instructions', 'IPC'];
    for (const key of Object.keys(data)) {
      if (notContainKeys.indexOf(key) === -1) {
        srcData.push({
          metrics: key,
          value: data[key]
        });
      }
    }
    this.micTableData.srcData.data = srcData;
  }

  /**
   * 设置访存指标信息
   * @param data 数据源
   */
   private setMemoryAccessMetricsTableData(data: any) {
    const srcData = [];
    for (const key of Object.keys(data)) {
      srcData.push({
        metrics: this.i18n.tuninghelper.memory_access_indicator[key] || '--',
        value: data[key]
      });
    }
    this.memoryAccessTableData.srcData.data = srcData;
  }

  /**
   * 设置CPU亲和性数据
   * @param data 数据源
   */
  private setCpuAffinityTableData(data: any) {
    let pidData: any = {};
    if (data?.pid) {
      pidData = data.pid;
      pidData.pid = 'PID' + pidData.pid;
      pidData.expanded = false;
      if (data?.tid) {
        data.tid.forEach((item: any) => {
          item.tid = 'TID' + item.tid;
        });
        pidData.children = data.tid;
      }
    }
    this.cpuAffinityTableData.srcData.data = [pidData];
  }

  /**
   * 设置内存亲和性数据
   */
  private setMemoryAffinityTableData(data: any) {
    if (data.header && data.vals) {
      const columns: any[] = [];
      for (const item of data.header) {
        columns.push({
          label: item,
          key: item ? item : 'name',
          width: '10%'
        });
      }
      const srcData: any[] = [];
      data.vals.forEach((val: any, valIndex: number) => {
        const temp: any = {};
        val.forEach((item: any, index: number) => {
          temp[columns[index].key] = item;
        });
        srcData.push(temp);
      });

      this.memoryAffinityTableData.columns = columns;
      this.memoryAffinityTableData.srcData.data = srcData;
    }
  }

  /**
   * 设置热点函数数据
   */
  private setHotSpotFuncTableData(data: any) {
    data.forEach((item: any, index: number) => {
      item.showStack = false;
      if (item.stack) {
        const stackTree = JSON.parse(item.stack);
        if (stackTree.length > 0 && stackTree[0].function) {
          item.showStack = true;
        }
      }
    });
    this.hotFunctionTableData.srcData.data = data;
  }


  /**
   * 设置操作的网口数据
   * @param data 数据源
   */
  private setOperatedNetworkTableData(data: any) {
    this.operationNetportTableData.srcData.data = [data];
  }

  /**
   * 设置操作文件数据
   * @param data 数据源
   */
  private setOperatedFilesTableData(data: any) {
    this.operationFileTableData.srcData.data = data;
  }

  /**
   *  设置操作系统的调用
   * @param data 数据源
   */
  private setSystemCallTableData(data: any) {
    this.systemCallTableData.srcData.data = data;
  }


  /**
   * 清除所有数据
   */
  private clearAllData() {
    this.indicatorSrcData.data = [];
    this.micTableData.srcData.data = [];
    this.micMetricsData = {};
    this.memoryAccessTableData.srcData.data = [];
    this.cpuAffinityTableData.srcData.data = [];
    this.memoryAffinityTableData.srcData.data = [];
    this.hotFunctionTableData.srcData.data = [];
    this.operationNetportTableData.srcData.data = [];
    this.operationFileTableData.srcData.data = [];
    this.systemCallTableData.srcData.data = [];
  }


  /**
   * 查看调用栈
   * @params row 函数信息
   */
  public viewStacks(viewStack: any, row: any) {
    if (row.showStack) {
      let stackTree: Array<TiTreeNode> = [];
      if (row.stack) {
        stackTree = JSON.parse(row.stack);
      }
      this.tiModal.open(viewStack, {
        id: 'hot-stacks',
        context: {
          title: row.symbol,
          stackTree
        }
      });
    }
  }

  /**
   * 将所有元素与遍历到的子数组中的元素合并为一个新数组返回
   */
  public flat(array: Array<any>) {
    const resp: Array<any> = [];
    const expandArray = (res: any, arr: any) => {
        arr.forEach((item: any) => {
            if (Array.isArray(item)) {
                expandArray(res, item);
            } else {
                res.push(item);
            }
        });
    };
    expandArray(resp, array);
    resp.sort((a, b) => a.columnSortNum - b.columnSortNum);
    return resp;
  }

}
