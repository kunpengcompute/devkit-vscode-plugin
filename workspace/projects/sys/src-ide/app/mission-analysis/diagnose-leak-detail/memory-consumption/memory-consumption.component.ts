import { Component, OnInit, Input } from '@angular/core';
import { I18n } from 'sys/locale';
import { VscodeService } from '../../../service/vscode.service';
import { Utils } from '../../../service/utils.service';

@Component({
  selector: 'app-memory-consumption',
  templateUrl: './memory-consumption.component.html',
  styleUrls: ['./memory-consumption.component.scss']
})
export class MemoryConsumptionComponent implements OnInit {

  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskId: any;
  @Input() nodeId: any;
  public language = 'zh';
  public i18n = I18n;
  public noDataInfo = '';
  public isTable = false;
  public isExpand = false;
  public headers: { label: any; content: any; }[] = [];
  public tableData: any;
  public isProcessOption = true;

  public selectedProcess = { label: '--', disabled: false, pid: '--', type: '--' };
  public processOption: { label: any, disabled: boolean, pid: any, type: any }[] = [];
  constructor(
    private vscodeService: VscodeService
  ) {
    this.noDataInfo = this.i18n.common_term_task_nodata2;
  }

  ngOnInit(): void {
    this.headers = [{ label: this.i18n.diagnostic.consumption.apply, content: '' },
    { label: this.i18n.diagnostic.consumption.distributor, content: '' },
    { label: this.i18n.diagnostic.consumption.mem_size, content: '' }];
    this.getHeaders();
    this.getPIDList();
  }

  /**
   * 切换进程
   */
  public selectProcess() {
    this.getMap();
  }

  /**
   * 获取头部信息
   */
  public getHeaders() {
    this.vscodeService.get({
      url: '/memory-analysis/' + this.taskId + '/running-env/?nodeId=' + this.nodeId + ''
    }, (resp: any) => {
      const data = resp.data?.running_env?.data?.data[0];
      if (data?.length > 0) {
        data.forEach((val: any, idx: number) => {
          this.headers[idx].content = val;
        });
      }
    });
  }

  /**
   * 获取PID信息
   */
  public getPIDList() {
    const params = {
      nodeId: this.nodeId,
    };
    this.vscodeService.get({
      url: '/memory-analysis/' + this.taskId + '/pid-list/?nodeId=' + this.nodeId + ''
    }, (resp: any) => {
      const data = resp.data?.memory_pid?.data?.data;
      if (data.length > 0) {
        data.forEach((val: any[]) => {
          const item = { label: val[1] || '--', disabled: false, pid: val[0], type: val[2] };
          this.processOption.push(item);
        });
        this.isProcessOption = this.processOption.length > 1 ? true : false;
        this.selectedProcess = this.processOption[0] ? this.processOption[0] : this.selectedProcess;
        this.getMap();
      } else {
        this.isProcessOption = false;
      }
    });
  }

  /**
   * 获取map信息
   */
  public getMap() {
    const params = {
      nodeId: this.nodeId,
      pid: this.selectedProcess.pid,
    };
    let url = '/memory-analysis/' + this.taskId + '/mapping-summary/?';
    url += Utils.converUrl(params);
    this.vscodeService.get({ url }, (resp: any) => {
      if (resp.code.includes('Success')) {
        const data = resp.data?.mapping_summary?.data?.data;
        if (data.length > 0) {
          this.tableData = [];
          data.forEach((val: any, idx: number) => {
            const item = {
              address: val[1], mmapping: val[2], rss_peak: val[3],
              vss_peak: val[4], label: val[1] + ',' + val[2], disabled: false
            };
            this.tableData.push(item);
          });
        }
      } else {
        this.tableData = [];
      }

    });
  }
}
