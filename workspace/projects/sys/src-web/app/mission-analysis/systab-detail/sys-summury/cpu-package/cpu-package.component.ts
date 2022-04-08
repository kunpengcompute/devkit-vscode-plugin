import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-cpu-package',
  templateUrl: './cpu-package.component.html',
  styleUrls: ['../sys-summury.component.scss']
})
export class CpuPackageComponent implements OnInit {

  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() cpuPackageData: any;
  public i18n: any;
  public toggle = {   //  用于判断打开关闭
    CPUPackage: true, // cpu package
    CPU: true,
    numaNode: true,
    numaNodeDistance: true,
    numaBalance: true
  };
  public titleDetail: any = [];
  // cpuPackage配置 cpu配置
  public cpuTitle: Array<TiTableColumns> = [];
  public cpuDisplayData: Array<TiTableRowData> = [];
  public cpuContentData: TiTableSrcData;
  public cpuCurrentPage = 1;
  public cpuPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public cpuTotalNumber = 0;
  public ifCpuNoneData = true;
  public CpuNoneData = '';


  // NUMA节点配置
  public numaNodeTitle: Array<TiTableColumns> = [];
  public numaNodeDisplayData: Array<TiTableRowData> = [];
  public numaNodeContentData: TiTableSrcData;
  public numaNodeCurrentPage = 1;
  public numaNodePageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public numaNodeTotalNumber = 0;
  public ifNumaNoneData = true;
  public numaNoneData = '';
  // NUMA节点距离配置
  public numaNodeDistanceTitle: Array<TiTableColumns> = [];
  public numaNodeDistanceDisplayData: Array<TiTableRowData> = [];
  public numaNodeDistanceContentData: TiTableSrcData;
  public numaNodeDistanceCurrentPage = 1;
  public numaNodeDistancePageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public numaNodeDistanceTotalNumber = 0;
  public ifnumaNodeDistance = true;
  public numaNodeDistance = '';

  // NUMA平衡
  public numaBalanceTitle: Array<TiTableColumns> = [];
  public numaBalanceDisplayData: Array<TiTableRowData> = [];
  public numaBalanceContentData: TiTableSrcData;
  public numaBalanceCurrentPage = 1;
  public numaBalancePageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public numaBalanceTotalNumber = 0;
  public ifnumaBalance = true;
  public numaBalance = '';

  ngOnInit() {
    // cpu package 表格title
    this.CpuNoneData = this.i18n.common_term_task_nodata2;
    this.numaNoneData = this.i18n.common_term_task_nodata2;
    this.numaNodeDistance = this.i18n.common_term_task_nodata2;
    this.numaBalance = this.i18n.common_term_task_nodata2;
    this.cpuTitle = [
      {
        title: this.i18n.sys_cof.sum.cpu
      }, {
        title: this.i18n.sys_cof.sum.cpu_info.cpu_type,
      }, {
        title: this.i18n.sys_cof.sum.cpu_info.cpu_max_hz,
      }, {
        title: this.i18n.sys_cof.sum.cpu_info.cpu_cur_hz,
      }];
    this.numaNodeTitle = [
      {
        title: this.i18n.sys_cof.sum.cpu_info.node_name,
        width: '17%'
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_core,
        width: '40%'
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.total_mem,
        width: '18%'
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.free_mem,
        width: '25%'
      },
    ];
    this.numaNodeDistanceTitle = [
      {
        title: this.i18n.sys_cof.sum.cpu_info.node,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_zero,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_one,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_two,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_three,
      },
    ];
    this.numaBalanceTitle = [{
      title: this.i18n.sys_summary.cpupackage_tabel.NUMA_name
    }];
    if (JSON.stringify(this.cpuPackageData) !== '{}') {
      this.getCpuPackageData(this.cpuPackageData);
    }



  }

  public maxLength(data: any) {
    let num = 0;
    if (data != null) {
      Object.keys(data).forEach(item => {
        if (data[item].length > num) {
          num = data[item].length;
        }
      });
    }
    return num;
  }
  // 获取 cpu package数据
  public getCpuPackageData(data: any) {

    // cpuPackage cpu配置
    const cpuData: any = [];
    let cpuType = '';
    let cores = 0;
    if (data != null) {
      Object.keys(data).forEach(key => {
        for (let i = 0; i < this.maxLength(data[key].core.cpu); i++) {
          const cpu = key;
          const cpuCoreType = data[key].core.cpu.type[i] || '--';
          const max = data[key].core.cpu.max_freq[i] || '--';
          const current = data[key].core.cpu.current_freq[i] || '--';
          const obj = {
            cpu,
            cpuType: cpuCoreType,
            max,
            current
          };
          cpuData.push(obj);
        }
        cores += data[key].core.cpu.cores[0];
        cpuType = data[key].core.cpu.type[0];
      });
    }
    this.titleDetail = [{
      title: this.i18n.sys.cpuType,
      data: cpuType,
    }, {
      title: this.i18n.sys.coreNum,
      data: cores,
    }];
    if (cpuData.length === 0) {
      this.ifCpuNoneData = true;
      this.CpuNoneData = this.i18n.common_term_task_nodata;
    } else {
      this.ifCpuNoneData = false;
    }
    this.cpuTotalNumber = cpuData.length;
    this.cpuContentData = {
      data: cpuData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    // cpuPackage numa节点配置
    const numaNodeData: any = [];
    if (data != null) {
      Object.keys(data).forEach(key => {
        for (let i = 0; i < this.maxLength(data[key].numa_info.numa_node); i++) {
          const node = data[key].numa_info.numa_node.name[i] || 'node' + i;
          const nodeNuclear = data[key].numa_info.numa_node.cpu_core[i] || '';
          const totalRAM = data[key].numa_info.numa_node.total_mem[i] || '';
          const idleRAM = data[key].numa_info.numa_node.free_mem[i] || '';
          const obj = {
            node,
            nodeNuclear,
            totalRAM,
            idleRAM
          };
          numaNodeData.push(obj);
        }
      });
    }

    this.numaNodeTotalNumber = numaNodeData.length;
    if (numaNodeData.length === 0) {
      this.ifNumaNoneData = true;
    } else {
      this.ifNumaNoneData = false;
    }
    this.numaNodeContentData = {
      data: numaNodeData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    // cpuPackage numa节点距离配置
    const numaNodeDistanceData: any = [];
    if (data != null) {
      Object.keys(data).forEach(key => {
        const numaDistance: any = [];
        Object.keys(data[key].numa_info.numa_dis).forEach(keyName => {
          if (keyName !== 'node_id') {
            numaDistance.push(keyName);
          }
        });
        numaDistance.forEach((item: any) => {
          const node = item;
          const zero = data[key].numa_info.numa_dis[item][0] ? data[key].numa_info.numa_dis[item][0] : '--';
          const one = data[key].numa_info.numa_dis[item][1] ? data[key].numa_info.numa_dis[item][1] : '--';
          const two = data[key].numa_info.numa_dis[item][2] ? data[key].numa_info.numa_dis[item][2] : '--';
          const three = data[key].numa_info.numa_dis[item][3] ? data[key].numa_info.numa_dis[item][3] : '--';
          const obj = {
            node,
            zero,
            one,
            two,
            three
          };
          numaNodeDistanceData.push(obj);
        });
      });
    }

    this.numaNodeDistanceTotalNumber = numaNodeDistanceData.length;
    if (numaNodeDistanceData.length === 0) {
      this.ifnumaNodeDistance = true;
    } else {
      this.ifnumaNodeDistance = false;
    }
    this.numaNodeDistanceContentData = {
      data: numaNodeDistanceData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

    // cpuPackage numa节点距离配置
    const numaBalanceData: any = [];
    if (data != null) {
      Object.keys(data).forEach(key => {
        if (numaBalanceData.length === 0) {
          data[key].numa_info.cfg_numa_balacing.forEach((val: any) => {
            const balance = val === 1 ? this.i18n.sys_cof.sum.open : this.i18n.sys_cof.sum.close;
            const obj = {
              balance,
            };
            numaBalanceData.push(obj);
          });
        }
      });
    }
    this.numaBalanceTotalNumber = numaBalanceData.length;
    if (numaBalanceData.length === 0) {
      this.ifnumaBalance = true;
    } else {
      this.ifnumaBalance = false;

    }
    this.numaBalanceContentData = {
      data: numaBalanceData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

  }

}
