import { Component, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import { CompareHandleService } from '../service/compare-handle.service';

@Component({
  selector: 'app-sys-perf-storage-compare',
  templateUrl: './sys-perf-storage-compare.component.html',
  styleUrls: ['./sys-perf-storage-compare.component.scss'],
  providers: [
    { provide: CompareHandleService }
  ]
})
export class SysPerfStorageCompareComponent implements OnInit {

  constructor(
    private http: HttpService,
    private tuninghelperStatusService: TuninghelperStatusService,
    private compareHandleService: CompareHandleService
  ) { }
  public storageInfo: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    columnsTree: [],
  };
  ngOnInit(): void {
    this.storageInfo.columnsTree = [
      {
        label: 'Device',
        width: '10%',
        checked: true,
        disabled: true,
        key: 'name',
        searchKey: 'name',
        tip: ''
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        checked: true,
        expanded: true,
        children: [
          {
            label: 'tps',
            width: '25%',
            key: 'tps_percent',
            checked: true,
            sortKey: 'tps_compare',
            compareType: 'number',
            tip: I18n.sys.tip.tps
          },
          {
            label: 'rd(KB)/s',
            width: '25%',
            key: 'rd_sec_percent',
            checked: true,
            sortKey: 'rd_sec_compare',
            compareType: 'number',
            tip: I18n.sys.tip['rd(KB)/s']
          },
          {
            label: 'wr(KB)/s',
            width: '25%',
            key: 'wr_sec_percent',
            checked: true,
            sortKey: 'wr_sec_compare',
            compareType: 'number',
            tip: I18n.sys.tip['wr(KB)/s']
          },
          {
            label: 'avgrq-sz(KB)',
            width: '25%',
            key: 'avgrq_sz_percent',
            checked: true,
            sortKey: 'avgrq_sz_compare',
            compareType: 'number',
            tip: I18n.sys.tip['avgrq-sz']
          },
          {
            label: 'avgqu-sz',
            width: '25%',
            key: 'avgqu_sz_percent',
            checked: true,
            sortKey: 'avgqu_sz_compare',
            compareType: 'number',
            tip: I18n.sys.tip['avgqu-sz']
          },
          {
            label: 'await(ms)',
            width: '25%',
            key: 'await_percent',
            checked: true,
            sortKey: 'await_compare',
            compareType: 'number',
            tip: I18n.sys.tip.await
          },
          {
            label: 'svctm(ms)',
            width: '25%',
            key: 'svctm_percent',
            checked: true,
            sortKey: 'svctm_compare',
            compareType: 'number',
            tip: I18n.sys.tip.svctm
          },
          {
            label: '%util',
            width: '25%',
            key: 'util_percentage_percent',
            checked: true,
            sortKey: 'util_percentage_compare',
            compareType: 'number',
            tip: I18n.sys.tip['%util']
          },
        ]
      },
      {
        label: I18n.tuninghelper.compare.object1,
        checked: 'indeterminate',
        expanded: true,
        children: [
          {
            label: 'tps',
            width: '25%',
            key: 'tps_1',
            checked: true,
            sortKey: 'tps_1',
            compareType: 'number',
            tip: I18n.sys.tip.tps
          },
          {
            label: 'rd(KB)/s',
            width: '25%',
            key: 'rd_sec_1',
            checked: false,
            sortKey: 'rd_sec_1',
            compareType: 'number',
            tip: I18n.sys.tip['rd(KB)/s']
          },
          {
            label: 'wr(KB)/s',
            width: '25%',
            key: 'wr_sec_1',
            checked: false,
            sortKey: 'wr_sec_1',
            compareType: 'number',
            tip: I18n.sys.tip['wr(KB)/s']
          },
          {
            label: 'avgrq-sz(KB)',
            width: '25%',
            key: 'avgrq_sz_1',
            checked: false,
            sortKey: 'avgrq_sz_1',
            compareType: 'number',
            tip: I18n.sys.tip['avgrq-sz']
          },
          {
            label: 'avgqu-sz',
            width: '25%',
            key: 'avgqu_sz_1',
            checked: false,
            sortKey: 'avgqu_sz_1',
            compareType: 'number',
            tip: I18n.sys.tip['avgqu-sz']
          },
          {
            label: 'await(ms)',
            width: '25%',
            key: 'await_1',
            checked: false,
            sortKey: 'await_1',
            compareType: 'number',
            tip: I18n.sys.tip.await
          },
          {
            label: 'svctm(ms)',
            width: '25%',
            key: 'svctm_1',
            checked: false,
            sortKey: 'svctm_1',
            compareType: 'number',
            tip: I18n.sys.tip.svctm
          },
          {
            label: '%util',
            width: '25%',
            key: 'util_percentage_1',
            checked: false,
            sortKey: 'util_percentage_1',
            compareType: 'number',
            tip: I18n.sys.tip['%util']
          },
        ]
      },
      {
        label: I18n.tuninghelper.compare.object2,
        checked: 'indeterminate',
        expanded: true,
        children: [
          {
            label: 'tps',
            width: '25%',
            key: 'tps_2',
            checked: true,
            sortKey: 'tps_2',
            compareType: 'number',
            tip: I18n.sys.tip.tps
          },
          {
            label: 'rd(KB)/s',
            width: '25%',
            key: 'rd_sec_2',
            checked: false,
            sortKey: 'rd_sec_2',
            compareType: 'number',
            tip: I18n.sys.tip['rd(KB)/s']
          },
          {
            label: 'wr(KB)/s',
            width: '25%',
            key: 'wr_sec_2',
            checked: false,
            sortKey: 'wr_sec_2',
            compareType: 'number',
            tip: I18n.sys.tip['wr(KB)/s']
          },
          {
            label: 'avgrq-sz(KB)',
            width: '25%',
            key: 'avgrq_sz_2',
            checked: false,
            sortKey: 'avgrq_sz_2',
            compareType: 'number',
            tip: I18n.sys.tip['avgrq-sz']
          },
          {
            label: 'avgqu-sz',
            width: '25%',
            key: 'avgqu_sz_2',
            checked: false,
            sortKey: 'avgqu_sz_2',
            compareType: 'number',
            tip: I18n.sys.tip['avgqu-sz']
          },
          {
            label: 'await(ms)',
            width: '25%',
            key: 'await_2',
            checked: false,
            sortKey: 'await_2',
            compareType: 'number',
            tip: I18n.sys.tip.await
          },
          {
            label: 'svctm(ms)',
            width: '25%',
            key: 'svctm_2',
            checked: false,
            sortKey: 'svctm_2',
            compareType: 'number',
            tip: I18n.sys.tip.svctm
          },
          {
            label: '%util',
            width: '25%',
            key: 'util_percentage_2',
            checked: false,
            sortKey: 'util_percentage_2',
            compareType: 'number',
            tip: I18n.sys.tip['%util']
          },
        ]
      },
    ];
    const params = {
      id: this.tuninghelperStatusService.taskId,
      'query-type': JSON.stringify(['disk_storage_info'])
    };
    this.http.get(`/data-comparison/system-performance-comparison/`, {
      params,
      headers: { showLoading: false }
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data.disk_storage_info) {
        this.storageInfo.srcData.data = this.compareHandleService.handleCompareData(resp.data.disk_storage_info);
        this.storageInfo = {...this.storageInfo};
      }
    });
  }
}
