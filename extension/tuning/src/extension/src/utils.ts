import * as vscode from 'vscode';
import * as constant from './constant';
import { COLOR_THEME } from './constant';
import { I18nService } from './i18nservice';
import { ErrorHelper } from './error-helper';
import { ToolPanelManager } from './panel-manager';
import axios, { AxiosRequestConfig } from 'axios';
import { getHtml } from './template';
import { ProxyManager } from './proxy-manager';
import Download from './download';
import { SideViewProvider } from './SideView/SideViewProvider';
import { Disposable } from 'vscode';
import { messageHandler } from './webview-msg-handler';
const os = require('os');
const fs = require('fs');
const path = require('path');
const i18n = I18nService.I18n();

var currentSideViewProvider: SideViewProvider;
var currentSideViewProviderHandler: Disposable;
var isRegistered = false;

interface HtmlDatas {
  ideAddress: string;
  serverAddr: string;
  serverPort: string;
  defaultPort: number;
  ideType: string;
  pageLoadingText: string;
  theme: string;
}
export class Utils {
  private static axiosInstance = axios.create({
    timeout: 10 * 1000,
  });
  /**
   * 初始化插件上下文
   * @param context 插件上下文
   * @param isInitDefaultPort 是否需要初始化端口
   */
  public static initVscodeCache(
    context: vscode.ExtensionContext,
    isInitDefaultPort: boolean = false
  ) {
    context.globalState.update('tuningIp', null);
    context.globalState.update('tuningPort', null);
    context.globalState.update('tuningDomainName', null);
    context.globalState.update('tuningEnableDN', null);
    context.globalState.update('tuningToken', null);
    context.globalState.update('tuningSession', null);
    context.globalState.update('autoSystemFlag', null);
    context.globalState.update('closeShowErrorMessage', false);
    if (isInitDefaultPort) {
      context.globalState.update('defaultPort', 3661);
    }
    const json = Utils.getConfigJson(context);
    if (json.portConfig.length > 0) {
      context.globalState.update('tuningIp', json.portConfig[0].ip);
      context.globalState.update('tuningPort', json.portConfig[0].port);
    }
    if (json.wss.enabled) {
      context.globalState.update('tuningDomainName', json.wss.domain_name);
      context.globalState.update('tuningEnableDN', json.wss.enabled);

    }
    if (os.type() === 'Windows_NT') {
      context.globalState.update('autoSystemFlag', true);
    }
  }

  /**
   * 刷新侧边栏服务器配置信息
   */
  public static updateConfigurationInfoBox() {
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorConfigured',
      false
    );
    vscode.commands.executeCommand(
      'setContext',
      'isPerfadvisorConfigured',
      true
    );
  }

  /**
   * 获取配置信息
   * @param context 插件上下文
   */
  public static getConfigJson(context: vscode.ExtensionContext): any {
    const resourcePath = Utils.getExtensionFileAbsolutePath(
      context,
      'out/assets/config.json'
    );
    const data = fs.readFileSync(resourcePath);
    const buf = Buffer.from(JSON.parse(JSON.stringify(data)));
    return JSON.parse(buf.toString());
  }
  /**
   * 获取URL配置信息
   * @param context 插件上下文
   */
  public static getURLConfigJson(context: vscode.ExtensionContext): any {
    const resourcePath = Utils.getExtensionFileAbsolutePath(
      context,
      'out/assets/urlConfig.json'
    );
    const data = fs.readFileSync(resourcePath);
    const buf = Buffer.from(JSON.parse(JSON.stringify(data)));
    return JSON.parse(buf.toString());
  }

  public static checkVersion(
    context: vscode.ExtensionContext,
    serverVersion: any
  ) {
    if (!serverVersion) {
      return false;
    }
    return true;
  }

  /**
   * 获取某个扩展文件绝对路径
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  public static getExtensionFileAbsolutePath(
    context: vscode.ExtensionContext,
    relativePath: string
  ) {
    return path.join(context.extensionPath, relativePath);
  }

  /**
   * 生成发送给webview的消息
   * @param cmd 发送给webview的消息命令字
   * @param data 消息内容
   */
  static generateMessage(cmd: string, data: any): any {
    const cbid =
      new Date().getTime() * 10000 + require('crypto').randomBytes(1)[0];
    const message = {
      cmd,
      data,
      cbid,
    };
    return message;
  }

  /**
   * 从某个HTML文件读取能被Webview加载的HTML内容
   * @param context 上下文
   * @param templatePath 相对于插件根目录的html文件相对路径
   */
  public static getWebViewContent(
    context: vscode.ExtensionContext,
    templatePath: string,
    webview: vscode.Webview
  ) {
    const resourcePath = this.getExtensionFileAbsolutePath(
      context,
      templatePath
    );
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(
      /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
      (m: any, $1: any, $2: any) => {
        return (
          $1 +
          webview.asWebviewUri(vscode.Uri.file(path.resolve(dirPath, $2)))
          + '"'
        );
      }
    );
    return html;
  }

  /**
   * 将资源文件转换为vscode专用路径
   *
   * @param context 插件上下文
   * @param templatePath 临时路径
   */
  public static initPage(
    context: vscode.ExtensionContext,
    webview: vscode.Webview,
    templatePath: string
  ) {
    const resourcePath = this.getExtensionFileAbsolutePath(
      context,
      templatePath
    );
    const dirPath = path.dirname(resourcePath);
    try {
      fs.readdirSync(dirPath).forEach((file: any) => {
        // 拼接获取绝对路径
        const fPath = path.join(dirPath, file);
        if (
          file.search(/main/) !== -1 &&
          file.search(/.map/) === -1 &&
          file.search(/_bak/) === -1
        ) {
          if (fs.existsSync(fPath + '_bak')) {
            let js = fs.readFileSync(fPath + '_bak', 'utf-8');
            js = js.replace(
              /\.\/assets\S+?\.(png|jpg|svg|gif|js)/g,
              (m: any) => {
                return webview
                  .asWebviewUri(vscode.Uri.file(path.resolve(dirPath, m)));
              }
            );
            fs.writeFileSync(fPath, js);
          } else {
            let js = fs.readFileSync(fPath, 'utf-8');
            fs.writeFileSync(fPath + '_bak', js);
            js = js.replace(
              /\.\/assets\S+?\.(png|jpg|svg|gif|js)/g,
              (m: any) => {
                return webview
                  .asWebviewUri(vscode.Uri.file(path.resolve(dirPath, m)));
              }
            );
            fs.writeFileSync(fPath, js);
          }
        }
      });
    } catch (error) {}
  }

  /**
   * 执行回调函数
   * @param panel 左侧菜单面板
   * @param message 消息
   * @param resp 响应
   */
  public static invokeCallback(panel: any, message: any, resp: any) {
    if (panel) {
      panel.webview.postMessage({
        cmd: message.cmd,
        data: resp,
        cbid: message.cbid,
      });
    }
  }

  /**
   * 调用接口获取数据,并更新token
   * @param context 插件上下文
   * @param option 请求信息
   * @param module    模块 ex: 'sysPerf','javaPerf'
   */
  public static async requestData(
    context: vscode.ExtensionContext,
    option: any,
    module: string
  ) {
    // 设置请求头
    const headers = {
      'content-type': 'application/json',
      'Accept-Language': I18nService.getLang().language,
      connection: 'keep-alive',
    };
    const req: AxiosRequestConfig = {
      headers,
      method: 'GET',
    };
    req.url = option.url;
    console.log('REQUEST URL');
    console.log(req.url);
    if (option.token) {
      if (req.headers) {
        req.headers.Authorization = option.token;
      }
    }
    // 调用接口逻辑
    return new Promise((resolve, reject) => {
      const resp = { status: constant.HTTP_STATUS.HTTP_200_OK, data: {} };
      this.axiosInstance
        .request(req)
        .then((response: any) => {
          resp.data = response.data;
          resolve(resp);
        })
        .catch((error: any) => {
          const respStatus = ((error || {}).response || {}).status;
          if (
            error?.response?.data &&
            error?.response?.data instanceof Buffer
          ) {
            const errorRespDataStr = Buffer.from(
              error?.response?.data
            ).toString();
            try {
              const errorRespData = JSON.parse(errorRespDataStr || '{}');
              error.response.data = errorRespData;
            } catch (err) {
              error.response.data = errorRespDataStr;
            }
          }
          //  证书验证失败，请重新选择
          if (
            error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' &&
            resp.status === constant.HTTP_STATUS.HTTP_200_OK
          ) {
            vscode.window.showErrorMessage(
              i18n.plugins_common_certificate_verification_failed
            );
            resp.status = constant.HTTP_STATUS.HTTP_404_NOTFOUND;
            if (respStatus === constant.HTTP_STATUS.HTTP_502_SERVERERROR) {
              resp.status = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
            }
            resp.data = error;
            return resolve(resp);
          }
          if (
            !respStatus ||
            respStatus === constant.HTTP_STATUS.HTTP_404_NOTFOUND ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNABORTED'
          ) {
            resp.status = constant.HTTP_STATUS.HTTP_404_NOTFOUND;
            resp.data = error;
            // 清除当前会话信息，显示登录操作和错误提示信息
            // ErrorHelper.errorHandler(context, module, error?.response?.statusText);
            return resolve(resp);
          }
          resolve(resp);
        });
    });
  }
  /**
   * 跳转打开登录页面
   * @param global 上下文
   * @param defaultPort 代理服务的端口
   * @param proxy 代理后的对象
   */
  static async navToIFrame(global: any, defaultPort: number, proxy: any) {
    const panel = vscode.window.createWebviewPanel(
      'login',
      i18n.common_login,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );
    panel.webview.onDidReceiveMessage((message) => {
      const msg = {
        data: {
          url: `http://127.0.0.1:${defaultPort}/user-management/api/v2.2/certificates/download-ca/`,
          subModule: 'userManagement',
          token: ProxyManager.authValue,
        },
        module: 'tuning',
      };
      if (message.messageType === 'downloadFile') {
        Download.getData(global, msg, 'tuning');
      } else if (message.messageType === 'login') {
        vscode.commands.executeCommand(
          'setContext',
          'isPerfadvisorLoggedIn',
          true
        );
      }
      panel.onDidDispose(() => {
        vscode.commands.executeCommand(
          'setContext',
          'isPerfadvisorLoggedIn',
          false
        );
        vscode.commands.executeCommand(
          'setContext',
          'isPerfadvisorLoggedInJustClosed',
          true
        );
      });
    });
    ToolPanelManager.loginPanels = [{ panel, proxy }];
    // 相应panel的关闭事件
    panel.onDidDispose(() => {
      ToolPanelManager.closeLoginPanel();
    }, null);
    let colorTheme = constant.COLOR_THEME.Dark;
    const colorThemeStr: any = vscode.workspace
      .getConfiguration()
      .get('workbench.colorTheme');
    if (colorThemeStr.indexOf('Light') !== -1) {
      colorTheme = constant.COLOR_THEME.Light;
    }
    let htmlDatas: HtmlDatas = {
      ideAddress: `http://127.0.0.1:${defaultPort}`,
      serverAddr: global.context.globalState.get('tuningEnableDN') ? global.context.globalState.get('tuningDomainName') : global.context.globalState.get('tuningIp'),
      serverPort: global.context.globalState.get('tuningPort'),
      defaultPort,
      ideType: 'isVscode',
      pageLoadingText: i18n.page_loading,
      theme: colorTheme,
    };
    panel.webview.html = getHtml(htmlDatas);
  }

  /**
   * 判断生成指纹的是否在配置文件中
   *
   * @param context 上下文
   */
  public static async fingerCheck(
    global: any,
    tempip: any,
    hashedKey: any,
    figer: any
  ) {
    let figerexist: any;
    console.log('hashedKey' + hashedKey);
    // 查询配置文件中是否有指纹匹配当前连接服务器的指纹
    for (const element of figer) {
      if (element.localfiger === hashedKey) {
        figerexist = true;
      }
    }
    if (figerexist === undefined) {
      figerexist = false;
    }
    return figerexist;
  }

  public static async savefinger(global: any, tempip: any, hashedKey: any) {
    try {
      const data = this.getConfigJson(global.context);
      data.hostVerifier.push({ ip: tempip, localfiger: hashedKey });
      const configPath = 'out/assets/config.json';
      const resourcePath = Utils.getExtensionFileAbsolutePath(
        global.context,
        configPath
      );
      fs.writeFileSync(resourcePath, JSON.stringify(data));
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * 判断配置文件中的指纹存储是否大于100
   *
   * @param context 上下文
   */
  public static fingerLengthCheck(global: any) {
    const finger = Utils.getConfigJson(global.context).hostVerifier;
    if (finger.length > 100) {
      return false;
    }
    return true;
  }

  /**
   * 弹出错误信息：根据后端接口返回信息支持多语言
   * @param messageType 多语言信息
   * @param data 多语言信息
   * @param directDisplay 是否直接显示data.info，否则会取i18n[data.infoKey]
   */
  public static showMessageByType(
    messageType: string,
    data: any,
    directDisplay: boolean
  ) {
    switch (messageType) {
      case 'info':
        Utils.showInfoByLangType(data, directDisplay);
        break;
      case 'warn':
        Utils.showWarningByLangType(data, directDisplay);
        break;
      case 'error':
        Utils.showErrorInfoByLangType(data, directDisplay);
        break;
      default:
        break;
    }
  }
  /**
   * 弹出提示信息：根据后端接口返回信息支持多语言
   * @param data 多语言信息
   * @param directDisplay 是否直接显示data.info，否则会取i18n[data.infoKey]
   */
  private static showInfoByLangType(data: any, directDisplay: boolean) {
    if (directDisplay) {
      Utils.showInfo(data.info);
    } else {
      Utils.showInfo(i18n[data.infoKey]);
    }
  }
  /**
   * 弹出告警信息：根据后端接口返回信息支持多语言
   * @param data 多语言信息
   * @param directDisplay 是否直接显示data.info，否则会取i18n[data.infoKey]
   */
  private static showWarningByLangType(data: any, directDisplay: boolean) {
    if (directDisplay) {
      Utils.showWarning(data.info);
    } else {
      Utils.showWarning(i18n[data.infoKey]);
    }
  }
  /**
   * 弹出错误信息：根据后端接口返回信息支持多语言
   * @param data 多语言信息
   * @param directDisplay 是否直接显示data.info，否则会取i18n[data.infoKey]
   */
  private static showErrorInfoByLangType(data: any, directDisplay: boolean) {
    const language: any = vscode.env.language;
    if (directDisplay) {
      Utils.showError(data.info);
    } else {
      Utils.showError(i18n[data.infoKey]);
    }
  }

  /**
   * 弹出提示信息
   */
  private static showInfo(info: any) {
    vscode.window.showInformationMessage(info);
  }
  /**
   * 弹出告警信息
   */
  private static showWarning(info: any) {
    vscode.window.showWarningMessage(info);
  }
  /**
   * 弹出错误信息
   */
  private static showError(info: any) {
    vscode.window.showErrorMessage(info);
  }

  /**
   * 格式化时间
   *
   * @param datetime 时间
   * @param formatter 格式化字符串
   */
  public static formatDatetime(datetime: Date | string, formatter: string) {
    if (typeof datetime === 'string') {
      datetime = new Date(datetime);
    }
    formatter = formatter.replace(/yyyy/gi, datetime.getFullYear().toString());
    formatter = formatter.replace(
      /yy/gi,
      datetime.getFullYear().toString().substring(2)
    );
    formatter = formatter.replace(
      /MM/g,
      (datetime.getMonth() + 1).toString().padStart(2, '0')
    );
    formatter = formatter.replace(/M/g, (datetime.getMonth() + 1).toString());
    formatter = formatter.replace(
      /dd/gi,
      datetime.getDate().toString().padStart(2, '0')
    );
    formatter = formatter.replace(/d/gi, datetime.getDate().toString());

    formatter = formatter.replace(
      /hh/gi,
      datetime.getHours().toString().padStart(2, '0')
    );
    formatter = formatter.replace(/h/gi, datetime.getHours().toString());
    formatter = formatter.replace(
      /mm/g,
      datetime.getMinutes().toString().padStart(2, '0')
    );
    formatter = formatter.replace(/m/g, datetime.getMinutes().toString());
    formatter = formatter.replace(
      /ss/g,
      datetime.getSeconds().toString().padStart(2, '0')
    );
    formatter = formatter.replace(/s/g, datetime.getSeconds().toString());
    formatter = formatter.replace(
      /SSS/g,
      datetime.getMilliseconds().toString()
    );
    return formatter;
  }

  /**
   * 设置项打开建议反馈外链
   * @param context 插件上下文
   * @param module 模块标识
   */
  public static openAdviceLink(
    context: vscode.ExtensionContext,
    module: string
  ) {
    const pluginUrlCfg = Utils.getURLConfigJson(context);
    const faq = vscode.Uri.parse(pluginUrlCfg.hikunpengUrl);
    vscode.commands.executeCommand('vscode.open', faq);
  }

  /**
   * 注册VSCode插件事件侦听--配置修改
   *
   * @param context 上下文
   */
  public static addConfigListening() {
    vscode.workspace.onDidChangeConfiguration(() => {
      let colorTheme = constant.COLOR_THEME.Dark;
      const colorThemeStr: any = vscode.workspace
        .getConfiguration()
        .get('workbench.colorTheme');
      if (colorThemeStr.indexOf('Light') !== -1) {
        colorTheme = constant.COLOR_THEME.Light;
      }
      if (ToolPanelManager.loginPanels.length) {
        const changeThemeObj: any = {
          theme: colorTheme,
          messageType: 'changeTheme',
        };
        ToolPanelManager.loginPanels[0].panel.webview.postMessage(
          changeThemeObj
        );
      }
      Utils.postMsg2Webviews(colorTheme);
    });
  }
  private static postMsg2Webviews(colorTheme: COLOR_THEME) {
    ToolPanelManager.sysPerfToolPanels.forEach((panel) => {
      panel.getPanel().webview.postMessage({
        cmd: 'handleVscodeMsg',
        type: 'colorTheme',
        data: { colorTheme },
      });
    });
  }

  /**
   * 获取package信息
   * @param context 插件上下文
   */
  private static getPackageJson(context: vscode.ExtensionContext): any {
    const resourcePath = Utils.getExtensionFileAbsolutePath(
      context,
      'package.json'
    );
    const data = fs.readFileSync(resourcePath);
    const buf = Buffer.from(JSON.parse(JSON.stringify(data)));
    return JSON.parse(buf.toString());
  }

  /**
   * 设置项打开关于对话框
   * @param context 插件上下文
   */
  public static openAboutDialog(context: vscode.ExtensionContext) {
    const header = '';
    let tuningVersion = Utils.getPackageJson(context).version;
    let detailTuningVersion = i18n.plugins_common_about_detail.tuningVersion;
    let detailCopyright = i18n.plugins_common_about_detail.copyright;
    let ipConfig = context.globalState.get('ipConfig');
    let detailMessage;
    if (!ipConfig) {
      detailMessage = `${detailTuningVersion}${tuningVersion}\n${detailCopyright}`;
    } else {
      detailMessage = `${detailTuningVersion}${tuningVersion}\n${detailCopyright}`;
    }
    let options = {
      detail: detailMessage,
      modal: true,
    };
    vscode.window.showInformationMessage(header, options);
  }
}
