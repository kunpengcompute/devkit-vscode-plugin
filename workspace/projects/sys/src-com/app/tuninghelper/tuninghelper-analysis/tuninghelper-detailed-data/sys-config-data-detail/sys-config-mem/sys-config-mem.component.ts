import { Component, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { RespMemDeviceConfig, RespSystemConfigMem } from '../domain/resp-system-config-mem.type';

@Component({
  selector: 'app-sys-config-mem',
  templateUrl: './sys-config-mem.component.html',
  styleUrls: ['./sys-config-mem.component.scss']
})
export class SysConfigMemComponent implements OnInit {

  public i18n: any;
  public memInfo = {
    totalSize: '',
    totalBandwidth: '',
  };

  public deviceTableData = {
    columns: [] as Array<TiTableColumns>,
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    } as TiTableSrcData,
  };

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
  ) {
  }

  async ngOnInit() {
    const resp = await this.getData();
    this.memInfo.totalSize = (resp?.total_size ?? '--') + 'GiB';
    this.memInfo.totalBandwidth = (resp?.total_band_width ?? '--') + 'GiB/s';
    this.initDeviceTableData(resp.device);
  }

  private initDeviceTableData(data: RespMemDeviceConfig[]) {
    this.deviceTableData.columns = [
      { title: 'CPU' },
      { title: 'Channel' },
      { title: 'DIMM' },
      { title: I18n.tuninghelper.sysConfigDetail.maxSpeedMts },
      { title: 'Data Width（bits）' },
      { title: I18n.tuninghelper.sysConfigDetail.bandwidthMbs },
      { title: I18n.tuninghelper.sysConfigDetail.capacityGb },
      { title: 'NUMA NODE' },
    ];

    if (!data) { return; }

    const dataMap: { [socket: string]: { [numaNode: string]: RespMemDeviceConfig[] } } = {};
    data.forEach(item => {
      if (!dataMap[item.socket]) {
        dataMap[item.socket] = {};
      }
      if (!dataMap[item.socket][item.numa_node]) {
        dataMap[item.socket][item.numa_node] = [];
      }
      dataMap[item.socket][item.numa_node].push(item);
    });

    let resultArr: any[] = [];
    Object.keys(dataMap).forEach(socket => {
      let socketArr: any[] = [];
      let socketDataNum = 0;
      const numaMap = dataMap[socket];
      Object.keys(numaMap).forEach(numaNode => {
        const dataArr: any[] = numaMap[numaNode];
        socketDataNum += dataArr.length;
        dataArr[0].numaNodeRowSpan = dataArr.length;
        socketArr = socketArr.concat(dataArr);
      });
      socketArr[0].socketRowSpan = socketArr.length;
      resultArr = resultArr.concat(socketArr);
    });

    this.deviceTableData.srcData.data = resultArr;
  }

  private async getData() {
    const params = {
      'node-id': this.statusService.nodeId,
      'config-type': 'memory',
    };
    const resp: RespCommon<RespSystemConfigMem> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/system-config/`,
      { params }
    );
    return resp?.data?.optimization?.data;
  }

}
