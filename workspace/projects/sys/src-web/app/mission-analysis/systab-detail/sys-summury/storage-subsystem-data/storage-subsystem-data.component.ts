import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';


@Component({
  selector: 'app-storage-subsystem-data',
  templateUrl: './storage-subsystem-data.component.html',
  styleUrls: ['../sys-summury.component.scss']
})
export class StorageSubsystemDataComponent implements OnInit {

  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() storageData: any;
  public toggle = {   //  用于判断打开关闭
    storageSystem: false, // 存储子系统
    hardDisk: false,
    RAID: false,
  };
  public titleDetail: any = [];

  public i18n: any;
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

  ngOnInit() {
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
  public maxLength(data: any) {
    let num = 0;
    if (data != null) {
      Object.keys(data).forEach(item => {
        if (data[item].length > num) {
          num = data[item].length;
        }
      });
    }
    return num;
  }
  // 获取存储子系统数据
  public getStorageData(data: any) {

    // 存储子系统 硬盘
    const hardDiskData: any = [];
    let diskNum = 0;
    let totalSize = 0;
    if (data != null) {
      Object.keys(data).forEach(key => {
        if (key !== 'disk_raid') {
          data[key].storage.forEach((val: { name: string; model: string; cap: string; type: string; }) => {
            const name = val.name === '' ? '--' : val.name;
            const model = val.model === '' ? '--' : val.model;
            const capacity = val.cap === '' ? '--' : val.cap;
            const type = val.type === '' ? '--' : val.type;
            const obj = {
              name,
              model,
              capacity,
              type,
            };
            hardDiskData.push(obj);
          });
          if (data[key].introduction && data[key].introduction.totalSize) {
            totalSize += data[key].introduction.totalSize;
            diskNum += data[key].introduction.diskNum;
          }
        }
      });
    }
    this.titleDetail = [{
      title: this.i18n.sys_summary.storage_subsystem.diskNum + '：',
      data: diskNum,
    }, {
      title: this.i18n.sys_summary.storage_subsystem.storage_tatol + '：',
      data: totalSize + 'G',
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
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
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
