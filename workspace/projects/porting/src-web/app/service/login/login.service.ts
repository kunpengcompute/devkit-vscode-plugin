import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { TiMessageService } from '@cloud/tiny3';
import { MytipService } from '../mytip.service';
import { I18nService } from '../i18n.service';
import { CommonService } from '../common/common.service';
import { LoginApi } from '../../api/login';
import { MessageService } from '../message.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public i18n: any;
  constructor(
    public loginApi: LoginApi,
    public mytip: MytipService,
    public i18nService: I18nService,
    public router: Router,
    private timessage: TiMessageService,
    private commonService: CommonService,
    public messageServe: MessageService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  // 退出登录接口
  logout() {
    this.loginApi.logout().then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        sessionStorage.setItem('role', '');
        sessionStorage.setItem('token', '');
        sessionStorage.setItem('username', '');
        sessionStorage.setItem('keepGoing', '1');
        sessionStorage.setItem('anyCtaskId', '');   // 二次确认关闭弹窗后，清除storage中的anyCtaskId
        sessionStorage.setItem('leftMenuItem', ''); // 退出的时候清除信息
        sessionStorage.removeItem('homeGuideShow'); // 源码迁移安装指导
        sessionStorage.removeItem('weakGuideShow'); // 内存一致性安装指导
        this.mytip.alertInfo({ type: 'success', content: this.i18n.logout_ok, time: 3500 });
        this.router.navigate(['/login']);
        this.messageServe.sendMessage({ type: 'closeAdviceIcon' });
      } else {
        this.timessage.open({
          type: 'warn',
          content: data.info
        });
      }
    });
  }
}
