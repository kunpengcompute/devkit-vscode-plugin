import { Component, OnInit, Input } from '@angular/core';
import { AxiosService } from '../../../service/axios.service';
import { MytipService } from '../../../service/mytip.service';
import { I18nService } from '../../../service/i18n.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-configuration-log',
  templateUrl: './configuration-log.component.html',
  styleUrls: ['./configuration-log.component.scss']
})
export class ConfigurationLogComponent implements OnInit {
  private url: any;
  public isDiagnose = false;
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() status: any;
  @Input() collectionLog: any;
  i18n: any;
  constructor(
    private Axios: AxiosService,
    public mytip: MytipService,
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
    this.isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
    const param = {
      nodeid: this.nodeid,
      'analysis-type': this.analysisType.indexOf('C++') > -1 ? 'C/C++ Program' : 'java-mixed-mode',

      nav_name: 'Collection_Log'
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
      url = this.url.toolTask +
        encodeURIComponent(this.taskid) +
        (this.isDiagnose ? '' : '/common') +
        '/collection-logs/?node-id=' +
        param.nodeid +
        '&nav-name=Collection_Log';
    }
    this.Axios.axios.get(url, {
      headers: {
        showLoading: false,
      }
    })
      .then((resp: any) => {
          if (resp.data && resp.data.process) {
            this.Data = resp.data.process;
          }
          if (resp.data && resp.data.Collect) {
            this.Acq = resp.data.Collect;
          }
      })
      .catch((error: any) => {

      }).finally(() => {
        this.obtainingLog = false;
      });
  }
}
