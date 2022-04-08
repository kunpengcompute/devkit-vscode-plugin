import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-storage-info-config',
    templateUrl: './storage-info-config.component.html',
    styleUrls: ['./storage-info-config.component.scss']
})
export class StorageInfoConfigComponent implements OnInit {
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
     * 下载
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
        link.download = this.i18n.sys_cof.sum.storage_msg + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 计算最大长度
     * @param data 数据
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
                title: this.i18n.sys_cof.sum.storage_msg_info.storange_name,

            },
            {
                title: this.i18n.sys_cof.sum.storage_msg_info.storage_file,
                tipStr: this.i18n.sys_cof.sum.storage_msg_info.storage_file_suggest,
            },
            {
                title: this.i18n.sys_cof.sum.storage_msg_info.storage_io,
                tipStr: this.i18n.sys_cof.sum.storage_msg_info.storage_io_suggest,
            },
        ];


        for (let i = 0; i < this.maxLength(data); i++) {
            this.list.push({
                name: data.blk_dev ? data.blk_dev[i] : '',
                parameter: data.cfg_disk_ahead ? data.cfg_disk_ahead[i] : '',
                mechanism: data.cfg_disk_scheduler ? data.cfg_disk_scheduler[i] : '',
            });

        }


    }

}
