import { Component, Input, OnInit } from '@angular/core';
import { PidInfoType } from '../../../../tuninghelper-task-detail/domain';
import { I18n } from 'sys/locale';
import { TiTreeNode } from '@cloud/tiny3';
import { HttpService } from 'sys/src-com/app/service';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';

@Component({
  selector: 'app-compare-process-app-command-detail',
  templateUrl: './compare-process-app-command-detail.component.html',
  styleUrls: ['./compare-process-app-command-detail.component.scss'],
})
export class CompareProcessAppCommandDetailComponent implements OnInit {
  @Input() message: {
    taskId: any;
    command: any;
  };
  public indicatorInfoData: any;
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

  public treeData: Array<TiTreeNode>;

  public comparisonValue = '';
  public objectOne = '';
  public objectTwo = '';
  public objectOneInfo = '';
  public objectTwoInfo = '';
  public signLeft = '';
  public signRight = '';

  constructor(private http: HttpService) {
    this.treeData = [
      {
        label: I18n.tuninghelper.taskDetail.processIndicator,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.IndicatorInfo,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.micInfo,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.MicMetrics,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.memoryAccessIndicator,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.MemoryAccessMetrics,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.cpuAffinity,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.CpuAffinity,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.memoryAffinity,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.MemoryAffinity,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.processNUMA,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.ProcessNumaAllocation,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.hotFunction,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.HotSpotFunc,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.operationFile,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.OperatedFiles,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.operationNetport,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.OperatedNetworkPort,
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.operationSys,
        type: 'navHeader',
        expanded: true,
        children: [
          {
            type: PidInfoType.SystemCall,
          },
        ],
      },
    ];

    this.comparisonValue = I18n.tuninghelper.taskDetail.comparisonValue;
    this.objectOne = I18n.tuninghelper.taskDetail.objectOne;
    this.objectTwo = I18n.tuninghelper.taskDetail.objectTwo;
    this.signLeft = I18n.common_term_sign_left;
    this.signRight = I18n.common_term_sign_right;
  }

  ngOnInit(): void {
    this.getComparisonTaskInfo();
    this.getProcessDetailData();
  }

  /**
   * 获取对比任务信息
   */
  private getComparisonTaskInfo() {
    const params = { id: this.message.taskId };
    this.http
      .get('/data-comparison/comparison-details/', {
        params,
        headers: { showLoading: true },
      })
      .then((resp: any) => {
        if (resp.code === STATUS_CODE.SUCCESS && resp.data) {
          if (resp.data.length > 0) {
            this.objectOneInfo = `${resp.data[0].project_name}/` +
            `${resp.data[0].task_name}/${resp.data[0].node_name}`;
          }
          if (resp.data.length > 1) {
            this.objectTwoInfo = `${resp.data[1].project_name}/` +
            `${resp.data[1].task_name}/${resp.data[1].node_name}`;
          }
        }
      })
      .catch((error: any) => {});
  }

  /**
   * 获取应用pid详细指标数据
   * @param pid 进程pid
   */
  private getProcessDetailData() {
    const params = {
      command: this.message.command,
      id: this.message.taskId,
      'query-type': JSON.stringify([
        PidInfoType.IndicatorInfo,
        PidInfoType.CompareMicMetrics,
        PidInfoType.MemoryAccessMetrics,
        PidInfoType.CpuAffinity,
        PidInfoType.CompareMemoryAffinity,
        PidInfoType.ProcessNumaAllocation,
        PidInfoType.CompareHotSpotFunc,
        PidInfoType.OperatedFilesResponse,
        PidInfoType.OperatedNetwork,
        PidInfoType.SystemCall,
      ]),
    };
    this.http
      .get(`/data-comparison/command-detail/`, { params })
      .then((resp: any) => {
        if (resp.code === STATUS_CODE.SUCCESS && resp.data) {
          this.setTableData(resp.data);
        }
      })
      .catch((error: any) => {});
  }

  /**
   * 设置表格数据
   */
  private setTableData(data: any) {
    if (Object.keys(data).length > 0) {
      for (const key of Object.keys(data)) {
        switch (key) {
          case PidInfoType.IndicatorInfo:
            this.indicatorInfoData = data[key];
            break;
          case PidInfoType.CompareMicMetrics:
            this.micMetricsData = data[key];
            break;
          case PidInfoType.MemoryAccessMetrics:
            this.accessMetricsData = data[key];
            break;
          case PidInfoType.CpuAffinity:
            this.cpuAffinityData = data[key];
            break;
          case PidInfoType.CompareMemoryAffinity:
            this.memoryAffinityData = data[key];
            break;
          case PidInfoType.ProcessNumaAllocation:
            this.numaAllocationData = data[key];
            break;
          case PidInfoType.CompareHotSpotFunc:
            this.hotFuncData = data[key];
            break;
          case PidInfoType.OperatedFilesResponse:
            this.operateFilesData = data[key];
            break;
          case PidInfoType.OperatedNetwork:
            this.operateNetworkData = data[key];
            break;
          case PidInfoType.SystemCall:
            this.systemCallData = data[key];
            break;
          default:
            break;
        }
      }
    }
  }
}
