import { Component, Input, OnInit } from '@angular/core';
import { TiActionmenuItem, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service';
import { TabSwitchService } from '../../service/tab-switch.service';

@Component({
  selector: 'app-mem-release-sub-table',
  templateUrl: './mem-release-sub-table.component.html',
  styleUrls: ['./mem-release-sub-table.component.scss']
})
export class MemReleaseSubTableComponent implements OnInit {

  @Input() data: TiTableRowData;

  public i18n: any;

  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
  };
  public displayed: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public dataToItemsFn: (data: any) => Array<TiActionmenuItem>;

  constructor(
    private i18nService: I18nService,
    private tabSwitchService: TabSwitchService<string>,
  ) {
    this.i18n = this.i18nService.I18n();

    this.dataToItemsFn = (data: any) => {
      const items: Array<TiActionmenuItem> = [{
          label: this.i18n.diagnostic.stack.nodeTipBtn,
          data
      }];
      return items;
    };

    this.columns = [
      {
        title: this.i18n.diagnostic.table.mallocFunc,
        width: '16%',
      },
      {
        title: this.i18n.common_term_task_tab_summary_module,
        width: '16%',
      },
      {
        title: this.i18n.diagnostic.table.mallocFile,
        width: '17%',
      },
      {
        title: this.i18n.diagnostic.table.mallocLine,
        width: '17%',
      },
      {
        title: this.i18n.diagnostic.consumption.sequence.malloc_count,
        width: '16%',
      },
      {
        title: this.i18n.common_term_operate,
        width: '16%',
      },
    ];
  }

  ngOnInit(): void {
    this.srcData.data.push(this.data);
  }

  onSelect(item: any): void {
    this.tabSwitchService.showSourceSlider.next(item.data);
  }

}
