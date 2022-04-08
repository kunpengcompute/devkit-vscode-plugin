import { Component, OnInit, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';

@Component({
  selector: 'app-tracing',
  templateUrl: './tracing.component.html',
  styleUrls: ['./tracing.component.scss']
})
export class TracingComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() tabShowing: boolean;
  @Input() sceneSolution: any;
  public initializing = true;
  public i18n: any;
  public fileName = '--';
  public fileSize = '--';
  public contentList: string[] = [];

  constructor(public i18nService: I18nService, public Axios: AxiosService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.getData();
  }

  public getData() {
    this.Axios.axios.get('/tasks/' + this.taskid + '/sys-performance/trace-session/', {
      params: { nodeId: this.nodeid }, headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      if (res.data) {
        this.contentList = res.data?.session;
        this.fileName = res.data?.name || '--';
        this.fileSize = res.data?.size || '--';
      }

    })
      .finally(() => {
        this.initializing = false;
      });
  }

  /**
   * 下载文件
   */
  public downloadFile() {
    this.Axios.axios.get('/tasks/' + this.taskid + '/sys-performance/download-data/', {
      params: { nodeId: 1, queryType: 'download-data', queryTarget: 'download-traces' }, headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      if (res) {
        this.Axios.downloadFile(JSON.stringify(res), this.fileName);
      }

    });
  }
}
