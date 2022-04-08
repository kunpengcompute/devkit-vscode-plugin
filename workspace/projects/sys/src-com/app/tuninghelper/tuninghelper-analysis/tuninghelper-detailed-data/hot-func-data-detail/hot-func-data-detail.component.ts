import { Component, OnInit } from '@angular/core';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-hot-func-data-detail',
  templateUrl: './hot-func-data-detail.component.html',
  styleUrls: ['./hot-func-data-detail.component.scss'],
})
export class HotFuncDataDetailComponent implements OnInit {

  public navTabList: Array<any> = [];
  public taskData: any;

  public hotFuncData: any;

  constructor(
    public statusService: TuninghelperStatusService,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    this.navTabList = [
      {
        title: I18n.common_term_projiect_function,
        type: 'function',
        active: true,
      },
      {
        title: I18n.common_term_task_tab_summary_module,
        type: 'module',
        active: false,
      }
    ];
    this.getTaskConfig();
  }

  /**
   * 获取任务配置基本信息
   */
  private getTaskConfig() {
    const params = { 'node-id': this.statusService.nodeId };
    this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/common/configuration/`, {
      params,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS) {
        this.taskData = resp.data.nodeConfig[0];
      }
    }).catch((error: any) => {
    });
  }
}
