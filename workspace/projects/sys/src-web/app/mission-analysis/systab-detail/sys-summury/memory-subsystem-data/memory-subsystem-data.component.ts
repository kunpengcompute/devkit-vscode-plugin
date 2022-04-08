import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';


@Component({
  selector: 'app-memory-subsystem-data',
  templateUrl: './memory-subsystem-data.component.html',
  styleUrls: ['../sys-summury.component.scss']
})
export class MemorySubsystemDataComponent implements OnInit {

  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() memoryData: any;
  public i18n: any;
  public toggle = {   //  用于判断打开关闭
    memorySystem: false, // 内存子系统
    DIMMList: false,
  };
  public titleDetail: any = [];

  // 内存子系统 DIMM列表
  public DIMMListTitle: Array<TiTableColumns> = [];
  public DIMMListDisplayData: Array<TiTableRowData> = [];
  public DIMMListContentData: TiTableSrcData;
  public DIMMCurrentPage = 1;
  public DIMMPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public DIMMTotalNumber = 0;
  public ifDIMMList = true;
  public DIMMList = '';

  ngOnInit() {
    this.DIMMList = this.i18n.common_term_task_nodata2;
    // 内存子系统表格title
    this.DIMMListTitle = [
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
      {
        title: this.i18n.sys_summary.mem_subsystem.tip.dimm_type,
      },
    ];
    if (JSON.stringify(this.memoryData) !== '{}') {
      this.getMemoryData(this.memoryData);
    }

  }

  // 内存子系统数据
  public getMemoryData(data: any) {

    this.titleDetail = [{
      title: this.i18n.sys.memCap,
      data: data.dimm.total_mem + 'G',
    }, {
      title: this.i18n.sys.memNum,
      data: data.dimm.dimm,
    }, {
      title: this.i18n.sys.nullNum,
      data: data.dimm.null,
    }
    ];
    // 内存子系统 DIMM列表
    const DIMMListData = [];
    for (let i = 0; i < data.dimm.cap.length; i++) {
      const position = data.dimm.pos[i];
      const capacity = data.dimm.cap[i];
      const max = data.dimm.max_speed[i];
      const configRate = data.dimm.cfg_speed[i];
      const type = data.dimm.mem_type[i];
      const obj = {
        position,
        capacity,
        max,
        configRate,
        type
      };
      DIMMListData.push(obj);
    }
    this.DIMMTotalNumber = DIMMListData.length;
    if (DIMMListData.length === 0) {
      this.ifDIMMList = true;
    } else {
      this.ifDIMMList = false;
    }
    this.DIMMListContentData = {
      data: DIMMListData,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }

}
