import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TiTableSrcData, TiTableRowData, TiTableColumns } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { FuncLeakInfo } from '../../doman';
import { MemLeakSizeSort } from './mem-leak-table.sort';

@Component({
  selector: 'app-mem-leak-table',
  templateUrl: './mem-leak-table.component.html',
  styleUrls: ['./mem-leak-table.component.scss'],
})
export class MemLeakTableComponent implements OnInit, OnChanges {
  @Input() funcInfo: FuncLeakInfo;

  // 内存泄露的表格
  public memLeakSrcData: TiTableSrcData[] = [
    {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
  ];
  public memLeakDisplayed: Array<TiTableRowData> = [];
  public memLeakColumns: Array<TiTableColumns> = [];
  public memLeakTableSearchWord = '';
  public memLeakSearchWords = [''];
  public memLeakSearchKeys = ['stack'];
  /** 0:self 1:child */
  public memLeakTableDataType: 0 | 1 = 0;

  public memLeakTablePagination = {
    currentPage: 1,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10,
    },
    total: 0,
  };

  public i18n: any;

  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.initMemLeakTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.funcInfo) {
      this.memLeakSrcData[0].data = this.funcInfo?.self_leak || [];
      this.memLeakSrcData[1].data = this.funcInfo?.child_leak || [];
    }
  }

  private initMemLeakTable() {
    this.memLeakColumns = [
      {
        title: '',
        width: '40%',
      },
      {
        title: this.i18n.diagnostic.stack.memLeakTable.memLeakTimes,
        width: '30%',
        sortKey: 'count',
      },
      {
        title: this.i18n.diagnostic.stack.memLeakTable.memLeakSize,
        width: '30%',
        sortKey: 'size',
        compareFn: (a: any, b: any, predicate: string): number => {
          return MemLeakSizeSort.memLeakSizeCompareFn(a, b, predicate);
        },
      },
    ];
  }

  public handleMemLeakTableSearch(value: string) {
    this.memLeakSearchWords[0] = value;
  }

  public handleMemLeakTableSearchClear() {
    this.memLeakSearchWords[0] = '';
  }
}
