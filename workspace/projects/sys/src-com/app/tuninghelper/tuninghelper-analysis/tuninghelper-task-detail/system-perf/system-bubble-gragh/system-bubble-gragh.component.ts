import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { RespCoreInfo, RespOptimizationQuery, SystemCpuTarget } from '../../system-perf/domain';
import { BubbleInfo, CpuTargetStatus, OptimizationTypeEnum, TargetThreshold } from '../../domain';
import { CurrOptimization, TuningHelperRightService } from '../../service/tuninghelper-right.service';
import {
  TaskDetailMessageService,
  TopologyTreeMessageType,
  TopologyTreeMessageData
} from '../../service/topology-tree';

type CoreViewDataSet = {
  idle: {
    numa: {
      [numaId: number]: number;
    };
    core: Array<BubbleInfo>;
  };
  normal: {
    numa: {
      [numaId: number]: number;
    };
    core: Array<BubbleInfo>;
  };
  busy: {
    numa: {
      [numaId: number]: number;
    };
    core: Array<BubbleInfo>;
  };
};

type NumaViewDataSet = {
  [numaId: number]: Array<{
    id: number;
    opacity: number;
    status: CpuTargetStatus;
    percent: number;
  }>;
};

@Component({
  selector: 'app-system-bubble-gragh',
  templateUrl: './system-bubble-gragh.component.html',
  styleUrls: ['./system-bubble-gragh.component.scss'],
})
export class SystemBubbleGraghComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isNumaView = false;
  @Input() cpuTarget: {
    currTarget: SystemCpuTarget;
    currThreshold: TargetThreshold;
  };
  @Input() allTargetThreshold: {
    [target in SystemCpuTarget]?: TargetThreshold;
  } = {};
  @Input() optimizationType: OptimizationTypeEnum;

  @Output() currCoreViewChange = new EventEmitter<CpuTargetStatus>();

  public i18n: any;
  private isInited = false;
  public coreInfoMap: {
    [coreid: number]: RespCoreInfo;
  } = {};
  /** core视图数据集 */
  public coreViewDataSet: {
    [target in SystemCpuTarget]?: CoreViewDataSet
  } = {};
  /** numa视图数据集，数组中的值为core id */
  public numaViewDataSet: {
    [target in SystemCpuTarget]?: NumaViewDataSet
  } = {};
  /** numa利用率 */
  public numaPercentSet: {
    [numaId: number]: {
      [target in SystemCpuTarget]?: number
    };
  } = {};
  /** 当前显示的core视图 */
  public currShowCoreView: CpuTargetStatus = 'busy';
  /** 当前右侧面板显示的核的id */
  public currShowCoreDetailsId: number;
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
        if (msg.type !== CurrOptimization.sysCoreDetail) {
          this.currShowCoreDetailsId = null;
        }
      }
    });

    this.currCoreViewChange.emit(this.currShowCoreView);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cpuTarget && this.cpuTarget.currTarget && this.cpuTarget.currThreshold) {
      if (!this.isInited) {
        this.initData();
        return;
      }
      const previousValue = changes.cpuTarget.previousValue;
      const currentValue = changes.cpuTarget.currentValue;
      // 指标没变，指标阈值被修改
      if (previousValue.currTarget === currentValue.currTarget
        && (previousValue.currThreshold.lowValue !== currentValue.currThreshold.lowValue
        || previousValue.currThreshold.highValue !== currentValue.currThreshold.highValue)) {
        this.refresh();
      }
    }
  }

  private async initData() {
    await this.initCoreList();
    this.isInited = true;
  }

  private async refresh() {
    await this.initCoreList();
  }

  private async initCoreList() {
    const resp = await this.getCoreList();
    if (!resp) { return; }
    this.coreViewDataSet = {};
    this.numaViewDataSet = {};
    this.numaPercentSet = {};
    const systemCpuTarget = Object.keys(SystemCpuTarget) as Array<SystemCpuTarget>;
    // 初始化coreViewDataSet和numaViewDataSet
    for (const cpuTarget of systemCpuTarget) {
      this.coreViewDataSet[cpuTarget] = {
        idle: { numa: {}, core: [] },
        normal: { numa: {}, core: [] },
        busy: { numa: {}, core: [] },
      };
      this.numaViewDataSet[cpuTarget] = {};
    }

    const numaObj: any = {};
    resp.forEach(item => {
      delete item.id;
      this.coreInfoMap[item.core_id] = item;
      numaObj[item.numa_id] = 0;
      for (const cpuTarget of systemCpuTarget) {
        const percent = item[cpuTarget] / 100;
        // 填充cpuCoreDataMap的percent值
        const status = this.getStatus(cpuTarget, percent);
        const opacity = this.computeOpacity(percent, status, this.allTargetThreshold[cpuTarget]);
        // 填充coreViewDataSet的core数组
        this.coreViewDataSet[cpuTarget][status].core.push({
          id: item.core_id, opacity
        });

        // 初始化numaViewDataSet
        if (!this.numaViewDataSet[cpuTarget][item.numa_id]) {
          this.numaViewDataSet[cpuTarget][item.numa_id] = [];
        }
        this.numaViewDataSet[cpuTarget][item.numa_id].push({
          id: item.core_id, opacity, status, percent
        });
      }

    });

    // 计算numa利用率、填充coreViewDataSet的numa值
    for (const cpuTarget of systemCpuTarget) {
      // 为coreViewDataSet定义numa的0值
      this.coreViewDataSet[cpuTarget].idle.numa = JSON.parse(JSON.stringify(numaObj));
      this.coreViewDataSet[cpuTarget].normal.numa = JSON.parse(JSON.stringify(numaObj));
      this.coreViewDataSet[cpuTarget].busy.numa = JSON.parse(JSON.stringify(numaObj));

      for (const numaId of Object.keys(this.numaViewDataSet[cpuTarget])) {
        const id = +numaId;
        const numaSet = this.numaViewDataSet[cpuTarget][id];
        if (!this.numaPercentSet[id]) {
          this.numaPercentSet[id] = {};
        }
        let total = 0;
        // 填充coreViewDataSet的numa值
        numaSet.forEach(({status, percent}) => {
          total += percent;
          this.coreViewDataSet[cpuTarget][status].numa[id]++;
        });
        // 计算numa利用率
        this.numaPercentSet[id][cpuTarget] = total / numaSet.length;
      }
    }

  }

  /**
   * 根据指标及利用率区间计算透明度
   *
   * @param percent 原利用率
   * @param targetStatus 指标状态
   * @param threashold 利用率区间
   */
  private computeOpacity(percent: number, targetStatus: CpuTargetStatus, threashold: TargetThreshold) {
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
    cpuTarget: SystemCpuTarget,
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

  private async getCoreList() {
    const params = {
      'node-id': this.statusService.nodeId,
      'service-type': JSON.stringify(
        this.statusService.serviceType.filter(item => item.checked).map(item => item.value)),
      'optimization-type': 'system_performance',
    };
    const resp: RespCommon<RespOptimizationQuery> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/optimization-query/`,
      { params }
    );
    return resp?.data?.optimization?.data?.core_list;
  }

  public switchCoreView(target: CpuTargetStatus) {
    if (this.currShowCoreView === target) {
      return;
    }
    this.currShowCoreView = target;
    this.currCoreViewChange.emit(target);
  }

  public onCoreBubbleClick(coreId: number) {
    this.currShowCoreDetailsId = coreId;
    this.rightService.sendMessage({
      type: CurrOptimization.sysCoreDetail,
      data: {
        coreId,
        currTarget: this.cpuTarget.currTarget,
        optimizationType: this.optimizationType,
      },
    });

    // 发送消息取消选中树节点
    const messageData: TopologyTreeMessageData = {
      optimizationType: this.optimizationType,
    };
    this.taskDetailMessageService.updataTopologyTree(TopologyTreeMessageType.cancelSelectTreeNode, messageData);
  }

  ngOnDestroy(): void {
    this.serviceTypeChangeSub?.unsubscribe();
    this.rightSub?.unsubscribe();
  }

}
