import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { COLOR_THEME, VscodeService, currentTheme } from '../../../service/vscode.service';

/**
 * 接口数据的单项数据的数据结构
 */
interface NicBuffRawItem {
    nic_name: string;
    rx: number;
    tx: number;
}
@Component({
    selector: 'app-network-config-data',
    templateUrl: './network-config-data.component.html',
    styleUrls: ['../sys-summary.component.scss']
})
export class NetworkConfigDataComponent implements OnInit {

    @Input() configItemData: any;
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public columns: any;
    public breakData = [];
    public offloadTitle: any;
    public list: Array<any> = [];
    public offloadInfo: Array<any> = [];
    public queueData: Array<any> = [];
    public queue: any;
    public break: any;
    listTipStr: any;
    offloadTipStr: any;
    susppendTipStr: any;
    public titleDetail = [];
    numaTipStr: any;
    //  用于判断打开关闭
    public toggle = {
        // 网络子系统
        networkSubsystem: false,
        // 终端聚合
        polymerization: false,
        // offload
        offload: false,
        // 列队
        lineUp: false,
        // 中断NUMA绑核
        Interrupt: false,
        // 环形缓冲区
        netbuff: false,

    };
    public language = 'zh';
    // 网口配置 中断聚合
    public polymerizationTitle: Array<TiTableColumns> = [];
    public polymerizationDisplayData: Array<TiTableRowData> = [];
    public polymerizationContentData: TiTableSrcData;
    public polymerizationCurrentPage = 1;
    public polymerizationPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public polymerizationTotalNumber = 0;
    public ifpolymerization = true;
    public polymerization = '';
    // 网口配置 offload
    public offloadDataTitle: Array<TiTableColumns> = [];
    public offloadDisplayData: Array<TiTableRowData> = [];
    public offloadContentData: TiTableSrcData;
    public offloadCurrentPage = 1;
    public offloadPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public offloadTotalNumber = 0;
    public ifoffload = true;
    public offload = '';
    // 网口配置 列队
    public lineUpTitle: Array<TiTableColumns> = [];
    public lineUpDisplayData: Array<TiTableRowData> = [];
    public lineUpContentData: TiTableSrcData;
    public lineUpCurrentPage = 1;
    public lineUpPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public lineUpTotalNumber = 0;
    public iflineUp = true;
    public lineUp = '';

    // 网口配置 中断NUMA绑核
    public InterruptTitle: Array<TiTableColumns> = [];
    public InterruptDisplayData: Array<TiTableRowData> = [];
    public InterruptContentData: TiTableSrcData;
    public InterrupCurrentPage = 1;
    public InterrupPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public InterrupTotalNumber = 0;
    public ifInterrup = true;
    public Interrup = '';

    public nicBuff = {
        colums: ([] as Array<TiTableColumns>),
        displayData: ([] as Array<TiTableRowData>),
        srcData: ({
            data: ([] as NicBuffRawItem[]),
            state: { searched: false, sorted: false, paginated: false, }
        } as TiTableSrcData),
        currentPage: 1,
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
        totalNumber: 0,
        isNull: true,
    };

    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    constructor(public vscodeService: VscodeService, public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 下载csv
     */
    downloadCsv() {
        let str = this.i18n.sys_cof.sum.network_info.irq_aggre_title + '\n';
        this.columns.forEach((ele: { title: string; }) => {
            str += ele.title + ',';
        });
        str += '\n';
        this.list.forEach(val => {
            for (const item of Object.keys(val)) {
                let strEl1 = val[item];
                if (typeof (val[item]) === 'string' && val[item].indexOf(',') > -1) {
                    strEl1 = val[item].replace(/,/g, '，');
                } else if (val[item] instanceof Array) {
                    strEl1 = val[item].join('，');
                }
                str += strEl1 + '\t,';
            }
            str += '\n';
        });

        str += '\n' + this.i18n.sys_cof.sum.network_info.offload_title + '\n';
        this.offloadTitle.forEach((ele: { title: string; }) => {
            str += ele.title + ',';
        });
        str += '\n';
        this.offloadInfo.forEach(val => {
            for (const item of Object.keys(val)) {
                let strEl1 = val[item];
                if (typeof (val[item]) === 'string' && val[item].indexOf(',') > -1) {
                    strEl1 = val[item].replace(/,/g, '，');
                } else if (val[item] instanceof Array) {
                    strEl1 = val[item].join('，');
                }
                str += strEl1 + '\t,';
            }
            str += '\n';
        });

        str += '\n' + this.i18n.sys_cof.sum.network_info.queue_title + '\n';
        this.queue.forEach((ele: { title: string; }) => {
            str += ele.title + ',';
        });
        str += '\n';
        this.queueData.forEach(val => {
            for (const item of Object.keys(val)) {
                let strEl1 = val[item];
                if (typeof (val[item]) === 'string' && val[item].indexOf(',') > -1) {
                    strEl1 = val[item].replace(/,/g, '，');
                } else if (val[item] instanceof Array) {
                    strEl1 = val[item].join('，');
                }
                str += strEl1 + '\t,';
            }
            str += '\n';
        });

        str += '\n' + this.i18n.sys_cof.sum.network_info.numa_core_title + '\n';
        this.break.forEach((ele: { title: string; }) => {
            str += ele.title + ',';
        });
        str += '\n';
        this.breakData.forEach(val => {
            for (const item of Object.keys(val)) {
                str += '"' + val[item] + '"' + '\t,';
            }
            str += '\n';
        });

        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.sys_cof.sum.network + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        this.initNicBuffProps();
        this.polymerization = this.i18n.common_term_task_nodata2;
        this.offload = this.i18n.common_term_task_nodata2;
        this.lineUp = this.i18n.common_term_task_nodata2;
        this.Interrup = this.i18n.common_term_task_nodata2;
        this.columns = [
            {
                title: this.i18n.sys_summary.cpupackage_tabel.networkName,
            },
            {
                title: 'adaptive-rx',
                tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.adaptive_rx,
            },
            {
                title: 'adaptive-tx',
                tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.adaptive_tx,
            },
            {
                title: 'rx-usecs',
                tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.rx_usecs,
            },
            {
                title: 'tx-usecs',
                tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.tx_usecs,
            },
            {
                title: 'rx-frames',
                tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.rx_frames,
            },
            {
                title: 'tx-frames',
                tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.tx_frames,
            },
        ];
        this.polymerizationTitle = this.columns;
        this.offloadTitle = [
            {
                title: this.i18n.sys_summary.cpupackage_tabel.networkName,

            },
            {
                title: 'rx-checksumming',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.rx_checksumming,
            },
            {
                title: 'tx-checksumming',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.tx_checksumming,
            },
            {
                title: 'scatter-gather',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.scatter_gather,
            },
            {
                title: 'TSO',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.TSO,
            },
            {
                title: 'UFO',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.UFO,
            },
            {
                title: 'LRO',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.LRO,
            },
            {
                title: 'GSO',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.GSO,
            },
            {
                title: 'GRO',
                tipStr: this.i18n.sys_cof.sum.network_info.offload.GRO,
            },

        ];
        this.offloadDataTitle = this.offloadTitle;
        this.queue = [
            {
                title: this.i18n.sys_cof.sum.network_info.network_name,

            },
            {
                title: this.i18n.sys_cof.sum.network_info.queue_num,
            },

        ];
        this.lineUpTitle = this.queue;
        this.break = [
            {
                title: this.i18n.sys_cof.sum.network_info.numa_core.network_name,

            },
            {
                title: this.i18n.sys_cof.sum.network_info.numa_core.inter_id,
            },
            {
                title: this.i18n.sys_cof.sum.network_info.numa_core.inter,
                tipStr: this.i18n.sys_cof.sum.network_info.numa_core.inter_info_tip
            },
            {
                title: 'xps/rps',
            },
        ];
        this.InterruptTitle = this.break;
        if (JSON.stringify(this.configItemData.data) === '{}') {
            return;
        }
        const data = this.configItemData.data;
        this.titleDetail = [{
            title: this.i18n.sys_summary.panorama.tip.net_port_num,
            data: data.hard_network_num || '--',
        }];
        this.numaTipStr =
          this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ether_numa_irq_num.join('\n')
            : data.suggest.suggest_en_cfg_ether_numa_irq_num.join('\n');
        this.susppendTipStr =
          this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ethernet_susppend.join('\n')
            : data.suggest.suggest_en_cfg_ethernet_susppend.join('\n');
        this.offloadTipStr =
          this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ethernet_offload.join('\n')
            : data.suggest.suggest_en_cfg_ethernet_offload.join('\n');
        this.listTipStr =
          this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ethernet_list.join('\n')
            : data.suggest.suggest_en_cfg_ethernet_list.join('\n');

        for (let i = 0; i < data.name.length; i++) {
          this.list.push({
            data1: data.name[i],
            data2:
              data.irq_aggre.adptive_rx[i] === 'Not Support'
                ? this.i18n.sys_summary.cpupackage_tabel.virtual
                : data.irq_aggre.adptive_rx[i]
                ? data.irq_aggre.adptive_rx[i]
                : '--',
            data3:
              data.irq_aggre.adptive_tx[i] === 'Not Support'
                ? this.i18n.sys_summary.cpupackage_tabel.virtual
                : data.irq_aggre.adptive_tx[i]
                ? data.irq_aggre.adptive_tx[i]
                : '--',
            data4:
              data.irq_aggre.rx_usecs[i] === 'Not Support'
                ? this.i18n.sys_summary.cpupackage_tabel.virtual
                : data.irq_aggre.rx_usecs[i]
                ? data.irq_aggre.rx_usecs[i]
                : '--',
            data5:
              data.irq_aggre.tx_usecs[i] === 'Not Support'
                ? this.i18n.sys_summary.cpupackage_tabel.virtual
                : data.irq_aggre.tx_usecs[i]
                ? data.irq_aggre.tx_usecs[i]
                : '--',
            data6:
              data.irq_aggre.rx_fram[i] === 'Not Support'
                ? this.i18n.sys_summary.cpupackage_tabel.virtual
                : data.irq_aggre.rx_fram[i]
                ? data.irq_aggre.rx_fram[i]
                : '--',
            data7:
              data.irq_aggre.tx_fram[i] === 'Not Support'
                ? this.i18n.sys_summary.cpupackage_tabel.virtual
                : data.irq_aggre.tx_fram[i]
                ? data.irq_aggre.tx_fram[i]
                : '--',
          });
        }
        if (data.irq_aggre.adptive_rx[0] === 'Not Support') {
            this.list = [];
        }
        this.polymerizationTotalNumber = this.list.length;
        if (this.list.length === 0) {
            this.ifpolymerization = true;
            if (data.irq_aggre.adptive_rx[0] === 'Not Support') {
                this.polymerization = this.i18n.sys_summary.cpupackage_tabel.virtual;
            } else {
                this.polymerization = this.i18n.common_term_task_nodata2;
            }
        } else {
            this.ifpolymerization = false;
        }
        this.polymerizationContentData = {
            data: this.list,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
        let nameArr = [];
        data.suggestion.forEach(element => {
            nameArr = nameArr.concat(Object.keys(element));
        });
        const lroSuggestionList = data.lro_suggestion ? data.lro_suggestion.lro_lis : [];
        const lroSuggestion = data.lro_suggestion ? (
                this.language === 'zh'
                ? data.lro_suggestion.iface_lro_switch.suggest_chs
                : data.lro_suggestion.iface_lro_switch.suggest_en
            ) : undefined;
        for (let i = 0; i < this.maxLength(data.offload); i++) {
            this.offloadInfo.push({
                data1: data.name[i],
                data2: data.offload.rx_check[i],
                data3: data.offload.tx_check[i],
                data4: data.offload.scat_gather[i],
                data5: data.offload.tso[i],
                data6: data.offload.ufo[i],
                data7: data.offload.lro[i],
                data8: data.offload.gso[i],
                data9: data.offload.gro[i],
                tipStr: nameArr.indexOf(data.name[i]) === -1 ? 'NULL' : this.language === 'zh' ?
                    data.suggestion[nameArr.indexOf(data.name[i])][data.name[i]].suggest_chs :
                    data.suggestion[nameArr.indexOf(data.name[i])][data.name[i]].suggest_en,
                lroSuggestion: lroSuggestionList.includes(data.name[i]) ? lroSuggestion : undefined,
            });
        }
        this.offloadTotalNumber = this.offloadInfo.length;
        if (this.offloadInfo.length === 0) {
            this.ifoffload = true;
        } else {
            this.ifoffload = false;
        }
        this.offloadContentData = {
            data: this.offloadInfo,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };

        for (let i = 0; i < this.maxLength(data.queue); i++) {
            this.queueData.push({
                data1: data.name[i],
                data2: data.queue.queue_num[i],
            });
        }
        if (data.queue.queue_num[0] === 'Not Support') {
            this.queueData = [];
        }
        this.lineUpTotalNumber = this.queueData.length;
        if (this.queueData.length === 0) {
            this.iflineUp = true;
            if (data.queue.queue_num[0] === 'Not Support') {
                this.lineUp = this.i18n.sys_summary.cpupackage_tabel.queueNoData;
            } else {
                this.lineUp = this.i18n.common_term_task_nodata2;
            }
        } else {
            this.iflineUp = false;
        }
        this.lineUpContentData = {
            data: this.queueData,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };

        for (let i = 0; i < data.numa_core.queue_name.length; i++) {
            this.breakData.push({
              data1:
                data.numa_core.queue_name[i] === 'Not Support'
                  ? this.i18n.sys_summary.cpupackage_tabel.virtual
                  : data.numa_core.queue_name[i] === 0 ||
                    data.numa_core.queue_name[i]
                  ? data.numa_core.queue_name[i]
                  : '--',
              data2:
                data.numa_core.irq_num[i] === 'Not Support'
                  ? this.i18n.sys_summary.cpupackage_tabel.virtual
                  : data.numa_core.irq_num[i] === 0 || data.numa_core.irq_num[i]
                  ? data.numa_core.irq_num[i]
                  : '--',
              data3:
                data.numa_core.num_msg[i] === 'Not Support'
                  ? this.i18n.sys_summary.cpupackage_tabel.virtual
                  : data.numa_core.num_msg[i] === 0 || data.numa_core.num_msg[i]
                  ? data.numa_core.num_msg[i]
                  : '--',
              data4:
                data.numa_core.queue_msg[i] === 'Not Support'
                  ? this.i18n.sys_summary.cpupackage_tabel.virtual
                  : data.numa_core.queue_msg[i] === 0 ||
                    data.numa_core.queue_msg[i]
                  ? data.numa_core.queue_msg[i]
                  : '--',
            });
        }
        if (data.numa_core.queue_name[0] === 'Not Support') {
            this.breakData = [];
        }
        this.InterrupTotalNumber = this.breakData.length;
        if (this.breakData.length === 0) {
            this.ifInterrup = true;
            if (data.numa_core.queue_name[0] === 'Not Support') {
                this.Interrup = this.i18n.sys_summary.cpupackage_tabel.virtual;
            } else {
                this.Interrup = this.i18n.common_term_task_nodata2;
            }
        } else {
            this.ifInterrup = false;
        }
        this.InterruptContentData = {
            data: this.breakData,
            state: {
                // 源数据未进行搜索处理
                searched: false,
                // 源数据未进行排序处理
                sorted: false,
                // 源数据未进行分页处理
                paginated: false
            }
        };

    }
    /**
     * 初始化 缓冲区各个属性
     */
    public initNicBuffProps() {
        const buffer: NicBuffRawItem[] = this.configItemData.data && this.configItemData.data.buffer;
        // 数据有效判定
        const isValid = buffer !== null && Array.isArray(buffer);
        if (!isValid) { return; }
        // 表头
        this.nicBuff.colums = [
            { title: this.i18n.sys_cof.sum.network_info.nic_buff.nic_name, tipStr: '', },
            { title: 'TX(Byte)', tipStr: this.i18n.sys_cof.sum.network_info.nic_buff.tx_buff_size, },
            { title: 'RX(Byte)', tipStr: this.i18n.sys_cof.sum.network_info.nic_buff.rx_buff_size, },
        ];
        // 赋值
        this.nicBuff.srcData.data = buffer;
        this.nicBuff.totalNumber = buffer.length;
        this.nicBuff.isNull = buffer.length < 1;
    }
}
