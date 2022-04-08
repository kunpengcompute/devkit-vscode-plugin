import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';
import { TiMessageService } from '@cloud/tiny3';

@Component({
  selector: 'app-header-system-setting',
  templateUrl: './header-system-setting.component.html',
  styleUrls: ['./header-system-setting.component.scss']
})
export class HeaderSystemSettingComponent implements OnInit {
  public commonConfig = {
    userCount: {
      label: '',
      range: [1, 20]
    },
    timeout: {
      label: '',
      range: [10, 240]
    },
    webWarnDeadline: {
      label: '',
      range: [7, 180]
    },
    userManRunLogLevel: {
      label: '',
      range: [
        { label: 'DEBUG', val: 'DEBUG' },
        { label: 'INFO', val: 'INFO' },
        { label: 'WARNING', val: 'WARNING' },
        { label: 'ERROR', val: 'ERROR' },
        { label: 'CRITICAL', val: 'CRITICAL' }
      ],
      tip: ''
    },
    passwordOutDate: {
      label: '',
      range: [7, 90]
    },
  };

  public userCountValue = ''; // 最大在线普通用户数
  public timeoutValue = ''; // 超时时间(分钟)
  public webWarnDeadlineValue = ''; // Web服务证书自动告警时间(天)
  public userManRunLogLevelValue: { label: string, val: string }; // 用户管理运行日志级别
  public passwordOutDateValue = ''; // 密码过期周期

  public i18n: any;
  public myTip: { sameValue: () => void, editOk: () => void, editError: () => void };

  constructor(
    public i18nService: I18nService,
    public axiosHttp: AxiosService,
    public mytipService: MytipService,
    private tiMessage: TiMessageService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.myTip = this.myTipBuilder();
    this.commonConfig.userCount.label = this.i18n.system_config.user_count;
    this.commonConfig.timeout.label = this.i18n.system_config.session_timeout;
    this.commonConfig.webWarnDeadline.label = this.i18n.system_config.web_deadline;
    this.commonConfig.userManRunLogLevel.label = this.i18n.system_config.user_man_run_log_level;
    this.commonConfig.userManRunLogLevel.tip = this.i18n.tip_msg.system_setting_select_loglevel_tip;
    this.commonConfig.passwordOutDate.label = this.i18n.system_config.password_out_date;
  }
  public isLoading: any = false;

  ngOnInit() {
    this.requestConfigData();
  }

  public onUserCountConfirm(val: any) {
    if (val === this.userCountValue) {
      return;
    }
    this.isLoading = true;
    const temp = this.userCountValue;
    this.userCountValue = val;
    const params = { user_config: { ONLINE_USERS: val } };
    this.axiosHttp.axios.put(
      'config/userconf/',
      params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.myTip.editOk();
      })
      .catch(() => {
        this.isLoading = false;
        this.userCountValue = temp;
        this.myTip.editError();
      });
  }

  public onTimeoutConfirm(val: any) {
    if (val === this.timeoutValue) {
      return;
    }
    this.isLoading = true;
    const temp = this.timeoutValue;
    this.timeoutValue = val;
    const params = { user_config: { USER_TIMEOUT: val } };
    this.axiosHttp.axios.put(
      'config/userconf/',
      params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.myTip.editOk();
      })
      .catch(() => {
        this.isLoading = false;
        this.timeoutValue = temp;
        this.myTip.editError();
      });
  }

  public onWebWarnDeadlineConfirm(val: any) {
    if (val === this.webWarnDeadlineValue) {
      return;
    }
    this.isLoading = true;
    const temp = this.webWarnDeadlineValue;
    this.webWarnDeadlineValue = val;
    const params = { user_config: { CERT_ADVANCED_DAYS: val } };
    this.axiosHttp.axios.put(
      'config/userconf/',
      params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.myTip.editOk();
        this.verifyWebCertificate();
      })
      .catch(() => {
        this.isLoading = false;
        this.webWarnDeadlineValue = temp;
        this.myTip.editError();
      });
  }

  public onUserManRunLogLevelConfirm(data: any) {
    if (data.val === this.userManRunLogLevelValue.val) {
      return;
    }
    this.isLoading = true;
    const temp = this.userManRunLogLevelValue;
    this.userManRunLogLevelValue = data;
    const params = { logLevel: data.val };
    this.axiosHttp.axios.post(
      '/run-logs/update/',
      params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.myTip.editOk();
      })
      .catch(() => {
        this.isLoading = false;
        this.userManRunLogLevelValue = temp;
        this.myTip.editError();
      });
  }

  public onPasswordOutDateConfirm(val: string) {
    if (val === this.passwordOutDateValue) {
      return;
    }
    this.isLoading = true;
    const temp = this.passwordOutDateValue;
    this.passwordOutDateValue = val;
    const params = { user_config: { PASSWORD_EXPIRATION_TIME: val } };
    this.axiosHttp.axios.put(
      'config/userconf/',
      params,
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.isLoading = false;
        this.myTip.editOk();
        this.verifyWebCertificate();
      })
      .catch(() => {
        this.isLoading = false;
        this.passwordOutDateValue = temp;
        this.myTip.editError();
      });
  }


  private requestConfigData() {
    this.isLoading = true;
    // 最大在线普通用户数、登录超时时间(分钟)、Web服务证书自动告警时间(天)
    this.axiosHttp.axios.get(
      'config/userconf/',
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(({ data }: any) => {
        this.isLoading = false;
        this.webWarnDeadlineValue = data.CERT_ADVANCED_DAYS == null ? ''
                                    : parseInt(data.CERT_ADVANCED_DAYS, 10).toString();
        this.timeoutValue = data.USER_TIMEOUT == null ? '' : parseInt(data.USER_TIMEOUT, 10).toString();
        this.userCountValue = data.ONLINE_USERS == null ? '' : parseInt(data.ONLINE_USERS, 10).toString();
        this.passwordOutDateValue = data.PASSWORD_EXPIRATION_TIME == null ? ''
                                    : parseInt(data.PASSWORD_EXPIRATION_TIME, 10).toString();
      }).catch(() => {
        this.isLoading = false;
      });
    // 用户管理运行日志级别
    this.axiosHttp.axios.get(
      '/run-logs/info/',
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(({ data }: any) => {
        this.isLoading = false;
        const logLevel: string = data.logLevel;
        this.userManRunLogLevelValue = { label: logLevel.toUpperCase(), val: logLevel };
      }).catch(() => {
        this.isLoading = false;
      });
  }

  private verifyWebCertificate(): void {
    this.isLoading = true;
    const popTip = (content: any) => {
      this.tiMessage.open({
        type: 'warn',
        title: this.i18n.certificate.notice,
        content,
        okButton: {
          text: this.i18n.common_term_operate_ok
        },
        cancelButton: {
          show: false
        }
      });
    };
    this.axiosHttp.axios.get('/certificates/', { baseURL: '../user-management/api/v2.2',
     headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      const { certStatus, expireDate } = res.data[0];
      if (certStatus === '2') {
        popTip(this.i18n.certificate.webWarnNotice1);
      } else if (certStatus === '1') {
        const tipContent = this.i18n.certificate.webWarnNotice2.toString().replace('${time}', expireDate);
        popTip(tipContent);
      }
    }).catch(() => {
      this.isLoading = false;
    });
  }

 /**
  * 提示生成器，因为使用 this.i18n ，所以应在 constructor 中“实例化”
  */
  private myTipBuilder() {
    const sameValueTip = this.i18n.tip_msg.system_setting_input_same_value;
    const editOkTip = this.i18n.tip_msg.edite_ok;
    const editErrorTip = this.i18n.tip_msg.edite_error;

    const sameValue = () => {
      this.mytipService.alertInfo({
        type: 'warn',
        content: sameValueTip,
        time: 3500,
      });
    };

    const editOk = () => {
      this.mytipService.alertInfo({
        type: 'success',
        content: editOkTip,
        time: 3500,
      });
    };

    const editError = () => {
      this.mytipService.alertInfo({
        type: 'error',
        content: editErrorTip,
        time: 3500,
      });
    };

    return { sameValue, editOk, editError };
  }
}

