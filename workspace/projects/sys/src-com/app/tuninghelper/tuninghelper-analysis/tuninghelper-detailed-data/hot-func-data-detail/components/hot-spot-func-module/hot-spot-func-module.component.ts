import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { AnalysisTarget } from 'sys/src-com/app/domain';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';

@Component({
  selector: 'app-hot-spot-func-module',
  templateUrl: './hot-spot-func-module.component.html',
  styleUrls: ['./hot-spot-func-module.component.scss']
})
export class HotSpotFuncModuleComponent implements OnInit {

  @Input()
  set taskData(taskData: any) {
    if (taskData) {
      if (taskData.task_param.analysisTarget === AnalysisTarget.PROFILE_SYSTEM) {
        this.getModuleData('sys');
      } else {
        this.getModuleData('app');
      }
    }
  }

  public tableData: CommonTableData;
  constructor(
    public statusService: TuninghelperStatusService,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
  }

  /**
   * 获取模块数据
   */
  public getModuleData(collectType: any) {
    const params = {
      'node-id': this.statusService.nodeId,
      'collect-type': collectType,
      type: 'module'
    };
    this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/hot-function/`, {
      params,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data?.optimization?.data) {
        this.setHotSpotFuncModuleTableData(resp.data.optimization.data);
      }
    }).catch((error: any) => {
    });
  }

  /**
   * 设置热点函数数据
   */
  private setHotSpotFuncModuleTableData(data: any) {
    let srcData: any = [];
    if (data && Array.isArray(data)) {
      srcData = data;
    }
    const columnsTree: Array<TiTreeNode> = [
      {
        label: I18n.common_term_task_tab_summary_module,
        width: '25%',
        key: 'module',
        checked: true,
        searchKey: 'module'
      },
      {
        label: '%CPU',
        width: '75%',
        key: 'cpu',
        checked: true,
        sortKey: 'cpu',
        compareType: 'number',
        tip: I18n.sys.tip['%cpu']
      },
    ];
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

}
