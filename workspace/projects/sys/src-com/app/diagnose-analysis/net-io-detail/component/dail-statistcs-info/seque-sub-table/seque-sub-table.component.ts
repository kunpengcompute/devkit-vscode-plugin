import { Component, Input } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
  selector: 'app-seque-sub-table',
  template: `
  <ti-table [(displayedData)]="displayed" [srcData]="srcData">
    <table>
        <thead>
            <tr>
                <th tiOverflow *ngFor="let column of columns" width="{{column.width}}">
                  <ti-cell-text>{{column.title}}</ti-cell-text>
                  <ti-head-sort [sortKey]="column.sortKey"></ti-head-sort>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let row of displayed">
                <td tiOverflow *ngFor="let col of columns">{{row[col.prop]?.toString() || '--'}}</td>
            </tr>
        </tbody>
    </table>
  </ti-table>`,
  styleUrls: ['./seque-sub-table.component.scss']
})
export class SequeSubTableComponent {

  @Input() columns: {
    prop: string,
    title: string,
    width: string
  }[];

  @Input()
  set row(val: any) {
    if (val == null) { return; }
    this.srcData.data = val;
  }

  displayed: Array<TiTableRowData> = [];
  srcData: TiTableSrcData = {
    state: {
      searched: false,
      sorted: false,
      paginated: false
    },
    data: [],
  };

  constructor() { }
}
