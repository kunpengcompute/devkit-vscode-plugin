import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { fillPlaceholder } from 'projects/sys/src-web/app/util';
import { RespBandwidthData, RespCountData } from '../doman';

@Component({
  selector: 'app-ddr-ddr-table',
  templateUrl: './ddr-ddr-table.component.html',
  styleUrls: ['./ddr-ddr-table.component.scss'],
})
export class DdrDdrTableComponent implements OnChanges {
  @Input() data: any;
  public i18n: any;

  public bandwidth = {
    data: [] as Array<RespBandwidthData>,
    columns: [] as Array<TiTableColumns>,
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    pageNo: 0,
    total: undefined as number,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10,
    },
  };
  public count = {
    data: [] as Array<RespCountData>,
    theads: [] as any[],
    columns: [] as Array<TiTableColumns>,
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    pageNo: 0,
    total: undefined as number,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10,
    },
  };
  public hasDdrid = true;
  public typeTextMapping: any; // 表格中的类型列需要转换为文字显示
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

      L3C_RD: this.i18n.ddr.select.L3C_RD,
      L3C_WR: this.i18n.ddr.select.L3C_WR,

      DDR_RD: this.i18n.ddr.select.DDR_RD,
      DDR_WR: this.i18n.ddr.select.DDR_WR,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue) {
      this.dealData(this.data);
    }
  }

  private initBandwidthColumns(respBandwidthData: RespBandwidthData[]) {
    this.bandwidth.columns = [
      {
        label: 'NUMA NODE',
        filterKey: 'NUMA node',
        options: Array.from(
          new Set(respBandwidthData.map((item) => item['NUMA node']))
        ).map((item) => ({
          label: item,
          value: item,
        })),
        multiple: true,
        selectAll: true,
      },
      {
        label: this.i18n.ddr_summury.type,
        filterKey: 'type',
        options: Array.from(
          new Set(respBandwidthData.map((item) => item.type))
        ).map((item) => ({
          label: this.typeTextMapping[item],
          value: item,
        })),
        multiple: true,
        selectAll: true,
      },
      {
        label: this.i18n.ddr_summury.ddr_id,
        prop: 'DDRID',
        filterKey: 'DDRID',
        options: Array.from(
          new Set(respBandwidthData.map((item) => item.DDRID))
        ).map((item) => ({
          label: item,
          value: item,
        })),
        multiple: true,
        selectAll: true,
      },
      {
        label: this.i18n.ddr_summury.brandwidth,
        sortKey: 'bandwith',
      },
      {
        label: this.i18n.ddr_summury.maxBandWidth,
        sortKey: 'bandwidth_theory_value',
      },
      {
        label: this.i18n.ddr_summury.maxBandWidthRate,
        sortKey: 'bandwidth_percent',
      },
    ];
    this.bandwidth.columns[0].selected = Array.from(this.bandwidth.columns[0].options);
    this.bandwidth.columns[1].selected = Array.from(this.bandwidth.columns[1].options);
    this.bandwidth.columns[2].selected = Array.from(this.bandwidth.columns[2].options);
  }

  private initTimesColumns(respCountData: RespCountData[]) {
    this.count.theads = [
      [
        {
          label: 'NUMA NODE',
          filterKey: 'NUMA node',
          options: Array.from(
            new Set(respCountData.map((item) => item['NUMA node']))
          ).map((item) => ({
            label: item,
            value: item,
          })),
          multiple: true,
          selectAll: true,
          rowspan: 2,
        },
        {
          label: this.i18n.ddr_summury.type,
          filterKey: 'type',
          options: Array.from(
            new Set(respCountData.map((item) => item.type))
          ).map((item) => ({
            label: this.typeTextMapping[item],
            value: item,
          })),
          multiple: true,
          selectAll: true,
          rowspan: 2,
        },
        {
          label: this.i18n.ddr_summury.total_acc,
          sortKey: 'acessscount',
          rowspan: 2,
        },
        {
          label: this.i18n.ddr_summury.ddr_access,
          colspan: 4,
          textAlign: 'center',
        },
      ],
      [
        {
          label: `${this.i18n.ddr_summury.local_acc}(%)`,
          sortKey: 'localaccess',
        },
        {
          label: `${this.i18n.ddr_summury.inter_die}(%)`,
          sortKey: 'spandie'
        },
        {
          label: `${this.i18n.ddr_summury.chip_die}(%)`,
          sortKey: 'spanchip'
        },
        {
          label: `${this.i18n.ddr_summury.total_die}(%)`,
          sortKey: 'ddr_access_count',
        },
      ],
    ];
    this.count.theads[0][0].selected = Array.from(this.count.theads[0][0].options);
    this.count.theads[0][1].selected = Array.from(this.count.theads[0][1].options);
    this.count.columns = this.tableService
      .flat(this.count.theads)
      .filter((column: any) => !column.colspan);
  }

  // 处理数据
  private dealData(data: any) {
    this.bandwidth.total = data.ddrc_access_bandwidth_sum.length;
    this.bandwidth.data = data.ddrc_access_bandwidth_sum.map((item: any) => {
      item.bandwidth_percent = Number(item.bandwidth_percent);
      return item;
    });
    this.initBandwidthColumns(this.bandwidth.data);
    this.bandwidth.srcData.data = this.bandwidth.data;

    this.count.total = data.ddrc_access_count_sum.length;
    this.count.data = data.ddrc_access_count_sum.map((item: any) => {
      item.acessscount = Number(item.acessscount);
      item.ddr_access_count = Number(item.ddr_access_count);
      item.ddr_access_per = Number(item.ddr_access_per);
      item.local_access_per = Number(item.local_access_per);
      item.localaccess = Number(item.localaccess);
      item.spanchip = Number(item.spanchip);
      item.spanchip_per = Number(item.spanchip_per);
      item.spandie = Number(item.spandie);
      item.spandie_per = Number(item.spandie_per);
      return item;
    });
    this.initTimesColumns(this.count.data);
    this.count.srcData.data = this.count.data;

    // 判断ddrid
    this.hasDdrid = data.ddrc_access_bandwidth_sum.some((el: any) =>
      Object.prototype.hasOwnProperty.call(el, 'DDRID')
    );
    if (!this.hasDdrid) {
      this.bandwidth.columns = this.bandwidth.columns.filter(
        (column: { prop: string }) => column.prop !== 'DDRID'
      );
    }
  }

  public onBandwidthSelect() {
    this.bandwidth.srcData.data = this.bandwidth.data.filter((rowData: RespBandwidthData) => {
      for (const column of this.bandwidth.columns) {
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
    this.bandwidth.total = this.bandwidth.srcData.data.length;
  }

  public onCountSelect() {
    this.count.srcData.data = this.count.data.filter((rowData: RespCountData) => {
      for (const column of this.count.columns) {
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
    this.count.total = this.count.srcData.data.length;
  }

}
