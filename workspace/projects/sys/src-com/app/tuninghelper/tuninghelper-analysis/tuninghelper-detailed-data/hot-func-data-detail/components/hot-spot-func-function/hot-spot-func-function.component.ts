import { Component, Input, OnInit } from '@angular/core';
import { TiModalService, TiTableRowData, TiTreeNode } from '@cloud/tiny3';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { I18n } from 'sys/locale';
import { AnalysisTarget } from 'sys/src-com/app/domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { HttpService } from 'sys/src-com/app/service';
import { LANGUAGE_TYPE, STATUS_CODE } from 'sys/src-com/app/global/constant';

@Component({
  selector: 'app-hot-spot-func-function',
  templateUrl: './hot-spot-func-function.component.html',
  styleUrls: ['./hot-spot-func-function.component.scss']
})
export class HotSpotFuncFunctionComponent implements OnInit {

  /**
   * 原始数据
   */
  @Input() sourceData: any;
  /**
   * 任务信息数据
   */
  @Input()
  set taskData(taskData: any) {
    if (taskData) {
      if (taskData.task_param.analysisTarget === AnalysisTarget.PROFILE_SYSTEM) {
        this.getFunctionData('sys');
      } else {
        this.getFunctionData('app');
      }
    }
  }
  /**
   * 是否需要分页
   */
  @Input() isPagination = true;
  /**
   * 是否是模块下展开的函数
   */
  @Input() isModuleFunc = false;

  public tableData: CommonTableData;
  public curLanguage: any = sessionStorage.getItem('language');
  public islanguageZH = true;


  constructor(
    private tiModal: TiModalService,
    public statusService: TuninghelperStatusService,
    private http: HttpService,
  ) {
    this.islanguageZH = this.curLanguage === LANGUAGE_TYPE.ZH;
  }

  ngOnInit(): void {
    if (this.sourceData) {
      this.setHotSpotFuncTableData(this.sourceData);
    }
  }

  /**
   * 获取函数数据
   */
   public getFunctionData(collectType: any) {
    const params = {
      'node-id': this.statusService.nodeId,
      'collect-type': collectType,
      type: 'function'
    };
    this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/hot-function/`, {
      params,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data?.optimization?.data) {
        this.setHotSpotFuncTableData(resp.data.optimization.data);
      }
    }).catch((error: any) => {
    });
  }

  /**
   * 设置热点函数数据
   */
  private setHotSpotFuncTableData(data: any) {
    let srcData: any = [];
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.storageIO.ioapis.functionName,
        width: '15%',
        key: 'function',
        checked: true,
        searchKey: 'function',
        filterConfig: {
          options: [
            {
              label: I18n.tuninghelper.processDetailData.allFunc,
              isAll: true,
            },
            {
              label: I18n.tuninghelper.processDetailData.isSugFunc,
            }
          ],
          select: this.onFilterSelect,
        }
      },
      {
        label: '%CPU',
        width: '15%',
        key: 'cpu',
        checked: true,
        sortKey: 'cpu',
        compareType: 'number',
        tip: I18n.sys.tip['%cpu']
      },
      {
        label: '%system',
        width: '15%',
        key: 'sys',
        checked: true,
        sortKey: 'sys',
        compareType: 'number',
        tip: I18n.sys.tip['%sys']
      },
      {
        label: '%user',
        width: '15%',
        key: 'usr',
        checked: true,
        sortKey: 'usr',
        compareType: 'number',
        tip: I18n.sys.tip['%user']
      },
      {
        label: I18n.common_term_task_tab_summary_module,
        width: '15%',
        key: 'module',
        checked: true,
        searchKey: 'module'
      },
      {
        label: 'PID',
        width: '15%',
        key: 'pid',
        checked: true,
        searchKey: 'pid'
      },
      {
        label: 'Command',
        width: '10%',
        key: 'command',
        checked: true,
        searchKey: 'command'
      }
    ];
    if (this.isModuleFunc) {
      columnsTree.splice(4, 1);
    }
    if (data && Array.isArray(data) && data.length > 0) {
      data.forEach((item: any, index: number) => {
        item.showStack = false;
        if (item.stack) {
          const stackTree = JSON.parse(item.stack);
          if (stackTree.length > 0 && stackTree[0].function) {
            item.showStack = true;
          }
        }
      });
      srcData = data;
    }
    this.tableData = {
      srcData: {
        data: srcData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree,
    };
  }

  private onFilterSelect(selected: any, column: any, columns: any, tableData: any) {
    if (selected.label === I18n.tuninghelper.processDetailData.isSugFunc) {
      const filterData = tableData.filter((rowData: TiTableRowData) => {
        return rowData.is_sug;
      });
      return filterData;
    } else {
      return tableData;
    }
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
        context: {
          title: row.function,
          stackTree
        }
      });
    }
  }

}
