import { Component, OnInit, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import {COLOR_THEME, currentTheme, VscodeService} from '../../../service/vscode.service';

@Component({
    selector: 'app-storage-subsystem-data',
    templateUrl: './storage-subsystem-data.component.html',
    styleUrls: ['../sys-summary.component.scss']
})
export class StorageSubsystemDataComponent implements OnInit {

    constructor(public vscodeService: VscodeService, public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }
    @Input() storageData: any;
    //  用于判断打开关闭
    public toggle = {
        // 存储子系统
        storageSystem: false,
        hardDisk: false,
        RAID: false,
    };
    public titleDetail = [];

    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    // 存储子系统 硬盘
    public hardDiskTitle: Array<TiTableColumns> = [];
    public hardDiskDisplayData: Array<TiTableRowData> = [];
    public hardDiskContentData: TiTableSrcData;
    public hardDiskCurrentPage = 1;
    public hardDiskPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public hardDiskTotalNumber = 0;
    public ifhardDisk = true;
    public hardDisk = '';
    // 存储子系统 RAID控制卡
    public RAIDTitle: Array<TiTableColumns> = [];
    public RAIDDisplayData: Array<TiTableRowData> = [];
    public RAIDContentData: TiTableSrcData;
    public RAIDCurrentPage = 1;
    public RAIDPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public RAIDTotalNumber = 0;
    public ifRAIDTitle = true;
    public RAIDTitleData = '';

    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    /**
     * 组件初始化方法
     */
    ngOnInit() {
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.hardDisk = this.i18n.common_term_task_nodata2;
        this.RAIDTitleData = this.i18n.common_term_task_nodata2;
        // 存储子系统 title
        this.hardDiskTitle = [
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
            },
        ];
        this.RAIDTitle = [
            {
                title: this.i18n.sys_cof.sum.raid_info.raid_id,
                width: '25%'
            },
            {
                title: this.i18n.sys_cof.sum.raid_info.raid_model,
                width: '25%'
            },
            {
                title: this.i18n.sys_cof.sum.raid_info.raid_size,
                width: '50%'
            },
        ];
        if (JSON.stringify(this.storageData) !== '{}') {
            this.getStorageData(this.storageData);
        }

    }

    /**
     * 获取数据长度
     * @param data 数据
     */
    public maxLength(data: any) {
        let num = 0;
        for (const item in data) {
            if (data[item].length > num) {
                num = data[item].length;
            }
        }
        return num;
    }

    /**
     * 获取存储子系统数据
     * @param data 数据
     */
    public getStorageData(data) {
        // 存储子系统 硬盘
        const hardDiskData = [];
        let diskNum = 0;
        let totalSize = 0;
        for (const key in data) {
            if (key !== 'disk_raid') {
                for (const item of data[key].storage) {
                    const name = item.name === '' ? '--' : item.name;
                    const model = item.model === '' ? '--' : item.model;
                    const capacity = item.cap === '' ? '--' : parseInt(item.cap, 10);
                    const type = item.type === '' ? '--' : item.type;
                    const obj = {
                        name,
                        model,
                        capacity,
                        type,
                    };
                    hardDiskData.push(obj);
                }
                if (data[key].introduction && data[key].introduction.totalSize) {
                    totalSize += data[key].introduction.totalSize;
                    diskNum += data[key].introduction.diskNum;
                }
            }
        }
        this.titleDetail = [{
            title: this.i18n.sys_summary.storage_subsystem.disk_num,
            data: diskNum,
        }, {
            title: this.i18n.sys_summary.storage_subsystem.storage_tatol,
            data: totalSize + ' GB',
        }];

        this.hardDiskTotalNumber = hardDiskData.length;
        if (hardDiskData.length === 0) {
            this.ifhardDisk = true;
        } else {
            this.ifhardDisk = false;
        }
        this.hardDiskContentData = {
            data: hardDiskData,
            state: {
                // 源数据未进行搜索处理
                searched: false,
                // 源数据未进行排序处理
                sorted: false,
                // 源数据未进行分页处理
                paginated: false
            }
        };
        // 存储子系统 RAID控制卡
        const RAIDData = [];
        if (data.disk_raid !== 'None') {
            if (data.disk_raid.raid_control.raid_id[0] === 'Not Support') {
            } else if (data.disk_raid.raid_control.raid_id.length === 0) {
            } else {
                for (let i = 0; i < data.disk_raid.raid_control.raid_id.length; i++) {
                    const Controller = data.disk_raid.raid_control.raid_name[i];
                    const model = data.disk_raid.raid_control.raid_id[i];
                    const size = data.disk_raid.raid_control.raid_cache[i];
                    const obj = {
                        Controller,
                        model,
                        size,
                    };
                    RAIDData.push(obj);
                }
            }
        }
        this.RAIDTotalNumber = RAIDData.length;
        if (RAIDData.length === 0) {
            this.ifRAIDTitle = true;
            if (data.disk_raid.raid_control.raid_id[0] === 'Not Support') {
                this.RAIDTitleData = this.i18n.sys_summary.cpupackage_tabel.virtual;
            } else {
                this.RAIDTitleData = this.i18n.common_term_task_nodata2;
            }
        } else {
            this.ifRAIDTitle = false;
        }
        this.RAIDContentData = {
            data: RAIDData,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }

}
