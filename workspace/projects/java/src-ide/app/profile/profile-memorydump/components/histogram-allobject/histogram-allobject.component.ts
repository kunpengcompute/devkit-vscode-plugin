import { Component, OnInit, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent, TiTableDataState } from '@cloud/tiny3';
import { VscodeService } from '../../../../service/vscode.service';
@Component({
    selector: 'app-histogram-allobject',
    templateUrl: './histogram-allobject.component.html',
    styleUrls: ['./histogram-allobject.component.scss']
})
export class HistogramAllobjectComponent implements OnInit {
    @Input() recordId: any;
    @Input() snapShot: boolean;
    @Input() startBtnDisabled: any;
    @Input() isDownload: any;
    @Input() rowData: any;
    @Input() appType: any;
    // 是否为已保存的离线报告
    @Input() offlineHeapdump: boolean;
    @Input() offlineHeapdumpId: string;
    constructor(
        public i18nService: I18nService,
        private vscodeService: VscodeService,
        public changeDetectorRef: ChangeDetectorRef,
        public zone: NgZone,
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
    public shallowHeapSort: any[] = [];
    public retainedHeapSort: any[] = [];

    /**
     * 初始化
     */
    ngOnInit() {
        if (this.appType === 'snapshot') {
            this.objectClassName = this.rowData.className;
        } else {
            this.objectClassId = this.rowData.classId;
        }
        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        this.shallowHeapSort = JSON.parse(JSON.stringify(this.sortList));
        this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
        this.columns = [
            {
                title: this.i18n.protalserver_profiling_memoryDump.class,
                width: '50%',
                isSort: false,
                sortKey: ''
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.sHeap,
                width: '25%',
                isSort: true,
                sortKey: 'shallowHeap',
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.rHeap,
                width: '25%',
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
        this.getHistogram(1, this.pageSize.size);
        this.updateWebViewPage();
    }
    /**
     * 直方图分页
     * @param tiTable tiTable
     */
    public stateUpdate(tiTable: TiTableComponent): void {
        if (this.srcData.data.length === 0) { return; }
        const dataState: TiTableDataState = tiTable.getDataState();
        this.getHistogram(dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
    }
    /**
     * 获取直方图数据
     * @param page page
     * @param size size
     */
    public getHistogram(page: any, size: any) {
        if (this.appType === 'snapshot') {
            this.showLoding();
            const params = {
                page,
                size,
                sortBy: this.sortKey,
                sort: this.sortType,
                className: this.objectClassName,
            };
            const url = `/guardians/${this.guardianId}/heaps/${this.recordId}/classes`;
            this.vscodeService.post({ url, params }, (res: any) => {
                this.totalNumber = res.totalElements;
                this.srcData.data = res.members;
                this.closeLoding();
            });
        } else {
            this.showLoding();
            const params = {
                page,
                size,
                sortBy: this.sortKey,
                sort: this.sortType
            };
            let url = `/guardians/${this.guardianId}/heaps/${this.recordId}/classes/${this.objectClassId}`;
            if (this.offlineHeapdump) {
                url = `/heap/${this.offlineHeapdumpId}/classes/${this.objectClassId}/query/objects`;
            }
            this.vscodeService.post({ url, params }, (res: any) => {
                this.totalNumber = res.totalElements;
                this.srcData.data = res.members;
                this.closeLoding();
            });
        }
        this.updateWebViewPage();
    }
    /**
     * showLoding
     */
    public showLoding() {
        document.getElementById('sample-loading-box').style.display = 'flex';
        this.updateWebViewPage();
    }
    /**
     * closeLoding
     */
    public closeLoding() {
        document.getElementById('sample-loading-box').style.display = 'none';
        this.updateWebViewPage();
    }
    /**
     *  直方图排序
     * @param idx idx
     * @param sortKey sortKey
     */
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
            this.shallowHeapSort.forEach((item) => {
                item.show = false;
            });
            this.shallowHeapSort[idx].show = true;
        }
        if (sortKey === 'retainedHeap') {
            this.retainedHeapSort.forEach((item) => {
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
    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
