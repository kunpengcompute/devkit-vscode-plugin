import { Component, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import { CompareHandleService } from '../service/compare-handle.service';

@Component({
  selector: 'app-sys-perf-network-compare',
  templateUrl: './sys-perf-network-compare.component.html',
  styleUrls: ['./sys-perf-network-compare.component.scss'],
  providers: [
    { provide: CompareHandleService }
  ]
})
export class SysPerfNetworkCompareComponent implements OnInit {

  constructor(
    private http: HttpService,
    private tuninghelperStatusService: TuninghelperStatusService,
    private compareHandleService: CompareHandleService
  ) { }
  public networkInfo: CommonTableData = {
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
    this.networkInfo.columnsTree = [
      {
        label: 'IFACE',
        width: '10%',
        checked: true,
        disabled: true,
        key: 'name',
        searchKey: 'name',
        tip: I18n.sys.tip.IFACE
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.tuninghelper.processDetailData.loadStatistics,
            width: '35%',
            key: 'load',
            checked: 'true',
            expanded: true,
            children: [
              {
                label: 'rxpck/s',
                width: '5%',
                key: 'rxpck_percent',
                checked: true,
                sortKey: 'rxpck_compare',
                compareType: 'number',
                tip: I18n.sys.tip['rxpck/s']
              },
              {
                label: 'txpck/s',
                width: '5%',
                key: 'txpck_percent',
                checked: true,
                sortKey: 'txpck_compare',
                compareType: 'number',
                tip: I18n.sys.tip['txpck/s']
              },
              {
                label: 'rx(KB)/s',
                width: '5%',
                key: 'rxkb_percent',
                checked: true,
                sortKey: 'rxkb_compare',
                compareType: 'number',
                tip: I18n.sys.tip['rxkB/s']
              },
              {
                label: 'tx(KB)/s',
                width: '5%',
                key: 'txkb_percent',
                checked: true,
                sortKey: 'txkb_compare',
                compareType: 'number',
                tip: I18n.sys.tip['txkB/s']
              }
            ]
          },
          {
            label: I18n.tuninghelper.processDetailData.faultStatistics,
            key: 'fault',
            checked: 'true',
            expanded: true,
            children: [
              {
                label: 'rxerr/s',
                width: '5%',
                key: 'rxerr_percent',
                checked: true,
                sortKey: 'rxerr_compare',
                compareType: 'number',
                tip: I18n.sys.tip['rxerr/s']
              },
              {
                label: 'txerr/s',
                width: '5%',
                key: 'txerr_percent',
                checked: true,
                sortKey: 'txerr_compare',
                compareType: 'number',
                tip: I18n.sys.tip['txerr/s']
              },
              {
                label: 'rxdrop/s',
                width: '5%',
                key: 'rxdrop_percent',
                checked: true,
                sortKey: 'rxdrop_compare',
                compareType: 'number',
                tip: I18n.sys.tip['rxdrop/s']
              },
              {
                label: 'txdrop/s',
                width: '5%',
                key: 'txdrop_percent',
                checked: true,
                sortKey: 'txdrop_compare',
                compareType: 'number',
                tip: I18n.sys.tip['txdrop/s']
              },
              {
                label: 'rxfifo/s',
                width: '5%',
                key: 'rxfifo_percent',
                checked: true,
                sortKey: 'rxfifo_compare',
                compareType: 'number',
                tip: I18n.sys.tip['rxfifo/s']
              },
              {
                label: 'txfifo/s',
                width: '5%',
                key: 'txfifo_percent',
                checked: true,
                sortKey: 'txfifo_compare',
                compareType: 'number',
                tip: I18n.sys.tip['txfifo/s']
              },
            ]
          },
        ]
      },
      {
        label: I18n.tuninghelper.compare.object1,
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.tuninghelper.processDetailData.loadStatistics,
            width: '35%',
            key: 'load',
            checked: 'indeterminate',
            expanded: true,
            children: [
              {
                label: 'rxpck/s',
                width: '5%',
                key: 'rxpck_1',
                checked: true,
                sortKey: 'rxpck_1',
                compareType: 'number',
                tip: I18n.sys.tip['rxpck/s']
              },
              {
                label: 'txpck/s',
                width: '5%',
                key: 'txpck_1',
                checked: false,
                sortKey: 'txpck_1',
                compareType: 'number',
                tip: I18n.sys.tip['txpck/s']
              },
              {
                label: 'rx(KB)/s',
                width: '5%',
                key: 'rxkb_1',
                checked: false,
                sortKey: 'rxkb_1',
                compareType: 'number',
                tip: I18n.sys.tip['rxkB/s']
              },
              {
                label: 'tx(KB)/s',
                width: '5%',
                key: 'txkb_1',
                checked: false,
                sortKey: 'txkb_1',
                compareType: 'number',
                tip: I18n.sys.tip['txkB/s']
              }
            ]
          },
          {
            label: I18n.tuninghelper.processDetailData.faultStatistics,
            key: 'fault',
            checked: false,
            expanded: true,
            children: [
              {
                label: 'rxerr/s',
                width: '5%',
                key: 'rxerr_1',
                checked: false,
                sortKey: 'rxerr_1',
                compareType: 'number',
                tip: I18n.sys.tip['rxerr/s']
              },
              {
                label: 'txerr/s',
                width: '5%',
                key: 'txerr_1',
                checked: false,
                sortKey: 'txerr_1',
                compareType: 'number',
                tip: I18n.sys.tip['txerr/s']
              },
              {
                label: 'rxdrop/s',
                width: '5%',
                key: 'rxdrop_1',
                checked: false,
                sortKey: 'rxdrop_1',
                compareType: 'number',
                tip: I18n.sys.tip['rxdrop/s']
              },
              {
                label: 'txdrop/s',
                width: '5%',
                key: 'txdrop_1',
                checked: false,
                sortKey: 'txdrop_1',
                compareType: 'number',
                tip: I18n.sys.tip['txdrop/s']
              },
              {
                label: 'rxfifo/s',
                width: '5%',
                key: 'rxfifo_1',
                checked: false,
                sortKey: 'rxfifo_1',
                compareType: 'number',
                tip: I18n.sys.tip['rxfifo/s']
              },
              {
                label: 'txfifo/s',
                width: '5%',
                key: 'txfifo_1',
                checked: false,
                sortKey: 'txfifo_1',
                compareType: 'number',
                tip: I18n.sys.tip['txfifo/s']
              },
            ]
          },
        ]
      },
      {
        label: I18n.tuninghelper.compare.object2,
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.tuninghelper.processDetailData.loadStatistics,
            width: '35%',
            key: 'load',
            checked: 'indeterminate',
            expanded: true,
            children: [
              {
                label: 'rxpck/s',
                width: '5%',
                key: 'rxpck_2',
                checked: true,
                sortKey: 'rxpck_2',
                compareType: 'number',
                tip: I18n.sys.tip['rxpck/s']
              },
              {
                label: 'txpck/s',
                width: '5%',
                key: 'txpck_2',
                checked: false,
                sortKey: 'txpck_2',
                compareType: 'number',
                tip: I18n.sys.tip['txpck/s']
              },
              {
                label: 'rx(KB)/s',
                width: '5%',
                key: 'rxkb_2',
                checked: false,
                sortKey: 'rxkb_2',
                compareType: 'number',
                tip: I18n.sys.tip['rxkB/s']
              },
              {
                label: 'tx(KB)/s',
                width: '5%',
                key: 'txkb_2',
                checked: false,
                sortKey: 'txkb_2',
                compareType: 'number',
                tip: I18n.sys.tip['txkB/s']
              }
            ]
          },
          {
            label: I18n.tuninghelper.processDetailData.faultStatistics,
            key: 'fault',
            checked: false,
            expanded: true,
            children: [
              {
                label: 'rxerr/s',
                width: '5%',
                key: 'rxerr_2',
                checked: false,
                sortKey: 'rxerr_2',
                compareType: 'number',
                tip: I18n.sys.tip['rxerr/s']
              },
              {
                label: 'txerr/s',
                width: '5%',
                key: 'txerr_2',
                checked: false,
                sortKey: 'txerr_2',
                compareType: 'number',
                tip: I18n.sys.tip['txerr/s']
              },
              {
                label: 'rxdrop/s',
                width: '5%',
                key: 'rxdrop_2',
                checked: false,
                sortKey: 'rxdrop_2',
                compareType: 'number',
                tip: I18n.sys.tip['rxdrop/s']
              },
              {
                label: 'txdrop/s',
                width: '5%',
                key: 'txdrop_2',
                checked: false,
                sortKey: 'txdrop_2',
                compareType: 'number',
                tip: I18n.sys.tip['txdrop/s']
              },
              {
                label: 'rxfifo/s',
                width: '5%',
                key: 'rxfifo_2',
                checked: false,
                sortKey: 'rxfifo_2',
                compareType: 'number',
                tip: I18n.sys.tip['rxfifo/s']
              },
              {
                label: 'txfifo/s',
                width: '5%',
                key: 'txfifo_2',
                checked: false,
                sortKey: 'txfifo_2',
                compareType: 'number',
                tip: I18n.sys.tip['txfifo/s']
              },
            ]
          },
        ]
      },
    ];
    const params = {
      id: this.tuninghelperStatusService.taskId,
      'query-type': JSON.stringify(['network_io'])
    };
    this.http.get(`/data-comparison/system-performance-comparison/`, {
      params,
      headers: { showLoading: false }
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data.network_io) {
        this.networkInfo.srcData.data = this.compareHandleService.handleCompareData(resp.data.network_io);
        this.networkInfo = {...this.networkInfo};
      }
    });
  }
}
