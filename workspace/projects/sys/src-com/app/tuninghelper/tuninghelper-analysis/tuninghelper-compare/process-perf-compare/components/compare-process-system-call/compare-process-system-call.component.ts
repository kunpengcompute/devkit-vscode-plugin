import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { ComputerComparisonValueService } from '../../service/computer-comparison-value.service';

@Component({
  selector: 'app-compare-process-system-call',
  templateUrl: './compare-process-system-call.component.html',
  styleUrls: ['./compare-process-system-call.component.scss']
})
export class CompareProcessSystemCallComponent implements OnInit {

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
  public setSystemCallTableData(data: any) {
    let infoData: Array<any> = [];
    try {
      infoData = Object.keys(data).map((dataKey: any) => {
        const infoObj: any = {
          syscall: dataKey,
        };
        const pidData = data[dataKey];
        for (const tempKey of Object.keys(pidData)) {
          pidData[tempKey].forEach((tempValue: any, tempIndex: number) => {
            if (tempIndex === 2) {
              infoObj[`${tempKey}${tempIndex + 1}`] = ComputerComparisonValueService.getComparisonValue(
                pidData[tempKey]);
              infoObj[`${tempKey}${tempIndex + 1}Sort`] = tempValue;
            } else {
              infoObj[`${tempKey}${tempIndex + 1}`] = tempValue;
            }
          });
        }
        return infoObj;
      });
    } catch {}
    const columnsTree: Array<TiTreeNode> = [
      {
        label: 'syscall',
        width: '10%',
        key: 'syscall',
        checked: true,
        disabled: true,
      },
      {
        label: I18n.tuninghelper.compare.compareValue,
        width: '40%',
        key: 'comparisonValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%time',
            width: '17%',
            key: 'time_percentage3',
            sortKey: 'time_percentage3Sort',
            checked: true,
            tip: I18n.process.sum.syscall.time
          },
          {
            label: 'seconds',
            width: '17%',
            key: 'seconds3',
            sortKey: 'seconds3Sort',
            checked: true,
            tip: I18n.process.sum.syscall.seconds
          },
          {
            label: 'usecs/call',
            width: '17%',
            key: 'usecs_call3',
            sortKey: 'usecs_call3Sort',
            checked: true,
            tip: I18n.process.sum.syscall.usecs
          },
          {
            label: 'calls',
            width: '17%',
            key: 'calls3',
            sortKey: 'calls3Sort',
            checked: true,
            tip: I18n.process.sum.syscall.calls
          },
          {
            label: 'errors',
            width: '16%',
            key: 'errors3',
            sortKey: 'errors3Sort',
            checked: true,
            tip: I18n.process.sum.syscall.errors
          },
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        width: '25%',
        key: 'comparisonValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%time',
            width: '17%',
            key: 'time_percentage1',
            sortKey: 'time_percentage1',
            checked: true,
            tip: I18n.process.sum.syscall.time
          },
          {
            label: 'seconds',
            width: '17%',
            key: 'seconds1',
            sortKey: 'seconds1',
            checked: true,
            tip: I18n.process.sum.syscall.seconds
          },
          {
            label: 'usecs/call',
            width: '17%',
            key: 'usecs_call1',
            sortKey: 'usecs_call1',
            checked: true,
            tip: I18n.process.sum.syscall.usecs
          },
          {
            label: 'calls',
            width: '17%',
            key: 'calls1',
            sortKey: 'calls1',
            checked: true,
            tip: I18n.process.sum.syscall.calls
          },
          {
            label: 'errors',
            width: '16%',
            key: 'errors1',
            sortKey: 'errors1',
            checked: true,
            tip: I18n.process.sum.syscall.errors
          },
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectTwo,
        width: '25%',
        key: 'comparisonValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%time',
            width: '17%',
            key: 'time_percentage2',
            sortKey: 'time_percentage2',
            checked: true,
            tip: I18n.process.sum.syscall.time
          },
          {
            label: 'seconds',
            width: '17%',
            key: 'seconds2',
            sortKey: 'seconds2',
            checked: true,
            tip: I18n.process.sum.syscall.seconds
          },
          {
            label: 'usecs/call',
            width: '17%',
            key: 'usecs_call2',
            sortKey: 'usecs_call2',
            checked: true,
            tip: I18n.process.sum.syscall.usecs
          },
          {
            label: 'calls',
            width: '17%',
            key: 'calls2',
            sortKey: 'calls2',
            checked: true,
            tip: I18n.process.sum.syscall.calls
          },
          {
            label: 'errors',
            width: '16%',
            key: 'errors2',
            sortKey: 'errors2',
            checked: true,
            tip: I18n.process.sum.syscall.errors
          },
        ]
      }
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

}
