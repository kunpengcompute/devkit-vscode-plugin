import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-compare-process-operate-network',
  templateUrl: './compare-process-operate-network.component.html',
  styleUrls: ['./compare-process-operate-network.component.scss']
})
export class CompareProcessOperateNetworkComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setOperatedNetworkTableData(sourceData);
    }
  }
  public tableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 设置操作的网口数据
   * @param data 数据源
   */
  public setOperatedNetworkTableData(data: any) {
    const infoData: Array<any> = [];
    try {
      data.forEach((allItem: any) => {
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
    const columnsTree: Array<TiTreeNode> = [
      {
        label: 'TID',
        key: 'pid',
        width: '11%',
        searchKey: 'pid',
        checked: true,
      },
      {
        label: I18n.tuninghelper.taskDetail.comparisonObject,
        key: 'comparisonObject',
        width: '11%',
        checked: true,
      },
      {
        label: 'Protocol',
        key: 'protocal',
        width: '11%',
        checked: true,
      },
      {
        label: 'Local IP',
        key: 'local_ip',
        width: '11%',
        checked: true,
      },
      {
        label: 'Local Interface',
        key: 'local_interface',
        width: '11%',
        checked: true,
      },
      {
        label: 'Local  port',
        key: 'local_port',
        width: '11%',
        checked: true,
      },
      {
        label: 'Remote IP',
        key: 'remote_ip',
        width: '11%',
        checked: true,
      },
      {
        label: 'Remote Interface',
        key: 'remote_interface',
        width: '11%',
        checked: true,
      },
      {
        label: 'Remote Port',
        key: 'remote_port',
        width: '12%',
        checked: true,
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

}
