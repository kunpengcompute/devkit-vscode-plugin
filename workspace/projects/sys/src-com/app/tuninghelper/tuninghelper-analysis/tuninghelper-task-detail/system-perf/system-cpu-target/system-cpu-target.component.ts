import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService, I18nService, TipService } from 'sys/src-com/app/service';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';
import { TargetThreshold } from '../../domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { SystemCpuTarget, RespIndicatorThreshold } from '../domain';

@Component({
  selector: 'app-system-cpu-target',
  templateUrl: './system-cpu-target.component.html',
  styleUrls: ['./system-cpu-target.component.scss']
})
export class SystemCpuTargetComponent implements OnInit {

  @ViewChild('coreThresholdPop') coreThresholdPop: PopDirective;

  @Output() cpuTargetChange = new EventEmitter<{
    target: SystemCpuTarget;
    threshold: TargetThreshold
  }>();
  @Output() cpuTargetInit = new EventEmitter<{
    [target in SystemCpuTarget]?: TargetThreshold;
  }>();

  public i18n: any;
  /** cpu指标下拉框选项 */
  public cpuTargetOptions: Array<{ label: string; value: string }> = [
    {
      label: '%' + SystemCpuTarget.sys,
      value: SystemCpuTarget.sys,
    },
    {
      label: '%user',
      value: SystemCpuTarget.usr,
    },
    {
      label: '%' + SystemCpuTarget.iowait,
      value: SystemCpuTarget.iowait,
    },
    {
      label: '%' + SystemCpuTarget.irq,
      value: SystemCpuTarget.irq,
    },
    {
      label: '%' + SystemCpuTarget.soft,
      value: SystemCpuTarget.soft,
    },
    {
      label: '%' + SystemCpuTarget.idle,
      value: SystemCpuTarget.idle,
    },
  ];
  /** cpu指标下拉框选中值 */
  public cpuTargetSelected = SystemCpuTarget.sys;
  /** 每个指标对应的阈值范围 */
  public targetThreshold: {
    [target in SystemCpuTarget]?: TargetThreshold;
  } = {};

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private tip: TipService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.initTargetThreshold();
  }

  private async initTargetThreshold() {
    const resp = await this.getTargetThreshold();
    if (!resp) { return; }
    resp.forEach(item => {
      this.targetThreshold[item.metric] = {
        id: item.id,
        lowValue: item.low_value / 100,
        highValue: item.high_value / 100,
      };
    });
    this.cpuTargetInit.emit(this.targetThreshold);
    this.cpuTargetChange.emit({
      target: this.cpuTargetSelected,
      threshold: this.targetThreshold[this.cpuTargetSelected]
    });
  }

  private async getTargetThreshold() {
    const params = {
      'node-id': this.statusService.nodeId,
    };
    const resp: RespCommon<RespIndicatorThreshold> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/indicator-threshold/`,
      { params }
    );
    return resp?.data?.optimization?.data?.threshold;
  }

  public getThresholdTipContext() {
    return { ...this.targetThreshold[this.cpuTargetSelected] };
  }

  public modifyTargetThreshold(targetThreshold: TargetThreshold) {
    this.putTargetThreshold(targetThreshold).then(() => {
      this.targetThreshold[this.cpuTargetSelected].lowValue = targetThreshold.lowValue;
      this.targetThreshold[this.cpuTargetSelected].highValue = targetThreshold.highValue;
      this.coreThresholdPop.hide();
      this.cpuTargetChange.emit({
        target: this.cpuTargetSelected,
        threshold: this.targetThreshold[this.cpuTargetSelected]
      });
    }).catch(error => {
      this.tip.error(error.message);
    });
  }

  private putTargetThreshold(targetThreshold: TargetThreshold) {
    const params = {
      nodeId: this.statusService.nodeId,
      metric: this.cpuTargetSelected,
      config: {
        id: targetThreshold.id,
        // 0.07乘以100会等于7.000000000000001
        lowValue: parseInt(String(targetThreshold.lowValue * 100), 10),
        highValue: parseInt(String(targetThreshold.highValue * 100), 10),
      },
      serviceType: JSON.stringify(this.statusService.serviceType.filter(item => item.checked).map(item => item.value))
    };
    return this.http.put(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/configuration-indicators/`,
      params
    );
  }

  public cpuTargetSelectedChange() {
    this.cpuTargetChange.emit({
      target: this.cpuTargetSelected,
      threshold: this.targetThreshold[this.cpuTargetSelected]
    });
  }

}
