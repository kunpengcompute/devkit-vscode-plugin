import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import {MytipService} from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';
import { BatchRequestService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-protab-detail',
  templateUrl: './protab-detail.component.html',
  styleUrls: ['./protab-detail.component.scss'],
  providers: [ BatchRequestService ],
})
export class ProtabDetailComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() active: any;
  @Input() id: any;
  @Input() nodeid: any;

  public analysisType = AnalysisType.ProcessThread;
  public subscription: any;
  i18n: any;
  public detailList: Array<any> = [];
  public initializing = true;
  constructor(public mytip: MytipService, private Axios: AxiosService, public i18nService: I18nService,
              public leftShowService: LeftShowService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.detailList = [
      {
        title: this.i18n.common_term_task_tab_summary,
        disable: true,
        active: false
      },
      {
        title: this.i18n.sys.cpu,
        disable: true,
        active: false
      },
      {
        title: this.i18n.sys.mem,
        disable: true,
        active: false
      },
      {
        title: this.i18n.sys.disk,
        disable: true,
        active: false
      },
      {
        title: this.i18n.process.context,
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
      },
    ];

    if (this.status === 'Completed' || this.status === 'Aborted') {
      this.initTab();
    } else {
      this.detailList[5].active = true;
      this.detailList[0].active = false;
      this.detailList[0].disable = true;
      this.detailList[1].disable = true;
      this.detailList[2].disable = true;
      this.detailList[3].disable = true;
      this.detailList[4].disable = true;
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
      this.initializing = false;
    }
  }
  public async initTab() {
    const params = {
      'node-id': this.nodeid,
    };
    this.initializing = true;
    try {
      const resp = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.id)}/common/configuration/`, {
        params,
        headers: {
          showLoading: false,
        }
      });
      this.initializing = false;
      if (resp.data) {
          resp.data.task_param.type.forEach((item: any): any => {
          if (this.status === 'Failed') {
            return false;
          }

          if (item === 'cpu') {
            this.detailList[1].disable = false;
          } else if (item === 'mem') {
            this.detailList[2].disable = false;
          } else if (item === 'disk') {
            this.detailList[3].disable = false;
          } else if (item === 'context') {
            this.detailList[4].disable = false;
          }
        });
      }
      this.detailList[0].active = true;
      this.detailList[0].disable = false;
      for (let index = this.detailList.length - 1; index >= 0 ; index--) {
        if (this.detailList[index].disable === true) {
          this.detailList.splice(index, 1);
        }
      }
    } catch (error) {
      this.initializing = false;
    }
  }
  public change() {
    this.leftShowService.leftIfShow.next();
  }

  // 获取cmdline信息
  public getCmdline(queryPtid: any) {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      'query-target': 'cmdline',
      'query-ptid': queryPtid,
    };

    return new Promise((resolve, reject) => {
      this.Axios.axios.get(`/tasks/${encodeURIComponent(this.id)}/process-analysis/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve({
          queryPtid,
          cmdline: res.data.cmd_line,
        });
      }).catch((e: any) => {
        reject(e);
      });
    });
  }
}
