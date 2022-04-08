import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableSrcData } from '@cloud/tiny3';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LeftShowService } from 'sys/src-web/app/service/left-show.service';

type TableRowData = {
  scope: string;
  percent: string;
  percentWidth: number;
};

@Component({
  selector: 'app-distribution-table',
  templateUrl: './distribution-table.component.html',
  styleUrls: ['./distribution-table.component.scss']
})
export class DistributionTableComponent implements OnInit, AfterViewInit {

  @Input()
  set data(data: any[][]) {
    if (data && data.length) {
      this.initTableData(data);
    }
  }
  @Input() columns: Array<TiTableColumns>;

  displayed: Array<TableRowData> = [];
  srcData: TiTableSrcData = {
    data: ([] as Array<TableRowData>),
    state: {
      searched: false,
      sorted: false,
      paginated: false
    },
  };
  private barMaxWidth = 500;

  constructor(
    private el: ElementRef,
    private leftShowService: LeftShowService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const getPercentWidth = () => {
      this.barMaxWidth = this.el.nativeElement.querySelector('.percent_th').offsetWidth;
      this.srcData.data.forEach((row: TableRowData) => {
        row.percentWidth = parseFloat(row.percent) * this.barMaxWidth / 100;
      });
    };
    getPercentWidth();

    // 浏览器窗口大小变化
    fromEvent(window, 'resize')
      .pipe(debounceTime(500))  // 延时500ms，防抖
      .subscribe(() => {
        getPercentWidth();
      });

    // web左侧树折叠收缩
    this.leftShowService?.leftIfShow.subscribe(() => {
      setTimeout(() => {
        getPercentWidth();
      }, 1000);
    });
  }

  /**
   * 获取表格显示数据
   * @param data 原始数据
   */
  private initTableData(data: any[][]) {
    this.srcData.data = data.map(arr => {
      const [ scope, percent ] = arr;
      return { scope, percent, percentWidth: 0 };
    });
  }

  trackByFn(index: number, item: any): number {
    return item.id;
  }
}
