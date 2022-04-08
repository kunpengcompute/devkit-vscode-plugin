import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { AxiosService } from '../../../../service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent, TiTableDataState } from '@cloud/tiny3';
import { LibService } from '../../../../service/lib.service';

@Component({
  selector: 'app-histogram-allobject',
  templateUrl: './histogram-allobject.component.html',
  styleUrls: ['./histogram-allobject.component.scss']
})
export class HistogramAllobjectComponent implements OnInit, OnDestroy {
  @Input() recordId: any;
  @Input() snapShot: boolean;
  @Input() startBtnDisabled: any;
  @Input() isDownload: any;
  @Input() rowData: any;
  @Input() appType: any;
  @Input() offlineHeapdump: boolean; // 是否是从离线报告，内存转储进入
  @Input() offlineHeapdumpId: string;
  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    public libService: LibService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  // 直方图显示更多下标
  public histogramShowMore: any;
  public i18n: any;
  public guardianId: any;
  public jvmId: any;
  public isStopMsgSub: any;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public noDadaInfo: string;
  public columns: Array<TiTableColumns> = [];
  public currentPage: any = 1;
  public totalNumber: any = 0;
  public showNodate = true;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 20
  };
  public sortKey: any = '';
  public sortType: any = '';
  public objectClassId: any;
  public objectClassName: any;

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
  public shallowHeapSort: any = [];
  public retainedHeapSort: any = [];
  public isLoading: any = false;

  ngOnInit() {
    if (this.appType === 'snapshot') {
      this.objectClassName = this.rowData.className;
    } else {
      this.objectClassId = this.rowData.classId;
    }
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.shallowHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.columns = [
      {
        title: this.i18n.protalserver_profiling_memoryDump.class,
        width: '50%',
        sortKey: ''
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.sHeap,
        width: '25%',
        sortKey: 'shallowHeap',
      },
      {
        title: this.i18n.protalserver_profiling_memoryDump.rHeap,
        width: '25%',
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
    this.getHistogram(1, this.pageSize.size);
  }
  ngOnDestroy(): void {
    this.isLoading = false;
  }
  // 直方图分页
  public stateUpdate(tiTable: TiTableComponent): void {
    if (this.srcData.data.length === 0) { return; }
    const dataState: TiTableDataState = tiTable.getDataState();
    this.getHistogram(dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
  }
  // 获取直方图数据
  public getHistogram(page: any, size: any) {
    if (this.appType === 'snapshot') {
      this.isLoading = true;
      const gId = encodeURIComponent(this.guardianId);
      const rId = encodeURIComponent(this.recordId);
      const params = {
        page,
        size,
        sortBy: this.sortKey,
        sort: this.sortType,
        className: this.objectClassName,
      };
      this.Axios.axios.post(`/guardians/${gId}/heaps/${rId}/classes`,
        params, { headers: { showLoading: false } }).then((res: any) => {
          this.totalNumber = res.totalElements;
          this.srcData.data = res.members;
          this.isLoading = false;
        }).catch(() => {
          this.isLoading = false;
        });
    } else {
      this.isLoading = true;
      const params = {
        page,
        size,
        sortBy: this.sortKey,
        sort: this.sortType
      };
      let url: string;
      const gId = encodeURIComponent(this.guardianId);
      const rId = encodeURIComponent(this.recordId);
      if (this.offlineHeapdump) {
        url = `/heap/${this.offlineHeapdumpId}/classes/${this.objectClassId}/query/objects`;
      } else {
        url = `/guardians/${gId}/heaps/${rId}/classes/${this.objectClassId}`;
      }
      this.Axios.axios.post(url, params, { headers: { showLoading: false } }).then((res: any) => {
        this.totalNumber = res.totalElements;
        this.srcData.data = res.members;
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
      });
    }
  }
  // 直方图排序
  public getHistogramSort(idx: any, sortKey: any) {
    if (this.srcData.data.length === 0) { return; }
    // normal
    this.shallowHeapSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
    if (idx > 1) {
      idx = 0;
    } else {
      idx++;
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
    this.getHistogram(1, 20);
  }

}
