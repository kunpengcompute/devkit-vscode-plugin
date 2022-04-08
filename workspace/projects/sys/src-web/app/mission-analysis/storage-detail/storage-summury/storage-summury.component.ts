import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableComponent, TiTableDataState, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { observable } from 'rxjs';
import { SummuryDataService } from './summury-data.service';
@Component({
  selector: 'app-storage-summury',
  templateUrl: './storage-summury.component.html',
  styleUrls: ['./storage-summury.component.scss']
})
export class StorageSummuryComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  // 分页
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public diskCurrentPage = 1;
  public diskTotalNumber = 0;
  public diskPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public functionCurrentPage = 1;
  public functionTotalNumber = 0;
  public functionPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public language = 'zh';
  public i18n: any;
  public obtainingSummaryData = false;
  public ifSys = false; // 如果是系统类型,没有apios
  public diskDisplayedData: Array<TiTableRowData> = [];
  public diskSearchWords: Array<any> = [];
  public diskSearchKeys: Array<string> = []; // 设置过滤字段
  public threadDisplayedData: Array<TiTableRowData> = [];
  public threadSrcData: any = { data: [] };
  public functionDisplayedData: Array<TiTableRowData> = [];
  public functionSrcData: any = { data: [] };
  public diskSrcData: any = { data: [] };
  public diskOriginData: any = []; // 原始数据
  public ioOriginData: any = [];
  public threadCheckedList: any = []; // 被选中的列表
  public threadDataSheet: any = []; // 所有的列表
  public prevThreadCheckedList: any = [];
  public displayData: any;
  public pidColumns: Array<TiTableColumns> = [];
  public diskColumns: Array<TiTableColumns> = [];
  //  disk表头筛选显示
  public diskTitle: Array<TiTableColumns> = [];
  public diskCheckedData: Array<any> = []; // disk选中项
  public diskColspan = 8;
  public disksHeadShow = false;
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public nodataTips = '';
  public suggestMsg: any = [];
  public threadColumns: Array<TiTableColumns> = [];
  public hasAddI2D = false; // 是否增加i2d数据
  public blockIOData: any;
  constructor(public Axios: AxiosService, public i18nService: I18nService, public mytip: MytipService,
              private msgService: MessageService, public summuryData: SummuryDataService) {
    this.i18n = this.i18nService.I18n();
    this.nodataTips = this.i18n.loading;
    this.diskColumns = [
      {
        title: 'DEV',
        width: '6%',
        key: 'dev',
        searchable: true, // 该列的 headfilter 的下拉中是否开启搜索功能
        selected: null,
        multiple: true,
        selectAll: true,
        options: [],
        disabled: true,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.roprateTime,
        width: '10%',
        key: 'read_times',
        sortKey: 'read_times',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.woprateTime,
        width: '10%',
        key: 'write_times',
        sortKey: 'write_times',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.riops,
        width: '8%',
        key: 'r_iops',
        sortKey: 'r_iops',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.wiops,
        width: '8%',
        key: 'w_iops',
        sortKey: 'w_iops',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.rdataSize,
        width: '10%',
        key: 'read_size',
        sortKey: 'read_size',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.wdataSize,
        width: '10%',
        key: 'write_size',
        sortKey: 'write_size',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.rrate,
        width: '11%',
        key: 'r_throughput',
        sortKey: 'r_throughput',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.wrate,
        width: '11%',
        key: 'w_throughput',
        sortKey: 'w_throughput',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.rdelay,
        width: '11%',
        key: 'r_delay',
        sortKey: 'r_delay',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.summury.wdelay,
        width: '11%',
        key: 'w_delay',
        sortKey: 'w_delay',
        disabled: false,
        show: true,
      },
      {
        title: this.i18n.storageIO.diskio.queueDepth,
        width: '11%',
        key: 'queue_depth',
        sortKey: 'queue_depth',
        disabled: false,
        show: true,
      },
    ],
      this.pidColumns = [
        {
          title: this.i18n.storageIO.ioapis.pid,
          width: '20%',
          key: 'tid',
          selected: null,
          multiple: true,
          searchable: true,
          selectAll: true,
          options: []
        },
        {
          title: this.i18n.storageIO.ioapis.pidName,
          width: '65%',
          key: 'pid',
          selected: null,
          multiple: true,
          selectAll: true,
          searchable: true,
          options: []
        },
      ],
      this.threadColumns = [
        {
          title: this.i18n.storageIO.ioapis.functionName,
          width: '12%',
          key: 'fun_name',
          selected: null,
          multiple: true,
          selectAll: true,
          options: []
        },
        {
          title: this.i18n.storageIO.ioapis.sysTimes,
          width: '18%',
          key: 'exec_count',
          sortKey: 'exec_count'
        },
        {
          title: this.i18n.storageIO.ioapis.average_time_s,
          width: '18%',
          key: 'avg_time',
          sortKey: 'avg_time'
        },
        {
          title: this.i18n.storageIO.ioapis.total_time_s,
          width: '18%',
          key: 'sum_time',
          sortKey: 'sum_time'
        },
        {
          title: this.i18n.storageIO.ioapis.time_ratio,
          width: '18%',
          key: 'percent',
          sortKey: 'percent'
        }
      ];
    this.diskTitle = this.diskColumns.slice(0, 8);
    this.diskCheckedData = this.diskTitle;
  }

  ngOnInit() {
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }
    this.getSummuryData();
  }

  /**
   * 获取summary数据
   */
  public getSummuryData() {
    const params = {
      nodeId: this.nodeid,
    };

    this.obtainingSummaryData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/ioperformance/summary/`, {
      params,
      headers: {
        showLoading: false,
      },
    })
      .then((res: any) => {
        const data = res.data.summary.data;
        if (data.disk_io && Object.keys(data.disk_io).length > 0) {
          this.delDiskData(data.disk_io);
        }
        if (data.api_io && Object.keys(data.api_io).length > 0) {
          this.delIOData(data.api_io);
          this.ifSys = true;
        }
        if (data.suggestion && data.suggestion.length > 0) {
          data.suggestion.forEach((item: any) => {
            this.suggestMsg.push({
              title: this.language === 'zh' ? item.title_chs : item.title_en,
              msgbody: this.language === 'zh' ? item.suggest_chs : item.suggest_en
            });
          });
        }
        if (data.block_trace_statistic && Object.keys(data.block_trace_statistic).length > 0) {
          this.blockIOData = data.block_trace_statistic;
        }
      })
      .catch(() => {
        this.nodataTips = this.i18n.common_term_task_nodata2;
      })
      .finally(() => {
        this.obtainingSummaryData = false;
      });
  }

  /**
   * 处理disk数据
   */
  public delDiskData(data: any) {
    const dev = Object.keys(data); // 设备名称
    this.diskColumns[0].options = dev.map(val => {
      return { label: val };
    });
    this.diskColumns[0].selected = this.diskColumns[0].options;
    const delData: any = [];
    dev.forEach((val, idx) => {
      data[val].dev = val;
      data[val].showDetails = false;
      delData.push(data[val]);
    });
    this.diskOriginData = JSON.parse(JSON.stringify(delData));
    this.diskSrcData.data = delData;
    this.diskTotalNumber = delData.length;
    this.summuryData.diskTableData = JSON.parse(JSON.stringify(delData));
    if (delData && Object.prototype.hasOwnProperty.call(delData[0], 'd2c_w_delay')) {
      this.hasAddI2D = true;
      this.diskColumns.splice(9, 2, {
        title: this.i18n.storageIO.summury.i2d_rdelay,
        width: '11%',
        key: 'i2d_r_delay',
        sortKey: 'i2d_r_delay',
        disabled: false,
        show: true,
      }, {
        title: this.i18n.storageIO.summury.i2d_wdelay,
        width: '11%',
        key: 'i2d_w_delay',
        sortKey: 'i2d_w_delay',
        disabled: false,
        show: true,
      }, {
        title: this.i18n.storageIO.summury.d2c_rdelay,
        width: '11%',
        key: 'd2c_r_delay',
        sortKey: 'd2c_r_delay',
        disabled: false,
        show: true,
      }, {
        title: this.i18n.storageIO.summury.d2c_wdelay,
        width: '11%',
        key: 'd2c_w_delay',
        sortKey: 'd2c_w_delay',
        disabled: false,
        show: true,
      });
    }
  }

  /**
   * 处理io数据
   */
  public delIOData(data: any) {

    const dev = Object.keys(data); // PID
    const delData: any = [];
    const rfilter: any = [];
    dev.forEach((val, idx) => {
      this.pidColumns[0].options.push({ label: val }); // 筛选数据项
      if (rfilter.indexOf(data[val].cmd_name) === -1) {
        rfilter.push(data[val].cmd_name);
        this.pidColumns[1].options.push({ label: data[val].cmd_name });
      }
      if (idx === 0) {
        data[val].showDetails = true;
      } else {
        data[val].showDetails = false;
      }
      data[val].pid = val;
      data[val].displayedData = [];
      data[val].srcData = { data: [] };
      data[val].originData = JSON.parse(JSON.stringify(data[val].fun_info));
      data[val].srcData.data = [...data[val].originData];
      data[val].threadCheckedList = [];
      data[val].options = data[val].srcData.data.map((el: any) => {
        return { label: el.fun_name };
      });
      data[val].selected = data[val].options;
      data[val].pageSize = {
        options: [10, 20, 30, 50],
        size: 10
      };
      data[val].currentPage = 1;
      data[val].totalNumber = data[val].fun_info.length;
      delData.push(data[val]);
    });
    this.ioOriginData = JSON.parse(JSON.stringify(delData));
    this.ioOriginData.forEach((el: any) => {
      el.selected = el.options;
    });
    this.threadSrcData.data = this.ioOriginData;
    this.totalNumber = this.ioOriginData.length;
    this.summuryData.ioTableData = delData;
    this.summuryData.ioColumns = JSON.parse(JSON.stringify(this.pidColumns));
    this.summuryData.ioOriginData = JSON.parse(JSON.stringify(delData));
    this.pidColumns[0].selected = this.pidColumns[0].options;
    this.pidColumns[1].selected = this.pidColumns[1].options;
  }

  /**
   * 查看详细信息
   */
  public viewDiskDetails(obj: any, type: string, func?: any) {
    const detail = {
      dev: obj.dev || '',
      piName: obj.cmd_name || '',
      pid: obj.pid || '',
      func: ''
    };
    if (func) {
      detail.func = func.fun_name;
    }
    this.msgService.sendMessage({
      function: type,
      detail,
      taskName: this.taskName,
    });
  }

  /**
   * I/O APIs 筛选
   */
  public onProcessSelect(list: any): void {
    const pidList = this.pidColumns[0].selected.map((val: any) => {
      return val.label;
    });
    const nameList = this.pidColumns[1].selected.map((val: any) => {
      return val.label;
    });
    this.threadSrcData.data = this.ioOriginData.filter((el: any, idx: any) => {
      return pidList.indexOf(el.pid) > -1 && nameList.indexOf(el.cmd_name) > -1;
    });

    if (this.threadSrcData.data.length === 0) {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }
    this.totalNumber = this.threadSrcData.data.length;
  }


  /**
   * 函数筛选
   */
  public functionSelect(list: any, obj: any) {
    const funList = list.map((val: any) => {
      return val.label;
    });
    obj.srcData.data = obj.originData.filter((el: any) => {
      return funList.indexOf(el.fun_name) > -1;
    });
    obj.totalNumber = obj.srcData.data.length;
  }


  public onDiskSelect(item: any): void {
    const selectList = item.map((val: any) => val.label);
    // 从每一行进行过滤筛选
    this.diskSrcData.data = this.diskOriginData.filter((item1: any) => {
      return selectList.indexOf(item1.dev) > -1;
    });
    this.diskTotalNumber = this.diskSrcData.data.length;
    if (this.diskTotalNumber === 0) { this.nodataTips = this.i18n.common_term_task_nodata2; }
  }

  public onSelectConfirm() {
    const option = JSON.parse(JSON.stringify(this.displayData));
    const specSet = new Set<string>();
    for (const item of this.threadCheckedList) {
      specSet.add(item.pid);
      specSet.add(item.tid);
    }
    option.spec = Array.of(...specSet);
    this.displayData = option;
  }

  public onSelectCancel() {
    this.threadCheckedList = this.threadCheckedList.filter((item: any) => {
      return this.prevThreadCheckedList.some((it: any) => it.tid === item.tid);
    });
  }

  // 展开函数详情
  public beforeToggleFun(row: TiTableRowData, i: any): void {
    if (!row.showDetails) {
      // 导入数据后再将其展开
      this.functionSrcData.data = row.fun_info;
      this.functionTotalNumber = row.fun_info.length;
    }
    row.showDetails = !row.showDetails;
  }

  // 展开详情
  public beforeToggle(row: TiTableRowData, i: any): void {

    if (!row.showDetails) {
      row.showDetails = !row.showDetails;
      // 获取到数据后再将其展开
    } else {
      // 收起时直接收起
      row.showDetails = !row.showDetails;
    }
  }

  public trackByFn(index: number, item: any): number {
    return item.id;
  }

  // 磁盘 表头筛选
  public diskHeaderChange() {
    const length = this.diskCheckedData.length;
    this.diskColspan = length + 2;
    const arr: any = [];
    this.diskCheckedData.forEach((value) => {
      arr.push(value.title);
    });
    if (length < 15) {
      this.diskColumns.forEach((item, index) => {
        if (item.key !== 'dev') {
          item.disabled = false;
        }
      });
    } else {
      this.diskColumns.forEach((item, index) => {
        if (index > 0) {
          if (arr.indexOf(item.title)) {
            item.disabled = false;
          }
          if (arr.indexOf(item.title) === -1) {
            item.disabled = true;
          }
        }
      });
    }
    this.diskTitle.forEach((item, index) => {
      if (index > 0) {
        if (arr.indexOf(item.title)) {
          item.show = true;
        }
        if (arr.indexOf(item.title) === -1) {
          item.show = false;
        }
      }
    });

  }
}
