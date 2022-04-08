import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { I18n } from 'sys/locale';
import { HttpService } from 'sys/src-com/app/service';
import { TiTableRowData, TiModalService, TiTreeNode, Util } from '@cloud/tiny3';
import { PerfDataService } from '../../server/perf-data.service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { WebviewPanelService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-network-detailed',
  templateUrl: './network-detailed.component.html',
  styleUrls: ['./network-detailed.component.scss']
})
export class NetworkDetailedComponent implements OnInit {
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: any;
  @Input() nodeId: number;
  public i18n = I18n;
  public diskData: any[];
  public usageTitle: any[];
  public tcpTitle: any[];
  public title: string;
  public tableList: any[];
  public netioData: CommonTableData = {
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
  public hardConfigData: CommonTableData = {
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

  public hartNumberData: any;
  public tcpData: any[] = [];
  public filesysTitle: any[];
  public filesysData: any[] = [];
  constructor(
    private panelService: WebviewPanelService,
    private http: HttpService,
    private tiModal: TiModalService,
    private perfData: PerfDataService,
  ) {
    this.usageTitle = perfData.equipConTitle;
    this.tcpTitle = perfData.tcpTitle;
    this.filesysTitle = perfData.filesysTitle;
    this.netioData.columnsTree = perfData.ioconsumTitle;
    this.hardConfigData.columnsTree = perfData.hardConfigTitle;
  }

  ngOnInit(): void {
    this.tableList = [
      {
        title: I18n.sysPerfDetailed.tcpUdp,
        open: true,
        prop: 'tcpUdp'
      },
      {
        title: I18n.sys_summary.distributed.hardConfig,
        open: false,
        prop: 'hardConfig'
      },
      {
        title: I18n.sysPerfDetailed.interConfig,
        open: false,
        prop: 'interConfig'
      }
    ];
    this.getData();
  }
  private getData() {
    const params = {
      'node-id': this.nodeId,
      'query-type': JSON.stringify(['network_io_info']),
    };
    this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/optimization/system-performance/`, { params })
      .then((res) => {
        this.netioData.srcData.data = res.data.optimization.data.network_io;
        this.netioData = { ...this.netioData };
      });
  }
  /**
   * 查看设备详情
   * @param item item
   */
  public triggerPop(item: any, e: TemplateRef<any>) {
    const params = {
      'iface-name': item.value,
      'node-id': this.nodeId,
      'query-type': JSON.stringify(['network_iface_info']),
    };
    this.title = item.value;
    this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/optimization/system-performance/`, { params })
      .then((res) => {
        this.hardConfigData.srcData.data = res.data.optimization.data.iface_config_info || [];
        const statusFilterOptions = this.hardConfigData.srcData.data.map(val => {
          return { label: val.Status };
        });
        this.hardConfigData.columnsTree[1].filterConfig.options = statusFilterOptions;
        this.hardConfigData.columnsTree[1].filterConfig.select = this.onFilterSelect;
        this.tcpData = res.data.optimization.data.iface_tcp_udp || [];
        this.hartNumberData = res.data.optimization.data.iface_irq_info
          ? [res.data.optimization.data.iface_irq_info] : [];
        this.tiModal.open(e, {
          modalClass: 'processMemoryUsageModal',
          context: {

          }
        });
      });
  }
  private onFilterSelect(selected: any, column: any, columns: any, tableData: any) {
    if (selected.labelKey === 'all') {
      return tableData;
    } else {
      return tableData.filter((rowData: any) => {
        // 遍历所有列
        for (const columnData of columns) {
          if (!columnData.filterConfig?.selected) {
            continue;
          }
          const labelKey = columnData.filterConfig.labelKey || 'label';
          if (!columnData.filterConfig.multiple) {
            return columnData.filterConfig.selected[labelKey] === rowData[columnData.key];
          } else if (columnData.filterConfig.selected.length) {
            const index: number = columnData.filterConfig.selected.findIndex((item: any) => {
              return item[labelKey] === rowData[columnData.key];
            });
            if (index < 0) {
              return false;
            }
          }
        }
        return true;
      });
    }
  }

  public onModalBodyScroll() {
    Util.trigger(document, 'tiScroll');
  }
  /**
   * 查看进程线程
   * @param item item
   */
  public viewThreadsData(item: any, context: any) {
    context.dismiss();
    const thread = item.value;
    const pid = thread.split('(')[1].split(')')[0];
    this.panelService.addPanel({
      viewType: 'tuninghelperProcessPidDetailsysPerf',
      title: `PID ${pid}${I18n.tuninghelper.treeDetail.detail}`,
      id: `TuninghelperProcessPidDetail-${this.taskId}-${this.nodeId}-${thread}`,
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

