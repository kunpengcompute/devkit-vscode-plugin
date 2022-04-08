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
import { I18nService } from './i18nservice';
import { LoginManager } from './login-manager';
import { ErrorHelper } from './error-helper';
import { COLOR_THEME } from './constant';
import { ToolPanelManager } from './panel-manager';
import { LogManager, LOG_LEVEL } from './log-manager';
import { UploadUtil } from './upload-util';
import axios, { AxiosRequestConfig, Method } from 'axios';
import JavaperfRecordManage from './javaperf-record-manage';
import fs = require('fs');
import path = require('path');
import https = require('https');
const JSZip = require('jszip');
import os = require('os');
const i18n = I18nService.I18n();

type RequestDataOption = {
    url: string,
    method: Method | string,
    params?: any,
    config?: AxiosRequestConfig,
    headers?: AxiosRequestConfig['headers'],
    subModule?: constant.PERF_SUBMODULE,
    moduleType?: 'sysPerf' | 'javaPerf',
    contentFlag?: boolean,
    responseType?: AxiosRequestConfig['responseType'],
    noToken?: boolean,
    fileUpload?: boolean,
    timeout?: AxiosRequestConfig['timeout'],
    cancelId?: number,
};

export class Utils {
    private static treeUpdataSuccess = false;

    private static axiosInstance = axios.create();
    /**
     * 保存canceltoken。
     * key是webview传递过来的cancelId
     * value是这个cancelId所在的请求的取消方法
     */
    public static requestCancelTokenMap = new Map();

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
     * 设置左侧树刷新状态
     * @param status    左侧树刷新状态
     */
    public static setTreeUpdataSuccess(status: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            Utils.treeUpdataSuccess = status;
            resolve(true);
        });
    }

    /**
     * 获取左侧树刷新状态
     */
    public static getTreeUpdataSuccess(): boolean {
        return Utils.treeUpdataSuccess;
    }

    /**
     * 调用requestData接口获取数据,并根据接口返回状态过滤返回结果，防止页面出现undifined
     * @param context 插件上下文
     * @param option 请求信息
     * @param module    模块 ex: 'sysPerf','javaPerf'
     */
    public static async requestDataHelper(context: vscode.ExtensionContext, option: any, module: string) {
        const resp: any = await Utils.requestData(context, option, module);

        // 兼容以前，添加服务器错误处理
        if (constant.HTTP_STATUS.HTTP_200_OK === resp.status) {
            return resp.data;
        } else {
            return resp;
        }
    }

    /**
     * 调用接口获取数据,并更新token
     * @param context 插件上下文
     * @param option 请求信息
     * @param module    模块 ex: 'sysPerf','javaPerf'
     */
    public static async requestData(context: vscode.ExtensionContext, option: RequestDataOption, module: string) {
        let contentType = 'application/json';
        if (option.method === 'PATCH') {
            contentType = 'application/merge-patch+json';
        }
        // 设置请求头
        const headers = {
            'content-type': contentType,
            'Accept-Language': I18nService.getLang().language,
            connection: 'keep-alive'
        };

        // 设置请求参数
        const req: AxiosRequestConfig = {
            headers: option.headers ? option.headers : headers,
            method: (option.method ?? 'POST') as Method
        };
        if (option.contentFlag) {
            req.maxContentLength = Infinity;
            req.maxBodyLength = Infinity;
        }
        // 如果是下载日志，则以arraybuffer类型响应
        if (option.responseType) {
            req.responseType = option.responseType;
        }

        let token: string | undefined;
        const ip = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Ip');
        const port = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Port');
        token = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Token');
        if (module === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {
            // 该请求为/user-management/api/v2.2请求, 当请求为这个时，需要在option中传入 subModule = 'userManagement'
            if (option.subModule === constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT) {
                if (option.url === '/users/session/') {
                    token = undefined;
                }
                req.url = 'https://' + ip + ':' + port + constant.PERF_SUBMODULE_URIS.TOOL_USER_MANAGEMENT + option.url;
            } else {
                // 该请求为/sys-perf/api/v2.2请求
                req.url = 'https://' + ip + ':' + port + constant.PERF_SUBMODULE_URIS.TOOL_SYSPERF_ADVISOR + option.url;
            }
        } else {
            // 该请求为/user-management/api/v2.2请求, 当请求为这个时，需要在option中传入 subModule = 'userManagement'
            if (option.subModule === constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT) {
                if (option.url === '/users/session/') {
                    token = undefined;
                }
                req.url = 'https://' + ip + ':' + port + constant.PERF_SUBMODULE_URIS.TOOL_USER_MANAGEMENT + option.url;
            } else {
                // 该请求为/java-perf/api请求
                req.url = 'https://' + ip + ':' + port + constant.PERF_SUBMODULE_URIS.TOOL_JAVAPERFADVISOR + option.url;
            }
        }

        if (token && !option.noToken) {
            req.headers.Authorization = token;
        }
        if (option.fileUpload) {
            const data = await UploadUtil.uploadFile(context, module, req, ip, port, token, option);
            return new Promise((resolve, reject) => {
                const resp = { status: constant.HTTP_STATUS.HTTP_200_OK, data };
                resolve(resp);
            });
        } else if (option.params) {
            req.data = option.params;
        }

        req.timeout = option.timeout || option.config?.timeout  || 30000;

        // 取消请求的token
        if (null != option.cancelId) {
            let countTime = (req.timeout || 0) / 1000;
            setInterval(() => {
                countTime--;
                if (countTime === 0) {
                    req.cancelToken = new axios.CancelToken((cancel: any) => {
                        this.requestCancelTokenMap.set(option.cancelId, cancel);
                        this.cancelRequest(option.cancelId as number);
                    });
                }
            }, 1000);
        }

        // 调用接口逻辑
        return new Promise((resolve, reject) => {
            const resp = { status: constant.HTTP_STATUS.HTTP_200_OK, data: {} };
            const selectCertificate = Utils.getConfigJson(context).sysPerfConfig[0]?.selectCertificate;
            const localfilepath = Utils.getConfigJson(context).sysPerfConfig[0]?.localfilepath;
            req.httpsAgent = new https.Agent({
                rejectUnauthorized: selectCertificate,
                ca: localfilepath ? fs.readFileSync(localfilepath) : undefined,
                keepAlive: true
            });
            this.axiosInstance.request(req).then((response: any) => {

                // 更新token，统一放在response的headers里
                const newToken = response?.headers?.token;
                if (newToken && newToken !== token) {
                    context.globalState.update(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Token', newToken);
                }

                // 处理登录登出session
                if (Utils.strAContainStrB(option.url, 'users/session/')) {
                    LoginManager.loginProcess(context, option, response.data, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, newToken);
                }

                // 将接口数据转换成json, 防止数据被自动排序导致页面展示不对
                if (option.url.search(/\/tasks\/\d+\/process-analysis\/\?node-id=\d+&query-type=summary&query-target=/) > -1) {
                    response.data = JSON.stringify(response.data);
                }
                resp.data = response.data;
                resolve(resp);
            }).catch((error: any) => {
                let flag: any;
                if (module === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {
                    flag = '/sys-perf/api/v2.2';
                    if (option.subModule === constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT) {
                        flag = '/user-management/api/v2.2';
                    }
                } else {
                    flag = '/java-perf/api/';
                    if (option.subModule === constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT) {
                        flag = '/user-management/api/v2.2';
                    }
                }
                // 日志中不能打印token关键字
                LogManager.log(context, 'url: ' + error?.config?.url.split(flag)[1] + '; Authorization is null?' +
                    (error?.config?.headers?.Authorization?.indexOf('JWT') === -1), module, LOG_LEVEL.ERROR);
                const respStatus = ((error || {}).response || {}).status;

                if (option.moduleType === 'sysPerf' || option.moduleType === 'javaPerf') {
                    JavaperfRecordManage.showAdviceFeedbackError(context, option.moduleType);
                    return;
                }
                if (error?.response?.data && error?.response?.data instanceof Buffer) {
                    const errorRespDataStr = Buffer.from(error?.response?.data).toString();
                    try {
                        const errorRespData = JSON.parse(errorRespDataStr || '{}');
                        error.response.data = errorRespData;
                    } catch (err) {
                        error.response.data = errorRespDataStr;
                    }
                }
                if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' && resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
                    LogManager.log(context, 'Invalid certificate', module, LOG_LEVEL.ERROR);
                    vscode.window.showErrorMessage(i18n.plugins_common_certificate_verification_failed);
                    resp.status = constant.HTTP_STATUS.HTTP_404_NOTFOUND;
                    if (respStatus === constant.HTTP_STATUS.HTTP_502_SERVERERROR) {
                        resp.status = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
                    }
                    resp.data = error;
                    return resolve(resp);
                }
                if ((error?.response?.data?.code?.includes?.('HeapDumpRecordingOnlySaveOnce')
                    && resp.status === constant.HTTP_STATUS.HTTP_200_OK)
                    || (error?.response?.data?.code?.includes?.('ThreadDumpRecordingOnlySaveOnce')
                        && resp.status === constant.HTTP_STATUS.HTTP_200_OK)
                    || (error?.response?.data?.code?.includes?.('GcLogRecordingOnlySaveOnce')
                        && resp.status === constant.HTTP_STATUS.HTTP_200_OK)) {
                    resp.data = error?.response?.data;
                    return resolve(resp);
                }

                // 登录超时
                if (option.url === '/users/session/' && error.message.includes('timeout')
                    && Object.prototype.hasOwnProperty.call(option, 'timeout') && option.timeout) {
                    vscode.window.showErrorMessage(i18n.common_term_timeout);
                    resp.data = {
                        cancel: true,
                        cancelInfo: error?.message
                    };
                    resolve(resp);
                    return;
                }

                // 网络超时
                if (error.code === 'ECONNABORTED' && error.message?.includes('timeout')) {
                    vscode.window.showErrorMessage(i18n.plugins_common_message_resqust_timeout);
                    resp.status = constant.HTTP_STATUS.HTTP_408_REQUEST_TIMEOUT;
                    resp.data = {};
                    return resolve(resp);
                }

                if (!respStatus || respStatus === constant.HTTP_STATUS.HTTP_404_NOTFOUND ||
                    error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                    resp.status = constant.HTTP_STATUS.HTTP_404_NOTFOUND;
                    resp.data = error;
                    // 清除当前会话信息，显示登录操作和错误提示信息
                    ErrorHelper.errorHandler(context, module, error?.response?.statusText);
                    return resolve(resp);
                }

                if (respStatus === constant.HTTP_STATUS.HTTP_400_BAD_REQUEST || respStatus === constant.HTTP_STATUS.HTTP_409_CONFLICT) {
                    if (error?.response?.data) {
                        if (!('message' in error.response.data) || !('code' in error.response.data)) {
                            ErrorHelper.errorHandler(context, module, error?.response?.statusText || error?.message);
                            return resolve(resp);
                        }
                    }
                    resp.status = respStatus;
                    resp.data = error.response.data;
                    (resp.data as any).status = respStatus;
                    if (respStatus === constant.HTTP_STATUS.HTTP_409_CONFLICT) {
                        vscode.window.showErrorMessage(error?.response?.data.message);
                    }
                    return resolve(resp);
                }

                if (respStatus === constant.HTTP_STATUS.HTTP_401_UNAUTHORIZED) {
                    if ((((error || {}).response || {}).data || {}).detail === 'user logged in elsewhere.') {
                        context.globalState.update(module + 'uploadProcessFlag', 0);
                        vscode.window.showErrorMessage(i18n.plugins_common_term_login_other);
                    } else {
                        vscode.window.showErrorMessage(i18n.plugins_common_term_report_401);
                    }

                    resp.status = constant.HTTP_STATUS.HTTP_401_UNAUTHORIZED;
                    LoginManager.redirectToLogin(context, module);
                    return resolve(resp);
                }

                if (respStatus === constant.HTTP_STATUS.HTTP_500_SERVERERROR) {
                    ErrorHelper.errorHandler(context, module, error?.response?.statusText);
                    resp.status = constant.HTTP_STATUS.HTTP_500_SERVERERROR;
                }

                if (respStatus === constant.HTTP_STATUS.HTTP_502_SERVERERROR) {
                    ErrorHelper.errorHandler(context, module, error?.response?.statusText);
                    resp.status = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
                }

                if (respStatus === constant.HTTP_STATUS.HTTP_503_SERVERERROR) {
                    ErrorHelper.errorHandler(context, module, error?.response?.statusText);
                    resp.status = constant.HTTP_STATUS.HTTP_503_SERVERERROR;
                }

                if (respStatus === constant.HTTP_STATUS.HTTP_407_SERVERERROR) {
                    ErrorHelper.errorHandler(context, module, error?.response?.statusText);
                    resp.status = constant.HTTP_STATUS.HTTP_407_SERVERERROR;
                }
                if (respStatus === constant.HTTP_STATUS.HTTP_507_SERVERERROR) {
                    resp.status = constant.HTTP_STATUS.HTTP_507_SERVERERROR;
                    resp.data = error.response.data;
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
            fs.readdirSync(dirPath).forEach((file: any) => {
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
                }
            });
        } catch (error) {
            LogManager.log(context, error as string, '', LOG_LEVEL.ERROR);
        }
    }
    /**
     * 读取本地文件
     */
    public static async readFile(options: vscode.OpenDialogOptions) {
        const uri = await vscode.window.showOpenDialog(options);
        if (uri) {
            return fs.readFileSync(uri[0].fsPath);
        } else {
            return undefined;
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
     * 上传文件和文件夹
     */
    static async uploadFiles(option: any, req: any, tempFile: string, zipFileGenerated: boolean) {
        req.headers['content-type'] = 'multipart/form-data';
        req.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) \
        Chrome/81.0.4044.138 Safari/537.36';

        if (option.fileUpload) {
            const file = fs.createReadStream(option.filePath);
            const formData = {
                file
            };
            req.formData = formData;
            if (option.need_unzip) {
                req.headers['need-unzip'] = true;
            }
        } else if (option.folderUpload) {
            const osTmpDir = os.tmpdir();
            const tempDir = fs.mkdtempSync(osTmpDir + path.sep);

            tempFile = tempDir + path.sep + option.filePath + '.zip';

            if (option.fileList) {
                const zip = new JSZip();
                for (const element of option.fileList) {
                    const filePath = element[0];
                    const fileName = element[1];
                    const zipFolder = element[2];
                    const file = fs.readFileSync(filePath);
                    zip.folder(zipFolder).file(fileName, file);
                }
                await zip.generateAsync({
                    type: 'nodebuffer',
                    streamFiles: true
                }).then((content: any) => {
                    fs.writeFileSync(tempFile, content, 'utf-8');
                    zipFileGenerated = true;
                    const file = fs.createReadStream(tempFile);
                    const form = {
                        file
                    };
                    req.formData = form;
                });

                req.headers['need-unzip'] = true;
            }

        }
    }
    /**
     * 弹出错误信息
     */
    private static showError(info: any) {
        vscode.window.showErrorMessage(info);
    }

    /**
     * 弹出带自定义按钮的错误信息
     */
    private static showErrorWithOperation(global: any, message: any, info: any, buttonTitle1: any) {
        return new Promise((resolve) => {
            vscode.window.showErrorMessage(info, buttonTitle1)
                .then(select => {
                    resolve(select);
                });
        });
    }

    /**
     * 弹出告警信息
     */
    private static showWarning(info: any) {
        vscode.window.showWarningMessage(info);
    }
    /**
     * 弹出带自定义按钮的告警信息
     */
    private static showWarnWithOperation(global: any, message: any, info: any, buttonTitle1: any, buttonTitle2: any) {
        return new Promise((resolve, reject) => {
            vscode.window.showWarningMessage(info,
                buttonTitle1, buttonTitle2).then((select) => {
                    resolve(select);
                });
        });
    }

    /**
     * 弹出提示信息
     */
    private static showInfo(info: any) {
        vscode.window.showInformationMessage(info);
    }
    /**
     * 弹出带自定义按钮的提示信息
     */
    private static showInfoWithOperation(global: any, message: any, info: any, buttonTitle1: any) {
        return new Promise((resolve, reject) => {
            vscode.window.showInformationMessage(info,
                buttonTitle1).then((select) => {
                    if (select === i18n.plugin_common_button_look) {

                    }
                });
        });
    }

    /**
     * 判断sysPerf是否已登陆
     */
    public static isSysPerfLogin(context: vscode.ExtensionContext): boolean {
        let isSysPerfLogin = false;

        const webviewSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        if (context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Token') &&
            webviewSession.isFirst !== constant.USER_FIRST_LOGIN.IS_FIRST_LOGIN) {
            isSysPerfLogin = true;
        }
        return isSysPerfLogin;
    }

    /**
     * 判断当前用户是否是管理员
     */
    public static isAdmin(context: vscode.ExtensionContext): boolean {
        let isSysPerfLogin = false;
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        if (session?.role === constant.PERF_ROLE.ADMIN) {
            isSysPerfLogin = true;
        }
        return isSysPerfLogin;
    }

    /**
     * 获取全局变量
     */
    public static getGlobalValue(context: vscode.ExtensionContext, key: string) {
        return context.globalState.get(key);
    }

    /**
     * 设置全局变量
     */
    public static setGlobalValue(context: vscode.ExtensionContext, key: string, value: any) {
        context.globalState.update(key, value);
    }

    /**
     * 判断dependency服务端信息是否已经配置
     * @param context 插件上下文
     */
    static isPerfadvisorServerConfigured(context: vscode.ExtensionContext): boolean {
        const ip = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Ip');
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
     * 获取URL配置信息
     * @param context 插件上下文
     */
    public static getURLConfigJson(context: vscode.ExtensionContext): any {
        const resourcePath = Utils.getExtensionFileAbsolutePath(context, 'src/extension/assets/urlConfig.json');
        const data = fs.readFileSync(resourcePath);
        const buf = Buffer.from(JSON.parse(JSON.stringify(data)));
        return JSON.parse(buf.toString());
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
     * 弹出错误信息：根据后端接口返回信息支持多语言
     * @param messageType 多语言信息
     * @param data 多语言信息
     * @param directDisplay 是否直接显示data.info，否则会取i18n[data.infoKey]
     */
    public static showMessageByType(messageType: string, data: any, directDisplay: boolean) {
        switch (messageType) {
            case constant.MESSAGE_TYPE.INFO:
                Utils.showInfoByLangType(data, directDisplay);
                break;
            case constant.MESSAGE_TYPE.WARNING:
                Utils.showWarningByLangType(data, directDisplay);
                break;
            case constant.MESSAGE_TYPE.ERROR:
                Utils.showErrorInfoByLangType(data, directDisplay);
                break;
            default:
                break;
        }
    }
    /**
     * 弹出带按钮的右下角提示信息：根据后端接口返回信息支持多语言
     * @param messageType 多语言信息
     * @param data 多语言信息
     * @param directDisplay 是否直接显示data.info，否则会取i18n[data.infoKey]
     */
    public static showMessageWithButtonByType(global: any, message: any): any {
        switch (message?.data?.type) {
            case constant.MESSAGE_TYPE.INFO:
                return Utils.showInfoWithOperation(global, message, message.data?.info, message.data?.title1);
            case constant.MESSAGE_TYPE.WARNING:
                return Utils.showWarnWithOperation(global, message, message.data?.info, message.data.title1, message.data?.title2);

            case constant.MESSAGE_TYPE.ERROR:
                return Utils.showErrorWithOperation(global, message, message.data?.info, message.data?.title);
            default:
                break;
        }
    }

    /**
     * 打开系统文件保存资源管理器
     * @param fileName 全路径文件名（默认）
     * @param filters 文件过滤类型
     * @return 正常返回用户选定的文件名
     */
    public static async saveFileBySaveDialog(fileName: string, filters?: { [name: string]: string[] }) {
        const uri = await vscode.window.showSaveDialog(
            {
                saveLabel: i18n.plugins_common_button_save,
                defaultUri: vscode.Uri.file(fileName),
                filters
            });
        if (!uri) {
            return new Promise((resolve, reject) => {
                resolve(false);
            });
        }
        return new Promise((resolve, reject) => {
            resolve(uri);
        });
    }

    /**
     * 初始化插件上下文
     * @param context 插件上下文
     */
    public static initVscodeCache(context: vscode.ExtensionContext) {

        for (const module of Object.keys(constant.PERF_SUBMODULE)) {
            context.globalState.update(constant.PERF_SUBMODULE[module] + 'Ip', null);
            context.globalState.update(constant.PERF_SUBMODULE[module] + 'Port', null);
            context.globalState.update(constant.PERF_SUBMODULE[module] + 'Token', null);
            context.globalState.update(constant.PERF_SUBMODULE[module] + 'Session', null);
            context.globalState.update(constant.PORT_DESCLAIMER_CONF, false);
            context.globalState.update('autoLoginUser', null);
            context.globalState.update('autoRememberConfig', null);
            context.globalState.update('autoLoginConfig', null);
            context.globalState.update('autoSystemFlag', null);
        }
        const json = Utils.getConfigJson(context);
        if (json.sysPerfConfig.length > 0) {
            context.globalState.update('sysPerfIp', json.sysPerfConfig[0].ip);
            context.globalState.update('sysPerfPort', json.sysPerfConfig[0].port);
        }
        if (json.javaPerfConfig.length > 0) {
            context.globalState.update('javaPerfIp', json.javaPerfConfig[0].ip);
            context.globalState.update('javaPerfPort', json.javaPerfConfig[0].port);
        }
        if (json.disclaimer.length > 0) {
            context.globalState.update(constant.PORT_DESCLAIMER_CONF, true);
        }
        if (json.autoLoginConfig.length > 0) {
            context.globalState.update('autoLoginUser', json.autoLoginConfig[0].user);
            context.globalState.update('autoRememberConfig', json.autoLoginConfig[0].remember);
            context.globalState.update('autoLoginConfig', json.autoLoginConfig[0].auto);
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
    public static strAContainStrB(strA: string | undefined, strB: string) {
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
    public static writeWorkFile(context: vscode.ExtensionContext, reportId: string, remoteFilePath: string, fileContent: string) {
        const filePath = remoteFilePath.split(remoteFilePath.slice(remoteFilePath.lastIndexOf('/') + 1))[0];
        const fileName = remoteFilePath.slice(remoteFilePath.lastIndexOf('/') + 1);
        const workFilePath = Utils.getExtensionFileAbsolutePath(context, 'resources/worksources/' + reportId + filePath);
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
     * 等待指定的时间
     * @param ms 等待时间
     */
    public static async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }

    /**
     * 注册VSCode插件事件侦听--配置修改
     *
     * @param context 上下文
     */
    public static addConfigListening() {
        vscode.workspace.onDidChangeConfiguration(() => {
            let colorTheme = constant.COLOR_THEME.Dark;
            const colorThemeStr: any = vscode.workspace.getConfiguration().get('workbench.colorTheme');
            if (colorThemeStr.indexOf('Light') !== -1) {
                colorTheme = constant.COLOR_THEME.Light;
            }

            Utils.postMsg2Webviews(colorTheme);
        });
    }

    private static postMsg2Webviews(colorTheme: COLOR_THEME) {
        ToolPanelManager.sysPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({ cmd: 'handleVscodeMsg', type: 'colorTheme', data: { colorTheme } });
        });
        ToolPanelManager.javaPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({ cmd: 'handleVscodeMsg', type: 'colorTheme', data: { colorTheme } });
        });
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
        let picPath = constant.PIC_PATH.DARK_BASE_PATH;
        if (constant.COLOR_THEME.Light === Utils.getCurrentColorTheme()) {
            picPath = constant.PIC_PATH.LIGHT_BASE_PATH;
        }

        return picPath;
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
                        const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
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
     * 格式化文件大小单位，例：1024M => 1G
     * @param value 文件大小
     * @param unit value 使用的单位
     */
    public static formatFileSizeUnit = (value: any, unit: 'B' | 'KB' | 'MB' | 'GB'): string => {
        if (value === 0) {
            return `0 ${unit}`;
        }

        const unitList = [
            { label: 'B', prop: 'B', rate: 1 },
            { label: 'KB', prop: 'KB', rate: 1024 },
            { label: 'MB', prop: 'MB', rate: 1024 * 1024 },
            { label: 'GB', prop: 'GB', rate: 1024 * 1024 * 1024 },
        ];
        let usedUnit = {
            label: '', prop: '', rate: 1
        };
        const filterValue = unitList.find((item) => {
            return item.prop === unit;
        });
        const baseValue = value * (filterValue && filterValue.rate ? filterValue.rate : 0);
        for (let index = 0; index < unitList.length; index++) {
            const rate = unitList[index].rate;
            const nextRate = unitList[index + 1] ? unitList[index + 1].rate : Infinity;
            if ((baseValue >= rate) && (baseValue < nextRate)) {
                usedUnit = unitList[index];
                break;
            }
        }
        return `${(baseValue / usedUnit.rate).toFixed(2)} ${usedUnit.label}`;
    }

    /**
     * 显示vscode进度条
     *
     * @param title 标题
     */
    public static showVscodeProgress(title: string): Promise<{
        progress: vscode.Progress<{
            message?: string;
            increment?: number;
        }>,
        finished: () => void
    }> {
        return new Promise((resolve) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: false
            }, (progress) => {
                return new Promise(progressResolve => {
                    resolve({
                        progress,
                        finished: () => {
                            progressResolve('');
                        }
                    });
                });
            });
        });
    }
    /**
     * 日期格式化函数
     * @param date 被格式化日期
     * @param fmt 格式化日期的格式
     */
    public static dateFormat(date: any, fmt: any) {
        const getDate = new Date(date);
        const o = {
            'M+': getDate.getMonth() + 1,
            'd+': getDate.getDate(),
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: getDate.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substring(4 - RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substring(('' + o[k]).length)));
            }
        }
        return fmt;
    }
    /**
     * 字符串转换为日期
     * @param dateString 字符串
     */
    public static getDate(dateString: string) {
        const ymdArr = dateString.split(' ')[0].split('-');
        const hmsArr = dateString.split(' ')[1].split(':');
        return new Date(+ymdArr[0], +ymdArr[1] - 1, +ymdArr[2], +hmsArr[0], +hmsArr[1], +hmsArr[2]);
    }
}
