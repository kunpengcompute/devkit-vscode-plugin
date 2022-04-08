import {
  Component, OnInit, ElementRef, Renderer2, ViewChild,
  TemplateRef, OnDestroy, Input, SecurityContext
} from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { MytipService } from '../../service/mytip.service';
import { AxiosService } from '../../service/axios.service';
import {
  TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent,
  TiTableDataState, TiValidationConfig, TiValidators
} from '@cloud/tiny3';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { Router } from '@angular/router';
import { LibService } from '../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';

@Component({
  selector: 'app-profile-memorydump',
  templateUrl: './profile-memorydump.component.html',
  styleUrls: ['./profile-memorydump.component.scss']
})

export class ProfileMemorydumpComponent implements OnInit, OnDestroy {
  @ViewChild('cancalDump') cancalDump: any;
  @Input() snapShot: boolean;
  @Input() snapShotTag: boolean;
  @Input() snapShotData: any;
  @Input() offlineHeapdump: boolean; // 是否是从离线报告，内存转储进入
  @Input() offlineHeapdumpId: string;
  constructor(
    private stompService: StompService,
    public i18nService: I18nService,
    private msgService: MessageService,
    private myTip: MytipService,
    private Axios: AxiosService,
    public regularVerify: RegularVerify,
    private renderer: Renderer2,
    public downloadService: ProfileDownloadService,
    private router: Router,
    public libService: LibService,
    public domSanitizer: DomSanitizer,
    public fb: FormBuilder,
  ) {
    this.i18n = this.i18nService.I18n();
    this.searchValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.protalserver_profiling_memoryDump.class
      }
    );
    this.saveReportForm = fb.group({
      reportName: new FormControl('', this.regularVerify.reportNameValid(this.i18n)),
      reporRemark: new FormControl('', this.regularVerify.reportRemarkValid(this.i18n))
    });
  }
  @ViewChild('treeBody') treeBody: TemplateRef<any>;
  @ViewChild('shortCommonRouteModal') shortCommonRouteModal: any;
  @ViewChild('saveHeapDump') saveHeapDump: any;
  public saveReportForm: FormGroup;
  public isOpen = true;
  public isOpenTree = true;
  public popType: any;
  public shortCommonRouteObj: any;
  public objectWithGcRootsRouteObj: any;
  public currentHover: any;
  public treeHover: any;
  public myOptions2: Array<any> = [
    { label: 'soft Ref', englishname: 'soft Ref', val: 'needSoftRef' },
    { label: 'weak Ref', englishname: 'weak Ref', val: 'needWeakRef' },
    { label: 'phantom Ref ', englishname: 'phantom Ref', val: 'needPhantomRef' },
  ];
  public mySelecteds2: any = [this.myOptions2[0], this.myOptions2[1], this.myOptions2[2]];
  public hoverClose = '';
  // 直方图显示更多下标
  public histogramOnHoverMoreIdx: any;
  public treeOnHoverMoreIdx: any;
  public histogramShowRow: any;
  public histogramShowIdx: any;
  public histogramShow: any = true;
  public moerHover: any;
  public objectWithGcRootsRouteVal: any;
  public i18n: any;
  public startBtnDisabled: any;
  public isDownload: any;
  public isStopMsgSub: any;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public noDadaInfo: string;
  public columns: Array<TiTableColumns> = [];
  public currentPage: any = 1;
  public totalNumber: any = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 20
  };
  public displayedTree: Array<TiTableRowData> = [];
  public srcDataTree: TiTableSrcData;
  public columnsTree: Array<TiTableColumns> = [];
  public totalNumberT: any = 0;
  public currentNumber: any = 0;
  public typeOptions: any = {};
  public typeSelected: any;
  public chartType = '';
  public guardianId: any;
  public jvmId: any;
  public recordId: any;
  public showLoading: any = false;
  public sortKey: any = '';
  public sortType: any = '';
  public showHistogramMore = '';
  public sortKeyTree: any = '';
  public sortTypeTree: any = '';
  public currentTotal: any = 0;
  public currentTreeId: any = 0;
  public currentTreeDate: {};
  public currentNode: any = {
    childNum: 20,
    className: '',
    expand: true,
    id: -1,
    isOpen: false,
    level: 0,
    percentage: '',
    pid: -1,
    retainedHeap: 0,
    shallowHeap: 0,
    totalNum: 0
  };
  public sortList: any = [
    {
      id: 0,
      type: '',
      imgType: 'sort',
      show: true,
      left: '20%'
    },
    {
      id: 1,
      type: 'asc', // 升序
      imgType: 'sort-ascent',
      show: false,
      left: '32%'
    },
    {
      id: 2,
      type: 'desc', // 降序
      imgType: 'sort-descent',
      show: false,
      left: '28%'
    }
  ];
  public numOfInstanceSort: any = [];
  public shallowHeapSort: any = [];
  public retainedHeapSort: any = [];
  public retainedHeapTSort: any = [];
  public shallowHeapTSort: any = [];
  public percentageTSort: any = [];
  public treeList: any = [];
  public showNodate = true;
  public dumpState: any = '';
  public progress: any = 0;
  public showCancalBtn: any = true;
  public showProgress: any = true;
  public barLength: any = 0;
  public currentDumpState: any = '';
  public language: any;
  public nowRecordId: any;
  public showSearch: any = true;
  // 快照
  public tip1Context: any;
  public snapCount: number;
  public searchValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchValue.value];
  public searchKeys: Array<string> = ['className'];
  public hisSpans = false;
  public treeSpans = false;
  public isDoSnapClick = true; // 防止重复点击
  public existSearchValue: string; // 判断是否存在搜索值
  public getDumpState: any = true;
  public isLoading: any = false;
  public analyzID: string;
  // 保存报告
  public reportName: string;
  public reportRemarks: string;
  public sugReport = true;
  public reportNameHolder: string;
  public saveReport = false;
  // 表单验证部分
  public reportNameValidation: TiValidationConfig = {
    type: 'blur',
  };
  public reportRemarkValidation: TiValidationConfig = {
    type: 'blur',
  };
  public reportDisabled = false;
  public heapdumpList: number;
  public maxHeapCount: number;
  public userId: string;
  public userRole: string;
  public heapdumpName: string;
  public saveReportTip: string;
  public successSaveReportTip: string;
  public isAlermDisk = false;  // 工作空间
  ngOnInit() {
    this.isAlermDisk = this.downloadService.downloadItems.isAlermDisk;
    this.saveReportTip = this.i18nService.I18nReplace(this.i18n.profileMemorydump.saveHeapDump.saveReportTip, {
      0: this.i18n.profileMemorydump.saveHeapDump.heapDump,
    });
    this.successSaveReportTip =
      this.i18nService.I18nReplace(this.i18n.profileMemorydump.saveHeapDump.successSaveReportTip, {
        0: this.i18n.profileMemorydump.saveHeapDump.heapDump,
      });
    this.heapdumpList = this.downloadService.downloadItems.report.heapdumpList;
    this.maxHeapCount = this.downloadService.downloadItems.report.maxHeapCount;
    this.heapdumpName = this.downloadService.downloadItems.report.heapdumpName;
    this.userId = sessionStorage.getItem('loginId');
    this.userRole = sessionStorage.getItem('role');
    if (this.snapShot) {
      this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_tab.snapshot;
    } else {
      this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_tab.memoryDump;
    }
    // 报告输入提示语
    this.reportNameHolder = this.i18n.profileMemorydump.saveHeapDump.reportNameHolder;
    // 排序初始化
    this.numOfInstanceSort = JSON.parse(JSON.stringify(this.sortList));
    this.shallowHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.shallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.percentageTSort = JSON.parse(JSON.stringify(this.sortList));

    // 获取快照数量
    this.handleSnapShotCount('heapDump');
    this.showNodate = this.downloadService.downloadItems.heapDump.showNodate;
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    this.language = sessionStorage.getItem('language') === 'en-us' ? false : true;
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');

    this.columns = [
      {
        title: this.i18n.protalserver_profiling_memoryDump.class,
        width: '55%',
        isSort: false,
        sortKey: ''
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.instance,
        width: '15%',
        isSort: true,
        sortKey: 'numOfInstance',
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.sHeap,
        width: '15%',
        isSort: true,
        sortKey: 'shallowHeap',
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.rHeap,
        width: '15%',
        isSort: true,
        sortKey: 'retainedHeap',
      }
    ];
    this.srcData = {
      data: [], // 源数据
      state: {
        searched: false,
        sorted: false,
        paginated: true
      }
    };
    this.columnsTree = [
      {
        title: this.i18n.protalserver_profiling_memoryDump.class,
        width: '55%',
        isSort: false,
        sortKey: ''
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.sHeap,
        width: '15%',
        isSort: true,
        sortKey: 'shallowHeap',
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.rHeap,
        width: '15%',
        isSort: true,
        sortKey: 'retainedHeap',
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.Percentage,
        width: '15%',
        isSort: true,
        sortKey: 'percentage',
      }
    ];
    this.srcDataTree = {
      data: [], // 源数据
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    // 直方图支配树切换
    this.typeOptions = [
      {
        label: this.i18n.protalserver_profiling_memoryDump.dumpType.histogram,
        id: 'histogram'
      },
      {
        label: this.i18n.protalserver_profiling_memoryDump.dumpType.dominantTree,
        id: 'dominantTree'
      }
    ];
    this.typeSelected = this.typeOptions[0];
    this.chartType = this.typeOptions[0].id;
    if (this.offlineHeapdump) {
      this.snapShotTag = true;
      this.startBtnDisabled = false;
      this.getHistogram(1, this.pageSize.size, 1);
      this.getDomtree(0);
      return;
    }
    if (!this.snapShot) {
      // 切回内存转储页面时判断转储状态
      const dumpDataDetail = JSON.parse(sessionStorage.getItem('dumpState'));
      if (dumpDataDetail) {
        const state = dumpDataDetail.jvmRecord.state;
        const fileSize = this.bytesToSize(dumpDataDetail.fileSize);
        const maxTime = this.libService.secondToHMS(dumpDataDetail.maxTime);
        const minTime = this.libService.secondToHMS(dumpDataDetail.minTime);
        if (state && this.recordId !== '') {
          this.showLoading = true;
          this.currentDumpState = state;
          if (state === 'FAILED') {
            this.showNodate = true;
            this.showLoading = false;
          }
          if (state === 'WARN') {
            this.showNodate = true;
            this.showLoading = false;
          }
          if (state === 'STARTED') {
            this.dumpState = this.i18n.protalserver_profiling_memoryDump.dumpState;
          }
          if (state === 'DUMPED') {
            this.dumpState = this.i18nService.I18nReplace(
              this.i18n.protalserver_profiling_memoryDump.dumpContent1,
              { 0: fileSize }
            );
          }
          if (state === 'TRANSFERRING') {
            this.progress = dumpDataDetail.percent;
            this.barLength = `${dumpDataDetail.percent}%`;
            this.dumpState = this.i18nService.I18nReplace(
              this.i18n.protalserver_profiling_memoryDump.dumpContent1,
              { 0: fileSize }
            );
          }
          if (state === 'TRANSFER_COMPLETED' || state === 'DUMP_COMPLETED') {
            this.showProgress = true;
            this.progress = dumpDataDetail.percent;
            this.barLength = `${dumpDataDetail.percent}%`;
            this.dumpState = this.i18nService.I18nReplace(
              this.i18n.protalserver_profiling_memoryDump.dumpContent,
              { 0: fileSize, 1: minTime, 2: maxTime }
            );
          }
          if (state === 'PARSE_COMPLETED') {
            this.dumpState = '';
            this.showCancalBtn = false;
            this.getHistogram(1, this.pageSize.size, 1);
            this.getDomtree(0);
          }
        }
      }

      this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
        if (msg.type === 'isStopPro') {
          this.startBtnDisabled = true;
          if (this.srcData.data.length === 0) {
            this.showNodate = true;
          }
          this.showLoading = false;
          sessionStorage.removeItem('dumpState');
        }
        if (msg.type === 'errors') {
          this.showNodate = true;
          this.showLoading = false;
        }
        if (msg.type === 'isRestart' || msg.type === 'isClear' || msg.type === 'isClearOne') {
          this.initData();
          if (msg.type === 'isRestart') {
            this.startBtnDisabled = false;
            this.snapCount = 0;
          }
          this.showNodate = true;
          this.showLoading = false;
        }
        if (msg.type === 'exportData') {
          this.downloadData();
        }
        if (msg.type === 'setDeleteOne') {
          this.msgService.sendMessage({ type: 'getDeleteOne', });  // 清除本页面的发送事件
          if (this.showNodate || this.showLoading) {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'true',
            });
          } else {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'false',
            });
          }
        }
      });
      this.heapGetMessage();
    }

    if (this.snapShot) {
      this.currentPage = 1;
      this.showLoading = false;
      return;
    }

    // 切换页签保存原来数据
    this.recordId = this.downloadService.downloadItems.heapDump.newRecordId;
    this.srcData.data = this.downloadService.downloadItems.heapDump.histogram;
    this.srcDataTree.data = this.downloadService.downloadItems.heapDump.domtree;
    this.currentPage = this.downloadService.downloadItems.heapDump.histogramStatus.currentPage;
    this.pageSize.size = this.downloadService.downloadItems.heapDump.histogramStatus.size;
    if (!this.showNodate && !this.showLoading && this.srcData.data.length === 0) {
      this.getHistogram(1, this.pageSize.size, 1);
      this.getDomtree(0);
    }
    this.totalNumber = this.downloadService.downloadItems.heapDump.histogramStatus.totalNumber;
    this.currentTotal = this.downloadService.downloadItems.heapDump.domtreeStatus.currentTotal;
    this.totalNumberT = this.downloadService.downloadItems.heapDump.domtreeStatus.totalNumberT;
  }

  public heapGetMessage() {
    this.stompService.heapDump = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'heap') {
        if (msg.state === 'ERROR') {
          this.showNodate = true;
          this.showLoading = false;
          sessionStorage.removeItem('dumpState');
          return;
        }
        if (msg.data.errorMessage) {
          this.myTip.alertInfo({
            type: 'warn',
            content: msg.data.errorMessage,
            time: 10000
          });
        }
        const heapInfo = msg.data.jvmRecord;
        this.recordId = heapInfo.id;
        this.downloadService.downloadItems.heapDump.newRecordId = this.recordId;
        if (heapInfo.state === 'FAILED') {
          this.showNodate = true;
          this.showLoading = false;
          sessionStorage.removeItem('dumpState');
          return;
        }
        if (heapInfo.state === 'STARTED') {
          this.currentDumpState = 'STARTED';
          this.dumpState = this.i18n.protalserver_profiling_memoryDump.dumpState;
        }
        if (heapInfo.state === 'DUMPED') {
          this.currentDumpState = 'DUMPED';
          this.progress = 0;
          this.barLength = '0px';
          const fileSize = this.bytesToSize(msg.data.fileSize);
          this.dumpState = this.i18nService.I18nReplace(
            this.i18n.protalserver_profiling_memoryDump.dumpContent1,
            { 0: fileSize }
          );
        }
        if (heapInfo.state === 'TRANSFERRING') {
          this.currentDumpState = 'TRANSFERRING';
          this.showProgress = false;
          this.progress = msg.data.percent;
          this.barLength = `${msg.data.percent}%`;
          const fileSize = this.bytesToSize(msg.data.fileSize);
          this.dumpState = this.i18nService.I18nReplace(
            this.i18n.protalserver_profiling_memoryDump.dumpContent1,
            { 0: fileSize }
          );
        }
        if (heapInfo.state === 'TRANSFER_COMPLETED') {
          this.currentDumpState = 'TRANSFER_COMPLETED';
          this.progress = msg.data.percent;
          this.barLength = `${msg.data.percent}%`;
          const maxTime = this.libService.secondToHMS(msg.data.maxTime);
          const minTime = this.libService.secondToHMS(msg.data.minTime);
          const fileSize = this.bytesToSize(msg.data.fileSize);
          this.dumpState = this.i18nService.I18nReplace(
            this.i18n.protalserver_profiling_memoryDump.dumpContent,
            { 0: fileSize, 1: minTime, 2: maxTime }
          );
          this.showProgress = true;
        }
        if (heapInfo.state === 'DUMP_COMPLETED') {
          this.currentDumpState = 'DUMP_COMPLETED';
        }
        if (heapInfo.state === 'PARSE_COMPLETED') {
          this.currentDumpState = 'PARSE_COMPLETED';
          this.dumpState = '';
          this.showCancalBtn = false;
          if (this.getDumpState) {
            this.getHistogram(1, this.pageSize.size, 1);
            this.getDomtree(0);
          }
        }
      }
    });
  }
  /**
   * 管理员获取内存列表
   */
  // flag用户判断是否为刷新列表操作
  private heapdumpRequest(id: string) {
    const params = { userId: id };
    this.Axios.axios.post('/heap/actions/query', params).then(
      (resp: any) => {
        if (resp.data.length) {
          this.heapdumpList = resp.data.length;
        }
      },
    );
  }
  /**
   * 普通用户获取内存列表
   */
  private heapdumpUserRequest() {
    this.Axios.axios.get('/heap/actions/list').then(
      (resp: any) => {
        if (resp.data.length) {
          this.heapdumpList = resp.data.length;
        }
      },
    );
  }
  // 启动内存转储
  public refreshData() {
    this.getDumpState = true;
    this.saveReport = false;
    this.downloadService.downloadItems.heapDump.saveReported = false;
    if (this.snapShot || this.isDownload || this.startBtnDisabled) { return; }
    this.initData();
    if (this.userRole === 'Admin') {
      this.heapdumpRequest(this.userId);
    } else {
      this.heapdumpUserRequest();
    }
    this.showNodate = false;
    this.showLoading = true;

    this.showHistogramMore = '';
    this.treeOnHoverMoreIdx = '';
    this.stompService.startStompRequest(
      '/cmd/start-heap-dump',
      { jvmId: this.jvmId, guardianId: this.guardianId }
    );
  }
  /**
   * 初始化数据
   */
  public initData() {
    this.srcData.data = new Array();
    this.srcDataTree.data = new Array();
    this.displayed.length = 0;
    this.displayedTree.length = 0;
    this.currentTotal = 0;
    this.currentPage = 1;
    this.pageSize.size = 20;
    this.showCancalBtn = true;
    this.currentDumpState = '';
    this.dumpState = '';
    this.progress = 0;
    this.barLength = 0;
    this.currentNode.id = -1;
  }
  // 确认删除弹框
  public openCancal() {
    this.cancalDump.type = 'warn';
    this.cancalDump.alert_show();
    this.cancalDump.alertTitle = this.i18n.protalserver_profiling_memoryDump.cancalTitle;
    this.cancalDump.haveContent = false;
    this.cancalDump.content = this.i18n.protalserver_profiling_memoryDump.cancalTip;
    this.cancalDump.deleteStatu = true;
  }

  // 取消内存转储
  public confirmHandle_stop(data: any) {
    if (data) {
      const gId = encodeURIComponent(this.guardianId);
      const rId = encodeURIComponent(this.recordId);
      this.getDumpState = false;
      this.Axios.axios.post(`guardians/${gId}/stopHeapDump/${rId}`)
        .then((resp: any) => {
          if (resp.code === 0) {
            this.showNodate = true;
            this.showLoading = false;
            this.initData();
            this.myTip.alertInfo({
              type: 'success',
              content: this.i18n.protalserver_profiling_memoryDump.cancalSuccess,
              time: 3500
            });
            sessionStorage.removeItem('dumpState');
          } else {
            this.myTip.alertInfo({
              type: 'warn',
              content: resp.message,
              time: 3500
            });
          }
        })
        .catch(() => {
          if (this.srcData.data.length > 0) { return; }
          this.showNodate = true;
          this.showLoading = false;
          sessionStorage.removeItem('dumpState');
        });
    }
  }
  // 直方图分页
  public stateUpdate(tiTable: TiTableComponent): void {
    if (this.srcData.data.length === 0) { return; }
    const dataState: TiTableDataState = tiTable.getDataState();
    if (this.snapShot) {
      this.downloadService.downloadItems.snapShot.currentPage = dataState.pagination.currentPage;
    }
    if (this.searchValue.value) {
      this.onSearchValue(this.searchValue.value, dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
    } else {
      this.getHistogram(dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
    }
  }
  // 获取直方图数据
  public getHistogram(page: any, size: any, time?: any) {
    if (this.snapShot) {
      this.recordId = this.downloadService.downloadItems.heapDump.recordId;
    } else {
      this.recordId = this.downloadService.downloadItems.heapDump.newRecordId;
    }
    const params = {
      page,
      size,
      sortBy: this.sortKey,
      sort: this.sortType
    };
    if (!time) {
      this.isLoading = true;
    }
    let url: string;
    if (this.offlineHeapdump) {
      url = `/heap/${this.offlineHeapdumpId}/query/histogram`;
    } else {
      const encodeGuardianId = encodeURIComponent(this.guardianId);
      const encodeJvmId = encodeURIComponent(this.jvmId);
      const encodeRecordId = encodeURIComponent(this.recordId);
      url = `/guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps/${encodeRecordId}/histogram`;
    }
    this.Axios.axios.post(url, params, { headers: { showLoading: false } }).then((res: any) => {
      this.totalNumber = res.totalElements;
      this.srcData.data = res.members;
      this.showNodate = false;
      if (!time) {
        this.isLoading = false;
      }
      if (!this.snapShot) {
        sessionStorage.removeItem('dumpState');
      }
    })
      .catch(() => {
        if (!time) {
          this.isLoading = false;
        }
        if (this.srcData.data.length > 0) { return; }
        this.showNodate = true;
        this.showLoading = false;
        sessionStorage.removeItem('dumpState');
      });
  }

  // 获取支配树数据  根据当前node元素和其children个数获取剩余children
  public getDomtree(currentTotal: any, lastObj?: any) {
    this.isLoading = true;
    if (this.snapShot) {  // 快照调用
      this.recordId = this.downloadService.downloadItems.heapDump.recordId;
    } else {
      this.recordId = this.downloadService.downloadItems.heapDump.newRecordId;
    }
    if (this.isDownload || this.startBtnDisabled) { return; }
    let currentLastObj = {};
    if (lastObj) {
      currentLastObj = {
        id: lastObj.id,
        retainedHeap: lastObj.retainedHeap,
        shallowHeap: lastObj.shallowHeap
      };
    } else {
      currentLastObj = null;
    }
    const params = {
      predecessorId: this.currentNode.id, // 第一次初始化为 -1,后续请求数据为数据id
      currentTotal,
      size: 20,
      sortBy: this.sortKeyTree,
      sort: this.sortTypeTree,
      currentLastObj
    };
    let url: string;
    if (this.offlineHeapdump) {
      url = `/heap/${this.offlineHeapdumpId}/query/domtree`;
    } else {
      const encodeGuardianId = encodeURIComponent(this.guardianId);
      const encodeJvmId = encodeURIComponent(this.jvmId);
      const encodeRecordId = encodeURIComponent(this.recordId);
      url = `/guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps/${encodeRecordId}/domtree`;
    }
    this.Axios.axios.post(url, params, { headers: { showLoading: false } }).then((res: any) => {
      res.members.forEach((item: any) => {
        item.level = this.currentNode.id === -1 ? 0 : this.currentNode.level + 1;
        item.levelArr = this.counter(item.level);
        item.pId = this.currentNode.id === -1 ? 'tiTableRoot' : this.currentNode.id;
        item.isShow = this.currentNode.id === -1 ? true : false;
        item.isOpen = false;
        item.firstAdd = 0;  // 用于判断是否第一次展开 0->请求数据; 1->仅展开收起
        item.totalNum = 0;  // 当前层级的总数量
        item.childNum = 0;  // 子树的数量
        item.flag = 0; // 0代表第一次展开，1代表点击查看更多
        item.percentage = (100 * item.percentage).toFixed(2);
        if (!this.snapShot) {
          sessionStorage.removeItem('dumpState');
        }
      });

      // 合并树的数据
      if (this.currentNode.id === -1) {
        this.srcDataTree.data.push.apply(this.srcDataTree.data, res.members);
        this.totalNumberT = res.totalElements;
        this.currentTotal += res.members.length;
      } else {
        const childList = this.srcDataTree.data.filter(item => {
          return item.pId === this.currentNode.id && item.level === this.currentNode.level + 1;
        });
        let insertNode: any;  // 获取插入子树的位置
        if (childList.length > 0) {
          const lastChild = childList[childList.length - 1];
          const lastChildId = lastChild.id;
          this.currentNode.lastChildId = lastChildId;
          insertNode = (e: any) => e.id === lastChildId; // 无children时插入父级后面
        } else {
          insertNode = (e: any) => e.id === this.currentNode.id;  // 有子树时插入最后一个child后面
        }
        const cId = this.srcDataTree.data.findIndex(insertNode); // 获取定位node节点的id
        this.srcDataTree.data.splice(cId + 1, 0, ...res.members); // 继续向最后一个孩子后面插入children
        this.currentNode.totalNum = res.totalElements;  // 获取某一个树的同层级总数
        this.currentNode.childNum += res.members.length; // 当前节点的children个数
        this.currentNode.lastChildId = res.members[res.members.length - 1].id; // 获取当前节点最后一个子树的id
      }
      this.toggleChildren(this.srcDataTree.data, this.currentNode.id, this.currentNode.isOpen); // 显示新获取的数据
      if (document.getElementsByClassName(`${this.currentNode.id}load`)[0]) {
        const loadNode = document.getElementsByClassName(`${this.currentNode.id}load`)[0];
        loadNode.parentNode.removeChild(loadNode);
      }
      let tempTimer = setTimeout(() => {
        this.creatLoadMore();
        if (!this.snapShot) {
          this.showNodate = false;
          this.showLoading = false;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
    })
      .catch(() => {
        this.isLoading = false;
        if (this.srcDataTree.data.length > 0) { return; }
        this.showNodate = true;
        this.showLoading = false;
        sessionStorage.removeItem('dumpState');
      });
  }

  // 当前node的展开收起
  async toggle(node: any) {
    node.firstAdd += 1;
    this.currentNode = node;
    node.isOpen = !node.isOpen;
    if (!node.isOpen) {
      if (document.getElementsByClassName(`${this.currentNode.id}load`)[0]) {
        const loadNode = document.getElementsByClassName(`${this.currentNode.id}load`)[0];
        loadNode.parentNode.removeChild(loadNode);
      }
    } else {
      this.creatLoadMore();
    }
    if (node.firstAdd > 1 || this.isDownload) {
      this.toggleChildren(this.srcDataTree.data, node.id, node.isOpen);  // 不是第一次展开，仅展开;
      return;
    } else {
      await this.getDomtree(node.childNum);  // 若为第一次展开，请求数据;//若为第一次展开，请求数据;
    }
  }

  // 父级收起展开时控制子树的展示与隐藏
  private toggleChildren(data: Array<any>, id: any, pExpand: boolean): void {
    for (const node of data) {
      if (node.pId === id) {
        node.isShow = pExpand; // 处理当前子节点
        if (pExpand === false) {// 折叠时递归处理当前节点的子节点
          this.toggleChildren(data, node.id, false);
          if (document.getElementsByClassName(`${node.id}load`)[0]) {
            const loadNode = document.getElementsByClassName(`${node.id}load`)[0];
            this.renderer.setProperty(loadNode, 'hidden', true);
          }
        } else {  // 展开时递归处理当前节点的子节点
          if (node.isOpen === true) {
            this.toggleChildren(data, node.id, true);
            if (!this.snapShot) {
              if (document.getElementsByClassName(`${node.id}load`)[0]) {
                const loadNode = document.getElementsByClassName(`${node.id}load`)[0];
                this.renderer.setProperty(loadNode, 'hidden', false);
              }
            }
          }
        }
      }
    }
  }

  // tableRoot层级的查看更多
  public loadMore(currentTotal: any) {
    this.currentNode = {
      childNum: 20,
      className: '',
      expand: true,
      id: -1,
      isOpen: false,
      level: 0,
      percentage: '',
      pid: -1,
      retainedHeap: 0,
      shallowHeap: 0,
      totalNum: 0
    };
    const childArr = this.srcDataTree.data.filter(item => {
      return item.level === 0;
    });
    this.getDomtree(currentTotal, childArr[childArr.length - 1]);
  }

  // 创建 查看更多元素
  public creatLoadMore() {
    if (this.isDownload || this.startBtnDisabled || this.currentNode.id === -1) { return; }
    if (this.currentNode.childNum < this.currentNode.totalNum) {
      // 创建元素
      const load = document.createElement('tr');
      load.className = `${this.currentNode.id}load`;
      let blueBg = ``;
      for (let i = 0; i <= this.currentNode.level; i++) {
        const bg = `<span style='position: absolute;width: 35px;
        height: 43px;top: 0;left:${i * 37}px;background-color: #f5f9ff;
          border-right:2px solid #0067ff;'></span>`;
        blueBg += bg;
      }
      const html = `<td style='border-bottom:none;position:relative;
      padding-left:${this.currentNode.level * 36 + 45}px;font-size: 12px;
        font-weight: 400;z-index:1'>
      ${blueBg}
      <span style="margin-right: 20px;color:#0067ff;cursor: pointer;"><span id='${this.currentNode.id}More'>
      ${this.i18n.protalserver_profiling_memoryDump.loadMore}</span></span>
      <span style="margin-right: 10px;">${this.i18n.protalserver_profiling_memoryDump.currentShow}：
      ${this.domSanitizer.sanitize(SecurityContext.HTML,
         this.libService.setThousandSeparator(this.currentNode.childNum))}</span>
      <span style="margin-right: 10px;">${this.i18n.protalserver_profiling_memoryDump.totalNum}：
      ${this.domSanitizer.sanitize(SecurityContext.HTML,
         this.libService.setThousandSeparator(this.currentNode.totalNum))}</span>
      <span style="margin-right: 10px;">${this.i18n.protalserver_profiling_memoryDump.Remain}：
      ${this.domSanitizer.sanitize(SecurityContext.HTML,
        this.libService.setThousandSeparator(this.currentNode.totalNum - this.currentNode.childNum))}</span>
      <span style="margin-left:${(this.currentNode.level + 1) * 37}px;width:100%;display:inline-block;left:0;
      border-bottom: 1px solid #e1e6ee;position: absolute;bottom: 0;">
      </td><td></td><td></td><td></td>`;
      load.innerHTML = html;
      $(load).insertAfter(`.${this.currentNode.lastChildId}`);
      const lookMore = document.getElementById(`${this.currentNode.id}More`);
      lookMore.addEventListener('click', (event) => {
        this.currentNode.flag = 1;
        const data: any = event.target;
        const loadId = Number(data.id.replace(/[a-zA-Z]/g, ''));
        const currentNode = this.srcDataTree.data.filter(item => {
          return item.id === loadId;
        });
        this.currentNode = currentNode[0];
        this.currentNode.id = this.currentNode.id;
        const lastObj = this.srcDataTree.data.filter(item => {
          return item.id === this.currentNode.lastChildId;
        });
        this.getDomtree(this.currentNode.childNum, lastObj[0]);
      });
    } else {
      return;
    }
  }

  // 表格层级偏移位置计算
  public getLevelStyle(node: any): { 'padding-left': string } {
    return {
      'padding-left': `${node.level * 37 + 10}px`
    };
  }

  // 表格底边线偏移距离计算
  public getBorder(node: any): { 'margin-left': string } {
    return {
      'margin-left': `${node.level * 37}px`
    };
  }

  // 蓝色标记定位距离计算
  public getbgLevelStyle(node: any, index: any): { 'left': string } {
    return {
      left: `${(index - 1) * 37}px`
    };
  }

  // 获取前面蓝色背景标记循环个数
  public counter(level: number) {
    const arr = [];
    for (let i = 0; i <= level; i++) {
      arr.push(i);
    }
    return arr;
  }

  // 显示类型切换
  public typeChange(data: any): void {
    if (data.id === 'dominantTree') {
      this.showSearch = false;
    } else {
      this.showSearch = true;
    }
    this.chartType = data.id;
    if (this.snapShot) {
      this.downloadService.downloadItems.heapDump.chartType = this.chartType;
    }
  }

  // 直方图排序
  public getHistogramSort(idx: any, sortKey: any) {
    if (this.srcData.data.length === 0) { return; }
    // normal
    this.numOfInstanceSort = JSON.parse(JSON.stringify(this.sortList));
    this.shallowHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    if (idx > 1) {
      idx = 0;
    } else {
      idx++;
    }
    if (sortKey === 'numOfInstance') {
      this.numOfInstanceSort.forEach((item: any) => {
        item.show = false;
      });
      this.numOfInstanceSort[idx].show = true;
    }
    if (sortKey === 'shallowHeap') {
      this.shallowHeapSort.forEach((item: any) => {
        item.show = false;
      });
      this.shallowHeapSort[idx].show = true;
    }
    if (sortKey === 'retainedHeap') {
      this.retainedHeapSort.forEach((item: any) => {
        item.show = false;
      });
      this.retainedHeapSort[idx].show = true;
    }
    this.sortType = this.sortList[idx].type;
    if (!this.sortType){
      this.sortKey = '';
    } else{
      this.sortKey = sortKey;
    }
    this.srcData.data = [];
    this.currentPage = 1;
    if (this.searchValue.value) {
      this.onSearchValue(this.searchValue.value, 1, 20);
    } else {
      this.getHistogram(1, 20);
    }

  }

  // 支配树排序
  public getDominantTreeSort(idx: any, sortKey: any) {
    if (this.srcDataTree.data.length === 0) { return; }
    // normal
    this.currentTotal = 0;
    this.retainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.shallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.percentageTSort = JSON.parse(JSON.stringify(this.sortList));
    if (idx > 1) {
      idx = 0;
    } else {
      idx++;
    }
    if (sortKey === 'percentage') {
      this.percentageTSort.forEach((item: any) => {
        item.show = false;
      });
      this.percentageTSort[idx].show = true;
    }
    if (sortKey === 'shallowHeap') {
      this.shallowHeapTSort.forEach((item: any) => {
        item.show = false;
      });
      this.shallowHeapTSort[idx].show = true;
    }
    if (sortKey === 'retainedHeap') {
      this.retainedHeapTSort.forEach((item: any) => {
        item.show = false;
      });
      this.retainedHeapTSort[idx].show = true;
    }
    this.sortTypeTree = this.sortList[idx].type;
    if (!this.sortTypeTree){
      this.sortKeyTree = '';
    } else{
      this.sortKeyTree = sortKey;
    }
    this.srcDataTree.data = [];
    this.currentNode.id = -1;
    this.getDomtree(0);
  }

  ngOnDestroy(): void {
    this.isLoading = false;
    if (this.snapShot || this.isDownload || this.offlineHeapdump) {
      return;
    }
    this.downloadData();
    this.stompService.heapDump.unsubscribe();
    this.msgService.sendMessage({ type: 'getDeleteOne', });  // 清除本页面的发送事件
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
  }
  public downloadData() {
    this.downloadService.downloadItems.heapDump.recordId = this.recordId;
    this.downloadService.downloadItems.heapDump.dumpState = this.dumpState;
    this.downloadService.downloadItems.heapDump.histogramStatus.totalNumber = this.totalNumber;
    this.downloadService.downloadItems.heapDump.histogramStatus.currentPage = this.currentPage;
    this.downloadService.downloadItems.heapDump.histogramStatus.size = this.pageSize.size;
    this.downloadService.downloadItems.heapDump.domtreeStatus.currentTotal = this.currentTotal;
    this.downloadService.downloadItems.heapDump.domtreeStatus.totalNumberT = this.totalNumberT;
    this.downloadService.downloadItems.heapDump.histogram = this.srcData.data;
    this.downloadService.downloadItems.heapDump.domtree = this.srcDataTree.data;
    this.downloadService.downloadItems.heapDump.showNodate = this.showNodate;
  }

  // 快照点击事件
  public compare(property: any) {
    return (a: any, b: any) => {
      const value1 = a[property];
      const value2 = b[property];
      return value2 - value1;
    };
  }
  public doSnap() {
    if (this.isDoSnapClick) {
      this.isDoSnapClick = false;
      // 事件
      this.doSnapFn();
      // 定时器
      let tempTimer = setTimeout(() => {
        this.isDoSnapClick = true;
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 1000); // 一秒内不能重复点击
    }
  }
  public doSnapFn() {
    this.isLoading = true;
    if (this.srcData.data.length > 0 || this.srcDataTree.data.length > 0) {
      if (this.snapCount < 5) {
        const encodeGuardianId = encodeURIComponent(this.guardianId);
        const encodeJvmId = encodeURIComponent(this.jvmId);
        const encodeRecordId = encodeURIComponent(this.recordId);
        this.Axios.axios.put(`guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps/${encodeRecordId}`, null,
          { headers: { showLoading: false } }).then((res: any) => {
            this.isLoading = false;
            if (res) {
              this.preserveSnapShot('heapDump');
            }
          }).catch(() => {
            this.isLoading = false;
          });
      } else {
        this.myTip.alertInfo({
          type: 'warn',
          content: this.i18n.memorydump_snapshot_analysis_alert,
          time: 3500
        });
      }
    } else {
      this.isLoading = false;
      return this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.snapshot_analysis_noData,
        time: 3500
      });
    }
  }
  public onModelChange(value: string): void {
    this.searchValue.value = value;
  }
  onSearch(value: string): void {
    if (this.searchValue.value) {
      this.onSearchValue(this.searchValue.value, 1, 20);
    }
  }
  public onSearchValue(value: string, page: any, size: any) {
    const params = {
      page,
      size,
      sortBy: this.sortKey,
      sort: this.sortType,
      filterClassName: value
    };
    this.isLoading = true;
    let url: string;
    if (this.offlineHeapdump) {
      url = `/heap/${this.offlineHeapdumpId}/query/histogram`;
    } else {
      const encodeGuardianId = encodeURIComponent(this.guardianId);
      const encodeJvmId = encodeURIComponent(this.jvmId);
      const encodeRecordId = encodeURIComponent(this.recordId);
      url = `/guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps/${encodeRecordId}/histogram`;
    }
    this.Axios.axios.post(url, params, { headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      this.totalNumber = res.totalElements;
      this.srcData.data = res.members;
      this.showNodate = false;
      if (!this.snapShot) {
        sessionStorage.removeItem('dumpState');
      }
    }).catch(() => {
      this.isLoading = false;
    });
  }
  // 保存快照调用接口
  public preserveSnapShot(type: any) {
    if (this.isDownload) { return; }
    const snapCounts = 5;
    if (this.snapCount < snapCounts) {
      const tableTop1 = this.srcData.data;
      const tableTree = this.srcDataTree.data;
      const nowTime = this.libService.getSnapTime();
      const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
        JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData) || {};
      if (!snapShot[type]) {
        snapShot[type] = {
          label: this.i18n.protalserver_profiling_tab.memoryDump,
          type,
          children: [],
        };
      }
      snapShot[type].children.push({
        label: nowTime,
        snapShotId: this.recordId,
        type,
        value: {
          file: [],
          treeFile: [],
          snapCount: this.snapCount + 1,
          totalNumber: this.totalNumber,
          size: this.pageSize.size,
          currentTotal: this.currentTotal,
          totalNumberT: this.totalNumberT,
        }
      });
      const isOverSize = this.handleIsOverSize(JSON.stringify(snapShot));
      if (!isOverSize) { return; }
      this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
      this.downloadService.downloadItems.snapShot.data = snapShot;
      this.downloadService.downloadItems.heapDump.snapCount = this.snapCount + 1;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.do_snapshot_success,
        time: 3500
      });
    } else {
      this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.memorydump_snapshot_analysis_alert,
        time: 3500
      });
    }
    this.handleSnapShotCount(type);
  }
  public importSnapData(snapShotData: any, currentPage: any) {
    if (this.downloadService.downloadItems.heapDump.chartType.length > 0) {
      this.chartType = this.downloadService.downloadItems.heapDump.chartType;
    } else {
      this.chartType = 'histogram';
    }
    if (this.chartType === 'histogram') {
      this.typeSelected = this.typeOptions[0];
    } else if (this.chartType === 'dominantTree') {
      this.typeSelected = this.typeOptions[1];
    }
    this.srcData.data = [];
    this.srcDataTree.data = [];
    this.currentTotal = 0;
    this.currentNode.id = -1;
    this.totalNumber = snapShotData.totalNumber;
    this.pageSize.size = snapShotData.size;
    this.currentPage = currentPage;
    this.totalNumberT = 0;
    this.getHistogram(currentPage, this.pageSize.size, 1);
    this.getDomtree(0);
  }
  public handleSnapShotCount(type: any) {
    this.snapCount = this.downloadService.downloadItems.heapDump.snapCount;
  }
  public handleIsOverSize(data: any) {
    const newDataSize = data.length;
    const obj = window.sessionStorage;
    const sessionSize = 5120 * 1024;
    let size = 0;
    if (obj != null) {
      for (const item of Object.keys(obj)) {
        if (Object.prototype.hasOwnProperty.call(obj, item)) {
          size += obj.getItem(item).length;
        }
      }
    }
    if (newDataSize + size > sessionSize) {
      this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.snapshot_analysis_overSize,
        time: 3500
      });
      return false;
    }
    return true;
  }
  public toStringClass(num: any) {
    return num.toString();
  }
  // 从GC Roots到对象的最短共同路径
  public histogramOnMore(row?: any, idx?: any, event?: any) {
    const per = event.y / window.innerHeight;
    if (!this.snapShot) {
      if (per > .85) {
        this.hisSpans = false;
      } else {
        this.hisSpans = true;
      }
    } else {
      if (per > 0.8) {
        this.hisSpans = false;
      } else {
        this.hisSpans = true;
      }
    }
    this.treeHover = '';
    if (this.showHistogramMore === row.classId) {
      this.showHistogramMore = '';
    } else {
      this.histogramShowRow = row;
      this.showHistogramMore = row.classId;
    }
  }
  public mouseleaveHistogramMore() {
    this.showHistogramMore = '';
  }
  public onHoverList(label?: any) {
    this.treeHover = label;
  }
  public allObject() {
    this.showHistogramMore = '';
    this.chartType = 'histogramAllObject';
  }
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
  public shortCommonRouteClose() {
    this.shortCommonRouteModal.close();
    this.isOpen = false;
  }
  public getShortCommonRouteHeapWalker() {
    this.chartType = 'shortCommonRoute';
    this.showHistogramMore = '';
  }
  public goHistogram() {
    this.chartType = 'histogram';
  }
  public goDominantTree() {
    this.chartType = 'dominantTree';
  }
  public goHistogramChild(childData: any) {
    this.chartType = childData;
  }

  // 支配树
  public treeOnHoverMore(row?: any, idx?: any, event?: any) {
    const per = event.y / window.innerHeight;
    if (!this.snapShot) {
      if (per > 0.9) {
        this.treeSpans = false;
      } else {
        this.treeSpans = true;
      }
    } else {
      if (per > 0.85) {
        this.treeSpans = false;
      } else {
        this.treeSpans = true;
      }
    }
    this.treeHover = '';
    if (this.treeOnHoverMoreIdx === row.id) {
      this.treeOnHoverMoreIdx = '';
    } else {
      this.objectWithGcRootsRouteObj = row;
      this.treeOnHoverMoreIdx = row.id;
    }
  }
  public mouseleaveTreeOnHoverMore() {
    this.treeOnHoverMoreIdx = '';
  }
  public getObjectWithGcRootsRouteClose() {
    this.chartType = 'objectWithGcRootsRoute';
    this.treeOnHoverMoreIdx = '';
  }
  public objectWithGcRootsRouteClose() {
    this.shortCommonRouteModal.close();
    this.isOpenTree = false;
    this.objectWithGcRootsRouteVal = 'null';
  }
  public bytesToSize(bytes: any) {
    if (bytes === 0) { return '0 B'; }
    const k = 1024;
    const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }
  /**
   * 搜索
   * @param value value
   */
  searchClear(value: string): void {
    this.searchWords[0] = '';
    this.pageSize.size = 20;
    this.currentPage = 1;
    this.getHistogram(1, 20);
  }
  /**
   * 打开保存报告弹框
   */
  public openSaveReport() {
    const currentSelectJvm = this.downloadService.downloadItems.profileInfo.jvmName.split('/');
    this.reportName = currentSelectJvm[currentSelectJvm.length - 1];
    this.reportRemarks = '';
    if (this.downloadService.downloadItems.heapDump.saveReported &&
      this.downloadService.downloadItems.heapDump.newRecordId === this.recordId) {
      this.onSaveHeapDumpReport();
    } else {
      this.saveHeapDump.open();
    }
    TiValidators.check(this.saveReportForm);
  }
  /**
   * 关闭报告提示
   */
  public closeReport() {
    this.sugReport = false;
  }
  /**
   * 保存内存转储
   */
  public onSaveHeapDumpReport() {
    const params = {
      alias: this.reportName,
      comments: this.reportRemarks,
    };
    this.isLoading = true;
    const encodeGuardianId = encodeURIComponent(this.guardianId);
    const encodeJvmId = encodeURIComponent(this.jvmId);
    const encodeRecordId = encodeURIComponent(this.recordId);
    this.Axios.axios.post(`/guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps/${encodeRecordId}/save`,
      params).then((res: any) => {
        this.saveHeapDump.close();
        this.isLoading = false;
        this.saveReport = true;
        this.downloadService.downloadItems.heapDump.saveReported = true;
        let tempTimer = setTimeout(() => {
          this.saveReport = false;
          clearTimeout(tempTimer);
          tempTimer = null;
        }, 5000);
      }).catch(() => {
        this.saveHeapDump.close();
        this.isLoading = false;
      });
  }
  /**
   * 取消内存转储
   */
  public onCloseHeapDumpReport() {
    this.saveHeapDump.close();
  }
  public goHomeHeapDump() {
    sessionStorage.setItem('heapdumpReportTitle', this.reportName);
    sessionStorage.setItem('heapdumpId', this.recordId);
    sessionStorage.setItem('reportType', 'heapdump');
    this.router.navigate(['heapdump', this.recordId]);
  }
}
