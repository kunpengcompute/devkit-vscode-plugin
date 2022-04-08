import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-compare-process-operate-files',
  templateUrl: './compare-process-operate-files.component.html',
  styleUrls: ['./compare-process-operate-files.component.scss']
})
export class CompareProcessOperateFilesComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setOperatedFilesTableData(sourceData);
    }
  }

  public tableData: CommonTableData;
  public modeHasEmptyPlace = false;

  constructor() { }

  ngOnInit(): void {
    this.setOperatedFilesTableData([]);
  }

  /**
   * 设置操作文件数据
   * @param data 数据源
   */
  public setOperatedFilesTableData(data: any) {
    const infoData: Array<any> = [];
    try {
      Object.keys(data).forEach((dataKey: any) => {
        const infoObj1: any = {
          pid: dataKey,
          comparisonObject: I18n.tuninghelper.taskDetail.objectOne
        };
        const infoObj2: any = {
          pid: dataKey,
          comparisonObject: I18n.tuninghelper.taskDetail.objectTwo
        };
        const tempData = data[dataKey];
        for (const tempKey of Object.keys(tempData)) {
          infoObj1[tempKey] = tempData[tempKey][0];
          infoObj2[tempKey] = tempData[tempKey][1];
          if (tempKey === 'mode' && tempData[tempKey][2] !== 'True') {
            infoObj1.modeNoSame = true;
            this.modeHasEmptyPlace = true;
          }
        }
        infoData.push(infoObj1);
        infoData.push(infoObj2);
      });
    } catch {}
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.common_term_task_tab_function_name,
        width: '35%',
        key: 'file_name',
        searchKey: 'file_name',
        checked: true,
      },
      {
        label: I18n.tuninghelper.taskDetail.comparisonObject,
        key: 'comparisonObject',
        width: '15%',
        checked: true,
      },
      {
        label: I18n.pcieDetailsinfo.disk_name,
        width: '20%',
        key: 'device',
        checked: true,
      },
      {
        label: 'PID',
        width: '20%',
        key: 'pid',
        checked: true,
        disabled: true
      },
      {
        label: 'Mode',
        width: '20%',
        key: 'mode',
        checked: true,
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

}
