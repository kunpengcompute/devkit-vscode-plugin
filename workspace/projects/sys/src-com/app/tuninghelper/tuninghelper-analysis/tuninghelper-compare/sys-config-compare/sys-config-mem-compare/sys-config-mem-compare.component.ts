import { Component, OnInit } from '@angular/core';
import { TiTableRowData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import { RespCompareDevice, RespSysConfigMemCompare } from '../domain/resp-sys-config-mem-compare.type';
import { getCompareValue } from '../utils/get-compare-value';

@Component({
  selector: 'app-sys-config-mem-compare',
  templateUrl: './sys-config-mem-compare.component.html',
  styleUrls: ['./sys-config-mem-compare.component.scss']
})
export class SysConfigMemCompareComponent implements OnInit {

  public summary = {
    totalSize: '--',
    totalBandwidth: '--',
  };
  public tableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    },
    columnsTree: []
  } as CommonTableData;
  private inited = false;
  private allData: TiTableRowData[] = [];
  public diff = true;
  public totalSizeDiff = false;
  public totalBandwidthDiff = false;
  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService
  ) { }

  async ngOnInit() {
    const resp = await this.getData();
    if (!resp) { return; }
    if ((resp.total_size[0] !== undefined && resp.total_size[0] !== '')) {
      resp.total_size[0] += 'GiB';
    }
    if ((resp.total_size[1] !== undefined && resp.total_size[0] !== '')) {
      resp.total_size[1] += 'GiB';
    }
    if ((resp.total_band_width[0] !== undefined && resp.total_band_width[0] !== '')) {
      resp.total_band_width[0] += 'GiB/s';
    }
    if ((resp.total_band_width[1] !== undefined && resp.total_band_width[0] !== '')) {
      resp.total_band_width[1] += 'GiB/s';
    }
    this.totalSizeDiff = resp.total_size[0] !== resp.total_size[1];
    this.totalBandwidthDiff = resp.total_band_width[0] !== resp.total_band_width[1];
    this.summary.totalSize = getCompareValue(resp.total_size);
    this.summary.totalBandwidth = getCompareValue(resp.total_band_width);
    this.initTableData(resp.device);
    this.inited = true;
    this.showDiff();
  }

  private initTableData(data: RespCompareDevice) {
    this.tableData.columnsTree = [
      { key: 'cpu', checked: true, label: 'CPU', disabled: true },
      { key: 'channel', checked: true, label: 'Channel', disabled: true },
      { key: 'dimm', checked: true, label: 'DIMM', disabled: true },
      { key: 'compareObject', checked: true, label: I18n.tuninghelper.compare.compareObject, disabled: true },
      { key: 'maxSpeed', checked: true, label: I18n.tuninghelper.sysConfigDetail.maxSpeedMts },
      { key: 'dataWidth', checked: true, label: 'Data Width（bits）' },
      { key: 'bandWidth', checked: true, label: I18n.tuninghelper.sysConfigDetail.bandwidthMbs },
      { key: 'size', checked: true, label: I18n.tuninghelper.sysConfigDetail.capacityGb },
      { key: 'numaNode', checked: true, label: 'NUMA NODE' },
    ];

    const cpuMap: Map<string, Array<any>> = new Map();
    Object.keys(data).forEach(key => {
      const item = data[key];
      const [cpu, channel, dimm] = key.split(',');
      let rowData = cpuMap.get(cpu);
      if (!rowData) {
        rowData = [];
        cpuMap.set(cpu, rowData);
      }

      rowData.push(
        {
          cpuRowSpan: 0,
          cpu, channel, dimm,
          compareObject: I18n.tuninghelper.compare.object1,
          maxSpeed: item.max_speed[0],
          maxSpeedDiff: item.max_speed[2],
          dataWidth: item.data_width[0],
          dataWidthDiff: item.data_width[2],
          bandWidth: item.band_width[0],
          bandWidthDiff: item.band_width[2],
          size: item.size[0],
          sizeDiff: item.size[2],
          numaNode: item.numa_node[0],
          numaNodeDiff: item.numa_node[2]
        },
        {
          cpuRowSpan: 0,
          cpu, channel, dimm,
          compareObject: I18n.tuninghelper.compare.object2,
          maxSpeed: item.max_speed[1],
          dataWidth: item.data_width[1],
          bandWidth: item.band_width[1],
          size: item.size[1],
          numaNode: item.numa_node[1]
        },
      );

    });

    cpuMap.forEach(item => {
      item[0].cpuRowSpan = item.length;
      this.tableData.srcData.data = this.tableData.srcData.data.concat(item);
    });

    this.tableData = { ...this.tableData };
    this.allData = Array.from(this.tableData.srcData.data);
    this.tableData = this.dealTableData({ tableData: this.tableData }).tableData;
  }

  private async getData() {
    const params = {
      id: this.statusService.taskId,
      type: 'memory'
    };
    const resp: RespCommon<RespSysConfigMemCompare> = await this.http.get(
      `/data-comparison/system-config-comparison/`,
      { params }
    );
    return resp?.data?.data;
  }

  public onSelectedChange(value: 'diff' | 'all') {
    this.diff = value === 'diff';
    if (!this.inited) { return; }
    if (value === 'diff') {
      this.showDiff();
    } else {
      this.tableData.srcData.data = Array.from(this.allData);
      this.tableData = { ...this.tableData };
    }
  }

  private showDiff() {
    // 得到没有disabled并且当前显示的列的key
    const showKeys = this.tableData.columnsTree.filter(item => {
      return !item.disabled && item.checked;
    }).map(item => item.key);
    const cpuMap: Map<string, Array<any>> = new Map();
    for (let i = 0; i < this.allData.length; i += 2) {
      const item1 = this.allData[i];
      const diffIndex = showKeys.findIndex(key => !item1[key + 'Diff']);
      if (diffIndex > -1) {
        const item2 = this.allData[i + 1];
        let filteredDataClip = cpuMap.get(item1.cpu);
        if (!filteredDataClip) {
          filteredDataClip = [];
          cpuMap.set(item1.cpu, filteredDataClip);
        }
        filteredDataClip.push(item1, item2);
      }
    }
    let filteredData: any[] = [];
    cpuMap.forEach(item => {
      item[0].cpuRowSpanDiff = item.length;
      for (let i = 1; i < item.length; i++) {
        item[i].cpuRowSpanDiff = 0;
      }
      filteredData = filteredData.concat(item);
    });
    this.tableData.srcData.data = filteredData;
    this.tableData = { ...this.tableData };
  }

  public onFilterColumn(columnsTree: CommonTreeNode[]) {
    this.tableData.columnsTree = columnsTree;
    if (this.diff) {
      this.showDiff();
    }
  }

  private dealTableData(tableData: any) {
    const newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData?.tableData?.columnsTree?.forEach((columnData: any) => {
      if (columnData.children?.length) {
        columnData?.children.forEach((subColumnData: any) => {
          subColumnData.hasEmptyPlace = newTableData?.tableData?.srcData?.data.some(
            (item: any) => item[subColumnData.key + 'Diff'] !== undefined && !item[subColumnData.key + 'Diff']
          );
        });
      }else {
        columnData.hasEmptyPlace = newTableData?.tableData?.srcData?.data.some(
          (item: any) => item[columnData.key + 'Diff'] !== undefined && !item[columnData.key + 'Diff']
        );
      }
    });
    return newTableData;
  }
}
