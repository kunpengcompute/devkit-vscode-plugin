import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
/**
 * 多语言
 */
export const enum LANGUAGE_TYPE {
  // ZH表示界面语言为中文
  ZH = 0,
  // EH表示界面语言为英文
  EN = 1,
}
@Component({
  selector: 'app-table-search-box',
  templateUrl: './table-search-box.component.html',
  styleUrls: ['./table-search-box.component.scss'],
})
export class TableSearchBoxComponent implements OnInit, AfterViewInit {
  @Input() searchOptions: any;
  // 指定过滤的列索引
  @Input() searchIndex: any;
  // 判断是否是web在使用组件
  @Input() web: any;
  // 判断是否是web在使用组件
  @Input() setWidth: any;
  @Output() public searchEvent = new EventEmitter<any>();
  @Output() public searchEventChange = new EventEmitter<any>();
  public i18n: any;
  public option: any;
  public value: any = null;
  public placeholder: any;
  constructor(public i18nService: CommonI18nService) {
    this.i18n = this.i18nService.I18n();
  }
  /**
   * 组件初始化
   */
  ngOnInit() {
    this.option = this.searchOptions[0];
    if (this.searchOptions.length > 1) {
      this.placeholder = this.i18n.searchBox.mutlInfo;
    } else {
      this.placeholder = this.i18nService.I18nReplace(this.i18n.searchBox.info, {
        0: this.option.label
      });
    }
    if (this.searchOptions[0].value === 'searchJavaProcess') {
      this.placeholder = this.i18n.common_term_java_process_search;
    }
    if (this.searchOptions[0]?.hints) {
      this.placeholder = this.searchOptions[0]?.hints;
    }
  }

  ngAfterViewInit() {
    if (this.setWidth) {
      $('.table-search-box').css('width', this.setWidth);
    }
  }
  /**
   * 清除
   */
  public propClear() {
    const obj = {
      key: this.option.value,
      value: ''
    };
    this.value = '';
    this.searchEvent.emit(obj);
  }
  /**
   * 查询
   */
  public propSearch() {
    const obj = {
      key: this.option.value,
      value: this.value
    };
    this.searchEvent.emit(obj);
  }
  /**
   * 查询
   */
  public onMoreThanOneWordSearch(value: string, index: number): void {
    if (value === '') {
      const obj = {
        key: this.option.value,
        value
      };
      this.value = '';
      this.searchEvent.emit(obj);
    } else {
      const obj = {
        value,
        index
      };
      this.searchEventChange.emit(obj);
    }
  }
}
