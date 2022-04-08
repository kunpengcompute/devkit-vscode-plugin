/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import * as constant from './constant';
import { LoginManager } from './login-manager';
import { I18nService } from './i18nservice';
import { ErrorHelper } from './error-helper';
import { COLOR_THEME } from './constant';
import { ToolPanelManager } from './panel-manager';
import { LogManager, LOG_LEVEL } from './log-manager';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig } from 'axios';
const https = require('https');
const os = require('os');
const i18n = I18nService.I18n();

export class Utils {

    /**
     * 保存canceltoken。
     * key是webview传递过来的cancelId
     * value是这个cancelId所在的请求的取消方法
     */
    public static requestCancelTokenMap = new Map();
    public static axios = axios.create();
    // 每次创建一个Agent都会建立一次连接
    public static httpsAgent = new https.Agent({
        maxSockets: 6
    });
    /**
     * 取消axios请求
     *
     * @param cancelId cancel ID
     */
    public static cancelRequest(cancelId: number) {
        const cancelFun = Utils.requestCancelTokenMap.get(cancelId);
        if (cancelFun) {
            cancelFun('CancelRequest: ' + cancelId);
            Utils.requestCancelTokenMap.delete(cancelId);
        }
    }

    /**
     * 调用requestData接口获取数据,并根据接口返回状态过滤返回结果，防止页面出现undifined
     * @param context 插件上下文
     * @param option 请求信息
     * @param module    模块 ex: 'dep','port'
     */
    public static async requestDataHelper(context: vscode.ExtensionContext, option: any, module: string) {
        const resp: any = await Utils.requestData(context, option, module);
        if (resp.status !== constant.HTTP_STATUS.HTTP_200_OK) {
            return;
        }
        return resp.data;
    }

    /**
     * 调用接口获取数据,并更新token
     * @param context 插件上下文
     * @param option 请求信息
     * @param module    模块 ex: 'dep','port'
     */
    public static async requestData(context: vscode.ExtensionContext,
                                    option: any,
                                    module: string,
                                    panelId?: string,
                                    noLogin?: boolean) {
        const portingSession: any = context.globalState.get('portingSession');
        const username = LoginManager.userName;
        if (portingSession && option.url !== '/users/admin/status/') {
            if (username && username !== portingSession.username) {
                LoginManager.isRidrect = true;
                LoginManager.redirectToLoginSaveSession(context, module);
                return;
            } else {
                LoginManager.isRidrect = false;
            }
        }

        // 设置请求头
        const headers = {
            'content-type': 'application/json;charset=utf-8',
            connection: 'keep-alive'
        };

        // 设置请求参数
        const req: AxiosRequestConfig = {
            headers: option.headers ? option.headers : headers,
            method: option.method ? option.method : 'POST'
        };

        if (option.params) {
            if (option.formData) {
                const formData = new FormData();
                for (const key of Object.keys(option.params)) {
                    if (key === 'filePathList') {
                        option.params[key].forEach((filePath: string) => {
                            formData.append('file', fs.createReadStream(filePath));
                        });
                    } else {
                        formData.append(key, option.params[key]);
                    }
                }
                req.data = formData;
                req.headers = Object.assign(formData.getHeaders(), option.headers);
                req.maxBodyLength = Infinity;
            } else {
                req.data = option.params;
            }
        }

        // 如果是下载运行日志，则以arraybuffer类型响应
        if (option.responseType) {
            req.responseType = option.responseType;
        }

        let token: string | undefined;
        if (module === constant.TOOL_NAME_PORTING) {
            const ip = context.globalState.get('portingIp');
            const port = context.globalState.get('portingPort');
            token = context.globalState.get('portingToken');
            req.url = 'https://' + ip + ':' + port + '/porting/api' + option.url;
        }

        if (token && !option.noToken) {
            req.headers.Authorization = token;
        }

        req.timeout = option.timeout || 30000;

        // 取消请求的token
        if (option.cancelId) {
            req.cancelToken = new axios.CancelToken(cancel => {
                this.requestCancelTokenMap.set(option.cancelId, cancel);
            });
        }

        // 调用接口逻辑
        return new Promise((resolve, reject) => {
            const resp = { status: constant.HTTP_STATUS.HTTP_200_OK, data: {} };
            const selectCertificate = Utils.getConfigJson(context).portConfig[0]?.selectCertificate;
            const localfilepath = Utils.getConfigJson(context).portConfig[0]?.localfilepath;
            const agentOptions = {
                rejectUnauthorized: selectCertificate,
                ca: localfilepath ? fs.readFileSync(localfilepath) : null,
                keepAlive: true
            };
            Object.assign(Utils.httpsAgent.options, agentOptions);
            req.httpsAgent = Utils.httpsAgent;
            Utils.axios(req).then((response: any) => {
                if (response && response.data && response.data.status) {
                    response.data.realStatus = response.data.status;  // 后端返回的真实状态码
                    response.data.status = Number(String(response.data.status).substr(-2, 1));  // 返回倒数第二位状态码
                }

                // 更新 token 在response 的headers 里
                const newToken = response?.headers?.token;
                if (newToken && newToken !== token) {
                    context.globalState.update(module + 'Token', newToken);
                }

                // 处理登录登出session
                if (option.url.indexOf('users/login/') > -1 || option.url.indexOf('users/logout/') > -1) {
                    LoginManager.loginProcess(context, option, response.data, module);
                }

                resp.data = response.data;
                resolve(resp);
            }).catch((error: any) => {
                if (error?.response?.status === constant.HTTP_STATUS.HTTP_423_LOCKED) {  // ip被锁
                    if (option.url.indexOf('users/login/') > -1) { // 登录时
                        resolve(error.response);
                    } else {  // 访问其他接口关闭所有页签，并提示
                        let msg: any;
                        if (vscode.env.language.indexOf('en') !== -1) {
                            msg = error.response.data.info;
                        } else {
                            msg = error.response.data.infochinese;
                        }
                        vscode.window.showErrorMessage(msg);
                        // 退出登录
                        LoginManager.redirectToLogin(context, module);
                    }
                    return;
                }
                if (error?.message?.indexOf('CancelRequest') > -1) {
                    resp.data = {
                        cancel: true,
                        cancelInfo: error?.message
                    };
                    resolve(resp);
                    return;
                }
                if (!noLogin) {
                    noLogin = false;
                }
                LogManager.log(context,
                  'url: ' + error?.config?.url.split('/porting/api')[1] + '; Authorization is null?' +
                    (error?.config?.headers?.Authorization?.indexOf('JWT') === -1), module, LOG_LEVEL.ERROR);
                const respStatus = ((error || {}).response || {}).status;
                if (respStatus === constant.HTTP_STATUS.HTTP_401_UNAUTHORIZED && noLogin === false) {
                    if ((((error || {}).response || {}).data || {}).detail === 'CrowdedOut') {
                        context.globalState.update(module + 'uploadProcessFlag', 0);
                        vscode.window.showErrorMessage(i18n.plugins_common_term_login_other);
                    } else if (error?.config?.url.split('/porting/api')[1].indexOf('/task/progress/?task_type=')
                      === -1) {
                        vscode.window.showErrorMessage(i18n.plugins_common_term_report_401);
                    }

                    resp.status = constant.HTTP_STATUS.HTTP_401_UNAUTHORIZED;

                    // 防止登录页面鉴权失败后，一直自动跳转登录页面
                    if (panelId !== constant.PANEL_ID.portNonLogin && noLogin === false) {
                        LoginManager.redirectToLogin(context, module);
                    }
                } else if (respStatus === constant.HTTP_STATUS.HTTP_406_NOTACCEPTABLE) {
                    this.showErrorInfoByLangType(error.response.data);
                } else {
                    if (noLogin === false) {
                        // 登录超时判断
                        if (option.url === '/users/login/' && error.message.includes('timeout')) {
                            resp.status = constant.HTTP_STATUS.TIMEOUT_10000;
                            resolve(resp);
                            return;
                        }
                        if (resp.status === constant.HTTP_STATUS.HTTP_200_OK
                          && error.code === 'CERT_SIGNATURE_FAILURE') {
                            LogManager.log(context, 'Invalid certificate', module, LOG_LEVEL.ERROR);
                            vscode.window.showErrorMessage(i18n.plugins_common_certificate_verification_failed);
                        } else {
                            if (option.advFeedback) {
                              resp.data = 'timeout';
                              resolve(resp);
                              return;
                            } else if (option.url !== '/cert/nginx/reload/') {
                                ErrorHelper.errorHandler(context, module);
                            }
                        }
                        resp.status = constant.HTTP_STATUS.HTTP_404_NOTFOUND;
                        if (respStatus === constant.HTTP_STATUS.HTTP_502_SERVERERROR) {
                            resp.status = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
                        }
                        resp.data = error;
                    }
                }
                resolve(resp);
            });
        });
    }

    /**
     * 执行回调函数
     * @param panel 左侧菜单面板
     * @param message 消息
     * @param resp 响应
     */
    public static invokeCallback(panel: any, message: any, resp: any) {
        if (panel) {
            panel.webview.postMessage({ cmd: message.cmd, data: resp, cbid: message.cbid });
        }
    }

    /**
     * 从某个HTML文件读取能被Webview加载的HTML内容
     * @param context 上下文
     * @param templatePath 相对于插件根目录的html文件相对路径
     */
    public static getWebViewContent(context: vscode.ExtensionContext, templatePath: string) {
        const resourcePath = this.getExtensionFileAbsolutePath(context, templatePath);
        const dirPath = path.dirname(resourcePath);
        let html = fs.readFileSync(resourcePath, 'utf-8');
        // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
        html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m: any, $1: any, $2: any) => {
            return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
        });
        return html;
    }

    /**
     * 将资源文件转换为vscode专用路径
     *
     * @param context 插件上下文
     * @param templatePath 临时路径
     */
    public static initPage(context: vscode.ExtensionContext, webview: vscode.Webview, templatePath: string) {
        const resourcePath = this.getExtensionFileAbsolutePath(context, templatePath);
        const dirPath = path.dirname(resourcePath);
        try {
            let htmlFile: any;
            let cppFileName: any;
            let needCppFileNameModify = true;
            let needHtmlModify = true;
            const files = fs.readdirSync(dirPath);

            for (const item of files) {
                if (item.indexOf('.cpp.js') > -1 || item.indexOf('cpp-js') > -1) {
                    needCppFileNameModify = false;
                    break;
                }
            }

            files.forEach((file: any) => {
                // 拼接获取绝对路径
                const fPath = path.join(dirPath, file);
                if (file.search(/main/) !== -1 && file.search(/.map/) === -1 && file.search(/_bak/) === -1) {
                    if (fs.existsSync(fPath + '_bak')) {
                        let js = fs.readFileSync(fPath + '_bak', 'utf-8');
                        js = js.replace(/\.\/assets\S+?\.(png|jpg|svg|gif|js)/g, (m: any) => {
                            return webview.asWebviewUri(vscode.Uri.file(path.resolve(dirPath, m)))
                              .toString();
                        });
                        fs.writeFileSync(fPath, js);
                    } else {
                        let js = fs.readFileSync(fPath, 'utf-8');
                        fs.writeFileSync(fPath + '_bak', js);
                        js = js.replace(/\.\/assets\S+?\.(png|jpg|svg|gif|js)/g, (m: any) => {
                            return webview.asWebviewUri(vscode.Uri.file(path.resolve(dirPath, m)))
                              .toString();
                        });
                        fs.writeFileSync(fPath, js);
                    }
                } else if (file.search(/index.html/) !== -1) {  // index.html
                    let html = fs.readFileSync(fPath, 'utf-8');
                    if (html.search(/vscode-webview-resource/) === -1) {
                        // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
                        html = html.replace(/(<img.+?src=")(.+?)"/g, (m: any, $1: any, $2: any) => {
                            return webview.asWebviewUri(vscode.Uri.file(path.resolve(dirPath, m))).toString();
                        });
                        fs.writeFileSync(resourcePath, html);
                    }
                    if (html.search(/.cpp.js/) !== -1) {
                        needHtmlModify = false;
                    }
                    htmlFile = html;
                } else if (needCppFileNameModify && file.search(/.js/)) {   // 其他js文件
                    // 因为编译打包后，monaco-editor无法加载对应的语法文件，此处记录文件名
                    const content = fs.readFileSync(fPath, 'utf-8');
                    if (content.search(/tokenPostfix:".cpp"/g) !== -1) {  // 将该.js文件转换成.cpp.js文件
                        const newFileName = file.slice(0, file.lastIndexOf('.')) + '.cpp.js';
                        const newFilePath = path.join(dirPath, newFileName);
                        fs.renameSync(fPath, newFilePath);
                        cppFileName = newFileName;
                        needCppFileNameModify = false;
                    }
                }
            });

            // 因为编译打包后，monaco-editor无法加载对应的语法文件，添加语法文件引用,只需要执行一次
            if (needHtmlModify && htmlFile && cppFileName) {
                htmlFile = htmlFile.replace('</body>', '<script src="' + cppFileName + '"></script></body>');
                fs.writeFileSync(resourcePath, htmlFile);
                needHtmlModify = false;
            }
        } catch (error) {
            LogManager.log(context, 'preprocess file link error(transfer web link to vscode style link)',
                constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
        }
    }

    /**
     * 写入文件到本地
     *
     * @param context 上下文
     * @param fileName 文件名
     * @param fileContent 文件内容
     */
    public static writeFile(context: vscode.ExtensionContext, fileName: string, fileContent: string) {
        const resourcePath = this.getExtensionFileAbsolutePath(context, 'temp/' + fileName);
        fs.writeFileSync(resourcePath, fileContent);
        return resourcePath;
    }

    /**
     * 获取某个扩展文件绝对路径
     * @param context 上下文
     * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
     */
    public static getExtensionFileAbsolutePath(context: vscode.ExtensionContext, relativePath: string) {
        return path.join(context.extensionPath, relativePath);
    }

    /**
     * 弹出错误信息
     */
    public static showError(info: any, confirm?: any, panel?: any, module?: any) {
        if (confirm && confirm === 'true') {
            vscode.window.showErrorMessage(info, i18n.plugins_common_closePage).then((select) => {
                if (select === i18n.plugins_common_closePage) {
                    ToolPanelManager.closePanel(panel, module);
                }
            });
        } else {
            vscode.window.showErrorMessage(info);
        }
    }

    /**
     * 弹出告警信息
     */
    public static showWarning(info: any, confirm?: any, panel?: any, module?: any) {
        if (confirm && confirm === 'true') {
            vscode.window.showWarningMessage(info, i18n.plugins_common_closePage).then((select) => {
                if (select === i18n.plugins_common_closePage) {
                    ToolPanelManager.closePanel(panel, module);
                }
            });
        } else {
            vscode.window.showWarningMessage(info);
        }
    }

    /**
     * 弹出提示信息
     */
    public static showInfo(info: any, confirm?: any, panel?: any, module?: any) {
        if (confirm && confirm === 'true') {
            vscode.window.showInformationMessage(info, i18n.plugins_common_closePage).then((select) => {
                if (select === i18n.plugins_common_closePage) {
                    ToolPanelManager.closePanel(panel, module);
                }
            });
        } else {
            vscode.window.showInformationMessage(info);
        }
    }

    /**
     * 判断porting是否已登陆
     */
    public static isPortLogin(context: vscode.ExtensionContext): boolean {
        let isportlogin = false;
        if (context.globalState.get('portingToken')) {
            isportlogin = true;
        }
        return isportlogin;
    }
    /**
     * 获取porting当前用户信息
     */
    public static getPortUser(context: vscode.ExtensionContext): any {
        return context.globalState.get(constant.PORTING_SESSION);
    }

    /**
     * 判断porting服务端信息是否已经配置
     * @param context 插件上下文
     */
    static isPortServerConfigured(context: vscode.ExtensionContext): boolean {
        const ip = context.globalState.get('portingIp');
        if (ip !== null) {
            return true;
        }
        return false;
    }

    /**
     * 生成发送给webview的消息
     * @param cmd 发送给webview的消息命令字
     * @param data 消息内容
     */
    static generateMessage(cmd: string, data: any): any {
        const cbid = new Date().getTime() * 10000 + require('crypto').randomBytes(1)[0];
        const message = {
            cmd,
            data,
            cbid
        };
        return message;
    }

    /**
     * 获取配置信息
     * @param context 插件上下文
     */
    public static getConfigJson(context: vscode.ExtensionContext): any {
        const resourcePath = Utils.getExtensionFileAbsolutePath(context, 'src/extension/assets/config.json');
        const data = fs.readFileSync(resourcePath);
        const buf = Buffer.from(JSON.parse(JSON.stringify(data)));
        return JSON.parse(buf.toString());
    }

    /**
     * 获取url配置信息
     * @param context 插件上下文
     */
    public static getUrlConfigJson(context: vscode.ExtensionContext): any {
        const resourcePath = Utils.getExtensionFileAbsolutePath(context, 'src/extension/assets/urlConfig.json');
        const data = fs.readFileSync(resourcePath);
        const buf = Buffer.from(JSON.parse(JSON.stringify(data)));
        return JSON.parse(buf.toString());
    }

    /**
     * 打开建议反馈异常面板
     * @param context 插件上下文
     * @param module 模块标识
     */
    static showAdviceFeedbackError(context: vscode.ExtensionContext, module: string) {
      const session = {
        language: vscode.env.language
      };
      const message = Utils.generateMessage('navigate', {
        page: '/adviceLinkError',
        pageParams: { queryParams: null }, webSession: session
      });
      const panelID = constant.PANEL_ID.portAdviceError;
      const panelOption = {
        panelId: panelID,
        viewType: constant.VIEW_TYPE.adviceLinkError,
        viewTitle: i18n.pluginsCommonTermConnectFail,
        module,
        message
      };
      ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 扫描无权限时，追加FAQ提示
     * @param context 插件上下文
     * @param info 错误信息
     */
    public static NoPermissionFAQ(context: vscode.ExtensionContext, info: any) {
      const data = {
        info: info.data.res.info,
        infochinese: info.data.res.infochinese,
        url: Utils.getUrlConfigJson(context).faqNoPermissionZn,
        urlEn: Utils.getUrlConfigJson(context).faqNoPermissionEn
      };
      this.faqControl(data);
    }

    /**
     * 当前系统不支持软件包时，追加FAQ提示
     * @param context 插件上下文
     * @param info 错误信息
     */
    public static osNotSupport(context: vscode.ExtensionContext, info: any) {
      const data = {
        info: info.data.res.info,
        infochinese: info.data.res.infochinese,
        url: Utils.getUrlConfigJson(context).faqPackageRebuildZn,
        urlEn: Utils.getUrlConfigJson(context).faqPackageRebuildEn
      };
      this.faqControl(data);
    }

    /**
     * 前往对应的FAQ链接
     * @param data 提示信息，FAQ链接
     */
    public static faqControl(data: any) {
      const language = vscode.env.language;
      let errorMsg = '';
      let faqUrl = '';
      let msg = '';
      if (language && language.indexOf('en') !== -1) {
        errorMsg = data.info;
        faqUrl = data.urlEn;
      } else {
        errorMsg = data.infochinese;
        faqUrl = data.url;
      }
      msg = errorMsg + I18nService.I18n().pluginsCommonViewReport;
      this.jumpToFaq({ info: msg, url: faqUrl });
      }

    /**
     * 前往FAQ
     * @param data 错误信息和FAQ地址
     */
    public static jumpToFaq(data: any) {
      vscode.window.showErrorMessage(data.info, i18n.pluginsCommonViewFaq).then((select) => {
        if (select === i18n.pluginsCommonViewFaq) {
          const feedbackUrl = vscode.Uri.parse(data.url);
          vscode.commands.executeCommand('vscode.open', feedbackUrl);
        }
      });
    }

    /**
     * 弹出告警信息：根据后端接口返回信息支持多语言
     * @param data 多语言信息
     */
    public static showWarningByLangType(data: any) {
        const language: any = vscode.env.language;
        if (language && language.indexOf('en') !== -1) {
            vscode.window.showWarningMessage(data.info);
        } else {
            vscode.window.showWarningMessage(data.infochinese);
        }
    }

    /**
     * 弹出提示信息：根据后端接口返回信息支持多语言
     * @param data 多语言信息
     */
    public static showInfoByLangType(data: any, confirm?: any, panel?: any, module?: any) {
        const language: any = vscode.env.language;
        if (language && language.indexOf('en') !== -1) {
            this.showInfo(data.info, confirm, panel, module);
        } else {
            this.showInfo(data.infochinese, confirm, panel, module);
        }
    }

    /**
     * 弹出错误信息：根据后端接口返回信息支持多语言
     * @param data 多语言信息
     */
    public static showErrorInfoByLangType(data: any, confirm?: any, panel?: any, module?: any) {
        const language: any = vscode.env.language;
        if (language && language.indexOf('en') !== -1) {
            this.showError(data.info, confirm, panel, module);
        } else {
            this.showError(data.infochinese, confirm, panel, module);
        }
    }

    /**
     * 弹出错误信息：根据后端接口返回信息支持多语言
     * @param data 多语言信息
     */
     public static showErrorInfoByLangTypeWeak(global: any, data: any) {
        this.showBcTip(global, data);
    }

    /**
     *  bc文件生成失败消息
     */
     public static showBcTip(context: vscode.ExtensionContext, data: any) {
        const language: any = vscode.env.language;
        let logMsg: any;
        if (language && language.indexOf('en') !== -1) {
            logMsg = data.info;
        } else {
            logMsg = data.infochinese;
        }
        const errMsg = I18nService.I18n().tip_bc + logMsg + I18nService.I18n().tip_bc1;
        vscode.window.showErrorMessage(errMsg, I18nService.I18n().btn_faq).then(
            async select => {
                if (select === I18nService.I18n().btn_faq) {
                    this.openUserGuide(context);
                }
            }
        );
    }

    /**
     * 打开userguide弹窗
     * @param context 插件上下文
     */
     public static openUserGuide(context: vscode.ExtensionContext) {
        const pluginUrlCfg = Utils.getUrlConfigJson(context);
        let faqUrl = '';
        if (vscode.env.language.indexOf('en') !== -1) {
            faqUrl = pluginUrlCfg.faqEighteenEn;
        } else {
            faqUrl = pluginUrlCfg.faqEighteenZn;
        }
        const bcUrl = vscode.Uri.parse(faqUrl);
        vscode.commands.executeCommand('vscode.open', bcUrl);
    }


    /**
     * 弹出信息：根据后端接口任务处理状态
     * @param data 多语言信息
     */
    public static showInfoByStatusType(data: any) {
        data = (data.data && data.data.info && data.data.infochinese) ? data.data : data;
        if (data.status === 0 || data.runningstatus === 0) {
            // 成功信息
            this.showInfoByLangType(data);
        } else if (data.status === 1 || data.runningstatus === 1) {
            // 警告信息
            this.showWarningByLangType(data);
        } else if (data.status === -1 || data.runningstatus === -1) {
            // 失败信息
            this.showErrorInfoByLangType(data);
        }
    }

    /**
     * 弹出信息：软件迁移模板根据后端接口任务处理状态
     * @param data 多语言信息
     */
    public static analysisShowInfoByStatusType(context: vscode.ExtensionContext, data: any) {
        data = (data.data && data.data.info && data.data.infochinese) ? data.data : data;
        if (data.status === 0 || data.runningstatus === 0) {
            // 成功信息
            this.showInfoByLangType(data);
        } else if (data.status === 1 || data.runningstatus === 1) {
            // 警告信息
            this.showWarningByLangType(data);
        } else if (data.status === -1 || data.runningstatus === -1) {
            // 失败信息
            const info = {
              info: data.info,
              infochinese: data.infochinese,
              url: Utils.getUrlConfigJson(context).faqMigrationTemplateZn,
              urlEn: Utils.getUrlConfigJson(context).faqMigrationTemplateEn
            };
            Utils.faqControl(info);
        }
    }

    /**
     * 将报告id格式化,数据处理20190822114355 => 2019/08/22 11:43:55
     *
     * @param reportId 报告id
     */
    public static formatCreatedId(reportId: any) {
        const years = reportId.slice(0, 4);
        const months = reportId.slice(4, 6);
        const days = reportId.slice(6, 8);
        const hours = reportId.slice(8, 10);
        const minutes = reportId.slice(10, 12);
        const seconds = reportId.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 打开系统文件保存资源管理器
     * @param fileName 全路径文件名（默认）
     * @return 正常返回用户选定的文件名
     */
    public static async saveFileBySaveDialog(fileName: string) {
        const uri = await vscode.window.showSaveDialog({ saveLabel: '保存', defaultUri: vscode.Uri.file(fileName) });
        if (!uri) {
            return new Promise((resolve, reject) => {
                resolve(false);
            });
        }
        return new Promise((resolve, reject) => {
            resolve(uri.fsPath);
        });
    }
    /**
     * 打开系统文件夹选择资源管理器
     * @return 正常返回用户选定的文件夹
     */
     public static async saveBcFile() {
        const uri = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true });
        if (uri?.length === 0) {
            return new Promise((resolve, reject) => {
                resolve(false);
            });
        }
        if ( uri !== undefined) {
            return new Promise((resolve, reject) => {
                resolve(uri[0].fsPath);
            });
        }
    }

    /**
     * 初始化插件上下文
     * @param context 插件上下文
     */
    public static initVscodeCache(context: vscode.ExtensionContext) {
        context.globalState.update('portingToken', null);
        context.globalState.update('portingSession', null);
        context.globalState.update('portingIp', null);
        context.globalState.update('portingPort', null);
        context.globalState.update('autoLoginUser', null);
        context.globalState.update('autoRememberConfig', null);
        context.globalState.update('autoLoginConfig', null);
        context.globalState.update('autoSystemFlag', null);
        context.globalState.update(constant.PORT_DESCLAIMER_CONF, false);
        context.globalState.update('preCheckId', null);
        context.globalState.update('byteCheckId', null);
        context.globalState.update('enhanceOpenedFiles', []);
        context.globalState.update('isProcess', true);
        const json = Utils.getConfigJson(context);
        if (json.portConfig.length > 0) {
            context.globalState.update('portingIp', json.portConfig[0].ip);
            context.globalState.update('portingPort', json.portConfig[0].port);
        }
        if (json.portDisclaimer.length > 0) {
            context.globalState.update(constant.PORT_DESCLAIMER_CONF, true);
        }
        if (json.portAuto.length > 0) {
            context.globalState.update('autoLoginUser', json.portAuto[0].user);
            context.globalState.update('autoRememberConfig', json.portAuto[0].remember);
            context.globalState.update('autoLoginConfig', json.portAuto[0].auto);
        }
        if (os.type() === 'Windows_NT') {
            context.globalState.update('autoSystemFlag', true);
        }
    }

    /**
     * strA中是否以strB开头，忽略大小写，strA和strB任意一个为空返回false
     * @param strA 字符串A
     * @param strB 字符串B
     */
    public static strAStartWithStrB(strA: string, strB: string) {
        if (!strA || !strB) {
            return false;
        }

        return strA.trim().toLowerCase().startsWith(strB.trim().toLowerCase());
    }

    /**
     * strA中是否以strB结尾，忽略大小写，strA和strB任意一个为空返回false
     * @param strA 字符串A
     * @param strB 字符串B
     */
    public static strAEndWithStrB(strA: string, strB: string) {
        if (!strA || !strB) {
            return false;
        }

        return strA.trim().toLowerCase().endsWith(strB.trim().toLowerCase());
    }

    /**
     * strA中是否包含strB，忽略大小写，strA和strB任意一个为空返回false
     * @param strA 字符串A
     * @param strB 字符串B
     */
    public static strAContainStrB(strA: string, strB: string) {
        if (!strA || !strB) {
            return false;
        }

        return strA.trim().toLowerCase().indexOf(strB.trim().toLowerCase()) > -1;
    }

    /**
     * 写入临时工作文件到本地
     *
     * @param context 上下文
     * @param remoteFilePath 服务器端全文件名
     * @param fileContent 文件内容
     */
    public static writeWorkFile(context: vscode.ExtensionContext,
                                reportId: string,
                                remoteFilePath: string,
                                fileContent: string) {
        const filePath = remoteFilePath.split(remoteFilePath.slice(remoteFilePath.lastIndexOf('/') + 1))[0];
        const fileName = remoteFilePath.slice(remoteFilePath.lastIndexOf('/') + 1);
        const workFilePath =
          Utils.getExtensionFileAbsolutePath(context, 'resources/worksources/' + reportId + filePath);
        // 目录不存在则新建
        try {
            fs.readdirSync(workFilePath);
        } catch (err) {
            fs.mkdirSync(workFilePath, { recursive: true });
        }
        const resourcePath = workFilePath + fileName;
        fs.writeFileSync(resourcePath, fileContent);
        return resourcePath;
    }

    /**
     * 删除本地临时工作文件
     *
     * @param filePath 本地文件绝对路径文件名
     */
    public static async deleteWorkFile(filePath: string) {
        fs.unlinkSync(filePath);

        return true;
    }

    /**
     * 删除本地临时工作文件目录
     *
     * @param context 上下文
     */
    public static async clearWorkFile(context: vscode.ExtensionContext, reportId: string) {
        try {
            const deletePath = Utils.getExtensionFileAbsolutePath(context, 'resources/worksources');
            try {
                // 目录存在则删除
                fs.readdirSync(deletePath);
                const terminal = vscode.window.createTerminal();
                terminal.sendText('rm -r ' + deletePath + ' \n');
            } catch (err) {
                return false;
            }
        } catch (err) {
            return false;
        }

        return true;
    }

    /**
     * 注册VSCode插件事件侦听--配置修改
     *
     * @param context 上下文
     */
    public static addConfigListening() {
        vscode.workspace.onDidChangeConfiguration(() => {
            let colorTheme = COLOR_THEME.Dark;
            const colorThemeStr: any = vscode.workspace.getConfiguration().get('workbench.colorTheme');
            if (colorThemeStr.indexOf('Light') !== -1) {
                colorTheme = COLOR_THEME.Light;
            }

            Utils.postMsg2Webviews(colorTheme);
        });
    }

    private static postMsg2Webviews(colorTheme: COLOR_THEME) {
        ToolPanelManager.portToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({ cmd: 'handleVscodeMsg', type: 'colorTheme', data: { colorTheme } });
        });
    }


    /**
     * 判断生成指纹的是否在配置文件中
     *
     * @param context 上下文
     */
    public static async fingerCheck(global: any, tempip: any, hashedKey: any, figer: any) {
        let figerexist: any;
        // 查询配置文件中是否有指纹匹配当前连接服务器的指纹
        for (const element of figer) {
            if (element.localfiger === hashedKey) {
                figerexist = true;
            }
        }
        // 指纹不存在前端提示添加该指纹到配置文件中
        const message = I18nService.I18nReplace(i18n.plugins_common_message_figerLose, {
            0: tempip,
            1: hashedKey
        });
        if (figerexist === undefined) {
            await vscode.window.showInformationMessage(message, i18n.pligins_common_message_confirm,
                i18n.pligins_common_message_cancel).then((select) => {
                    if (select === i18n.pligins_common_message_confirm) {
                        const data = this.getConfigJson(global.context);
                        data.hostVerifier.push({ ip: tempip, localfiger: hashedKey });
                        const resourcePath =
                          Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
                        fs.writeFileSync(resourcePath, JSON.stringify(data));
                        figerexist = true;
                    } else {
                        figerexist = false;
                    }
                });
        }
        return figerexist;
    }

    /**
     * 判断配置文件中的指纹存储是否大于100
     *
     * @param context 上下文
     */
    public static fingerLengthCheck(global: any) {
        const finger = Utils.getConfigJson(global.context).hostVerifier;
        if (finger.length > 100) {
            vscode.window.showWarningMessage(i18n.plugins_common_message_figerWarn);
        }
    }

    /**
     * 判断该文件是否可以进行源码迁移
     * @param filePath 文件路径
     */
    public static canPorting(filePath: any) {
        const stat = fs.statSync(filePath);
        const extName = path.extname(filePath).toLowerCase();
        // 预检文件类型
        if (stat.isDirectory()) {
            // 预检文件夹大小是否超过1G
            if (this.getDirSize(filePath) >= 1024 * 1024 * 1024) {
                return i18n.plugins_porting_file_size_error;
            } else if (this.getDirSize(filePath) === 0) {
                return i18n.plugins_porting_file_empty_error;
            }
            return 'success';
        } else {
            return i18n.plugins_porting_file_type_error;
        }
    }

    /**
     * 统计文件夹大小
     * @param filePath 文件夹路径
     */
    public static getDirSize(filePath: any) {
        let total = 0;
        const files = fs.readdirSync(filePath);
        files.forEach((file: any) => {
            const tempPath = path.join(filePath, file);
            const tempFile = fs.statSync(tempPath);
            if (tempFile.isDirectory()) {
                total += this.getDirSize(tempPath);
            } else {
                total += tempFile.size;
            }
        });
        return total;
    }

    /**
     * 生成文件数组
     * @param filePath 文件路径
     * @param relaPath 相对路径
     * @param files 文件数组
     */
    public static buildFileArr(filePath: any, relaPath: any, files: any[], fileName?: string) {
        const localFiles = fs.readdirSync(filePath);
        localFiles.forEach((file: any) => {
            const tempPath = path.join(filePath, file);
            const tempFile = fs.statSync(tempPath);
            if (!tempFile.isDirectory()) {
                if (!fileName || fileName === file) {
                    const newFile = [];
                    newFile.push(tempPath);
                    newFile.push(file);
                    newFile.push(relaPath);
                    files.push(newFile);
                }
            } else {
                if (!fileName) {
                    Utils.buildFileArr(tempPath, relaPath + file + '/', files);
                }
            }
        });
    }

    /**
     * 更新系统是否为自动登录系统
     */
    public static getAutoSystemFlag() {
        if (os.type() === 'Windows_NT') {
            vscode.commands.executeCommand('setContext', 'isAutoSystem', true);
        } else {
            vscode.commands.executeCommand('setContext', 'isAutoSystem', false);
        }
    }

    /**
     * 获取当前颜色主题
     *
     * @param context 上下文
     */
    public static getCurrentColorTheme() {
        let colorTheme = constant.COLOR_THEME.Dark;
        const colorThemeStr: any = vscode.workspace.getConfiguration().get('workbench.colorTheme');
        if (colorThemeStr.indexOf('Light') !== -1) {
            colorTheme = constant.COLOR_THEME.Light;
        }

        return colorTheme;
    }

    /**
     * 获取系统图片路径
     *
     * @param context 上下文
     */
    public static getCurrentPicPath() {
        let picPath = constant.PIC_PATH.DARK;
        if (constant.COLOR_THEME.Light === Utils.getCurrentColorTheme()) {
            picPath = constant.PIC_PATH.LIGHT;
        }

        return picPath;
    }

    /**
     * 刷新webview
     * @param global 全局上下文
     * @param data 参数
     * @param message webview postMessage传递的参数
     */
    public static freshWebview(global: any, data: any, message: any) {
        try {
            global.toolPanel.getPanel().webview.postMessage({ cmd: 'processVscodeMsg', data, cbid: message.cbid });
        } catch (e) { }
    }

    /**
     * 深拷贝
     * @param source source
     */
    public static deepCopy(source: any): any {
        if (null == source || {} === source || [] === source) {
            return source;
        }

        let newObject: any;
        let isArray = false;
        if ((source as any).length) {
            newObject = [];
            isArray = true;
        } else {
            newObject = {};
            isArray = false;
        }

        for (const key of Object.keys(source)) {
            if (null == source[key]) {
                if (isArray) {
                    newObject.push(null);
                } else {
                    newObject[key] = null;
                }
            } else {
                const sub = (typeof source[key] === 'object') ? Utils.deepCopy(source[key]) : source[key];
                if (isArray) {
                    newObject.push(sub);
                } else {
                    newObject[key] = sub;
                }
            }
        }
        return newObject;
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
        formatter = formatter.replace(/yyyy/ig, datetime.getFullYear().toString());
        formatter = formatter.replace(/yy/ig, datetime.getFullYear().toString().substr(2));
        formatter = formatter.replace(/MM/g, (datetime.getMonth() + 1).toString().padStart(2, '0'));
        formatter = formatter.replace(/M/g, (datetime.getMonth() + 1).toString());
        formatter = formatter.replace(/dd/ig, datetime.getDate().toString().padStart(2, '0'));
        formatter = formatter.replace(/d/ig, datetime.getDate().toString());

        formatter = formatter.replace(/hh/ig, datetime.getHours().toString().padStart(2, '0'));
        formatter = formatter.replace(/h/ig, datetime.getHours().toString());
        formatter = formatter.replace(/mm/g, datetime.getMinutes().toString().padStart(2, '0'));
        formatter = formatter.replace(/m/g, datetime.getMinutes().toString());
        formatter = formatter.replace(/ss/g, datetime.getSeconds().toString().padStart(2, '0'));
        formatter = formatter.replace(/s/g, datetime.getSeconds().toString());
        formatter = formatter.replace(/SSS/g, datetime.getMilliseconds().toString());
        return formatter;
    }

    /**
     * 获取文件状态
     *
     * @param filePathList 文件路径列表
     */
    public static getFileProps(...filePathList: Array<string>) {
        const fileStatsArray: Array<FileProps> = [];
        filePathList.forEach(filePath => {
            const fileStats = fs.statSync(filePath);
            const name = path.basename(filePath);
            fileStatsArray.push({ ...fileStats, name, path: filePath });
        });
        return fileStatsArray;
    }

    /**
     * 判断是否从cloudIDE进入，选择隐藏一些基本功能（升级卸载功能）
     */
    public static isCloudIDEHideBasicFunc() {
        const appName = vscode.env.appName;
        vscode.commands.executeCommand('setContext', 'isCloudIDE', appName === 'CloudIDE');
    }

    /**
     * 初始化cloudIDE服务器配置
     */
    public static initCloudIDEConfig(context: vscode.ExtensionContext) {
        if (vscode.env.appName === constant.ENV_APP_NAME.CLOUDIDE) {
            if (!context.globalState.get('portingIp')) {
                context.globalState.update('portingIp', constant.CLOUDIDE_DEFAULT_CONFIG.DEFAULT_IP);
                context.globalState.update('portingPort', constant.CLOUDIDE_DEFAULT_CONFIG.DEFAULT_PORT);
            }
        }
    }

    /**
     * 检测上传上传压缩包 | 文件夹是否符合规则 是否包含中文 空格以及^ ` / | ; & $ > < \ !
     * @param fileName 文件名
     */
    public static checkUploadFileNameValidity(fileName: string): boolean {
        const reg = new RegExp(/[\u4e00-\u9fa5\s\^`\/\|;&$<>\\\!]/g);
        return reg.test(fileName);
    }
}

export interface FileProps extends fs.Stats {
    name: string;
    path: string;
}
