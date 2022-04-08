import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableComponent, TiTableDataState, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { SummuryDataService } from '../storage-summury/summury-data.service';
import { connect } from 'echarts';

@Component({
  selector: 'app-diskio',
  templateUrl: './diskio.component.html',
  styleUrls: ['./diskio.component.scss']
})
export class DiskioComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @ViewChild('timeLineDetail') timeLineDetail: any ;  // 时间轴组件
  @ViewChild('tableChart') tableChart: any ;  // echarts框组件
  @ViewChild('threadScreenMask') threadScreenMaskRef: any ;
  @ViewChild('brushDetails') brushDetails: any ;  // 详情组件
  @Input() // 从总览页面来的筛选设备
  public set select(item: any) {
    this.flameSelect = item;
    this.dev = item.dev;
  }
  public get select() {
    return this.flameSelect;
  }
  public brushKeyData: object;
  public flameSelect: any;
  public dev = ''; // 不为''来判断是从summury跳转来的
  public nodataTips = '';
  public i18n: any;
  public uuid: any;
  public timeLine = {
    start: 0,
    end: 100
  };
  public selectFunctionList: any  = {
    showLe: false,
    showAxis: false,
    spec: [],
    key: [],
    devArr: [],
    time: [],
    data: {},
  };
  public chartList: any = []; // 将show的指标拆开来
  public showKeys: Array<any>; // 所有show的指标
  public selectShowKeys: Array<any>; // 选择show的指标
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public ifNoData = false;
  public threadDisplayedData: Array<TiTableRowData> = [];
  public threadSrcData: any  = { data: [] };
  public threadCheckedList: any  = []; // 被选中的列表
  public threadDataSheet: any = []; // 所有的列表
  public processOptions: any = [];
  public someData: any  = {}; // 保存筛选取消前的状态
  public displayData: any;
  public threadColumns: Array<TiTableColumns> = [];

  public showTopData: any = [];  // 判断Top筛选是否展示
  public custermSelect = true; // 自定义筛选
  public disksHeadShow = false;
  public diskCheckedData: Array<any> = [];
  //  表头筛选数据
  public diskTitle: Array<TiTableColumns> = [];
  public originDiskData: any  = [];
  public disData: any = {}; // 分布图数据
  public obtainingData = false;
  constructor(
    private leftShowService: LeftShowService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    public summuryData: SummuryDataService
  ) {
    this.i18n = this.i18nService.I18n();
    this.nodataTips = this.i18n.loading;
    this.showKeys = [
      { title: this.i18n.storageIO.diskio.oprateTimes, key: 'times',
       ifShow: true, unit: this.i18n.storageIO.ioapis.times},
      { title: 'IOPS', key: 'iops', ifShow: true, unit: this.i18n.storageIO.ioapis.times },
      { title: this.i18n.storageIO.diskio.dataSize, key: 'data_size',
       ifShow: true, unit: this.i18n.storageIO.ioapis.kb },
      { title: this.i18n.storageIO.diskio.throughput, key: 'throughput',
       ifShow: true, unit: this.i18n.storageIO.ioapis.mb },
       { title: this.i18n.storageIO.diskio.delayTimeI2d, key: 'i2d_delay_avg',
       ifShow: true, unit: this.i18n.storageIO.ioapis.us },
      { title: this.i18n.storageIO.diskio.delayTime, key: 'd2c_delay_avg',
       ifShow: true, unit: this.i18n.storageIO.ioapis.us },
      { title: this.i18n.storageIO.diskio.queueDepth, key: 'queue_depth', ifShow: true, unit: '' },
    ];
    this.showTopData = [
      { title: this.i18n.storageIO.diskio.top_ior, key: 'read.times', ifShow: false, },
      { title: this.i18n.storageIO.diskio.top_iow, key: 'write.times', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_iopsr, key: 'read.iops', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_iopsw, key: 'write.iops', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_datar, key: 'read.data_size', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_dataw, key: 'write.data_size', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_thr, key: 'read.throughput', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_thw, key: 'write.throughput', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_delayr_i2d, key: 'read.i2d_delay_avg', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_delayw_i2d, key: 'write.i2d_delay_avg', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_delayr, key: 'read.d2c_delay_avg', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_delayw, key: 'write.d2c_delay_avg', ifShow: false },
      { title: this.i18n.storageIO.diskio.top_queue, key: 'read.queue_depth', ifShow: false },
      { title: this.i18n.common_term_task_start_custerm, key: 'custerm', ifShow: true },
    ];
    this.threadColumns = [
      {
        title: 'DEV',
        width: '6%',
        key: 'dev',
        searchable: true, // 该列的 headfilter 的下拉中是否开启搜索功能
        selected: null,
        multiple: true,
        selectAll: true,
        options: [],
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.roprateTime,
        width: '10%',
        key: 'read_times',
        sortKey: 'read_times',
        show: true,
        disabled: false,
      },
      {
        title: this.i18n.storageIO.summury.woprateTime,
        width: '10%',
        key: 'write_times',
        sortKey: 'write_times',
        show: true,
        disabled: false,
      },
      {
        title: this.i18n.storageIO.summury.riops,
        width: '8%',
        key: 'r_iops',
        sortKey: 'r_iops',
        show: true,
        disabled: false,
      },
      {
        title: this.i18n.storageIO.summury.wiops,
        width: '8%',
        key: 'w_iops',
        sortKey: 'w_iops',
        show: true,
        disabled: false,
      },
      {
        title: this.i18n.storageIO.summury.rdataSize,
        width: '10%',
        key: 'read_size',
        sortKey: 'read_size',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.wdataSize,
        width: '10%',
        key: 'write_size',
        sortKey: 'write_size',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.rrate,
        width: '11%',
        key: 'r_throughput',
        sortKey: 'r_throughput',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.wrate,
        width: '11%',
        key: 'w_throughput',
        sortKey: 'w_throughput',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.i2drdelay,
        width: '11%',
        key: 'i2d_r_delay',
        sortKey: 'i2d_r_delay',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.i2dwdelay,
        width: '11%',
        key: 'i2d_w_delay',
        sortKey: 'i2d_w_delay',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.rdelay,
        width: '11%',
        key: 'd2c_r_delay',
        sortKey: 'd2c_r_delay',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.summury.wdelay,
        width: '11%',
        key: 'd2c_w_delay',
        sortKey: 'd2c_w_delay',
        show: true,
        disabled: true,
      },
      {
        title: this.i18n.storageIO.diskio.queueDepth,
        width: '11%',
        key: 'queue_depth',
        sortKey: 'queue_depth',
        show: true,
        disabled: true,
      },
    ];
    this.diskTitle = this.threadColumns.slice(0, 3);
    this.diskCheckedData = this.diskTitle;
  }

  ngOnInit() {
    this.uuid = this.Axios.generateConversationId(12);
    this.threadSrcData.data = this.summuryData.diskTableData;
    this.totalNumber = this.summuryData.diskTableData.length;
    this.getData();
  }
  // 时间轴筛选
  public timeLineData(e: any ) {
    this.timeLine = e;
    this.leftShowService.timelineUPData.next(e);
  }

  // 数据筛选 更新时间轴
  public dataZoom(e: any ) {
    this.timeLine = e;
    this.timeLineDetail.dataConfig(e);
    this.timeLineData(e);
  }

  /**
   * 框选事件
   */
  public brushOut(e: any ) {
    if (e === 'click') {
      const ele = document.querySelectorAll('.mask-box') as NodeListOf<HTMLElement>;
      ele.forEach(el => {
        el.style.display = 'none';
      });
    } else {
      if (e.brushTime.length > 0) {
        this.brushKeyData = JSON.parse(JSON.stringify(e));
        this.brushDetails.toggleTop(this.brushKeyData);

      }
    }
  }


  /**
   * 获取数据
   */
  public getData() {
    const params = {
      nodeId: this.nodeid,
    };
    this.obtainingData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/ioperformance/detail_io_op_all/`, {
      params,
      headers: {
        showLoading: false,
      },
    })
      .then((res: any) => {
        this.originDiskData = res.data.io_op_all.data;
        const data = res.data.io_op_all.data.val;
        this.selectFunctionList.devArr = [];
        if (data && Object.keys(data).length > 0) {

          const devArr = Object.keys(data);
          const test = devArr.map(val => {
            if (Object.prototype.hasOwnProperty.call(data[val], 'time')) {
              this.selectFunctionList.time = data[val].time;
              return;
            }
          });

          if (this.dev) { // 如果是从总览跳转过来的
            if (data[this.dev]) {
              this.selectFunctionList.devArr = [this.dev];
              this.ifNoData = false;
            } else {
              this.ifNoData = true;
            }
            this.threadCheckedList = this.threadSrcData.data.filter((el: any ) => {
              return el.dev === this.dev;
            });

          } else {
            this.threadCheckedList = this.threadSrcData.data.filter((el: any ) => {
              return !el.is_empty;
            });
            this.selectFunctionList.devArr = this.threadCheckedList.map((val: any ) =>  val.dev);
          }
          this.delData(data);

        } else {
          this.nodataTips = this.i18n.common_term_task_nodata2;
        }
      })
      .catch(() => {
        this.nodataTips = this.i18n.common_term_task_nodata2;
      })
      .finally(() => {
        this.obtainingData = false;
      });
  }
  /**
   * 处理请求数据
   */
  public delData(data: any ) {
    this.selectFunctionList.spec = [{ title: this.i18n.storageIO.summury.read, key: 'read' },
    { title: this.i18n.storageIO.summury.write, key: 'write' }];
    if (!this.custermSelect) {  // 非自定义数据
    const selectType =  this.showTopData.find((val: any ) => val.ifShow);
    const selectArr = selectType.key.split('.');
    const selectDevArr = this.originDiskData.top[selectArr[0]][selectArr[1]];
    this.selectFunctionList.devArr = selectDevArr;
    this.showKeys = this.showKeys.map(val => {
     val.ifShow = val.key === selectArr[1] ? true : false;
     return val;
    });
    this.selectFunctionList.spec = this.selectFunctionList.spec.filter((el: any ) => {
      return el.key === selectArr[0];
    });
    } else {
      this.selectFunctionList.devArr = this.threadCheckedList.map((el: any ) => {
        return el.dev;
      });
    }
    this.disData = {};
    this.selectFunctionList.devArr.forEach((el: any ) => {
      this.disData[el] = this.originDiskData.val[el];
    });
    const keyLest = this.showKeys.filter((el) => el.ifShow === true);
    this.selectFunctionList.data = data;
    this.chartList = [];
    keyLest.forEach((el, idx) => { // key: 指标; spec: 读/写;
      const showLe = idx === 0  || el.key === 'queue_depth' ? true : false;
      const showAxis = idx === keyLest.length - 1 ? true : false;
      this.selectFunctionList.showLe = showLe;
      this.selectFunctionList.showAxis = showAxis;
      this.selectFunctionList.key = [el];
      if (el.key === 'queue_depth') {
        this.selectFunctionList.spec = [{ title: this.i18n.storageIO.summury.read, key: 'read' }];
      }
      this.chartList.push(JSON.parse(JSON.stringify(this.selectFunctionList)));
    });
  }


  // 磁盘 表头筛选
  public diskHeaderChange() {
    const length = this.diskCheckedData.length;
    const arr: any = [];
    this.diskCheckedData.forEach((value) => {
      arr.push(value.title);
    });
    if (length < 3) {
      this.threadColumns.forEach((item, index) => {
        if (item.key !==  'dev') {
        item.disabled = false;
        }
      });
    } else {
      this.threadColumns.forEach((item, index) => {
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


   // 筛选框打开,保存筛选状态
   public onThreadScreenClick() {
    this.threadScreenMaskRef.Open();
    this.someData.devList = this.threadCheckedList.map((el: any ) => el.dev);
    this.someData.showTopData = JSON.parse(JSON.stringify(this.showTopData));
    this.someData.showKeys = JSON.parse(JSON.stringify(this.showKeys));
    this.someData.custermSelect = this.custermSelect;
  }
  /**
   * 筛选滑框确认
   */
  public onSelectConfirm() {
    this.delData(this.originDiskData.val);
    this.threadScreenMaskRef.CloseIO();
  }

  /**
   * 筛选滑框取消
   */
  public onSelectCancel(str?: any ) {
    if (str !== 'mask') {
      this.threadScreenMaskRef.CloseIO();
    }
    this.threadCheckedList =  this.threadSrcData.data.filter((el: any ) => {
    return !el.is_empty && this.someData.devList.indexOf(el.dev) > -1;
  });
    this.showTopData = this.someData.showTopData;
    this.showKeys = this.someData.showKeys;
    this.custermSelect = this.someData.custermSelect;
  }

  /**
   * 展示指标选择,多选
   */

  public keySelect(item: any , index: any ) {
    const selectArr = this.showKeys.filter((val, idx) => {
      return val.ifShow;
    });
    if (selectArr.length < 2 && item.ifShow) { return; } // 至少选择一个指标
    this.showKeys[index].ifShow = !this.showKeys[index].ifShow;
  }

  /**
   * top数据筛选,单选
   */
  public selectTopData(item: any , index: any ) {
    if (this.showTopData[index].ifShow === true) { return; }
    this.showTopData.forEach((val: any , idx: any ) => {
      val.ifShow = false;
    });
    this.showTopData[index].ifShow = true;
    const arrLength = this.showTopData.length;
    if (index === arrLength - 1) { // 自定义筛选
      this.custermSelect = this.showTopData[index].ifShow;
    } else {
      this.custermSelect = false;
    }
  }

  public showAllData() {
    this.threadCheckedList = this.threadSrcData.data.filter((el: any ) => {
      return !el.is_empty;
    });
    this.delData(this.originDiskData.val);
  }
}

