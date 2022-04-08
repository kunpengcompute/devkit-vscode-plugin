import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-pcie-config',
    templateUrl: './pcie-config.component.html',
    styleUrls: ['./pcie-config.component.scss']
})
export class PcieConfigComponent implements OnInit {
    @Input() configItemData: any;


    tipStr = '';

    public i18n: any;
    public list: Array<any> = [];
    public columns: any;
    constructor(public i18nService: I18nService, public Axios: AxiosService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 下载
     */
    downloadCsv() {
        let str = '';
        this.columns.forEach(ele => {
            str += ele.title + ',';
        });
        str += '\n';
        this.list.forEach(val => {
            for (const item in val) {
                if (item !== 'suggest') {

                    str += '"' + val[item] + '"' + '\t,';
                }
            }
            str += '\n';
        });

        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.sys_cof.sum.pcie + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 计算最大长度
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
     * 组件初始化
     */
    ngOnInit() {
        const data = this.configItemData.data;
        this.tipStr = this.configItemData.language === 'zh'
            ? data.suggest.suggest_chs_cfg_pcie_max_payload.join('\n')
            : data.suggest.suggest_en_cfg_pcie_max_payload.join('\n');

        this.columns = [
            {
                title: this.i18n.sys_cof.sum.pcie_info.pcie_name,

            },
            {
                title: this.i18n.sys_cof.sum.pcie_info.hard_id,
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
            }
        ];

        for (let i = 0; i < this.maxLength(data); i++) {

            this.list.push({
                identifier: data.device[i],
                deviceID: data.hard_id[i],
                supportSpeed: data.max_speed[i],
                adoptionSpeed: data.cur_speed[i],
                maxPayload: data.max_load[i],
                details: data.detail_msg[i],

            });

        }

    }


}
