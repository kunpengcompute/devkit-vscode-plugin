import { Component, OnInit, ViewChild } from '@angular/core';
import {
  I18nService, AxiosService, MytipService,
  CommonService
} from '../../../service';
import { TiFilter, TiFileItem } from '@cloud/tiny3';

const hardUrl: any = require('../../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-whitelist',
  templateUrl: './whitelist.component.html',
  styleUrls: ['./whitelist.component.scss']
})
export class WhitelistComponent implements OnInit {

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;

  public commonConfig = {
    restore: {
      label: '管理员密码',
      btnTitle: '开始恢复',
      option: 1
    },
    upgrade: {
      label: '管理员密码',
      btnTitle: '开始升级',
      option: 2
    }
  };
  public backupPwd: string; // 备份密码
  public restorePwd: string; // 恢复密码
  public upgradePwd: string; // 升级密码
  public taskId: any;
  public currLang: any;
  public soinfo: any = {
    ing: '',
    success: '',
    fail: '',
    tip: '',
    operation: '',
    progessValue: '',
    barWidth: '0'
  };
  public title = {
    tit: '',
    cn: '',
    ps1: '',
    ps2: ''
  };
  public soSituation = 0;
  public xmlsituation = 0;
  public timer: any = null;
  public totalBar = 460; // 进度条总宽 //目前数据大小
  public totalProgress = 100; // 总的数据大小
  public backup: any;
  public recovery: any;
  public upgrade: any;
  public userspace: any;
  public tipsinfo = {
    tip1: '登录社区并下载软件移植资源包',
    tip2: '登录鲲鹏社区',
    tip3: '下载白名单压缩包',
    url:  hardUrl.depDictoryUrl,
    tip4: '上传到工具用户工作路径 不解压 不改名',
    tip5: '请用户将获取的白名单压缩包，保存在路径“/opt/portadv/portadmin/migration”下',
    tip6: '已完成，下一步',
    tip7: '已完成，确认升级'
  };
  public uploadPackageKind = '上传压缩包';
  public token: any;
  public headersConfig = {
    Authorization: '',
    filename: ''
  };
  filters: Array<TiFilter> = [
    {
      name: 'maxCount',
      params: [1]
    }
  ];

  public depDictoryUrl: string; // 依赖字典压缩包路径

  ngOnInit() {
    this.depDictoryUrl = hardUrl.depDictoryUrl;
    this.commonConfig = {
      restore: {
        label: this.i18n.common_term_user_label.adminPwd,
        btnTitle: this.i18n.whitelist.restoreOp,
        option: 1
      },
      upgrade: {
        label: this.i18n.common_term_user_label.adminPwd,
        btnTitle: this.i18n.whitelist.upgradeOp,
        option: 2
      }
    };
    this.currLang = sessionStorage.getItem('language');
    this.backup = this.i18n.backup;
    this.recovery = this.i18n.restore;
    this.upgrade = this.i18n.upgrade;
    this.Axios.axios.get(`/customize/`).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.userspace = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`;
        this.tipsinfo = {
          tip1: '下载白名单压缩包',
          tip2: '登录鲲鹏社区',
          tip3: '，下载白名单压缩包。',
          url:  hardUrl.depDictoryUrl,
          tip4: '上传白名单压缩包',
          tip5: `压缩包上传到服务器之后，默认保存在${this.userspace}路径下。`,
          tip6: '已完成，下一步',
          tip7: '已完成，确认升级'
        };
      }
    });
  }

  onBeforeSendItems(fileItems: Array<TiFileItem>): void {
    // 上传前动态添加formData
    this.headersConfig.filename = fileItems[0]._file.name;
    fileItems.forEach((item: TiFileItem) => {
      item.formData = {
        file: fileItems[0]._file
      };
    });
  }
  /**
   * 确认按钮的反馈结果
   */
  public onRestoreConfirm(val: any) {
    if (sessionStorage.getItem('language') !== 'zh-cn') {
      this.uploadPackageKind = 'Upload Compressed Package';
      this.tipsinfo.tip1 = 'Download the compressed whitelist package';
      this.tipsinfo.tip2 = 'Log in to the Kunpeng community';
      this.tipsinfo.tip3 = ' to download the compressed whitelist package.';
      this.tipsinfo.url = hardUrl.depDictoryUrl;
      this.tipsinfo.tip4 = 'Upload the compressed whitelist package';
      this.tipsinfo.tip5 = `The compressed package is saved in the ${
        this.userspace
      } directory by default after being uploaded to the server.`;
      this.tipsinfo.tip6 = 'Next';
      this.tipsinfo.tip7 = 'Upload Completed';
    }
    this.soSituation = -1;
    this.xmlsituation = -1;
    if (val.option === 2) {
      this.soinfo.ing = this.upgrade.ing;
      this.soinfo.success = this.upgrade.success;
      this.soinfo.fail = this.upgrade.fail;
      this.soinfo.operation = this.upgrade.operation;
      this.title.tit = this.upgrade.title;
      this.title.ps1 = this.upgrade.ps1;
    } else if (val.option === 1) {
      this.soinfo.ing = this.recovery.ing;
      this.soinfo.success = this.recovery.success;
      this.soinfo.fail = this.recovery.fail;
      this.soinfo.operation = this.recovery.operation;
      this.title.tit = this.recovery.title;
      this.title.ps1 = this.recovery.ps1;
    }
    const param = {
      option: val.option,
      password: val.password
    };
    const url = `/portadv/tasks/dependency_dictionary_manage/`;
    this.Axios.axios.post(url, param).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.taskId = data.data.task_name;
        this.getsoStatus();
        const pwdDom = document.getElementById('pwd') as HTMLElement;
        if (pwdDom) {
          pwdDom.style.border = '1px solid #b8becc';
        }
      } else {
        const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        this.myTip.alertInfo({ type: 'error', content, time: 10000 });
      }
    });
  }
  /**
   * 获取白名单状态
   */
  public getsoStatus() {
    this.Axios.axios.get(
      `/task/progress/?task_type=2&task_id=${encodeURIComponent(this.taskId)}`)
    .then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (data.data.status === 0) {
          // 打包成功
          this.soinfo.tip = this.chooseInfoLanguage(data);
          this.soSituation = 2;
          clearTimeout(this.timer);
          this.timer = null;
        } else if (data.data.status === 1) {
          // 正在打包
          this.soinfo.tip = this.chooseInfoLanguage(data);
          this.soinfo.progessValue = data.data.progress + '%';
          this.soinfo.barWidth = Math.floor((data.data.progress / this.totalProgress) * this.totalBar);
          this.soSituation = 1;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          this.timer = setTimeout(() => this.getsoStatus(), 1000);
        } else if (data.data.status === 2) {
          // 打包失败
          clearTimeout(this.timer);
          this.timer = null;
          this.soinfo.tip = this.chooseInfoLanguage(data);
          this.soSituation = 3;
        }
      }
    });
  }

  public chooseInfoLanguage(data: any) {
    const info = this.currLang === 'zh-cn'
      ? data.data.option_info_chinese
      : data.data.option_info;
    return info;
  }

}
