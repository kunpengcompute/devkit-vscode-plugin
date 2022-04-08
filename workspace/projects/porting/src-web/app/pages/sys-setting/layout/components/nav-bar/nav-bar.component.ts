import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { I18nService } from '../../../../../service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(
    private router: Router,
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;

  public navList: Array<object>; // 菜单栏
  public role: string; // 当前用户

  ngOnInit(): void {
    this.role = sessionStorage.getItem('role');
    if (sessionStorage.getItem('settingsNotFresh') === 'true') {
      sessionStorage.setItem('settingsNotFresh', 'false');
      location.reload();
    }

    this.navList = [
      { title: this.i18n.common_term_user_info[0], path: 'user', admin: true }, // 用户管理
      { title: this.i18n.passwordDic, path: 'weak', admin: false }, // 弱口令字典
      { title: this.i18n.sysSetting,  path: 'sys', admin: true }, // 系统配置
      {
        title: sessionStorage.getItem('role') === 'Admin'
          ? this.i18n.common_term_user_info[7]
          : this.i18n.common_term_user_info[1],
        path: 'log',
        admin: false
      }, // 日志
      { title: this.i18n.common_term_user_info[3], path: 'dep-dictionary', admin: true }, // 依赖字典
      { title: this.i18n.common_term_user_info[4], path: 'template', admin: true }, // 软件迁移模板
      { title: this.i18n.common_term_setting_label, path: 'scan-parameter', admin: false }, // 扫描参数配置
      { title: this.i18n.common_term_history_label, path: 'threshold', admin: true }, // 阈值设置
      { title: this.i18n.certificate.title, path: 'certificate', admin: false }, // 证书
      {
        title: this.i18n.certificate_revocation_list.title,
        path: 'certificate-revocation-list',
        admin: false}, // 证书吊销列表
    ];
  }

  // 返回首页
  goBack() {
    this.router.navigate(['']);
  }
}
