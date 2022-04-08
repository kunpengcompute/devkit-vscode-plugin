import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { ComputerComparisonValueService } from '../../service/computer-comparison-value.service';

@Component({
  selector: 'app-compare-process-hot-func',
  templateUrl: './compare-process-hot-func.component.html',
  styleUrls: ['./compare-process-hot-func.component.scss']
})
export class CompareProcessHotFuncComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setHotSpotFuncTableData(sourceData);
    }
  }
  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置热点函数数据
   */
  public setHotSpotFuncTableData(data: any) {
    let infoData: Array<any> = [];
    try {
      infoData = Object.keys(data).map((dataKey: any) => {
        const funcComModuleArr = dataKey.split(',');
        const infoObj: any = {
          function: funcComModuleArr[0],
          command: funcComModuleArr[2],
          module: funcComModuleArr[1]
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
        label: I18n.storageIO.ioapis.functionName,
        width: '10%',
        key: 'function',
        searchKey: 'function',
        checked: true,
        disabled: true,
      },
      {
        label: 'Command',
        width: '10%',
        key: 'command',
        checked: true,
      },
      {
        label: I18n.common_term_task_tab_summary_module,
        width: '10%',
        key: 'module',
        checked: true,
      },
      {
        label: I18n.tuninghelper.compare.compareValue,
        width: '20%',
        key: 'comparisonValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%CPU',
            width: '15%',
            key: 'overhead3',
            checked: true,
            sortKey: 'overhead3Sort',
            compareType: 'number',
            tip: I18n.sys.tip['%cpu']
          },
          {
            label: '%system',
            width: '10%',
            key: 'sys3',
            checked: true,
            sortKey: 'sys3Sort',
            compareType: 'number',
            tip: I18n.sys.tip['%sys']
          },
          {
            label: '%user',
            width: '10%',
            key: 'usr3',
            checked: true,
            sortKey: 'usr3Sort',
            compareType: 'number',
            tip: I18n.sys.tip['%user']
          },
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        width: '25%',
        key: 'objectOne',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%CPU',
            width: '15%',
            key: 'overhead1',
            checked: true,
            sortKey: 'overhead1',
            compareType: 'number',
            tip: I18n.sys.tip['%cpu']
          },
          {
            label: '%system',
            width: '10%',
            key: 'sys1',
            checked: true,
            sortKey: 'sys1',
            compareType: 'number',
            tip: I18n.sys.tip['%sys']
          },
          {
            label: '%user',
            width: '10%',
            key: 'usr1',
            checked: true,
            sortKey: 'usr1',
            compareType: 'number',
            tip: I18n.sys.tip['%user']
          },
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectTwo,
        width: '20%',
        key: 'objectTwo',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%CPU',
            width: '15%',
            key: 'overhead2',
            checked: true,
            sortKey: 'overhead2',
            compareType: 'number',
            tip: I18n.sys.tip['%cpu']
          },
          {
            label: '%system',
            width: '10%',
            key: 'sys2',
            checked: true,
            sortKey: 'sys2',
            compareType: 'number',
            tip: I18n.sys.tip['%sys']
          },
          {
            label: '%user',
            width: '10%',
            key: 'usr2',
            checked: true,
            sortKey: 'usr2',
            compareType: 'number',
            tip: I18n.sys.tip['%user']
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
