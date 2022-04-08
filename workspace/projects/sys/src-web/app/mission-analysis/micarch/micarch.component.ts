
import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';

@Component({
  selector: 'app-micarch',
  templateUrl: './micarch.component.html',
  styleUrls: ['./micarch.component.scss']
})
export class MicarchComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() id: any;
  @Input() nodeid: any;

  public analysisType = AnalysisType.MicroArch;
  i18n: any;
  public isSummury = true;
  public detailList: Array<any> = [];
  public app = '';
  public nodeApp = '';
  public collectionLog: any = {};
  public configuration: any;
  public initializing = true;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public leftShowService: LeftShowService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  async ngOnInit() {
    this.detailList = [
    ];

    try {
      const resp = await this.Axios.axios.get('/tasks/'
        + encodeURIComponent(this.id)
        + '/common/configuration/?node-id='
        + encodeURIComponent(this.nodeid), {
        headers: {
          showLoading: false,
        }
      });

      this.initializing = false;

      if (resp.data) {
        this.configuration = resp.data.nodeConfig.find((item: any) => item.nodeId === this.nodeid);

        if (Object.prototype.hasOwnProperty.call(resp.data, 'appDir')) {
          this.app = resp.data.appDir || '--';
        }

        if (resp.data.samplingMode === 'summary') {
          this.isSummury = true;
          if (this.status === 'Completed' || this.status === 'Aborted') {
            this.detailList.push(
              {
                title: this.i18n.common_term_task_tab_summary,
                active: true,
                disable: false,
              },
              {
                title: this.i18n.micarch.timing,
                active: false,
                disable: false,
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
              });
          } else {
            this.detailList.push(
              {
                title: this.i18n.common_term_task_tab_summary,
                active: false,
                disable: true,
              },
              {
                title: this.i18n.micarch.timing,
                active: false,
                disable: true,
              },
              {
                title: this.i18n.common_term_task_tab_congration,
                active: true,
                disable: false,
              },
              {
                title: this.i18n.common_term_task_tab_log,
                active: false,
                disable: false,
              });
            for (let index = this.detailList.length; index > 0; index--) {
              if (this.detailList[index - 1].disable) {
                this.detailList.splice((index - 1), 1);
              }
            }
          }
        } else {
          this.isSummury = false;
          if (this.status === 'Completed' || this.status === 'Aborted') {
            this.detailList.push(
              {
                title: this.i18n.common_term_task_tab_summary,
                active: true,
                disable: false,
              },
              {
                title: this.i18n.micarch.timing,
                active: false,
                disable: false,
              },
              {
                title: this.i18n.micarch.details,
                active: false,
                disable: false,
              }, {
              title: this.i18n.common_term_task_tab_congration,
              active: false,
              disable: false,
            },
              {
                title: this.i18n.common_term_task_tab_log,
                active: false,
                disable: false,
              });
          } else {
            this.detailList.push(
              {
                title: this.i18n.common_term_task_tab_summary,
                active: true,
                disable: true,
              },
              {
                title: this.i18n.micarch.timing,
                active: false,
                disable: true,
              },
              {
                title: this.i18n.micarch.details,
                active: false,
                disable: true,
              },
              {
                title: this.i18n.common_term_task_tab_congration,
                active: true,
                disable: false,
              },
              {
                title: this.i18n.common_term_task_tab_log,
                active: false,
                disable: false,
              });
            for (let index = this.detailList.length; index > 0; index--) {
              if (this.detailList[index - 1].disable) {
                this.detailList.splice((index - 1), 1);
              }
            }
          }
        }

        this.getTaskLog();
      }
    } catch (error) {
      this.initializing = false;
    }
  }
  public change() {
    this.leftShowService.leftIfShow.next();
  }

  // 获取任务日志
  public getTaskLog() {
    const params = {
      nodeId: this.nodeid,
    };

    this.initializing = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.id)}/microarchitecture/collection-log/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      this.collectionLog = {
        all: res.data
      };
    }).catch((error: any) => {

    }).finally(() => {
      this.initializing = false;
    });
  }
}

