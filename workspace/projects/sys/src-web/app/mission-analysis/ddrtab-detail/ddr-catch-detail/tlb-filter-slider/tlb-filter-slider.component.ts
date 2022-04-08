import { Component, ComponentRef, EventEmitter, Input,
  OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiTableColumns,
  TiPageSizeConfig, TiTipDirective, TiTipRef } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service';
import { MissionModalComponent } from 'sys/src-web/app/shared/components/mission-modal/mission-modal.component';

@Component({
  selector: 'app-tlb-filter-slider',
  templateUrl: './tlb-filter-slider.component.html',
  styleUrls: ['./tlb-filter-slider.component.scss']
})
export class TlbFilterSliderComponent implements OnChanges {

  readonly MIN_CHEKCTED_CPU = 1;
  readonly MAX_CHEKCTED_CPU = 10;

  @ViewChild('missionModal') missionModal: MissionModalComponent;
  @ViewChild('searchPop') searchPop: TiTipDirective;

  @Input() data: any[];
  @Output() updataChart = new EventEmitter<string[]>();
  public i18n: any;
  public explorer: string;

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: [],
    state: {
        searched: false,
        sorted: false,
        paginated: false
    }
  };
  public columns: Array<TiTableColumns>;
  /** 表格上一次确认之后的状态 */
  public beforeStatus: {
    checkedList: string[];
    searchWord: string;
    typeSelected: string;
    currentPage: number;
  } = {
    checkedList: [],
    searchWord: '',
    typeSelected: 'L1D',
    currentPage: 1
  };
  public checkedList: string[] = [];
  public currentPage = 1;
  public totalNumber: number;
  public  pageSize: TiPageSizeConfig = {
    options: [ 10, 20, 40, 80],
    size: 10
  };
  public searchWord = '';
  public searchWords = [''];
  public searchKeys = ['core'];
  public typeList: Array<{ label: string }>;
  public typeSelected: { label: string };
  private searchPopInstance: ComponentRef<any>;

  constructor(
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.explorer = this.getExplorer();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue) {
      this.typeList = Array.from(new Set(this.data.map(item => item.type))).map(item => ({ label: item }));
      this.columns = [
        {
          title: this.i18n.ddr_summury.cpu,
          width: '25%',
          searchable: true,
        },
        {
          title: this.i18n.ddr_summury.type,
          filter: true,
          options: this.typeList,
          width: '25%',
        },
        {
          title: this.i18n.ddr_summury.landWidth,
          sortKey: 'bandwith',
          width: '25%',
        },
        {
          title: this.i18n.ddr_summury.getPerce,
          sortKey: 'hitrate',
          width: '25%',
          asc: true,
        }
      ];
      this.typeSelected = this.typeList.find(item => item.label === this.beforeStatus.typeSelected);
      this.filterTableDataWithType(this.typeSelected);
      this.totalNumber = this.srcData.data.length;
      setTimeout(() => {
        this.checkedList = this.displayed.slice(0, 5).map(item => item.core);
        this.beforeStatus.checkedList = JSON.parse(JSON.stringify(this.checkedList));
        this.updataChart.emit(this.checkedList);
      }, 0);
    }
  }

  private filterTableDataWithType(item: { label: string }) {
    this.srcData.data = this.data.filter((rowData: any) => rowData.type === item.label);
    this.totalNumber = this.srcData.data.length;
  }

  public onTypeSelect(item: { label: string }) {
    this.filterTableDataWithType(item);
    setTimeout(() => {
      this.checkedList = [this.displayed[0].core];
    }, 0);
  }

  public typeSelectAll(event: MouseEvent) {
    event.stopPropagation();
    let length = this.MAX_CHEKCTED_CPU - this.checkedList.length;
    for (const item of this.displayed) {
      if (length <= 0) { break; }
      if (!this.checkedList.includes(item.core)) {
        this.checkedList.push(item.core);
        length--;
      }
    }
  }

  public onCheckedChange(checked: string[]) {
    if (checked.length > this.MAX_CHEKCTED_CPU) {
      const outChecked = checked.splice(this.MAX_CHEKCTED_CPU, checked.length - this.MAX_CHEKCTED_CPU);
      for (const row of this.srcData.data) {
        const index = outChecked.findIndex(item => item === row.core);
        if (index > -1) {
          row.disabled = true;
          outChecked.splice(index, 1);
        }
      }
    } else if (checked.length === this.MAX_CHEKCTED_CPU) {
      this.srcData.data.forEach(row => {
        row.disabled = !checked.includes(row.core);
      });
    } else if (checked.length === this.MIN_CHEKCTED_CPU) {
      this.displayed.find(row => row.core === checked[0]).disabled = true;
    } else if (checked.length === 0) {
      this.checkedList = [this.displayed[0].core];
      this.displayed[0].disabled = true;
    } else {
      this.srcData.data.forEach(row => {
        row.disabled = false;
      });
    }
  }

  public open() {
    this.missionModal.open();
  }

  public ok() {
    this.beforeStatus.checkedList = JSON.parse(JSON.stringify(this.checkedList));
    this.beforeStatus.searchWord = this.searchWord;
    this.beforeStatus.typeSelected = this.typeSelected.label;
    this.beforeStatus.currentPage = this.currentPage;
    this.updataChart.emit(this.checkedList);
    this.missionModal.close();
  }

  public cancel() {
    this.missionModal.dismiss();
  }

  public beforeDismiss() {
    this.checkedList = JSON.parse(JSON.stringify(this.beforeStatus.checkedList));
    this.searchWord = this.beforeStatus.searchWord;
    this.searchWords[0] = this.beforeStatus.searchWord;
    this.typeSelected = this.typeList.find(item => item.label === this.beforeStatus.typeSelected);
    this.currentPage = this.beforeStatus.currentPage;
    this.filterTableDataWithType(this.typeSelected);
  }

  public getExplorer(): any {
    const explorer = window.navigator.userAgent;
    const ie11 = 'ActiveXObject' in window;

    if (explorer.indexOf('MSIE') >= 0 || ie11) {
      return 'ie';
    } else if (explorer.indexOf('Firefox') && !ie11) {
      return 'Firefox';
    } else if (explorer.indexOf('Chrome') && !ie11) {
      return 'Chrome';
    } else if (explorer.indexOf('Opera') && !ie11) {
      return 'Opera';
    } else if (explorer.indexOf('Safari') && !ie11) {
      return 'Safari';
    }
  }

  public showSearchPop() {
    if (this.searchPopInstance) {
      this.searchPop.hide();
      this.searchPopInstance.destroy();
      this.searchPopInstance = null;
    } else {
      this.searchPopInstance = this.searchPop.show();
      const searchPopDom = this.searchPopInstance.location.nativeElement as HTMLDivElement;
      searchPopDom.classList.add('search-pop');
    }
  }

  public onSearchBoxBlur() {
    this.searchPop.hide();
    this.searchPopInstance.destroy();
    this.searchPopInstance = null;
  }

  public onSearch(value: string) {
    this.searchWords[0] = value;
  }

}
