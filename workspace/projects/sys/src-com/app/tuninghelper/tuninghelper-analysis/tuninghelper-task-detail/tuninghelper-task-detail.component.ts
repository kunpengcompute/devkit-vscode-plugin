import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { RespCommon, TaskStatus } from 'sys/src-com/app/domain';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { RespExistSuggestion, ServiceTypeValue, SuggestionSelectType, SuggestionSelectValue } from './domain';
import { OptimizationTypeEnum } from './domain/optimization-type.enum';
import {
  TopologyTreeMessageDetail,
  TaskDetailMessageService,
  TopologyTreeMessageType,
  ViewProcessThreadData,
  suggestionSelectChangeData
} from './service/topology-tree';
import { TuningHelperRightService } from './service/tuninghelper-right.service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { ProcessCpuTarget } from './process-perf/domain';
export const openDataDetailPanal = new Subject<any>();
@Component({
  selector: 'app-tuninghelper-task-detail',
  templateUrl: './tuninghelper-task-detail.component.html',
  styleUrls: ['./tuninghelper-task-detail.component.scss'],
  providers: [
    { provide: TuningHelperRightService },
    { provide: TuninghelperStatusService },
    { provide: TaskDetailMessageService },
  ]
})
export class TuninghelperTaskDetailComponent implements OnInit, OnDestroy {

  @Input() nodeId: number;
  @Input() taskId: number;
  @Input() status: string;
  @Input() ownerId: string;

  public readonly OptimizationTypeEnum = OptimizationTypeEnum;

  public i18n: any;

  public moduleTab: {
    [label in OptimizationTypeEnum]: { hasIdea: boolean };
  };
  public currActiveTab: OptimizationTypeEnum = OptimizationTypeEnum.systemConfig;

  public rightExpand = false;

  // 记录页面是否已经被加载
  public pageLoaded: { [page in OptimizationTypeEnum]: boolean } = {
    systemConfig: true,
    hotFunction: false,
    systemPerf: false,
    processPerf: false
  };
  public TaskStatus = TaskStatus;
  public showFailed = false;
  private subTopologyTree: Subscription;
  public viewCpuTarget: ProcessCpuTarget = ProcessCpuTarget.sys;
  /** 建议范围 */
  public suggestionSelectList: SuggestionSelectType[];
  /** 选择的建议范围 */
  public suggestionSelect: SuggestionSelectValue = SuggestionSelectValue.AllSuggestion;

  constructor(
    public statusService: TuninghelperStatusService,
    private http: HttpService,
    private i18nService: I18nService,
    private taskDetailMessageService: TaskDetailMessageService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.statusService.serviceType = [
      {
        value: ServiceTypeValue.Cpu,
        checked: true,
        label: this.i18n.tuninghelper.taskDetail.cpuIntensive,
        disabled: false,
        notAllowed: false,
      },
      {
        value: ServiceTypeValue.Network,
        checked: true,
        label: this.i18n.tuninghelper.taskDetail.networkIntensive,
        disabled: false,
        notAllowed: false,
      },
      {
        value: ServiceTypeValue.Disk,
        checked: true,
        label: this.i18n.tuninghelper.taskDetail.storageIntensive,
        disabled: false,
        notAllowed: false,
      },
    ];

    // 建议范围
    this.suggestionSelectList = [
      {
        label: this.i18n.tuninghelper.taskDetail.allSuggestion,
        value: SuggestionSelectValue.AllSuggestion,
      },
      {
        label: this.i18n.tuninghelper.taskDetail.filterSuggestion,
        value: SuggestionSelectValue.ThresholdFilterSuggestion,
      },
    ];
    this.statusService.suggestionSelect = this.suggestionSelect;
  }


  ngOnInit(): void {
    if (this.status !== TaskStatus.Failed && this.status !== TaskStatus.Cancelled) {
      this.statusService.nodeId = this.nodeId;
      this.statusService.taskId = this.taskId;
      this.statusService.ownerId = this.ownerId;
      this.initExistSuggestion();
      this.showFailed = false;
    } else {
      this.showFailed = true;
    }

    // 来自查看进线程分析的消息订阅
    this.subTopologyTree = this.taskDetailMessageService.getMessege({
      next: (message: TopologyTreeMessageDetail<ViewProcessThreadData>) => {
        if (message.type === TopologyTreeMessageType.viewTopProceeThread) {
          this.pageLoaded.processPerf = true;
          this.currActiveTab = OptimizationTypeEnum.processPerf;
          this.viewCpuTarget = message.data.viewCpuTarget;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subTopologyTree?.unsubscribe();
  }

  public serviceTypeChange() {
    const checked = this.statusService.serviceType.filter(item => item.checked);
    if (checked.length === 1) {
      checked[0].notAllowed = true;
    } else if (checked.length < 1) {
      this.statusService.serviceType[0].checked = true;
    } else {
      this.statusService.serviceType.forEach(item => {
        item.notAllowed = false;
      });
    }
    this.statusService.serviceTypeChange.next(this.statusService.serviceType);
    this.initExistSuggestion();
  }

  /**
   * 初始化页签的上的小红点
   */
  public async initExistSuggestion() {
    const resp = await this.getExistSuggestion();
    if (!resp) { return; }
    this.moduleTab = {
      systemConfig: {
        hasIdea: resp.system_config
      },
      hotFunction: {
        hasIdea: resp.hot_function
      },
      systemPerf: {
        hasIdea: resp.system_performance
      },
      processPerf: {
        hasIdea: resp.process_performance
      },
    };
  }

  private async getExistSuggestion() {
    const params = {
      'node-id': this.nodeId,
      'service-type': JSON.stringify(
        this.statusService.serviceType.filter(item => item.checked).map(item => item.value)
      ),
    };
    const resp: RespCommon<RespExistSuggestion> = await this.http.get(
      `/tasks/${encodeURIComponent(this.taskId)}/optimization/exist-suggestion/`,
      { params }
    );
    return resp?.data?.optimization?.data;
  }

  public switchModuleTab(tabName: OptimizationTypeEnum) {
    if (this.currActiveTab === tabName) {
      return;
    }
    this.currActiveTab = tabName;
    if (!this.pageLoaded[tabName]) {
      this.pageLoaded[tabName] = true;
    }
  }

  public viewDetails(type: string) {
    const data = {
      type,
      taskType: 'tuninghelperDateiledData',
      nodeId: this.nodeId,
      taskId: this.taskId,
      ownerId: this.ownerId,
      title: `${this.i18n.tuninghelper.taskDetail[type]}`
    };
    openDataDetailPanal.next(data);
  }

  /**
   * 建议范围改变
   * @param val 选择的建议范围
   */
  public suggestionSelectedChange(val: SuggestionSelectValue) {
    this.statusService.suggestionSelect = val;

    const message: TopologyTreeMessageDetail<suggestionSelectChangeData> = {
      type: TopologyTreeMessageType.suggestionSelectChange,
      data: {
        suggestionSelect: val,
      },
    };
    this.taskDetailMessageService.sendMessage(message);
  }

  public onRightExpandChange() {
    this.statusService.rightExpand = !this.statusService.rightExpand;
    this.statusService.rightExpandChange.next(this.statusService.rightExpand);
  }
}
