
import {
  Component,
  OnInit,
  Input,
  ViewChild,
} from '@angular/core';
import {
  TiTableColumns,
  TiTableRowData,
} from '@cloud/tiny3';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';

@Component({
  selector: 'app-disk-details',
  templateUrl: './disk-details.component.html',
  styleUrls: ['./disk-details.component.scss'],
})
export class DiskDetailsComponent implements OnInit {
  public selectList: any;
  @Input() nodeid: string;
  @Input() taskid: any;
  @Input() selectDevArr: Array<string>;
  @ViewChild('dataTableChart') dataTableChart: any;  // echarts框组件
  @ViewChild('delayTableChart') delayTableChart: any;  // echarts框组件
  @ViewChild('dataBlock') dataBlock: any;  // 数据块分布图组件
  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();
    this.nodataTips = this.i18n.common_term_task_nodata2;
    this.lang = sessionStorage.getItem('language');
    this.dataList.spec = [{ title: this.i18n.storageIO.summury.read, key: 'read' },
    { title: this.i18n.storageIO.summury.write, key: 'write' }];
    this.delayList.spec = [{ title: this.i18n.storageIO.summury.read, key: 'read' },
    { title: this.i18n.storageIO.summury.write, key: 'write' }];
    this.dataList.key = [{
      title: this.i18n.storageIO.diskio.dataSize, key: 'data_size',
      ifShow: true, unit: this.i18n.storageIO.ioapis.kb
    },
    {
      title: this.i18n.storageIO.diskio.throughput, key: 'throughput',
      ifShow: true, unit: this.i18n.storageIO.ioapis.mb
    }],
      this.showKeys = [
        { title: this.i18n.storageIO.diskio.oprateTimes, key: 'times', ifShow: true },
        { title: 'I/OPS', key: 'iops', ifShow: true },
        { title: this.i18n.storageIO.diskio.dataSize, key: 'data_size', ifShow: true },
        { title: this.i18n.storageIO.diskio.throughput, key: 'throughput', ifShow: true },
        { title: this.i18n.storageIO.diskio.delayTime, key: 'd2c_delay_avg', ifShow: true },
        { title: this.i18n.storageIO.diskio.delayTimeI2d, key: 'i2d_delay_avg', ifShow: true },
        { title: this.i18n.storageIO.diskio.queueDepth, key: 'queue_depth', ifShow: true },
      ];

    this.diskColumns = [
      { label: this.i18n.storageIO.ioapis.time, sortKey: 'time' },
      { label: 'DEV', sortKey: 'dev' },
      { label: this.i18n.storageIO.diskio.operateType, sortKey: 'operation_type' },
      { label: this.i18n.storageIO.diskio.delayTime1I2D, sortKey: 'i2d_delay' },
      { label: this.i18n.storageIO.diskio.delayTime1, sortKey: 'd2c_delay' },
      { label: this.i18n.storageIO.diskio.startBlockNo, sortKey: 'start_offset' },
      { label: this.i18n.storageIO.diskio.endBlockNo, sortKey: 'end_offset' },
      { label: this.i18n.storageIO.diskio.dataSize1, sortKey: 'data_size' },
      { label: this.i18n.storageIO.diskio.throughput1, sortKey: 'throughput' },
    ];
    this.dataSizeColumns = [
      { label: this.i18n.storageIO.ioapis.time, key: 'time', width: '14%' },
      { label: this.i18n.storageIO.diskio.events, key: 'event', width: '14%' },
      { label: this.i18n.storageIO.diskio.blocks, key: 'block', width: '14%' },
      { label: this.i18n.sys_res.core, key: 'cpu', width: '14%' },
      { label: this.i18n.storageIO.ioapis.pid, key: 'pid', width: '14%' },
      { label: this.i18n.storageIO.ioapis.pidName, key: 'process_name', width: '14%' },
      { label: this.i18n.common_term_task_tab_summary_callstack, key: 'stack', width: '16%' },
    ];
    this.queueColums = [
      { label: this.i18n.storageIO.ioapis.time, sortKey: 'time', key: 'time', width: '10%' },
      { label: 'DEV', key: 'dev', width: '10%' },
      { label: this.i18n.storageIO.diskio.events, key: 'event', width: '10%' },
      { label: this.i18n.storageIO.diskio.operateType, sortKey: 'operation_type', key: 'operation_type', width: '10%' },
      { label: this.i18n.storageIO.diskio.startBlockNo, sortKey: 'start_offset', key: 'start_offset', width: '10%' },
      { label: this.i18n.storageIO.diskio.blocks, sortKey: 'block', key: 'block', width: '10%' },
      { label: this.i18n.sys_res.core, sortKey: 'cpu', key: 'cpu', width: '10%' },
      { label: this.i18n.storageIO.ioapis.pid, sortKey: 'pid', key: 'pid', width: '10%' },
      { label: this.i18n.storageIO.ioapis.pidName, sortKey: 'process_name', key: 'process_name', width: '10%' },
      { label: this.i18n.common_term_task_tab_summary_callstack, key: 'stack', width: '10%' },
    ];
  }
  public diskDisplayedData: Array<TiTableRowData> = [];
  public diskSearchWords: Array<any> = [];
  public diskSearchKeys: Array<string> = []; // 设置过滤字段
  public diskColumns: Array<TiTableColumns> = [];
  public diskSrcData: any = { data: [] };
  public diskCurrentPage = 1;
  public diskTotalNumber = 0;
  public diskPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public timeLine = {
    start: 0,
    end: 100
  };
  public delayList: any = {
    spec: [],
    key: [],
    devArr: [],
    time: [],
    data: {},
  };
  public dataList: any = {
    spec: [],
    key: [],
    devArr: [],
    time: [],
    data: {},
  };
  public dataSizeColumns: any = [];
  public queueColums: any = [];
  public nodataTips = '';
  public originData: any = []; // 请求获取的总的原始数据
  public timeTitle = '--';
  public selectDev: any;
  public devArr: any = [];
  public topState = 'notActive'; // 上下折叠面板状态, active:展开
  public lang: any; // 语言,zh-cn: 中文, 'en-us': 英文
  public i18n: any;
  public pidFunction: string;
  public selectKey = 'iops';
  public selectKey2 = '';
  public showKeys: any = []; // 所有指标表
  public delayTableData: any = []; // 时延框选单个设备数据暂存
  public dataSizeTableData: any = []; // 数据单个设备数据暂存
  public showDetailsTable = false; // 详情表格显示
  public blockData: any = { data: [], time: [] };  // I/O数据块分布图数据
  public tlbData: any = { // 传给diskTable的所有数据
    columns: [],
    displayed: ([] as Array<TiTableRowData>),
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
    pageNo: 0,
    hasPage: true,
    total: (undefined as number),
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };
  public hoverArrow: any = '';
  ngOnInit() {
  }
  public toggleTop(refresh?: any) {
    if (!refresh) {
      this.topState === 'active'
        ? (this.topState = 'notActive')
        : (this.topState = 'active');
    } else {
      this.selectList = refresh;
      this.topState = 'active';
      const brushTime = this.selectList.brushTime;
      this.timeTitle = brushTime[0] + '-' + brushTime[1];
      this.getBrushData(brushTime[0], brushTime[1]);
    }

    if (this.topState !== 'active') {
    }
  }

  // 展开详情
  public beforeToggle(row: TiTableRowData, i: any): void {
    // 展开时
    if (!row.showDetails) {
      // 导入数据后再将其展开
      this.diskSrcData.data.forEach((val: any) => {
        val.showDetails = false;
      });
      this.tlbData.srcData.data = row.children;
    }
    row.showDetails = !row.showDetails;
  }

  /**
   * 根据框选内容,请求详细信息
   */
  public getBrushData(startTime: any, endTime: any) {
    this.nodataTips = this.i18n.loading;
    let param = '';
    this.selectKey = this.selectList.item.key;
    switch (this.selectKey) {
      case 'iops':
        this.selectKey2 = 'detail_event_org_data_by_time';
        param = 'event_org_data_by_time';
        break;
      case 'times':
        this.selectKey2 = 'detail_event_org_data_by_time';
        param = 'event_org_data_by_time';
        break;
      case 'data_size':
        this.selectKey2 = 'detail_io_op_size';
        param = 'io_op_size';
        break;
      case 'throughput':
        this.selectKey2 = 'detail_io_op_size';
        param = 'io_op_size';
        break;
      case 'd2c_delay_avg':
        this.selectKey2 = 'detail_io_op_delay';
        param = 'io_op_delay';
        this.delayList.key = [{
          title: this.i18n.storageIO.diskio.delayTime, key: 'd2c_delay_avg',
          ifShow: true, unit: this.i18n.storageIO.ioapis.us
        }, ];
        break;
      case 'i2d_delay_avg':
        this.selectKey2 = 'detail_io_op_delay';
        param = 'io_op_delay';
        this.delayList.key = [{
          title: this.i18n.storageIO.diskio.delayTimeI2d, key: 'i2d_delay_avg',
          ifShow: true, unit: this.i18n.storageIO.ioapis.us
        }, ];
        break;
      case 'queue_depth':
        this.selectKey2 = 'detail_event_org_data_by_id';
        param = 'event_org_data_by_id';
        break;
    }
    const params = {
      nodeId: this.nodeid,
      startTime,
      endTime,
    };
    this.Axios.axios.get('/tasks/' + encodeURIComponent(this.taskid) + '/ioperformance/'
      + encodeURIComponent(this.selectKey2) + '/?' + this.Axios.converUrl(params))
      .then((res: any) => {
        const data = res.data[param].data;
        if (data) {
          this.originData = data;
          this.beforeDel(data, this.selectKey2);
        }
      })
      .catch(() => {
        this.nodataTips = this.i18n.common_term_task_nodata2;
      });
  }

  public beforeDel(data: any, key: any) {
    const devList = this.selectDevArr;
    const devArr1 = devList.filter(el => {
      let hasData = false;
      if (Object.prototype.toString.call(data[el]) === '[object Object]'
       && Object.prototype.hasOwnProperty.call(data[el], 'chart')) {
        hasData = data[el].chart.length > 0;
      } else {
        hasData = data[el].length > 0;
      }
      return hasData;
    });
    this.devArr = devList.map(val => ({ label: val }));
    this.selectDev = devArr1[0] ? { label: devArr1[0] } : this.devArr[0]; // 下拉框默认选中第一个有数据的
    this.delDevData(data[this.selectDev.label], key, this.selectDev.label);
  }

  // 选择设备下拉框
  public devChange(e: any) {
    this.delDevData(this.originData[e.label], this.selectKey2, e.label);
  }

  /**
   *  选择展示设备数据
   */
  public delDevData(data: any, key: any, dev?: string) {
    this.showDetailsTable = false;
    switch (key) {
      case 'detail_event_org_data_by_time':
        this.delTimesIops(data);
        break;
      case 'detail_io_op_size':
        this.delthroughSize(data, dev);
        break;
      case 'detail_io_op_delay':
        this.delDelay(data, dev);
        break;
      case 'detail_event_org_data_by_id':
        this.delQueue(data);
        break;
    }
  }

  /**
   * 操作次数
   */
  public delTimesIops(data: any) {
    this.tlbData.columns = this.dataSizeColumns;
    if (!data) {
      this.diskSrcData.data = [];
      return;
    }
    const dataLine: any = [];
    data.forEach((val: any, index: any) => {
      const item = val[0];
      item.showDetails = false;
      item.dev = this.selectDev.label;
      if (item.operation_type.indexOf('W') > -1) {
        item.operation_type = this.i18n.storageIO.summury.write;
      } else {
        item.operation_type = this.i18n.storageIO.summury.read;
      }
      item.children = val.slice(1);
      dataLine.push(item);
    });
    this.diskTotalNumber = data.length;
    this.diskSrcData.data = dataLine;
    if (dataLine.length === 0) {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }
  }

  /**
   * 吞吐率和data size
   */
  public delthroughSize(data: any, dev: any) {
    this.dataList.time = [];
    this.dataList.data = this.selectList.data;
    this.dataList.data[dev].read.data_size = [];
    this.dataList.data[dev].write.data_size = [];
    this.dataList.data[dev].read.throughput = [];
    this.dataList.data[dev].write.throughput = [];
    this.dataList.devArr = [dev];
    data.detail.forEach((ele: any) => {
      this.dataList.time.push(ele.time);
      this.dataList.data[dev].read.data_size.push(ele.read[0]);
      this.dataList.data[dev].read.throughput.push(ele.read[1]);
      this.dataList.data[dev].write.data_size.push(ele.write[0]);
      this.dataList.data[dev].write.throughput.push(ele.write[1]);
    });
    setTimeout(() => {
      if (this.dataTableChart) {
        this.dataTableChart.initTable();
      }
    }, 100);
    this.tlbData.columns = this.dataSizeColumns;
    this.delayTableData = data.detail;
    this.blockData.data = [];
    this.blockData.time = [];
    data.chart.forEach((ele: any) => {
      const item = [ele.time, ele.start_offset, ele.end_offset];
      this.blockData.data.push(item);
      this.blockData.time.push(ele.time);
    });
    setTimeout(() => {
      if (this.dataBlock) {
        this.dataBlock.setData();
      }
    }, 100);
  }

  /**
   * 时延详情
   */
  public delDelay(data: any, dev: any) {
    this.delayList.data = this.selectList.data;
    this.delayList.time = [];
    this.delayList.devArr = [dev];
    this.delayList.data[dev].read.delay_avg = [];
    this.delayList.data[dev].write.delay_avg = [];
    data.forEach((ele: any) => {
      this.delayList.time.push(ele.time);
      this.delayList.data[dev].read.delay_avg.push(ele.read);
      this.delayList.data[dev].write.delay_avg.push(ele.write);
    });
    if (this.delayTableChart) {
      this.delayTableChart.initTable();
    }
    this.tlbData.columns = this.dataSizeColumns;
    this.delayTableData = data;
  }

  /**
   * 队列深度详情
   */
  public delQueue(data: any) {
    this.tlbData.columns = this.queueColums;
    this.tlbData.total = data.length;
    this.tlbData.srcData.data = data.map((item: any) => {
      item.dev = this.selectDev.label;
      if (item.operation_type.indexOf('W') > -1) {
        item.operation_type = this.i18n.storageIO.summury.write;
      } else {
        item.operation_type = this.i18n.storageIO.summury.read;
      }
      if (item.pid === null) { item.pid = '--'; }
      if (item.stack === null) { item.stack = '--'; }
      return item;
    });
  }


  /**
   * 点击查看详情按钮
   */

  public diskViewDetails(time: any) {
    const showData = this.delayTableData.filter((val: any, idx: any) => {
      return val.time === time;
    });
    this.tlbData.total = showData.length;
    this.tlbData.srcData.data = showData.map((item: any) => {
      if (item.pid === null) { item.pid = '--'; }
      return item;
    });
    this.showDetailsTable = true;
  }
  public closeDetails(type: any) {
    this.showDetailsTable = false;
  }
  public onHoverClose(msg?: any) {
    this.hoverArrow = msg;
  }

}

