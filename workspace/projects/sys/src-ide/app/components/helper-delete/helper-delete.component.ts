import { Component, OnInit } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { ActivatedRoute } from '@angular/router';
import { VscodeService } from '../../service/vscode.service';

@Component({
  selector: 'app-helper-delete',
  templateUrl: './helper-delete.component.html',
  styleUrls: ['./helper-delete.component.scss']
})
export class HelperDeleteComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private vscodeService: VscodeService,
  ) { }
  public pageTitle: string;
  public deleteModelTip: string;
  public compareData: TiTableSrcData;
  public compareTitle: any[];
  public i18n = I18n;
  public title: string;
  public isTask: boolean;
  public selfId: any;
  public panelId: string;

  ngOnInit(): void {
    this.compareTitle = [
      { title: I18n.common_term_task_name, key: 'name', width: '80%' },
      { title: I18n.compareCreate.tool, key: 'tool', width: '20%' }
    ];
    this.compareData = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    };
    this.route.queryParams.subscribe((data) => {
      if (data) {
        this.title = data.title;
        this.isTask = data.isTask;
        this.selfId = data.selfId;
        this.panelId = data.panelId;
        this.pageTitle = data.isTask === 'true' ? I18n.tipMsg.deleteM : I18n.tipMsg.deleteP;
        this.deleteModelTip = data.isTask === 'true'
          ? (I18n.compareCreate.delTaskTip as string).replace('${project}', this.title)
          : (I18n.compareCreate.delProjectTip as string).replace('${project}', this.title);

        this.compareData.data = data.list.map((val: string) => {
          return { name: val, tool: I18n.common_tern_tunning_helper_name };
        });
      }
    });
  }

  /**
   * 取消按钮
   */
  public onSelectCancel() {
    const message = {
      cmd: 'closePanel',
      module: VscodeService.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR
    };
    this.vscodeService.postMessage(message, null);
  }

  /**
   * 确定按钮
   */
  public onSelectConfirm() {
    const message = {
      cmd: 'tuningHelperBeforeDelete',
      data: {
        label: this.title,
        isTask: this.isTask,
        selfId: Number(this.selfId),
        status: 'delete',
        panelId: this.panelId
      }
    };
    this.vscodeService.postMessage(message, null);
  }
}
