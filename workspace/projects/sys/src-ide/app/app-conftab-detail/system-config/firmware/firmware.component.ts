import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-firmware',
    templateUrl: './firmware.component.html',
    styleUrls: ['./firmware.component.scss']
})

export class FirmwareComponent implements OnInit {
    @Input() configItemData: any;
    public items: any;
    public en: Array<any> = [];
    i18n: any;
    constructor(public i18nService: I18nService, public Axios: AxiosService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 下载表格
     * @param data 表格数据
     */
    downloadCsv(data) {
        let str = '';
        data.forEach(val => {
            val.forEach(el => {
                str += el.title + ',' + '"' + el.data + '"' + '\t\n';
            });
        });

        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.sys_cof.sum.firmware + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        const data = this.configItemData.data;
        const language = this.configItemData.language;
        this.items = [
            [{
                title: this.i18n.sys_cof.sum.firmware_info.bios_version,
                data: data.get_firm_ver.BIOS || '--',
            },
            {
                title: this.i18n.sys_cof.sum.firmware_info.bmc_version,
                data: data.get_firm_ver.BMC || '--',
            }],

        ];

        for (const nic in data.get_firm_ver) {
            if (nic !== 'BIOS' && nic !== 'BMC') {
                this.en.push({
                    title: nic,
                    data: data.get_firm_ver[nic],
                });
            }
        }
        this.en.sort((a, b) => {
            return (a.title.localeCompare(b.title, { numeric: true }));
        });
        this.items.push(this.en);

    }

}
