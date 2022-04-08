import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-ram-config',
    templateUrl: './ram-config.component.html',
    styleUrls: ['./ram-config.component.scss']
})
export class RamConfigComponent implements OnInit {
    @Input() configItemData: any;

    public i18n: any;
    public list: Array<any> = [];
    public columns: any;
    public language: any;
    public mem = {
        total_mem: '',
        mem_dimm: '',
    };

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
        link.download = this.i18n.sys_cof.sum.mem + '.csv';
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
        this.mem.total_mem = data.normal_msg.total_mem ? data.normal_msg.total_mem[0] : '';
        this.mem.mem_dimm = data.normal_msg.mem_dimm ? data.normal_msg.mem_dimm : [];
        this.columns = [
            {
                title: this.i18n.sys_cof.sum.mem_info.slot_site,

            },
            {
                title: this.i18n.sys_cof.sum.mem_info.mem_cap,
            },
            {
                title: this.i18n.sys_cof.sum.mem_info.max_t,
            },
            {
                title: this.i18n.sys_cof.sum.mem_info.match_t,
            },
        ];

        for (let i = 0; i < this.maxLength(data.mem_list); i++) {

            this.list.push({

                slot: data.mem_list.pos[i],
                content: data.mem_list.cap[i],
                frequency: data.mem_list.max_speed[i],
                maxCapacity: data.mem_list.cfg_speed[i],
            });
        }

    }
}
