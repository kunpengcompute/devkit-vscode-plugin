import { Component, OnInit} from '@angular/core';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { UserGuideService } from 'projects/java/src-web/app/service/user-guide.service';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss']
})
export class StatementComponent implements OnInit {

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    public userGuide: UserGuideService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public showStatement = false;
  public statementStatus: any = false;
  public params: any = {};
  public readChecked: any = false;
  public hoverClose = '';
  ngOnInit() {
    if (sessionStorage.getItem('statementStatus')) {
      this.statementStatus = sessionStorage.getItem('statementStatus') === 'true' ? true : false;
      this.showStatement = !this.statementStatus;
      if (this.statementStatus) {
        this.startUserGuide();
      }
    } else {
      this.statementStatus = this.searchStatus();
    }
  }
  public openStatement() {
    this.showStatement = true;
    $('.toggleSpan').css({ display: 'none' });
  }
  public clostStatement() {
    this.hoverClose = '';
    if (this.statementStatus) {
      this.readChecked = false;
      this.showStatement = false;
      $('.toggleSpan').css({ display: 'block' });
    } else {
      window.location.href = window.location.origin + '/user-management/#/home';
    }
  }
  public searchStatus() {
    // 获取用户免责声明状态
    this.Axios.axios.get('/disclaimer/createGuardian').then((res: any) => {
      this.statementStatus = res.signed;
      sessionStorage.setItem('statementStatus', this.statementStatus);
      if (!this.statementStatus) {
        this.openStatement();
      } else {
        this.startUserGuide();
      }
    });
    return this.statementStatus;
  }
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
  /**
   * 启动新手引导 user-guide
   */
  public startUserGuide() {
    const flogin = sessionStorage.getItem('userGuidStatus-java-perf');
    if (flogin === '0' && sessionStorage.getItem('javaStep') !== '5') {
      setTimeout(() => {
        sessionStorage.setItem('javaStep', '1');
        this.userGuide.showMask('user-guide-add-project');
      }, 500);
    }
  }

  public getDisclaimer() {
    // 签署免责声明
    this.Axios.axios.post('/disclaimer/createGuardian').then((res: any) => {
      if (res.signed) {
        this.statementStatus = true;
        sessionStorage.setItem('statementStatus', res.signed);
        this.showStatement = false;
        $('.toggleSpan').css({ display: 'block' });
        // user-guide
        this.startUserGuide();
      }
    });
  }
}
