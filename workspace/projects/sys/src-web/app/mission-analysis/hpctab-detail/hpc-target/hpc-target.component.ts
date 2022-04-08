import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AnalysisTarget, HpcPresetType } from 'projects/sys/src-web/app/domain';

@Component({
  selector: 'app-hpc-target',
  templateUrl: './hpc-target.component.html',
  styleUrls: ['./hpc-target.component.scss'],
})
export class HpcTargetComponent {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() hpcPreset: HpcPresetType;
  @Input() analysisTarget: AnalysisTarget;
  @Input() mpiStatus: any;

  hpcPresetType = HpcPresetType;
  analysisTargetEnum = AnalysisTarget;
  i18n: any;

  constructor(
    private i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }


}
