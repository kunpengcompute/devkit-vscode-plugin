import * as vscode from 'vscode';
import * as constant from './constant';
import { Utils } from './utils';
import { ToolPanelManager } from './panel-manager';
import { I18nService } from './i18nservice';
import { SSH2Tools } from './ssh2tools';
import { ErrorHelper } from './error-helper';
import { ProxyManager } from './proxy-manager';
import { SideViewProvider } from './SideView/SideViewProvider';
import { glob } from 'glob';
import { Disposable } from 'vscode';

const fs = require('fs');
const i18n = I18nService.I18n();
let terminalStatusInterval: any;
let terminalCloseEvent: any;
var currentSideViewProvider: SideViewProvider;
var currentSideViewProviderHandler: Disposable;
var isRegistered = false;

export const messageHandler = {
  // 从配置文件读取ip与port
  readConfig(global: any, message: any) {
    const json = Utils.getConfigJson(global.context);

    Utils.invokeCallback(global.toolPanel.getPanel(), message, json);
  },

  // 从配置文件读取url
  readUrlConfig(global: any, message: any) {
    const json = Utils.getURLConfigJson(global.context);
    Utils.invokeCallback(global.toolPanel.getPanel(), message, json);
  },

  /**
   * 加载配置信息
   * @param context 插件上下文
   */
  reloadConfigurations(context: vscode.ExtensionContext): any {
    let data = Utils.getConfigJson(context);
    if (data.portConfig.length == 0) {
      this._setUpToBeNotConfigured();
    } else {
      this._setUpToBeConfigured(context);
    }
  },

  /**
   * 判断为已配置，显示配置信息
   */
  _setUpToBeConfigured(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorConfigured',
      true
    );
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorLoggedIn',
      false
    );
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorLoggedInJustClosed',
      false
    );

    const provider = new SideViewProvider(context.extensionUri);
    currentSideViewProvider = provider;
    let previous_dispose_handler = vscode.window.registerWebviewViewProvider(
      SideViewProvider.viewType,
      provider
    );
    isRegistered = true;
    currentSideViewProviderHandler = previous_dispose_handler;
    messageHandler.updateIpAndPort(context, provider);
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorLoggedInJustClosed',
      false
    );
  },

  /**
   * 判断为未配置
   */
  _setUpToBeNotConfigured() {
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorConfigured',
      false
    );
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorLoggedIn',
      false
    );
    vscode.commands.executeCommand('setContext', 'refreshFailure', false);
  },

  // 保存ip与port到json配置文件
  async saveConfig(global: any, message: any) {
    // if (!message.data.openConfigServer) {  // 点击弹窗中的是openConfigServer为true
    //     if (ToolPanelManager.loginPanels.length > 0) {
    //         // 弹窗提示是否切换服务器
    //         const panel = global.toolPanel.getPanel();
    //         panel.webview.postMessage({ cmd: 'handleVscodeMsg', type: 'showCustomDialog', data: { show: true } });
    //         return;
    //     }
    // }
    let tuningConfig, wssConfig;
    try {
      let jsonData = JSON.parse(message.data.data);
      tuningConfig = jsonData.portConfig;
      wssConfig = jsonData.wss;
    } catch (err) {
      tuningConfig = {};
    }
    const tuningConfigObj = Array.isArray(tuningConfig)
      ? tuningConfig[0]
      : tuningConfig;
    console.log('tuningConfigObj is: ', tuningConfigObj);
    let data: any;
    global.context.globalState.update('tuningIp', tuningConfigObj.ip);
    global.context.globalState.update('tuningPort', tuningConfigObj.port);
    global.context.globalState.update('tuningEnableDN', wssConfig.enabled);
    const { proxyServerPort, proxy } = await ProxyManager.createProxyServer(
      global.context,
      wssConfig.enabled ? wssConfig.domain_name : tuningConfigObj.ip,
      tuningConfigObj.port
    );
    global.context.globalState.update('defaultPort', proxyServerPort);

    const queryVersionOptions = {
      url: `http://127.0.0.1:${proxyServerPort}/user-management/api/v2.2/users/version/`,
      method: 'GET',
    };
    const respVersion: any = await Utils.requestData(
      global.context,
      queryVersionOptions as any,
      message.module
    );
    if (respVersion.status === constant.HTTP_STATUS.HTTP_200_OK || respVersion.status === constant.HTTP_STATUS.HTTP_401_UNAUTHORIZED) {
      const serverVersion = respVersion?.data?.data?.version || 'higher';
      if (!Utils.checkVersion(global.context, serverVersion)) {
        proxy.close();
        const configVersion = Utils.getConfigJson(global.context)
          .configVersion[0];
        // 版本不匹配
        data = { type: 'VERSIONMISMATCH', configVersion, serverVersion };
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
        return;
      }
      const queryOptions = {
        url: `http://127.0.0.1:${proxyServerPort}/user-management/api/v2.2/users/admin-status/`,
        method: 'GET',
      };
      const resp: any = await Utils.requestData(
        global.context,
        queryOptions as any,
        message.module
      );
      if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
        vscode.commands.executeCommand('setContext', 'ipconfig', true);
        vscode.commands.executeCommand(
          'setContext',
          'isPerfadvisorConfigured',
          true
        );
        global.context.globalState.update('ipConfig', true);
        data = { type: 'SUCCESS' };
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
        ToolPanelManager.closeLoginPanel();
        if (message.data.openLogin) {
          Utils.navToIFrame(global, proxyServerPort, proxy);
        }
        if (isRegistered) {
          currentSideViewProviderHandler.dispose();
        }
        const provider = new SideViewProvider(global.context.extensionUri);
        currentSideViewProvider = provider;
        let previous_dispose_handler =
          vscode.window.registerWebviewViewProvider(
            SideViewProvider.viewType,
            provider
          );
        isRegistered = true;
        currentSideViewProviderHandler = previous_dispose_handler;
        const resourcePath = Utils.getExtensionFileAbsolutePath(
          global.context,
          'out/assets/config.json'
        );
        data = fs.writeFileSync(resourcePath, message.data.data);
        this.updateIpAndPort(global.context, provider);
        Utils.updateConfigurationInfoBox();
        vscode.commands.executeCommand(
          'setContext',
          'isPerfadvisorLoggedInJustClosed',
          false
        );
      } else {
        data = { type: 'FAIL' };
        proxy.close();
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
      }
    } else {
      data = { type: 'FAIL' };
      proxy.close();
      Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
    }
  },
  /**
   * 检测已配置的服务器是否能够连接
   * @param context
   */
  async testConnection(context: vscode.ExtensionContext) {
    let newConfigPath = Utils.getExtensionFileAbsolutePath(
      context,
      'out/assets/config.json'
    );
    let data = JSON.parse(fs.readFileSync(newConfigPath));
    var ip = data.portConfig[0].ip;
    var port = data.portConfig[0].port;
    context.globalState.update('tuningIp', ip);
    context.globalState.update('tuningPort', port);
    const { proxyServerPort, proxy } = await ProxyManager.createProxyServer(
      context,
      ip,
      port
    );
    context.globalState.update('defaultPort', proxyServerPort);
    const queryVersionOptions = {
      url: `http://127.0.0.1:${proxyServerPort}/user-management/api/v2.2/users/version/`,
      method: 'GET',
    };
    const respVersion: any = await Utils.requestData(
      context,
      queryVersionOptions as any,
      'tuning'
    );
    if (respVersion.status === constant.HTTP_STATUS.HTTP_200_OK || respVersion.status === constant.HTTP_STATUS.HTTP_401_UNAUTHORIZED) {
      // if (true) {
      const serverVersion = respVersion?.data?.data?.version || 'higher';
      if (!Utils.checkVersion(context, serverVersion)) {
        // if (true) {
        proxy.close();
        const configVersion = Utils.getConfigJson(context).configVersion[0];
        // 版本不匹配
        data = { type: 'VERSIONMISMATCH', configVersion, serverVersion };
        let old_ip = currentSideViewProvider.getIp();
        let old_port = currentSideViewProvider.getPort();
        let old_domain = currentSideViewProvider.getDomain();
        if (isRegistered) {
          currentSideViewProviderHandler.dispose();
        }
        const provider = new SideViewProvider(context.extensionUri);
        currentSideViewProvider = provider;
        let previous_dispose_handler =
          vscode.window.registerWebviewViewProvider(
            SideViewProvider.viewType,
            provider
          );
        isRegistered = true;
        currentSideViewProviderHandler = previous_dispose_handler;
        provider.shouldFailureInfoShown(true);
        provider.updateServerConfiguration(old_ip, old_port, old_domain);
        provider.FailureArbeitUpdaten(i18n.version_mismatch_failure);
        vscode.commands.executeCommand('setContext', 'refreshFailure', true);
        return;
      }
      console.log('Position 3');
      const queryOptions = {
        url: `http://127.0.0.1:${proxyServerPort}/user-management/api/v2.2/users/admin-status/`,
        method: 'GET',
      };
      const resp: any = await Utils.requestData(
        context,
        queryOptions as any,
        'tuning'
      );
      console.log('Position 4');
      if (resp.status != constant.HTTP_STATUS.HTTP_200_OK) {
        let old_ip = currentSideViewProvider.getIp();
        let old_port = currentSideViewProvider.getPort();
        let old_domain = currentSideViewProvider.getDomain();
        if (isRegistered) {
          currentSideViewProviderHandler.dispose();
        }
        const provider = new SideViewProvider(context.extensionUri);
        currentSideViewProvider = provider;
        let previous_dispose_handler =
          vscode.window.registerWebviewViewProvider(
            SideViewProvider.viewType,
            provider
          );
        isRegistered = true;
        currentSideViewProviderHandler = previous_dispose_handler;
        provider.shouldFailureInfoShown(true);
        provider.updateServerConfiguration(old_ip, old_port, old_domain);
        provider.FailureArbeitUpdaten(i18n.connection_failure);
        vscode.commands.executeCommand('setContext', 'refreshFailure', true);
        vscode.commands.executeCommand(
          'setContext',
          'isPerfadvisorLoggedIn',
          false
        );
        return;
      } else {
        let old_ip = currentSideViewProvider.getIp();
        let old_port = currentSideViewProvider.getPort();
        let old_domain = currentSideViewProvider.getDomain();
        if (isRegistered) {
          currentSideViewProviderHandler.dispose();
        }
        const provider = new SideViewProvider(context.extensionUri);
        currentSideViewProvider = provider;
        let previous_dispose_handler =
          vscode.window.registerWebviewViewProvider(
            SideViewProvider.viewType,
            provider
          );
        isRegistered = true;
        currentSideViewProviderHandler = previous_dispose_handler;
        provider.shouldFailureInfoShown(false);
        provider.updateServerConfiguration(old_ip, old_port, old_domain);
        vscode.commands.executeCommand('setContext', 'refreshFailure', false);
        return;
      }
    } else {
      let old_ip = currentSideViewProvider.getIp();
      let old_port = currentSideViewProvider.getPort();
      let old_domain = currentSideViewProvider.getDomain();
      if (isRegistered) {
        currentSideViewProviderHandler.dispose();
      }
      const provider = new SideViewProvider(context.extensionUri);
      currentSideViewProvider = provider;
      let previous_dispose_handler = vscode.window.registerWebviewViewProvider(
        SideViewProvider.viewType,
        provider
      );
      isRegistered = true;
      currentSideViewProviderHandler = previous_dispose_handler;
      provider.shouldFailureInfoShown(true);
      provider.updateServerConfiguration(old_ip, old_port, old_domain);
      provider.FailureArbeitUpdaten(i18n.connection_failure);
      vscode.commands.executeCommand('setContext', 'refreshFailure', true);
      vscode.commands.executeCommand(
        'setContext',
        'isPerfadvisorLoggedIn',
        false
      );
      return;
    }
  },
  /**
   * 更新ip与端口的显示内容
   * @param originalContent 更新之前的
   */
  updateIpAndPort(
    context: vscode.ExtensionContext,
    provider: SideViewProvider
  ) {
    let newConfigPath = Utils.getExtensionFileAbsolutePath(
      context,
      'out/assets/config.json'
    );
    let data = JSON.parse(fs.readFileSync(newConfigPath));
    // console.log(data.tuningConfig[0].ip);
    var new_ip = data.portConfig[0].ip;
    var new_port = data.portConfig[0].port;
    let new_domain = data.wss.enabled ? `(${data.wss.domain_name})` : '';
    provider.shouldFailureInfoShown(false);
    provider.updateServerConfiguration(new_ip, new_port, new_domain);
    vscode.commands.executeCommand('setContext', 'refreshFailure', false);
    // SideViewProvider.
  },
  /**
   * 登录指令请求跳转登录页面
   * @param global global
   * @param message message
   */
  async openLoginByButton(global: any) {
    const resourcePath = Utils.getExtensionFileAbsolutePath(
      global.context,
      'out/assets/config.json'
    );
    const configData = fs.readFileSync(resourcePath);
    let tuningConfig;
    let wssConfig;
    try {
      tuningConfig = JSON.parse(configData).portConfig;
      wssConfig = JSON.parse(configData).wss;
    } catch (err) {
      tuningConfig = {};
    }
    const tuningConfigObj = Array.isArray(tuningConfig)
      ? tuningConfig[0]
      : tuningConfig;
    // tslint:disable-next-line:max-line-length
    const { proxyServerPort, proxy } = await ProxyManager.createProxyServer(
      global.context,
      wssConfig.enabled ? wssConfig.domain_name : tuningConfigObj.ip,
      tuningConfigObj.port
    );
    Utils.navToIFrame(global, proxyServerPort, proxy);
    ToolPanelManager.closePanelsByRemained('tuning', []);
  },

  /**
   * 打开新的vscode窗口
   *
   * @param global 全局上下文
   * @param message 消息内容
   */
  openNewPage(global: any, message: any) {
    const session = {
      language: vscode.env.language,
    };
    let navMessage;
    if ('message' in message.data) {
      navMessage = Utils.generateMessage('navigate', {
        page: '/' + message.data.router,
        pageParams: { queryParams: message.data.message },
        webSession: session,
      });
    } else if (message.data.router === 'login') {
      // 利用openNewPage打开登录页
      messageHandler.openLoginByButton(global);
      return;
    } else {
      navMessage = Utils.generateMessage('navigate', {
        page: '/' + message.data.router,
        webSession: session,
      });
    }
    const viewTitle = message.data.viewTitle;
    const panelOption = {
      panelId: message.data.panelId,
      viewType: message.data.viewType || message.module,
      viewTitle,
      module: message.module,
      message: navMessage,
    };
    ToolPanelManager.createOrShowPanel(panelOption, global.context);
  },
  // 关闭panel
  closePanel(global: any, message: any) {
    ToolPanelManager.closePanel(global.toolPanel.getPanelId(), message.module);
  },

  // 检查ssh连接是否通畅
  async checkConn(global: any, message: any) {
    const ssh2Tools = new SSH2Tools();
    const sshCheckResult = await ssh2Tools.sshClientCheck();
    if (!sshCheckResult) {
      Utils.invokeCallback(
        global.toolPanel.getPanel(),
        message,
        'sshClientCheck'
      );
      this.clearPwd(message.data.password);
      this.clearPwd(message.data.privateKey);
      return;
    }
    let server: any = {};
    if (message.data.sshType === 'usepwd') {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        password: message.data.password,
        hostHash: 'sha256',
        hostVerifier: (hashedKey: any, callback1: any) => {
          const finger = Utils.getConfigJson(global.context).hostVerifier;
          const tempip = message.data.host;
          Utils.fingerCheck(global, tempip, hashedKey, finger).then(
            (data: any) => {
              callback1(true);
            }
          );
        },
      };
    } else {
      // 检测秘钥文件是否有秘钥短语
      if (!ssh2Tools.checkRealExistPassphrase(message.data)) {
        Utils.invokeCallback(
          global.toolPanel.getPanel(),
          message,
          'USERAUTH_FAILURE'
        );
        return;
      }
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        privateKey: fs.readFileSync(message.data.privateKey),
        passphrase: message.data.passphrase,
        hostHash: 'sha256',
        hostVerifier: (hashedKey: any, callback1: any) => {
          const finger = Utils.getConfigJson(global.context).hostVerifier;
          const tempip = message.data.host;
          Utils.fingerCheck(global, tempip, hashedKey, finger).then(
            (data: any) => {
              callback1(true);
            }
          );
        },
      };
    }
    const callback = (data: any) => {
      if (data instanceof Error) {
        if (
          data.message.search(/ETIMEDOUT/) !== -1 ||
          data.message.search(/ECONNREFUSED/) !== -1
        ) {
          // ErrorHelper.errorHandler(global.context, message.module, data.message, server.host);
        } else if (data.message.search(/no matching/) !== -1) {
          Utils.invokeCallback(
            global.toolPanel.getPanel(),
            message,
            data.toString()
          );
        }
        Utils.invokeCallback(
          global.toolPanel.getPanel(),
          message,
          data.toString()
        );
      } else {
        Utils.invokeCallback(
          global.toolPanel.getPanel(),
          message,
          data.toString()
        );
      }
    };
    new SSH2Tools().connectTest(server, () => {}, callback);
    this.clearPwd(message.data.password);
    this.clearPwd(message.data.privateKey);
  },

  async readFinger(global: any, message: any) {
    const ssh2Tools = new SSH2Tools();
    const sshCheckResult = await ssh2Tools.sshClientCheck();
    var currentFinger: any;
    var fingerExist: any = false;
    if (!sshCheckResult) {
      Utils.invokeCallback(
        global.toolPanel.getPanel(),
        message,
        'sshClientCheck'
      );
      this.clearPwd(message.data.password);
      this.clearPwd(message.data.privateKey);
      return;
    }
    let server: any = {};
    if (message.data.sshType === 'usepwd') {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        password: message.data.password,
        hostHash: 'sha256',
        hostVerifier: (hashedKey: any, callback1: any) => {
          currentFinger = hashedKey;
          const tempip = message.data.host;
          const finger = Utils.getConfigJson(global.context).hostVerifier;
          Utils.fingerCheck(global, tempip, hashedKey, finger).then(
            (data: boolean) => {
              fingerExist = data;
            }
          );
          callback1(true);
        },
      };
    } else {
      // 检测秘钥文件是否有秘钥短语
      if (!ssh2Tools.checkRealExistPassphrase(message.data)) {
        Utils.invokeCallback(
          global.toolPanel.getPanel(),
          message,
          'USERAUTH_FAILURE'
        );
        return;
      }
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        privateKey: fs.readFileSync(message.data.privateKey),
        passphrase: message.data.passphrase,
        hostHash: 'sha256',
        hostVerifier: (hashedKey: any, callback1: any) => {
          currentFinger = hashedKey;
          const tempip = message.data.host;
          const finger = Utils.getConfigJson(global.context).hostVerifier;
          Utils.fingerCheck(global, tempip, hashedKey, finger).then(
            (data: boolean) => {
              fingerExist = data;
            }
          );
          callback1(true);
        },
      };
    }
    const callback = (data: any) => {
      console.log(data);
      if (data instanceof Error) {
        if (
          data.message.search(/ETIMEDOUT/) !== -1 ||
          data.message.search(/ECONNREFUSED/) !== -1
        ) {
          Utils.invokeCallback(global.toolPanel.getPanel(), message, 'TIMEOUT');
        } else if (data.message.search(/no matching/) !== -1) {
          // vscode.window.showErrorMessage(i18n.plugins_common_message_sshAlgError);
          Utils.invokeCallback(
            global.toolPanel.getPanel(),
            message,
            data.message
          );
        }
      } else {
        if (data.search(/SUCCESS/) !== -1) {
          if (fingerExist) {
            Utils.invokeCallback(
              global.toolPanel.getPanel(),
              message,
              'noFirst'
            );
          } else {
            Utils.invokeCallback(
              global.toolPanel.getPanel(),
              message,
              currentFinger.toString()
            );
          }
        } else {
          Utils.invokeCallback(
            global.toolPanel.getPanel(),
            message,
            data.toString()
          );
        }
      }
    };
    new SSH2Tools().connectTest(server, () => {}, callback);
    this.clearPwd(message.data.password);
    this.clearPwd(message.data.privateKey);
  },

  async saveFinger(global: any, message: any) {
    const tempip = message.data.ip;
    const tempfinger = message.data.finger;
    Utils.savefinger(global, tempip, tempfinger).then((data: any) => {
      let response = '';
      if (data) {
        response = 'SUCCESS';
      } else {
        response = 'FAIL';
      }
      if (!Utils.fingerLengthCheck(global)) {
        response = response.concat('_oversize');
      }
      Utils.invokeCallback(global.toolPanel.getPanel(), message, response);
    });
  },

  /**
   * 密码释放
   * @param message: 来自webview的消息内容
   */
  clearPwd(password: any) {
    password = '';
    password = '';
    password = '';
  },

  /**
   * webview侧发消息给vscode发消息需在右下角弹提醒框
   * @param global 插件上下文,以及当前的panel
   * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info,warn}}
   */
  async showInfoBox(global: any, message: any) {
    Utils.showMessageByType(
      message.data.type,
      { info: message.data.info },
      true
    );
  },

  /**
   * 升级后台服务器
   *
   * @param global 全局上下文
   * @param message 消息内容
   */
  async upgrade(global: any, message: any) {
    let server: any = {};
    let terminal: vscode.Terminal;
    const ssh2Tools = new SSH2Tools();
    if (message.data.sshType === 'usepwd') {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        password: message.data.password,
      };
    } else {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        privateKey: fs.readFileSync(message.data.privateKey),
        passphrase: message.data.passphrase,
      };
    }

    // 流程处理回调函数
    const processHandler = (data: any) => {
      if (data instanceof Error) {
        message.module = 'tuning';
        Utils.invokeCallback(
          global.toolPanel.getPanel(),
          message,
          'Error:' + data.toString()
        );
      } else if (typeof data === 'string') {
        if (data.search(/success|failed/) !== -1) {
          clearInterval(terminalStatusInterval);
          if (terminalCloseEvent) {
            terminalCloseEvent.dispose();
          }
          ssh2Tools.closeConnect();
          if (data.search(/success/) !== -1) {
            // 延迟1秒隐藏终端
            setTimeout(() => {
              terminal.hide();
            }, 1000);
          }
        }
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
      }
    };

    // 建立连接
    await ssh2Tools.connect(server).catch(processHandler);
    message.module = 'sysPerf';
    // 上传脚本文件
    const timestamp = Utils.formatDatetime(
      message.data.startUpgradeDatetime,
      'yy_M_d_h_m_s'
    );
    const workDir = '/tmp/vscode' + '_' + timestamp + '/';
    await ssh2Tools.mkdir(workDir, { mode: '700' }).catch(processHandler);
    const preShellName = 'upgrade_' + message.module + '.sh';
    const shellName = message.module + '_upgrade.sh';
    const preShellPromise = ssh2Tools.writeFile(
      preShellName,
      workDir + preShellName
    );
    const shellPromise = ssh2Tools.writeFile(shellName, workDir + shellName);
    await Promise.all([preShellPromise, shellPromise]).catch(processHandler);

    // 创建终端
    terminal = vscode.window.createTerminal();
    // 创建终端，关闭upgrade页面loading
    Utils.invokeCallback(global.toolPanel.getPanel(), message, 'closeLoading');
    // 创建终端异常退出处理
    handleTerminalException(
      terminal,
      ssh2Tools,
      [workDir + preShellName, workDir + shellName],
      (clearError) => {
        const text = 'upgrade clear error: ' + clearError;
      },
      processHandler
    );
    // 显示终端，开始部署
    terminal.show();
    terminal.sendText(
      'ssh -t -p' +
        server.port +
        ' ' +
        server.username +
        '@' +
        server.host +
        ' bash ' +
        workDir +
        preShellName +
        ' -u ' +
        this.getUrl(global) +
        ' -c "' +
        this.getKeyUrl(global) +
        '" \n'
    );

    // 查询是否部署完成
    const stepName = '.upgrade_' + message.module + '.step';
    ssh2Tools
      .tailFlow(workDir + stepName, processHandler)
      .catch(processHandler);
    // 添加关闭连接前事件
    ssh2Tools.onCloseBefore = () => {
      return ssh2Tools.exec('rm -rf ' + workDir + stepName);
    };
    // 清除用户信息
    server = undefined;
    message.data.username = undefined;
    message.data.password = undefined;
  },
  /**
   * 安装后台服务器
   *
   * @param global 全局上下文
   * @param message 消息内容
   */
  async install(global: any, message: any) {
    let server: any = {};
    let terminal: vscode.Terminal;
    const ssh2Tools = new SSH2Tools();
    if (message.data.sshType === 'usepwd') {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        password: message.data.password,
      };
    } else {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        privateKey: fs.readFileSync(message.data.privateKey),
        passphrase: message.data.passphrase,
      };
    }

    // 流程处理回调函数
    const processHandler = (data: any) => {
      if (data instanceof Error) {
        message.module = 'tuning';
        Utils.invokeCallback(
          global.toolPanel.getPanel(),
          message,
          'Error:' + data.toString()
        );
      } else if (typeof data === 'string') {
        if (data.search(/success|failed/) !== -1) {
          clearInterval(terminalStatusInterval);
          if (terminalCloseEvent) {
            terminalCloseEvent.dispose();
          }
          ssh2Tools.closeConnect();
          if (data.search(/success/) !== -1) {
            // 延迟1秒隐藏终端
            setTimeout(() => {
              terminal.hide();
            }, 1000);
          }
        }
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
      }
    };

    // 建立连接
    await ssh2Tools.connect(server).catch(processHandler);
    message.module = 'sysPerf';
    // 上传脚本文件
    const timestamp = Utils.formatDatetime(
      message.data.startInstallDatetime,
      'yy_M_d_h_m_s'
    );
    const workDir = '/tmp/vscode' + '_' + timestamp + '/';
    await ssh2Tools.mkdir(workDir, { mode: '700' }).catch(processHandler);
    const preShellName = 'deploy_' + message.module + '.sh';
    const shellName = 'write_' + message.module + '_log.sh';
    const preShellPromise = ssh2Tools.writeFile(
      preShellName,
      workDir + preShellName
    );
    const shellPromise = ssh2Tools.writeFile(shellName, workDir + shellName);
    await Promise.all([preShellPromise, shellPromise]).catch(processHandler);

    // 创建终端
    terminal = vscode.window.createTerminal();
    // 创建终端，关闭install页面loading
    Utils.invokeCallback(global.toolPanel.getPanel(), message, 'closeLoading');
    // 创建终端异常退出处理
    handleTerminalException(
      terminal,
      ssh2Tools,
      [workDir + preShellName, workDir + shellName],
      (clearError) => {
        const text = 'install clear error: ' + clearError;
      },
      processHandler
    );
    // 显示终端，开始部署
    terminal.show();
    terminal.sendText(
      'ssh -t -p' +
        server.port +
        ' ' +
        server.username +
        '@' +
        server.host +
        ' bash ' +
        workDir +
        preShellName +
        ' -u ' +
        this.getUrl(global) +
        ' -c "' +
        this.getKeyUrl(global) +
        '" \n'
    );

    // 查询是否部署完成
    const stepName = '.install_' + message.module + '.step';
    ssh2Tools
      .tailFlow(workDir + stepName, processHandler)
      .catch(processHandler);
    // 添加关闭连接前事件
    ssh2Tools.onCloseBefore = () => {
      return ssh2Tools.exec('rm -rf ' + workDir + stepName);
    };
    // 清除用户信息
    server = undefined;
    message.data.username = undefined;
    message.data.password = undefined;
  },
  /**
   * 卸载后台服务器
   *
   * @param global 全局上下文
   * @param message 消息内容
   */
  async uninstall(global: any, message: any) {
    let server: any = {};
    let terminal: vscode.Terminal;
    const ssh2Tools = new SSH2Tools();
    if (message.data.sshType === 'usepwd') {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        password: message.data.password,
      };
    } else {
      server = {
        host: message.data.host,
        port: message.data.port,
        username: message.data.username,
        privateKey: fs.readFileSync(message.data.privateKey),
        passphrase: message.data.passphrase,
      };
    }

    // 流程处理回调函数
    const processHandler = (data: any) => {
      if (data instanceof Error) {
        message.module = 'tuning';
        Utils.invokeCallback(
          global.toolPanel.getPanel(),
          message,
          'Error:' + data.toString()
        );
      } else if (typeof data === 'string') {
        if (data.search(/success|failed/) !== -1) {
          clearInterval(terminalStatusInterval);
          if (terminalCloseEvent) {
            terminalCloseEvent.dispose();
          }
          ssh2Tools.closeConnect();
          if (data.search(/success/) !== -1) {
            // 延迟1秒隐藏终端
            setTimeout(() => {
              terminal.hide();
            }, 1000);
          }
        }
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
      }
    };

    // 建立连接
    await ssh2Tools.connect(server).catch(processHandler);
    message.module = 'sysPerf';
    // 上传脚本文件
    const timestamp = Utils.formatDatetime(
      message.data.startUninstallDatetime,
      'yy_M_d_h_m_s'
    );
    const workDir = '/tmp/vscode' + '_' + timestamp + '/';
    await ssh2Tools.mkdir(workDir, { mode: '700' }).catch(processHandler);
    const preShellName = 'uninstall_' + message.module + '.sh';
    const shellName = message.module + '_log.sh';
    const preShellPromise = ssh2Tools.writeFile(
      preShellName,
      workDir + preShellName
    );
    const shellPromise = ssh2Tools.writeFile(shellName, workDir + shellName);
    await Promise.all([preShellPromise, shellPromise]).catch(processHandler);
    // 创建终端
    terminal = vscode.window.createTerminal();
    // 创建终端，关闭uninstall页面loading
    Utils.invokeCallback(global.toolPanel.getPanel(), message, 'closeLoading');
    handleTerminalException(
      terminal,
      ssh2Tools,
      [workDir + preShellName, workDir + shellName],
      (clearError) => {
        const text = 'uninstall clear error: ' + clearError;
      },
      processHandler
    );

    // 显示终端，开始卸载
    terminal.show();
    terminal.sendText(
      'ssh -t -p' +
        server.port +
        ' ' +
        server.username +
        '@' +
        server.host +
        ' bash ' +
        workDir +
        preShellName +
        ' \n'
    );

    // 查询是否卸载完成
    const stepName = '.uninstall_' + message.module + '.step';
    ssh2Tools
      .tailFlow(workDir + stepName, processHandler)
      .catch(processHandler);
    // 添加关闭连接前事件
    ssh2Tools.onCloseBefore = () => {
      return ssh2Tools.exec('rm -rf ' + workDir + stepName);
    };
    // 清除用户信息
    server = undefined;
    message.data.username = undefined;
    message.data.password = undefined;
  },
  /**
   * 获取安装包路径
   */
  getUrl(global: any): any {
    return Utils.getConfigJson(global.context).pkg_url;
  },
  /**
   * 获取KEY路径
   */
  getKeyUrl(global: any): any {
    return Utils.getConfigJson(global.context).key;
  },

  // 清理json配置文件中的ip和port
  async cleanConfig(global: any, message: any) {
    global.context.globalState.update('closeShowErrorMessage', true);

    Utils.invokeCallback(global.toolPanel.getPanel(), message, {
      cleanOk: true,
    });

    // 清空session缓存,并将新的配置更新到session中
    Utils.initVscodeCache(global.context);

    // 关闭其他页面
    ToolPanelManager.closePanelsByRemained(message.module, [
      global.toolPanel.getPanelId(),
    ]);
    global.context.globalState.update(message.module + 'uploadProcessFlag', 0);
  },

  // 关闭所有panel
  closeAllPanel(global: any, message: any) {
    this.closePanel(global, message);
  },
  /**
   * 隐藏terminal
   * @param global: 插件上下文，以及当前的panel
   * @param message: 来自webview的消息内容
   */
  hideTerminal(global: any, message: any) {
    vscode.window.activeTerminal?.hide();
  },
};

function handleTerminalException(
  terminal: vscode.Terminal,
  ssh2Tools: SSH2Tools,
  fileList: Array<string>,
  log: (data: string) => void,
  callback: any
) {
  const handleException = async () => {
    clearInterval(terminalStatusInterval);
    if (terminalCloseEvent) {
      terminalCloseEvent.dispose();
    }
    // 非正常退出时才做处理
    if (ssh2Tools.status === 'connected') {
      let results: any;
      try {
        results = await ssh2Tools.clear(fileList, 3);
      } catch (err) {
        results = fileList.map((item) => ({
          item,
          error: 'sftp connected failed',
        }));
      }
      results.forEach((result: any) => {
        log(result.filePath + ': ' + result.error || 'success');
      });
      callback('terminal exception failed');
    }
  };

  let sshIsStart = false;
  clearInterval(terminalStatusInterval);
  if (terminalCloseEvent) {
    terminalCloseEvent.dispose();
  }
  terminalStatusInterval = setInterval(() => {
    if (terminal.name === 'ssh') {
      sshIsStart = true;
    }
    if (sshIsStart && terminal.name !== 'ssh') {
      handleException();
    }
  }, 100);
  terminalCloseEvent = vscode.window.onDidCloseTerminal(async (t: any) => {
    const currProcessId = await t.processId;
    const processId = await terminal.processId;
    if (currProcessId === processId) {
      handleException();
    }
  });
}
