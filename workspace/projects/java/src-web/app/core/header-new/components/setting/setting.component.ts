import { Component, OnInit } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { ProfileDownloadService } from 'projects/java/src-web/app/service/profile-download.service';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  public language: 'zh-cn' | 'en-us' | string = sessionStorage.getItem('language'); // 语言环境
  constructor(
    public i18nServe: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    private downloadService: ProfileDownloadService
  ) {
    this.i18n = this.i18nServe.I18n();
    this.formItems = {
      maxUsers: {
        title: this.i18n.newHeader.setting.maxusers,
        value: '',
        errMsg: '',
        notice: '(1~20)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      overTime: {
        title: this.i18n.newHeader.setting.overTime,
        value: '',
        errMsg: '',
        notice: '(30~240)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      webCert: {
        title: this.i18n.newHeader.setting.webCert,
        value: '',
        errMsg: '',
        notice: '(7~180)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      pwd: {
        title: this.i18n.newHeader.setting.password_out_date,
        value: '',
        errMsg: '',
        notice: '(7~90)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      userRunLogLevel: {
        title: this.i18n.newHeader.setting.userRunLogLevel,
        value: { label: '', value: '' },
        errMsg: '',
        notice: './assets/img/header/icon-navgationbar-help.svg',
        tip: this.i18n.newHeader.setting.userRunLogTip,
        valid: true,
        isModify: false,
        require: true,
        options: []
      },
      javaCertificate: {
        title: this.i18n.newHeader.setting.javaCertificate,
        value: '',
        errMsg: '',
        notice: '(7~180)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      runLogLevel: {
        title: this.i18n.newHeader.setting.runLogLevel,
        value: { label: '', value: '' },
        errMsg: '',
        notice: './assets/img/header/icon-navgationbar-help.svg',
        tip: this.i18n.newHeader.setting.runLogTip,
        valid: true,
        isModify: false,
        require: true,
        options: []
      },
      stackDepth: {
        title: this.i18n.newHeader.setting.stackDepth,
        value: '',
        errMsg: '',
        notice: '(16~64)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      }
    };

  }
  public commonConfig: any = {
    userCount: {
      label: '',
      range: [1, 20],
      text: ''
    },
    timeout: {
      label: '',
      range: [10, 240],
      text: ''
    },
    webWarnDeadline: {
      label: '',
      range: [7, 180],
      text: ''
    },
    passwordOutDate: {
      label: '',
      range: [7, 90],
      text: ''
    },
    stackDepth: {
      label: '',
      range: [16, 64],
      text: ''
    }
  };
  public sysTuningConfig = {
    agentWarnDeadline: {
      label: '',
      range: [7, 180],
      text: ''
    },
  };
  public i18n: any;
  public formItems: any = {
    maxUsers: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    overTime: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    webCert: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    pwd: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    userRunLogLevel: {
      title: '',
      value: { label: '', value: '' },
      errMsg: '',
      notice: '',
      tip: '',
      valid: true,
      isModify: false,
      require: true,
      options: []
    },
    javaCertificate: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    runLogLevel: {
      title: '',
      value: { label: '', value: '' },
      errMsg: '',
      notice: '',
      tip: '',
      valid: true,
      isModify: false,
      require: true,
      options: []
    },
    stackDepth: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    }
  };
  /**
   * 将请求的数据保存在这里，点击取消后，从这里将值重新赋值
   */
  public formItemsValues: any = {
    maxUsers: '',
    overTime: '',
    webCert: '',
    javaCertificate: '',
    passwordOutDate: '',
    runLogLevel: { label: '', value: '' },
    userRunLogLevel: { label: '', value: '' },
    stackDepth: ''
  };
  public validMap = new Map();
  public role: any;
  public isLoading: any = false;
  ngOnInit() {
    this.commonConfig.userCount.label = this.i18n.newHeader.setting.maxusers;
    this.commonConfig.timeout.label = this.i18n.newHeader.setting.overTime;
    this.commonConfig.webWarnDeadline.label = this.i18n.newHeader.setting.webCert;
    this.commonConfig.stackDepth.label = this.i18n.newHeader.setting.stackDepth;
    this.commonConfig.passwordOutDate.label = this.i18n.newHeader.setting.password_out_date;
    this.sysTuningConfig.agentWarnDeadline.label = this.i18n.newHeader.setting.javaCertificate;
    this.role = sessionStorage.getItem('role');
    this.getUserSetting();
    this.getUserManageLog();
    this.getJavaCertAlertSetting();
    this.getJavaSetting();
    this.getUserManageLogLevels();
    this.getStack();
    if (this.role === 'Admin') {
      this.getLogLevels();
    }
  }


  public onPasswordOutDateConfirm(val: any) {
    if (val === this.formItems.pwd.value) {
      return;
    }
    this.isLoading = true;
    const params = { user_config: { PASSWORD_EXPIRATION_TIME: val } };
    this.Axios.axios.put('config/userconf/', params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.formItems.pwd.isModify = false;
        this.formItems.pwd.value = val;
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      }).catch(() => {
        this.isLoading = false;
      });
  }
  /**
   * 获取系统配置  , { baseURL: '../user-management/api/v2.2'}
   */
  public getUserSetting() {
    this.isLoading = true;
    this.Axios.axios.get('config/userconf/',
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(({ data }: any) => {
        this.formItems.maxUsers.value = data.ONLINE_USERS;
        this.formItems.overTime.value = data.USER_TIMEOUT;
        this.formItems.webCert.value = data.CERT_ADVANCED_DAYS;
        this.formItems.pwd.value = data.PASSWORD_EXPIRATION_TIME;
        this.formItemsValues.maxUsers = data.ONLINE_USERS;
        this.formItemsValues.overTime = data.USER_TIMEOUT;
        this.formItemsValues.webCert = data.CERT_ADVANCED_DAYS;
        this.formItemsValues.passwordOutDate = data.PASSWORD_EXPIRATION_TIME;
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
      });
  }
  public getUserManageLog() {
    this.Axios.axios.get('run-logs/info/', { baseURL: '../user-management/api/v2.2' }).then((res: any) => {
      this.formItems.userRunLogLevel.value = {
        label: res.data.logLevel,
        value: res.data.logLevel
      };
      this.formItemsValues.userRunLogLevel = {
        label: res.data.logLevel,
        value: res.data.logLevel
      };
    });
  }
  // 获取user_management日志级别种类
  public getUserManageLogLevels() {
    this.Axios.axios.get('run-logs/list/', { baseURL: '../user-management/api/v2.2' }).then((res: any) => {
      res.data.members.forEach((item: any) => {
        this.formItems.userRunLogLevel.options.push({ label: item, value: item });
      });
    });
  }
  /**
   * 获取Java配置
   */
  public getLogLevels() {
    this.Axios.axios.get('/logging/levels').then((res: any) => {
      res.members.map((item: any) => {
        this.formItems.runLogLevel.options.push({ label: item, value: item });
      });
    });
  }
  public getJavaSetting() {
    this.Axios.axios.get('/logging/levels/root').then((res: any) => {
      this.formItems.runLogLevel.value = {
        label: res.serverLogLevel,
        value: res.serverLogLevel
      };
      this.formItemsValues.runLogLevel = {
        label: res.serverLogLevel,
        value: res.serverLogLevel
      };
    });
  }
  public getJavaCertAlertSetting() {
    this.Axios.axios.get('tools/certificates').then((res: any) => {
      this.formItems.javaCertificate.value = res.members[0].earlyWarningDays;
      this.formItemsValues.javaCertificate = res.members[0].earlyWarningDays;
      this.downloadService.downloadItems.report.earlyWarningDays = res.members[0].earlyWarningDays;
    });
  }
  // 获取栈深度配置
  public getStack() {
    this.Axios.axios.get('tools/settings/stackDepth').then((res: any) => {
      this.formItems.stackDepth.value = res;
      this.formItemsValues.stackDepth = res;
      this.downloadService.downloadItems.pFileIO.stackDepth = res;
    });
  }
  /**
   * @param item 类型 maxUsers, overTime, webCert, operateOutTime, runLogLevel
   * @param status 状态 true ，false
   */
  public onSettingChange(item: any, status: any) {
    this.formItems[item].isModify = status;
    this.formItems[item].value = this.formItemsValues[item];
  }
  /**
   * 点击确认后，根据类型，执行对应方法
   * @param type 类型 maxUsers, overTime, webCert, operateOutTime, runLogLevel
   */
  public onSettingConfim(type: any, val: any) {
    switch (type) {
      case 'userRunLogLevel':
        this.handleUserLogLevel(val);
        break;
      case 'runLogLevel':
        this.handleRunLogLevel(val);
        break;
      default:
        break;
    }
  }

  /**
   * 判断最大用户数是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleUserConfirm(val: any) {
    if (val === this.formItems.maxUsers.value) {
      return;
    }
    this.isLoading = true;
    const params = { user_config: { ONLINE_USERS: val } };
    this.Axios.axios.put('config/userconf/', params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.formItems.maxUsers.isModify = false;
        this.formItems.maxUsers.value = val;
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      }).catch(() => {
        this.isLoading = false;
      });

  }

  /**
   * 判断超时时间（分钟）是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleTimeOutConfirm(val: any) {
    if (val === this.formItems.overTime.value) {
      return;
    }
    this.isLoading = true;
    const params = { user_config: { USER_TIMEOUT: val } };
    this.Axios.axios.put('config/userconf/', params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.formItems.overTime.isModify = false;
        this.formItems.overTime.value = val;
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      }).catch(() => {
        this.isLoading = false;
      });

  }

  /**
   * 判断Web服务证书自动告警时间是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleWebCertConfirm(val: any) {
    if (val === this.formItems.webCert.value) {
      return;
    }
    this.isLoading = true;
    const params = { user_config: { CERT_ADVANCED_DAYS: val } };
    this.Axios.axios.put('config/userconf/', params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.formItems.webCert.isModify = false;
        this.formItems.webCert.value = val;
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      }).catch(() => {
        this.isLoading = false;
      });

  }

  /**
   * 判断内部通信证书自动告警时间（天）是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   * 暂时没有接口
   */
  public handleJavaCertificateConfirm(val: any) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.earlyWarningDays)) {
      return;
    }
    this.isLoading = true;
    const params = { earlyWarningDays: val };
    this.Axios.axios.post('tools/certificates/warningDays',
      params, { headers: { showLoading: false } }).then((res: any) => {
        this.isLoading = false;
        this.formItems.javaCertificate.isModify = false;
        this.formItems.javaCertificate.value = val;
        this.downloadService.downloadItems.report.earlyWarningDays = Number(val);
        if (res.result === 'success') {
          this.myTip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500,
          });
        }
      }).catch(() => {
        this.isLoading = false;
      });

  }
  /**
   * 运行日志级别校验并发送数据
   */
  public handleRunLogLevel(val: any) {
    this.handleRunLogLevelConfirm(val);
  }
  /**
   * 判断运行日志级别是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleRunLogLevelConfirm(val: any) {
    if (val.value === this.formItemsValues.runLogLevel.value) {
      this.onSettingChange('runLogLevel', false);
      return;
    }
    this.isLoading = true;
    const params = { validLogLevel: this.formItems.runLogLevel.value.value };
    this.Axios.axios.patch('/logging/levels/root', params, { headers: { showLoading: false } }).then(() => {
      this.isLoading = false;
      this.formItems.runLogLevel.isModify = false;
      this.formItemsValues.runLogLevel = this.formItems.runLogLevel.value;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 运行日志级别校验并发送数据
   */
  public handleUserLogLevel(val: any) {
    this.handleUserLogLevelConfirm(val);
  }
  /**
   * 判断运行日志级别是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleUserLogLevelConfirm(val: any) {
    if (val.value === this.formItemsValues.userRunLogLevel.value) {
      this.onSettingChange('userRunLogLevel', false);
      return;
    }
    this.isLoading = true;
    const params = { logLevel: this.formItems.userRunLogLevel.value.value };
    this.Axios.axios.post('run-logs/update/', params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.formItems.userRunLogLevel.isModify = false;
        this.formItemsValues.userRunLogLevel = this.formItems.userRunLogLevel.value;
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      }).catch(() => {
        this.isLoading = false;
      });
  }
  /**
   * 配置栈深度，发送数据
   */
  public handleStack(val: any) {
    if (Number(val) === Number(this.downloadService.downloadItems.pFileIO.stackDepth)) {
      return;
    }
    this.isLoading = true;
    this.Axios.axios.post(`tools/settings/stackDepth/${encodeURIComponent(val)}`,
      null, { headers: { showLoading: false } })
      .then((res: any) => {
        this.isLoading = false;
        this.formItems.stackDepth.isModify = false;
        this.formItems.stackDepth.value = val;
        this.downloadService.downloadItems.pFileIO.stackDepth = val;
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      }).catch(() => {
        this.isLoading = false;
      });
  }
}
