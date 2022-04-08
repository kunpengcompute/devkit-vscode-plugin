import { Component, Input, OnInit } from '@angular/core';
import { TiModalService, TiTreeNode } from '@cloud/tiny3';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { I18n } from 'sys/locale';
import { LANGUAGE_TYPE } from 'sys/src-com/app/global/constant';

@Component({
  selector: 'app-process-pid-hot-func',
  templateUrl: './process-pid-hot-func.component.html',
  styleUrls: ['./process-pid-hot-func.component.scss']
})
export class ProcessPidHotFuncComponent implements OnInit {

  @Input()
  set sourceData(sourceData: any) {
    if (sourceData) {
      this.setHotSpotFuncTableData(sourceData);
    }
  }
  public tableData: CommonTableData;
  public curLanguage: any = sessionStorage.getItem('language');
  public islanguageZH = true;

  constructor(
    private tiModal: TiModalService,
  ) {
    this.islanguageZH = this.curLanguage === LANGUAGE_TYPE.ZH;
  }

  ngOnInit(): void {
  }

  /**
   * 设置热点函数数据
   */
  private setHotSpotFuncTableData(data: any) {
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.storageIO.ioapis.functionName,
        width: '25%',
        key: 'symbol',
        searchKey: 'symbol',
        checked: true,
      },
      {
        label: '%CPU',
        width: '15%',
        key: 'overhead',
        checked: true,
        sortKey: 'overhead',
        compareType: 'number'
      },
      {
        label: '%system',
        width: '10%',
        key: 'sys',
        checked: true,
        sortKey: 'sys',
        compareType: 'number'
      },
      {
        label: '%user',
        width: '10%',
        key: 'usr',
        checked: true,
        sortKey: 'usr',
        compareType: 'number'
      },
      {
        label: I18n.common_term_task_tab_summary_module,
        width: '25%',
        key: 'share_object',
        checked: true,
      },
      {
        label: 'Command',
        width: '15%',
        key: 'command',
        checked: true,
      }
    ];
    data.forEach((item: any, index: number) => {
      item.showStack = false;
      item.symbol = item.symbol || item.function;
      item.overhead = item.overhead || item.cpu;
      item.share_object = item.share_object || item.module;
      if (item.stack) {
        const stackTree = JSON.parse(item.stack);
        if (stackTree.length > 0 && stackTree[0].function) {
          item.showStack = true;
        }
      }
    });
    this.tableData = {
      srcData: {
        data,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree,
    };
  }

  /**
   * 查看调用栈
   * @params row 函数信息
   */
  public viewStacks(viewStack: any, row: any) {
    if (row.showStack) {
      let stackTree: Array<TiTreeNode> = [];
      if (row.stack) {
        stackTree = JSON.parse(row.stack);
      }
      this.tiModal.open(viewStack, {
        id: 'hot-func-stacks',
        modalClass: 'process-pid-common-timodal-box',
        context: {
          title: row.symbol,
          stackTree
        }
      });
    }
  }

}
