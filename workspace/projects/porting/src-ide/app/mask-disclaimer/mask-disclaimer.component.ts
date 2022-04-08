import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';

@Component({
  selector: 'app-mask-disclaimer',
  templateUrl: './mask-disclaimer.component.html',
  styleUrls: ['./mask-disclaimer.component.scss']
})
export class MaskDisclaimerComponent implements OnInit {

  @ViewChild('disclaimerTip', { static: false }) disclaimerTip: any;
  @ViewChild('saveConfirmTip', { static: false }) saveConfirmTip: any;

  public i18n: any;
  public pluginCfg: any;  // 保存config配置
  public readChecked = false;  // 是否勾选已阅读免责申明

  constructor(
    private i18nService: I18nService,
    private vscodeService: VscodeService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    const data = { cmd: 'readConfig' };
    this.vscodeService.postMessage(data, (resp: any) => {
      this.pluginCfg = resp;
      if (((self as any).webviewSession || {}).getItem('isFirst') !== '1') {
        this.isConfirmDisclaimer();
      }
    });
  }

  /**
   * 查看用户是否签署免责声明
   */
  private isConfirmDisclaimer() {
    this.vscodeService.get({ url: '/users/disclaimercounts/' }, (res: any) => {
      if (res.status === 0) {
        let isDisclaime: boolean;
        // disclreadcounts 0：未签署，1：已签署
        if (res.data.disclreadcounts === 0) {
          // 未签署免责申明
          this.pluginCfg.portDisclaimer = [];
          isDisclaime = false;
          this.disclaimerTip.clearLang();
          this.disclaimerTip.Open();
        } else {
          // 已签署免责申明，保存到配置文件
          this.pluginCfg.portDisclaimer = ['confirm'];
          isDisclaime = true;
        }
        const data = {
          cmd: 'updateDisclaimer',
          data: {
            data: JSON.stringify(this.pluginCfg),
            isDisclaime
          }
        };
        this.vscodeService.postMessage(data, null);
      }
    });
  }
  /**
   * 取消免责声明
   */
  public cancelDisclaimer() {
    const data = { cmd: 'saveDisclaimer', data: { data: JSON.stringify(this.pluginCfg), disclaimeCancel: true } };
    this.vscodeService.postMessage(data, null);
    this.disclaimerTip.Close();
  }

  /**
   * 点击取消免责声明
   */
  public clickCancel() {
    this.saveConfirmTip.Open();
  }

  /**
   * 再想想
   */
  public confirmMsgTip() {
    this.saveConfirmTip.Close();
  }

  /**
   * 确认免责声明
   */
  public confirmDisclaimer() {
    this.vscodeService.post({ url: '/users/firstdisclaimer/' }, (res: any) => {
      this.pluginCfg.portDisclaimer = ['confirm'];
      const data = { cmd: 'saveDisclaimer', data: { data: JSON.stringify(this.pluginCfg), disclaimeSave: true } };
      this.vscodeService.postMessage(data, null);
      this.disclaimerTip.Close();
    });
  }
}
