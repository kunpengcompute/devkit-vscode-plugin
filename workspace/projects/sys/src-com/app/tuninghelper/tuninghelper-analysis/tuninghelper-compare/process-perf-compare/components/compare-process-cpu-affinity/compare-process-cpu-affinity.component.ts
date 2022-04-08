import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-compare-process-cpu-affinity',
  templateUrl: './compare-process-cpu-affinity.component.html',
  styleUrls: ['./compare-process-cpu-affinity.component.scss']
})
export class CompareProcessCpuAffinityComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setCpuAffinityTableData(sourceData);
    }
  }
  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置CPU亲和性数据
   * @param data 数据源
   */
  public setCpuAffinityTableData(data: any) {

    const infoData: Array<any> = [];
    try {
      Object.keys(data).forEach((dataKey: any) => {
        const infoObj1: any = {
          tid: dataKey,
          objName: I18n.tuninghelper.taskDetail.objectOne
        };
        const infoObj2: any = {
          tid: dataKey,
          objName: I18n.tuninghelper.taskDetail.objectTwo
        };
        const tempData = data[dataKey];
        for (const tempKey of Object.keys(tempData)) {
          infoObj1[tempKey] = tempData[tempKey][0];
          infoObj2[tempKey] = tempData[tempKey][1];
        }
        infoData.push(infoObj1);
        infoData.push(infoObj2);
      });
    } catch {}
    const columnsTree: Array<TiTreeNode> = [
      {
        label: 'TID',
        width: '15%',
        key: 'tid',
        searchKey: 'tid',
        checked: true,
      },
      {
        label: I18n.tuninghelper.taskDetail.comparisonObject,
        width: '25%',
        key: 'objName',
        checked: true,
      },
      {
        label: 'CPU affinity',
        width: '20%',
        key: 'cpu_affinity',
        checked: true,
      },
      {
        label: 'CPU core',
        width: '20%',
        key: 'cpu_core',
        checked: true,
      },
      {
        label: 'NUMA NODE',
        width: '20%',
        key: 'numa_node',
        checked: true,
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
