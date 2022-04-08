import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TiModalService, TiTreeNode } from '@cloud/tiny3';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import { PidInfoType } from '../../../../tuninghelper-task-detail/domain';
import { I18n } from 'sys/locale';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';

@Component({
  selector: 'app-process-app-pid-detail',
  templateUrl: './process-app-pid-detail.component.html',
  styleUrls: ['./process-app-pid-detail.component.scss'],
  providers: [
    { provide: TuninghelperStatusService },
  ]
})
export class ProcessAppPidDetailComponent implements OnInit {

  @Input() message: {
    taskId: any,
    nodeId: any,
    pid: any
  };

  @ViewChild('viewSystemCallInfo', {static: false}) viewSystemCallInfo: any;

  public treeData: Array<TiTreeNode>;
  public micMetricsData: any;
  public accessMetricsData: any;
  public cpuAffinityData: any;
  public memoryAffinityData: any;
  public systemCallData: any;
  public operateNetworkData: any;
  public operateFilesData: any;
  public numaAllocationData: any;
  public hotFuncData: any;
  public hotFuncModuleData: any;

  public PidInfoType = PidInfoType;

  // 热点函数选择器
  public hotFuncOptions: Array<any>;
  public hotFuncSelected: any;

  constructor(
    private http: HttpService,
    public statusService: TuninghelperStatusService,
    private tiModal: TiModalService,
  ) {
    this.hotFuncOptions = [
      {
        label: I18n.common_term_task_tab_summary_function
      },
      {
        label: I18n.common_term_task_tab_summary_module
      }
    ];
    this.hotFuncSelected = this.hotFuncOptions[0];
  }


  ngOnInit(): void {
    this.treeData = [
      {
        label: I18n.tuninghelper.taskDetail.micIndicator,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.MicMetrics
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.memoryAccessIndicator,
        type: 'navHeader',
        expanded: false,
        children: [
          {
            type: PidInfoType.MemoryAccessMetrics
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.cpuAffinity,
        type: 'navHeader',
        expanded: false,
        children: [
          {
            type: PidInfoType.CpuAffinity
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.memoryAffinity,
        type: 'navHeader',
        expanded: false,
        children: [
          {
            type: PidInfoType.MemoryAffinity
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.processNUMA,
        type: 'navHeader',
        expanded: false,
        children: [
          {
            type: PidInfoType.ProcessNumaAllocation
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.hotFunction,
        type: 'navHeader',
        expanded: false,
        children: [
          {
            type: PidInfoType.HotSpotFunc
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.operationFile,
        type: 'navHeader',
        expanded: false,
        children: [
          {
            type: PidInfoType.OperatedFiles
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.operationNetport,
        type: 'navHeader',
        expanded: false,
        children: [
          {
            type: PidInfoType.OperatedNetworkPort
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.operationSys,
        type: 'navHeaderSystemCall',
        expanded: false,
        children: [
          {
            type: PidInfoType.SystemCall
          }
        ]
      },
    ];
    this.statusService.taskId = this.message.taskId;
    this.statusService.nodeId = this.message.nodeId;
    if (this.message) {
      this.getProcessDetailData();
    }
  }

  /**
   * 获取应用pid详细指标数据
   * @param pid 进程pid
   */
  private getProcessDetailData() {
    const params = {
      pid: this.message.pid,
      'node-id': this.message.nodeId,
      'query-type': JSON.stringify([
        PidInfoType.MicMetrics,
        PidInfoType.MemoryAccessMetrics,
        PidInfoType.CpuAffinity,
        PidInfoType.MemoryAffinity,
        PidInfoType.SystemCall,
        PidInfoType.ProcessNumaAllocation,
        PidInfoType.HotSpotFunc,
        PidInfoType.OperatedFiles,
        PidInfoType.OperatedNetworkPort,
        PidInfoType.HotSpotModule,
      ]),
    };
    this.http.get(
      `/tasks/${this.message.taskId}/optimization/pid-detail/`,
      { params }
    ).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data.optimization && resp.data.optimization.data) {
        this.setTableData(resp.data.optimization.data);
      }
    }).catch((error: any) => {
    });
  }

  /**
   * 设置表格数据
   */
  private setTableData(data: any) {
    if (Object.keys(data).length > 0) {
      for (const key of Object.keys(data)) {
        switch (key) {
          case PidInfoType.MicMetrics:
            this.micMetricsData = data[key];
            break;
          case PidInfoType.MemoryAccessMetrics:
            this.accessMetricsData = data[key];
            break;
          case PidInfoType.CpuAffinity:
            this.cpuAffinityData = data[key];
            break;
          case PidInfoType.MemoryAffinity:
            this.memoryAffinityData = data[key];
            break;
          case PidInfoType.OperatedNetwork:
            this.operateNetworkData = data[key];
            break;
          case PidInfoType.OperatedFilesResponse:
            this.operateFilesData = data[key];
            break;
          case PidInfoType.SystemCall:
            this.systemCallData = data[key];
            break;
          case PidInfoType.ProcessNumaAllocation:
            this.numaAllocationData = data[key];
            break;
          case PidInfoType.HotSpotFunc:
            this.hotFuncData = data[key];
            break;
          case PidInfoType.HotSpotModule:
            this.hotFuncModuleData = data[key];
            break;
          default:
            break;
        }
      }
    }
  }

  /**
   * 系统调用-查看详细调用信息tasks/37/optimization/call-details/?node-id=1&pid=1&page=1&per-page=5
   */
  public viewDetailInvokingInfo() {
    const params = {
      'node-id': this.statusService.nodeId,
      type: 'disk',
      pid: this.message.pid,
      page: 1,
      'per-page': 10000
    };
    this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/call-details/`, {
      params,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data?.optimization?.data) {
        this.tiModal.open(this.viewSystemCallInfo, {
          id: 'pid-system-call-info',
          modalClass: 'process-pid-common-timodal-box',
          context: {
            title: I18n.lock.timing,
            content: resp.data?.optimization?.data?.content || ''
          }
        });
      }
    }).catch((error: any) => {});
  }

}
