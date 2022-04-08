import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { ComputerComparisonValueService } from '../../service/computer-comparison-value.service';

@Component({
  selector: 'app-compare-process-indicator-info',
  templateUrl: './compare-process-indicator-info.component.html',
  styleUrls: ['./compare-process-indicator-info.component.scss']
})
export class CompareProcessIndicatorInfoComponent implements OnInit {

  public tableData: CommonTableData;

  @Input()
  set indiacatorInfoData(data: Array<any>) {
    if (data) {
      this.setIndicatorInfoTableData(data);
    }
  }

  @Input() IDColumnLabel = 'PID';
  /**
   * pid是否可以点击查看详情
   */
  @Input() isLookCommandDetail = false;
  @Output() lookCommandDetail = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置表格数据
   */
  public setIndicatorInfoTableData(data: any) {
    let infoData: Array<any> = [];
    try {
      infoData = Object.keys(data).map((dataKey: any) => {
        const infoObj: any = {
          cmdline: dataKey,
          original: dataKey
        };
        const pidData = data[dataKey];
        for (const tempKey of Object.keys(pidData)) {
          if (tempKey === 'original') {
            infoObj[tempKey] = pidData[tempKey];
          } else {
            pidData[tempKey].forEach((tempValue: any, tempIndex: number) => {
              if (tempIndex === 2) {
                infoObj[`${tempKey}${tempIndex + 1}`] = ComputerComparisonValueService.getComparisonValue(
                  pidData[tempKey]);
                infoObj[`${tempKey}${tempIndex + 1}Sort`] = tempValue;
              } else {
                infoObj[`${tempKey === 'tid' ? 'pid' : tempKey}${tempIndex + 1}`] = tempValue;
              }
            });
          }
        }
        return infoObj;
      });
    } catch {}
    const columnsTree: Array<TiTreeNode> = [
      {
        label: 'Command',
        width: '120px',
        key: 'original',
        checked: true,
        disabled: true,
        searchKey: 'original',
        canClick: this.isLookCommandDetail
      },
      {
        label: I18n.tuninghelper.compare.compareValue,
        key: 'compare1',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'CPU',
            key: 'cpu',
            checked: true,
            expanded: true,
            children: [
              {
                label: '%user',
                key: '%user3',
                checked: true,
                expanded: true,
                sortKey: '%user3Sort',
                compareType: 'number',
                tip: I18n.sys.tip['%user']
              },
              {
                label: '%system',
                key: '%system3',
                checked: true,
                expanded: true,
                sortKey: '%system3Sort',
                compareType: 'number',
                tip: I18n.sys.tip['%sys']
              },
              {
                label: '%IO wait',
                key: '%IO wait3',
                checked: true,
                expanded: true,
                sortKey: '%IO wait3Sort',
                compareType: 'number',
                tip: I18n.sys.tip['%iowait']
              },
              {
                label: '%CPU',
                key: '%CPU3',
                checked: true,
                expanded: true,
                sortKey: '%CPU3Sort',
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
                key: 'minflt/s3',
                checked: true,
                expanded: true,
                sortKey: 'minflt/s3Sort',
                compareType: 'number',
                tip: I18n.process.sum.mem.min
              },
              {
                label: 'majflt/s',
                key: 'majflt/s3',
                checked: true,
                expanded: true,
                sortKey: 'majflt/s3Sort',
                compareType: 'number',
                tip: I18n.sys.tip['majflt/s']
              },
              {
                label: 'VSZ(KiB)',
                key: 'VSZ(KB)3',
                checked: true,
                expanded: true,
                sortKey: 'VSZ(KB)3Sort',
                compareType: 'number',
                tip: I18n.process.sum.mem.vsz
              },
              {
                label: 'RSS(KiB)',
                key: 'RSS(KB)3',
                checked: true,
                expanded: true,
                sortKey: 'RSS(KB)3Sort',
                compareType: 'number',
                tip: I18n.process.sum.mem.rss
              },
              {
                label: '%MEM',
                key: '%MEM3',
                checked: true,
                expanded: true,
                sortKey: '%MEM3Sort',
                compareType: 'number',
                tip: I18n.process.sum.mem.mem
              },
            ]
          },
          {
            label: 'Disk IO',
            key: 'diskIo3',
            checked: true,
            expanded: true,
            children: [
              {
                label: 'rd(KiB)/s',
                key: 'rd(KB)/s3',
                checked: true,
                expanded: true,
                sortKey: 'rd(KB)/s3Sort',
                compareType: 'number',
                tip: I18n.sys.tip['rd(KB)/s']
              },
              {
                label: 'wr(KiB)/s',
                key: 'wr(KB)/s3',
                checked: true,
                expanded: true,
                sortKey: 'wr(KB)/s3Sort',
                compareType: 'number',
                tip: I18n.sys.tip['wr(KB)/s']
              },
              {
                label: 'IOdelay(tick)',
                key: 'IOdelay(tick)3',
                checked: true,
                expanded: true,
                sortKey: 'IOdelay(tick)3Sort',
                compareType: 'number',
                tip: I18n.process.sum.disk.iodelay
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
                key: 'Cswch/s3',
                checked: true,
                expanded: true,
                sortKey: 'Cswch/s3Sort',
                compareType: 'number',
                tip: I18n.tuninghelper.detailedData.cswch_tip
              },
              {
                label: 'Nvcswch/s',
                key: 'Nbcswch/s3',
                checked: true,
                expanded: true,
                sortKey: 'Nbcswch/s3Sort',
                compareType: 'number',
                tip: I18n.process.sum.context.nvcswch
              },
            ]
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        key: 'node1',
        checked: true,
        expanded: true,
        children: [
          {
            label: this.IDColumnLabel,
            key: 'pid1',
            checked: true,
            expanded: true,
            searchKey: 'pid1',
          },
          {
            label: 'CPU',
            key: 'cpu1',
            checked: true,
            expanded: true,
            children: [
              {
                label: '%user',
                key: '%user1',
                checked: true,
                expanded: true,
                sortKey: '%user1',
                compareType: 'number',
                tip: I18n.sys.tip['%user']
              },
              {
                label: '%system',
                key: '%system1',
                checked: false,
                expanded: true,
                sortKey: '%system1',
                compareType: 'number',
                tip: I18n.sys.tip['%sys']
              },
              {
                label: '%IO wait',
                key: '%IO wait1',
                checked: false,
                expanded: true,
                sortKey: '%IO wait1',
                compareType: 'number',
                tip: I18n.sys.tip['%iowait']
              },
              {
                label: '%CPU',
                key: '%CPU1',
                checked: false,
                expanded: true,
                sortKey: '%CPU1',
                compareType: 'number',
                tip: I18n.sys.tip['%cpu']
              }
            ]
          },
          {
            label: 'Memory',
            key: 'memory1',
            checked: true,
            expanded: true,
            children: [
              {
                label: 'minflt/s',
                key: 'minflt/s1',
                checked: true,
                expanded: true,
                sortKey: 'minflt/s1',
                compareType: 'number',
                tip: I18n.process.sum.mem.min
              },
              {
                label: 'majflt/s',
                key: 'majflt/s1',
                checked: false,
                expanded: true,
                sortKey: 'majflt/s1',
                compareType: 'number',
                tip: I18n.sys.tip['majflt/s']
              },
              {
                label: 'VSZ(KiB)',
                key: 'VSZ(KB)1',
                checked: false,
                expanded: true,
                sortKey: 'VSZ(KB)1',
                compareType: 'number',
                tip: I18n.process.sum.mem.vsz
              },
              {
                label: 'RSS(KiB)',
                key: 'RSS(KB)1',
                checked: false,
                expanded: true,
                sortKey: 'RSS(KB)1',
                compareType: 'number',
                tip: I18n.process.sum.mem.rss
              },
              {
                label: '%MEM',
                key: '%MEM1',
                checked: false,
                expanded: true,
                sortKey: '%MEM1',
                compareType: 'number',
                tip: I18n.process.sum.mem.mem
              },
            ]
          },
          {
            label: 'Disk IO',
            key: 'diskIo1',
            checked: true,
            expanded: true,
            children: [
              {
                label: 'rd(KiB)/s',
                key: 'rd(KB)/s1',
                checked: true,
                expanded: true,
                sortKey: 'rd(KB)/s1',
                compareType: 'number',
                tip: I18n.sys.tip['rd(KB)/s']
              },
              {
                label: 'wr(KiB)/s',
                key: 'wr(KB)/s1',
                checked: false,
                expanded: true,
                sortKey: 'wr(KB)/s1',
                compareType: 'number',
                tip: I18n.sys.tip['wr(KB)/s']
              },
              {
                label: 'IOdelay(tick)',
                key: 'IOdelay(tick)1',
                checked: false,
                expanded: true,
                sortKey: 'IOdelay(tick)1',
                compareType: 'number',
                tip: I18n.process.sum.disk.iodelay
              },
            ]
          },
          {
            label: 'Switch',
            key: 'switch1',
            checked: true,
            expanded: true,
            children: [
              {
                label: 'Cswch/s',
                key: 'Cswch/s1',
                checked: true,
                expanded: true,
                sortKey: 'Cswch/s1',
                compareType: 'number',
                tip: I18n.tuninghelper.detailedData.cswch_tip
              },
              {
                label: 'Nvcswch/s',
                key: 'Nbcswch/s1',
                checked: false,
                expanded: true,
                sortKey: 'Nbcswch/s1',
                compareType: 'number',
                tip: I18n.process.sum.context.nvcswch
              },
            ]
          },
        ],
      },
      {
        label: I18n.tuninghelper.taskDetail.objectTwo,
        key: 'node2',
        checked: true,
        expanded: true,
        children: [
          {
            label: this.IDColumnLabel,
            key: 'pid2',
            checked: true,
            expanded: true,
            searchKey: 'pid2',
          },
          {
            label: 'CPU',
            key: 'cpu2',
            checked: true,
            expanded: true,
            children: [
              {
                label: '%user',
                key: '%user2',
                checked: true,
                expanded: true,
                sortKey: '%user2',
                compareType: 'number',
                tip: I18n.sys.tip['%user']
              },
              {
                label: '%system',
                key: '%system2',
                checked: false,
                expanded: true,
                sortKey: '%system2',
                compareType: 'number',
                tip: I18n.sys.tip['%sys']
              },
              {
                label: '%IO wait',
                key: '%IO wait2',
                checked: false,
                expanded: true,
                sortKey: '%IO wait2',
                compareType: 'number',
                tip: I18n.sys.tip['%iowait']
              },
              {
                label: '%CPU',
                key: '%CPU2',
                checked: false,
                expanded: true,
                sortKey: '%CPU2',
                compareType: 'number',
                tip: I18n.sys.tip['%cpu']
              }
            ]
          },
          {
            label: 'Memory',
            key: 'memory2',
            checked: true,
            expanded: true,
            children: [
              {
                label: 'minflt/s',
                key: 'minflt/s2',
                checked: true,
                expanded: true,
                sortKey: 'minflt/s2',
                compareType: 'number',
                tip: I18n.process.sum.mem.min
              },
              {
                label: 'majflt/s',
                key: 'majflt/s2',
                checked: false,
                expanded: true,
                sortKey: 'majflt/s2',
                compareType: 'number',
                tip: I18n.sys.tip['majflt/s']
              },
              {
                label: 'VSZ(KiB)',
                key: 'VSZ(KB)2',
                checked: false,
                expanded: true,
                sortKey: 'VSZ(KB)2',
                compareType: 'number',
                tip: I18n.process.sum.mem.vsz
              },
              {
                label: 'RSS(KiB)',
                key: 'RSS(KB)2',
                checked: false,
                expanded: true,
                sortKey: 'RSS(KB)2',
                compareType: 'number',
                tip: I18n.process.sum.mem.rss
              },
              {
                label: '%MEM',
                key: '%MEM2',
                checked: false,
                expanded: true,
                sortKey: '%MEM2',
                compareType: 'number',
                tip: I18n.process.sum.mem.mem
              },
            ]
          },
          {
            label: 'Disk IO',
            key: 'diskIo2',
            checked: true,
            expanded: true,
            children: [
              {
                label: 'rd(KiB)/s',
                key: 'rd(KB)/s2',
                checked: true,
                expanded: true,
                sortKey: 'rd(KB)/s2',
                compareType: 'number',
                tip: I18n.sys.tip['rd(KB)/s']
              },
              {
                label: 'wr(KiB)/s',
                key: 'wr(KB)/s2',
                checked: false,
                expanded: true,
                sortKey: 'wr(KB)/s2',
                compareType: 'number',
                tip: I18n.sys.tip['wr(KB)/s']
              },
              {
                label: 'IOdelay(tick)',
                key: 'IOdelay(tick)2',
                checked: false,
                expanded: true,
                sortKey: 'IOdelay(tick)2',
                compareType: 'number',
                tip: I18n.process.sum.disk.iodelay
              },
            ]
          },
          {
            label: 'Switch',
            key: 'switch2',
            checked: true,
            expanded: true,
            children: [
              {
                label: 'Cswch/s',
                key: 'Cswch/s2',
                checked: true,
                expanded: true,
                sortKey: 'Cswch/s2',
                compareType: 'number',
                tip: I18n.tuninghelper.detailedData.cswch_tip
              },
              {
                label: 'Nvcswch/s',
                key: 'Nbcswch/s2',
                checked: false,
                expanded: true,
                sortKey: 'Nbcswch/s2',
                compareType: 'number',
                tip: I18n.process.sum.context.nvcswch
              },
            ]
          },
        ],
      },
    ];
    this.tableData = {
      srcData: {
        data: infoData,
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      },
      columnsTree,
    };
  }

  /**
   * 点击command指令事件
   * @param data 数据源
   */
  public triggerCommand(data: any) {
    this.lookCommandDetail.emit(data);
  }

}
