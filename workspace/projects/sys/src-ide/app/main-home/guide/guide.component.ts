import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { HTTP_STATUS_CODE, VscodeService } from '../../service/vscode.service';

type EnterType = '' | 'both' | 'java' | 'sys';
type TipType = 'sys' | 'java' | 'diagnose' | 'tuningHelper';
@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {

  public i18n: any;
  public enterType: EnterType;
  public basicTitle: string;
  public topTitle: string;
  public showTip = false;
  public showTipType: TipType;
  public pluginUrlCfg: any = {
    understands_install: ''
  };
  public isIntellij = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
  isHoverMap: { [key: string]: boolean } = {};
  private needShowTip = false;
  tipTypeMap: { [key in TipType]: TipType } = {
    sys: 'sys',
    java: 'java',
    diagnose: 'diagnose',
    tuningHelper: 'tuningHelper',
  };

  constructor(
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private vscodeService: VscodeService,
    private i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
    this.basicTitle = this.i18n.guide.basic_title;
    this.topTitle = this.i18n.guide.top_title;
    this.checkInstallInfo();
  }
  ngOnInit() {
    // 获取全局url配置数据
    this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
      this.pluginUrlCfg = resp;
    });
  }
  onSysPerfClick() {
    if (this.enterType === 'both' || this.enterType === 'sys') {
      this.openGuidePage('sys');
    }
  }
  onJavaPerfClick() {
    if (this.enterType === 'both' || this.enterType === 'java') {
      this.openGuidePage('java');
    }
  }
  onMemPerfClick() {
    if (this.enterType === 'both' || this.enterType === 'sys') {
      this.openGuidePage('diagnose');
    }
  }
  onTuninghelperClick() {
    if (this.enterType === 'both' || this.enterType === 'sys') {
      this.openGuidePage('tuningHelper');
    }
  }

  /**
   * 打开引导页面
   * @params 引导类型 系统性能分析-sys  java性能分析-java 系统诊断-diagnose 调优助手-tuningHelper
   */
  public openGuidePage(guideType: any) {
    this.vscodeService.postMessage({
      cmd: 'openGuidePage',
      data: {
        guideType,
      }
    });
  }

  /**
   * 打开超链接
   * @param url 路径
   */
  openUrl(url: any) {
    // intellij走该逻辑
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
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

  /**
   * 获取后台服务器安装的工具信息
   */
  checkInstallInfo() {
    const option = {
      url: '/users/install-info/',
      subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
    };
    this.vscodeService.get(option, (data: any) => {
      if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
        if (data.data.data === 'all') {
          this.enterType = 'both';
        } else if (data.data.data === 'sys_perf') {
          this.enterType = 'sys';
        } else if (data.data.data === 'java_perf') {
          this.enterType = 'java';
        }
      } else {
        if (self.webviewSession.getItem('language') === 'zh-cn') {
          this.vscodeService.showInfoBox(data.message, 'warn');
        } else {
          this.vscodeService.showInfoBox(data.code, 'warn');
        }
      }
      this.updateWebViewPage();
    });
  }

  /**
   * 鼠标移入状态
   */
  public mouseEnterChangeTarget(event: any, guideType?: TipType) {
    this.needShowTip = true;
    this.showTip = true;
    if (guideType) {
      this.isHoverMap[guideType] = true;
    }
    if (this.isIntellij && guideType && !$(event.target).hasClass('disabled')
      && document.getElementsByClassName('intellij-light').length > 0){
      let src = '';
      switch (guideType){
        case 'tuningHelper':
          src = './assets/img/guide/helper-turning-hover-intellij.svg'; break;
        case 'sys':
          src = './assets/img/guide/sys-turning-hover-intellij.svg'; break;
        case 'java':
          src = './assets/img/guide/java-turning-hover-intellij.svg'; break;
        case 'diagnose':
          src = './assets/img/guide/diagnose-turning-hover-intellij.svg'; break;
      }
      $(event.target).find('img').attr('src', src);
    }
    this.showTip = true;
    if (guideType) {
      this.showTipType = guideType;
    }
  }

  /**
   * 鼠标移出状态
   */
  public mouseLeaveChangeTarget(event: any, guideType?: TipType) {
    this.needShowTip = false;
    if (guideType) {
      this.isHoverMap[guideType] = false;
    }
    if (this.isIntellij && guideType && !$(event.target).hasClass('disabled') &&
      document.getElementsByClassName('intellij-light').length > 0){
      let src = '';
      switch (guideType){
        case 'tuningHelper':
          src = './assets/img/guide/helper-turning-normal.svg'; break;
        case 'sys':
          src = './assets/img/guide/sys-turning-normal.svg'; break;
        case 'java':
          src = './assets/img/guide/java-turning-normal.svg'; break;
        case 'diagnose':
          src = './assets/img/guide/diagnose-turning-normal.svg'; break;
      }
      $(event.target).find('img').attr('src', src);
    }
    setTimeout(() => {
      if (!this.needShowTip) {
        this.showTip = false;
      }
    }, 50);
  }
  /**
   * IntellIj刷新webview页面
   */
  public updateWebViewPage() {
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
      this.zone.run(() => {
        this.changeDetectorRef.checkNoChanges();
        this.changeDetectorRef.detectChanges();
      });
    }
  }
}
