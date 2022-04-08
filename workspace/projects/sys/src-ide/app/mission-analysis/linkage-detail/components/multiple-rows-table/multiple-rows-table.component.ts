import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {TiTableRowData, TiTableSrcData} from '@cloud/tiny3';
import { TableService } from 'projects/sys/src-ide/app/service/table.service';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';

@Component({
  selector: 'app-multiple-rows-table',
  templateUrl: './multiple-rows-table.component.html',
  styleUrls: ['./multiple-rows-table.component.scss']
})
export class MultipleRowsTableComponent implements OnInit, OnDestroy {
  @Input()
  set dataList(val) {
    this.srcData.data = [...val];
    if (this.originData.length === 0){
      this.originData = [...val];
    }
  }
  get dataList() {
    return [...this.srcData.data];
  }
  @Input() columns: any[] = [];
  constructor(
    public i18nService: I18nService,
    public tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();
    this.srcData = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    };
  }
  public i18n: any;
  public displayed: Array<TiTableRowData> = [];
  public pageSize: {
    options: [10, 20, 50, 100],
    size: 10
  };
  public srcData: TiTableSrcData;
  public currentPage = 1;
  public isSearch = false;
  public originData: TiTableRowData[] = [];
  public value = '';

  /**
   * selected 和搜索框共同作用于结果
   * @param e 筛选项
   * @params clear 清空搜索框
   */
   public onSelect(e: any, clear?: any) {
    if (e.label === this.i18n.linkage.allParams) {
      this.comSearch(this.value, this.originData);
    } else {
      if (clear) {
        this.srcData.data = this.originData.filter((val: { different: any; }) => {
          return val.different;
        });
      } else {
        this.srcData.data = this.srcData.data.filter(val => {
          return val.different;
        });
      }

    }

  }
  public trackByFn(index: number, item: any): number {
    return item.parameters;
  }
  /**
   * 搜索
   * @param event 输入字符串
   * @param data 数据来源
   */
  public comSearch(event: any, data?: any) {
    const keyword = event === undefined ? '' : event.toString().trim();
    const str = encodeURIComponent(keyword);
    if (str === '' && !data) {
      this.onSelect(this.columns[0].selected, true);
      return;
    }
    if (!data) { data = this.srcData.data; }
    this.srcData.data = data.filter((val: any) => {
      return val.parameters.includes(str);
    });
  }

  /**
   * 清空搜索框
   */
  public onClear(): void {
    this.value = '';
    this.onSelect(this.columns[0].selected, true);
  }
  ngOnInit() {
    document.addEventListener('click', (event) => {
      const searchBox = document.querySelector('.multiple-search-box');
      if (searchBox && (searchBox === event.target || searchBox.contains(event.target as Node))){
      } else if (this.isSearch){
        this.isSearch = false;
      }
    }, true);
  }
  private close(){
    this.isSearch = false;
  }
  ngOnDestroy() {
    document.removeEventListener('click', this.close, true);
  }
}
