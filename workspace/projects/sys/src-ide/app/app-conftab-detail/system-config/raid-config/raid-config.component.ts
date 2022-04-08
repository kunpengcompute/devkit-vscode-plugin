import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-raid-config',
    templateUrl: './raid-config.component.html',
    styleUrls: ['./raid-config.component.scss']
})
export class RaidConfigComponent implements OnInit {
    @Input() configItemData: any;

    public items: any;
    public lists = [];

    i18n: any;
    constructor(public i18nService: I18nService, public Axios: AxiosService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 下载
     */
    downloadCsv() {
        let str = '';
        this.items.forEach(ele => {
            str += ele.title + ',';
        });
        str += '\n';
        this.lists.forEach(val => {
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
        link.download = this.i18n.sys_cof.sum.raid + '.csv';
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
        this.items = [
            {
                title: this.i18n.sys_cof.sum.raid_info.raid_id,

            },
            {
                title: this.i18n.sys_cof.sum.raid_info.raid_model,

            },
            {
                title: this.i18n.sys_cof.sum.raid_info.raid_size,
            },
        ];



        for (let i = 0; i < this.maxLength(data.raid_control); i++) {

            this.lists.push({

                data1: data.raid_control.raid_name[i],
                data2: data.raid_control.raid_id[i],
                data3: data.raid_control.raid_cache[i],
            });
        }

    }


}
