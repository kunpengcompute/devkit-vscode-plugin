import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-storage-config',
    templateUrl: './storage-config.component.html',
    styleUrls: ['./storage-config.component.scss']
})
export class StorageConfigComponent implements OnInit {
    @Input() configItemData: any;

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
        link.download = this.i18n.sys_cof.sum.disk + '.csv';
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
                title: this.i18n.sys_cof.sum.disk_info.disk_name,
            },
            {
                title: this.i18n.sys_cof.sum.disk_info.disk_model,
            },
            {
                title: this.i18n.sys_cof.sum.disk_info.disk_cap,
            },
            {
                title: this.i18n.sys_cof.sum.disk_info.disk_type,
            }
        ];


        for (let i = 0; i < this.maxLength(data); i++) {
            this.list.push(
                {
                    deviceName: data.name ? data.name[i] : '',
                    model: data.model ? data.model[i] : '',
                    size: data.cap ? data.cap[i] : '',
                    type: data.type ? data.type[i] : '',
                }
            );

        }

    }


}
