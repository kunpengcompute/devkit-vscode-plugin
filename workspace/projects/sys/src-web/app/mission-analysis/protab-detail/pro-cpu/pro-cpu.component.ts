import {
  Component, OnInit, AfterViewInit, Input,
  ViewChild, Output, EventEmitter, ElementRef, OnDestroy
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TableService, BatchRequestService } from 'sys/src-com/app/service/index';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-pro-cpu',
  templateUrl: './pro-cpu.component.html',
  styleUrls: ['./pro-cpu.component.scss']
})
export class ProCpuComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    private el: ElementRef,
    private batchRequest: BatchRequestService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() devType: string;
  @Output() getCmdline = new EventEmitter();
  i18n: any;
  @ViewChild('cpuChart') cpu: any;
  @ViewChild('timeLineDetail') timeLineDetail: any;
  @ViewChild('threadScreenMask') threadScreenMaskRef: any;
  public sivCpuOption = true;
  public index = 0;
  public displayData: any;
  public cmdline: any;
  public cmdlinePtid: any; // 防止接口延时，导致这次获取的cmdline是上去调用的接口
  public processNameList: any = [];
  public testData: any = {
    origin_data: {
      time: [],
      values: {}
    },
    key: [],
    spec: []
  };
  public timeLine = { start: 0, end: 100 };
  public timeData: any = [];
  public obtainingData = false;
  public nodataTip = { text: '' };

  // 线程进程相关的参数
  public threadDisplayedData: Array<TiTableRowData> = [];
  public threadColumns: Array<TiTableColumns> = [];
  public keys: Array<string> = [];
  public threadDataSheet: any = []; // 所有的线程的及其数据的列表
  public prevThreadCheckedList: any = [];
  public threadCheckedList: any = []; // 被选中的线程的列表, 只有线程, echarts需要添加对应进程
  public threadSrcData: any = { data: [] };
  public processOptions: any = [];
  public titleWidth: number;
  public hasGetDataArr = new Set<string>();
  public spec = new Set<string>();
  public getAllData: any = {};
  public reqWorker: Worker;
  private sumRequest: Subscription;

  // 分页
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 20
  };
  // 选中项
  public filterCheckedData: Array<any> = [];
  public diskColspan: number;
  public disksHeadShow = false;
  // 设置各层级复选组绑定items数据
  private static getCheckgroupItems(treeData: Array<any>, items: Array<any>, parentData?: Array<any>): any {
    if (treeData) {
      for (const data of treeData) {
        if (data.children) {
          this.getCheckgroupItems(data.children, items);
        } else {
          items.push(data);
        }
      }
    } else {
      items.push(parentData);
    }

    return items;
  }

  ngOnInit() {
    this.nodataTip.text = this.i18n.common_term_task_nodata2;
    this.initList();
    if (this.threadDataSheet.length > 0) {
      this.initTable();
    } else {
      this.sumRequest = this.batchRequest.sumRequest.subscribe(() => {
        this.initList();
        this.initTable();
      });

    }
  }
  /**
   * 等待侧滑框数据请求完成
   */
  private initList() {
    if (this.devType === 'cpu') {
      this.threadDataSheet = JSON.parse(JSON.stringify(this.batchRequest.threadCpuDataSheet));
      this.keys = ['%user', '%system', '%wait', '%CPU'];
    } else if (this.devType === 'disk') {
      this.threadDataSheet = JSON.parse(JSON.stringify(this.batchRequest.threadDiskDataSheet));
      this.keys = ['kB_rd/s', 'kB_wr/s', 'iodelay'];
    }
    else if (this.devType === 'mem') {
      this.threadDataSheet = JSON.parse(JSON.stringify(this.batchRequest.threadMemDataSheet));
      this.keys = ['minflt/s', 'majflt/s', 'VSZ', 'RSS', '%MEM'];
    }
    else if (this.devType === 'context') {
      this.threadDataSheet = JSON.parse(JSON.stringify(this.batchRequest.threadContextDataSheet));
      this.keys = ['cswch/s', 'cswch/s'];
    }
    this.threadColumns = [
      {
        title: 'PID/TID',
        key: 'pid',
        selected: [],
        multiple: true,
        selectAll: true
      }];
    this.keys.forEach((key, idx) => {
      const item = {
        title: key,
        key,
        sortKey: key,
        sortStatus: idx === 0 ? false : null,
      };
      this.threadColumns.push(item);
    });
    // 表头显示
    this.filterCheckedData = [...this.threadColumns];
    this.diskColspan = this.threadColumns.length;
    this.filterCheckedData.push({
        title: 'Command',
        key: 'Command',
        selected: 'Command',
        sortKey: 'Command'
    }, {
        title: 'cmdline',
        key: 'cmdline',
        selected: 'cmdline',
        sortKey: 'cmdline'
    });
  }
  ngOnDestroy() {
    this.sumRequest?.unsubscribe();
  }
  ngAfterViewInit() {
    this.titleWidth = this.el.nativeElement.querySelector('.process-select-box').offsetWidth;
  }

  public initTable() {
    this.threadSrcData.data = this.threadDataSheet;

    // 设置分页的totalNumber
    this.totalNumber = this.threadSrcData.data.length;

    // 设置进程筛选项
    this.processOptions = this.threadDataSheet.map((item: any) => {
      const option = { label: item.pid };
      return option;
    });
    // 设置默认进程选中项, 全选
    this.threadColumns[0].selected = [...this.processOptions];
    // 默认选中并展示第一个指标前五个pid及其包含的tid
    setTimeout(() => {
      this.threadCheckedList = [];
      this.threadDisplayedData.forEach((val: { disabled: boolean; children: Array<object>; }, idx: number) => {
        if (idx < 5 && !val.disabled) {
          val.children.some((item => {
            if (this.threadCheckedList.length < 100) {
              this.threadCheckedList.push(item);
            }
            return  this.threadCheckedList.length === 100;
          }));
        }
      });
      this.getData();
    });
  }
  /**
   * 先请求前5个pid及tid数据, 完成之后分批请求所有数据
   */
  public async getData() {
    const specSet = new Set<string>();
    this.threadCheckedList.forEach((item: { tid: string; pid: string; }) => {
      specSet.add(item.tid);
      specSet.add(item.pid);
    });
    const AllSpecSet = new Set<string>();
    this.threadSrcData.data.forEach((val: { children: any }) => {
      val.children.forEach((ele: { pid: string; tid: string; }) => {
        if (!specSet.has(ele.pid)) {
          AllSpecSet.add(ele.pid);
        }
        if (!specSet.has(ele.pid)) {
          AllSpecSet.add(ele.tid);
        }
      });

    });
    this.spec = specSet;

    const params1 = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      'query-target': this.devType,
      'query-ptid': '',
    };
    this.obtainingData = true;
    this.nodataTip.text = this.i18n.loading;
    const url = `/tasks/${encodeURIComponent(this.taskid)}/process-analysis/`;
    const getResults = (results: any[], isInit?: boolean) => {
      results.forEach(res => {
        if (res.code === 'SysPerf.Success') {
          this.testData.key = res.data.key;
          this.testData.origin_data.time = res.data.origin_data.time;
          this.testData.origin_data.values =
            Object.assign(this.testData.origin_data.values, res.data.origin_data.values);
        } else {
          this.nodataTip.text = this.i18n.common_term_task_nodata2;
        }
      });
      if (isInit) {
        this.setDiskData();
        this.batchRequest.sendRequest(AllSpecSet, url, params1, 2, getResults, false);
      }
    };
    this.batchRequest.sendRequest(specSet, url, params1, 2, getResults, true);
  }

  public receiveCmdline(promise: any) {
    promise.then(({ queryPtid, cmdline }: any) => {
      if (queryPtid === this.cmdlinePtid && this.cmdline !== undefined) {
        this.cmdline = cmdline || this.i18n.process.noCmdline;
      }
    }).catch(() => { });
  }

  public setDiskData() {
    if (this.testData.key.indexOf('Command') > -1) {
      const i = this.testData.key.indexOf('Command');
      this.testData.key.splice(i, 1);
    }
    const spec = [... new Set(this.spec)];

    const option = {
      spec,
      key: this.testData.key,
      data: this.testData.origin_data,
      title: 'CPU Usage',
      type: this.devType
    };
    this.displayData = option;
    this.timeData = option.data.time;
    this.obtainingData = false;
  }
  // 时间轴变化数据改变
  public timeLineData(e: any) {
    this.timeLine = e;
    this.cpu.upDateTimeLine(e);
  }
  // 数据筛选时间轴改变
  public dataZoom(e: any) {
    this.timeLine = e;
    this.timeLineDetail.dataConfig(e);
  }

  // 线程筛选的相关方法
  public onThreadScreenClick() {
    this.threadScreenMaskRef.Open();
    this.prevThreadCheckedList = [...this.threadCheckedList];
  }

  /**
   * 求取平均值
   * @param originValue pid/tid原始数据
   * @param key  分析参数
   */
  public getAvg(originValue: { [x: string]: any; }, key: string | number) {
    const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue;
    const isNULL = (item: any) => item === 'NULL';
    const notNULL = (item: any) => item !== 'NULL';
    const valueArr: [] = originValue[key] || [];
    const valueSum: number | null = valueArr.every(isNULL) ? null : valueArr.filter(notNULL).reduce(reducer, 0);
    const valAvg: number | null = valueSum === null ? null : valueSum / (valueArr.length + 0.0000001);
    return valAvg;
  }

  public onProcessSelect(item: any): void {
    // 从每一行进行过滤筛选
    this.threadSrcData.data = this.threadDataSheet.filter((it: any) => {
      let selected = false;
      this.threadColumns[0].selected.forEach((ele: { label: any; }) => {
        if (ele.label === it.pid) { selected = true; }
      });
      return selected;
    });
    // PID选中数据筛选, 筛掉的时候表格中该选中数据删除,筛出的时候不增加
    const pidSelected: any[] = [];
    const list = item.filter((el: { label: any; }) => {
      const idx = this.threadColumns[0].selected.findIndex((ele1: { label: any; }) => {
        return el.label === ele1.label;
      });
      if (idx > -1) { pidSelected.push(this.threadColumns[0].selected[idx].label); }
      return idx > -1;
    });
    this.threadCheckedList = this.threadCheckedList.filter((val: { pid: any; }) => {
      return pidSelected.includes(val.pid);
    });
  }


  /**
   * 侧滑框确定按钮
   */
  public onSelectConfirm() {
    const option = JSON.parse(JSON.stringify(this.displayData));
    const specSet = new Set<string>();
    for (const item of this.threadCheckedList) {
      specSet.add(item.pid);
      specSet.add(item.tid);
    }
    option.spec = Array.of(...specSet);
    this.displayData = option;
    setTimeout(() => {
      this.cpu.initTable();
    }, 0);
    this.threadScreenMaskRef.CloseIO();
  }

  /**
   * 侧滑框取消按钮
   * @param str 点击遮罩层或者取消按钮
   */
  public onSelectCancel(str?: string) {
    if (str !== 'mask') {
      this.threadScreenMaskRef.CloseIO();
    }
    this.threadCheckedList = [...this.prevThreadCheckedList];
  }

  // 获取数据
  public getItems(data: Array<any>, parentData?: Array<any>): Array<any> {
    const items: Array<any> = [];

    return ProCpuComponent.getCheckgroupItems(data, items, parentData);
  }
}
