// 表头排序子组件
/**
 * 1、为什么使用这个？
 *  1.1、历史问题及tiny表格性能问题，有些表格是用原生表格写的
 *  1.2、tiny不支持树表排序
 *  1.3、ti-head-sort 必须位于th下一级，th又不方便改为flex布局，所以不方便布局
 * 2、注意点
 *  2.1、为了支持清除表格排序，请在生成表格数据时使用index表示原始排序顺序
 */
import { Component, OnInit  , Output, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'app-sub-module-table-sort',
  templateUrl: './sub-module-table-sort.component.html',
  styleUrls: ['./sub-module-table-sort.component.scss']
})
export class SubModuleTableSortComponent implements OnInit {
  @Input() sortStatus: 'asc' | 'desc' | ''; // 升序 | 降序 | 无
  @Output() sortTable = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  public setSort() {
    this.sortTable.emit(this.sortStatus === 'asc' ? 'desc' : this.sortStatus === 'desc' ? '' : 'asc');
  }
}
