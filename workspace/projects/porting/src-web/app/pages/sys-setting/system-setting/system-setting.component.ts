import { Component, OnInit } from '@angular/core';
import {
  I18nService, AxiosService, MytipService,
  CommonService
} from '../../../service';

@Component({
  selector: 'app-system-setting',
  templateUrl: './system-setting.component.html',
  styleUrls: ['./system-setting.component.scss']
})
export class SystemSettingComponent implements OnInit {
  public language: string;
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
    }
  };
  public userCountValue: number; // 最大在线普通用户数
  public timeoutValue: number; // 超时时间(分钟)
  public webWarnDeadlineValue: number; // Web服务证书自动告警时间(天)
  public agentWarnDeadlineValue: number; // Agent服务证书自动告警时间(天)
  public operationLogAgeValue: number; // 操作日志老化时间(天)
  public runLogLevelValue = {label: '', val: '', inputMode: 'select'}; // 运行日志级别
  public CRLConfigration = {label: '', val: 0, inputMode: 'select'}; // 是否配置证书吊销列表检查
  public i18n: any;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public commonConfigSel = {
    runLogLevel: {
      label: '',
      range: [
        { label: 'ERROR', val: 'ERROR', inputMode: 'select' },
        { label: 'WARNING', val: 'WARNING', inputMode: 'select' },
        { label: 'INFO', val: 'INFO', inputMode: 'select' },
        { label: 'DEBUG', val: 'DEBUG', inputMode: 'select' }
      ]
    },
    CRLConfig: {
      label: 'common_term_CRL_config',
      range: [
        { label: '', val: 0, inputMode: 'select' },
        { label: '', val: 1, inputMode: 'select' }
      ]
    }
  };
  ngOnInit() {
    this.language = sessionStorage.getItem('language');
    this.commonConfig.userCount.label = this.i18n.common_term_max_user_num;
    this.commonConfig.timeout.label = this.i18n.common_term_timeout_period_unit;
    this.commonConfig.webWarnDeadline.label = this.i18n.common_term_setting_cert_config;
    this.commonConfigSel.runLogLevel.label = this.i18n.common_term_log_level;
    this.commonConfigSel.CRLConfig.label = this.i18n.common_term_CRL_config;
    this.commonConfigSel.CRLConfig.range[0].label = this.i18n.common_term_no;
    this.commonConfigSel.CRLConfig.range[1].label = this.i18n.common_term_yes;
    this.getUserNum();
    this.getTimeout();
    this.getRunLogLevel();
    this.getCertTimeoutConfig();
    this.getCRLConfiguration();
  }

  /**
   * 获取最大在线普通用户数量
   */
  public getUserNum() {
    this.Axios.axios.get(`/users/loginlimit/`).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.userCountValue = data.data.max_online_users;
      }
    });
  }

  /**
   * 获取超时时间
   */
  public getTimeout() {
    this.Axios.axios.get(`/admin/timeout/`).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.timeoutValue = data.data.timeout_configuration;
      }
    });
  }
  /**
   * 获取日志级别
   */
  public getRunLogLevel() {
    this.Axios.axios.get('/users/1/loglevel/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.runLogLevelValue = this.commonConfigSel.runLogLevel.range.find(item => item.val === data.data.level);
      }
    });
  }
  /**
   * 获取吊销列表配置
   */
  public getCRLConfiguration() {
    this.Axios.axios.get('/cert/crl/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        let CRLConfigrationFlag = 0;
        if (data.data.crl_configuration) {
          CRLConfigrationFlag = 1;
        }
        this.CRLConfigration = this.commonConfigSel.CRLConfig.range
          .find(item => item.val === CRLConfigrationFlag);
      }
    });
  }

  // 获取证书告警时间
  public getCertTimeoutConfig() {
    this.Axios.axios.get('/cert/cert_time/').then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.webWarnDeadlineValue = resp.data.cert_time;
      }
    });
  }

  // 修改证书配置
  public onWebWarnDeadlineConfirm(val: any) {
    if (val === this.webWarnDeadlineValue) {
      this.myTip.alertInfo({ type: 'warn', content: this.i18n.system_setting.info, time: 5000, });
      return;
    }
    this.Axios.axios.post('/cert/cert_time/', {cert_time: Number(val)}).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.webWarnDeadlineValue = resp.data.cert_time;
      }
      const type = this.commonService.handleStatus(resp) === 0 ? 'success' : 'warn';
      const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
      this.myTip.alertInfo({ type, content: msg, time: 5000, });
    });
  }

  /**
   * 修改最大在线普通用户数量
   */
  public onUserCountConfirm(val: any) {
    if (val === this.userCountValue) {
      this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.system_setting.info,
        time: 3500,
      });
      return;
    }
    const temp = this.userCountValue;
    this.userCountValue = val;
    const params = {
      max_online_users: Number(this.userCountValue)
    };
    this.Axios.axios.post('/users/loginlimit/', params)
      .then((data: any) => {
        if (this.commonService.handleStatus(data) === 0) {
          this.getUserNum();
          this.myTip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500,
          });
        } else {
          this.getUserNum();
          const infoContent = this.language === 'zh-cn'
            ? data.infochinese
            : data.info;
          this.myTip.alertInfo({
            type: 'error',
            content: infoContent,
            time: 3500,
          });
        }

      })
      .catch(() => {
        this.userCountValue = temp;
      });
  }

  /**
   * 修改超时时间
   */
  public onTimeoutConfirm(val: any) {
    if (val === this.timeoutValue) {
      this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.system_setting.info,
        time: 3500,
      });
      return;
    }
    const temp = this.timeoutValue;
    this.timeoutValue = val;
    const params = {
      new_timeout_configuration: Number(this.timeoutValue),
    };
    this.Axios.axios.post('/admin/timeout/', params)
      .then((data: any) => {
        if (this.commonService.handleStatus(data) === 0) {
          // 设置登录超时成功时再重新获取一下超时时间-为了刷新token
          this.getTimeout();
          this.myTip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500,
          });
        } else {
          const infoContent = this.language === 'zh-cn'
            ? data.infochinese
            : data.info;
          this.getTimeout();
          this.myTip.alertInfo({
            type: 'error',
            content: infoContent,
            time: 3500,
          });
        }
      })
      .catch(() => {
        this.timeoutValue = temp;
      });
  }
  /**
   * 修改当前日志级别
   */
  public onLogLevelConfirm(val: any) {
    if (this.isEqual(val, this.runLogLevelValue)) {
      this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.system_setting.info,
        time: 3500,
      });
      return;
    }
    const temp = this.runLogLevelValue;
    const params = {
      level: val.val,
    };
    this.Axios.axios.post(`/users/1/loglevel/ `, params).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.getRunLogLevel();
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      } else {
        const content = this.language === 'zh-cn'
                      ? data.infochinese
                      : data.info;
        this.runLogLevelValue = { label: '', val: '', inputMode: 'select' };
        this.myTip.alertInfo({
          type: 'error',
          content,
          time: 3500,
        });
      }
    });
  }
  public onCRLCongurationConfirm(val: any) {
    if (this.isEqual(val, this.CRLConfigration)) {
      this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.system_setting.info,
        time: 3500,
      });
      return;
    }
    const temp = this.CRLConfigration;
    const params = {
      new_crl_configuration: val.val,
    };
    this.Axios.axios.post(`/cert/crl/ `, params).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.getRunLogLevel();
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
        this.CRLConfigration = val;
      } else {
        const content = this.language === 'zh-cn'
          ? data.infochinese
          : data.info;
        this.CRLConfigration = temp;
        this.myTip.alertInfo({
          type: 'error',
          content,
          time: 3500,
        });
      }
    });
  }
  /**
   * 判断对象是否相等
   */
  isEqual(a: any, b: any) {
    const aLength = Object.keys(a).length;
    const bLength = Object.keys(b).length;
    if (aLength !== bLength) {
      return false;
    } else {
      for (const key in b) { // 当前场景为值都是字符串或者数组
        if (a[key] !== b[key]) {
          return false;
        }
      }
    }
    return true;
  }
}
