import { Component, OnInit, Input, Output, AfterContentInit, ElementRef, EventEmitter } from '@angular/core';
import { TiTreeNode, TiTableRowData, TiTableColumns, TiTableSrcData } from '@cloud/tiny3';
import { fromEvent } from 'rxjs';
import { CommonI18nService } from 'java/src-com/app/service/common-i18n.service';
import { LibService } from 'java/src-com/app/service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-hotword-table',
    templateUrl: './hotWord-table.component.html',
    styleUrls: ['./hotWord-table.component.scss']
})
export class HotWordTableComponent implements OnInit, AfterContentInit {

    constructor(
        private el: ElementRef,
        public i18nService: CommonI18nService,
        public libService: LibService,
        public sanitizer: DomSanitizer
    ) {
        this.i18n = this.i18nService.I18n();
    }

    @Input() srcData: TiTableSrcData;
    @Input() columns: Array<TiTableColumns> = [
        {
            title: 'hot_statement',
            width: '30%',
            sortKey: 'label'
        },
        {
            title: 'total_time',
            width: '30%',
            sortKey: 'duration'
        },
        {
            title: 'aver_time',
            width: '20%',
            sortKey: 'aver'
        },
        {
            title: 'exec_time',
            width: '20%',
            sortKey: 'count'
        }
    ];
    @Input() isSnapshotCompare = false;
    @Output() sendExpandData = new EventEmitter<any>();
    @Output() sendExpandFlag = new EventEmitter<any>();
    @Output() sendTableSort = new EventEmitter<any>();
    public i18n: any;
    private expandNodes: any = {};
    public displayed: Array<TiTableRowData> = [];
    public noDadaInfo: string;

    public strackTraceMap = {};
    public isNodata = true;
    public showLoading = false;
    public isExpandAll = false;
    // 栈
    public stackTranceData: Array<TiTreeNode> = [];

    public expandFlag = false;

    public durationTotal = 0;
    public insCountWidth = 0;
    public insCountTotal = 0;
    public columnsWidth2 = 0;
    public rowId: string;
    private tableContainer: any;

    /**
     * 初始化
     */
    ngOnInit() {
        this.noDadaInfo = this.i18n.common_term_task_nodata;
    }

    /**
     * ngAfterContentInit
     */
    ngAfterContentInit(): void {
        setTimeout(() => {
            if (this.srcData.data.length) {
                this.insCountTotal = this.el.nativeElement.querySelector(
                    '.insCount'
                ).offsetWidth * 0.8;
                this.columnsWidth2 = $('.totalDurtionTh').width();
                this.tableContainer = this.el.nativeElement.querySelector('#mongodb-sql-table .ti3-table-container');
            } else {
                this.insCountTotal = 300;
            }
        }, 0);
        fromEvent(window, 'resize').subscribe(() => {
            if (this.srcData.data.length) {
                this.insCountTotal = this.el.nativeElement.querySelector(
                    '.insCount'
                ).offsetWidth * 0.6;
                this.columnsWidth2 = $('.totalDurtionTh').width();
            }
        });
    }

    /**
     * getScrollTop
     * @param event event
     */
    public getScrollTop(event: Event) {
        const el = event.target as HTMLTableElement;
    }


    /**
     * expandTable
     */
    public expandTable() {
        this.expandFlag = !this.expandFlag;
        setTimeout(() => {
            if (!this.tableContainer) {
                this.tableContainer =
                this.el.nativeElement.querySelector('.hotWord-table-content .ti3-table-container');
            }
            this.tableContainer.style.maxHeight = this.expandFlag ? '450px' : '320px';
            this.tableContainer.style.height = this.expandFlag ? '450px' : 'auto';
            // 热点语句height展开与收缩事件
            this.sendExpandFlag.emit(this.expandFlag);
        }, 50);
    }


    /**
     * 逐层展开和折叠
     * @param node node
     */
    public toggle(node: any): void {
        node.expand = !node.expand;
        if (!this.expandNodes[node.id]) { this.expandNodes[node.id] = {}; }
        this.toggleChildren(this.srcData.data, node.id, node.expand);
        this.expandNodes[node.id].expand = node.expand;
        this.expandNodes[node.id].isShow = node.isShow;
        this.sendExpandData.emit(this.expandNodes);
        if (!this.expandNodes[node.id].isShow) { delete this.expandNodes[node.id]; }
    }

    private toggleChildren(data: Array<any>, pId: any, pExpand: boolean): void {
        for (const node of data) {
            if (node.pId === pId) {
                node.isShow = pExpand; // 处理当前子节点
                if (!pExpand) {// 折叠时递归处理当前节点的子节点
                    delete this.expandNodes[node.id];
                    this.toggleChildren(data, node.id, false);
                } else {  // 展开时递归处理当前节点的子节点
                    this.expandNodes[node.id] = this.expandNodes[node.id] || {};
                    this.expandNodes[node.id].isShow = true;
                    this.expandNodes[node.id].expand = false;
                    node.expand = false;
                }
            }
        }
    }

    /**
     * 展开整个树
     * @param node node
     */
    public expandAllNode(row: any) {
        if (row.expand) {
            return;
        }
        this.toggleAllChildren(this.srcData.data, row.id);
    }
    /**
     * 展开所有children
     * @param node node
     */
    private toggleAllChildren(data: Array<any>, pId: any): void {
        for (const node of data) {
            if (node.id.indexOf(pId) !== -1) {
                this.expandNodes[node.id] = this.expandNodes[node.id] || {};
                this.expandNodes[node.id].isShow = true;
                this.expandNodes[node.id].expand = true;
                node.isShow = true;
                node.expand = true;
                this.sendExpandData.emit(this.expandNodes);
            }
        }
    }


    /**
     * getLevelStyle
     * @param node node
     */
    public getLevelStyle(node: any): { 'padding-left': string } {
        return {
            'padding-left': `${node.level * 18 + 10}px`
        };
    }
    /**
     * 树表排序
     * @param i index
     */
    public onTableSort(i: any) {
        this.sendTableSort.emit(i);
    }
    public getImgSrc(state: string) {
        if (this.libService.hoverIcon === state) {
            if (state === 'expand-down-dark') {
                return this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/img/home/expand-down-dark-hover.svg`);
            } else if (state === 'expand-up-dark') {
                return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/home/expand-up-dark-hover.svg');
            } else if (state === 'expand-down-light') {
                return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/home/expand-down-light-hover.svg');
            } else {
                return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/home/expand-up-light-hover.svg');
            }
        } else {
            if (state === 'expand-down-dark') {
                return this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/img/home/expand-down-dark.svg`);
            } else if (state === 'expand-up-dark') {
                return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/home/expand-up-dark.svg');
            } else if (state === 'expand-down-light') {
                return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/home/expand-down-light.svg');
            } else {
                return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/home/expand-up-light.svg');
            }
        }
    }
}

