// 子模块-有个下拉框、表格可下转、点击跳转至汇编代码模块
import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, OnDestroy,
    NgZone, ChangeDetectorRef, SimpleChanges} from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from '../../../service/message.service';
import { AxiosService } from '../../../service/axios.service';
import { ignoreElements } from 'rxjs/operators';
import { I18nService } from '../../../service/i18n.service';
import { MytipService } from '../../../service/mytip.service';
import { Subscription } from 'rxjs';
import { StorageService } from 'projects/sys/src-ide/app/service/storage.service';

@Component({
    selector: 'app-sub-module-function',
    templateUrl: './sub-module-function.component.html',
    styleUrls: ['./sub-module-function.component.scss']
})
export class SubModuleFunctionComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;

    @Input() optionList: any;
    @Input() columns: any;
    @Input() theads: any;
    @Input() srcData: any;
    @Input() sortList: any;
    @Input() currentPage: any;
    @Input() totalNumber: any;
    @Input() pageSize: any;
    @Input() addPercentSignFields = [];

    @Output() selectChange = new EventEmitter();
    @Output() getChildren = new EventEmitter();
    @Output() getTableData = new EventEmitter();
    @Output() expandColumn = new EventEmitter();
    @Output() sortTableData = new EventEmitter();
    @Output() addFunctionTab = new EventEmitter();

    @ViewChild('table1', { static: true }) table1;
    @ViewChild('tbody', { static: true }) private tbodyRef: ElementRef;

    isFunctionTab = false;
    public i18n: any;

    public selectOption: any;

    public noDataInfo = '';
    public displayed: Array<TiTableRowData> = [];   // 表示表格实际呈现的数据（开发者默认设置为[]即可）

    // 详情展开
    closeOtherDetails = false;
    constructor(
        private messageService: MessageService,
        public Axios: AxiosService,
        public i18nService: I18nService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        public mytip: MytipService,
    ) {
        this.i18n = this.i18nService.I18n();

        this.noDataInfo = this.i18n.common_term_task_nodata;
    }

    /**
     * 初始化函数
     */
    ngOnInit(): void { }

    /**
     * 父组件调用 init【父组件的值都是调接口返回的，过早调用会报错】
     */
    public init({ closeOtherDetails }) {
        this.selectOption = this.optionList.find(item => item.checked) || this.optionList[0];
        this.doSelectOption(this.selectOption);
        this.closeOtherDetails = closeOtherDetails || false;
    }

    /**
     * 下拉框事件
     */
    public doSelectOption(e) {
        this.currentPage = 1;
        this.selectChange.emit({ option: e });
        this.updateWebViewPage();
    }

    /**
     * 获取子数据
     */
    public toggle(node) {
        this.getChildren.emit({ node });
        this.updateWebViewPage();
    }

    /**
     * 展开表格详情
     */
    public beforeToggle(row: TiTableRowData): void {
        this.getChildren.emit({ node: row });
        this.updateWebViewPage();
    }

    /**
     * 表格排序
     */
    public sortTable(prop, order) {
        this.sortTableData.emit({ prop, order });
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
