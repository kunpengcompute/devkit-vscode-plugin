import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalysisTarget, RespCommon } from 'sys/src-com/app/domain';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { BubbleInfo, CpuTargetStatus, OptimizationTypeEnum, TargetThreshold } from '../../domain';
import { CurrOptimization, TuningHelperRightService } from '../../service/tuninghelper-right.service';
import { ProcessCpuTarget, RespProcessInfo, RespProcessList, RespThreadInfo, RespThreadList } from '../domain';
import {
  TopologyTreeMessageData,
  TaskDetailMessageService,
  TopologyTreeMessageType
} from '../../service/topology-tree';

type BubbleViewDataSet = {
  idle: Array<BubbleInfo>;
  normal: Array<BubbleInfo>;
  busy: Array<BubbleInfo>;
};

@Component({
  selector: 'app-process-bubble-gragh',
  templateUrl: './process-bubble-gragh.component.html',
  styleUrls: ['./process-bubble-gragh.component.scss']
})
export class ProcessBubbleGraghComponent implements OnInit, OnChanges, OnDestroy {

  @Input() cpuTarget: {
    currTarget: ProcessCpuTarget;
    currThreshold: TargetThreshold;
  };
  @Input() allTargetThreshold: {
    [target in ProcessCpuTarget]?: TargetThreshold;
  } = {};
  @Input() optimizationType: OptimizationTypeEnum;  // 优化类型

  @Output() currViewChange = new EventEmitter<CpuTargetStatus>();

  public i18n: any;
  /** 进程指标数据映射 */
  public pidDataMap: {
    [pid: number]: RespProcessInfo
  } = {};
  /** 进程视图数据集合 */
  public pidViewDataSet: {
    sys: {
      [target in ProcessCpuTarget]?: BubbleViewDataSet
    },
    app: {
      [target in ProcessCpuTarget]?: BubbleViewDataSet
    }
  } = {
    sys: {},
    app: {}
  };
  /** 线程指标数据映射 */
  public tidDataMap: {
    [pid: number]: RespThreadInfo
  } = {};
  /** 线程视图数据集合 */
  public tidViewDataSet: {
    [target in ProcessCpuTarget]?: BubbleViewDataSet
  } = {};
  /** 当前显示的视图 */
  public currShowView: CpuTargetStatus = 'busy';
  /** 当前显示pid详情 */
  public currShowPid: number;
  /** 是否显示线程的Pid */
  public currShowPidThread: number | null;
  public pidGraghTitle: string;
  public appTitle = '';
  /** 业务类型改变通知订阅 */
  private serviceTypeChangeSub: Subscription;
  private rightSub: Subscription;

  constructor(
    private rightService: TuningHelperRightService,
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private i18nService: I18nService,
    private taskDetailMessageService: TaskDetailMessageService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.pidGraghTitle = this.i18n.tuninghelper.taskDetail.systemProcessTop50;
  }

  ngOnInit() {
    // 在业务类型变更的时候刷新气泡图
    this.serviceTypeChangeSub = this.statusService.serviceTypeChange.subscribe({
      next: () => {
        this.refresh();
      }
    });
    // 订阅右侧显示通知，在当前不显示core详情的时候使core不聚焦
    this.rightSub = this.rightService.subscribe({
      next: (msg) => {
        if (msg.type !== CurrOptimization.processDetail) {
          this.currShowPid = null;
        }
      }
    });
    this.currViewChange.emit(this.currShowView);

    this.initPidGraghTitle();
  }

  private async initPidGraghTitle() {
    const resp = await this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/common/configuration/`, {
      params: { 'node-id': this.statusService.nodeId },
    });
    const taskConfig = resp.data;
    const taskParams = taskConfig.nodeConfig[0].task_param;
    switch (taskConfig.analysisTarget) {
      case AnalysisTarget.LAUNCH_APPLICATION:
        const pathArr = taskParams.appDir.split('/');
        this.appTitle = pathArr[pathArr.length - 1];
        this.pidGraghTitle +=
          this.i18n.tuninghelper.taskDetail.and +
          this.appTitle +
          this.i18n.tuninghelper.taskDetail.relatedProcess;
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        this.appTitle = taskParams.processName || taskParams.targetPid;
        this.pidGraghTitle +=
          this.i18n.tuninghelper.taskDetail.and +
          this.appTitle +
          this.i18n.tuninghelper.taskDetail.relatedProcess;
        break;
      default:
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 不管cpu指标何种变更方式，都重新请求数据刷新气泡图。因为每个指标的top50进程都不一样
    if (changes.cpuTarget && this.cpuTarget.currTarget && this.cpuTarget.currThreshold) {
      this.refresh();
    }
  }

  /**
   * 刷新数据
   */
  private async refresh() {
    this.currShowPidThread = null;
    await this.initProcessList();
  }

  private async initProcessList() {
    const currTarget = this.cpuTarget.currTarget;
    const resp = await this.getProcessList();
    if (!resp) { return; }
    // 初始化pidViewDataSet
    this.pidViewDataSet.sys[currTarget] = {
      idle: [],
      normal: [],
      busy: [],
    };
    this.pidViewDataSet.app[currTarget] = {
      idle: [],
      normal: [],
      busy: [],
    };

    Object.keys(resp).forEach((level: 'sys' | 'app') => {
      resp[level].forEach(item => {
        this.pidDataMap[+item.pid] = item;

        const percent = +item[currTarget] / 100;
        const status = this.getStatus(currTarget, percent);
        this.pidViewDataSet[level][currTarget][status].push({
          id: +item.pid,
          opacity: this.getOpacity(percent, status, this.allTargetThreshold[currTarget])
        });

      });
    });

  }

  private getOpacity(percent: number, targetStatus: CpuTargetStatus, threashold: TargetThreshold) {
    const high = threashold.highValue;
    const low = threashold.lowValue;
    let wholeOpacity = 0;
    switch (targetStatus) {
      case 'idle':
        if (low <= 0) {
          wholeOpacity = 1;
          break;
        }
        wholeOpacity = percent / low;
        break;
      case 'normal':
        if (high <= low) {
          wholeOpacity = 1;
          break;
        }
        wholeOpacity = (percent - low) / (high - low);
        break;
      case 'busy':
        if (high >= 1) {
          wholeOpacity = 0;
          break;
        }
        wholeOpacity = (percent - high) / (1 - high);
        break;
      default: break;
    }
    // 基于最低透明度40%来计算
    return 0.6 * wholeOpacity + 0.4;
  }

  /**
   * 根据前闭后开原则计算core状态
   */
  private getStatus(
    cpuTarget: ProcessCpuTarget,
    value: number
  ) {
    const threshold = this.allTargetThreshold[cpuTarget];
    if (value < threshold.lowValue) {
      return 'idle';
    } else if (value < threshold.highValue) {
      return 'normal';
    } else {
      return 'busy';
    }
  }

  private async getProcessList() {
    const params = {
      'node-id': this.statusService.nodeId,
      'service-type': JSON.stringify(
        this.statusService.serviceType.filter(item => item.checked).map(item => item.value)),
      'optimization-type': 'process_performance',
      cpu: this.cpuTarget.currTarget,
    };
    const resp: RespCommon<RespProcessList> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/optimization-query/`,
      { params }
    );
    return resp?.data?.optimization?.data;
  }

  public switchCoreView(target: CpuTargetStatus) {
    if (this.currShowView === target) {
      return;
    }
    this.currShowView = target;
    this.currViewChange.emit(target);
  }

  public onCoreBubbleClick(pid: number, type: 'sys' | 'app' = 'sys') {
    this.currShowPid = pid;
    this.rightService.sendMessage({
      type: CurrOptimization.processDetail,
      data: {
        pid,
        pidType: type,
        optimizationType: this.optimizationType,
      },
    });

    // 发送消息取消选中树节点
    const messageData: TopologyTreeMessageData = {
      optimizationType: this.optimizationType,
    };
    this.taskDetailMessageService.updataTopologyTree(TopologyTreeMessageType.cancelSelectTreeNode, messageData);
  }

  private async getThreadList(pid: number) {
    const params = {
      'node-id': this.statusService.nodeId,
      'service-type': JSON.stringify(
        this.statusService.serviceType.filter(item => item.checked).map(item => item.value)),
      'optimization-type': 'process_performance',
      cpu: this.cpuTarget.currTarget,
      pid
    };
    const resp: RespCommon<RespThreadList> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/optimization-query/`,
      { params }
    );
    return resp?.data?.optimization?.data?.process_list;
  }

  private initThreadList(data: Array<RespThreadInfo>) {
    const currTarget = this.cpuTarget.currTarget;
    if (!data) { return; }
    this.tidViewDataSet[currTarget] = {
      idle: [],
      normal: [],
      busy: [],
    };
    this.tidDataMap = {};

    data.forEach(item => {
      this.tidDataMap[+item.tid] = item;

      const percent = +item[currTarget] / 100;
      const status = this.getStatus(currTarget, percent);
      this.tidViewDataSet[currTarget][status].push({
        id: +item.tid,
        opacity: this.getOpacity(percent, status, this.allTargetThreshold[currTarget])
      });

    });

  }

  public viewThread(pid: number) {
    this.getThreadList(pid).then((data) => {
      this.initThreadList(data);
      this.currShowPidThread = pid;
    });
  }

  public backToProcess() {
    this.currShowPidThread = null;
  }

  ngOnDestroy(): void {
    this.serviceTypeChangeSub?.unsubscribe();
    this.rightSub?.unsubscribe();
  }

}
