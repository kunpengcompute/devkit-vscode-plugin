import { Component, OnInit, Input } from '@angular/core';
import { HttpService, I18nService, UrlService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-mission-log',
  templateUrl: './mission-log.component.html',
  styleUrls: ['./mission-log.component.scss'],
})
export class MissionLogComponent implements OnInit {
  private url: any;
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() status: any;
  @Input() collectionLog: any;
  i18n: any;
  constructor(
    private http: HttpService,
    private urlService: UrlService,
    public i18nService: I18nService
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
  }

  public Acq: Array<any> = [];
  public Data: Array<any> = [];
  public obtainingLog = true;
  ngOnInit() {
    const param = {
      nodeid: this.nodeid,
      'analysis-type':
        this.analysisType.indexOf('C++') > -1
          ? 'C/C++ Program'
          : 'java-mixed-mode',

      nav_name: 'Collection_Log',
    };
    // 取消状态停止查询采集日志
    if (this.status === 'Cancelled') {
      this.obtainingLog = false;
      return;
    }
    // 如果父组件已经处理过采集日志，停止查询
    if (this.collectionLog) {
      this.obtainingLog = false;
      return;
    }
    let url = '';
    if (this.analysisType === 'task_contrast') {
      url = '/tasks/taskcontrast/collection-logs/?taskId=' + this.taskid;
    } else {
      url =
        this.url.toolTask +
        encodeURIComponent(this.taskid) +
        this.url.toolTaskCommonLogs +
        '?node-id=' +
        encodeURIComponent(param.nodeid) +
        '&nav-name=Collection_Log';
    }
    this.http.get(url, {
      headers: { showLoading: false },
    }).then((resp: any) => {
      // 联动分析没有采集过程, 且分析过程在collect中
      if (this.analysisType === 'task_contrast') {
        if (resp.data && resp.data.Collect) {
          this.Data = resp.data.Collect;
        }
      } else {
        if (resp.data && resp.data.process) {
          this.Data = resp.data.process;
        }
        if (resp.data && resp.data.Collect) {
          this.Acq = resp.data.Collect;
        }
      }
    }).finally(() => {
      this.obtainingLog = false;
    });
  }
}
