import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-tuninghelper-project-manage',
  templateUrl: './tuninghelper-project-manage.component.html',
  styleUrls: ['./tuninghelper-project-manage.component.scss']
})
export class TuninghelperProjectManageComponent implements OnInit {
  public i18n: any;
  constructor(
    public i18nService: I18nService,
    public vscodeService: VscodeService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public showTipType = 'popTip';
  ngOnInit(): void {
  }
  public createdProject(e: any) {
    // 取消创建工程
    if (!e) {
      this.vscodeService.postMessage({
        cmd: 'updateTree',
        data: {
          closePanel: 'tuningHelperCreatePro',
          type: 'info',
        }
      }, null);
    } else {
      // 创建工程成功
      if (e.type === 'info') {
        this.vscodeService.showInfoBox(
          this.i18nService.I18nReplace(this.i18n.plugins_term_project_add_success, {
            0: e.msg
          }), 'info');
        this.vscodeService.postMessage({
          cmd: 'updateTree',
          data: {
            closePanel: 'tuningHelperCreatePro',
            type: 'info',
          }
        }, null);
      } else {
        // 创建失败 错误提示
        this.vscodeService.showInfoBox(e.msg, 'error');
      }
    }
  }

  public jumpToNodeManage(e: boolean) {
    if (e) {
      if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
        this.vscodeService.showTuningInfo('addNode', 'info', 'addNode');
      } else {
        // 跳转到修改工程面板
        this.vscodeService.postMessage({
          cmd: 'navigateToTuningHelperSettingPanel',
          data: {
            navigate: 'sysperfSettings',
            toolType: ToolType.TUNINGHELPER,
            params: { innerItem: 'itemNodeManaga' }
          }
        });
      }
    }
  }
}
