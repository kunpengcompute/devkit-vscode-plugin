import { Component, OnInit, ViewChild } from '@angular/core';
import {
  I18nService, AxiosService, MytipService,
  CommonService
} from '../../../service';
import { TiFilter, TiFileItem } from '@cloud/tiny3';

const hardUrl: any = require('../../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-software-port-temp',
  templateUrl: './software-port-temp.component.html',
  styleUrls: ['./software-port-temp.component.scss']
})
export class SoftwarePortTempComponent implements OnInit {

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  @ViewChild('tips1', { static: false }) tips1Mask: any;
  @ViewChild('tips2', { static: false }) tips2Mask: any;
  @ViewChild('test', { static: false }) test: any;
  @ViewChild('pwd', { static: false }) pwdMask: any;
  public commonConfig = {
    backup: {
      label: '',
      btnTitle: '',
      option: 0
    },
    restore: {
      label: '',
      btnTitle: '',
      option: 1
    },
    upgrade: {
      label: '',
      btnTitle: '',
      option: 2
    }
  };
  public backupPwd: string; // 备份密码
  public restorePwd: string; // 恢复密码
  public upgradePwd: string; // 升级密码
  public taskId: any;
  public currLang: any;
  public xmlinfo: any = {
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
  public uploadPackageKind = '上传资源包';
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

  public softwarePortUrl: string; // 软件迁移模板资源包 url

  ngOnInit() {
    this.softwarePortUrl = hardUrl.depDictoryUrl;

    this.commonConfig = {
      backup: {
        label: this.i18n.common_term_user_label.adminPwd,
        btnTitle: this.i18n.softwarePortTem.backupOp,
        option: 0
      },
      restore: {
        label: this.i18n.common_term_user_label.adminPwd,
        btnTitle: this.i18n.softwarePortTem.restoreOp,
        option: 1
      },
      upgrade: {
        label: this.i18n.common_term_user_label.adminPwd,
        btnTitle: this.i18n.softwarePortTem.upgradeOp,
        option: 2
      }
    };
    this.currLang = sessionStorage.getItem('language');
    this.backup = this.i18n.backupSolution;
    this.recovery = this.i18n.restoreSolution;
    this.upgrade = this.i18n.upgradeSolution;
    this.Axios.axios.get(`/customize/`).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.userspace = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`;
        this.tipsinfo = {
          tip1: '下载软件迁移模板资源包',
          tip2: '登录鲲鹏社区',
          tip3: '，下载所需的软件迁移模板资源包。',
          url:  hardUrl.depDictoryUrl,
          tip4: '上传软件迁移模板资源包',
          tip5: `资源包上传到服务器之后，默认保存在${this.userspace}migration路径下。`,
          tip6: '已完成，下一步',
          tip7: '已完成，确认升级'
        };
      }
    });
  }
  public Opentip2() {
    this.tips1Mask.Close();
    this.token = sessionStorage.getItem('token');
    this.headersConfig.Authorization = this.token;
    this.tips2Mask.Open();
  }
  public Opentip1() {
    this.tips2Mask.Close();
    this.tips1Mask.Open();
  }
  public next() {
    this.tips1Mask.Close();
    this.token = sessionStorage.getItem('token');
    this.headersConfig.Authorization = this.token;
    this.tips2Mask.Open();
  }

  onCompleteItems($event: any): void {
    // 根据状态码和返回消息设置详情信息
    const data = JSON.parse($event.response);
    if (this.commonService.handleStatus(data) === 1 || data.status === 2) {
      this.test.uploadLan.errorSingleInfo = this.currLang === 'zh-cn'
        ? data.infochinese
        : data.info;
    }
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
      this.uploadPackageKind = 'Upload Resource Package';
      this.tipsinfo.tip1 = 'Download the software porting template resource package';
      this.tipsinfo.tip2 = 'Log in to the Kunpeng community ';
      this.tipsinfo.tip3 = ' to download the software porting template resource package.';
      this.tipsinfo.url =  hardUrl.depDictoryUrl;
      this.tipsinfo.tip4 = 'Upload the resource package';
      this.tipsinfo.tip5 = `The resource package is stored in the ${
        this.userspace
      }migration directory by default after being uploaded to the server.`;
      this.tipsinfo.tip6 = 'Next';
      this.tipsinfo.tip7 = 'Upload Completed';
    }
    this.xmlsituation = -1;
    let optionStr = '';
    if (val.option === 0) {
      optionStr = 'backup';
      this.xmlinfo.ing = this.backup.ing;
      this.xmlinfo.success = this.backup.success;
      this.xmlinfo.fail = this.backup.fail;
      this.xmlinfo.operation = this.backup.operation;
      this.title.tit = this.backup.title;
      this.title.ps1 = this.backup.ps1;
    } else if (val.option === 2) {
      optionStr = 'upgrade';
      this.xmlinfo.ing = this.upgrade.ing;
      this.xmlinfo.success = this.upgrade.success;
      this.xmlinfo.fail = this.upgrade.fail;
      this.xmlinfo.operation = this.upgrade.operation;
      this.title.tit = this.upgrade.title;
      this.title.ps1 = this.upgrade.ps1;
    } else if (val.option === 1) {
      optionStr = 'recovery';
      this.xmlinfo.ing = this.recovery.ing;
      this.xmlinfo.success = this.recovery.success;
      this.xmlinfo.fail = this.recovery.fail;
      this.xmlinfo.operation = this.recovery.operation;
      this.title.tit = this.recovery.title;
      this.title.ps1 = this.recovery.ps1;
    }

    const param = {
      operation: optionStr,
      password: val.password
    };
    const url = `/portadv/solution/management/`;
    this.Axios.axios.post(url, param).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.taskId = data.data.id;
        this.getxmlStatus();
      } else {
        const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        this.myTip.alertInfo({ type: 'error', content, time: 10000 });
      }
    });
  }
  /**
   * 获取软件迁移模板状态
   */
  public getxmlStatus() {
    this.Axios.axios.get(
      `/task/progress/?task_type=4&task_id=${encodeURIComponent(this.taskId)}`)
    .then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (data.data.runningstatus === 0) {
          // 打包成功
          this.xmlinfo.tip = this.chooseInfoLanguage(data);
          this.xmlsituation = 2;
          clearTimeout(this.timer);
          this.timer = null;
        } else if (data.data.runningstatus === 1 || data.data.runningstatus === 2) {
          // 正在打包
          this.xmlinfo.tip = this.chooseInfoLanguage(data);
          this.xmlinfo.progessValue = data.data.progress + '%';
          this.xmlinfo.barWidth = Math.floor((data.data.progress / this.totalProgress) * this.totalBar);
          this.xmlsituation = 1;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          this.timer = setTimeout(() => this.getxmlStatus(), 1000);
        } else if (data.data.runningstatus === -1) {
          // 打包失败
          clearTimeout(this.timer);
          this.timer = null;
          this.xmlinfo.tip = this.chooseInfoLanguage(data);
          this.xmlsituation = 3;
        }
      }
    });
  }

  public chooseInfoLanguage(data: any) {
    const info = this.currLang === 'zh-cn'
      ? data.data.infochinese
      : data.data.info;
    return info;
  }

}
