import { Component, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import { PerfDataService } from '../../../tuninghelper-detailed-data/server/perf-data.service';
import { CompareHandleService } from '../service/compare-handle.service';

@Component({
  selector: 'app-sys-perf-memory-compare',
  templateUrl: './sys-perf-memory-compare.component.html',
  styleUrls: ['./sys-perf-memory-compare.component.scss'],
  providers: [
    { provide: CompareHandleService }
  ]
})
export class SysPerfMemoryCompareComponent implements OnInit {

  constructor(
    private http: HttpService,
    private tuninghelperStatusService: TuninghelperStatusService,
    private compareHandleService: CompareHandleService,
    private perfData: PerfDataService
  ) {
    this.usageData = perfData.usageData;
  }
  public usageData: any[][];
  public memoryUsageInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [{
      label: I18n.tuninghelper.taskDetail.type,
      width: '20%',
      checked: true,
      key: 'title',
      searchKey: 'title',
    },
    {
      label: I18n.tuninghelper.taskDetail.compareValue,
      width: '40%',
      checked: true,
      key: 'percent',
      sortKey: 'compare',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object1,
      width: '20%',
      checked: true,
      key: 'first',
      sortKey: 'first',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object2,
      width: '20%',
      checked: true,
      key: 'second',
      sortKey: 'second',
      compareType: 'number',
    }],
  };
  public statisticsInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [{
      label: I18n.tuninghelper.taskDetail.type,
      width: '20%',
      checked: true,
      key: 'title',
      searchKey: 'title',
    },
    {
      label: I18n.tuninghelper.taskDetail.compareValue,
      width: '40%',
      checked: true,
      key: 'percent',
      sortKey: 'compare',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object1,
      width: '20%',
      checked: true,
      key: 'first',
      sortKey: 'first',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object2,
      width: '20%',
      checked: true,
      key: 'second',
      sortKey: 'second',
      compareType: 'number',
    }],
  };
  public hugeInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [{
      label: I18n.tuninghelper.taskDetail.type,
      width: '20%',
      checked: true,
      key: 'title',
      searchKey: 'title',
    },
    {
      label: I18n.tuninghelper.taskDetail.compareValue,
      width: '40%',
      checked: true,
      key: 'percent',
      sortKey: 'compare',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object1,
      width: '20%',
      checked: true,
      key: 'first',
      sortKey: 'first',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object2,
      width: '20%',
      checked: true,
      key: 'second',
      sortKey: 'second',
      compareType: 'number',
    }],
  };
  public paginationInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [{
      label: I18n.tuninghelper.taskDetail.type,
      width: '20%',
      checked: true,
      key: 'title',
      searchKey: 'title',
    },
    {
      label: I18n.tuninghelper.taskDetail.compareValue,
      width: '40%',
      checked: true,
      key: 'percent',
      sortKey: 'compare',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object1,
      width: '20%',
      checked: true,
      key: 'first',
      sortKey: 'first',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object2,
      width: '20%',
      checked: true,
      key: 'second',
      sortKey: 'second',
      compareType: 'number',
    }],
  };
  public exchangeInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [{
      label: I18n.tuninghelper.taskDetail.type,
      width: '20%',
      checked: true,
      key: 'title',
      searchKey: 'title',
    },
    {
      label: I18n.tuninghelper.taskDetail.compareValue,
      width: '40%',
      checked: true,
      key: 'percent',
      sortKey: 'compare',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object1,
      width: '20%',
      checked: true,
      key: 'first',
      sortKey: 'first',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object2,
      width: '20%',
      checked: true,
      key: 'second',
      sortKey: 'second',
      compareType: 'number',
    }],
  };
  public swapInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [{
      label: I18n.tuninghelper.taskDetail.type,
      width: '20%',
      checked: true,
      key: 'title',
      searchKey: 'title',
    },
    {
      label: I18n.tuninghelper.taskDetail.compareValue,
      width: '40%',
      checked: true,
      key: 'percent',
      sortKey: 'compare',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object1,
      width: '20%',
      checked: true,
      key: 'first',
      sortKey: 'first',
      compareType: 'number',
    },
    {
      label: I18n.tuninghelper.compare.object2,
      width: '20%',
      checked: true,
      key: 'second',
      sortKey: 'second',
      compareType: 'number',
    }],
  };
  public numaInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [],
  };
  ngOnInit(): void {
    this.numaInfo.columnsTree = [
      {
        label: 'NUMA Node',
        width: '10%',
        checked: true,
        disabled: true,
        key: 'name',
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        checked: true,
        expanded: true,
        children: [
          {
            label: 'numa_hit',
            checked: true,
            key: 'numa_hit_percent',
            sortKey: 'numa_hit_compare',
            tip: I18n.sys.tip.numahit
          },
          {
            label: 'numa_miss',
            checked: true,
            key: 'numa_miss_percent',
            sortKey: 'numa_miss_compare',
            tip: I18n.sys.tip.numa_miss
          },
          {
            label: 'numa_foreign',
            checked: true,
            key: 'numa_foreign_percent',
            sortKey: 'numa_foreign_compare',
            tip: I18n.sys.tip.numa_foreign
          },
          {
            label: 'interleave_hit',
            checked: true,
            key: 'interleave_hit_percent',
            sortKey: 'interleave_hit_compare',
            tip: I18n.sys.tip.interleave_hit
          },
          {
            label: 'local_node',
            checked: true,
            key: 'local_node_percent',
            sortKey: 'local_node_compare',
            tip: I18n.sys.tip.local_node
          },
          {
            label: 'other_node',
            checked: true,
            key: 'other_node_percent',
            sortKey: 'other_node_compare',
            tip: I18n.sys.tip.other_node
          }
        ]
      },
      {
        label: I18n.tuninghelper.compare.object1,
        checked: 'indeterminate',
        expanded: true,
        children: [
          {
            label: 'numa_hit',
            checked: true,
            key: 'numa_hit_1',
            sortKey: 'numa_hit_1',
            tip: I18n.sys.tip.numahit
          },
          {
            label: 'numa_miss',
            checked: false,
            key: 'numa_miss_1',
            sortKey: 'numa_miss_1',
            tip: I18n.sys.tip.numa_miss
          },
          {
            label: 'numa_foreign',
            checked: false,
            key: 'numa_foreign_1',
            sortKey: 'numa_foreign_1',
            tip: I18n.sys.tip.numa_foreign
          },
          {
            label: 'interleave_hit',
            checked: false,
            key: 'interleave_hit_1',
            sortKey: 'interleave_hit_1',
            tip: I18n.sys.tip.interleave_hit
          },
          {
            label: 'local_node',
            checked: false,
            key: 'local_node_1',
            sortKey: 'local_node_1',
            tip: I18n.sys.tip.local_node
          },
          {
            label: 'other_node',
            checked: false,
            key: 'other_node_1',
            sortKey: 'other_node_1',
            tip: I18n.sys.tip.other_node
          }
        ]
      },
      {
        label: I18n.tuninghelper.compare.object2,
        checked: 'indeterminate',
        expanded: true,
        children: [
          {
            label: 'numa_hit',
            checked: true,
            key: 'numa_hit_2',
            sortKey: 'numa_hit_2',
            tip: I18n.sys.tip.numahit
          },
          {
            label: 'numa_miss',
            checked: false,
            key: 'numa_miss_2',
            sortKey: 'numa_miss_2',
            tip: I18n.sys.tip.numa_miss
          },
          {
            label: 'numa_foreign',
            checked: false,
            key: 'numa_foreign_2',
            sortKey: 'numa_foreign_2',
            tip: I18n.sys.tip.numa_foreign
          },
          {
            label: 'interleave_hit',
            checked: false,
            key: 'interleave_hit_2',
            sortKey: 'interleave_hit_2',
            tip: I18n.sys.tip.interleave_hit
          },
          {
            label: 'local_node',
            checked: false,
            key: 'local_node_2',
            sortKey: 'local_node_2',
            tip: I18n.sys.tip.local_node
          },
          {
            label: 'other_node',
            checked: false,
            key: 'other_node_2',
            sortKey: 'other_node_2',
            tip: I18n.sys.tip.other_node
          }
        ]
      },
    ];
    const params = {
      id: this.tuninghelperStatusService.taskId,
      'query-type': JSON.stringify(['mem_utilization', 'fetch_statistics', 'hugepage_memory_usage',
      'pagination_statistics', 'exchange_statistics', 'swap_utilization', 'mem_numa_statistics'])
    };
    this.http.get(`/data-comparison/system-performance-comparison/`, {
      params,
      headers: { showLoading: false }
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS) {
        this.memoryUsageInfo.srcData.data = this.handleTableData(resp.data.mem_utilization, this.usageData[0]);
        this.memoryUsageInfo = {...this.memoryUsageInfo};
        // 访存统计信息类型使用国际化
        this.statisticsInfo.srcData.data = this.handleTableData(resp.data.fetch_statistics, this.usageData[1]);
        this.statisticsInfo = {...this.statisticsInfo};
        this.hugeInfo.srcData.data = this.handleTableData(resp.data.hugepage_memory_usage, this.usageData[2]);
        this.hugeInfo = {...this.hugeInfo};
        this.paginationInfo.srcData.data = this.handleTableData(resp.data.pagination_statistics, this.usageData[3]);
        this.paginationInfo = {...this.paginationInfo};
        this.exchangeInfo.srcData.data = this.handleTableData(resp.data.exchange_statistics, this.usageData[4]);
        this.exchangeInfo = {...this.exchangeInfo};
        this.swapInfo.srcData.data = this.handleTableData(resp.data.swap_utilization, this.usageData[5]);
        this.swapInfo = {...this.swapInfo};
        this.numaInfo.srcData.data = this.compareHandleService.handleCompareData(resp.data.mem_numa_statistics).sort(
          (a, b) => {
            return a.name?.split('node')[1] - b.name?.split('node')[1];
          }
        );
        this.numaInfo = {...this.numaInfo};
      }
    });
  }
  // data: 接口返回数据  orderData: 排序数组(参数位置需要与调优助手普通任务一致)
  private handleTableData(data: any, orderData: any) {
    orderData.forEach((item: any) => {
      if (data[item.key]) {
        item.first = data[item.key][0]; // 对比值1
        item.second = data[item.key][1]; // 对比值2
        item.compare = this.compareHandleService.getDiffValue(data[item.key][0], data[item.key][1]);
        item.percent = item.compare + I18n.common_term_sign_left + data[item.key][2]
                      + '%' + I18n.common_term_sign_right;
      } else {
        item.first = '--';
        item.second = '--';
        item.compare = '--';
        item.percent = '--' + I18n.common_term_sign_left + '--%' + I18n.common_term_sign_right;
      }
    });
    return orderData;
  }
}
