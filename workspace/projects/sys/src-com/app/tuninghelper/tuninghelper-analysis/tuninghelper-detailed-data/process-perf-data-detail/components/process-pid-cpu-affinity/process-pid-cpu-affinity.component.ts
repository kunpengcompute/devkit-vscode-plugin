import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-process-pid-cpu-affinity',
  templateUrl: './process-pid-cpu-affinity.component.html',
  styleUrls: ['./process-pid-cpu-affinity.component.scss']
})
export class ProcessPidCpuAffinityComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    this.setCpuAffinityTableData(sourceData);
  }
  public tableData: CommonTableData;
  public i18n: any;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置CPU亲和性数据
   * @param data 数据源
   */
  private setCpuAffinityTableData(data: any) {
    const srcData = [];
    if (data && data?.pid) {
      let pidData: any = {};
      pidData = data.pid;
      pidData.pid = 'PID' + pidData.pid;
      pidData.expanded = false;
      if (data?.tid) {
        data.tid.forEach((tidItem: any) => {
          tidItem.pid = 'TID' + tidItem.tid;
        });
        pidData.children = data.tid;
      }
      srcData.push(pidData);
    }
    const columnsTree: Array<TiTreeNode> = [
      {
        label: 'PID/TID',
        width: '25%',
        key: 'pid',
        checked: true,
      },
      {
        label: 'CPU affinity',
        width: '25%',
        key: 'cpu_affinity',
        checked: true,
      },
      {
        label: 'CPU core',
        width: '25%',
        key: 'cpu_core',
        checked: true,
      },
      {
        label: 'NUMA NODE',
        width: '25%',
        key: 'numa_node',
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
