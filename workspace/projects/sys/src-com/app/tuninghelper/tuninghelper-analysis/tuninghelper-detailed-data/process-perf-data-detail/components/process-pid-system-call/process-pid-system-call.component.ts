import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-process-pid-system-call',
  templateUrl: './process-pid-system-call.component.html',
  styleUrls: ['./process-pid-system-call.component.scss']
})
export class ProcessPidSystemCallComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setSystemCallTableData(sourceData);
    }
  }
  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   *  设置操作系统的调用
   * @param data 数据源
   */
  private setSystemCallTableData(data: any) {
    const columnsTree: Array<TiTreeNode> = [
      {
        label: '%time',
        width: '17%',
        key: 'time_percentage',
        checked: true,
      },
      {
        label: 'seconds',
        width: '17%',
        key: 'seconds',
        checked: true,
      },
      {
        label: 'usecs/call',
        width: '17%',
        key: 'usecs_call',
        checked: true,
      },
      {
        label: 'calls',
        width: '17%',
        key: 'calls',
        checked: true,
      },
      {
        label: 'errors',
        width: '16%',
        key: 'errors',
        checked: true,
      },
      {
        label: 'syscall',
        width: '16%',
        key: 'syscall',
        checked: true,
      },
    ];
    const srcData = data || [];
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
