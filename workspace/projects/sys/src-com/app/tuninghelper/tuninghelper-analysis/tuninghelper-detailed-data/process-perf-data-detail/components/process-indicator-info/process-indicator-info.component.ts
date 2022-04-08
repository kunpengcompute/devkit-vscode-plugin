import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TiTableComponent } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-process-indicator-info',
  templateUrl: './process-indicator-info.component.html',
  styleUrls: ['./process-indicator-info.component.scss'],
  providers: [TiTableComponent]
})
export class ProcessIndicatorInfoComponent implements OnInit {

  @Input()
  set indiacatorInfoData(data: Array<any>) {
    if (data && data.length > 0) {
      this.setIndicatorInfoTableData(data);
    }
  }

  /**
   * pid是否可以点击查看详情
   */
  @Input() isLookPidDetail = false;

  @Output() lookPidDetail = new EventEmitter();


  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置指标信息
   */
  private setIndicatorInfoTableData(data: any) {
    const infoData = data.map((pidItem: any) => {
      const pidData: any = pidItem.PID;
      pidData.id = pidData.pid;
      pidData.pid = 'PID' + pidData.pid;
      pidData.expanded = false;
      if (pidItem?.TID) {
        pidItem.TID.forEach((tidItem: any) => {
          tidItem.pid = 'TID' + tidItem.tid;
        });
        pidData.children = pidItem.TID;
      }
      return pidData;
    });
    const columnsTree: Array<CommonTreeNode> = [
      {
        label: 'PID/TID',
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: true,
        sortKey: 'pid',
        compareType: 'number',
        searchKey: 'pid',
      },
      {
        label: 'CPU',
        key: 'cpu',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%user',
            key: '%user',
            checked: true,
            expanded: true,
            sortKey: '%user',
            compareType: 'number',
            tip: I18n.sys.tip['%user']
          },
          {
            label: '%system',
            key: '%system',
            checked: true,
            expanded: true,
            sortKey: '%system',
            compareType: 'number',
            tip: I18n.sys.tip['%sys']
          },
          {
            label: '%IO wait',
            key: '%IO wait',
            checked: true,
            expanded: true,
            sortKey: '%IO wait',
            compareType: 'number',
            tip: I18n.sys.tip['%iowait']
          },
          {
            label: '%CPU',
            key: '%CPU',
            checked: true,
            expanded: true,
            sortKey: '%CPU',
            compareType: 'number',
            tip: I18n.sys.tip['%cpu']
          }
        ]
      },
      {
        label: 'Memory',
        key: 'memory',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'minflt/s',
            key: 'minflt/s',
            checked: true,
            expanded: true,
            sortKey: 'minflt/s',
            compareType: 'number',
          },
          {
            label: 'majflt/s',
            key: 'majflt/s',
            checked: true,
            expanded: true,
            sortKey: 'majflt/s',
            compareType: 'number',
          },
          {
            label: 'VSZ(KiB)',
            key: 'VSZ(KB)',
            checked: true,
            expanded: true,
            sortKey: 'VSZ(KB)',
            compareType: 'number',
          },
          {
            label: 'RSS(KiB)',
            key: 'RSS(KB)',
            checked: true,
            expanded: true,
            sortKey: 'RSS(KB)',
            compareType: 'number',
          },
          {
            label: '%MEM',
            key: '%MEM',
            checked: true,
            expanded: true,
            sortKey: '%MEM',
            compareType: 'number',
          },
        ]
      },
      {
        label: 'Disk IO',
        key: 'diskIo',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'rd(KiB)/s',
            key: 'rd(KB)/s',
            checked: true,
            expanded: true,
            sortKey: 'rd(KB)/s',
            compareType: 'number',
          },
          {
            label: 'wr(KiB)/s',
            key: 'wr(KB)/s',
            checked: true,
            expanded: true,
            sortKey: 'wr(KB)/s',
            compareType: 'number',
          },
          {
            label: 'IOdelay(tick)',
            key: 'IOdelay(tick)',
            checked: true,
            expanded: true,
            sortKey: 'IOdelay(tick)',
            compareType: 'number',
          },
        ]
      },
      {
        label: 'Switch',
        key: 'switch',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'Cswch/s',
            key: 'Cswch/s',
            checked: true,
            expanded: true,
            sortKey: 'Cswch/s',
            compareType: 'number',
          },
          {
            label: 'Nvcswch/s',
            key: 'Nbcswch/s',
            checked: true,
            expanded: true,
            sortKey: 'Nbcswch/s',
            compareType: 'number',
          },
        ]
      },
      {
        label: 'Command',
        key: 'command',
        checked: true,
        expanded: true,
      },
    ];
    this.tableData = {
      srcData: {
        data: infoData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree,
    };
  }

  /**
   * 点击Pid查看详情
   */
  public clickPidLookDetail(pidData: any) {
    this.lookPidDetail.emit(pidData);
  }

}
