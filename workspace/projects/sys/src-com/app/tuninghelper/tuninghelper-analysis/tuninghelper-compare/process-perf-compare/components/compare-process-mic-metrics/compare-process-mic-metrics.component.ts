import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { ComputerComparisonValueService } from '../../service/computer-comparison-value.service';

@Component({
  selector: 'app-compare-process-mic-metrics',
  templateUrl: './compare-process-mic-metrics.component.html',
  styleUrls: ['./compare-process-mic-metrics.component.scss']
})
export class CompareProcessMicMetricsComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setMicMetricsTableData(sourceData);
    }
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
  public setMicMetricsTableData(data: any) {
    const notContainKeys = ['cycles', 'instructions', 'IPC'];
    const infoData: Array<any> = [];
    try {
      Object.keys(data).forEach((dataKey: any) => {
        if (notContainKeys.indexOf(dataKey) === -1) {
          const infoObj: any = {
            eventName: dataKey,
          };
          data[dataKey].forEach((tempValue: any, tempIndex: number) => {
            if (tempIndex === 2) {
              infoObj[`value${tempIndex + 1}`] = ComputerComparisonValueService.getComparisonValue(
                data[dataKey]);
            } else {
              infoObj[`value${tempIndex + 1}`] = tempValue;
            }
          });
          infoData.push(infoObj);
        } else {
          const tempArr: Array<any> = data[dataKey];
          if (tempArr[0] === tempArr[1]) {
            this.micMetricsData[dataKey] = `${I18n.tuninghelper.taskDetail.identical}, ${tempArr[0]}`;
          } else {
            this.micMetricsData[dataKey] = `${tempArr[0]} | ${tempArr[1]}`;
          }
        }
      });
    } catch {}
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.micarch.eventName,
        width: '20%',
        key: 'eventName',
        checked: true,
      },
      {
        label: I18n.tuninghelper.compare.compareValue,
        width: '30%',
        key: '',
        checked: true,
        children: [
          {
            label: I18n.tuninghelper.taskDetail.value,
            width: '30%',
            key: 'value3',
            checked: true,
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        width: '25%',
        key: '',
        checked: true,
        children: [
          {
            label: I18n.tuninghelper.taskDetail.value,
            width: '25%',
            key: 'value1',
            checked: true,
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectTwo,
        width: '25%',
        key: '',
        checked: true,
        children: [
          {
            label: I18n.tuninghelper.taskDetail.value,
            width: '25%',
            key: 'value2',
            checked: true,
          }
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
