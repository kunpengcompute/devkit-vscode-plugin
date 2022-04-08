import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { ComputerComparisonValueService } from '../../service/computer-comparison-value.service';

@Component({
  selector: 'app-compare-process-memoryaccess-metrics',
  templateUrl: './compare-process-memoryaccess-metrics.component.html',
  styleUrls: ['./compare-process-memoryaccess-metrics.component.scss']
})
export class CompareProcessMemoryaccessMetricsComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setMemoryAccessMetricsTableData(sourceData);
    }
  }
  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置访存指标信息
   * @param data 数据源
   */
  public setMemoryAccessMetricsTableData(data: any) {
    const memoryAccessIndicator: any = I18n.tuninghelper.memory_access_indicator;
    let infoData: Array<any> = [];
    try {
      infoData = Object.keys(data).map((dataKey: any) => {
        const infoObj: any = {
          metrics: memoryAccessIndicator[dataKey] || '--',
        };
        data[dataKey].forEach((tempValue: any, tempIndex: number) => {
          if (tempIndex === 2) {
            infoObj[`value${tempIndex + 1}`] = ComputerComparisonValueService.getComparisonValue(
              data[dataKey]);
          } else {
            infoObj[`value${tempIndex + 1}`] = tempValue;
          }
        });
        return infoObj;
      });
    } catch {}
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.tuninghelper.taskDetail.metrics,
        width: '20%',
        key: 'metrics',
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
