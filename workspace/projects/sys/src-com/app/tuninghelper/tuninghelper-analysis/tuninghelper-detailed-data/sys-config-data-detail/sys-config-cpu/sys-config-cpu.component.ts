import { Component, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService, TipService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import {
  RespCacheInfo,
  RespCpuConfig,
  RespCpuInfo,
  RespNumaNodeDistanceInfo,
  RespNumaNodeInfo,
  RespSystemConfigCpu,
} from '../domain/resp-system-config-cpu.type';

@Component({
  selector: 'app-sys-config-cpu',
  templateUrl: './sys-config-cpu.component.html',
  styleUrls: ['./sys-config-cpu.component.scss']
})
export class SysConfigCpuComponent implements OnInit {

  public tableData = {
    cpuData: {
      title: '',
      other: [] as { label: string; text: string }[],
      columns: [] as Array<TiTableColumns>,
      displayed: [] as Array<TiTableRowData>,
      srcData: {
        data: [] as Array<TiTableRowData>,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      } as TiTableSrcData,
      pageNo: 0,
      pageSize: {
        options: [10, 20, 50, 100],
        size: 10
      },
      pageTotal: 0,
    },
    numaNodeData: {
      title: '',
      other: [] as { label: string; text: string }[],
      columns: [] as Array<TiTableColumns>,
      displayed: [] as Array<TiTableRowData>,
      srcData: {
        data: [] as Array<TiTableRowData>,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      } as TiTableSrcData,
      pageNo: 0,
      pageSize: {
        options: [10, 20, 50, 100],
        size: 10
      },
      pageTotal: 0,
    },
    numaNodeDistanceData: {
      title: '',
      columns: [] as Array<TiTableColumns>,
      displayed: [] as Array<TiTableRowData>,
      srcData: {
        data: [] as Array<TiTableRowData>,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      } as TiTableSrcData,
      pageNo: 0,
      pageSize: {
        options: [10, 20, 50, 100],
        size: 10
      },
      pageTotal: 0,
    }
  };
  public cacheData: RespCacheInfo;
  public cacheDataSufix = '';

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private tip: TipService,
  ) {
  }

  async ngOnInit() {
    const data = await this.getData();
    this.initTable(data);
  }

  private initTable(data: RespCpuConfig) {
    if (!data) { return; }
    this.initCpuData(data.cpu_info);
    this.initNumaNodeData(data.numa_node_info);
    this.initNumaNodeDistanceData(data.numa_node_distance_info);
    this.initCacheData(data.cache_info);
  }

  private initCpuData(data: RespCpuInfo) {
    this.tableData.cpuData.title = 'CPU';
    this.tableData.cpuData.other.push({
      label: I18n.tuninghelper.sysConfigDetail.cpuModel,
      text: data?.version || '--'
    }, {
      label: I18n.tuninghelper.sysConfigDetail.coreCount,
      text: String(data?.core_count || '--')
    });

    this.tableData.cpuData.columns = [
      { key: 'cpu', title: 'CPU' },
      {
        key: 'coreCount',
        title: I18n.tuninghelper.sysConfigDetail.coreCount,
      },
      { key: 'cpuType', title: I18n.tuninghelper.sysConfigDetail.cpuType },
      {
        key: 'maxFrequency',
        title: I18n.tuninghelper.sysConfigDetail.maxFrequency,
        sortKey: 'maxFrequency',
        compareFn: (a: any, b: any, predicate: string): number => {
          return Number(b[predicate].split(' ')) - Number(a[predicate].split(' '));
        },
        question: true,
        tip: I18n.tuninghelper.sysConfigDetail.cpuMaxFrequency,
      },
      {
        key: 'currFrequency',
        title: I18n.tuninghelper.sysConfigDetail.currFrequency,
        sortKey: 'currFrequency',
        compareFn: (a: any, b: any, predicate: string): number => {
          return Number(b[predicate].split(' ')) - Number(a[predicate].split(' '));
        },
        question: true,
        tip: I18n.tuninghelper.sysConfigDetail.cpuCurrFrequency,
      },
    ];

    if (!data) { return; }

    const indexArr = {
      cpu: data.cpus.title.indexOf('name'),
      coreCount: data.cpus.title.indexOf('core_count'),
      cpuType: data.cpus.title.indexOf('version'),
      maxFrequency: data.cpus.title.indexOf('max_speed'),
      currFrequency: data.cpus.title.indexOf('current_speed'),
    };

    this.tableData.cpuData.srcData.data = data.cpus.data.map(item => {
      return {
        cpu: item[indexArr.cpu],
        coreCount: item[indexArr.coreCount],
        cpuType: item[indexArr.cpuType],
        maxFrequency: item[indexArr.maxFrequency],
        currFrequency: item[indexArr.currFrequency],
      };
    });
  }

  private initNumaNodeData(data: RespNumaNodeInfo) {
    this.tableData.numaNodeData.title = I18n.tuninghelper.sysConfigDetail.numaNode;
    this.tableData.numaNodeData.other.push({
      label: I18n.tuninghelper.sysConfigDetail.numaBalance,
      text: data?.numa_balancing === 'on'
        ? I18n.tuninghelper.sysConfigDetail.on : I18n.tuninghelper.sysConfigDetail.off
    });

    this.tableData.numaNodeData.columns = [
      { key: 'node', title: I18n.tuninghelper.sysConfigDetail.node },
      { key: 'cpuCore', title: I18n.tuninghelper.sysConfigDetail.cpuCore },
      { key: 'totalMem', title: I18n.tuninghelper.sysConfigDetail.totalMem },
      { key: 'freeMem', title: I18n.tuninghelper.sysConfigDetail.freeMem },
    ];

    if (!data) { return; }

    const indexArr = {
      node: data.node_info.title.indexOf('node'),
      cpuCore: data.node_info.title.indexOf('cpus'),
      totalMem: data.node_info.title.indexOf('total_mem'),
      freeMem: data.node_info.title.indexOf('free_mem'),
    };

    this.tableData.numaNodeData.srcData.data = data.node_info.data.map(item => {
      return {
        node: item[indexArr.node],
        cpuCore: item[indexArr.cpuCore],
        totalMem: item[indexArr.totalMem],
        freeMem: item[indexArr.freeMem],
      };
    });
  }

  private initNumaNodeDistanceData(data: RespNumaNodeDistanceInfo) {
    this.tableData.numaNodeDistanceData.title = I18n.tuninghelper.sysConfigDetail.numaNodeDistance;
    this.tableData.numaNodeDistanceData.columns = [
      { key: 'node', title: I18n.tuninghelper.sysConfigDetail.node },
    ];

    if (!data) { return; }

    this.tableData.numaNodeDistanceData.srcData.data = data.map(item => {
      const nodeId = Number(Object.keys(item)[0]);
      this.tableData.numaNodeDistanceData.columns.push({
        key: nodeId,
        title: String(nodeId)
      });

      return {
        node: nodeId,
        ...item[nodeId].reduce((obj: any, value, index) => {
          obj[index] = value;
          return obj;
        }, {})
      };
    });
  }

  private initCacheData(data: any) {
    Object.keys(data).forEach((key: any) => {
      if (data[key] && data[key] !== '--') {
        if (!this.cacheDataSufix) {
          this.cacheDataSufix = data[key].replace(/\d/g, '');
        }
        data[key] = data[key].replace(/\D/g, '');
      }
    });
    this.cacheData = data;
  }

  private async getData() {
    const params = {
      'node-id': this.statusService.nodeId,
      'config-type': 'cpu',
    };
    const resp: RespCommon<RespSystemConfigCpu> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/system-config/`,
      { params }
    );
    return resp?.data?.optimization?.data;
  }

}
