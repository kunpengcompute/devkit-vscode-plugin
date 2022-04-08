import { Component, EventEmitter, Input, OnInit, Output, ViewChildren } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TableContainerData } from '../../domain';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';

@Component({
  selector: 'app-table-container',
  templateUrl: './table-container.component.html',
  styleUrls: ['./table-container.component.scss']
})
export class TableContainerComponent implements OnInit {
  @Input() selectMode: 'checkbox' | 'none' = 'none';
  @Input() selectProp: string;
  @Input() showGotoLink = true;
  @Input() paginationType: 'default' | 'simple' | 'mini' = 'default';
  @Input()
  set tableData(data: TableContainerData) {
    if (data) {
      this.initData(data);
    }
  }
  @Output() viewDetailClick = new EventEmitter<any>();
  @Output() checkItemChange = new EventEmitter<any>();
  constructor() { }
  public checkedList: Array<TiTableRowData> = [];
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public tableTitle: string;
  public columns: Array<TiTableColumns>;
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
  public tableHeight = '410px';
  /** 搜索组件 */
  @ViewChildren('processSearchPop') processSearchPop: any;
  public searchWords: Array<any> = [];
  public searchKeys: Array<string> = []; // 设置搜索字段
  public searchWordsSave: { [key: string]: string } = {};
  public allFilterData: Array<TiTableRowData> = [];
  ngOnInit(): void { }
  public initData(data: any) {
    const value = JSON.parse(JSON.stringify(data));
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.columns = value?.columns;
    this.tableTitle = value?.title;
    this.allFilterData = JSON.parse(JSON.stringify(this.srcData.data));
    this.srcData.data = value?.srcData;
    this.totalNumber = this.srcData.data?.length;
    this.tableHeight = value.height ? value.height : '410px';
    this.initTableSearchKey();
    if (value.selectedData) {
      this.checkedList = value.selectedData;
    }
  }

  public clickCallBack(row: any, prop?: string, callBack?: boolean) {
    if (!callBack) { return; }
    const params: any = {
      prop,
      data: row,
    };
    this.viewDetailClick.emit(params);
  }
  public checkedsChange(e: any) {
    this.checkItemChange.emit(e);
  }
  public trackByFn(index: number): number {
    return index;
  }
  /**
   * 过滤
   */
  public onSelect(items: any, column: TiTableColumns): void {
    this.srcData.data = this.allFilterData.filter((rowData: TiTableRowData) => {
      for (const columnData of this.columns) {
        if (columnData.selected && columnData.selected.length) {
          const index: number = columnData.selected.findIndex((item: any) => {
            return item.label === rowData[columnData.key];
          });
          if (index < 0) {
            return false;
          }
        }
      }
      return true;
    });
  }
  /**
   * 初始化表格searchKeys
   */
  public initTableSearchKey() {
    this.searchKeys = [];
    this.searchWords = [];
    this.columns.forEach((column: any) => {
      if (column.searchKey) {
        if (this.searchKeys.indexOf(column.searchKey) === -1) {
          this.searchKeys.push(column.searchKey);
          this.searchWordsSave[column.searchKey] = '';
          this.searchWords.push(this.searchWordsSave[column.searchKey]);
        }
      }
    });
  }

  /**
   * 表头搜索
   */
  public onTableHeaderSearch(searchText: any, column: any) {
    const index = this.searchKeys.indexOf(column.searchKey);
    if (index > -1 && this.searchWords.length > index) {
      this.searchWordsSave[column.searchKey] = searchText ?? '';
      this.searchWords[index] = this.searchWordsSave[column.searchKey];
    }
    if (index > -1 && this.processSearchPop._results?.length > index) {
      const curSearchPop: PopDirective = this.processSearchPop._results[index];
      curSearchPop.hide();
    }
  }
}
