import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
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

  constructor(
    public i18nService: I18nService,
    public vscodeService: VscodeService,
    public sanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.getData();
  }

  public getData() {
    const nodeid = this.nodeid;
    this.vscodeService.get(
      { url: '/tasks/' + this.taskid + '/sys-performance/trace-session/?nodeId=' + nodeid },
      (res: any) => {
        if (res.data) {
          this.contentList = res.data?.session || [];
          this.fileName = res.data?.name || '--';
          this.fileSize = res.data?.size || '--';
        }
        this.initializing = false;
      });
  }

  /**
   * 下载文件
   */
  public downloadFile() {
    const url =
      `/tasks/${this.taskid}/sys-performance/download-data/?
      nodeId=${this.nodeid}&queryType=download-data&queryTarget=download-traces`;
    this.vscodeService.get({ url },
      (res: any) => {
        if (res) {
          const content = JSON.stringify(res);
          const message = {
            cmd: 'downloadFile',
            data: {
              fileName: this.fileName,
              fileContent: content,
              invokeLocalSave: true,
              contentType: 'json'
            }
          };
          this.vscodeService.postMessage(message, null);
        }
      });
  }
}
