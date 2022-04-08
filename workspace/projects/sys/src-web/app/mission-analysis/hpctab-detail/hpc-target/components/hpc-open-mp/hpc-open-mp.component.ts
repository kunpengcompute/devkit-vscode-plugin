import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { HpcOpenMpService } from '../../service';
import { IHpcRankData, IHpcOpenMp } from '../../../domain';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-hpc-open-mp',
  templateUrl: './hpc-open-mp.component.html',
  styleUrls: ['./hpc-open-mp.component.scss'],
})
export class HpcOpenMpComponent implements OnInit {
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: number;
  @Input() nodeId: number;
  public i18n: any;

  public isLoading = false;
  public rankData: Array<IHpcRankData> = [];
  public barrierRankData: Array<IHpcOpenMp> = [];
  public paralleRankData: Array<IHpcOpenMp> = [];
  public noDataSuggest: string;
  public paralleDisplayed: Array<TiTableRowData> = [];
  public paralleData: CommonTableData = {
    columnsTree: ([] as TiTreeNode[]),
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    }
  };
  public barrierDisplayed: Array<TiTableRowData> = [];
  public barrierData: CommonTableData = {
    columnsTree: ([] as TiTreeNode[]),
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    }
  };
  constructor(
    private i18nService: I18nService,
    private hpcOpenMpService: HpcOpenMpService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.barrierData.columnsTree = [
      { label: 'Barrier-to-barrier segment', width: '25%', key: 'title', checked: true },
      {
        label: 'Potential Gain(s)', width: '12%', sortKey: 'potential_gain_value',
        key: 'potential_gain_value', checked: true
      },
      {
        label: 'CPU Utilization(%)', width: '13%', sortKey: 'cpu_utiliczation',
        key: 'cpu_utiliczation', checked: true
      },

      { label: 'Lock Contention(s)', width: '10%', sortKey: 'Lock', key: 'Lock', checked: true },
      { label: 'Creation(s)', width: '10%', sortKey: 'Creation', key: 'Creation', checked: true },
      { label: 'Scheduling(s)', width: '10%', sortKey: 'Scheduling', key: 'Scheduling', checked: true },
      { label: 'Tasking(s)', width: '10%', sortKey: 'Tasking', key: 'Tasking', checked: true },
      { label: 'Reduction(s)', width: '10%', sortKey: 'Reduction', key: 'Reduction', checked: true },
      { label: 'Atomics(s)', width: '10%', sortKey: 'Atomics', key: 'Atomics', checked: true },
      {
        label: this.i18n.hpc.hpc_target.exe_time, width: '10%', sortKey: 'exetime', key: 'exetime', checked: true
      },
      {
        label: this.i18n.hpc.hpc_target.unbalance_time, width: '10%',
        sortKey: 'unbalancetime', key: 'unbalancetime', checked: true
      },
      {
        label: this.i18n.hpc.hpc_target.unbalance_rate, width: '10%',
        sortKey: 'unbalanceratge', key: 'unbalanceratge', checked: true
      },
    ];
    this.paralleData.columnsTree = [
      {
        label: 'Parallel region', width: '25%', key: 'title', checked: true,
      },
      {
        label: 'Potential Gain(s)', width: '12%', sortKey: 'potential_gain_value',
        key: 'potential_gain_value', checked: true,
      },
      {
        label: 'CPU Utilization(%)', width: '13%',
        sortKey: 'cpu_utiliczation', key: 'cpu_utiliczation', checked: true
      },
      { label: 'Lock Contention(s)', width: '10%', sortKey: 'Lock', key: 'Lock', checked: true, },
      { label: 'Creation(s)', width: '10%', sortKey: 'Creation', key: 'Creation', checked: true, },
      { label: 'Scheduling(s)', width: '10%', sortKey: 'Scheduling', key: 'Scheduling', checked: true, },
      { label: 'Tasking(s)', width: '10%', sortKey: 'Tasking', key: 'Tasking', checked: true, },
      { label: 'Reduction(s)', width: '10%', sortKey: 'Reduction', key: 'Reduction', checked: true, },
      { label: 'Atomics(s)', width: '10%', sortKey: 'Atomics', key: 'Atomics', checked: true, },

      { label: this.i18n.hpc.hpc_target.exe_time, width: '10%', sortKey: 'exetime', key: 'exetime', checked: true, },
      {
        label: this.i18n.hpc.hpc_target.unbalance_time, width: '10%',
        sortKey: 'unbalancetime', key: 'unbalancetime', checked: true
      },
      {
        label: this.i18n.hpc.hpc_target.unbalance_rate, width: '10%', sortKey: 'unbalanceratge',
        key: 'unbalanceratge', checked: true,
      },
    ];
    this.hpcOpenMpService.getOpenMp(this.taskId, this.nodeId)
      .then((res) => {
        if (res?.rankData) {
          this.rankData = res.rankData;
        }
        this.paralleRankData = res.paralleData;
        this.paralleData.srcData.data = res.paralleData;
        this.paralleData = {...this.paralleData};
        this.barrierRankData = res.barrierData;
        this.barrierData.srcData.data = res.barrierData;
        this.barrierData = { ...this.barrierData };
        switch (sessionStorage.getItem('language')) {
          case 'en-us':
            this.noDataSuggest = res.suggest?.en || this.i18n.common_term_task_nodata;
            break;
          case 'zh-cn':
            this.noDataSuggest = res.suggest?.chs || this.i18n.common_term_task_nodata;
            break;
          default:
            this.noDataSuggest = this.i18n.common_term_task_nodata;
        }
      }).finally(() => {
        this.isLoading = false;

      });
  }
  public toggle(rank: IHpcRankData) {
    const bool = rank.expand;
    this.rankData.map((item: IHpcRankData) => {
      item.expand = false;
    });

    rank.expand = !bool;
    this.paralleData.data = this.paralleRankData.filter((item: IHpcOpenMp) => {
      return item.id === rank.id;
    });
    this.barrierData.data = this.barrierRankData.filter((item: IHpcOpenMp) => {
      return item.id === rank.id;
    });
  }
}
