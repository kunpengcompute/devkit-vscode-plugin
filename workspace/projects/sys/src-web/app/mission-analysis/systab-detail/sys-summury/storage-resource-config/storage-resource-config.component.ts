import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';


@Component({
  selector: 'app-storage-resource-config',
  templateUrl: './storage-resource-config.component.html',
  styleUrls: ['../sys-summury.component.scss']
})
export class StorageResourceConfigComponent implements OnInit {

  @Input() taskid: any;
  @Input() nodeid: any;
  public i18n: any;
  public Raid = { title: '', data: '' };
  public storage = { title: '', data: '' };
  public fill = { title: '', data: '' };
  public toggle = {   //  用于判断打开关闭
    storageResource: false, // 存储资源配置
    storageInformation: false, // 存储信息
    fileInformation: false, // 文件系统信息
    raidControlCard: false, // RAID控制卡
    raidConfig: false // RAID控制卡
  };
  public noDataMsg = '';
  public raidTipStr = '';
  public language = 'zh';

  // 存储资源配置 存储信息
  public storageInformationTitle: Array<TiTableColumns> = [];
  public storageInformationDisplayData: Array<TiTableRowData> = [];
  public storageInformationContentData: TiTableSrcData;
  public storageInformationCurrentPage = 1;
  public storageInformationPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public storageInformationTotalNumber = 0;
  public ifstorage = true;
  public storageInformation = '';
  // 文件信息
  public filleInformationTitle: Array<TiTableColumns> = [];
  public filleInformationDisplayData: Array<TiTableRowData> = [];
  public filleInformationContentData: TiTableSrcData;
  public filleInformationCurrentPage = 1;
  public filleInformationPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public filleInformationTotalNumber = 0;
  public iffille = true;
  public fille = '';
  // Raid级别
  public raidControlCardTitle: Array<TiTableColumns> = [];
  public raidControlCardDisplayData: Array<TiTableRowData> = [];
  public raidControlCardContentData: TiTableSrcData;
  public raidControlCardCurrentPage = 1;
  public raidControlCardPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public ifraid = true;
  public raid = '';
  public raidConfigData = [{ title: 'Personalities', data: '--' }, { title: 'unuseddevices', data: '--' }];
  public raidControlCardTotalNumber = 0;
  constructor(public i18nService: I18nService, public Axios: AxiosService, ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }
    this.raid = this.i18n.common_term_task_nodata2;
    this.storageInformation = this.i18n.common_term_task_nodata2;
    this.fille = this.i18n.common_term_task_nodata2;
    // RAID
    this.raidControlCardTitle = [
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_name,
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_id,
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.raid_id,
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.raid_level,
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
    // 存储信息
    this.storageInformationTitle = [
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storange_name,
      },
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storage_file,
      },
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storage_io,
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.Affinity,
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.line_up,
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.depth,
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.IO,
      },
    ];
    //  文件系统信息
    this.filleInformationTitle = [
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
    this.Raid = {
      title: this.i18n.sys_summary.cpupackage_tabel.raid_group,
      data: '--'
    };
    this.storage = {
      title: this.i18n.sys_summary.cpupackage_tabel.stroug_volume,
      data: '--'
    };
    this.fill = {
      title: this.i18n.sys_summary.cpupackage_tabel.fill_name,
      data: '--'
    };
    this.getConfigData({ level1: 'soft', level2: 'storage_msg' });
    this.getConfigData({ level1: 'soft', level2: 'file_system_msg' });
    this.getConfigData({ level1: 'soft', level2: 'raid' });

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

  public getConfigData(item: any) {
    const params = {
      'node-id': this.nodeid,
      'query-type': item.level1,
      'query-target': item.level2,
    };
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-config/`,
    { params, headers: {
      showLoading: false,
    }})
      .then((resp: any) => {
        this.noDataMsg = resp.message;
        if (resp.data && Object.keys(resp.data).length > 0) {
          if (item.level2 === 'storage_msg') {
            const obj = {
              title: this.i18n.sys_summary.cpupackage_tabel.stroug_volume,
              data: resp.data.storage_num || '--'
            };
            this.storage = obj;
            this.getStorageInformationData(resp.data);
          } else if (item.level2 === 'file_system_msg') {
            this.getFileInformationData(resp.data);
            const obj = {
              title: this.i18n.sys_summary.cpupackage_tabel.fill_name,
              data: resp.data.file_num || '--'
            };
            this.fill = obj;
          } else if (item.level2 === 'raid') {
            const obj = {
              title: this.i18n.sys_summary.cpupackage_tabel.raid_group,
              data: resp.data.raid_num === 0 ? resp.data.raid_num : resp.data.raid_num ? resp.data.raid_num : '--'
            };
            this.Raid = obj;
            this.getRaidControlCardData(resp.data);
          }
        } else {
        }
      });
  }

  // RAID级别
  public getRaidControlCardData(data: any) {
    const raidControlCardData: any = [];
    this.raidTipStr = this.language === 'zh' ? data.suggest.suggest_chs_cfg_raid_level.join('\n')
    : data.suggest.suggest_en_cfg_raid_level.join('\n');
    data.raid_level.disk_name.forEach((element: any, i: any) => {
      let obj = {};
      if (data.raid_level.disk_name[0] === 'Not Support') {
      } else if (data.raid_level.disk_name.length === 0) {
      } else {
        obj = {
          data1: data.raid_level.disk_name[i] ? data.raid_level.disk_name[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.disk_name[i] : '--',
          data2: data.raid_level.disk_id[i] ? data.raid_level.disk_id[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.disk_id[i] : '--',
          data3: data.raid_level.raid_id[i] ? data.raid_level.raid_id[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.raid_id[i] : '--',
          data4: data.raid_level.raid_level[i] ? data.raid_level.raid_level[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.raid_level[i] : '--',
          data5: data.raid_level.lgc_band[i] ? data.raid_level.lgc_band[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.lgc_band[i] : '--',
          data6: data.raid_level.lgc_read[i] ? data.raid_level.lgc_read[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.lgc_read[i] : '--',
          data7: data.raid_level.lgc_write[i] ? data.raid_level.lgc_write[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.lgc_write[i] : '--',
          data8: data.raid_level.lgc_cache[i] ? data.raid_level.lgc_cache[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.lgc_cache[i] : '--',
          data9: data.raid_level.cache_flag[i] ? data.raid_level.cache_flag[i] === 'Not Support'
          ? this.i18n.sys_summary.cpupackage_tabel.virtual : data.raid_level.cache_flag[i] : '--',
        };
        raidControlCardData.push(obj);
      }
    });
    this.raidControlCardTotalNumber = raidControlCardData.length;
    if (raidControlCardData.length === 0) {
      this.ifraid = true;
      if (data.raid_level.disk_name[0] === 'Not Support') {
        this.raid = this.i18n.sys_summary.cpupackage_tabel.virtual;
      } else {
        this.raid = this.i18n.common_term_task_nodata2;
      }
    } else {
      this.ifraid = false;
    }
    this.raidControlCardContentData = {
      data: raidControlCardData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    // RAID 配置
    const raidData: any = [];
    if (data.raid_level.cfg_raid_config != null) {
      Object.keys(data.raid_level.cfg_raid_config).forEach(key => {
        const obj = {
          title: key,
          data: data.raid_level.cfg_raid_config[key]
        };
        raidData.push(obj);
      });
    }
    this.raidConfigData = raidData;
  }


  // 存储资源
  public getStorageInformationData(data: any) {
    // 存储信息
    this.storageInformationTitle = [
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storange_name,
        tipStr: this.language === 'zh'
        ? data.suggest.suggest_chs_blk_dev.join('\n') : data.suggest.suggest_en_blk_dev.join('\n')
      },
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storage_file,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_disk_ahead.join('\n')
        : data.suggest.suggest_en_cfg_disk_ahead.join('\n')
      },
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storage_io,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_disk_scheduler.join('\n')
        : data.suggest.suggest_en_cfg_disk_scheduler.join('\n')
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.Affinity,
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.line_up,
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.depth,
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.IO,
      },
    ];
    const storageInformationData = [];
    for (let i = 0; i < this.maxLength(data); i++) {
      const obj = {
        name: data.blk_dev ? data.blk_dev[i] : '',
        parameter: data.cfg_disk_ahead ? data.cfg_disk_ahead[i] : '',
        mechanism: data.cfg_disk_scheduler ? data.cfg_disk_scheduler[i] : '',
        affinity: data.cfg_disk_rqaffinity_tmp ? data.cfg_disk_rqaffinity_tmp[i] : '',
        config: data.cfg_disk_nrrequests_tmp ? data.cfg_disk_nrrequests_tmp[i] : '',
        depth: data.cfg_disk_queuedeepth_tmp ? data.cfg_disk_queuedeepth_tmp[i] : '',
        IO: data.cfg_io_nomerages_tmp ? data.cfg_io_nomerages_tmp[i] : '',
        tipStr: data.cfg_disk_sug_lis[i] == null
        ? 'NULL' : this.language === 'zh' ? data.cfg_disk_sug_lis[i].suggest_chs
        : data.cfg_disk_sug_lis[i].suggest_en
      };
      storageInformationData.push(obj);
    }
    this.storageInformationTotalNumber = storageInformationData.length;
    if (storageInformationData.length === 0) {
      this.ifstorage = true;
    } else {
      this.ifstorage = false;
    }
    this.storageInformationContentData = {
      data: storageInformationData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }

  // 文件系统信息
  public getFileInformationData(data: any) {
    //  文件系统信息
    this.filleInformationTitle = [
      {
        title: this.i18n.sys_cof.sum.file_info.file_name,
        width: '20%',
      },
      {
        title: this.i18n.sys_cof.sum.file_info.file_type,
        width: '14%',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_fs_type.join('\n')
        : data.suggest.suggest_en_cfg_fs_type.join('\n')
      },
      {
        title: this.i18n.sys_cof.sum.file_info.file_dot,
        width: '20%',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_fs_mount.join('\n')
        : data.suggest.suggest_en_cfg_fs_mount.join('\n')
      },
      {
        title: this.i18n.sys_cof.sum.file_info.file_msg,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_fs_mount_declaration.join('\n')
         : data.suggest.suggest_en_cfg_fs_mount_declaration.join('\n'),
        width: '46%',
      },
    ];
    const fileInformationData = [];
    for (let i = 0; i < this.maxLength(data); i++) {
      const obj = {
        name: data.name[i] ? data.name[i] : '--',
        type: data.file_type[i] ? data.file_type[i] : '--',
        mountDot: data.mount_pos[i] ? data.mount_pos[i] : '--',
        mountInfo: data.mount_info[i] ? data.mount_info[i] : '--',
        tipStr: data.suggestion.length !== 0
        ? data.suggestion[0].file_system_type.block.indexOf(data.name[i].split('/').pop()) === -1
        ? 'NULL' : this.language === 'zh' ? data.suggestion[0].file_system_type.suggest_chs
        : data.suggestion[0].file_system_type.suggest_en : 'NULL'
      };
      fileInformationData.push(obj);
    }
    this.filleInformationTotalNumber = fileInformationData.length;
    if (fileInformationData.length === 0) {
      this.iffille = true;
    } else {
      this.iffille = false;
    }
    this.filleInformationContentData = {
      data: fileInformationData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }
}
