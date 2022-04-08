import { Component, OnInit, Output, Input, EventEmitter, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent, TiTableDataState } from '@cloud/tiny3';
import { LibService } from '../../../../service/lib.service';
import { VscodeService } from '../../../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-contrast-snapshot',
  templateUrl: './contrast-snapshot.component.html',
  styleUrls: ['./contrast-snapshot.component.scss']
})
export class ContrastSnapshotComponent implements OnInit, OnDestroy {
  @Input() currentHeapId: any;
  @Input() prevHeapId: any;
  @Input() currentHeapLabel: any;
  @Input() prevHeapLabel: any;
  @Input() goHistogramChild: any;
  @Output() private childOuter = new EventEmitter();
  @Output() private childTGSnapshotIN = new EventEmitter();
  constructor(
    public i18nService: I18nService,
    public libService: LibService,
    public vscodeService: VscodeService,
    public sanitizer: DomSanitizer,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('shortCommonRouteModal', { static: false }) shortCommonRouteModal: ElementRef;
  // 直方图
  public moerHover = '';
  public snapshotRowData: any; // 快照对比表中每列的数据
  public morePopType = '';
  public moreSnapshotId: any; // 选中的快照id
  public moreSnapshotNum: any; // 选中的快照num
  public moreSnapshotDate: any; // 选中的快照Date
  public chartType = '';
  public i18n: any;
  public jvmId: any;
  public isStopMsgSub: any;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public noDadaInfo: string;
  public columns: Array<TiTableColumns> = [];
  public currentPage: any = 1;
  public totalNumber: any = 0;
  public maxNumOfInstance: any = 0;
  public showNodate = true;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 20
  };
  public showSnapshotMore: any = '';
  public sortKey: any = '';
  public sortType: any = '';
  public objectClassId: any;
  public guardianId: any;
  public backHover: any;
  public allobjectBackHover: any;
  public ContrastHover: any;
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
    },
  ];
  public instanceNumSort: any[] = [];
  public retainedHeapSort: any[] = [];
  public currentNumOfInstanceSort: any[] = [];
  public currentRetainedHeapSort: any[] = [];
  public hisSpans = false;
  public hoverClose: any;
  public snapshotA: any;
  public snapshotB: any;
  public myLogs1: any = {
    needSoftRef: true,
    needWeakRef: true,
    needPhantomRef: true
  };
  public disabled = false;
  public selectAll = true;
  public panelWidth = '250px';
  public searchable = false; // 可切换测试
  public tipPosition = 'left'; // 10.0.3版本新增，默认提示文本方向为'top'
  public HeapNum: any = 0;
  public InstanceNum: any = 0;
  public snapShotAId: any;
  public snapShotBId: any;
  // 扩展项选项内容
  public histogramLogs: any = {
    needSoftRef: true,
    needWeakRef: false,
    needPhantomRef: false
  };
  //   扩展项选项
  public histogramOptions: Array<any> = [
    { label: 'soft Ref', englishname: 'soft Ref', val: 'needSoftRef' },
    { label: 'weak Ref', englishname: 'weak Ref', val: 'needWeakRef' },
    { label: 'phantom Ref ', englishname: 'phantom Ref', val: 'needPhantomRef' },
  ];

  /**
   * 初始化
   */
  ngOnInit() {
    this.chartType = 'contrastSnapshot';
    this.snapshotA = this.prevHeapLabel;
    this.snapshotB = this.currentHeapLabel;
    this.snapShotAId = this.prevHeapId;
    this.snapShotBId = this.currentHeapId;
    this.guardianId = (self as any).webviewSession.getItem('guardianId');
    this.instanceNumSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.currentNumOfInstanceSort = JSON.parse(JSON.stringify(this.sortList));
    this.currentRetainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.HeapNum = 1;
    this.InstanceNum = 1;
    this.columns = [
      {
        title: this.i18n.protalserver_profiling_memoryDump.class,   // 类名
        width: '20%',
        sortKey: '',
        type: '',
        show: undefined
      },
      {
        title: this.i18n.profileMemorydump.snapShot.instanceBSnapshot,   // b快照实例数
        width: '10%',
        sortKey: 'currentNumOfInstance',
        type: 'Instance',
        show: false
      },
      {
        title: this.i18n.profileMemorydump.snapShot.instance,   // 实例数
        width: '20%',
        sortKey: 'instanceNum',
        imgSrc: './assets/img/projects/desc.svg',
        type: 'Instance',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.retentionHeapBSnapshot,  // b快照保留堆
        width: '10%',
        sortKey: 'currentRetainedHeap',
        type: 'Heap',
        show: false
      },
      {
        title: this.i18n.profileMemorydump.snapShot.retentionHeap,   // 保留堆对比
        width: '19%',
        sortKey: 'retainedHeap',
        imgSrc: './assets/img/projects/desc.svg',
        type: 'Heap',
        show: true
      },
      {
        title: '',
        width: '1%',
        sortKey: 'retainedHeap',
        type: '',
        show: undefined,
        fixed: 'right'
      },
    ];
    this.srcData = {
      data: [], // 源数据
      state: {
        searched: false,
        sorted: false,
        paginated: true
      }
    };
    this.getContrastData(1, this.pageSize.size, this.snapShotBId, this.snapShotAId);
  }
  /**
   * 遍历查找两个日期快照的数据
   * @param snapShot 所有快照数据
   */
  public toggleSnapshot() {
    this.instanceNumSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.currentNumOfInstanceSort = JSON.parse(JSON.stringify(this.sortList));
    this.currentRetainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.sortKey = '';
    this.sortType = '';
    if (this.snapshotA === this.prevHeapLabel) {
      this.snapshotA = this.currentHeapLabel;
      this.snapshotB = this.prevHeapLabel;
      this.snapShotAId = this.currentHeapId;
      this.snapShotBId = this.prevHeapId;
      this.getContrastData(1, this.pageSize.size, this.snapShotBId, this.snapShotAId);
    } else if (this.snapshotA === this.currentHeapLabel) {
      this.snapshotA = this.prevHeapLabel;
      this.snapshotB = this.currentHeapLabel;
      this.snapShotAId = this.prevHeapId;
      this.snapShotBId = this.currentHeapId;
      this.getContrastData(1, this.pageSize.size, this.snapShotBId, this.snapShotAId);
    }
  }

  /**
   * 改变快照左侧树AB标签名
   */
  public toggleSnapshotIN() {
    const obj = {
      A: this.snapshotA,
      B: this.snapshotB
    };
    this.childTGSnapshotIN.emit(obj);
  }
  /**
   * 返回
   */
  public goHistogram() {
    this.childOuter.emit(false);
  }
  /**
   * 页面销毁时
   */
  ngOnDestroy(): void {
    this.showSnapshotMore = '';
  }
  /**
   * 获取类型
   * @param val 获取对比快照类型
   */
  public goContrastSnapshot(val: any) {
    this.chartType = val;
    this.allobjectBackHover = '';
  }
  /**
   * 直方图图标选择展示类型
   * @param row 展开行
   * @param idx 序号
   * @param event 对象
   */
  public snapshotMore(row?: any, idx?: any, event?: any) {
    const per = event.y / window.innerHeight;
    if (per > 0.82) {
      this.hisSpans = false;
    } else {
      this.hisSpans = true;
    }
    if (this.showSnapshotMore === idx) {
      this.showSnapshotMore = '';
    } else {
      this.snapshotRowData = row;
      this.moerHover = 'click';
      this.showSnapshotMore = idx;
    }
  }
  /**
   * 直方图表头更新
   * @param tiTable 表格
   */
  public stateUpdate(tiTable: TiTableComponent): void {
    this.showSnapshotMore = '';
    if (this.srcData.data.length === 0) { return; }
    const dataState: TiTableDataState = tiTable.getDataState();
    setTimeout(() => {
      this.getContrastData(dataState.pagination.currentPage, dataState.pagination.itemsPerPage,
         this.snapShotBId, this.snapShotAId);
    }, 100);
  }
  /**
   * 打开加载中
   */
  public showLoding() {
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  /**
   * 关闭加载中
   */
  public closeLoding() {
    document.getElementById('sample-loading-box').style.display = 'none';
  }
  /**
   * 获取表格数据
   * @param page 当前页
   * @param size 展开数
   * @param currentHeapId 当前快照id
   * @param prevHeapId 前一个快照id
   */
  public getContrastData(page: number, size: number, currentHeapId: any, prevHeapId: any) {
    this.toggleSnapshotIN();
    this.pageSize.size = size;
    this.currentPage = page;
    this.showLoding();
    const params = {
      page,
      size,
      sortBy: this.sortKey,
      sort: this.sortType
    };
    this.vscodeService.post({
      url: `/guardians/${this.guardianId}/heaps/${currentHeapId}/${prevHeapId}/compare/histogram`,
      params
    }, (res: any) => {
      this.totalNumber = res.totalElements;
      this.maxNumOfInstance = res.maxNumOfInstance;
      this.srcData.data = res.members;
      this.closeLoding();
    });
  }
  /**
   * 直方图排序
   * @param idx 序号
   * @param sortKey 列表头
   */
  public getContrastSort(idx: number, sortKey: any) {
    if (this.srcData.data.length === 0) { return; }
    // normal
    this.instanceNumSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.currentNumOfInstanceSort = JSON.parse(JSON.stringify(this.sortList));
    this.currentRetainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    if (idx > 1) {
      idx = 0;
    } else {
      idx++;
    }
    if (sortKey === 'instanceNum') {
      this.instanceNumSort.forEach((item) => {
        item.show = false;
      });
      this.instanceNumSort[idx].show = true;
    }
    if (sortKey === 'retainedHeap') {
      this.retainedHeapSort.forEach((item) => {
        item.show = false;
      });
      this.retainedHeapSort[idx].show = true;
    }
    if (sortKey === 'currentNumOfInstance') {
      this.currentNumOfInstanceSort.forEach((item) => {
        item.show = false;
      });
      this.currentNumOfInstanceSort[idx].show = true;
    }
    if (sortKey === 'currentRetainedHeap') {
      this.currentRetainedHeapSort.forEach((item) => {
        item.show = false;
      });
      this.currentRetainedHeapSort[idx].show = true;
    }
    this.sortType = this.sortList[idx].type;
    if (!this.sortType){
      this.sortKey = '';
    } else{
      this.sortKey = sortKey;
    }
    this.srcData.data = [];
    this.currentPage = 1;
    this.getContrastData(1, this.pageSize.size, this.snapShotBId, this.snapShotAId);
  }
  /**
   * 返回按钮
   * @param label hover时
   */
  public onContrastHoverList(label?: any) {
    this.ContrastHover = label;
  }
  // 从GC Roots到对象的最短共同路径

  /**
   * 所有对象h--鼠标hover左侧展开的选项上
   * @param val 多
   */
  public OnHoverMore(val: any) {
    this.morePopType = val;
  }
  /**
   * 选择展开那个快照
   * @param val 当前线程id
   * @param num 当前
   * @param date 当前数据
   */
  public choiceSnapshot(val: any, num: any, date: any) {
    this.showSnapshotMore = '';
    this.moreSnapshotId = val;
    this.moreSnapshotNum = num;
    this.moreSnapshotDate = date;
    if (this.morePopType === 'histogramAllObject') {
      this.chartType = 'histogramAllObject';
    } else if (this.morePopType === 'shortCommonRoute') {
      this.backHover = '';
      this.chartType = 'shortCommonRoute';
    }
  }
  /**
   * 鼠标悬浮时
   * @param label 标签名
   */
  public onHoverList(label?: any) {
    this.backHover = label;
  }
  /**
   * 支配树标签名
   * @param label 支配树标签名
   */
  public onHoverAllobject(label?: any) {
    this.allobjectBackHover = label;
  }
  /**
   * 选择扩展想
   */
  public selectHistogramOptions(i: any) {
    this.histogramLogs[this.histogramOptions[i].val] = !this.histogramLogs[this.histogramOptions[i].val];
    this.histogramLogs = { ...this.histogramLogs };
  }
}
