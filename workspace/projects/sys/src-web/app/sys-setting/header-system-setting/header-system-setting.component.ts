import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';

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

  public sysTuningConfig = {
    runLogLevel: {
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
    applicationPath: {
      label: ''
    }
  };

  public userCountValue = ''; // 最大在线普通用户数
  public timeoutValue = ''; // 超时时间(分钟)
  public webWarnDeadlineValue = ''; // Web服务证书自动告警时间(天)
  public agentWarnDeadlineValue = ''; // Agent服务证书自动告警时间(天)
  public runLogLevelValue: { label: string, val: string }; // 运行日志级别
  public userManRunLogLevelValue: { label: string, val: string }; // 用户管理运行日志级别
  public applicationPathValue = ''; // 应用程序路径配置
  public passwordOutDateValue = ''; // 密码过期周期
  private url: any;
  public i18n: any;
  public myTip: { sameValue: () => void, editeOk: () => void, editeError: () => void };
  public toolType: ToolType;
  public isToolConfigText = '';

  constructor(
    public i18nService: I18nService,
    public axiosHttp: AxiosService,
    public mytipService: MytipService,
    private tiMessage: MessageModalService,
    private urlService: UrlService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.myTip = this.myTipBuilder();
    this.url = this.urlService.Url();
    this.commonConfig.userCount.label = this.i18n.system_config.user_count;
    this.commonConfig.timeout.label = this.i18n.system_config.session_timeout;
    this.commonConfig.webWarnDeadline.label = this.i18n.system_config.web_deadline;
    this.commonConfig.userManRunLogLevel.label = this.i18n.system_config.user_man_run_log_level;
    this.commonConfig.userManRunLogLevel.tip = this.i18n.tip_msg.system_setting_select_loglevel_tip;
    this.commonConfig.passwordOutDate.label = this.i18n.system_config.password_out_date;

    this.sysTuningConfig.runLogLevel.label = this.i18n.system_config.run_log_level;
    this.sysTuningConfig.runLogLevel.tip = this.i18n.tip_msg.system_setting_select_loglevel_tip;
    this.sysTuningConfig.applicationPath.label = this.i18n.system_config.application_path;
  }
  public isLoading: any = false;
  ngOnInit() {
    this.requestConfigData();
    this.toolType = sessionStorage.getItem('toolType') as ToolType;
    if (this.toolType === ToolType.DIAGNOSE) {
      this.isToolConfigText = this.i18n.system_config.diagnose_config;
    } else if (this.toolType === ToolType.TUNINGHELPER) {
      this.isToolConfigText = this.i18n.system_config.tuning_assistant_config;
    } else {
      this.isToolConfigText = this.i18n.system_config.system_tuning;
    }
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
        this.myTip.editeOk();
        this.isLoading = false;
      })
      .catch(() => {
        this.userCountValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
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
    this.axiosHttp.axios.put('config/userconf/', params,
    { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.myTip.editeOk();
        this.isLoading = false;
      })
      .catch(() => {
        this.timeoutValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
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
    this.axiosHttp.axios.put('config/userconf/', params,
    { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(() => {
        this.myTip.editeOk();
        this.verifyWebCertificate();
        this.isLoading = false;
      })
      .catch(() => {
        this.webWarnDeadlineValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
      });
  }

  public onRunLogLevelConfirm(data: any) {
    if (data.val === this.runLogLevelValue.val) {
      return;
    }
    this.isLoading = true;

    const temp = this.runLogLevelValue;
    this.runLogLevelValue = data;
    const params = { logLevel: data.val };
    this.axiosHttp.axios.post(this.url.runlogUpdata, params, { headers: { showLoading: false } })
      .then(() => {
        this.myTip.editeOk();
        this.isLoading = false;
      })
      .catch(() => {
        this.runLogLevelValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
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
        this.myTip.editeOk();
        this.isLoading = false;
      })
      .catch(() => {
        this.userManRunLogLevelValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
      });
  }

  public onApplicationPathConfirm(val: string) {
    if (val === this.applicationPathValue) {
      return;
    }
    this.isLoading = true;
    const temp = this.applicationPathValue;
    this.applicationPathValue = val;
    const params = { system_config: { TARGET_APP_PATH: val } };
    this.axiosHttp.axios.put(this.url.configSystem, params, { headers: { showLoading: false } })
      .then(() => {
        this.myTip.editeOk();
        this.isLoading = false;
      })
      .catch(() => {
        this.applicationPathValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
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
        this.myTip.editeOk();
        this.verifyWebCertificate();
        this.isLoading = false;
      })
      .catch(() => {
        this.passwordOutDateValue = temp;
        this.myTip.editeError();
        this.isLoading = false;
      });
  }

  /**
   * 请求接口数据
   */
  private requestConfigData() {
    this.isLoading = true;
    // 获取 agent 证书的自动告警时间、日志老化时间
    this.axiosHttp.axios.get(this.url.configSystem, { headers: { showLoading: false } })
      .then(({ data }: any) => {
        this.agentWarnDeadlineValue = data.CERT_ADVANCED_DAYS == null ? ''
                                      : parseInt(data.CERT_ADVANCED_DAYS, 10).toString();
        this.applicationPathValue = data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
      }).catch(() => {
        this.isLoading = false;
      });
    // 运行日志级别
    this.axiosHttp.axios.get('/run-logs/info/', { headers: { showLoading: false } })
      .then(({ data }: any) => {
        const logLevel: string = data.logLevel;
        this.runLogLevelValue = { label: logLevel.toUpperCase(), val: logLevel };
      }).catch(() => {
        this.isLoading = false;
      });
    // 最大在线普通用户数、登录超时时间(分钟)、Web服务证书自动告警时间(天)
    this.axiosHttp.axios.get(
      'config/userconf/',
      { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
      .then(({ data }: any) => {
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
        const logLevel: string = data.logLevel;
        this.userManRunLogLevelValue = { label: logLevel.toUpperCase(), val: logLevel };
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
      });
  }

  /**
   * 验证 web 证书是否有快到期或已经到期的
   */
  private verifyWebCertificate(): void {
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
    this.isLoading = true;
    this.axiosHttp.axios.get('/certificates/',
    { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } }).then((res: any) => {
      const { certStatus, expireDate } = res.data[0];
      if (certStatus === '2') {
        popTip(this.i18n.certificate.webWarnNotice1);
      } else if (certStatus === '1') {
        const tipContent = this.i18n.certificate.webWarnNotice2.toString().replace('${time}', expireDate);
        popTip(tipContent);
      }
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  }

  /**
   * 提示生成器，因为使用 this.i18n ，所以应在 constructor 中“实例化”
   */
  private myTipBuilder() {
    const sameValueTip = this.i18n.tip_msg.system_setting_input_same_value;
    const editeOkTip = this.i18n.tip_msg.edite_ok;
    const editeErrorTip = this.i18n.tip_msg.edite_error;

    const sameValue = () => {
      this.mytipService.alertInfo({
        type: 'warn',
        content: sameValueTip,
        time: 3500,
      });
    };

    const editeOk = () => {
      this.mytipService.alertInfo({
        type: 'success',
        content: editeOkTip,
        time: 3500,
      });
    };

    const editeError = () => {
      this.mytipService.alertInfo({
        type: 'error',
        content: editeErrorTip,
        time: 3500,
      });
    };

    return { sameValue, editeOk, editeError };
  }
}
