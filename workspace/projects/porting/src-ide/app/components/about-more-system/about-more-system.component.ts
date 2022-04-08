import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ADMIN } from '../../global/globalData';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-about-more-system',
  templateUrl: './about-more-system.component.html',
  styleUrls: ['./about-more-system.component.scss']
})
export class AboutMoreSystemComponent implements OnInit {
  @Input() intelliJFlagDef: boolean;
  @Input() intellijFlag: boolean;
  public currTheme = 1;
  public i18n: any;
  public currentSupportOS: Array<string> = [
    'BC-Linux 7.6/7.7',
    'CentOS 7.4/7.5/7.6/7.7/8.0/8.1/8.2',
    'Deepin V15.2',
    'Debian 10',
    'EulerOS 2.8',
    'iSoft 5.1',
    'Kylin V10 SP1',
    'LinxOS 6.0.90',
    'NeoKylin V7U5/V7U6',
    'openEuler 20.03/20.03 SP1/20.03 SP2',
    'SUSE SLES 15.1',
    'Ubuntu 18.04.x/20.04.x',
    'UOS 20 SP1',
    'uosEuler 20'
  ];
  public isAdmin: boolean;
  public pluginUrlCfg: any = {
    portingPackages: '',
  };
  public currLang: any;
  constructor(
    public i18nService: I18nService,
    public vscodeService: VscodeService,
    public changeDetectorRef: ChangeDetectorRef,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.currLang = I18nService.getLang();
    this.isAdmin = ((self as any).webviewSession || {}).getItem('role') === ADMIN ? true : false;
    // 获取全局url配置数据
    this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
        this.pluginUrlCfg = resp;
    });

     // 监听主题变化事件
    this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
        this.currTheme = msg.colorTheme;
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
    });

    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

    /**
     * 下载缺失包
     * @param url 路径
     */
    openUrl(url: string) {
        // intellij走该逻辑
        if (this.intelliJFlagDef || this.intellijFlag) {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: url
                }
            }, null);
        } else {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

}
