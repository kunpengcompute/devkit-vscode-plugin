import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OptimizationTypeEnum, CpuTargetStatus, TargetThreshold } from '../domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { I18nService } from 'sys/src-com/app/service';
import { ProcessCpuTarget } from './domain/process-cpu-target.enum';

@Component({
  selector: 'app-process-perf',
  templateUrl: './process-perf.component.html',
  styleUrls: ['./process-perf.component.scss']
})
export class ProcessPerfComponent implements OnInit {

  @Input() optimizationType: OptimizationTypeEnum;
  @Input() viewCpuTarget: ProcessCpuTarget;

  @Output() cpuTargetChange = new EventEmitter<{
    target: ProcessCpuTarget;
    threshold: TargetThreshold;
  }>();

  public i18n: any;
  /** CPU指标状态 */
  public allTargetThreshold: {
    [target in ProcessCpuTarget]?: TargetThreshold;
  } = {};
  /** 当前显示的指标 */
  public cpuTarget: {
    /** 当前选中指标 */
    currTarget?: ProcessCpuTarget;
    /** 当前选中指标阈值 */
    currThreshold?: TargetThreshold;
  } = {};
  /** 当前查看的气泡图状态 */
  public currCoreView: CpuTargetStatus;

  constructor(
    private i18nService: I18nService,
    public statusService: TuninghelperStatusService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {}

  public onCpuTargetInit(cpuTarget: {
    [target in ProcessCpuTarget]?: TargetThreshold;
  }) {
    this.allTargetThreshold = cpuTarget;
  }

  public onCpuTargetChange(event: {
    target: ProcessCpuTarget;
    threshold: TargetThreshold;
  }) {
    this.cpuTarget = {
      currTarget: event.target,
      // 这样赋值可以使angular的OnChanges生效，原理暂未知
      currThreshold: { ...event.threshold },
    };
    this.allTargetThreshold[event.target] = event.threshold;

    this.cpuTargetChange.emit(event);
    this.statusService.cpuTargetDetail.processPerf.currTarget = event.target;
    this.statusService.cpuTargetDetail.processPerf.currThreshold = { ...event.threshold };
  }

  public onCurrCoreViewChange(currCoreView: CpuTargetStatus) {
    this.currCoreView = currCoreView;
    this.statusService.cpuTargetDetail.processPerf.currCoreView = currCoreView;
  }

}
