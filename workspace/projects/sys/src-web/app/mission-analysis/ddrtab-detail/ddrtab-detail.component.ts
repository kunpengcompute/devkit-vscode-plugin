import { Component, OnInit, Input } from '@angular/core';
import { MessageService} from 'projects/sys/src-web/app/service/message.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService} from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';

@Component({
  selector: 'app-ddrtab-detail',
  templateUrl: './ddrtab-detail.component.html',
  styleUrls: ['./ddrtab-detail.component.scss']
})
export class DdrtabDetailComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() id: any;
  @Input() nodeid: any;

  public  analysisType = AnalysisType.MemAccess;
  i18n: any;
  public detailList: Array<any> = [];
  public initializing = false;
  constructor(public mytip: MytipService, private Axios: AxiosService, public i18nService: I18nService,
              public leftShowService: LeftShowService) {
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
        title: this.i18n.ddr.tabCatch,
        active: false,
        disable: true,
      },
      {
        title:  this.i18n.ddr.tabDdr,
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
      this.initTab();
    } else {
      this.detailList[3].active = true;
      this.detailList[0].active = false;
      this.detailList[0].disable = true;
      this.detailList[1].disable = true;
      this.detailList[4].disable = false;
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
      this.initializing = false;
    }
  }
  public initTab() {
    const params = {
      'node-id': this.nodeid,
    };

    this.initializing = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.id)}/common/configuration/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((resp: any) => {
      if (resp.data) {
        resp.data.task_param.type.forEach((item: any, i: any): any => {
          if (this.status === 'Failed') {return false; }
          if (item === 'cache_access' && resp.data.task_param.type.length === 1) {
            this.detailList[1].disable = false;
            this.detailList.splice((i + 2), 1);
          } else if (item === 'cache_access' && resp.data.task_param.type.length === 2) {
            this.detailList[1].disable = false;
          } else if (item === 'ddr_access' && resp.data.task_param.type.length === 1) {
            this.detailList[2].disable = false;
            this.detailList.splice((i + 1), 1);
          } else {
            this.detailList[2].disable = false;
          }

        });
      }

      this.detailList[0].active = true;
      this.detailList[0].disable = false;
    }).finally(() => {
      this.initializing = false;
    });
  }
  public change() {
    this.leftShowService.leftIfShow.next();
  }

  public updateIs1616(is1616: boolean) {
    if (is1616) {
      this.detailList = this.detailList.filter(item => item.title !== this.i18n.ddr.tabDdr);
    }
  }
}
