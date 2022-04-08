import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiTreeNode,
  TiTreeUtil
} from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { LibService } from '../../service/lib.service';

@Component({
  selector: 'app-sample-lock',
  templateUrl: './sample-lock.component.html',
  styleUrls: ['./sample-lock.component.scss']
})
export class SampleLockComponent implements OnInit, OnDestroy {
  constructor(
    private stompService: StompService,
    private route: ActivatedRoute,
    private router: Router,
    private libService: LibService,
    public i18nService: I18nService,
    private downloadService: SamplieDownloadService,
    private msgService: MessageService
  ) {
    this.i18n = this.i18nService.I18n();
    this.columnsMonitor = [
      {
        title: '',
      },
      {
        title: 'name',
        width: '30%',
        sortKey: ''
      },
      {
        title: 'total_block_time',
        width: '25%',
        sortKey: 'totalDuration'
      },
      {
        title: 'thread',
        width: '20%',
        sortKey: 'diffThreads'
      },
      {
        title: 'count',
        width: '25%',
        sortKey: 'count'
      }
    ];
    this.columnsThread = [
      {
        title: 'name',
        width: '30%',
        sortKey: ''
      },
      {
        title: 'total_block_time',
        width: '30%',
        sortKey: 'totalDuration'
      },
      {
        title: 'count',
        width: '40%',
        sortKey: 'count'
      }
    ];
    this.searchClass.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.protalserver_sampling_lock_monitor.name
      }
    );
    this.searchThread.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.protalserver_sampling_lock_thread.name
      }
    );
  }
  @ViewChild('stackTrace') stackTrace: any;
  public recordId = '';
  public topicUrl = '';
  public stompClient: any;
  i18n: any;

  // 表格部分
  public displayedMonitor: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataMonitor: TiTableSrcData;
  public columnsMonitor: Array<TiTableColumns> = [];
  public closeOtherDetails = true;
  public noDadaInfo = '';
  public searchClass: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchClass.value];
  public searchKeys: Array<string> = ['className'];

  public displayedThread: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataThread: TiTableSrcData;
  public columnsThread: Array<TiTableColumns> = [];
  public searchThread: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public threadSearchWords: Array<string> = [this.searchThread.value];
  public threadSearchKeys: Array<string> = ['threadName'];

  public totalCountMonitor = 0;
  public totalCountThr = 0;
  public totalCountStackTrace = 0;
  // stack trace部分
  public stackTranceData: Array<TiTreeNode> = [];

  public getDataTimer: any = null;
  public dataLens = 0;
  public monitorDatas: Array<any> = [];

  public stackTraceDataAll: any = [];

  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceData,
    false,
    false
  );

  private wsFinishSub: Subscription;
  public finishLock = false;
  public lockClass: any = [];
  public lockThread: any = [];
  public lockInstances: any = [];
  public currentInstances: any = [];
  public currentThreads: any = [];
  public stackTraceMap: any = {};
  public currentStackTrace: any = [];
  public isSelectedClass = '';
  public isSelectedInstance = '';
  public isSelectedThread = '';
  public onSelectedClass = 'class';
  public onSelectedInstance = 'instance';
  public onSelectedThread = 'thread';
  public eventType = 'LOCK';
  public index = '';
  private lockStrategy: any = {
    MONITOR_CLASS: (data: any) => {
      this.handleLockClass(data);
    },
    MONITOR_THREAD: (data: any) => {
      this.handleLockThread(data);
    },
    MONITOR_INSTANCE: (data: any) => {
      this.handleLockInstancs(data);
    },
    MONITOR_MAP: (data: any) => {
      this.handleLockStacktraceMap(data);
    }
  };
  // 右侧表格分页
  public leftCurrentPage = 1;
  public leftTotalNumber = 0;
  public leftPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public rightCurrentPage = 1;
  public rightTotalNumber = 0;
  public rightPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  /**
   * 页面初始化
   */
  ngOnInit() {
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.recordId = this.getRecordId();
    this.topicUrl = `/user/queue/sample/records/${this.recordId}`;
    this.srcDataMonitor = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.srcDataThread = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    this.importCache();
    if (!this.finishLock) {
      this.getSamplingData('lock', this.recordId);
      this.showLoding();
    } else {
      const firstRow = this.srcDataMonitor.data[0];
      this.getThreadByClass(firstRow);
      let tempTimer = setTimeout(() => {
        this.onSelected(this.onSelectedClass, firstRow?.className);
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
    }
    this.wsFinishSub = this.msgService.getSampleLockMessage().subscribe(msg => {
      this.closeLoding();
      if (msg.type === 'LOCK') {
        this.finishLock = true;
        this.getThreadByClass(this.lockClass[0]);
        this.onSelected(this.onSelectedClass, this.lockClass[0]?.className);
        return;
      }
      this.lockStrategy[msg.type](msg.content);
    });

  }
  /**
   * 切换页面后保留当前页面数据
   */
  ngOnDestroy() {
    clearTimeout(this.getDataTimer);
    this.getDataTimer = null;
    this.downloadService.downloadItems.lock.isFinish = this.finishLock;
    this.downloadService.downloadItems.lock.data = this.srcDataMonitor.data;
    this.downloadService.downloadItems.lock.instances = this.lockInstances;
    this.downloadService.downloadItems.lock.stackTraceMap = this.stackTraceMap;
    this.downloadService.downloadItems.lock.lockThread = this.lockThread;
    if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    this.closeLoding();
  }
  /**
   * 处理类数据
   * @param data 类数据
   */
  public handleLockClass(data: any) {
    data.forEach((item: any) => {
      this.totalCountMonitor += item.count;
    });
    this.lockClass = data;
    this.srcDataMonitor.data = data;
  }
  /**
   * 处理线程数据
   * @param data 线程数据
   */
  public handleLockThread(data: any) {
    this.lockThread = this.lockThread.concat(data);
  }
  /**
   * 处理监视器数据
   * @param data 监视器数据
   */
  public handleLockInstancs(data: any) {
    this.lockInstances.push.apply(this.lockInstances, data);
  }
  /**
   * 处理栈跟踪数据
   * @param data 栈跟踪map
   */
  public handleLockStacktraceMap(data: any) {
    data.forEach((item: any) => {
      this.stackTraceMap = Object.assign(this.stackTraceMap, item);
    });
  }

  /**
   * 获取监视器Instances所有线程
   * @param ins 当前监视器instance
   */
  public getThreadList(ins: any) {
    this.totalCountThr = ins.count;
    this.srcDataThread.data = ins.diffThreads;
  }
  /**
   * 获取当前类的所有线程
   * @param row 当前类
   */
  public getThreadByClass(row: any) {
    if (row) {
      let instance: any = [];
      let thread: any = [];
      this.lockInstances.forEach((item: any) => {
        if (item.className === row?.className) {
          instance = instance.concat(item.instances);
        }
      });
      this.lockThread.map((item: any) => {
        if (item.className === row?.className) {
          thread = thread.concat(item.diffThreadList);
        }
      });
      this.currentInstances = instance;
      this.totalCountThr = row.count;
      this.srcDataThread.data = thread;
      this.beforeToggle(1, row);
    }
  }
  /**
   * tiny表格方法，异步请求当前行下的子数据
   * @param row 当前行
   */
  public beforeToggle(level: any, row: TiTableRowData): void {
    if (level === 2) {
      return;
    }
    this.srcDataMonitor.data.forEach(e => {
      if (row.className !== e?.className) {
        e.showDetails = false;
      }
    });
    row.showDetails = !row.showDetails;
  }
  /**
   * 获取当前sample分析的recordId
   */
  private getRecordId() {
    const url = this.router.url;
    let params = url.slice(10);
    const lastIndex = params.indexOf('/');
    params = params.slice(0, lastIndex);
    return params;
  }
  /**
   * 获取数据过度动画
   */
  private showLoding() {
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  /**
   * 结束获取数据过度动画
   */
  private closeLoding() {
    document.getElementById('sample-loading-box').style.display = 'none';
  }
  /**
   * 获取当前页签数据
   * @param type 当前页签类型
   * @param data recordId
   */
  public getSamplingData(type: any, data: any) {
    const uuid = this.libService.generateConversationId(8);
    const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
    this.stompService.subscribeStompFn(requestUrl);
    this.stompService.startStompRequest('/cmd/sub-record', {
      recordId: data,
      recordType: type.toUpperCase(),
      uuid
    });
  }
  /**
   * 切换页签时倒入第一次请求的数据
   */
  public importCache() {
    this.finishLock = this.downloadService.downloadItems.lock.isFinish;
    this.srcDataMonitor.data = this.downloadService.downloadItems.lock.data;
    this.lockThread = this.downloadService.downloadItems.lock.lockThread;
    this.lockInstances = this.downloadService.downloadItems.lock.instances;
    this.stackTraceMap = this.downloadService.downloadItems.lock.stackTraceMap;
    this.srcDataMonitor.data.forEach(item => {
      this.totalCountMonitor += item.count;
    });
  }
  /**
   * 获取当前点击行名称，同时请求栈信息
   * @param type 点击行的类型
   * @param name 点击行的名称
   */
  public onSelected(type: any, name: any) {
    switch (type) {
      case 'class':
        this.isSelectedClass = name;
        this.isSelectedInstance = '';
        this.isSelectedThread = '';
        break;
      case 'instance':
        this.isSelectedInstance = name;
        this.isSelectedThread = '';
        break;
      default:
        this.isSelectedThread = name;
    }
    this.getStraceTraceData();
  }
  /**
   * 获取点击某行的栈信息
   */
  public getStraceTraceData() {
    const selectclass = this.isSelectedClass ? `${this.isSelectedClass}` : '';
    const instances = this.isSelectedInstance ? `#${this.isSelectedInstance}` : '';
    const threads = this.isSelectedThread ? `#${this.isSelectedThread}` : '';
    this.index = encodeURIComponent(`${selectclass}${instances}${threads}`);
    if (!Object.keys(this.stackTrace.strackTraceMap).length) {
      this.stackTrace.strackTraceMap = this.stackTraceMap;
    }
    this.stackTrace.getStraceTraceData(this.index);
  }
  /**
   * 搜索
   * @param value value
   */
  classSearch(value: string): void {
    this.searchWords[0] = value;
  }
  classClear(value: string): void {
    this.searchWords[0] = '';
  }
  threadSearch(value: string): void {
    this.threadSearchWords[0] = value;
  }
  threadClear(value: string): void {
    this.threadSearchWords[0] = '';
  }
}
