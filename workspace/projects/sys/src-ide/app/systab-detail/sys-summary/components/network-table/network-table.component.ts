import { Component, OnInit, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../../../service/i18n.service';
import { COLOR_THEME, VscodeService, currentTheme } from '../../../../service/vscode.service';

@Component({
    selector: 'app-network-table',
    templateUrl: './network-table.component.html',
    styleUrls: ['./network-table.component.scss']
})
export class NetworkTableComponent implements OnInit {
    @Input() networkData: any;
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public language = 'zh';
    @Input() cpuName: any;
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

    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    constructor(public vscodeService: VscodeService, public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        if (self.webviewSession.getItem('language').indexOf('en') !== -1) {
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
        if (JSON.stringify(this.networkData) !== '{}') {
            this.getData(this.networkData);
        }
    }

    /**
     * 获取数据长度
     * @param data 数据
     */
    public maxLength(data: any) {
        let num = 0;
        for (const item in data) {
            if (data[item].length > num) {
                num = data[item].length;
            }
        }
        return num;
    }

    /**
     * 获取网络数据
     * @param data 网咯数据
     */
    public getData(data) {
        // 网络子系统 网口
        // 网络子系统 title
        this.networkPortTitle = [
          {
            title: this.i18n.sys_summary.cpupackage_tabel.name,
          },
          {
            title: this.i18n.sys_cof.sum.pcie_info.pcie_name,
            tipStr:
              this.language === 'zh'
                ? data.suggest.suggest_chs_cfg_pcie_bus.join('\n')
                : data.suggest.suggest_en_cfg_pcie_bus.join('\n'),
          },
          {
            title: this.i18n.sys_cof.sum.pcie_info.hard_id,
            tipStr:
              this.language === 'zh'
                ? data.suggest.suggest_chs_cfg_pcie_class.join('\n')
                : data.suggest.suggest_en_cfg_pcie_class.join('\n'),
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
            tipStr:
              this.language === 'zh'
                ? data.suggest.suggest_chs_cfg_pcie_width.join('\n')
                : data.suggest.suggest_en_cfg_pcie_width.join('\n'),
          },
          {
            title: this.i18n.sys_cof.sum.pcie_info.cur_rate,
          },
          {
            title: this.i18n.sys_cof.sum.pcie_info.max_load,
            tipStr:
              this.language === 'zh'
                ? data.suggest.suggest_chs_cfg_pcie_max_payload.join('\n')
                : data.suggest.suggest_en_cfg_pcie_max_payload.join('\n'),
          },
          {
            title: this.i18n.sys_cof.sum.pcie_info.pcie_details,
          },
        ];
        // 网络子系统 网口
        const networkPortData = [];

        for (const keyName of Object.keys(data[this.cpuName].network)) {
            let obj = {};
            const name = keyName;
            const rxpck = data[this.cpuName].network[keyName]['rxpck/s'];
            const txpck = data[this.cpuName].network[keyName]['txpck/s'];
            const rxkB = data[this.cpuName].network[keyName]['rxkB/s'];
            const txkB = data[this.cpuName].network[keyName]['txkB/s'];
            const device = data[this.cpuName].pic[keyName].device;
            const hardware = data[this.cpuName].pic[keyName].hard_id;
            const maxEfficiency = data[this.cpuName].pic[keyName].max_speed;
            const currentEfficiency = data[this.cpuName].pic[keyName].cur_speed;
            const load = data[this.cpuName].pic[keyName].max_load;
            const details = data[this.cpuName].pic[keyName].detail_msg;
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

        let networkData = [];
        if (data[this.cpuName].rela.config) {
            for (const key of Object.keys(data[this.cpuName].rela.config)) {
              let obj = {};
              const name = data[this.cpuName].rela.config[key].Latency
                ? data[this.cpuName].rela.config[key].Latency
                : '--';
              const rxpck = data[this.cpuName].rela.config[key].NUMAnode
                ? data[this.cpuName].rela.config[key].NUMAnode
                : '--';
              const txpck = data[this.cpuName].rela.config[key]
                .Kerneldriverinuse
                ? data[this.cpuName].rela.config[key].Kerneldriverinuse
                : '--';
              const rxkB = data[this.cpuName].rela.config[key].Kernelmodules
                ? data[this.cpuName].rela.config[key].Kernelmodules
                : '--';
              const txkB = data[this.cpuName].rela.config[key].Systemperipheral
                ? data[this.cpuName].rela.config[key].Systemperipheral
                : '--';
              obj = {
                name,
                rxpck,
                txpck,
                rxkB,
                txkB,
              };
              networkData.push(obj);
              if (data[this.cpuName].rela.config === 'Not Support') {
                ifNoData = true;
              }
            }
        }
        if (ifNoData) {
            networkData = [];
        }
        this.networkPortTotalNumber = networkPortData.length;
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
