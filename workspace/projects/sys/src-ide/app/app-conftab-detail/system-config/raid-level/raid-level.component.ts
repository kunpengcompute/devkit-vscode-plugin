import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';
@Component({
    selector: 'app-raid-level',
    templateUrl: './raid-level.component.html',
    styleUrls: ['./raid-level.component.scss']
})
export class RaidLevelComponent implements OnInit {
    @Input() configItemData: any;
    public columns = [

    ];
    public list = [

    ];
    i18n: any;
    constructor(public i18nService: I18nService, public Axios: AxiosService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 下载Csv
     */
    downloadCsv() {
        let str = '';
        this.columns.forEach(ele => {
            str += ele.title + ',';
        });
        str += '\n';
        this.list.forEach(val => {
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
        link.download = this.i18n.sys_cof.sum.raid_level + '.csv';
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
        this.columns = [
            {
                title: this.i18n.sys_cof.sum.raid_level_info.volume_name,

            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.volume_id,
                tipStr: '123231'
            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.raid_id,
                tipStr: '123231'
            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.raid_level,
                tipStr: '123231'
            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.volume_size,

            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.volume_read,

            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.volume_write,

            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.volume_cache,

            },
            {
                title: this.i18n.sys_cof.sum.raid_level_info.cachecade,

            },
        ];



        for (let i = 0; i < this.maxLength(data.raid_level); i++) {

            this.list.push({

                data1: data.raid_level.disk_name[i],
                data2: data.raid_level.disk_id[i],
                data3: data.raid_level.raid_id[i],
                data4: data.raid_level.raid_level[i],
                data5: data.raid_level.lgc_band[i],
                data6: data.raid_level.lgc_read[i],
                data7: data.raid_level.lgc_write[i],
                data8: data.raid_level.lgc_cache[i],
                data9: data.raid_level.cache_flag[i],
            });
        }



    }

}
