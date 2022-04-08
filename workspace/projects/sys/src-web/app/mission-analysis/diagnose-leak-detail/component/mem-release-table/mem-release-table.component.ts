import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TiTableSrcData, TiTableRowData, TiTableColumns } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service';
import { FuncReleaseInfo } from '../../doman';

@Component({
  selector: 'app-mem-release-table',
  templateUrl: './mem-release-table.component.html',
  styleUrls: ['./mem-release-table.component.scss']
})
export class MemReleaseTableComponent implements OnInit, OnChanges {

  @Input() funcInfo: FuncReleaseInfo;

  // 内存异常释放的表格
  public memReleaseSrcData: TiTableSrcData[] = [
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
    }
  ];
  public memReleaseDisplayed: Array<TiTableRowData> = [];
  public memReleaseColumns: Array<TiTableColumns> = [];
  public memReleaseTableSearchWord = '';
  public memReleaseSearchWords = [''];
  public memReleaseSearchKeys = ['stack'];
  /** 0:self 1:child */
  public memReleaseTableDataType: 0 | 1 = 0;
  public memReleaseTablePagination = {
    currentPage: 1,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10,
    },
    total: 0,
  };

  public i18n: any;

  constructor(
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.initMemReleaseTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.funcInfo) {
      const selfLeakData = this.funcInfo?.selfleak?.map((item) => {
        const operObj: any = {};
        item.oper.forEach((operItem, index) => {
          operObj['oper' + (index + 1)] = operItem;
        });
        return Object.assign(item, operObj);
      });
      const childLeakData = this.funcInfo?.childleak?.map((item) => {
        const operObj: any = {};
        item.oper.forEach((operItem, index) => {
          operObj['oper' + (index + 1)] = operItem;
        });
        return Object.assign(item, operObj);
      });
      this.memReleaseSrcData[0].data = selfLeakData || [];
      this.memReleaseSrcData[1].data = childLeakData || [];
    }
  }

  /**
   * 表格初始化
   */
  private initMemReleaseTable() {
    this.memReleaseColumns = [
      {
        title: '',
        width: '6%',
        show: undefined,
        key: ''
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead1,
        show: true,
        sortKey: 'oper1',
        key: 'oper1',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead2,
        show: true,
        sortKey: 'oper2',
        key: 'oper2',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead3,
        show: true,
        sortKey: 'oper3',
        key: 'oper3',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead4,
        show: true,
        sortKey: 'oper4',
        key: 'oper4',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead5,
        show: false,
        sortKey: 'oper5',
        key: 'oper5',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead6,
        show: false,
        sortKey: 'oper6',
        key: 'oper6',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead7,
        show: false,
        sortKey: 'oper7',
        key: 'oper7',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead8,
        show: false,
        sortKey: 'oper8',
        key: 'oper8',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead9,
        show: false,
        sortKey: 'oper9',
        key: 'oper9',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead10,
        show: false,
        sortKey: 'oper10',
        key: 'oper10',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead11,
        show: false,
        sortKey: 'oper11',
        key: 'oper11',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead12,
        show: false,
        sortKey: 'oper12',
        key: 'oper12',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead13,
        show: false,
        sortKey: 'oper13',
        key: 'oper13',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead14,
        show: false,
        sortKey: 'oper14',
        key: 'oper14',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead15,
        show: false,
        sortKey: 'oper15',
        key: 'oper15',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead16,
        show: false,
        sortKey: 'oper16',
        key: 'oper16',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead17,
        show: false,
        sortKey: 'oper17',
        key: 'oper17',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead18,
        show: false,
        sortKey: 'oper18',
        key: 'oper18',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead19,
        show: false,
        sortKey: 'oper19',
        key: 'oper19',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead20,
        show: false,
        sortKey: 'oper20',
        key: 'oper20',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead21,
        show: false,
        sortKey: 'oper21',
        key: 'oper21',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead22,
        show: false,
        sortKey: 'oper22',
        key: 'oper22',
        width: '4%',
      },
      {
        title: this.i18n.diagnostic.table.memReleaseHead23,
        show: false,
        sortKey: 'oper23',
        key: 'oper23',
        width: '4%',
      }
    ];
  }

  public handleMemReleaseTableSearch(value: string) {
    this.memReleaseSearchWords[0] = value;
  }

  public handleMemReleaseTableSearchClear() {
    this.memReleaseSearchWords[0] = '';
  }

}
