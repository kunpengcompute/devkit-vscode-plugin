import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
@Component({
    selector: 'app-network-config',
    templateUrl: './network-config.component.html',
    styleUrls: ['./network-config.component.scss']
})
export class NetworkConfigComponent implements OnInit {
    @Input() configItemData: any;

    i18n: any;
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
    numaTipStr: any;

    constructor(public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * downloadCsv
     */
    downloadCsv() {
        let str = this.i18n.sys_cof.sum.network_info.irq_aggre_title + '\n';
        this.columns.forEach(ele => {
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
        this.offloadTitle.forEach(ele => {
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
        this.queue.forEach(ele => {
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
        this.break.forEach(ele => {
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
     * maxLength
     * @param data data
     */
    public maxLength(data) {
        let num = 0;
        for (const item in data) {
            if (data[item].length > num) {
                num = data[item].length;
            }
        }
        return num;
    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        const data = this.configItemData.data;
        this.numaTipStr = this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ether_numa_irq_num.join('\n')
            : data.suggest.suggest_en_cfg_ether_numa_irq_num.join('\n');
        this.susppendTipStr = this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ethernet_susppend.join('\n')
            : data.suggest.suggest_en_cfg_ethernet_susppend.join('\n');
        this.offloadTipStr = this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ethernet_offload.join('\n')
            : data.suggest.suggest_en_cfg_ethernet_offload.join('\n');
        this.listTipStr = this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_ethernet_list.join('\n')
            : data.suggest.suggest_en_cfg_ethernet_list.join('\n');

        this.columns = [
            {
                title: this.i18n.sys_cof.sum.network_info.network_name,
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

        for (let i = 0; i < data.name.length; i++) {
            this.list.push({
                data1: data.name[i],
                data2: data.irq_aggre.adptive_rx[i],
                data3: data.irq_aggre.adptive_tx[i],
                data4: data.irq_aggre.rx_usecs[i],
                data5: data.irq_aggre.tx_usecs[i],
                data6: data.irq_aggre.rx_fram[i],
                data7: data.irq_aggre.tx_fram[i],
            });

        }

        this.offloadTitle = [
            {
                title: this.i18n.sys_cof.sum.network_info.network_name,

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
            });

        }

        this.queue = [
            {
                title: this.i18n.sys_cof.sum.network_info.network_name,

            },
            {
                title: this.i18n.sys_cof.sum.network_info.queue_num,
            },

        ];

        for (let i = 0; i < this.maxLength(data.queue); i++) {

            this.queueData.push({

                data1: data.name[i],
                data2: data.queue.queue_num[i],
            });


        }


        this.break = [
            {
                title: this.i18n.sys_cof.sum.network_info.network_queue,

            },
            {
                title: this.i18n.sys_cof.sum.network_info.numa_core.inter_id,
            },
            {
                title: this.i18n.sys_cof.sum.network_info.numa_core.inter_info,
            },
            {
                title: this.i18n.sys_cof.sum.network_info.numa_core.queue_send,
            },
        ];

        for (let i = 0; i < this.maxLength(data.numa_core); i++) {
            this.breakData.push({

                data1: data.numa_core.queue_name[i],
                data2: data.numa_core.irq_num ? data.numa_core.irq_num[i] : '',
                data3: data.numa_core.num_msg ? data.numa_core.num_msg[i] : '',
                data4: data.numa_core.queue_msg ? data.numa_core.queue_msg[i] : '',
            });

        }

    }

}
