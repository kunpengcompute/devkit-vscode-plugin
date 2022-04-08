import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
    selector: 'app-virtual-machin-config',
    templateUrl: './virtual-machin-config.component.html',
    styleUrls: ['./virtual-machin-config.component.scss']
})
export class VirtualMachinConfigComponent implements OnInit {
    @Input() configItemData: any;
    @ViewChild('mask4', { static: false }) mask4;

    public i18n: any;
    public items: any;

    public displayedLog: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public logList: TiTableSrcData;

    public columsLog: Array<TiTableColumns> = [];
    public kvmInfo: any = { title: '', content: [] };

    constructor(public i18nService: I18nService, public Axios: AxiosService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 显示对话框
     * @param index 索引
     * @param key key
     */
    public showDialog(index, key) {
        this.mask4.open();
        this.kvmInfo.title = this.configItemData.data.virsual.kvm_info.cfg_xml_list[index].slice(13);
        this.kvmInfo.content = this.configItemData.data.virsual.kvm_info[key];
    }

    /**
     * 下载
     */
    downloadCsv() {
        let str = '';
        this.items.forEach(el => {
            str += el.title + ',' + '"' + el.data + '"' + '\t\n';
        });

        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.sys_cof.sum.docker + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        const data = this.configItemData.data.virsual;


        this.items = [
            {
                title: this.i18n.sys_cof.sum.virtual_info.virtual_os,
                data: data.version,
            },
            {
                title: this.i18n.sys_cof.sum.virtual_info.virtual_docker,
                data: data.docker_info,
            },
            {
                title: this.i18n.sys_cof.sum.virtual_info.virtual_config,
                data: data.kvm_info.cfg_xml_list,
            },

        ];


    }




}
