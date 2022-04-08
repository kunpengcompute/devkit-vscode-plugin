import { Component, OnInit, Input } from '@angular/core';
import { I18n } from 'sys/locale';
import { HttpService } from 'sys/src-com/app/service';
import { TiModalService } from '@cloud/tiny3';
import { PerfDataService } from '../../server/perf-data.service';
import { WebviewPanelService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-memory-detailed',
  templateUrl: './memory-detailed.component.html',
  styleUrls: ['./memory-detailed.component.scss']
})
export class MemoryDetailedComponent implements OnInit {
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: any;
  @Input() nodeId: number;
  public i18n = I18n;
  public usageData: any[][];
  public usageTitle: any[];
  public numaTitle: any[];
  public numaData: any[];
  public processTitle: any[];
  public processData: any[];
  constructor(
    private panelService: WebviewPanelService,
    private http: HttpService,
    private tiModal: TiModalService,
    private perfData: PerfDataService,
  ) {
    this.usageData = perfData.usageData;
    this.usageTitle = perfData.usageTitle;
    this.numaTitle = perfData.numaTitle;
    this.processTitle = perfData.processTitle;
  }

  ngOnInit(): void {
    this.getData();
  }
  /**
   * process弹窗
   * @param e e
   */
  public viewProcess(e: any) {
    this.tiModal.open(e, {
      id: 'processMemoryUsage',
      modalClass: 'processMemoryUsageModal',
      context: {

      }
    });

  }

  private getData() {
    const params = {
      'node-id': this.nodeId,
      'query-type': JSON.stringify(['mem_tab_info', 'process_mem_info']),
    };
    this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/optimization/system-performance/`, { params })
      .then((res) => {
        const usageArr = ['mem_utilization', 'fetch_statistics', 'hugepage_memory_usage',
          'pagination_statistics', 'exchange_statistics', 'swap_utilization'];
        const data = res.data.optimization.data;
        this.usageData.forEach((item, idx: number) => {
          const value = data[usageArr[idx]];
          if (value) {
            item.forEach(el => {
              el.data = value[el.key] ?? '--';
            });
          }
        });
        this.numaData = data.mem_numa_statistics;
        this.processData = data.process_mem_info;
      });
  }
  /**
   * 查看进程线程
   * @param item item
   */
  public viewThreadsData(item: any, context: any) {
    context.dismiss();
    const thread = item.value;
    this.panelService.addPanel({
      viewType: 'tuninghelperProcessPidDetailsysPerf',
      title: `${thread}${I18n.tuninghelper.treeDetail.detail}`,
      id: `TuninghelperProcessPidDetail-${this.taskId}-${this.nodeId}-${thread}`,
      router: 'tuninghelperProcessPidDetail',
      message: {
        nodeId: this.nodeId,
        taskId: this.taskId,
        pid: +thread.split('PID')[1].split(')')[0],
        showIndicatorInfo: true
      }
    });
  }
}
