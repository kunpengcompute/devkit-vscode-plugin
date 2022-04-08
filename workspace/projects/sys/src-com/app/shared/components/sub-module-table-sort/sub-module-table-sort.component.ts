import { Component, OnInit  , Output, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-sub-module-table-sort',
  templateUrl: './sub-module-table-sort.component.html',
  styleUrls: ['./sub-module-table-sort.component.scss']
})
export class SubModuleTableSortComponent implements OnInit, OnChanges {
  @Input() sortStatus: 'asc' | 'desc' | ''; // 升序 | 降序 | 无
  @Output() sortTable = new EventEmitter();

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sortStatus) {
      if (this.sortStatus === 'asc' || this.sortStatus === 'desc') {
        this.sortTable.emit(this.sortStatus);
      }
    }
  }

  ngOnInit() {}

  public setSort() {
    this.sortTable.emit(this.sortStatus === 'asc' ? 'desc' : this.sortStatus === 'desc' ? '' : 'asc');
  }
}
