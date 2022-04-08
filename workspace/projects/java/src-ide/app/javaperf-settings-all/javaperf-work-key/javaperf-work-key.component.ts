import { Component, OnInit } from '@angular/core';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-javaperf-work-key',
  templateUrl: './javaperf-work-key.component.html',
  styleUrls: ['./javaperf-work-key.component.scss']
})
export class JavaperfWorkKeyComponent implements OnInit {

  constructor(public vscodeService: VscodeService, public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
   }
  public isOperate: any;
  public i18n: any;
  /**
   * ss
   */
  ngOnInit(): void {
    // 用户角色判断
    this.isOperate = VscodeService.isAdmin();
  }
    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
     */
    private showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }
    /**
     * 刷新密钥
     */
    public handleRefreshWorkingKey() {
        const option = {
            url: `/tools/workingKey`
        };
        this.vscodeService.post(option, (data: any) => {
            if (data.code === 0) {
                this.showInfoBox(data.message, 'info');
            } else {
                this.showInfoBox(data.message, 'error');
            }
        });
    }

}
