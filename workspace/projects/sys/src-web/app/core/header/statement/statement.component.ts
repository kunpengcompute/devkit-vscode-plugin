import { Component, OnInit} from '@angular/core';
import { ToolType } from 'projects/domain';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';

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
  public statementStatus: any = true; // false 未签署, true 已签署
  public params: any = {};
  public readChecked: any = false;
  public hoverClose = '';
  public flogin: any;
  public isSysperf = sessionStorage.getItem('toolType') === ToolType.SYSPERF;
  ngOnInit() {
    this.statementStatus = sessionStorage.getItem('SYS_DISCLAIMER')  === '0' ? false : true;
    this.showStatement = !this.statementStatus;

  }
  public openStatement() {
    this.showStatement = true;
  }
  public clostStatement() {
    this.hoverClose = '';
    if (this.statementStatus) {
      this.readChecked = false;
      this.showStatement = false;
    } else {
      window.location.href = window.location.origin + '/user-management/#/home';
    }
  }


  /**
   * 启动新手引导 user-guide
   */
  public startUserGuide() {
    const flogin = sessionStorage.getItem('userGuidStatus-sys-perf');
    if (flogin === '0') {
      setTimeout(() => {
        this.userGuide.showMask('user-guide-add-project');
      }, 500);
    }
  }

  public getDisclaimer() {
    // 签署免责声明
    const params = {SYS_DISCLAIMER: '1'};
    this.Axios.axios.post('/users/user-extend/', params, { baseURL: '../user-management/api/v2.2' }).then(() => {

        this.statementStatus = true;
        sessionStorage.setItem('SYS_DISCLAIMER', '1');
        this.showStatement = false;
        // user-guide
        if (this.isSysperf){
            this.startUserGuide();
        }
    });
  }
}
