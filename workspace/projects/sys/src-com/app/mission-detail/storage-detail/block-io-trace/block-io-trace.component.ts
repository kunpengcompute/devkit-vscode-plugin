import { Component, Input, OnInit } from '@angular/core';
import { TiTableRowData, TiTableColumns, TiTreeNode } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';

const DYNAMIC_HEADER = 90; // 动态表头宽度
@Component({
  selector: 'app-block-io-trace',
  templateUrl: './block-io-trace.component.html',
  styleUrls: ['./block-io-trace.component.scss']
})
export class BlockIoTraceComponent implements OnInit {
  @Input() blockData: any;
  @Input() platform: string;
  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public displayedData: Array<TiTableRowData> = [];
  public srcData: any = { data: [] };
  public colTableColumns: Array<TiTableColumns> = [[], []];
  public traceTableColumns: Array<TiTableColumns> = [[], []];
  public traceHeadShow = false;
  public traceCheckedData: Array<any> = [];
  public devList: Array<any> = [];
  public innerData: Array<TiTreeNode> = [];
  public valueBack: Array<any> = [];
  // 分页
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public language: any;
  public thWidth: number;
  ngOnInit(): void {
    const lang = sessionStorage.getItem('language') || (self as any).webviewSession.getItem('language');
    this.language = lang.indexOf('en') >= 0 ? 'en' : 'zh';
    const tableHeaderData: any = this.blockData.header.other_statistic;
    const tableValueData: any = this.blockData.result;
    const traceHeaderData: any = this.blockData.header.latency_statistic.header;

    this.colTableColumns = this.getTableHeader(tableHeaderData, 'setInnerData');
    this.traceTableColumns = this.getTableHeader(traceHeaderData);

    // 统计表格数据
    Object.keys(tableValueData).forEach((dev: any) => {
      this.devList.push({
        label: dev
      });
      this.totalNumber += 1;
      const obj = this.flatten(tableValueData[dev].other_statistic);
      obj.name = dev;
      this.valueBack.push(obj);
    });
    this.innerData.unshift({
      label: 'DEV',
      checked: true,
      expanded: false,
      disabled: true
    });
    if (this.colTableColumns[1].length > 0) {
      this.thWidth = DYNAMIC_HEADER / this.colTableColumns[1].length;
    }
    this.colTableColumns[0].unshift({
      title: 'DEV',
      width: '80px',
      rowspan: 2,
      show: true,
      selected: this.devList,
      multiple: true,
      selectAll: true,
      key: '',
      options: this.devList
    });
    this.srcData.data = this.valueBack;
  }
  /**
   * 动态获取表格表头
   * @param headerData 后端接口的header原始数据
   * @param type 右侧表格筛选
   */
  private getTableHeader(headerData: any, type?: any) {
    const firstLevel: any = [];
    const secondLevel: any = [];
    Object.keys(headerData).forEach((theader: string) => {
      // 获取一级表头
      const target = headerData[theader];
      target.label = this.language === 'en' ? target.title?.en : target.title?.zh;
      target.annotation = this.language === 'en' ? target.annotation?.en : target.annotation?.zh;
      target.name = theader;
      target.checked = theader !== 'r_merge_info' && theader !== 'w_merge_info';
      target.expanded = true;
      // 默认不展示r_merge_info、w_merge_info
      if (theader !== 'r_merge_info' && theader !== 'w_merge_info') {
        firstLevel.push({
          title: this.language === 'en' ? target.title?.en : target.title?.zh,
          name: theader,
          annotation: this.language === 'en' ? target.annotation?.en : target.annotation?.zh,
          // 一级表头列合并
          colspan: target.children ? Object.keys(target.children).length : 1,
          // 一级表头行合并
          rowspan: target.children ? 1 : 2,
          show: true,
        });
      }
      const childrenData: any = [];
      if (target.children) {
        // 获取二级表头
        Object.keys(target.children).forEach((child: string) => {
          const targetChild = target.children[child];
          targetChild.label = this.language === 'en' ? targetChild.title?.en : targetChild.title?.zh;
          targetChild.annotation = this.language === 'en' ? targetChild.annotation?.en : targetChild.annotation?.zh;
          targetChild.name = child;
          targetChild.checked = theader !== 'r_merge_info' && theader !== 'w_merge_info';
          if (theader !== 'r_merge_info' && theader !== 'w_merge_info') {
            secondLevel.push({
              title: this.language === 'en' ? targetChild.title?.en : targetChild.title?.zh,
              name: child,
              annotation: this.language === 'en' ? targetChild.annotation?.en : targetChild.annotation?.zh,
              show: true,
              sortKey: type === 'setInnerData' ? (theader + '.' + child) : child,
            });
          }
          childrenData.push(targetChild);
        });
      }
      if (type === 'setInnerData') {
        target.children = childrenData;
        this.innerData.push(target);
      }
    });
    return [ firstLevel, secondLevel ];
  }
  // 表格筛选
  public selectFn(): void {
    const firstLevel: any = [];
    const secondLevel: any = [];
    this.innerData.forEach((inner: any) => {
      if (inner.checked && inner.children) {
        const result = this.handleData(inner.children, inner.name);
        secondLevel.push(...result.secondLevel);
        const selectedChild = result.selectedChild;
        firstLevel.push({
          title: inner.label,
          name: inner.name,
          annotation: inner.annotation,
          colspan: inner.children ? selectedChild : 1,
          rowspan: inner.children ? 1 : 2,
        });
      }
    });
    if (secondLevel.length > 0) {
      this.thWidth = DYNAMIC_HEADER / secondLevel.length;
    }
    firstLevel.unshift({
      title: 'DEV',
      width: firstLevel.length > 0 ? '80px' : '100%',
      rowspan: 2,
      show: true,
      selected: this.colTableColumns[0][0].selected,
      multiple: true,
      selectAll: true,
      key: '',
      options: this.devList
    });
    this.colTableColumns = [ firstLevel, secondLevel ];
  }
  private handleData(data: any, name: string) {
    let selectedChild = 0;
    const secondLevel: any = [];
    data.forEach((child: any) => {
      if (child.checked) {
        selectedChild += 1;
        secondLevel.push({
          title: child.label,
          name: child.name,
          annotation: child.annotation,
          show: true,
          sortKey: name + '.' + child.name
        });
      }
    });
    return { secondLevel, selectedChild };
  }
  // 表头过滤
  public onSelect(){
    const dev = this.colTableColumns[0][0];
    this.srcData.data = this.valueBack.filter((rowData: any) => {
      if (dev.selected?.length > 0) {
        const index: number = dev.selected.findIndex((item: any) => {
          return item.label === rowData.name;
        });
        return index >= 0;
      } else {
        return false;
      }
    });
    this.totalNumber = this.srcData.data.length;
  }
  /**
   * 扁平化对象
   * @param obj 原始数据
   */
  private flatten(obj: any) {
    const result: any = {};

    function recurse(src: any, prop: any) {
        const toString = Object.prototype.toString;
        if (toString.call(src) === '[object Object]') {
            let isEmpty = true;
            Object.keys(src).forEach((p: any) => {
              isEmpty = false;
              recurse(src[p], prop ? prop + '.' + p : p);
            });
            if (isEmpty && prop) {
                result[prop] = {};
            }
        } else if (toString.call(src) === '[object Array]') {
            const len = src.length;
            if (len > 0) {
                src.forEach((item: any, index: number) => {
                    recurse(item, prop ? prop + '.[' + index + ']' : index);
                });
            } else {
                result[prop] = [];
            }
        } else {
            result[prop] = src;
        }
    }
    recurse(obj, '');
    return result;
  }
  public closeFilter() {
    this.traceHeadShow = false;
  }
}
