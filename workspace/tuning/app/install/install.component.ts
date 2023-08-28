import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../service/vscode.service';
import { notificationType } from '../notification-box/notification-box.component';
import { ActivatedRoute, Router } from '@angular/router';

const installStatusStart = -1;
const RUNNING = 0;
const SUCCESS = 1;
const FAILED = 2;

@Component({
  selector: 'app-install',
  templateUrl: 'install.component.html',
  styleUrls: ['install.component.scss'],
})
export class InstallComponent implements AfterViewInit, OnInit {
  private static CONFIG_RADIX = 10;

  @ViewChild('installTip', { static: false }) installTip: {
    Close: () => void;
    Open: () => void;
  };
  @ViewChild('installModal', { static: false }) installModal: {
    Close: () => void;
    Open: () => void;
  };
  @ViewChild('showDialog', { static: false }) showDialog: {
    Close: () => void;
    Open: () => void;
  };
  @ViewChild('fingerDialog', { static: false }) fingerDialog: {
    Close: () => void;
    Open: () => void;
  };
  @ViewChild('notificationBox') notificationBox: {
    setType: (type: notificationType) => void;
    show: () => void;
    close: () => void;
  };
  @ViewChild('serverErrorBox') serverErrorBox: {
    setType: (type: notificationType) => void;
    show: () => void;
    close: () => void;
  };

  public i18n: any = this.i18nService.I18n();
  public currLang: number;
  public validation: any = {
    type: 'blur',
    errorMessage: {
      required: '',
    },
  };
  public tempIP: string;
  public faultIP: string;
  public extraIP: string;
  public extraPort: string = '8086';
  public finalIP: string;
  public finalPort: string;
  public tempPort = '22';
  public webPort: string;
  public username = '';
  public pwd = '';
  public installSteps: any[] = [];
  public installing = installStatusStart;
  public serviceConnecting = false;
  public ipCheckF = false;
  public extraIpCheckF = false;
  public extraPortCheckF = false;
  public tempPortCheckF = false;
  public usernameCheckNull = false;
  public installType = 'password';
  public pwdCheckNull = false;
  public tempFinger: string; // 读取的finger，用于发送保存finger

  public currTheme = COLOR_THEME.Dark;
  // 部署前必读相关
  public needFlag = true;
  public flag = false;
  // 是否检测连接成功
  public connected = false;
  public installFailedInfo: string;
  // 是否正在进行连接检测
  public connectChecking = false;
  // ssh连接方式
  public privateKey: string;
  public passphrase: string; // 私钥密码
  public radioList: any[] = [];
  public sshType: any;
  public sshTypeSelected = 'usepwd';
  public sshUploadKey: any;
  public localfilepath = '';
  // ip选择
  public ipList: any[];
  public ipSelected: any;
  public faultIPInfo: string;
  public SSHIPInfo: string;
  public selectIPInfo: string;
  // 开始安装的时间
  private startInstallDatetime: Date;
  public showLoading = false;
  public pluginUrlCfg: any = {};

  public userDeployDialogTitle = ''; // 确认弹框标题
  public dialogShowDetailText = ''; // 确认弹框内容
  public notificationMessage = ''; // 执行结果提示
  public fingerDialogTitle = ''; // 指纹弹框标题
  public fingerLoseText = ''; // 指纹弹框消息内容
  intelliJFlagDef = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public i18nService: I18nService,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    public vscodeService: VscodeService
  ) {
    // 获取全局url配置数据
    this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
      const res = {
        sysInstall_openFAQ1: resp.sysInstall_openFAQ1,
        vscodeService_openFAQ2: resp.vscodeService_openFAQ2,
        sysInstall_openFAQ2: resp.sysInstall_openFAQ2,
        sysInstall_openFAQ4: resp.sysInstall_openFAQ4,
        sysInstall_openFAQ5: resp.sysInstall_openFAQ5,

        checkConn_openFAQ1: resp.checkConn_openFAQ1,
        checkConn_openFAQ2: resp.checkConn_openFAQ2,

        faqFiveZn: resp.faqFiveZn,
        faqFiveEn: resp.faqFiveEn,
      };
      this.pluginUrlCfg = res;
    });
    this.radioList = [
      { key: 'usepwd', value: this.i18n.plugins_common_title_sshPwd },
      { key: 'usekey', value: this.i18n.plugins_common_title_sshKey },
    ];
    this.sshUploadKey = this.i18n.plugins_common_message_sslKeyTip;
    // 设置国际化
    this.i18n = this.i18nService.I18n();
    this.validation.errorMessage = this.i18n.common_term_filename_tip;

    // vscode颜色主题
    if (document.body.className === 'vscode-light') {
      this.currTheme = COLOR_THEME.Light;
    }

    this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
      this.currTheme = msg.colorTheme;
    });

    if (this.getWebViewSession('needFlag') === 'false') {
      this.needFlag = false;
    }
  }

  ngOnInit() {
    this.currLang = I18nService.getLang();
    this.route.queryParams.subscribe((data) => {
      this.intelliJFlagDef = data.intellijFlag === 'true';
    });
  }

  /**
   * 部署前必读提示确认
   */
  public confirmMsgTip() {
    ((self as any).webviewSession || {}).setItem('needFlag', 'false');
    this.installTip.Close();
  }

  /**
   * 部署前必读提示取消
   */
  public cancelMsgTip() {
    this.installTip.Close();
    const message = {
      cmd: 'closePanel',
    };
    this.vscodeService.postMessage(message, null);
  }

  /**
   * 组件加载后处理，包括迁移前必读提示
   */
  ngAfterViewInit() {
    if (this.needFlag) {
      setTimeout(() => {
        this.installTip.Open();
      }, 40);
    }
  }

  private getWebViewSession(paramName: string) {
    return ((self as any).webviewSession || {}).getItem(paramName);
  }

  /**
   * 发送消息给vscode, 右下角弹出提醒框
   * @param info info
   * @param type type
   */
  showInfoBox(info: any, type: any) {
    const message = {
      cmd: 'showInfoBox',
      data: {
        info,
        type,
      },
    };
    this.vscodeService.postMessage(message, null);
  }

  setNotificationBox(type: notificationType, info: string) {
    this.notificationBox.setType(type);
    this.notificationMessage = info;
    this.notificationBox.show();
  }

  private getCheckResult() {
    if (
      !this.ipCheckF &&
      !this.tempPortCheckF &&
      !this.usernameCheckNull &&
      ((this.sshTypeSelected === 'usepwd' && !this.pwdCheckNull) ||
        (this.sshTypeSelected === 'usekey' && this.localfilepath))
    ) {
      return true;
    }
    return false;
  }
  /**
   * 检测ssh连接的弹框提示
   */
  public checkConnBefore() {
    // 对每个输入框进行提交前校验
    this.elementRef.nativeElement
      .querySelectorAll(`input`)
      .forEach((element: any) => {
        element.focus();
        element.blur();
      });
    this.elementRef.nativeElement
      .querySelectorAll(`textarea`)
      .forEach((element: any) => {
        element.focus();
        element.blur();
      });
    if (!this.getCheckResult()) {
      return;
    }
    if (this.username.toLocaleLowerCase() === 'root') {
      this.userDeployDialogTitle = this.i18n.plugins_tuning_title_root_deploy;
      this.dialogShowDetailText = this.i18n.plugins_common_tips_checkConn_root;
    } else {
      this.userDeployDialogTitle = this.i18n.plugins_public_text_tip;
      this.dialogShowDetailText =
        this.i18n.plugins_common_tips_checkConn_noroot.replace(
          /\{0\}/g,
          this.username
        );
    }
    this.showDialog.Open();
  }

  /**
   * 检测指纹，检测连接前调用
   */
  public checkFinger() {
    console.log('checking finger');
    const postData = {
      cmd: 'readFinger',
      data: {
        host: this.tempIP,
        port: this.tempPort,
        username: this.username,
        password: this.pwd,
        sshType: this.sshTypeSelected,
        privateKey: this.privateKey,
        passphrase: this.passphrase,
      },
    };
    this.vscodeService.postMessage(postData, (data: any) => {
      console.log('finger read get: ', data);
      if (data.search(/no matching/) !== -1) {
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.error,
          this.i18n.plugins_common_message_sshAlgError
        );
      }
      if (data.search(/sshClientCheck/) !== -1) {
        this.connectChecking = false;
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.warn,
          this.i18n.plugins_common_message_sshClientCheck
        );
      } else if (data === 'noFirst') {
        // 可以直接checkConn
        this.tempFinger = 'noFirst';
        this.realCheckConn();
      } else if (data.search(/host fingerprint verification failed/) !== -1) {
        // 读取指纹出错
        this.connectChecking = false;
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.error,
          this.i18n.plugins_common_tips_figerFail
        );
      } else if (data.search(/TIMEOUT/) !== -1) {
        // 连接超时
        this.connectChecking = false;
        this.setNotificationBox(
          notificationType.error,
          this.i18n.plugins_common_tips_connTimeout
        );
        this.serverErrorBox.setType(notificationType.error);
        this.serverErrorBox.show();
      } else if (data.search(/Cannot parse privateKey/) !== -1) {
        // 密码短语错误
        this.connectChecking = false;
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.error,
          this.i18n.plugins_common_message_passphraseFail
        );
      } else if (data.search(/USERAUTH_FAILURE/) !== -1) {
        this.connectChecking = false;
        this.setNotificationBox(
          notificationType.error,
          this.i18n.plugins_common_tips_connFail
        );
        this.serverErrorBox.setType(notificationType.error);
        this.serverErrorBox.show();
      } else {
        // 首次连接
        this.tempFinger = data;
        this.fingerLoseText = this.i18nService.I18nReplace(
          this.i18n.plugins_common_message_figerLose,
          {
            0: this.tempIP,
            1: this.tempFinger,
          }
        );
        this.fingerDialogTitle = this.i18n.plugins_tuning_title_finger_confirm;
        this.fingerDialog.Open();
      }
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    });
  }

  /**
   * 点击检测连接按钮后
   */
  public checkConn() {
    if (this.connectChecking) {
      return;
    }
    this.connectChecking = true;
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
    this.checkFinger();
  }

  /**
   * 实际执行检测ssh连接
   */
  public realCheckConn() {
    console.log('finally checking ssh connection!');
    console.log('tempFinger is ', this.tempFinger);
    const postData = {
      cmd: 'checkConn',
      data: {
        host: this.tempIP,
        port: this.tempPort,
        username: this.username,
        password: this.pwd,
        sshType: this.sshTypeSelected,
        privateKey: this.privateKey,
        passphrase: this.passphrase,
        finger: this.tempFinger,
      },
    };
    this.vscodeService.postMessage(postData, (data: any) => {
      if (data.search(/SUCCESS/) !== -1) {
        this.connected = true;
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.success,
          this.i18n.plugins_common_tips_connOk +
            this.i18n.plugins_common_tips_start_deploy
        );
      } else if (data.search(/Cannot parse privateKey/) !== -1) {
        // 密码短语错误
        this.connected = false;
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.error,
          this.i18n.plugins_common_message_passphraseFail
        );
      } else if (data.search(/USERAUTH_FAILURE/) !== -1) {
        this.connected = false;
        this.setNotificationBox(
          notificationType.error,
          this.i18n.plugins_common_tips_connFail
        );
        this.serverErrorBox.setType(notificationType.error);
        this.serverErrorBox.show();
      }
      this.connectChecking = false;
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    });
  }

  /**
   * 安装后台服务器
   */
  install() {
    this.showLoading = true;
    this.serverErrorBox.close();
    this.notificationBox.close();
    // 对每个输入框进行提交前校验
    this.elementRef.nativeElement
      .querySelectorAll(`input`)
      .forEach((element: any) => {
        element.focus();
        element.blur();
      });
    this.elementRef.nativeElement
      .querySelectorAll(`textarea`)
      .forEach((element: any) => {
        element.focus();
        element.blur();
      });

    const isCheckS = this.getCheckResult();
    if (isCheckS) {
      this.installing = RUNNING;
      this.startInstallDatetime = new Date();
      const data = {
        cmd: 'install',
        data: {
          host: this.tempIP,
          port: this.tempPort,
          username: this.username,
          password: this.pwd,
          sshType: this.sshTypeSelected,
          privateKey: this.privateKey,
          passphrase: this.passphrase,
          startInstallDatetime: this.startInstallDatetime,
        },
      };
      this.vscodeService.postMessage(data, (resp: any) => {
        this.processInstallInfo(resp);
      });
    }
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * 部署流程信息处理函数
   *
   * @param data 流程信息
   */
  processInstallInfo(data: any) {
    if (data === 'closeLoading') {
      this.showLoading = false;
    }
    if (this.installing !== RUNNING) {
      return;
    }
    if (data.search(/uploadErr/) !== -1) {
      this.installing = FAILED;
      this.serverErrorBox.close();
      this.setNotificationBox(
        notificationType.error,
        this.i18n.plugins_common_tips_uploadError
      );
      this.clearPwd();
    } else if (data.search(/Error:/) !== -1) {
      this.installing = FAILED;
      this.serverErrorBox.close();
      this.setNotificationBox(
        notificationType.error,
        this.i18n.plugins_common_tips_sshError
      );
      this.clearPwd();
    } else if (data.search(/listen/) !== -1) {
      const matchIpPort = /(\d{1,3}\.){3}\d{1,3}:\d+/;
      const matched = data.match(matchIpPort)[0].split(':');
      this.faultIP = matched[0];
      this.webPort = matched[1];
      this.selectIPInfo = this.i18nService.I18nReplace(
        this.i18n.plugins_common_title_ipSelect,
        {
          0: this.faultIP,
          1: this.faultIP,
        }
      );
      this.faultIPInfo = this.i18nService.I18nReplace(
        this.i18n.plugins_common_tips_ipFault,
        {
          0: this.faultIP,
        }
      );
      this.SSHIPInfo = this.i18nService.I18nReplace(
        this.i18n.plugins_common_tips_ipSSH,
        {
          0: this.tempIP,
        }
      );
      this.ipList = [
        { key: 0, value: this.SSHIPInfo },
        { key: 1, value: this.faultIPInfo },
        { key: 2, value: this.i18n.plugins_common_tips_ipExtra },
      ];
      if (this.tempIP === this.faultIP) {
        this.ipList.splice(0, 1);
      }
      this.ipSelected = this.ipList[0].key;
      this.installing = SUCCESS;
    } else if (data.search(/failed/) !== -1) {
      this.installing = FAILED;
    }
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * 清理口令
   */
  clearPwd() {
    this.pwd = '';
    this.privateKey = '';
    this.passphrase = '';
  }

  /**
   * 保存ip与端口到配置文件与全局变量
   */
  saveConfig() {
    const command = { cmd: 'readConfig' };
    this.vscodeService.postMessage(command, (data: any) => {
      data.portConfig = [];
      data.portConfig.push({
        ip: this.finalIP,
        port: this.ipSelected === 2 ? this.extraPort : this.webPort,
        selectCertificate: false,
        localfilepath: '',
      });
      const postData = {
        cmd: 'saveConfig',
        data: {
          data: JSON.stringify(data),
          showInfoBox: true,
          openLogin: true,
        },
      };
      console.log(postData);
      this.serviceConnecting = true;
      this.vscodeService.postMessage(postData, () => {
        const data1 = { cmd: 'updatePanel' };
        this.vscodeService.postMessage(data1, null);
        this.serverErrorBox.close();
        this.serviceConnecting = false;
        this.router.navigate(['/login']).catch(() => {
          this.setNotificationBox(
            notificationType.error,
            this.i18n.plugins_common_message_responseError
          );
        });
      });
    });
  }

  /**
   * 重试
   */
  retry() {
    this.installing = installStatusStart;
    this.installSteps = [];
    this.connected = false;
    const data = { cmd: 'hideTerminal' };
    this.vscodeService.postMessage(data, null);
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * 跳转到登录页面
   */
  goLogin() {
    if (this.ipSelected === 0) {
      this.finalIP = this.tempIP;
      this.saveConfig();
    } else if (this.ipSelected === 1) {
      this.finalIP = this.faultIP;
      this.saveConfig();
    } else if (this.ipSelected === 2) {
      // 对输入的IP进行提交前校验
      this.elementRef.nativeElement
        .querySelectorAll(`input`)
        .forEach((element: any) => {
          element.focus();
          element.blur();
        });
      this.finalIP = this.extraIP;
      if (!this.extraIpCheckF && !this.extraPortCheckF) {
        this.saveConfig();
      }
    }
  }

  /**
   * tempip校验
   *
   * @returns 校验结果
   */
  checkIP() {
    const reg =
      /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
    const invalidIp = /0.0.0.0|255.255.255.255/;
    this.ipCheckF = !reg.test(this.tempIP) || invalidIp.test(this.tempIP);
  }

  /**
   * extraip校验
   *
   * @returns 校验结果
   */
  checkExtraIP() {
    const reg =
      /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
    const invalidIp = /0.0.0.0|255.255.255.255/;
    this.extraIpCheckF =
      !reg.test(this.extraIP) || invalidIp.test(this.extraIP);
  }

  /**
   * extraport校验
   *
   * @returns 校验结果
   */
  checkExtraPort() {
    if (
      /^[1-9]\d*$/.test(this.extraPort) &&
      1024 <= parseInt(this.extraPort, 10) &&
      parseInt(this.extraPort, 10) <= 65535
    ) {
      this.extraPortCheckF = false;
    } else {
      this.extraPortCheckF = true;
    }
  }

  /**
   * 检查用户名非空
   *
   * @returns 校验结果
   */
  checkUsername() {
    if (this.username === '' || this.username === undefined) {
      this.usernameCheckNull = true;
    } else {
      this.usernameCheckNull = false;
    }
  }

  /**
   * 检查密码非空
   *
   * @returns 校验结果
   */
  checkPwd() {
    if (this.pwd === '' || this.pwd === undefined) {
      this.pwdCheckNull = true;
    } else {
      this.pwdCheckNull = false;
    }
  }

  /**
   * port校验
   *
   * @returns 校验结果
   */
  checkTempPort() {
    if (
      /^[1-9]\d*$/.test(this.tempPort) &&
      1 <= parseInt(this.tempPort, InstallComponent.CONFIG_RADIX) &&
      parseInt(this.tempPort, InstallComponent.CONFIG_RADIX) <= 65535
    ) {
      this.tempPortCheckF = false;
    } else {
      this.tempPortCheckF = true;
    }
  }
  /**
   * 导入私钥
   */
  uploadFile() {
    const localFile =
      this.elementRef.nativeElement.querySelector('#uploadFile').files[0];
    this.localfilepath = localFile.path.replace(/\\/g, '/');
    const size = localFile.size / 1024 / 1024;
    if (size > 10) {
      this.serverErrorBox.close();
      this.setNotificationBox(
        notificationType.warn,
        this.i18n.plugins_common_message_sshkeyExceedMaxSize
      );
      this.localfilepath = '';
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
      return;
    }
    this.privateKeyCheck();
    this.privateKey = this.localfilepath;
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  // 检查导入文件是否是私钥文件
  privateKeyCheck() {
    const postData = {
      cmd: 'privateKeyCheck',
      data: {
        privateKey: this.localfilepath,
      },
    };
    this.vscodeService.postMessage(postData, (isPrivateKey: any) => {
      if (!isPrivateKey) {
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.warn,
          this.i18n.plugins_common_message_sshkeyFail
        );
        this.localfilepath = '';
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
        return;
      }
    });
  }

  fileUpload() {
    if (this.intelliJFlagDef) {
      const postData = {
        cmd: 'uploadPrivateKey',
      };
      this.vscodeService.postMessage(postData, (data: any) => {
        if (data.checkPrivateKey == 'true') {
          this.localfilepath = data.localfilepath.replace(/\\/g, '/');
          this.privateKey = this.localfilepath;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        } else {
          this.serverErrorBox.close();
          this.setNotificationBox(
            notificationType.warn,
            this.i18n.plugins_common_message_sshkeyFail
          );
          this.localfilepath = '';
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
          return;
        }
      });
    } else {
      this.elementRef.nativeElement.querySelector('#uploadFile').value = '';
      this.elementRef.nativeElement.querySelector('#uploadFile').click();
    }
  }

  /**
   * 选择密码或秘钥
   * @param item 密码或秘钥
   */
  public checkChange(item: any) {
    this.sshTypeSelected = item.key;
    this.installType = 'password';
  }
  /**
   * 改变密码明文或密文
   * @param type 明文或密文
   */
  public changInputType(type: string) {
    if (this.connectChecking) {
      return;
    }
    this.installType = type;
  }

  /**
   * 打开FAQ
   */
  public openFAQ() {
    let url = this.pluginUrlCfg.checkConn_openFAQ1;
    if (this.username.toLocaleLowerCase() !== 'root') {
      url = this.pluginUrlCfg.checkConn_openFAQ2;
    }

    const postData = {
      cmd: 'openUrlInBrowser',
      data: {
        url: url,
      },
    };
    if (this.intelliJFlagDef) {
      // 如果是intellij就调用java方法唤起默认浏览器打开网页
      this.vscodeService.postMessage(postData, null);
    } else {
      const a = document.createElement('a');
      a.setAttribute('href', url);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    this.showDialog.Close();
  }
  /**
   * 确认
   */
  public confirmDialogMsgTip() {
    this.showDialog.Close();
    this.checkConn();
  }

  /**
   * 取消
   */
  public cancelDiglogMsgTip() {
    this.showDialog.Close();
  }

  /**
   * 指纹弹框确认连接
   */
  public confirmFingerDialog() {
    this.fingerDialog.Close();
    const postData = {
      cmd: 'saveFinger',
      data: {
        ip: this.tempIP,
        finger: this.tempFinger,
      },
    };
    this.vscodeService.postMessage(postData, (data: any) => {
      console.log(data);
      if (data.search(/oversize/) !== -1) {
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.warn,
          this.i18n.plugins_common_message_figerWarn
        );
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
      if (data === 'SUCCESS') {
        // 保存指纹成功，可检测连接
      } else {
        // 保存失败，但不应该影响连接
        this.serverErrorBox.close();
        this.setNotificationBox(
          notificationType.warn,
          'host fingerprint saved failed'
        );
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
    this.realCheckConn();
  }

  /**
   * 指纹弹框取消连接
   */
  public cancelFingerDialog() {
    this.connectChecking = false;
    this.fingerDialog.Close();
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * 打开错误指示页面
   */
  openErrorInstruction() {
    console.log('opening error instruction page from install');
    const data = {
      cmd: 'openNewPage',
      data: {
        router: 'errorInstruction',
        panelId: 'tuningErrorInstruction',
        viewTitle: this.i18n.plugins_common_title_errorInstruction,
        // 检测连接的错误指示页面不需要ip和port值
        message: { ip: '', port: '', deployIP: this.tempIP },
      },
    };
    this.vscodeService.postMessage(data, null);
  }

  public clickFAQ(url: any) {
    console.log(url);
    const postData = {
      cmd: 'openUrlInBrowser',
      data: {
        url: url,
      },
    };
    if (this.intelliJFlagDef) {
      // 如果是intellij就调用java方法唤起默认浏览器打开网页
      this.vscodeService.postMessage(postData, null);
    } else {
      const a = document.createElement('a');
      a.setAttribute('href', url);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
  /**
   * 打开超链接
   * @param url 路径
   */
  openUrl(url1: any, url2: any) {
    let url = '';
    if (url2 === '') {
      url = url1;
    } else {
      url = this.currLang === 0 ? url1 : url2;
    }
    const postData = {
      cmd: 'openUrlInBrowser',
      data: {
        url: url,
      },
    };
    if (this.intelliJFlagDef) {
      // 如果是intellij就调用java方法唤起默认浏览器打开网页
      this.vscodeService.postMessage(postData, null);
    } else {
      const a = document.createElement('a');
      a.setAttribute('href', url);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}
