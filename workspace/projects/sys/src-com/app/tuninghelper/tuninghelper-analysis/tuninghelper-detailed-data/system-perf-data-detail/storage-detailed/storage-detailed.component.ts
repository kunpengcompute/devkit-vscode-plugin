import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { I18n } from 'sys/locale';
import { HttpService } from 'sys/src-com/app/service';
import { TiTableRowData, TiModalService, TiTreeNode } from '@cloud/tiny3';
import { PerfDataService } from '../../server/perf-data.service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { WebviewPanelService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-storage-detailed',
  templateUrl: './storage-detailed.component.html',
  styleUrls: ['./storage-detailed.component.scss']
})
export class StorageDetailedComponent implements OnInit {
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: any;
  @Input() nodeId: number;
  public selectedDev: string;
  public fileName: string;
  public i18n = I18n;
  public diskData: any[];
  public usageTitle: any[];
  public fileAllData: any;
  public diskInfoData: CommonTableData = {
    columnsTree: ([] as TiTreeNode[]),
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    }
  };
  public raidData: CommonTableData = {
    columnsTree: ([] as TiTreeNode[]),
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    }
  };
  public fileTitle: any[];
  public fileData: any[] = [];
  public filesysTitle: any[];
  public filesysData: any[] = [];
  constructor(
    private http: HttpService,
    private tiModal: TiModalService,
    private perfData: PerfDataService,
    private panelService: WebviewPanelService,
  ) {
    this.usageTitle = perfData.equipConTitle;
    this.fileTitle = perfData.fileTitle;
    this.filesysTitle = perfData.filesysTitle;
    this.diskInfoData.columnsTree = perfData.hardDistTitle;
    this.raidData.columnsTree = perfData.raidTitle;
  }

  ngOnInit(): void {
    this.getData();
  }
  private getData() {
    const params = {
      'node-id': this.nodeId,
      'query-type': JSON.stringify(['disk_storage_info']),
    };
    this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/optimization/system-performance/`, { params })
      .then((res) => {
        this.diskData = res.data.optimization.data.disk_storage_info;
      });
  }
  /**
   * 查看设备详情
   * @param item item
   */
  public triggerPop(item: any, e: TemplateRef<any>) {
    this.selectedDev = item.value;
    const params = {
      'node-id': this.nodeId,
      'disk-name': this.selectedDev,
      'query-type': JSON.stringify(['disk_data_info']),
    };
    this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/optimization/system-performance/`, { params })
      .then((res) => {
        const diskTitle = res.data.optimization.data.hard_disk_info?.title;
        const diskData = res.data.optimization.data.hard_disk_info?.data.map((val: any[]) => {
          const obj: { [x: string]: any } = {};
          diskTitle.forEach((ele: string, idx: number) => {
            obj[ele] = val[idx] ?? '--';
          });
          return obj;
        });
        this.diskInfoData.srcData.data = diskData ?? [];
        const raidTitle = res.data.optimization.data.raid_info?.title;
        this.raidData.srcData.data = res.data.optimization.data.raid_info?.data.map((val: any[]) => {
          const obj: { [x: string]: any } = {};
          raidTitle.forEach((ele: string, idx: number) => {
            obj[ele] = val[idx] ?? '--';
          });
          return obj;
        });
        this.fileData = res.data.optimization.data.file_system_info ?? [];
        this.fileAllData = res.data.optimization.data.disk_detail ?? [];
        this.tiModal.open(e, {
          modalClass: 'processMemoryUsageModal',
          context: {

          }
        });
      });
  }
  /**
   * 打开文件弹框, 点击的是File Name, 实际是根据File System来查找数据
   */
  public filePop(item: any, e: TemplateRef<any>, context: any) {
    if (item.key === 'File Name') {
      this.fileName = item.value;
      const fileSys = item.row['File System'];
      const data = this.fileAllData[fileSys];
      this.filesysData = data ? [data] : [];
      this.tiModal.open(e, {
        modalClass: 'processMemoryUsageModal',
        context: {

        }
      });
    } else {
      context.dismiss();
      const pid = item.value;
      this.panelService.addPanel({
        viewType: 'tuninghelperProcessPidDetailsysPerf',
        title: `PID ${pid}${I18n.tuninghelper.treeDetail.detail}`,
        id: `TuninghelperProcessPidDetail-${this.taskId}-${this.nodeId}-${pid}`,
        router: 'tuninghelperProcessPidDetail',
        message: {
          nodeId: this.nodeId,
          taskId: this.taskId,
          pid: +pid,
          showIndicatorInfo: true
        }
      });
    }

  }
}
