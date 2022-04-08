import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-file-config',
    templateUrl: './file-config.component.html',
    styleUrls: ['./file-config.component.scss']
})
export class FileConfigComponent implements OnInit {

    @Input() configItemData: any;


    i18n: any;
    public columns: any;
    public list = [];
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
        link.download = this.i18n.sys_cof.sum.file_system_msg + '.csv';
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
                title: this.i18n.sys_cof.sum.file_info.file_name,

            },
            {
                title: this.i18n.sys_cof.sum.file_info.file_type,
                tipStr: this.i18n.sys_cof.sum.file_info.file_type_suggest,
            },
            {
                title: this.i18n.sys_cof.sum.file_info.file_dot,
                tipStr: this.i18n.sys_cof.sum.file_info.file_dot_suggest,
            },
            {
                title: this.i18n.sys_cof.sum.file_info.file_msg,
            },
        ];





        for (let i = 0; i < this.maxLength(data); i++) {
            this.list.push(
                {
                    name: data.name[i],
                    type: data.file_type[i],
                    mountDot: data.mount_pos[i],
                    mountInfo: data.mount_info[i]
                }
            );

        }

    }


}
