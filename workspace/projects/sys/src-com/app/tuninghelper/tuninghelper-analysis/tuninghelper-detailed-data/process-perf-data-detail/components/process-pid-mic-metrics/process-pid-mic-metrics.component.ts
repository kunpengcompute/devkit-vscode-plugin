import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-process-pid-mic-metrics',
  templateUrl: './process-pid-mic-metrics.component.html',
  styleUrls: ['./process-pid-mic-metrics.component.scss']
})
export class ProcessPidMicMetricsComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    this.setMicMetricsTableData(sourceData);
  }
  public tableData: CommonTableData;
  public micMetricsData: any = {
    cycles: '--',
    instructions: '--',
    IPC: '--'
  };
  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置微架构指标信息
   * @param data 数据源
   */
  private setMicMetricsTableData(data: any) {
    const srcData = [];
    const notContainKeys = ['cycles', 'instructions', 'IPC'];
    if (data) {
      this.micMetricsData = data;
      this.micMetricsData.cycles = this.micMetricsData.cycles ?? '--';
      this.micMetricsData.instructions = this.micMetricsData.instructions ?? '--';
      this.micMetricsData.IPC = this.micMetricsData.IPC ?? '--';
      for (const key of Object.keys(data)) {
        if (notContainKeys.indexOf(key) === -1) {
          srcData.push({
            metrics: key,
            value: data[key]
          });
        }
      }
    }
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.micarch.eventName,
        width: '40%',
        key: 'metrics',
        checked: true,
      },
      {
        label: I18n.tuninghelper.taskDetail.value,
        width: '60%',
        key: 'value',
        checked: true,
      }
    ];
    this.tableData = {
      srcData: {
        data: srcData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree,
    };
  }

}
