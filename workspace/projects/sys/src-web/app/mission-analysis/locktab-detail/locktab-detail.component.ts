import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';

@Component({
  selector: 'app-locktab-detail',
  templateUrl: './locktab-detail.component.html',
  styleUrls: ['./locktab-detail.component.scss']
})
export class LocktabDetailComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() id: any;
  @Input() nodeid: any;

  public analysisType = AnalysisType.SystemLock;

  i18n: any;
  public detailList: Array<any> = [];
  constructor(public i18nService: I18nService, public leftShowService: LeftShowService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.detailList = [
      {
        title: this.i18n.common_term_task_tab_summary,
        active: false,
        disable: true,
      },
       {
        title: this.i18n.lock.timing,
        active: false,
        disable: true,
      },
      {
        title: this.i18n.common_term_task_tab_congration,
        active: false,
        disable: false,
      },
      {
        title: this.i18n.common_term_task_tab_log,
        active: false,
        disable: false,
      }

    ];
    if (this.status === 'Completed' || this.status === 'Aborted') {
       this.detailList[1].disable = false;
       this.detailList[0].disable = false;
       this.detailList[0].active = true;


    } else {
      this.detailList[2].active = true;
      this.detailList[0].active = false;
      this.detailList[0].disable = true;
      this.detailList[1].disable = true;
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
    }
  }
  public change() {
    this.leftShowService.leftIfShow.next();
  }
}
