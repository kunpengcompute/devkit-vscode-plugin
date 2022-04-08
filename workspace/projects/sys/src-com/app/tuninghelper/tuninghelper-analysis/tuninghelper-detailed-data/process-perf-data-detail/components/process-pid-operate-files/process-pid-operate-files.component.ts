import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TiModalService, TiTreeNode } from '@cloud/tiny3';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { I18n } from 'sys/locale';
import { HttpService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';

@Component({
  selector: 'app-process-pid-operate-files',
  templateUrl: './process-pid-operate-files.component.html',
  styleUrls: ['./process-pid-operate-files.component.scss']
})
export class ProcessPidOperateFilesComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setOperatedFilesTableData(sourceData);
    }
  }

  @ViewChild('viewDeviceInfoTemp', { static: false }) viewDeviceInfoTemp: any;

  public tableData: CommonTableData;
  public deviceTableData: CommonTableData;

  constructor(
    private http: HttpService,
    public statusService: TuninghelperStatusService,
    private tiModal: TiModalService,
  ) { }

  ngOnInit(): void {
  }

  /**
   * 设置操作文件数据
   * @param data 数据源
   */
  private setOperatedFilesTableData(data: any) {
    const columnsTree: Array<TiTreeNode> = [
      {
        label: 'PID',
        width: '25%',
        key: 'pid',
        checked: true,
      },
      {
        label: I18n.pcieDetailsinfo.disk_name,
        width: '25%',
        key: 'device',
        checked: true,
      },
      {
        label: 'File Name',
        width: '25%',
        key: 'file_name',
        checked: true,
      },
      {
        label: 'Mode',
        width: '25%',
        key: 'mode',
        checked: true,
      },
    ];
    const srcData = data || [];
    this.tableData = {
      srcData: {
        data: srcData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree,
    };
  }

  /**
   * 查看设备信息
   * @param deviceName 设备名称
   */
  public clickDviceName(deviceName: string) {
    if (deviceName) {
      const params = {
        'node-id': this.statusService.nodeId,
        type: 'disk',
        'disk-name': deviceName
      };
      this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/popup-info/`, {
        params,
      }).then((resp: any) => {
        if (resp.code === STATUS_CODE.SUCCESS && resp.data?.optimization?.data) {
          this.setDeviceTableData(resp.data.optimization.data);
          this.tiModal.open(this.viewDeviceInfoTemp, {
            id: 'files-device-info',
            modalClass: 'process-pid-common-timodal-box',
            context: {
              title: deviceName
            }
          });
        }
      }).catch((error: any) => {});
    }
  }

  /**
   * 设置设备数据
   */
  public setDeviceTableData(data: any) {
    const columnsTree: Array<TiTreeNode> = [
      {
        label: 'Device',
        width: '25%',
        key: 'dev',
        checked: true,
        searchKey: 'dev',
        tip: I18n.sys.tip.DEV
      },
      {
        label: 'tps',
        width: '25%',
        key: 'tps',
        checked: true,
        sortKey: 'tps',
        compareType: 'number',
        tip: I18n.sys.tip.tps
      },
      {
        label: 'rd(KB)/s',
        width: '25%',
        key: 'rd_sec',
        checked: true,
        sortKey: 'rd_sec',
        compareType: 'number',
        tip: I18n.sys.tip['rd(KB)/s']
      },
      {
        label: 'wr(KB)/s',
        width: '25%',
        key: 'wr_sec',
        checked: true,
        sortKey: 'wr_sec',
        compareType: 'number',
        tip: I18n.sys.tip['wr(KB)/s']
      },
      {
        label: 'avgqu-sz',
        width: '25%',
        key: 'avgqu_sz',
        checked: true,
        sortKey: 'avgqu_sz',
        compareType: 'number',
        tip: I18n.sys.tip['avgqu-sz']
      },
      {
        label: 'avgrq-sz',
        width: '25%',
        key: 'avgrq_sz',
        checked: true,
        sortKey: 'avgrq_sz',
        compareType: 'number',
        tip: I18n.sys.tip['avgrq-sz']
      },
      {
        label: 'await',
        width: '25%',
        key: 'await',
        checked: true,
        sortKey: 'await',
        compareType: 'number',
        tip: I18n.sys.tip.await
      },
      {
        label: 'svctm',
        width: '25%',
        key: 'svctm',
        checked: true,
        sortKey: 'svctm',
        compareType: 'number',
        tip: I18n.sys.tip.svctm
      },
      {
        label: '%utils',
        width: '25%',
        key: 'util_percentage',
        checked: true,
        sortKey: 'util_percentage',
        compareType: 'number',
        tip: I18n.sys.tip['%util']
      },
    ];
    const srcData = data.disk || [];
    this.deviceTableData = {
      srcData: {
        data: srcData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree,
    };
  }

}
