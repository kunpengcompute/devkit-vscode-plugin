import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TiTableColumns } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { RespL3cData, RespTlbData, RespCpu } from '../doman';

@Component({
  selector: 'app-ddr-cache-table',
  templateUrl: './ddr-cache-table.component.html',
  styleUrls: ['./ddr-cache-table.component.scss']
})
export class DdrCacheTableComponent implements OnChanges {
  @Input() data: any;
  @Input() cpu: any;

  public i18n: any;
  public cpu1616 = RespCpu.CPU1616;
  public nodata = '';
  public tlbData = {
    data: ([] as Array<RespTlbData>),
    columns: ([] as Array<TiTableColumns>),
    displayed: ([] as Array<RespTlbData>),
    srcData: {
      data: ([] as Array<RespTlbData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
    pageNo: 0,
    total: (undefined as number),
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };
  public l3cData = {
    data: ([] as Array<RespL3cData>),
    columns: ([] as Array<TiTableColumns>),
    displayed: ([] as Array<RespL3cData>),
    srcData: {
      data: ([] as Array<RespL3cData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
    pageNo: 0,
    total: (undefined as number),
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };
  /** 只有lc3需要根据情况显示无数据文字 */
  public l3cNoDataText = '';
  public typeTextMapping: any;  // 表格中的类型列需要转换为文字显示
  public isLoading = true;

  constructor(
    private i18nService: I18nService,
    public tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();

    this.typeTextMapping = {
      L1D: this.i18n.ddr.select.L1D,
      L1I: this.i18n.ddr.select.L1I,
      L2D: this.i18n.ddr.select.L2D,
      L2I: this.i18n.ddr.select.L2I,
      L2_TLB: this.i18n.ddr.select.L2_TLB,
      L2D_TLB: this.i18n.ddr.select.L2D_TLB,
      L2I_TLB: this.i18n.ddr.select.L2I_TLB,

      L3C_RD_IN: this.i18n.ddr.select.L3C_RD_IN,
      L3C_WR_IN: this.i18n.ddr.select.L3C_WR_IN,
      L3C_RD_OUT: this.i18n.ddr.select.L3C_RD_OUT,
      L3C_WR_OUT: this.i18n.ddr.select.L3C_WR_OUT,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue) {
      this.dealData(this.data);
    }
  }

  private initTlbColumns(respTlbData: RespTlbData[]) {
    this.tlbData.columns = [
      {
        label: 'CPU',
        width: '25%',
        filterKey: 'core',
        options: Array.from(new Set(respTlbData.map(item => item.core))).map(item => ({
          label: item,
          value: item,
        })),
        multiple: true,
        selectAll: true,
        searchable: true,
      },
      {
        label: this.i18n.ddr_summury.type,
        width: '25%',
        filterKey: 'type',
        options: Array.from(new Set(respTlbData.map(item => item.type))).map(item => ({
          label: this.typeTextMapping[item],
          value: item,
        })),
        multiple: true,
        selectAll: true,
      },
      {
        label: this.i18n.ddr_summury.brandwidth,
        width: '25%',
        sortKey: 'bandwith',
      },
      {
        label: this.i18n.ddr_summury.hitrate,
        width: '25%',
        sortKey: 'hitrate',
        compareType: 'number',
      },
    ];
    this.tlbData.columns[0].selected = Array.from(this.tlbData.columns[0].options);
    this.tlbData.columns[1].selected = Array.from(this.tlbData.columns[1].options);
  }

  private initL3cColumns(respL3cData: RespL3cData[] = []) {
    this.l3cData.columns = [
      {
        label: 'NUMA NODE',
        width: '20%',
        filterKey: 'NUMA node',
        options: Array.from(new Set(respL3cData.map(item => item['NUMA node']))).map(item => ({
          label: item,
          value: item,
        })),
        multiple: true,
        selectAll: true,
      },
      {
        label: this.i18n.ddr_summury.type,
        width: '20%',
        filterKey: 'type',
        options: Array.from(new Set(respL3cData.map(item => item.type))).map(item => ({
          label: this.typeTextMapping[item],
          value: item,
        })),
        multiple: true,
        selectAll: true,
      },
      {
        label: this.i18n.ddr_summury.acc_hitBrandWidth,
        width: '20%',
        sortKey: 'hitbandwith',
      },
      {
        label: this.i18n.ddr_summury.acc_brandWidth,
        width: '20%',
        sortKey: 'bandwith',
      },
      {
        label: this.i18n.ddr_summury.acc_hit_rate,
        width: '20%',
        sortKey: 'hitrate',
      },
    ];
    this.l3cData.columns[0].selected = Array.from(this.l3cData.columns[0].options);
    this.l3cData.columns[1].selected = Array.from(this.l3cData.columns[1].options);
  }

  // 处理数据
  private dealData(data: any) {
    // 初始化nodata
    this.l3cNoDataText = this.i18n.common_term_task_nodata;

    this.initTlbColumns(data.l1c_l2c_tlb_count_sum);
    this.initL3cColumns(data.l3c_sum);

    this.tlbData.total = data.l1c_l2c_tlb_count_sum.length;
    this.tlbData.data = data.l1c_l2c_tlb_count_sum;
    this.tlbData.srcData.data = data.l1c_l2c_tlb_count_sum;

    this.l3cData.total = data.l3c_sum?.length;
    this.l3cData.data = data.l3c_sum;
    this.l3cData.srcData.data = data.l3c_sum;

    this.isLoading = false;
  }

  public onTlbSelect() {
    this.tlbData.srcData.data = this.tlbData.data.filter((rowData: RespTlbData) => {
      for (const column of this.tlbData.columns) {
        if (column.selected && column.selected.length) {
          const index: number = column.selected.findIndex((item: any) => {
            return item.value === rowData[column.filterKey];
          });
          if (index < 0) {
            return false;
          }
        } else if (column.selected?.length === 0) {
          return false;
        }
      }

      return true;
    });
    this.tlbData.total = this.tlbData.srcData.data.length;
  }

  public onL3cSelect() {
    this.l3cData.srcData.data = this.l3cData.data.filter((rowData: RespL3cData) => {
      for (const column of this.l3cData.columns) {
        if (column.selected && column.selected.length) {
          const index: number = column.selected.findIndex((item: any) => {
            return item.value === rowData[column.filterKey];
          });
          if (index < 0) {
            return false;
          }
        } else if (column.selected?.length === 0) {
          return false;
        }
      }

      return true;
    });
    this.l3cData.total = this.l3cData.srcData.data.length;
  }

}
