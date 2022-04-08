import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-compare-process-numa-allocation',
  templateUrl: './compare-process-numa-allocation.component.html',
  styleUrls: ['./compare-process-numa-allocation.component.scss']
})
export class CompareProcessNumaAllocationComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setNumaAllocationTableData(sourceData);
    }
  }

  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置进程内存段NUMA分布数据
   * @param sourceData 源数据
   */
  public setNumaAllocationTableData(sourceData: any) {
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.tuninghelper.processDetailData.startAddress,
        width: '10%',
        key: 'start_addr',
        checked: true,
      },
      {
        label: I18n.tuninghelper.taskDetail.comparisonObject,
        key: 'comparisonObject',
        width: `10%`,
        checked: true,
      },
      {
        label: I18n.tuninghelper.processDetailData.module,
        width: '10%',
        key: 'module',
        checked: true,
      },
      {
        label: I18n.tuninghelper.processDetailData.mapType,
        width: '10%',
        key: 'map_type',
        checked: true,
      },
      {
        label: I18n.tuninghelper.processDetailData.mapQuantity,
        width: '10%',
        key: 'map_num',
        checked: true,
      },
      {
        label: I18n.tuninghelper.processDetailData.modifiedQuantity,
        width: '10%',
        key: 'modify_num',
        checked: true,
      },
      {
        label: I18n.tuninghelper.processDetailData.memoryPage,
        width: '10%',
        key: 'memory_page',
        checked: true,
      },
    ];
    const infoData: Array<any> = [];
    try {
      sourceData.node[0].forEach((item: any) => {
        columnsTree.push({
          label: 'Node ' + item,
          width: '10%',
          key: 'node' + item,
          checked: true,
        });
      });
      sourceData.data.forEach((allItem: any) => {
        allItem.forEach((item: any, index: number) => {
          if (index === 0) {
            item.comparisonObject = I18n.tuninghelper.taskDetail.objectOne;
            infoData.push(item);
          } else if (index === 1) {
            item.comparisonObject = I18n.tuninghelper.taskDetail.objectTwo;
            infoData.push(item);
          }
        });
      });
    } catch {}
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
