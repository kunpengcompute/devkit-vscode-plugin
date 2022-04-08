import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { I18nService } from 'sys/src-com/app/service';
import { CpuTargetStatus, OptimizationTypeEnum, TargetThreshold } from '../domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { SystemCpuTarget } from './domain';

@Component({
  selector: 'app-system-perf',
  templateUrl: './system-perf.component.html',
  styleUrls: ['./system-perf.component.scss'],
})
export class SystemPerfComponent implements OnInit {

  @Input() optimizationType: OptimizationTypeEnum;

  @Output() cpuTargetChange = new EventEmitter<{
    target: SystemCpuTarget;
    threshold: TargetThreshold;
  }>();

  public i18n: any;
  /** CPU指标状态 */
  public allTargetThreshold: {
    [target in SystemCpuTarget]?: TargetThreshold;
  } = {};
  /** 当前显示的指标 */
  public cpuTarget: {
    /** 当前选中指标 */
    currTarget?: SystemCpuTarget;
    /** 当前选中指标阈值 */
    currThreshold?: TargetThreshold;
  } = {};
  /** 是否numa视图 */
  public isNumaView = false;
  /** 当前查看的cpu状态 */
  public currCoreView: CpuTargetStatus;

  constructor(
    private i18nService: I18nService,
    public statusService: TuninghelperStatusService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {}

  public onCpuTargetInit(cpuTarget: {
    [target in SystemCpuTarget]?: TargetThreshold;
  }) {
    this.allTargetThreshold = cpuTarget;
  }

  public onCpuTargetChange(event: {
    target: SystemCpuTarget;
    threshold: TargetThreshold;
  }) {
    this.cpuTarget = {
      currTarget: event.target,
      // 这样赋值可以使angular的OnChanges生效，原理暂未知
      currThreshold: { ...event.threshold },
    };
    this.allTargetThreshold[event.target] = event.threshold;
    this.cpuTargetChange.emit(event);
    this.statusService.cpuTargetDetail.systemPerf.currTarget = event.target;
    this.statusService.cpuTargetDetail.systemPerf.currThreshold = { ...event.threshold };
  }

  public switchView() {
    this.isNumaView = !this.isNumaView;
  }

  public onCurrCoreViewChange(currCoreView: CpuTargetStatus) {
    this.currCoreView = currCoreView;
    this.statusService.cpuTargetDetail.systemPerf.currCoreView = currCoreView;
  }

}
