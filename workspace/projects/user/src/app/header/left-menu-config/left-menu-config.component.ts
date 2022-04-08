import {Component, OnInit} from '@angular/core';
import { Router} from '@angular/router';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-left-menu-config',
  templateUrl: './left-menu-config.component.html',
  styleUrls: ['./left-menu-config.component.scss']
})
export class LeftMenuConfigComponent implements OnInit {

  constructor(
    public Axios: AxiosService,
    public router: Router,
    public i18nService: I18nService,
    private route: ActivatedRoute,
  ) {
    this.i18n = this.i18nService.I18n();
    this.lang = sessionStorage.getItem('language');
    this.validation2.errorMessage.required = this.i18n.validata.req;

  }
  public currentMenu: string;
  public lang: any;
  public i18n: any;
  public role: string;
  public leftMenuList: any = []; // 展示的左侧菜单栏选项
  public validation2: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  ngOnInit() {
    this.role = sessionStorage.getItem('role');
    // 系统配置管理
    this.leftMenuList = [
      {
        title: this.i18n.common_term_admin_user,
        params: 'userManage',
        status: true,
        admin: true,
      },
      {
        title: this.i18n.passwordDic,
        params: 'weakPwd',
        status: false,
        admin: false
      },
      {
        title: this.i18n.sysSetting,
        params: 'sysSetting',
        status: false,
        admin: false
      },
      {
        title: this.role === 'Admin' ? this.i18n.commonLog : this.i18n.commonOperateLog,
        params: 'logManage',
        status: false,
        admin: false
      },
      {
        title: this.i18n.certificate.title,
        params: 'webServer',
        status: false,
        admin: false
      },
    ];
    this.route.params.subscribe( params => {
    this.currentMenu = params.item;
      });
  }
// 打开 左侧菜单栏
public getItemData(item: any) {
  this.leftMenuList.map((val: any) => {
    if (item.params === val.params) {
      val.status = true;
    } else {
      val.status = false;
    }
  });
}
public closeLeftMenu() {
  this.router.navigate(['/home']);
}
}
