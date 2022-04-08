import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { OptimizationTypeEnum } from '../../domain';
import { TuningHelperRightService, CurrOptimization } from '../../service/tuninghelper-right.service';

@Component({
  selector: 'app-system-perf-sug-detail',
  templateUrl: './system-perf-sug-detail.component.html',
  styleUrls: ['./system-perf-sug-detail.component.scss'],
})
export class SystemPerfSugDetailComponent implements OnInit, OnDestroy {

  @Input() optimizationType: OptimizationTypeEnum;  // 优化类型

  public readonly CurrOptimization = CurrOptimization;
  public currOptimization: CurrOptimization;

  private rightSub: Subscription;

  constructor(private rightService: TuningHelperRightService) {
    this.rightSub = this.rightService.subscribe({
      next: (data: any) => {
        if (this.optimizationType === data.data.optimizationType) {
          this.currOptimization = data.type;
        }
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.rightSub?.unsubscribe();
  }

}
