import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TiModalService } from '@cloud/tiny3';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { QueryTypeEnum, MetricsList } from '../system-perf-data-detail/domain';
@Component({
  selector: 'app-runing-process-detail',
  templateUrl: './runing-process-detail.component.html',
  styleUrls: ['./runing-process-detail.component.scss'],
  providers: [
    { provide: TuninghelperStatusService },
  ]
})
export class RuningProcessDetailComponent implements OnInit {
  @Input() message: {
    taskId: any,
    nodeId: any,
    pid: any
  };
  @Input()
  set metricsListParams(value: MetricsList[]) {
    if (value) {
      this.metricsList = value;
    }
  }

  @ViewChild('viewSystemCallInfo', { static: false }) viewSystemCallInfo: any;
  public QueryTypeEnum = QueryTypeEnum;
  public metricsList: MetricsList[];
  // 指标信息
  public indicatorInfo: any;
  // 微架构指标
  public micMetricsData: any;
  // 访存分析
  public accessMetricsData: any;
  // cpu亲和性
  public cpuAffinityData: any;
  // 内存亲和性
  public memoryAffinityData: any;
  //  进程内存段NUMA分布
  public numaAllocationData: any;
  // 热点函数
  public hotFuncData: any[] = [];
  // 模块
  public hotFuncModuleData: any[] = [];
  // 操作的文件
  public operateFilesData: any;
  // 操作的网口
  public operateNetworkData: any;
  // 系统调用
  public systemCallData: any;
  // 热点函数选择器
  public hotFuncOptions: Array<any>;
  public hotFuncSelected: any;
  constructor(
    private http: HttpService,
    public statusService: TuninghelperStatusService,
    private tiModal: TiModalService,
  ) { }

  ngOnInit(): void {
    this.hotFuncOptions = [
      {
        label: I18n.common_term_task_tab_summary_function
      },
      {
        label: I18n.common_term_task_tab_summary_module
      }
    ];
    this.hotFuncSelected = this.hotFuncOptions[0];
    this.metricsList = [
      {
        title: I18n.tuninghelper.detailedData.metric,
        prop: QueryTypeEnum.INDICATOR_INFORMATION,
        open: true
      },
      {
        title: I18n.tuninghelper.detailedData.micro_metrics,
        prop: QueryTypeEnum.MICROARCHITECTURE_METRICS,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.access_metrices,
        prop: QueryTypeEnum.MEMORY_ACCESS_INDICATOR,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.cpu_affinity,
        prop: QueryTypeEnum.CPU_AFFINITY,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.memory_affinity,
        prop: QueryTypeEnum.MEMORY_AFFINITY,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.process_numa,
        prop: QueryTypeEnum.SYSTEM_CALL,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.hot_func,
        prop: QueryTypeEnum.HOTSPOT_FUNCTION,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.handle_file,
        prop: QueryTypeEnum.OPERATED_FILEDS,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.handle_port,
        prop: QueryTypeEnum.OPERATED_NETWORK_PORT,
        open: false,
      },
      {
        title: I18n.tuninghelper.detailedData.sys_call,
        prop: QueryTypeEnum.SYSTEM_CALL,
        open: false,
      }
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
        QueryTypeEnum.INDICATOR_INFORMATION,
        QueryTypeEnum.MICROARCHITECTURE_METRICS,
        QueryTypeEnum.MEMORY_ACCESS_INDICATOR,
        QueryTypeEnum.CPU_AFFINITY,
        QueryTypeEnum.MEMORY_AFFINITY,
        QueryTypeEnum.PROCESS_NUMA_ALLOCATION,
        QueryTypeEnum.HOTSPOT_FUNCTION,
        QueryTypeEnum.HOTSPOT_MODULE,
        QueryTypeEnum.OPERATED_FILEDS,
        QueryTypeEnum.OPERATED_NETWORK_PORT,
        QueryTypeEnum.SYSTEM_CALL,
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
          case QueryTypeEnum.INDICATOR_INFORMATION:
            this.indicatorInfo = [...(data[key])];
            break;
          case QueryTypeEnum.MICROARCHITECTURE_METRICS:
            this.micMetricsData = data[key];
            break;
          case QueryTypeEnum.MEMORY_ACCESS_INDICATOR:
            this.accessMetricsData = data[key];
            break;
          case QueryTypeEnum.CPU_AFFINITY:
            this.cpuAffinityData = data[key];
            break;
          case QueryTypeEnum.MEMORY_AFFINITY:
            this.memoryAffinityData = data[key];
            break;
          case QueryTypeEnum.PROCESS_NUMA_ALLOCATION:
            this.numaAllocationData = data[key];
            break;
          case QueryTypeEnum.HOTSPOT_FUNCTION:
            this.hotFuncData = data[key];
            break;
          case QueryTypeEnum.HOTSPOT_MODULE:
            this.hotFuncModuleData = data[key];
            break;
          case QueryTypeEnum.OPERATED_FILEDS:
            this.operateFilesData = data[key];
            break;
          case QueryTypeEnum.OPERATED_NETWORK_PORT:
            this.operateNetworkData = data[key];
            break;
          case QueryTypeEnum.SYSTEM_CALL:
            this.systemCallData = data[key];
            break;
          default:
            break;
        }
      }
    }
  }

  /**
   * 系统调用-查看详细调用信息
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
    }).catch((error: any) => { });
  }
}
