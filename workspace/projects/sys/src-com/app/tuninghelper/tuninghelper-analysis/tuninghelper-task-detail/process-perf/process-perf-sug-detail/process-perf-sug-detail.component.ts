import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OptimizationTypeEnum } from '../../domain';
import { CurrOptimization, TuningHelperRightService } from '../../service/tuninghelper-right.service';
import { I18nService } from 'sys/src-com/app/service';
@Component({
  selector: 'app-process-perf-sug-detail',
  templateUrl: './process-perf-sug-detail.component.html',
  styleUrls: ['./process-perf-sug-detail.component.scss']
})
export class ProcessPerfSugDetailComponent implements OnInit, OnDestroy {

  @Input() optimizationType: OptimizationTypeEnum;  // 优化类型

  public readonly CurrOptimization = CurrOptimization;
  public currOptimization: CurrOptimization;

  private rightSub: Subscription;
  public i18n: any;
  constructor(
    private rightService: TuningHelperRightService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.rightSub = this.rightService.subscribe({
      next: (data: any) => {
        if (this.optimizationType === data.data.optimizationType) {
          this.currOptimization = data.type;
        }
      }
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.rightSub?.unsubscribe();
  }

}
