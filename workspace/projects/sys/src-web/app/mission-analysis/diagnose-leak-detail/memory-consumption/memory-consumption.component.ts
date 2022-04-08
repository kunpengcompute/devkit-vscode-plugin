import {
  Component, OnInit, Input, ElementRef
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { LeftShowService } from '../../../service/left-show.service';

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
  public i18n: any;
  public noDataInfo = '';
  public isTable = false;
  public isExpand = false;
  public headers: { label: any; content: any; }[] = [];
  public tableData: any;

  public selectedProcess = { label: '--', disabled: false, pid: '--', type: '--' };
  public processOption: { label: any, disabled: boolean, pid: any, type: any }[] = [];
  public isProcessOption = true;
  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    private el: ElementRef,
    public tableService: TableService,
    private leftShowService: LeftShowService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.noDataInfo = this.i18n.common_term_task_nodata;
  }

  ngOnInit(): void {
    this.headers = [{ label: this.i18n.diagnostic.consumption.apply, content: '' },
    { label: this.i18n.diagnostic.consumption.distributor, content: '' },
    { label: this.i18n.diagnostic.consumption.mem_size, content: '' }];
    this.getHeaders();
    this.getPIDList();
  }

  /**
   * 表格图标切换
   */
  public chart() {
    this.isTable = !this.isTable;
    this.leftShowService.leftIfShow.next();
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
    const params = {
      nodeId: this.nodeId,
    };
    this.Axios.axios.get('/memory-analysis/' + this.taskId + '/running-env/', {
      params, headers: {
        showLoading: false,
      },
    })
      .then((resp: any) => {
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
    this.Axios.axios.get('/memory-analysis/' + this.taskId + '/pid-list/', {
      params, headers: {
        showLoading: false,
      },
    })
      .then((resp: any) => {
        const data = resp.data?.memory_pid?.data?.data;
        if (data.length > 0) {
          data.forEach((val: any[]) => {
            const item = { label: val[1] || '--', disabled: false, pid: val[0], type: val[2] };
            this.processOption.push(item);
          });
          this.isProcessOption = this.processOption.length > 1 ? true : false;
          this.selectedProcess = this.processOption[0] ? this.processOption[0] : this.selectedProcess;
          this.getMap();
        }
      })
      .catch(() => {
        this.isProcessOption = false;
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
    this.Axios.axios.get('/memory-analysis/' + this.taskId + '/mapping-summary/', {
      params, headers: {
        showLoading: true,
      },
    })
      .then((resp: any) => {
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
      })
      .catch(() => {
        this.tableData = [];
      });
  }
}
