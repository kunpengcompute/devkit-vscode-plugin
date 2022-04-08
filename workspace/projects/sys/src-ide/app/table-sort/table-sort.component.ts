// sub-module-table-sort组件为解决此组件排序别的列时没有清除本列排序的改版【修改时请同步】
/*
  sub-module-table-sort组件为解决此组件:
  -1、与tiny组件风格不一致，tiny不能通过单独的点上下箭头选择升序降序
  -2、排序其他列时不会清除本列的排序显示
  修改时请同步
*/
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-table-sort',
    templateUrl: './table-sort.component.html',
    styleUrls: ['./table-sort.component.scss']
})
export class TableSortComponent implements OnInit {
    public sort = '';
    @Output() doSort = new EventEmitter();
    constructor() { }

    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 升序
     */
    public up() {
        this.sort = 'up';
        this.doSort.emit(this.sort);
    }

    /**
     * 降序
     */
    public down() {
        this.sort = 'down';
        this.doSort.emit(this.sort);
    }

}
