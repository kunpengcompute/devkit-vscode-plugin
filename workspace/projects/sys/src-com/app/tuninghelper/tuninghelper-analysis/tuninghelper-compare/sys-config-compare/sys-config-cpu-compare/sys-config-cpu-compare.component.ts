import { Component, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import {
  RespCompareCpuInfo,
  RespCompareNumaNodeDistanceInfo,
  RespCompareNumaNodeInfo,
  RespSysConfigCpuCompare
} from '../domain/resp-sys-config-cpu-compare.type';
import { getCompareValue } from '../utils/get-compare-value';
import { CompareItem } from '../../components/compare-text-item/compare-text-item.component';

@Component({
  selector: 'app-sys-config-cpu-compare',
  templateUrl: './sys-config-cpu-compare.component.html',
  styleUrls: ['./sys-config-cpu-compare.component.scss']
})
export class SysConfigCpuCompareComponent implements OnInit {

  public hasData = false;
  private cpuInfo = {
    summary: [] as CompareItem[],
    detail: [] as {
      title: string;
      target: CompareItem[];
    }[],
  };
  private numaNode = {
    summary: [] as CompareItem[],
    detail: [] as {
      title: string;
      target: CompareItem[];
    }[],
  };
  public numaNodeDistance = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    },
    columnsTree: [],
  } as CommonTableData;
  public cacheData = [] as CompareItem[];
  public cacheDataSufix = '';
  public treeData: Array<TiTreeNode> = [
    {
      label: 'CPU',
      expanded: true,
      children: [{
        type: 'cpu',
        data: this.cpuInfo,
      }],
    },
    {
      label: I18n.tuninghelper.sysConfigDetail.numaNode,
      expanded: true,
      children: [{
        type: 'numaNode',
        data: this.numaNode,
      }],
    },
    {
      label: I18n.tuninghelper.sysConfigDetail.numaNodeDistance,
      expanded: true,
      children: [{
        type: 'numaNodeDistance'
      }],
    },
    {
      label: I18n.tuninghelper.sysConfigDetail.cacheInfo,
      expanded: true,
      children: [{
        type: 'cacheInfo'
      }],
    },
  ];

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService
  ) { }

  async ngOnInit() {
    const resp = await this.getData();
    this.hasData = !!resp;
    if (!resp) { return; }
    this.initCpuData(resp.cpu_info);
    this.initNumaNodeData(resp.numa_node_info);
    this.initNumaNodeDistanceData(resp.numa_node_distance_info);
    this.initCacheData(resp.cache_info);
  }

  private initCpuData(data: RespCompareCpuInfo) {
    if (!data) { return; }

    this.cpuInfo.summary.push(
      {
        label: I18n.tuninghelper.sysConfigDetail.cpuModel,
        different: !data.version[2],
        value: getCompareValue(data.version)
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.coreCount,
        different: !data.core_count[2],
        value: getCompareValue(data.core_count)
      },
    );

    const indexArr = {
      coreCount: data.title.indexOf('core_count'),
      version: data.title.indexOf('version'),
      maxSpeed: data.title.indexOf('max_speed'),
      currentSpeed: data.title.indexOf('current_speed'),
    };

    Object.keys(data.cpus.data).sort().forEach(cpuName => {
      const cpuInfo = data.cpus.data[cpuName];
      this.cpuInfo.detail.push({
        title: cpuName,
        target: [
          {
            label: I18n.tuninghelper.sysConfigDetail.coreCount,
            different: !cpuInfo[indexArr.coreCount][2],
            value: getCompareValue(cpuInfo[indexArr.coreCount])
          },
          {
            label: I18n.tuninghelper.sysConfigDetail.cpuModel,
            different: !cpuInfo[indexArr.version][2],
            value: getCompareValue(cpuInfo[indexArr.version])
          },
          {
            label: I18n.tuninghelper.sysConfigDetail.maxFrequency,
            different: !cpuInfo[indexArr.maxSpeed][2],
            value: getCompareValue(cpuInfo[indexArr.maxSpeed])
          },
          {
            label: I18n.tuninghelper.sysConfigDetail.currFrequency,
            different: !cpuInfo[indexArr.currentSpeed][2],
            value: getCompareValue(cpuInfo[indexArr.currentSpeed])
          },
        ]
      });
    });

  }

  private initNumaNodeData(data: RespCompareNumaNodeInfo) {
    if (!data) { return; }
    const nodeMap: any = {
      on: I18n.sys_cof.sum.open,
      off: I18n.sys_cof.sum.close
    };
    data.numa_balancing[0] = nodeMap[data.numa_balancing[0]];
    data.numa_balancing[1] = nodeMap[data.numa_balancing[1]];
    this.numaNode.summary.push(
      {
        label: I18n.tuninghelper.sysConfigDetail.numaBalance,
        different: !data.numa_balancing[2],
        value: getCompareValue(data.numa_balancing)
      }
    );

    const indexArr = {
      cpus: data.title.indexOf('cpus'),
      totalMem: data.title.indexOf('total_mem'),
      freeMem: data.title.indexOf('free_mem'),
    };

    Object.keys(data.node_info.data).sort().forEach(numaNodeKey => {
      const numaNodeId = Number(numaNodeKey);
      const numaNodeInfo = data.node_info.data[numaNodeId];
      this.numaNode.detail.push({
        title: 'NUMA ' + numaNodeId,
        target: [
          {
            label: I18n.tuninghelper.sysConfigDetail.cpuCore,
            different: !numaNodeInfo[indexArr.cpus][2],
            value: getCompareValue(numaNodeInfo[indexArr.cpus])
          },
          {
            label: I18n.tuninghelper.sysConfigDetail.totalMem,
            different: !numaNodeInfo[indexArr.totalMem][2],
            value: getCompareValue(numaNodeInfo[indexArr.totalMem])
          },
          {
            label: I18n.tuninghelper.sysConfigDetail.freeMem,
            different: !numaNodeInfo[indexArr.freeMem][2],
            value: getCompareValue(numaNodeInfo[indexArr.freeMem])
          },
        ]
      });
    });

  }

  private initNumaNodeDistanceData(data: RespCompareNumaNodeDistanceInfo) {
    this.numaNodeDistance.columnsTree = [
      { key: 'node', checked: true, label: I18n.tuninghelper.sysConfigDetail.node },
    ];

    if (!data) { return; }

    this.numaNodeDistance.srcData.data = Object.keys(data.data).sort().map(numaNodeKey => {
      const numaNodeId = Number(numaNodeKey);
      this.numaNodeDistance.columnsTree.push({
        key: numaNodeKey,
        checked: true,
        label: numaNodeKey
      });

      return {
        node: numaNodeKey,
        ...data.data[numaNodeId].reduce((obj: any, value, index) => {
          obj[index] = getCompareValue(value);
          return obj;
        }, {})
      };
    });

    this.numaNodeDistance = { ...this.numaNodeDistance };

  }

  private initCacheData(data: any) {
    if (data && data.data) {
      Object.keys(data.data).forEach((key: any) => {
        data.data[key] = data.data[key].map((item: any, idx: number) => {
          if (item && item !== '--' && idx !== 2) {
            if (!this.cacheDataSufix) {
              this.cacheDataSufix = item.replace(/\d/g, '');
            }
            item = item.replace(/\D/g, '');
          }
          return item;
        });
      });
    }
    this.cacheData.push(
      {
        label: 'L1d cache' + (this.cacheDataSufix ? ' (' + this.cacheDataSufix + ')' : ''),
        different: !data.data.L1d[2],
        value: getCompareValue(data.data.L1d),
        tip: I18n.tuninghelper.sysConfigDetail.cacheInfoTip1
      },
      {
        label: 'L1i cache' + (this.cacheDataSufix ? ' (' + this.cacheDataSufix + ')' : ''),
        different: !data.data.L1i[2],
        value: getCompareValue(data.data.L1i),
        tip: I18n.tuninghelper.sysConfigDetail.cacheInfoTip2
      },
      {
        label: 'L2 cache' + (this.cacheDataSufix ? ' (' + this.cacheDataSufix + ')' : ''),
        different: !data.data.L2[2],
        value: getCompareValue(data.data.L2),
        tip: I18n.tuninghelper.sysConfigDetail.cacheInfoTip3
      },
      {
        label: 'L3 cache' + (this.cacheDataSufix ? ' (' + this.cacheDataSufix + ')' : ''),
        different: !data.data.L3[2],
        value: getCompareValue(data.data.L3),
        tip: I18n.tuninghelper.sysConfigDetail.cacheInfoTip4
      },
    );
  }

  private async getData() {
    const params = {
      id: this.statusService.taskId,
      type: 'cpu',
    };
    const resp: RespCommon<RespSysConfigCpuCompare> = await this.http.get(
      `/data-comparison/system-config-comparison/`,
      { params }
    );
    return resp?.data?.data;
  }

}
