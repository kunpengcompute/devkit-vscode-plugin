import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TiTableRowData, TiTipDirective } from '@cloud/tiny3';
import { TableService } from 'sys/src-com/app/service/index';
import { I18nService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-general-table',
  templateUrl: './general-table.component.html',
  styleUrls: ['./general-table.component.scss']
})

export class GeneralTableComponent implements OnInit, OnDestroy {
  @Output() trigger = new EventEmitter<any>();
  @Input() nodeid: string;
  @Input()
  set dataList(value: any) {
    if (Array.isArray(value)) {
      this.srcData.data = value;
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      this.srcData = value;
    }
    this.originData = JSON.parse(JSON.stringify(this.srcData.data));
    this.originDataBeforeFilter = JSON.parse(JSON.stringify(this.srcData.data));
  }
  @Input() hasPage: boolean;
  @Input() columns: Array<any>;
  constructor(
    public i18nService: I18nService,
    private tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public lang: any; // 语言,zh-cn: 中文, 'en-us': 英文
  public i18n: any;
  public displayed: Array<TiTableRowData> = [];

  pageNo = 0;
  total = (undefined as number);
  public pageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };

  public srcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: false,
      sorted: false,
      paginated: false
    },
  };
  private originData: any[];
  private originDataBeforeFilter: any[];
  public isIE = navigator.userAgent.indexOf('Trident') >= 0;
  public value = ''; // 搜索输入框内容
  public str: string;
  public searchKey: string;
  public popRef: TiTipDirective;
  private isSearch: boolean;
  ngOnInit() {
    document.addEventListener('click', (event) => {
      const searchBox = document.querySelector('.general-table-search');
      if (searchBox && (searchBox === event.target || searchBox.contains(event.target as Node))){
      } else if (this.isSearch){
        this.popRef?.hide();
      }
    }, true);
  }
  ngOnDestroy() {
    this.isSearch = false;
    document.removeEventListener('click', this.popRef?.hide, true);
  }
  /**
   * 搜索
   * @param event 输入字符串
   * @param data 数据来源
   */
  public comSearch(event: any) {
    const keyword = event === undefined ? '' : event.toString().trim();
    this.str = encodeURIComponent(keyword);
    this.syncOrginData();
    this.total = this.srcData.data.length;
    this.popRef.hide();
  }

  /**
   * 清空搜索框
   */
  public onClear(): void {
    this.value = '';
    this.str = '';
    this.syncOrginData();
    this.total = this.srcData.data.length;
    this.popRef.hide();
  }
  /**
   * 做完搜索需再次做筛选
   */
  private syncOrginData() {
    this.srcData.data = this.originData.filter((item, idx) => {
      return item[this.searchKey].includes(this.str);
    });
    this.originDataBeforeFilter = JSON.parse(JSON.stringify(this.srcData.data));
    const isSortedColumn = this.columns.find(column => column.sortStatus);
    if (isSortedColumn) {
      this.handleSort(isSortedColumn.sortStatus, isSortedColumn.sortKey);
    }
  }
  /**
   * 点击查看详情
   * @param key key
   * @param value value
   * @param bool i
   */
  public viewDetails(key: string, value: any, bool: boolean, item: any) {
    if (!bool) { return; }
    this.trigger.next({ key, value, row: item });
  }
  public searchClick(e: any, t: TiTipDirective, searchKey: string) {
    this.searchKey = searchKey;
    this.popRef = t;
    t.show();
    this.value = this.str;
    this.isSearch = true;
  }

  public handleSort(event: any, sortKey: string) {
    this.tableService.sortCommotableTable(this.srcData.data, this.columns, sortKey, event, this.originDataBeforeFilter);
  }
}
