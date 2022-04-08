
import { Component, OnInit, ViewChild, OnChanges, SimpleChanges, Input, OnDestroy } from '@angular/core';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';

@Component({
  selector: 'app-storage-detail',
  templateUrl: './storage-detail.component.html',
  styleUrls: ['./storage-detail.component.scss']
})
export class StorageDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() functionType: any;
  @Input() id: any;
  @Input() nodeid: any;
  @Input() active: any;

  @ViewChild('functionModal') functionModal: any;
  @ViewChild('appDiskIoRef') appDiskIoRef: any;

  public analysisType = AnalysisType.IoPerf;

  public selectDetail = {
    dev: '',
    pid: '',
    func: ''
  };
  public subscription: any;
  i18n: any;
  constructor(
    private msgService: MessageService,
    public i18nService: I18nService,
    public leftShowService: LeftShowService,
    private Axios: AxiosService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public detailList: Array<any> = [];
  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
  }

  ngOnInit() {
    this.detailList = [
      {
        title: this.i18n.common_term_task_tab_summary,
        disable: true,
        active: false
      },
      {
        title: this.i18n.storageIO.disk_title,
        disable: true,
        active: false,
        prop: 'disk',
      },
      {
        title: this.i18n.common_term_task_tab_congration,
        active: false,
        disable: false,
        prop: 'configuration',
      },
      {
        title: this.i18n.common_term_task_tab_log,
        active: false,
        disable: false,
      }
    ];
    if (this.status === 'Completed' || this.status === 'Aborted') {

      this.detailList[0].disable = false;
      this.detailList[1].disable = false;
      this.detailList[0].active = true;
      this.initTab();
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
    setTimeout(() => {
      this.subscription = this.msgService.getMessage().subscribe((msg) => {
        if (msg.taskName !== this.taskName) { return; }
        this.selectDetail = msg.detail;
        this.detailList[0].active = false;
        if (msg.function === 'disk' && this.detailList.length === 5) {
          this.detailList[2].disable = true;
          setTimeout(() => {
            this.detailList[2].disable = false;
            this.detailList[2].active = true;
          }, 300);

        } else {
          this.detailList[1].disable = true;
          setTimeout(() => {
            this.detailList[1].disable = false;
            this.detailList[1].active = true;
          }, 300);
        }
      });
    }, 500);
  }

  public async initTab() {
    const params = {
      'node-id': this.nodeid,
      'analysis-type': 'ioperformance',

    };
    const resp = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.id)}/common/configuration/`, {
      params,
      headers: {
        showLoading: false,
      },
    });
    if (resp.data) {
      if (resp.data.analysisTarget !== 'Profile System') {
        this.detailList.splice(this.detailList.findIndex(item => item.prop === 'disk'), 0, {
          title: this.i18n.storageIO.apis_title,
          disable: false,
          active: false
        });
      }
    }
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  public change(item: any) {
    // ioapis
    if (item.title === this.i18n.storageIO.apis_title && item.active) {
      this.functionModal?.showAllData();
    }

    // diskio
    if (item.title === this.i18n.storageIO.disk_title && item.active) {
      this.appDiskIoRef?.showAllData();
    }
    this.leftShowService.leftIfShow.next();
  }

}

