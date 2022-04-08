import { Component, OnInit, ViewChild } from '@angular/core';
import { TimeOutManager } from '../port-setting.timeout.component';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { UserManager } from '../port-setting.usermanager.component';
import { TiMessageService, TiSelectComponent, TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MytipService } from '../../service/mytip.service';
import { MessageService } from '../../service/message.service';

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}

const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

// 证书状态
const enum CERT_STATE {
    STATE_VALID = '1',
    STATE_EXPIRING = '0',
    STATE_EXPIRED = '-1'
}

@Component({
    selector: 'app-system-setting',
    templateUrl: './system-setting.component.html',
    styleUrls: ['./system-setting.component.scss']
})
export class SystemSettingComponent implements OnInit {

    public logLevel = {
        label: '',
        modifying: false,
        oldLevelIndex: 0,
        selected: {
            label: 'INFO',
            index: 0
        },
        options: [
            {
                label: 'ERROR',
                index: 0
            },
            {
                label: 'WARNING',
                index: 1
            },
            {
                label: 'INFO',
                index: 2
            },
            {
                label: 'DEBUG',
                index: 3
            }
        ]
    };

  public  crlConfig = {
    label: '',
    modifying: false,
    oldLevelIndex: 0,
    selected: {
      label: '',
      index: 0
    },
    options: [
      {
        label: '',
        index: 0
      },
      {
        label: '',
        index: 1
      }
    ]
  };

    public validation: TiValidationConfig = {
        type: 'change',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public maxUsersControl: FormControl;
    public timeoutControl: FormControl;
    public certWarnControl: FormControl;

    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        public timessage: TiMessageService,
        public fb: FormBuilder,
        public mytip: MytipService,
        private msgService: MessageService
    ) {
        this.i18n = this.i18nService.I18n();

        this.logLevel.label = this.i18n.common_term_runLogLevel;
        this.logLevel.selected = this.logLevel.options[0];
        this.crlConfig.label = this.i18n.common_term_CRL_config;
        this.timeOutManager = new TimeOutManager(vscodeService);
        this.userManager = new UserManager(timessage, fb, mytip, i18nService, vscodeService);
        this.maxUsersControl = new FormControl('', [this.maxUsersComfirm]);
        this.timeoutControl = new FormControl('', [this.timeoutComfirm]);
        this.certWarnControl = new FormControl('', [this.certWarnComfirm]);
    }

    public timeOutManager: TimeOutManager;
    public userManager: UserManager;
    public isDangerousUser = false;
    public changeNumsTips: string;
    public errorMessageUser: string;
    public changeFlag = false;
    public errorWebCertFlag = false;
    public modifyWebCertThreshold: any;
    public webCertThreshold: number;

    // 公共参数
    public i18n: any;
    public currLang: any;
    public username: string;
    public loginUserId: string;

    ngOnInit() {
        this.currLang = I18nService.getLang();
        this.changeNumsTips = this.i18n.plugins_porting_tips_changeNum;
        this.username = ((self as any).webviewSession || {}).getItem('username');
        this.loginUserId = ((self as any).webviewSession || {}).getItem('loginId');

        this.timeOutManager.showConfig();
        this.userManager.getUserNum();
        setTimeout(() => {
            this.getCertTimeoutConfig();
        }, 1500);
        this.crlConfig.options[0].label = this.i18n.common_term_no;
        this.crlConfig.options[1].label = this.i18n.common_term_yes;
        this.getRunLogLevel();
        this.getCRLconfig();
    }

    /**
     *  查询运行日志级别设置数据
     */
    public getRunLogLevel() {
        const option = {
            url: '/users/' + encodeURIComponent(this.loginUserId) + '/loglevel/'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                const selectedIndex = this.logLevel.options.findIndex(item => (item.label === data.data.level));
                this.logLevel.selected = this.logLevel.options[selectedIndex];
                this.logLevel.oldLevelIndex = selectedIndex;
            } else {
                this.showMessageByLang(data, 'error');
            }
        });
    }
  /**
   *  查询是否配置证书吊销列表检查
   */
    public getCRLconfig() {
      const option = {
        url: '/cert/crl/'
      };
      this.vscodeService.get(option, (data: any) => {
        if (data.status === STATUS.SUCCESS) {
          let CRLConfigFlag = 0;
          if (data.data.crl_configuration) {
            CRLConfigFlag = 1;
          }
          const selectedIndex = this.crlConfig.options.findIndex(item => (item.index === CRLConfigFlag));
          this.crlConfig.selected = this.crlConfig.options[selectedIndex];
          this.crlConfig.oldLevelIndex = selectedIndex;
        } else {
          this.showMessageByLang(data, 'error');
        }
    });
  }

    /**
     * 打开修改超时时间
     */
    public openTimeOutChange() {
        this.timeOutManager.openNumChange();
    }

    /**
     * 修改超时时间
     */
    public changeTimeOut() {
      this.timeOutManager.changeNum(this);
      // 刷新操作日志
      setTimeout(() => this.msgService.sendMessage({type: 'refreshOperationLog'}), 1000);
    }

    /**
     * 关闭修改超时时间
     */
    public closeTimeOut() {
        this.timeOutManager.closeNumChange();
    }

    /**
     * 与vscode的交互
     */
    modifyDepParaSuc(data: any) {
        if (data.status === STATUS.SUCCESS) {
            this.showMessageByLang(data, 'info');
        } else {
            this.showMessageByLang(data, 'error');
        }
    }

    // 发送消息中英文判断
    showMessageByLang(data: any, type: any) {
        this.currLang = I18nService.getLang();
        if (this.currLang === LANGUAGE_TYPE.ZH) {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }

    // 发送消息给vscode, 右下角弹出提醒框
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 打开修改同时在线最大用户数页面
     */
    public openNumChange() {
        this.userManager.openNumChange();
    }

    /**
     * 修改同时在线最大用户数
     */
    public changeNum() {
      this.userManager.changeNum(this);
      // 刷新操作日志
      setTimeout(() => this.msgService.sendMessage({type: 'refreshOperationLog'}), 1000);
    }

    /**
     * 关闭修改同时在线最大用户数页面
     */
    public closeNumChange() {
        this.userManager.closeNumChange();
        this.isDangerousUser = false;
    }

    /**
     * 关闭错误信息
     */
    public closeErrMessageUser() {
        this.isDangerousUser = false;
    }

    /**
     *  触发修改web服务证书
     */
    public modifyWebCert() {
        this.changeFlag = true;
        this.errorWebCertFlag = false;
        this.modifyWebCertThreshold = this.webCertThreshold;
    }

    /**
     * 取消修改web服务证书
     */
    public cancelWebCert() {
        this.changeFlag = false;
    }

    /**
     * 修改web服务证书
     */
    public changeWebCert() {
        const spinnerValueTemp = this.modifyWebCertThreshold;
        const reg = new RegExp(/^(?:[1-9]\d|[7-9]|180|[1][0-7][0-9])$/);
        this.errorWebCertFlag = !reg.test(spinnerValueTemp);
    }

    /**
     * 设置证书配置阈值
     */
    public setCertTimeoutConfig() {
      // 刷新操作日志
      setTimeout(() => this.msgService.sendMessage({type: 'refreshOperationLog'}), 1000);
      if (this.modifyWebCertThreshold === this.webCertThreshold){
        this.showInfoBox(this.i18n.system_setting.info, 'warn');
        this.cancelWebCert();
        return;
      }
      const params = {
        cert_time: Number(this.modifyWebCertThreshold)
      };
      const option = {
        url: '/cert/cert_time/',
        params
      };

      this.vscodeService.post(option, (res: any) => {
        if (res.status === STATUS.SUCCESS) {
          this.checkCert();
          this.cancelWebCert();
          this.webCertThreshold = this.modifyWebCertThreshold;
          this.showMessageByLang(res, 'info');
        } else {
          this.showMessageByLang(res, 'error');
        }
      });
    }

    /**
     * 验证证书是否有快到期或已经到期的
     */
    private async checkCert() {
        const certOption = {
            url: '/cert/',
        };
        this.vscodeService.get(certOption, (resp: any) => {
            if (resp.status === STATUS.SUCCESS) {
                const status = resp.data.cert_flag;
                let warnMsg = '';
                let showWarnMsg = false;
                switch (status) {
                    case CERT_STATE.STATE_EXPIRED:
                        warnMsg = this.i18n.plugins_porting_cert_expired;
                        showWarnMsg = true;
                        break;
                    case CERT_STATE.STATE_EXPIRING:
                        const validTime = resp.data.cert_expired.replace('T', ' ');
                        warnMsg = this.i18nService.I18nReplace(
                            this.i18n.plugins_porting_cert_expiring,
                            { 0: validTime }
                        );
                        showWarnMsg = true;
                        break;
                    default:
                        showWarnMsg = false;
                        break;
                }
                if (showWarnMsg) {
                    this.showInfoBox(warnMsg, 'info');
                }
            }
        });
    }

    /**
     * 查询证书配置阈值
     */
    public getCertTimeoutConfig() {
        const option = {
            url: '/cert/cert_time/',
        };
        this.vscodeService.get(option, (res: any) => {
            if (res && res.status === 0) {
                this.webCertThreshold = res.data.cert_time;
            }
        });
    }

    /**
     *  开始修改运行日志级别
     */
    public modifyLevel() {
        this.logLevel.modifying = true;
    }
  /**
   *  开始修改运行日志级别
   */
  public modifyCRL() {
    this.crlConfig.modifying = true;
  }

  /**
   * 确认修改运行日志级别
   */
  public confirmModifyLevel() {
    // 刷新操作日志
    setTimeout(() => this.msgService.sendMessage({type: 'refreshOperationLog'}), 1000);
    if (this.logLevel.oldLevelIndex === this.logLevel.selected.index){
      this.showInfoBox(this.i18n.system_setting.info, 'warn');
      this.cancelModifyLevel();
      return false;
    }
    const params = {
      username: this.username,
      level: this.logLevel.selected.label,
    };
    const option = {
      url: '/users/' + encodeURIComponent(this.loginUserId) + '/loglevel/',
      params
    };
    this.vscodeService.post(option, (data: any) => {
      if (data.status === STATUS.SUCCESS) {
        this.logLevel.oldLevelIndex = this.logLevel.selected.index;
        this.logLevel.modifying = false;
        this.showMessageByLang(data, 'info');
      } else {
        this.showMessageByLang(data, 'error');
      }
    });
    return true;
  }

  /**
   * 确认修改运行日志级别
   */
  public confirmModifyCRL() {
    // 刷新操作日志
    setTimeout(() => this.msgService.sendMessage({type: 'refreshOperationLog'}), 1000);
    if (this.crlConfig.oldLevelIndex === this.crlConfig.selected.index){
      this.showInfoBox(this.i18n.system_setting.info, 'warn');
      this.cancelModifyCRL();
      return false;
    }
    const params = {
      new_crl_configuration: this.crlConfig.selected.index,
    };
    const option = {
      url: '/cert/crl/',
      params
    };
    this.vscodeService.post(option, (data: any) => {
      if (data.status === STATUS.SUCCESS) {
        this.crlConfig.oldLevelIndex = this.crlConfig.selected.index;
        this.crlConfig.modifying = false;
        this.showMessageByLang(data, 'info');
      } else {
        this.showMessageByLang(data, 'error');
      }
    });
    return true;
  }

    /**
     * 取消修改运行日志级别
     */
    public cancelModifyLevel() {
        this.logLevel.modifying = false;
        this.logLevel.selected = this.logLevel.options[this.logLevel.oldLevelIndex];
    }

  /**
   * 取消修改运行日志级别
   */
  public cancelModifyCRL() {
    this.crlConfig.modifying = false;
    this.crlConfig.selected = this.crlConfig.options[this.crlConfig.oldLevelIndex];
  }

    maxUsersComfirm = (control: FormControl) => {
        const reg = new RegExp(/^([1][0-9]|20|[1-9])$/);
        if (!reg.test(control.value)) {
            return { maxUsersControl: {tiErrorMessage: this.i18n.common_term_num_modify_tip1 } };
        }
        return {};
    }

    timeoutComfirm = (control: FormControl) => {
        const reg = new RegExp(/^(?:[1-9]\d|240|[1][0-9][0-9]|[2][0-3][0-9])$/);
        if (!reg.test(control.value)) {
            return { timeoutControl: {tiErrorMessage: this.i18n.plugins_porting_tips_timeoutmodify }};
        }
        return {};
    }
    certWarnComfirm = (control: FormControl) => {
        const reg = new RegExp(/^(?:[7-9]|[1-9]\d|[1][0-7][0-9]|180)$/);
        if (!reg.test(control.value)) {
            return {
                certWarnControl: {tiErrorMessage: this.i18n.plugins_porting_webServerCertificate.errorWebCertFlag }
            };
        }
        return {};
    }

}
