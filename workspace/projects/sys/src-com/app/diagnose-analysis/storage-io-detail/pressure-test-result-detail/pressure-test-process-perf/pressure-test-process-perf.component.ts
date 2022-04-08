import { Component, Input, OnInit } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-pressure-test-process-perf',
  template: `
    <app-common-table [commonTableData]="processPerfTable"></app-common-table>
  `
})
export class PressureTestProcessPerfComponent implements OnInit {

  @Input()
  set processPerfData(data: any[]) {
    if (data && data.length) {
      this.initTableData(data);
    }
  }

  processPerfTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };

  constructor() { }

  ngOnInit(): void {
    this.processPerfTable.columnsTree = [
      { label: '%user', key: 'user', tip: I18n.storage_io_detail.result_tab.user_tip },
      { label: '%system', key: 'system', tip: I18n.storage_io_detail.result_tab.sys_tip },
      { label: 'context switches', key: 'contextSwitches',
        tip: I18n.storage_io_detail.result_tab.context_switches_tip },
      { label: 'major page faults', key: 'majorPF', tip: I18n.storage_io_detail.result_tab.major_page_faults_tip },
      { label: 'minor page faults', key: 'minorPF', tip: I18n.storage_io_detail.result_tab.minor_page_faults_tip },
    ];
  }

  private initTableData(data: any[]) {
    this.processPerfTable.srcData.data = data.map(arr => {
      const [ user, system, contextSwitches, majorPF, minorPF ] = arr;
      return { user, system, contextSwitches, majorPF, minorPF };
    });
  }

}
