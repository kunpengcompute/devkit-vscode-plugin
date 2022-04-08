import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-compare-process-memory-affinity',
  templateUrl: './compare-process-memory-affinity.component.html',
  styleUrls: ['./compare-process-memory-affinity.component.scss']
})
export class CompareProcessMemoryAffinityComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setMemoryAffinityTableData(sourceData);
    }
  }
  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置内存亲和性数据
   */
  public setMemoryAffinityTableData(data: any) {
    const columnsTree: Array<TiTreeNode> = [];
    const infoData: any[] = [];
    try {
      for (const item of data.header) {
        columnsTree.push({
          label: item ? item : I18n.tuninghelper.taskDetail.type,
          key: item ? item : 'type',
          width: `${100 / (data.header.length + 1)}%`,
          checked: true,
        });
      }
      const objectArr = [I18n.tuninghelper.taskDetail.objectOne, I18n.tuninghelper.taskDetail.objectTwo];
      data.vals.forEach((allItem: any) => {
        const typeName = allItem[0] === '--' ? allItem[1][0] : allItem[0][0];
        allItem.forEach((item: any, index: number) => {
          if (Array.isArray(item)) {
            if (index === 0 || index === 1) {
              const temp: any = {};
              item.forEach((value: any, valueIndex: number) => {
                temp[columnsTree[valueIndex].key] = value;
              });
              temp.type = typeName;
              temp.comparisonObject = objectArr[index];
              infoData.push(temp);
            }
          } else {
            if (index === 0 || index === 1) {
              const temp: any = {};
              temp.type = typeName;
              temp.comparisonObject = objectArr[index];
              infoData.push(temp);
            }
          }
        });
      });
    } catch {}
    columnsTree.splice(1, 0, {
      label: I18n.tuninghelper.taskDetail.comparisonObject,
      key: 'comparisonObject',
      width: `${100 / (data.header.length + 1)}%`,
      checked: true,
    });
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
