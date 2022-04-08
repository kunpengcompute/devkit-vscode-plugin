import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../../../../service';

type NodeValue = { value?: string , iosched: any};
type Lang = 'zh-cn' | 'en-us';

@Component({
  selector: 'app-node-info-item',
  templateUrl: './node-info-item.component.html',
  styleUrls: ['./node-info-item.component.scss']
})
export class NodeInfoItemComponent implements OnInit {
  @ViewChild('viewDetailMask', { static: false }) viewDetailMask: any;
  @Input() label: string;
  @Input() allData: string;
  clickValue: string;
  normalValue: string;
  i18n: any;
  title: string;
  numData: any;
  valueData: { range: string; value: any; }[];
  showClick = false;
  constructor(
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @Input()
  set value(val: NodeValue) {
    if (val.iosched) {
      this.numData = val.iosched;
      if (Object.keys(this.numData.value).length > 0) {
        this.showClick = true;
        this.handleData(this.numData);
      } else {
        this.showClick = false;
      }
    }
    this.textInfo = val.value;
    this.moreInfo = val;
    const type = typeof(this.textInfo);
    if (type === 'string') {
      const index = this.textInfo.indexOf('\[');
      const lastindex = this.textInfo.lastIndexOf('\]');
      this.clickValue = this.textInfo.substring(index, lastindex + 1);
      this.normalValue = this.textInfo.substring(lastindex + 1, this.textInfo.length);
      this.title = this.i18n.pcieDetailsinfo.scheduling_algorithm + this.textInfo.substring(index + 1, lastindex);
    }
    this.suggestionMsg = this.lang === 'zh-cn'
      ? this.moreInfo?.suggestion?.ch
      : this.moreInfo?.suggestion?.en;
    this.isSuggestion = !(this.moreInfo?.suggestion_flag ?? true);

    this.annotationMsg = this.lang === 'zh-cn'
      ? this.moreInfo?.annotation?.ch
      : this.moreInfo?.annotation?.en;
    this.isAnnotation = Boolean(this.annotationMsg);
  }
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns>;
  lang = sessionStorage.getItem('language') as Lang;
  textInfo: string;
  moreInfo: any;

  isSuggestion = false;
  suggestionMsg: string;

  isAnnotation = false;
  annotationMsg: string;
  ngOnInit(): void {
    this.columns = [
      {
          title: this.i18n.pcieDetailsinfo.detail_item,
          width: '50%'
      },
      {
          title: this.i18n.pcieDetailsinfo.value,
          width: '50%'
      },
  ];
    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
        data: this.valueData, // 源数据
        state: {
            searched: false, // 源数据未进行搜索处理
            sorted: false, // 源数据未进行排序处理
            paginated: false // 源数据未进行分页处理
        }
    };
}
  public viewMoreDetail() {
    this.viewDetailMask.Open();
  }

public trackByFn(index: number, item: any): number {
    return item.id;
}
  /**
   * 处理io数据
   */
 public handleData(data: any) {
    const valueData = [];
    for (const key  of Object.keys(data.value)) {
      let range;
      let value;
      range = key;
      value = data.value[key];
      const allData = {
        range,
        value,
      };
      valueData.push(allData);
    }
    this.valueData = valueData;
  }
}
