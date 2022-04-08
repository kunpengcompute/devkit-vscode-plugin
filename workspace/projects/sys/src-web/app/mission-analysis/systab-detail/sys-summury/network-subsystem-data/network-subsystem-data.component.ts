import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-network-subsystem-data',
  templateUrl: './network-subsystem-data.component.html',
  styleUrls: ['../sys-summury.component.scss']
})
export class NetworkSubsystemDataComponent implements OnInit {

  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() networkData: any;
  public toggle = {   //  用于判断打开关闭
    networkSubsystem: false, // 网络子系统
    networkCard: false,
    networkPort: false,
  };
  public titleDetail: any = [];
  public language = 'zh';

  public i18n: any;
  // 网络子系统 网卡
  public networkTitle: Array<TiTableColumns> = [];
  public networkDisplayData: Array<TiTableRowData> = [];
  public networkContentData: TiTableSrcData;
  public networkCurrentPage = 1;
  public networkPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public networkTotalNumber = 0;
  public ifnetwork = true;
  public network = '';
  // 网络子系统 网口
  public networkPortTitle: Array<TiTableColumns> = [];
  public networkPortDisplayData: Array<TiTableRowData> = [];
  public networkPortContentData: TiTableSrcData;
  public networkPortCurrentPage = 1;
  public networkPortPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public networkPortTotalNumber = 0;
  public ifnetworkPortTotal = true;
  public networkPortTotal = '';

  ngOnInit() {
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }
    this.networkPortTotal = this.i18n.common_term_task_nodata2;
    // 网络子系统 title
    this.networkPortTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.name,
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.pcie_name,
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.hard_id,
      },
      {
        title: 'txkB/s',
      },
      {
        title: 'rxkB/s',
      },
      {
        title: 'txpck/s',
      },
      {
        title: 'rxpck/s',
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.max_rate,
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.cur_rate,
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.max_load,
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.pcie_details,
      },
    ];
    this.networkTitle = [{
      title: this.i18n.sys_summary.cpupackage_tabel.delay,
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.NUMAnode,
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.drive,
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.model,
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.equipment,
    }];
    if (JSON.stringify(this.networkData) !== '{}' && this.networkData) {
      this.getNetWorkData(this.networkData);
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

  // 获取网络子系统数据
  public getNetWorkData(data: any) {
    // 网络子系统 title
    this.networkPortTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.name,
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.pcie_name,
        tipStr: this.language === 'zh'
        ? data.suggest.suggest_chs_cfg_pcie_bus.join('\n') : data.suggest.suggest_en_cfg_pcie_bus.join('\n')
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.hard_id,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_pcie_class.join('\n') :
         data.suggest.suggest_en_cfg_pcie_class.join('\n')
      },
      {
        title: 'txkB/s',
      },
      {
        title: 'rxkB/s',
      },
      {
        title: 'txpck/s',
      },
      {
        title: 'rxpck/s',
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.max_rate,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_pcie_width.join('\n') :
         data.suggest.suggest_en_cfg_pcie_width.join('\n')
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.cur_rate,
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.max_load,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_pcie_max_payload.join('\n')
        : data.suggest.suggest_en_cfg_pcie_max_payload.join('\n')
      },
      {
        title: this.i18n.sys_cof.sum.pcie_info.pcie_details,
      },
    ];
    this.titleDetail = [{
      title: this.i18n.sys.netPort,
      data: data.cpu0.net_total_num,
    }];
    // 网络子系统 网口
    const networkPortData: any = [];
    if (data != null) {
      Object.keys(data).forEach(key => {
        if (key !== 'suggest') {
          if (data[key].network) {
            Object.keys(data[key].network).forEach(keyName => {
              if (keyName !== 'specs') {
                let obj = {};
                const name = keyName;
                const rxpck = data[key].network[keyName]['rxpck/s'];
                const txpck = data[key].network[keyName]['txpck/s'];
                const rxkB = data[key].network[keyName]['rxkB/s'];
                const txkB = data[key].network[keyName]['txkB/s'];
                const device = data[key].pic[keyName] ? data[key].pic[keyName].device : '--';
                const hardware = data[key].pic[keyName] ? data[key].pic[keyName].hard_id : '--';
                const maxEfficiency = data[key].pic[keyName] ? data[key].pic[keyName].max_speed : '--';
                const currentEfficiency = data[key].pic[keyName] ? data[key].pic[keyName].cur_speed : '--';
                const load = data[key].pic[keyName] ? data[key].pic[keyName].max_load : '--';
                const details = data[key].pic[keyName] ? data[key].pic[keyName].detail_msg : '--';
                obj = {
                  device,
                  hardware,
                  maxEfficiency,
                  currentEfficiency,
                  load,
                  details,
                  name,
                  rxpck,
                  txpck,
                  rxkB,
                  txkB,
                };
                networkPortData.push(obj);
              }
            });
          }
        }
      });
    }
    this.networkPortTotalNumber = networkPortData.length;
    if (networkPortData.length === 0) {
      this.ifnetworkPortTotal = true;
    } else {
      this.ifnetworkPortTotal = false;
    }
    this.networkPortContentData = {
      data: networkPortData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    let ifNoData = false;
    let networkData: any = [];
    if (data != null) {
      Object.keys(data).forEach(key => {
        if (data[key].rela && key !== 'suggest') {
          if (data[key].rela.config) {
            Object.keys(data[key].rela.config).forEach(tipName => {
              let obj = {};
              const name = data[key].rela.config[tipName].Latency ? data[key].rela.config[tipName].Latency : '--';
              const rxpck = data[key].rela.config[tipName].NUMAnode ? data[key].rela.config[tipName].NUMAnode : '--';
              const txpck = data[key].rela.config[tipName].Kerneldriverinuse
                ? data[key].rela.config[tipName].Kerneldriverinuse
                : '--';
              const rxkB = data[key].rela.config[tipName].Kernelmodules
                ? data[key].rela.config[tipName].Kernelmodules
                : '--';
              const txkB = data[key].rela.config[tipName].Systemperipheral
                ? data[key].rela.config[tipName].Systemperipheral
                : '--';
              obj = {
                name,
                rxpck,
                txpck,
                rxkB,
                txkB,
              };
              networkData.push(obj);
              if (data[key].rela.config === 'Not Support') {
                ifNoData = true;
              }
            });
          }
        }
      });
    }
    if (ifNoData) {
      networkData = [];
    }


    this.networkTotalNumber = networkData.length;

    if (networkData.length === 0) {
      this.ifnetwork = true;
      if (ifNoData) {
        this.network = this.i18n.sys_summary.cpupackage_tabel.virtual;
      } else {
        this.network = this.i18n.common_term_task_nodata2;
      }
    } else {
      this.ifnetwork = false;
    }

    this.networkContentData = {
      data: networkData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }


}
