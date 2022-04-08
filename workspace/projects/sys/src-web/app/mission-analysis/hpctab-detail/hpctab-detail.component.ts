import {
  Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { IHpcDetail } from './domain';
import { AnalysisTarget, HpcPresetType, IHpcTaskInfo } from 'projects/sys/src-web/app/domain';
import { TaskInfoService } from './services';

@Component({
  selector: 'app-hpctab-detail',
  templateUrl: './hpctab-detail.component.html',
  styleUrls: ['./hpctab-detail.component.scss'],
})
export class HpctabDetailComponent implements OnInit {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() status: string;
  @Input() taskId: number;
  @Input() nodeId: number;
  public mpiStatus: any;
  detailList: Array<IHpcDetail> = [];
  i18n: any;
  presetType: HpcPresetType;
  analysisTarget: AnalysisTarget;
  hpcTaskInfo: Partial<IHpcTaskInfo> = {};
  constructor(
    private i18nService: I18nService,
    private taskInfoService: TaskInfoService
  ) {
    this.i18n = this.i18nService.I18n();

    this.detailList = [
      {
        title: this.i18n.hpc.summary,
        disable: true,
        active: false
      },
      {
        title: this.i18n.hpc.target,
        disable: true,
        active: false
      },
      {
        title: this.i18n.common_term_task_tab_congration,
        disable: false,
        active: false
      },
      {
        title: this.i18n.common_term_task_tab_log,
        disable: false,
        active: false
      }
    ];
  }

  async ngOnInit() {
    if (this.status === 'Completed' || this.status === 'Aborted') {
      this.detailList[1].disable = false;
      this.detailList[0].disable = false;
      this.detailList[0].active = true;
    } else {
      this.detailList[2].active = true;
      this.detailList[0].active = false;
      this.detailList[0].disable = true;
      this.detailList[1].disable = true;
      this.detailList = this.detailList.filter((item: IHpcDetail) => {
        return !item.disable;
      });
    }

    this.taskInfoService.pullTakeInfo(this.taskId, this.nodeId).then(res => {
      this.hpcTaskInfo = res;
      this.analysisTarget = (this.hpcTaskInfo['analysis-target'] as AnalysisTarget);
      this.presetType = (this.hpcTaskInfo.preset as HpcPresetType);
    });
  }

  public getConfigInfo(configInfo: any) {
    this.mpiStatus = configInfo.data?.mpi_status;
  }
}
