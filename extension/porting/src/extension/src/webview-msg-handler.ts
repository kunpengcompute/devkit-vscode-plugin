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
import { PortMenu } from './toolmenu/port-menu';
import { ReportHelper } from './report-helper';
import { MigrationProgress } from './migration-progress';
import { ToolPanelManager } from './panel-manager';
import { SSH2Tools } from './ssh2tools';
import { Progress } from './progress';
import { I18nService } from './i18nservice';
import { AnalysisUtil } from './analysis-util';
import { UploadUtil } from './upload-util';
import { CodeSuggestViewHandler, initReportEditor, initReportEditorSecond } from './reportoperation/code-view-hanlder';
import { CodeActionProviders } from './reportoperation/code-action-provider';
import { LogManager, LOG_LEVEL } from './log-manager';
import { PreCheckHelper } from './pre-check-helper';
const fs = require('fs');
const path = require('path');
import { Utils } from './utils';
import { LoginManager } from './login-manager';
import { PANEL_ID } from './constant';
import { CancelTaskUtils } from './cancel-task-utils';
import { ErrorHelper } from './error-helper';
import { CloudIDEService } from './cloudIDE/CloudIDEServie';
import { getPwd, savaData, delUser } from './crypto';

// "输出"面板
const i18n = I18nService.I18n();
let terminalStatusInterval: any;
let terminalCloseEvent: any;
/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
export const messageHandler = {

    async getData(global: any, message: any, module: string) {
        /**
         *  message example:
         * cbid:1591436984731
         * cmd:'getData'
         * data:Object {method: 'POST', params: Object, url: '/users/login/'}
         * module:'porting'
         */
        const resp: any =
          await Utils.requestData(global.context, message.data, message.module, global.toolPanel.panelId);
        // httpsStatus 表示当前这次https 连接的状态，不是接口内部状态
        if (resp.status !== constant.HTTP_STATUS.HTTP_200_OK && resp.status !== constant.HTTP_STATUS.HTTP_423_LOCKED) {
            resp.data = {};
        }
        try {
            resp.data.httpsStatus = resp.status;
        } catch (error) {

        }


        Utils.invokeCallback(global.toolPanel.panel, message, resp.data);
    },

    cancelRequest(global: any, message: any) {
        Utils.cancelRequest(message.data.cancelId);
    },

    /**
     * 同步阈值到home页
     */
    modifyThreshold(global: any, message: any, modelu: string) {
        vscode.window.showInformationMessage(i18n.common_term_modify_suc);
        messageHandler.updateThresholdToWebView(global.toolPanel.module);
    },

    /**
     * 设置面板同步数据到Webview
     * @param typeOfTool 类型
     */
    updateThresholdToWebView(typeOfTool: any) {
        switch (typeOfTool) {
            case constant.TOOL_NAME_PORTING:
                const toolPortPanel =
                  ToolPanelManager.getToolPanelByPanelId(PANEL_ID.portCreatescSanTask, constant.TOOL_NAME_PORTING);
                const PortPanel =
                  ToolPanelManager.getToolPanelByPanelId(PANEL_ID.portPreCheck, constant.TOOL_NAME_PORTING);
                const softBuildPanel =
                  ToolPanelManager.getToolPanelByPanelId(PANEL_ID.portSoftBuild, constant.TOOL_NAME_PORTING);
                if (toolPortPanel) {
                    ToolPanelManager
                      .sentMessageToPanel(ToolPanelManager.getToolPanelByPanelId(PANEL_ID.portCreatescSanTask,
                        constant.TOOL_NAME_PORTING), null, constant.TOOL_NAME_PORTING,
                        { value: 'isreportChange', type: 'isreportChange' });
                } else if (PortPanel) {
                    ToolPanelManager.sentMessageToPanel(ToolPanelManager.getToolPanelByPanelId(PANEL_ID.portPreCheck,
                        constant.TOOL_NAME_PORTING), null, constant.TOOL_NAME_PORTING,
                        { value: 'isreportChange', type: 'isreportChange' });
                } else if (softBuildPanel) {
                        ToolPanelManager
                          .sentMessageToPanel(ToolPanelManager.getToolPanelByPanelId(PANEL_ID.portSoftBuild,
                            constant.TOOL_NAME_PORTING), null, constant.TOOL_NAME_PORTING,
                            { value: 'isreportChange', type: 'isreportChange' });
                }
                break;
            default: break;
        }
    },

    // vscode方式下载源码迁移报告
    downloadReport(global: any, message: any) {
        ReportHelper.downloadPortReport(global.context, message.data);
    },
    // vscode方式下载软件迁移报告
    downloadDepReport(global: any, message: any) {
        ReportHelper.downloadDepReport(global.context, message.data);
    },

    // cloudide方式下载软件迁移报告
    cloudIDEDownloadDepReport(global: any, message: any) {
        CloudIDEService.cloudIDEDownloadDepReport(global, message);
    },

    // vscode方式下载重构软件包
    downloadRebuildPkg(global: any, message: any) {
        AnalysisUtil.downloadRebuildPkg(global.context,
          message.data.name,
          message.data.path + '/' + message.data.name, message.module);
    },

    /**
     * cloudIDE webview页面下载重构软件包
     * @param global 上下文
     * @param message 软件包信息
     */
    cloudIDEDownloadRebuildPkg(global: any, message: any) {
        CloudIDEService.cloudIDEDowmload(message.data.path);
    },

    // vscode方式下载HTML
    downloadRebuildHTML(global: any, message: any) {
        ReportHelper.downLoadSoftWareHTMLByPage(global.context, message.data.reportInfo, message.data.htmlData);
    },

    /**
     * cloudIDE获取软件包重构历史报告html页面
     * @param global 上下文
     * @param message 来自webview的消息内容
     */
    getSoftPkgRebuildHTMLContent(global: any, message: any) {
        CloudIDEService.getSoftPkgRebuildHTMLContent(global, message);
    },
    // vscode方式下载操作日志
    downloadLog(global: any, message: any) {
        ReportHelper.downloadLog(global.context, message.data);
    },
    // vscode方式下载Csr日志
    downloadCsrFile(global: any, message: any) {
        ReportHelper.downloadCsrFile(global.context, message.data);
    },

    // vscode方式下载BC文件
    downloadBcFile(global: any, message: any) {
        ReportHelper.downloadBcFile(global.context, message.data);
    },

    // 创建运行日志任务
    createrunlogtask(global: any, message: any) {
        ReportHelper.createrunlogtask(global.context, message.data);
    },

    // vscode方式下载html报告
    downloadReportHtml(global: any, message: any) {
        ReportHelper.downloadReportHtml(global, message);
    },
    /**
     * 将文本内容写入文件，模拟web端下载文件
     *
     * @param context 插件上下文
     * @param fileName 文件名称
     * @param fileContent 文件内容
     */
    async downloadFile(global: any, message: any) {
        let file: any;

        // 是否调用系统本地资源管理器
        if (message.data.invokeLocalSave) {
            file = await Utils.saveFileBySaveDialog(global.context.extensionPath + '/' + message.data.fileName);
        } else {
            file = vscode.Uri.file(global.context.extensionPath + '/' + message.data.fileName);
        }

        // 将文件内容写入file文件
        try {

            // 文件写入回调函数
            function fileWriteCallback(err: any) {
                if (err) {
                    // 下载文件失败，删除错误文件
                    fs.readFile(file, 'utf-8', (readFileErr: any, data: any) => {
                        if (readFileErr) { return; }

                        fs.unlinkSync(file);
                    });
                    vscode.window.showErrorMessage(err.message);
                }

                vscode.window.showInformationMessage(
                    I18nService.I18nReplace(i18n.common_term_download_success,
                      { 0: file.fsPath ? file.fsPath : file }));
            }

            if (message.data.contentType === 'arraybuffer') {
                await fs.writeFile(file.fsPath, Buffer.from(message.data.fileContent), fileWriteCallback);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, file.fsPath);
            } else {
                await fs.writeFile(file, message.data.fileContent, 'utf-8', fileWriteCallback);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, file);
            }
        } catch (error) {
            LogManager.log(global.context, 'downloadFile error.' + error, constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
        }
    },

    // 检查ssh连接是否通畅
    async checkConn(global: any, message: any) {
        const pluginUrlCfg = Utils.getUrlConfigJson(global.context);
        const username = message.data.username;
        if (username.toLocaleLowerCase() === 'root') {
            const resp = await vscode.window.showInformationMessage(
                i18n.plugins_common_tips_checkConn_root,
                { modal: true },
                i18n.plugins_common_tips_checkConn_openFAQ,
                i18n.confirm_button
            );
            if (resp === i18n.plugins_common_tips_checkConn_openFAQ) {
                const faq =  vscode.env.language === 'zh-cn' ? vscode.Uri.parse(pluginUrlCfg.faqThreeZn)
                : vscode.Uri.parse(pluginUrlCfg.faqThreeEn);
                vscode.commands.executeCommand('vscode.open', faq);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            } else if (resp !== i18n.confirm_button) {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            }
        } else {
            const resp = await vscode.window.showInformationMessage(
                i18n.plugins_common_tips_checkConn_noroot.replace(/\{0\}/g, username),
                { modal: true },
                i18n.plugins_common_tips_checkConn_openFAQ,
                i18n.confirm_button
            );
            if (resp === i18n.plugins_common_tips_checkConn_openFAQ) {
                const faq = vscode.env.language === 'zh-cn' ? vscode.Uri.parse(pluginUrlCfg.faqThirtyNineZn)
                : vscode.Uri.parse(pluginUrlCfg.faqThirtyNineEn);
                vscode.commands.executeCommand('vscode.open', faq);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            } else if (resp !== i18n.confirm_button) {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            }
        }

        const ssh2Tools = new SSH2Tools();
        const sshCheckResult = await ssh2Tools.sshClientCheck();
        if (!sshCheckResult) {
            vscode.window.showWarningMessage(i18n.plugins_common_message_sshClientCheck);
            Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
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
                    Utils.fingerCheck(global, tempip, hashedKey, finger).then((data: any) => {
                        callback1(data);
                    });
                }
            };
        } else {

            // 检测秘钥文件是否有秘钥短语
            if (!ssh2Tools.checkRealExistPassphrase(message.data)) {
                vscode.window.showErrorMessage(I18nService.I18n().plugins_common_tips_connFail);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
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
                    Utils.fingerCheck(global, tempip, hashedKey, finger).then((data: any) => {
                        callback1(data);
                    });
                }
            };
        }
        Utils.fingerLengthCheck(global);
        const callback = (data: any) => {
            if (data instanceof Error) {
                if (data.message.search(/ETIMEDOUT/) !== -1 || data.message.search(/ECONNREFUSED/) !== -1) {
                    ErrorHelper.errorHandler(global.context, message.module, server.host);
                } else if (data.message.search(/no matching/) !== -1) {
                    const language = vscode.env.language;
                    let url = '';
                    if (language && language.indexOf('en') !== -1) {
                      url = Utils.getUrlConfigJson(global.context).faqAlgorithmMismatchEn;
                    } else {
                      url = Utils.getUrlConfigJson(global.context).faqAlgorithmMismatchZn;
                    }
                    const info = {
                      info: i18n.plugins_common_message_sshAlgError,
                      url
                    };
                    Utils.jumpToFaq(info);
                }
                LogManager.log(global.context, ' checkConn Error', message.module, LOG_LEVEL.ERROR);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, data.toString());
            } else {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
            }
        };
        new SSH2Tools().connectTest(server, () => { }, callback);
        this.clearPwd(message.data.password);
        this.clearPwd(message.data.privateKey);
    },

    // 校验导入的私钥内容
    async privateKeyCheck(global: any, message: any) {
        const privateKey = message.data.privateKey;
        const data = fs.readFileSync(privateKey);
        const dataed = data.toString();
        if (dataed.search(/-----BEGIN/) !== -1 && dataed.search(/-----END/) !== -1) {
            Utils.invokeCallback(global.toolPanel.getPanel(), message, true);
        } else {
            Utils.invokeCallback(global.toolPanel.getPanel(), message, false);
        }
    },

    // 保存ip与port到json配置文件
    async saveConfig(global: any, message: any) {
        let data: any;
        const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
        if (message.data.type === 'auto') {
            data = fs.writeFileSync(resourcePath, message.data.data);
            global.context.globalState.update('autoLoginUser', null);
            global.context.globalState.update('autoRememberConfig', null);
            global.context.globalState.update('autoLoginConfig', null);
            const json = Utils.getConfigJson(global.context);
            if (json.portAuto.length > 0) {
                global.context.globalState.update('autoLoginUser', json.portAuto[0].user);
                global.context.globalState.update('autoRememberConfig', json.portAuto[0].remember);
                global.context.globalState.update('autoLoginConfig', json.portAuto[0].auto);
            }
            if (message.data.pwd) {
                const param = {
                    username: json.portAuto[0].user,
                    pwd: message.data.pwd,
                    encrypt: true
                };
                LoginManager.loginRememberPwd(global.context, param);
            }
            return;
        } else if (message.data.type === 'remember') {
            const param = {
                username: message.data.username,
                encrypt: false
            };
            data = await LoginManager.loginRememberPwd(global.context, param);
            Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
            return;
        } else {
            data = fs.writeFileSync(resourcePath, message.data.data);
        }

        // 清空session缓存,并将新的配置更新到session中
        Utils.initVscodeCache(global.context);

        // 通过调用首次登陆接口判断修改的IP和端口是否可正常访问
        const queryOptions = {
            url: '/users/admin/status/',
            method: 'GET'
        };
        const resp: any = await Utils.requestData(global.context, queryOptions, message.module);
        if (constant.TOOL_NAME_PORTING === message.module) {
            if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
                // 刷新左侧登录按钮
                vscode.commands.executeCommand('setContext', 'isportconfigured', true);
                vscode.commands.executeCommand('setContext', 'portipconfig', false);
                vscode.commands.executeCommand('setContext', 'isportlogined', false);
            } else {
                // 刷新左侧配置远端服务器
                vscode.commands.executeCommand('setContext', 'isportconfigured', false);
                vscode.commands.executeCommand('setContext', 'portipconfig', true);
                vscode.commands.executeCommand('setContext', 'isportlogined', false);
            }
            PortMenu.getInstance().refresh();
        }

        Utils.invokeCallback(global.toolPanel.getPanel(), message, {status: resp.status});

        // 拉起vscode弹出框提示
        if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
            if (message.data.showInfoBox) {
                LogManager.log(global.context,
                  'Save Config Invalid certificate' + message.data.selected, message.module, LOG_LEVEL.ERROR);
                vscode.window.showInformationMessage(i18n.plugins_common_message_iss, i18n.pligins_common_message_il)
                  .then((select) => {
                    const panelId = constant.PANEL_ID.portNonLogin;
                    const title = i18n.port_login;
                    if (select === i18n.pligins_common_message_il) {
                        let dataMsg;
                        if (message.data.filePath) {
                            dataMsg = {
                                data: {
                                    cmd: 'openNewPage', router: 'login', panelId,
                                    viewTitle: title, message: {
                                        filePath: message.data.filePath,
                                        fileName: message.data.fileName,
                                        isSingle: message.data.isSingle,
                                        isAffinity: message.data.isAffinity
                                    }
                                },
                                module: message.module
                            };
                        } else {
                            dataMsg = {
                                data: {
                                    cmd: 'openNewPage', router: 'login', panelId,
                                    viewTitle: title, message: {}
                                },
                                module: message.module
                            };
                        }
                        this.openNewPage(global, dataMsg);
                    }
                });
            }
        } else {
            //  清空配置文件里的ip和port，避免再次打开插件的时候本来配置失败但显示登录按钮
            let config: any = JSON.parse(message.data.data);
            const portConfig: any = [];
            config = Object.assign(config, { portConfig });
            fs.writeFileSync(resourcePath, JSON.stringify(config));
        }

        // 关闭其他页面
        ToolPanelManager.closePanelsByRemained(message.module, [global.toolPanel.getPanelId()]);
        global.context.globalState.update(message.module + 'uploadProcessFlag', 0);
    },

    updateDisclaimer(global: any, message: any) {
        // 将是否签署免责声明写入配置文件，以便自动登录时候判断是否已经签署过免责声明
        const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
        fs.writeFileSync(resourcePath, message.data.data);

        if (message.data.isDisclaime) {  // 签署了免责申明
            global.context.globalState.update(constant.PORT_DESCLAIMER_CONF, true);
        } else {
            global.context.globalState.update(constant.PORT_DESCLAIMER_CONF, false);
        }
    },

    saveDisclaimer(global: any, message: any) {
        // 将是否签署免责声明写入配置文件，以便自动登录时候判断是否已经签署过免责声明
        const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
        fs.writeFileSync(resourcePath, message.data.data);

        // 签署了免责申明
        if (message.data.disclaimeSave) {
            global.context.globalState.update(constant.PORT_DESCLAIMER_CONF, true);
            return;
        }

        //  取消签署免责声明
        if (message.data.disclaimeCancel) {
            global.context.globalState.update(constant.PORT_DESCLAIMER_CONF, false);

            // 清空session缓存,并将新的配置更新到session中
            Utils.initVscodeCache(global.context);

            // 刷新左侧登录按钮
            vscode.commands.executeCommand('setContext', 'isportconfigured', true);
            vscode.commands.executeCommand('setContext', 'portipconfig', false);
            vscode.commands.executeCommand('setContext', 'isportlogined', false);
            PortMenu.getInstance().refresh();

            // 关闭所有页签
            ToolPanelManager.closePanelsByRemained(message.module, []);
        }
    },

    async getpwd(global: any, message: any) {
        const json = Utils.getConfigJson(global.context);
        getPwd(message.data.username, json.portConfig[0].ip, pwd => {
            if (typeof pwd === 'object') {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
            } else {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, pwd);
            }
        });
    },
    async setPwd(global: any, message: any) {
        const json = Utils.getConfigJson(global.context);
        savaData(message.data.username, message.data.pwd, json.portConfig[0].ip);
    },
    async deletePwd(global: any, message: any) {
        const json = Utils.getConfigJson(global.context);
        delUser(message.data.username, json.portConfig[0].ip);
    },

    // 清理json配置文件中的ip和port
    async cleanConfig(global: any, message: any) {
        const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
        const data = fs.writeFileSync(resourcePath, message.data.data);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);

        // 刷新左侧配置远端服务器
        if (constant.TOOL_NAME_PORTING === message.module) {
            vscode.commands.executeCommand('setContext', 'isportconfigured', false);
            vscode.commands.executeCommand('setContext', 'portipconfig', true);
            vscode.commands.executeCommand('setContext', 'isportlogined', false);
            PortMenu.getInstance().refresh();
        }

        // 清空session缓存,并将新的配置更新到session中
        Utils.initVscodeCache(global.context);

        // 关闭其他页面
        ToolPanelManager.closePanelsByRemained(message.module, [global.toolPanel.getPanelId()]);
        global.context.globalState.update(message.module + 'uploadProcessFlag', 0);
        if (message.data.disclaimeCancel) {
            ToolPanelManager.closePanelsByRemained(message.module, []);
        }
    },

    // 从配置文件读取ip与port
    readConfig(global: any, message: any) {
        const json = Utils.getConfigJson(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, json);
    },

    // 从配置文件读取当前ide支持的后端版本
    readVersionConfig(global: any, message: any) {
        const toolVersions: any = Utils.getConfigJson(global.context).portVersion;
        Utils.invokeCallback(global.toolPanel.panel, message, toolVersions);
    },

    /**
     * 获取url配置文件
     */
    readUrlConfig(global: any, message: any) {
        const json = Utils.getUrlConfigJson(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, json);
    },

    getGlobleState(global: any, message: any) {
        const data = {};
        message.data.data.keys.forEach((item: number) => {
            data[item] = global.context.globalState.get(item);
        });

        Utils.invokeCallback(global.toolPanel.panel, message, data);
    },

    setGlobleState(
        global: { context: { globalState: { update: (arg0: any, arg1: any) => void; }; }; toolPanel: any; },
        message: { data: { list: any[]; }; }) {
        const data: { key: any; value: any; }[] = [];
        (message as any).data.data.list.forEach((item: { key: any; value: any; }) => {
            global.context.globalState.update(item.key, item.value);
            data.push({ key: item.key, value: item.value });
        });
        Utils.invokeCallback(global.toolPanel.panel, message, data);
    },

    getLocale(global: any, message: any) {
        const languageType = vscode.env.language;
        global.toolPanel.panel.webview.postMessage({ cmd: 'getLocale', data: languageType, cbid: message.cbid });
    },

    getPwdLogOut(global: any, message: any) {
        const option = {
            module: message.module
        };
        if (constant.TOOL_NAME_PORTING === message.module) {
            global.context.globalState.update('portingToken', null);
            global.context.globalState.update('portingSession', null);
        }

        ToolPanelManager.updatePanel(global.toolPanel, global.context, option);
    },

    /**
     * 打开新的vscode窗口
     *
     * @param global 全局上下文
     * @param message 消息内容
     */
    openNewPage(global: any, message: any) {
        const session: any = {
            queryParams: {
                language: vscode.env.language
            }
        };
        for (const prop of Object.keys(message.data.message)) {
            session.queryParams[prop] = message.data.message[prop];
        }
        const webSession: any = {
            language: vscode.env.language
        };
        const navMessage = Utils.generateMessage('navigate',
          { page: '/' + message.data.router, pageParams: session, webSession });
        const panelOption = {
            panelId: message.data.panelId,
            viewType: message.module,
            viewTitle: message.data.viewTitle,
            module: message.module,
            message: navMessage,
        };
        ToolPanelManager.createOrShowPanel(panelOption, global.context);
    },

    /**
     * 更新panel状态
     *
     * @param global 全局上下文
     * @param message 消息内容
     */
    updatePanel(global: any, message: any) {
        const option = { module: message.module };
        ToolPanelManager.updatePanel(global.toolPanel, global.context, option);
    },

    // 关闭所有panel
    closeAllPanel(global: any, message: any) {
        // 关闭全部panel
        ToolPanelManager.closePanelsByRemained(message.module, new Array<string>());
    },

    /**
     * Porting登录成功之后需要刷新左侧树和更新panel信息
     * view上的按钮从隐藏变成可见
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    loginSuccess(global: any, message: any) {
        //  登录成功之后跳转到了扫描主界面，需要刷新左侧树和更新panel信息
        if (constant.TOOL_NAME_PORTING === message.module) {

            // view上的按钮从隐藏变成可见
            vscode.commands.executeCommand('setContext', 'isportlogined', Utils.isPortLogin(global.context));

            // view上菜单，admin和普通用户的菜单不同
            vscode.commands.executeCommand('setContext', 'isPortAdmin',
                global.context.globalState.get(constant.TOOL_NAME_PORTING + 'Session').role === 'Admin');

            // 刷新左侧树
            PortMenu.getInstance().pathList = [];
            PortMenu.getInstance().refresh();
        }

        // 更新panel信息
        const option = {
            module: message.module,
        };

        // 将除当前panel之外的其他的panel全部掉
        ToolPanelManager.closePanelsByRemained(message.module, new Array<string>(global.toolPanel.getPanelId()));

        // 更新当前panel
        ToolPanelManager.updatePanel(global.toolPanel, global.context, option);
    },

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
                passphrase: message.data.passphrase
            };
        }

        // 流程处理回调函数
        const processHandler = (data: any) => {
            if (data instanceof Error) {
                LogManager.log(global.context, 'install error: ' + data, message.module, LOG_LEVEL.ERROR);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, 'Error:' + data.toString());
            } else if (typeof data === 'string') {
                if (data.search(/success|failed/) !== -1) {
                    clearInterval(terminalStatusInterval);
                    if (terminalCloseEvent) { terminalCloseEvent.dispose(); }
                    ssh2Tools.closeConnect();
                    if (data.search(/success/) !== -1) {
                        // 延迟1秒隐藏终端
                        setTimeout(() => { terminal.hide(); }, 1000);
                    }
                }
                Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
            }
        };

        // 建立连接
        await ssh2Tools.connect(server).catch(processHandler);

        // 上传脚本文件
        const timestamp = Utils.formatDatetime(message.data.startInstallDatetime, 'yy_M_d_h_m_s');
        const workDir = constant.SHELL_FILE_PATH.WORKDIR + '_' + timestamp + '/';
        await ssh2Tools.mkdir(workDir, { mode: '700' }).catch(processHandler);
        const preShellName = 'deploy_' + message.module + '.sh';
        const shellName = 'write_' + message.module + '_log.sh';
        const preShellPromise = ssh2Tools.writeFile(preShellName, workDir + preShellName);
        const shellPromise = ssh2Tools.writeFile(shellName, workDir + shellName);
        await Promise.all([preShellPromise, shellPromise]).catch(processHandler);

        // 创建终端
        terminal = vscode.window.createTerminal();
        // 创建终端，关闭install页面loading
        Utils.invokeCallback(global.toolPanel.getPanel(), message, 'closeLoading');
        // 创建终端异常退出处理
        handleTerminalException(terminal, ssh2Tools, [workDir + preShellName, workDir + shellName],
            (clearError) => {
                const text = 'install clear error: ' + clearError;
                LogManager.log(global.context, text, message.module, LOG_LEVEL.INFO);
            }, processHandler);
        // 显示终端，开始部署
        terminal.show();
        terminal.sendText('ssh -t -p' + server.port + ' ' + server.username +
            '@' + server.host + ' bash ' + workDir + preShellName + ' -a ' + this.getArmUrl(global)
            + ' -b ' + this.getX86Url(global) + ' -c "' + this.getKeyUrl(global) + '" \n');

        // 查询是否部署完成
        const stepName = '.install_' + message.module + '.step';
        ssh2Tools.tailFlow(workDir + stepName, processHandler).catch(processHandler);
        LogManager.log(global.context, server.username + ' install start', message.module, LOG_LEVEL.INFO);
        // 添加关闭连接前事件
        ssh2Tools.onCloseBefore = () => {
            return ssh2Tools.exec('rm -f ' + workDir + stepName);
        };
        // 清除用户信息
        server = undefined;
        message.data.username = undefined;
        message.data.password = undefined;
    },

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
                passphrase: message.data.passphrase
            };
        }

        // 流程处理回调函数
        const processHandler = (data: any) => {
            if (data instanceof Error) {
                LogManager.log(global.context, 'uninstall error: ' + data, message.module, LOG_LEVEL.ERROR);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, 'Error:' + data.toString());
            } else if (typeof data === 'string') {
                if (data.search(/success|failed/) !== -1) {
                    clearInterval(terminalStatusInterval);
                    if (terminalCloseEvent) { terminalCloseEvent.dispose(); }
                    ssh2Tools.closeConnect();
                    if (data.search(/success/) !== -1) {
                        // 延迟1秒隐藏终端
                        setTimeout(() => { terminal.hide(); }, 1000);
                    }
                }
                Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
            }
        };

        // 建立连接
        await ssh2Tools.connect(server).catch(processHandler);

        // 上传脚本文件
        const timestamp = Utils.formatDatetime(message.data.startUninstallDatetime, 'yy_M_d_h_m_s');
        const workDir = constant.SHELL_FILE_PATH.WORKDIR + '_' + timestamp + '/';
        await ssh2Tools.mkdir(workDir, { mode: '700' }).catch(processHandler);
        const preShellName = 'uninstall_' + message.module + '.sh';
        const shellName = 'uninstall_' + message.module + '_log.sh';
        const preShellPromise = ssh2Tools.writeFile(preShellName, workDir + preShellName);
        const shellPromise = ssh2Tools.writeFile(shellName, workDir + shellName);
        await Promise.all([preShellPromise, shellPromise]).catch(processHandler);

        // 创建终端
        terminal = vscode.window.createTerminal();
        // 创建终端，关闭uninstall页面loading
        Utils.invokeCallback(global.toolPanel.getPanel(), message, 'closeLoading');
        handleTerminalException(terminal, ssh2Tools, [workDir + preShellName, workDir + shellName],
            (clearError) => {
                const text = 'uninstall clear error: ' + clearError;
                LogManager.log(global.context, text, message.module, LOG_LEVEL.INFO);
            }, processHandler);

        // 显示终端，开始卸载
        terminal.show();
        terminal.sendText('ssh -t -p' + server.port + ' ' + server.username + '@' + server.host +
            ' bash ' + workDir + preShellName + ' \n');

        // 查询是否卸载完成
        const stepName = '.uninstall_' + message.module + '.step';
        ssh2Tools.tailFlow(workDir + stepName, processHandler).catch(processHandler);
        LogManager.log(global.context, server.username + ' uninstall start', message.module, LOG_LEVEL.INFO);
        // 添加关闭连接前事件
        ssh2Tools.onCloseBefore = () => {
            return ssh2Tools.exec('rm -f ' + workDir + stepName);
        };
        // 清除用户信息
        server = undefined;
        message.data.username = undefined;
        message.data.password = undefined;

    },

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
                passphrase: message.data.passphrase
            };
        }

        // 流程处理回调函数
        const processHandler = (data: any) => {
            if (data instanceof Error) {
                LogManager.log(global.context, 'upgrade Error', message.module, LOG_LEVEL.ERROR);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, 'Error:' + data.toString());
            } else if (typeof data === 'string') {
                if (data.search(/success|failed/) !== -1) {
                    clearInterval(terminalStatusInterval);
                    if (terminalCloseEvent) { terminalCloseEvent.dispose(); }
                    ssh2Tools.closeConnect();
                    if (data.search(/success/) !== -1) {
                        // 延迟1秒隐藏终端
                        setTimeout(() => { terminal.hide(); }, 1000);
                    }
                }
                Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
            }
        };

        // 建立连接
        await ssh2Tools.connect(server).catch(processHandler);

        // 上传脚本文件
        const timestamp = Utils.formatDatetime(message.data.startUpgradeDatetime, 'yy_M_d_h_m_s');
        const workDir = constant.SHELL_FILE_PATH.WORKDIR + '_' + timestamp + '/';
        await ssh2Tools.mkdir(workDir, { mode: '700' }).catch(processHandler);
        const preShellName = 'upgrade_' + message.module + '.sh';
        const shellName = 'upgrade_' + message.module + '_log.sh';
        const preShellPromise = ssh2Tools.writeFile(preShellName, workDir + preShellName);
        const shellPromise = ssh2Tools.writeFile(shellName, workDir + shellName);
        await Promise.all([preShellPromise, shellPromise]).catch(processHandler);

        // 创建终端
        terminal = vscode.window.createTerminal();
        // 创建终端，关闭upgrade页面loading
        Utils.invokeCallback(global.toolPanel.getPanel(), message, 'closeLoading');
        // 创建终端异常退出处理
        handleTerminalException(terminal, ssh2Tools, [workDir + preShellName, workDir + shellName],
            (clearError) => {
                const text = 'upgrade clear error: ' + clearError;
                LogManager.log(global.context, text, message.module, LOG_LEVEL.INFO);
            }, processHandler);
        // 显示终端，开始部署
        terminal.show();
        terminal.sendText('ssh -t -p' + server.port + ' ' + server.username +
            '@' + server.host + ' bash ' + workDir + preShellName + ' -a ' + this.getArmUrl(global)
            + ' -b ' + this.getX86Url(global) + ' -c "' + this.getKeyUrl(global) + '" \n');

        // 查询是否部署完成
        const stepName = '.upgrade_' + message.module + '.step';
        ssh2Tools.tailFlow(workDir + stepName, processHandler).catch(processHandler);
        LogManager.log(global.context, server.username + ' upgrade start', message.module, LOG_LEVEL.INFO);
        // 添加关闭连接前事件
        ssh2Tools.onCloseBefore = () => {
            return ssh2Tools.exec('rm -f ' + workDir + stepName);
        };
        // 清除用户信息
        server = undefined;
        message.data.username = undefined;
        message.data.password = undefined;
    },

    showProgress(global: any, message: any) {
        MigrationProgress.showProcess(global, message);
    },

    /**
     * 打开建议反馈错误提示
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    openAdviceLinkError(global: any, message: any) {
      Utils.showAdviceFeedbackError(global.context, message.data.module);
    },

    /**
     * 扫描无权限FAQ提示
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    async noPermissionFaqTip(global: any, message: any) {
      Utils.NoPermissionFAQ(global.context, message);
    },

    /**
     * 当前系统不支持软件包时FAQ提示
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    async osNotSupport(global: any, message: any) {
      Utils.osNotSupport(global.context, message);
    },

    /**
     * 扫描任务新建之后刷新进度条
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    async scanProcess(global: any, message: any) {
        Progress.scanProcess(global, message);
    },

    /**
     * 进入新建扫描任务主页面时查询历史报告状态为2：登录用户没有运行任务，有报告未查看，先去success界面再去查看报告
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    async updateScanHistoryOrReport(global: any, message: any) {
        let formatReportId = Utils.formatCreatedId(message.data.reportId);
        formatReportId = vscode.env.language === 'zh-cn' ? `（${formatReportId}）` : `(${formatReportId})`;
        Utils.showInfo(I18nService.I18n().plugins_dependency_message_createAnalysisReport + formatReportId);

        // 刷新左侧树
        PortMenu.getInstance().refresh();

        // 用报告页面刷掉原来新建扫描任务页面
        const option = {
            module: constant.TOOL_NAME_PORTING,
            id: message.data.reportId
        };
        ToolPanelManager.updatePanel(global.toolPanel, global.context, option);
    },

    /**
     * webview侧发消息给vscode发消息需在右下角弹提醒框
     * 比如：进入扫描主页面提醒用户扫描报告数量过多，请删除。
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info,warn}}
     */
    async showInfoBox(global: any, message: any) {
        if (message.data.type === 'error') {
            Utils.showError(message.data.info, message.data.confirm, global.toolPanel.getPanelId(), message.module);
        } else if (message.data.type === 'warn') {
            Utils.showWarning(message.data.info, message.data.confirm, global.toolPanel.getPanelId(), message.module);
        } else {
            Utils.showInfo(message.data.info, message.data.confirm, global.toolPanel.getPanelId(), message.module);
        }
    },
    /**
     * webview侧发消息给vscode发消息需在右下角弹提醒框
     * 比如：进入扫描主页面提醒用户扫描报告数量过多，请删除。
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info,warn}}
     * 报告锁定下载提示
     */
    async unableDownInfoBox(global: any, info: any ) {
        const {resp, btnType, type} = info.data;
        const noOldReport = (resp.realStatus === '0x0d0112');
        let msgTpye = 'common_term_operate_locked1_download';
        let btnTpye = 'common_term_operate_Download';
        let page = '/PortingPre-check';
        let viewTitle = i18n.plugins_porting_enhance_function_label;
        if (btnType ===  'view') {
            msgTpye = 'common_term_operate_locked1_view';
            btnTpye = 'common_term_operate_view';
        }
        if (type === 'source') {
            page = '/home';
            viewTitle = Utils.formatCreatedId(resp.data.id);
        }
        const msg = noOldReport ? i18n.plugins_porting_report_notNewReport :
                I18nService.I18nReplace(i18n[msgTpye],
                { 0:  Utils.formatCreatedId(resp.data.id) });
        const btn = noOldReport ? i18n.common_term_operate_Create : i18n[btnTpye];
        vscode.window.showInformationMessage(msg, btn)
        .then(async (select) => {
            if (select === btn) {
                if (noOldReport) {
                    // 打开增强功能
                    const portSession = global.context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
                    const message = Utils.generateMessage('navigate',
                        { page, pageParams: { queryParams: null },
                            webSession: portSession });
                    const panelOption = {
                        panelId: constant.PANEL_ID.portPreCheck,
                        viewType: constant.VIEW_TYPE.portPreCheck,
                        viewTitle: i18n.plugins_porting_enhance_function_label,
                        module: constant.TOOL_NAME_PORTING,
                        message
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, global.context);
                    return;
                }
                // 打开新报告
                const option = {
                    url: `/task/progress/?task_type=10&task_id=${encodeURIComponent(resp.data.id)}`,
                    method: 'GET'
                };
                const res: any = await Utils.requestDataHelper(global.context, option, 'porting');
                const data = {
                    cbid: new Date().getTime(),
                    cmd: 'openNewPage',
                    data: {
                        panelId: resp.data.id,
                        router: 'enchanceReport',
                        viewTitle: i18n.plugins_common_tips_weak,
                        message: {
                            taskId: resp.data.id,
                            taskType: 10,
                            resp: JSON.stringify(res)
                        }
                    },
                    module: 'porting'
                  };
                this.openNewPage(global, data);
            }
        });
    },
    /**
     * 当报告被锁定时,下载和查看建议源码显示，右下弹框
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息}
     */
    async sourceInfoBox(global: any, info: any ) {
        const { resp, type} = info.data;
        let msgTxt = i18n.plugins_porting_report_notNewReport;
        let btnTxt =  i18n.common_term_operate_Create;
        if (resp.realStatus === '0x0d0223') {
            msgTxt = I18nService.I18nReplace(i18n[type === 'view' ? 'common_term_operate_locked1_view' :
            'common_term_operate_locked1_download'],
                { 0:  Utils.formatCreatedId(resp.data.id) });
            btnTxt = type === 'view' ? i18n.common_term_operate_view : i18n.common_term_operate_Download;
        }
        vscode.window.showInformationMessage(msgTxt, btnTxt)
        .then(async select => {
            if (select !== btnTxt ) { return ; }
            if (resp.realStatus === '0x0d0112') {
                const portSession = global.context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
                const message = Utils.generateMessage('navigate',
                    { page: '/home', pageParams: { queryParams: null },
                        webSession: portSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.portCreatescSanTask,
                    viewType: constant.VIEW_TYPE.createTask,
                    viewTitle: i18n.port_create_source_task,
                    module: constant.TOOL_NAME_PORTING,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, global.context);
            }
            if (resp.realStatus === '0x0d0223') {
                const option = {
                    url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(resp.data.id)}`,
                    method: 'GET'
                };
                const res: any = await Utils.requestDataHelper(global.context, option, 'porting');
                const panelOption = {
                    message: {
                        cbid: new Date().getTime(),
                        cmd: 'navigate',
                        report: resp.data.id,
                        data: {
                            page: '/reportDetail',
                            pageParams: {queryParams: {response: JSON.stringify(res), report: resp.data.id, name: ''}},
                            webSession: global.context.globalState.get('porting' + 'Session')
                        }
                    },
                    module: 'porting',
                    panelId: resp.data.id,
                    viewType: 'report',
                    viewTitle: Utils.formatCreatedId(resp.data.id)
                };
                ToolPanelManager.createOrShowPanel(panelOption, global.context);
            }
        });
    },
    /**
     * 当报告被锁定时，右下弹框
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息}
     */
    async showLockBox(global: any, message: any) {
      vscode.window.showWarningMessage(message.data.info, i18n.plugins_common_view_report).then((select) => {
        if (select === i18n.plugins_common_view_report) {
            const msgData = {
              data: {
                  cmd: 'openNewPage',
                  router: 'enchanceReport',
                  panelId: message.data.taskId,
                  viewTitle: i18n.plugins_common_tips_weak,
                  message: {
                      taskId: message.data.taskId,
                      taskType: message.data.taskType,
                      resp: JSON.stringify(message.data.resp)
                  }
              },
              module: message.module
            };
            this.openNewPage(global, msgData);
        }
    });
    },

    /**
     * 源码迁移进度条
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{data: {reportId: 任务id, status: 创建任务返回的状态码}}
     */
    analsysProgress(global: any, message: { data: { reportId: string, status: string } }) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '',
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消源码迁移
            token.onCancellationRequested(() =>
                vscode.window
                  .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                    { 0: i18n.plugins_porting_code_label }),
                    i18n.confirm_button, i18n.cancel_button).then(async select => {
                        // 确认取消正在进行的源码迁移
                        if (select === i18n.confirm_button) {
                            CancelTaskUtils.delSourceCodeTask(global, message);
                            return;
                        } else {
                            messageHandler.analsysProgress(global, message);
                        }
                    }));
            await Progress.getSourceAnaReport(global, message, progress, 0);
        });
    },

    /**
     * 上传任务等待中
     * @param global 全局上下文
     * @param message 消息内容message
     */
  waitingUploadTask(global: any, message: any) {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: '',
      cancellable: true
    }, async (progress, token) => {
      // 是否确认取消源码迁移
      token.onCancellationRequested(() =>
        vscode.window.showInformationMessage(
          I18nService.I18nReplace(
            i18n.plugins_porting_close_task_confirm_tip,
            { 0: '' }
          ),
          i18n.confirm_button, i18n.cancel_button
        ).then(async select => {
            // 确认取消正在的等待的任务
            if (select === i18n.confirm_button) {
              global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: '', cbid: message.cbid });
              return;
            } else {
              messageHandler.waitingUploadTask(global, message);
            }
          })
      );
      await Progress.getWaitingUploadTask(global, message, progress, token);
    });
  },

    /**
     * 64位运行模式检查进度条
     * @param global 全局上下文
     * @param message 消息内容message: {data: {taskId: 任务id}
     */
    bit64Progress(global: any, message: { data: { taskId: string } }, stopObj?: any) {
        const stopFlagObj = stopObj || { stopFlag: false };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '',
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消源码迁移
            token.onCancellationRequested(() =>
                vscode.window
                  .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                    { 0: i18n.plugins_porting_precheck_label }),
                    i18n.confirm_button, i18n.cancel_button).then(async select => {
                        // 确认取消正在进行的源码迁移
                        if (select === i18n.confirm_button) {
                            CancelTaskUtils.delBit64AlignTask(global, message, stopFlagObj);
                            return;
                        } else {
                            messageHandler.bit64Progress(global, message, stopFlagObj);
                        }
                    }));
            await Progress.getBit64Progress(global, message, progress, stopFlagObj);
        });
    },

    /**
     * 缓存行检查进度条
     * @param global 全局上下文
     * @param message 消息内容message: {data: {taskId: 任务id}
     */
    cacheLineProgress(global: any, message: { data: { taskId: string } }, stopObj?: any) {
        const stopFlagObj = stopObj || { stopFlag: false };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '',
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消源码迁移
            token.onCancellationRequested(() =>
                vscode.window
                    .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                            { 0: i18n.plugins_common_cacheline_check.title }),
                        i18n.confirm_button, i18n.cancel_button).then(async select => {
                    // 确认取消正在进行的源码迁移
                    if (select === i18n.confirm_button) {
                        CancelTaskUtils.delCacheLineTask(global, message, stopFlagObj);
                        return;
                    } else {
                        messageHandler.cacheLineProgress(global, message, stopFlagObj);
                    }
                }));
            await Progress.getCacheLineProgress(global, message, progress, stopFlagObj);
        });
    },

    /**
     * 字节对齐进度条
     * @param global 全局上下文
     * @param message 消息内容message: {data: {taskId: 任务id, status: 创建任务返回的状态码}
     */
    byteAlignProgress(global: any, message: { data: { taskId: string, status: string } }, stopObj?: any) {
        const stopFlagObj = stopObj || { stopFlag: false };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '',
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消源码迁移
            token.onCancellationRequested(() =>
                vscode.window
                  .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                    { 0: i18n.plugins_porting_enhance_function_byte_align_task }),
                    i18n.confirm_button, i18n.cancel_button).then(async select => {
                        // 确认取消正在进行的源码迁移
                        if (select === i18n.confirm_button) {
                            CancelTaskUtils.delByteAlignTask(global, message, stopFlagObj);
                            return;
                        } else {
                            messageHandler.byteAlignProgress(global, message, stopFlagObj);
                        }
                    }));
            await Progress.getByteAlignProgress(global, message, progress, 0, stopFlagObj);
        });
    },

    /**
     * 压缩日志进度条
     * @param global 全局上下文
     * @param message 消息内容message: {data: {reportId: 文件名, taskId：任务id}
     */
     compressLogTask(global: any, message: any, stopObj?: any) {
        const stopFlagObj = stopObj || { stopFlag: false };

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: I18nService.I18n().log_compress_running,
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消压缩日志任务
            token.onCancellationRequested(() =>
                vscode.window
                  .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                    { 0: i18n.log_compress }),
                    i18n.confirm_button, i18n.cancel_button).then(async select => {
                        // 确认取消正在进行的压缩日志任务
                        if (select === i18n.confirm_button) {
                            CancelTaskUtils.delCompressLogTask(global, message, stopFlagObj);
                            return;
                        } else {
                            messageHandler.compressLogTask(global, message, stopFlagObj);
                        }
                    }));
            await Progress.getCompressLogProgress(global, message, progress, stopFlagObj);
        });
    },

    /**
     * 内存一致性进度条
     * @param global 全局上下文
     * @param message 消息内容
     */
    weakCheckProgress(global: any, message: any, stopObj?: any) {
        const stopFlagObj = stopObj || { stopFlag: false };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '',
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消任务
            token.onCancellationRequested(() =>
                vscode.window
                  .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                    { 0: i18n.plugins_porting_code_label }),
                    i18n.confirm_button, i18n.cancel_button).then(async select => {
                        // 确认取消正在进行的任务
                        if (select === i18n.confirm_button) {
                            CancelTaskUtils.delWeakCheckTask(global, message, stopFlagObj);
                            return;
                        } else {
                            messageHandler.weakCheckProgress(global, message, stopFlagObj);
                        }
                    }));
            await Progress.getWeakCheckProgress(global, message, progress, 0, stopFlagObj);
        });
    },
    /**
     * 内存一致性bc进度条
     * @param global 全局上下文
     * @param message 消息内容
     */
    bcCheckProgress(global: any, message: any, stopObj?: any) {
        const stopFlagObj = stopObj || { stopFlag: false };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: I18nService.I18n().plugins_porting_enhance_function_weak_check_processing_tip,
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消任务
            token.onCancellationRequested(() =>
                vscode.window
                  .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                    { 0: i18n.plugins_porting_code_label }),
                    i18n.confirm_button, i18n.cancel_button).then(async select => {
                        // 确认取消正在进行的任务
                        if (select === i18n.confirm_button) {
                            CancelTaskUtils.delBcCheckTask(global, message, stopFlagObj);
                            return;
                        } else {
                            messageHandler.bcCheckProgress(global, message, stopFlagObj);
                        }
                    }));
            await Progress.getBcCheckProgress(global, message, progress, 0, stopFlagObj);
        });
    },

    /**
     * 内存一致性编译文件进度条
     * @param global 全局上下文
     * @param message 消息内容
     */
    weakCompileProgress(global: any, message: any, stopObj?: any) {
        const stopFlagObj = stopObj || { stopFlag: false };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '',
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消任务
            token.onCancellationRequested(() =>
                vscode.window
                  .showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_close_task_confirm_tip,
                    { 0: i18n.plugins_porting_weak_check_compile_file_task }),
                    i18n.confirm_button, i18n.cancel_button).then(async select => {
                        // 确认取消正在进行的任务
                        if (select === i18n.confirm_button) {
                            CancelTaskUtils.delWeakCompileTask(global, message, stopFlagObj);
                            return;
                        } else {
                            messageHandler.weakCompileProgress(global, message, stopFlagObj);
                        }
                    }));
            await Progress.getWeakCompileProgress(global, message, progress, 0, stopFlagObj);
        });
    },

    /**
     * 软件包构建消息处理
     * @param global 全局上下文
     * @param message 消息内容
     */
    analysisProcess(global: any, message: any) {
        AnalysisUtil.dispathMessage(global, message);
    },

    /**
     * 右键源码表头设置
     * @param global 全局上下文
     * @param message 消息内容
     */
    panelCheckFile(global: any, message: any) {
        const option = { module: message.module };
        global.toolPanel.setPanelId(constant.PANEL_ID.portCheckFile);
        ToolPanelManager.updatePanel(global.toolPanel, global.context, option);
    },
    /**
     * 右键源码表头设置
     * @param global 全局上下文
     * @param message 消息内容
     */
    panelCheckFileAffinity(global: any, message: any) {
        const option = {
            module: message.module,
            type: 'Affinity'
        };
        global.toolPanel.setPanelId(constant.PANEL_ID.portPreCheck);
        ToolPanelManager.updatePanel(global.toolPanel, global.context, option);
    },
    /**
     * 显示磁盘通知信息
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    showDiskMessage(global: any, message: any) {
        if (message.data.workRemain < constant.THRESHOLD_VALUE || message.data.diskRemain < constant.THRESHOLD_VALUE) {
            vscode.window.showErrorMessage(message.data.content);
        } else {
            vscode.window.showInformationMessage(message.data.content);
        }
    },

    /**
     * 显示磁盘警报通知信息
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    showDiskAlertMessage(global: any, message: any) {
        vscode.window.showErrorMessage(message.data);
    },

    /**
     * 文件上传公共接口
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */

    async uploadProcess(global: any, message: any) {
        // 从右键打开的源码迁移，请求数据需要构造
        if (message.data.fromVScode) {
            const filePath = message.data.filePath;
            message.data.fileSize = Utils.getDirSize(filePath);
            message.data.filePath = path.basename(filePath);
            const files: any[] = [];

            if (message.data.isSingle === 'true') {
                Utils.buildFileArr(filePath, message.data.filePath + '/', files, message.data.fileName);
            } else {
                Utils.buildFileArr(filePath, message.data.filePath + '/', files);
            }
            message.data.fileList = files;
        }

        const data: any = await UploadUtil.uploadProgress(global.context, message);
        message.cmd = 'getData';
        Utils.invokeCallback(global.toolPanel.panel, message, data);
    },

    closePanel(global: any, message: any) {
        ToolPanelManager.closePanel(global.toolPanel.getPanelId(), message.module);
    },

    /**
     * 依赖字典管理进度条
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    async whitelistManagementProcess(global: any, message: any) {
        Progress.whitelistManagementProcess(global, message);
    },

    /**
     * 查看源码建议操作
     */
    async codeSuggestingOpt(global: any, message: any) {
        // 注册文件事件监听器
        await CodeSuggestViewHandler.createOnDidEventListener();
        // 文件名后缀
        const languageDef = message.data.filepath.slice(message.data.filepath.lastIndexOf('.') + 1);
        const option = {
            url: message.data.url,
            params: {
                filepath: message.data.remoteFilePath
            }
        };
        CodeSuggestViewHandler.context = global.context;
        const resp: any = await Utils.requestData(global.context, option, constant.TOOL_NAME_PORTING);
        resp.data.data.portingitems.sort((a: any, b: any) => {
            if (a.locbegin < b.locbegin) {
                return -1;
            } else if (a.locbegin > b.locbegin) {
                return 1;
            } else {
                return 0;
            }
        });
        const documentContent = {
            content: resp.data.data?.content,
            suggestion: resp.data.data.portingitems,
            language: languageDef,
            lines: resp.data.data.line,
            fileType: message.data.fileType,
            localFilePath: message.data.filepath ? message.data.filepath : '',
        };

        // 判断文件是否已经打开
        let isOpened = false;
        for (const key of Object.keys(CodeSuggestViewHandler.activateDocuments)) {
            if (CodeSuggestViewHandler.activateDocuments[key]?.remoteFilePath === message.data.remoteFilePath) {
                const config = Utils.getConfigJson(global.context);
                if (!config.showPortingAlert) {
                    vscode.window.showWarningMessage(i18n.plugins_porting_modified_warning,
                        i18n.plugins_common_nomore_alert).then((select) => {
                            if (select === i18n.plugins_common_nomore_alert) {
                                config.showPortingAlert = true;
                                const resourcePath =
                                  Utils.getExtensionFileAbsolutePath(global.context,
                                    'src/extension/assets/config.json');
                                const data = fs.writeFileSync(resourcePath, JSON.stringify(config));
                            }
                        });
                }

                const textEditor =
                  await vscode.window.showTextDocument(CodeSuggestViewHandler.activateDocuments[key].document,
                    { preview: true, viewColumn: 1 });
                initReportEditorSecond(global.context,
                  resp.data.data.portingitems,
                  documentContent,
                  textEditor.document);
                isOpened = true;
            }
        }
        if (!isOpened) {
            initReportEditor(global.context, {
                content: resp.data.data?.content,
                suggestion: resp.data.data.portingitems,
                language: languageDef,
                lines: resp.data.data.line,
                fileType: message.data.fileType,
                localFilePath: message.data.filepath ? message.data.filepath : '',
            }, message.data.remoteFilePath, message.data.reportId);
        }

        if (!CodeActionProviders.isregisterCodeSugCommands) {
            CodeActionProviders.registerCodeSugCommands(global.context);
        }

    },

    /**
     * 打开64位迁移预检报告
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    async createPortCheckTree(global: any, message: any) {
        // 将64位预检报告id保存到全局变量
        const preCheckId = message.data.id;
        global.context.globalState.update('preCheckId', message.data.id);
        global.context.globalState.update('byteCheckId', null);
        global.context.globalState.update('cacheCheckId', null);

        if (message.data.remoteFilePath) {
            const openedFiles = global.context.globalState.get('enhanceOpenedFiles') || [];
            const isExist = openedFiles.find((file: any) => {
                return file === message.data.remoteFilePath;
            });
            // 不存在会返回undefined, 则添加此路径
            if (isExist === undefined) {
                openedFiles.push(message.data.remoteFilePath);
                global.context.globalState.update('enhanceOpenedFiles', openedFiles);
            }

            CodeSuggestViewHandler.context = global.context;
            const fileInfo: any = await PreCheckHelper.createFile(message.data.remoteFilePath,
                preCheckId, global.context);
            // 默认打开第一个文件
            const eventListeners = await CodeSuggestViewHandler.createOnDidEventListener();
            const documentContent = {
                content: fileInfo.oldString,
                suggestion: fileInfo.diffList,
                lines: '',
                localFilePath: message.data.filePath ? message.data.filePath : '',
            };
            // 判断文件是否已经打开
            let isOpened = false;
            for (const key of Object.keys(CodeSuggestViewHandler.activateDocuments)) {
                if (CodeSuggestViewHandler.activateDocuments[key]?.remoteFilePath === message.data.remoteFilePath) {
                    const config = Utils.getConfigJson(global.context);
                    if (!config.showPortingAlert) {
                        vscode.window.showWarningMessage(i18n.plugins_porting_modified_warning,
                            i18n.plugins_common_nomore_alert).then((select) => {
                            if (select === i18n.plugins_common_nomore_alert) {
                                config.showPortingAlert = true;
                                const resourcePath =
                                    Utils.getExtensionFileAbsolutePath(global.context,
                                        'src/extension/assets/config.json');
                                const data = fs.writeFileSync(resourcePath, JSON.stringify(config));
                            }
                        });
                    }

                    const textEditor =
                        await vscode.window.showTextDocument(CodeSuggestViewHandler.activateDocuments[key].document,
                            { preview: true, viewColumn: 1 });
                    initReportEditorSecond(global.context,
                        fileInfo.data.data.portingitems,
                        documentContent,
                        textEditor.document);
                    isOpened = true;
                }
            }

            initReportEditor(global.context, {
                content: fileInfo.oldString,
                suggestion: fileInfo.diffList,
                fileType: 'C/C++ Source File',
                language: 'c',
                lines: '',
                localFilePath: message.data.filePath ? message.data.filePath : ''
            }, message.data.remoteFilePath, preCheckId);

            if (!CodeActionProviders.isregisterCodeSugCommands) {
                CodeActionProviders.registerCodeSugCommands(global.context);
            }
        }
    },

    /**
     * 打开缓存行对齐报告
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    async createCacheCheckTree(global: any, message: any) {
        // 将缓存行对齐报告id保存到全局变量
        const cacheCheckId = message.data.id;
        global.context.globalState.update('cacheCheckId', message.data.id);
        global.context.globalState.update('preCheckId', null);
        global.context.globalState.update('byteCheckId', null);

        if (message.data.remoteFilePath) {
            const openedFiles = global.context.globalState.get('enhanceOpenedFiles') || [];
            const isExist = openedFiles.find((file: any) => {
                return file === message.data.remoteFilePath;
            });
            // 不存在会返回undefined, 则添加此路径
            if (isExist === undefined) {
                openedFiles.push(message.data.remoteFilePath);
                global.context.globalState.update('enhanceOpenedFiles', openedFiles);
            }

            CodeSuggestViewHandler.context = global.context;
            const fileInfo: any = await PreCheckHelper.createFile(message.data.remoteFilePath,
                cacheCheckId, global.context, 'cacheCheck');
            // 默认打开第一个文件
            const eventListeners = await CodeSuggestViewHandler.createOnDidEventListener();
            const documentContent = {
                content: fileInfo.oldString,
                suggestion: fileInfo.diffList,
                lines: '',
                localFilePath: message.data.filePath ? message.data.filePath : '',
            };
            // 判断文件是否已经打开
            let isOpened = false;
            for (const key of Object.keys(CodeSuggestViewHandler.activateDocuments)) {
                if (CodeSuggestViewHandler.activateDocuments[key]?.remoteFilePath === message.data.remoteFilePath) {
                    const config = Utils.getConfigJson(global.context);
                    if (!config.showPortingAlert) {
                        vscode.window.showWarningMessage(i18n.plugins_porting_modified_warning,
                            i18n.plugins_common_nomore_alert).then((select) => {
                            if (select === i18n.plugins_common_nomore_alert) {
                                config.showPortingAlert = true;
                                const resourcePath =
                                    Utils.getExtensionFileAbsolutePath(global.context,
                                        'src/extension/assets/config.json');
                                const data = fs.writeFileSync(resourcePath, JSON.stringify(config));
                            }
                        });
                    }

                    const textEditor =
                        await vscode.window.showTextDocument(CodeSuggestViewHandler.activateDocuments[key].document,
                            { preview: true, viewColumn: 1 });
                    initReportEditorSecond(global.context,
                        fileInfo.data.data.portingitems,
                        documentContent,
                        textEditor.document);
                    isOpened = true;
                }
            }

            initReportEditor(global.context, {
                content: fileInfo.oldString,
                suggestion: fileInfo.diffList,
                fileType: 'C/C++ Source File',
                language: 'c',
                lines: '',
                localFilePath: message.data.filePath ? message.data.filePath : '',
            }, message.data.remoteFilePath, cacheCheckId);

            if (!CodeActionProviders.isregisterCodeSugCommands) {
                CodeActionProviders.registerCodeSugCommands(global.context);
            }
        }
    },

    /**
     * 打开内存一致性检查报告
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    async openWeakReport(global: any, message: any) {
        // 将内存一致性检查报告id保存到全局变量
        const taskId = message.data.id;
        global.context.globalState.update('preCheckId', null);
        global.context.globalState.update('byteCheckId', null);
        global.context.globalState.update('cacheCheckId', null);

        if (message.data.remoteFilePath) {
            const openedFiles = global.context.globalState.get('enhanceOpenedFiles') || [];
            const isExist = openedFiles.find((file: any) => {
                return file === message.data.remoteFilePath;
            });

            // 不存在会返回undefined, 则添加此路径
            if (isExist === undefined) {
                openedFiles.push(message.data.remoteFilePath);
                global.context.globalState.update('enhanceOpenedFiles', openedFiles);
            }

            CodeSuggestViewHandler.context = global.context;
            const fileInfo: any = await PreCheckHelper.createFile(message.data.remoteFilePath,
                taskId, global.context, 'weakCheck');
            // 默认打开第一个文件
            const eventListeners = await CodeSuggestViewHandler.createOnDidEventListener();
            const documentContent = {
                content: fileInfo.oldString,
                suggestion: fileInfo.diffList,
                lines: '',
                localFilePath: message.data.filePath ? message.data.filePath : '',
            };
            // 判断文件是否已经打开
            let isOpened = false;
            for (const key of Object.keys(CodeSuggestViewHandler.activateDocuments)) {
                if (CodeSuggestViewHandler.activateDocuments[key]?.remoteFilePath === message.data.remoteFilePath) {
                    const config = Utils.getConfigJson(global.context);
                    if (!config.showPortingAlert) {
                        vscode.window.showWarningMessage(i18n.plugins_porting_modified_warning,
                            i18n.plugins_common_nomore_alert).then((select) => {
                            if (select === i18n.plugins_common_nomore_alert) {
                                config.showPortingAlert = true;
                                const resourcePath =
                                    Utils.getExtensionFileAbsolutePath(global.context,
                                        'src/extension/assets/config.json');
                                const data = fs.writeFileSync(resourcePath, JSON.stringify(config));
                            }
                        });
                    }

                    const textEditor =
                        await vscode.window.showTextDocument(CodeSuggestViewHandler.activateDocuments[key].document,
                            { preview: true, viewColumn: 1 });
                    initReportEditorSecond(global.context,
                        fileInfo.data.data.portingitems,
                        documentContent,
                        textEditor.document);
                    isOpened = true;
                }
            }

            initReportEditor(global.context, {
                content: fileInfo.oldString,
                suggestion: fileInfo.diffList,
                fileType: 'C/C++ Source File',
                language: 'c',
                lines: '',
                localFilePath: message.data.filePath ? message.data.filePath : ''
            }, message.data.remoteFilePath, taskId);

            if (!CodeActionProviders.isregisterCodeSugCommands) {
                CodeActionProviders.registerCodeSugCommands(global.context);
            }
        }
    },

    /**
     * 增强功能从报告页返回任务创建页面，需要清除报告打开的详情页面和编辑器，以及清除对应的临时文件，状态等
     * @param global 插件上下文，以及当前的panel
     * @param message 插件上下文，以及当前的panel
     */
    clearEnhanceReport(global: any, message: any) {
        // 关闭打开的报告 (字节对齐报告webview)
        const closePanels = [];
        for (const item of ToolPanelManager.portToolPanels) {
            if (item.getPanelId().indexOf('enhance') > -1) {
                closePanels.push(item.getPanelId());
            }
        }

        if (closePanels.length > 0) {
            ToolPanelManager.closePanel(closePanels, constant.TOOL_NAME_PORTING);
        }

        // 关闭打开的64位预检编辑器tab
        const openedFiles: any = global.context.globalState.get('enhanceOpenedFiles') || [];
        const reportId = message.data.taskId;
        if (openedFiles.length > 0 && reportId) {
            const textEditorArr = vscode.window.visibleTextEditors;
            for (const filePath of openedFiles) {
                const workFilePath = Utils.getExtensionFileAbsolutePath(global.context,
                    'resources/worksources/' + reportId + filePath);
                const textEditor = textEditorArr.find((item: any) => item.filePath = workFilePath);
                // hide 函数下个版本不能用
                if (textEditor) {
                    try {
                        (textEditor as any).hide();
                    } catch {
                        LogManager.log(global.context, 'vscode\'s TextEditor is deprecated,\
                            Use the command`workbench.action.closeActiveEditor` instead',
                          constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
                    }
                }

                // 删除临时文件
                fs.unlink(workFilePath, (error: any) => {
                    // 日志打印只能打印相对路径，不能打印绝对路径
                    LogManager.log(global.context, 'delete file failed, file is: ' + reportId + filePath,
                        constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
                });
            }
        }

        // 清除状态
        global.context.globalState.update('preCheckId', null);
        global.context.globalState.update('byteCheckId', null);
        global.context.globalState.update('cacheCheckId', null);
        global.context.globalState.update('enhanceOpenedFiles', []);
    },

    /**
     * 重复上传软件迁移模板弹框
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    async uploadMigrateFile(global: any, message: any) {
        vscode.window.showWarningMessage(
            message.data.info, i18n.confirm_button, i18n.cancel_button)
            .then(async select => {
                if (select === i18n.confirm_button) {
                    Utils.invokeCallback(global.toolPanel.panel, message, { status: constant.STATUS_SUCCESS });
                }
            });
    },

    /**
     * 上传右键迁移预检文件
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    async uploadPortingFile(global: any, message: any) {
        global.context.globalState.update('rightPorting', false);
        global.toolPanel.getPanel().onDidDispose(() => { global.context.globalState.update('rightPorting', null); });
        const filePath = message.data.filePath;
        const filename = path.basename(filePath);
        let tempScanType = '0';
        // 适配亲和性检查
        if (message.data.scan_type !== undefined) {
            tempScanType = message.data.scan_type;
        }
        // 检查文件是否已存在
        const params = {
            file_size: Utils.getDirSize(filePath),
            file_name: filename + '.zip',
            need_unzip: 'true',
            scan_type: tempScanType,
            choice: 'override',
        };
        const option = {
            url: '/portadv/tasks/check_upload/',
            method: 'POST',
            subModule: 'porting',
            params
        };
        const res: any = await Utils.requestData(global.context, option, 'porting');
        Utils.invokeCallback(global.toolPanel.panel, message, res);
    },

    /**
     * 隐藏terminal
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    hideTerminal(global: any, message: any) {
        vscode.window.activeTerminal?.hide();
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
     * 判断是否登录
     * @param global: 插件上下文，以及当前的panel
     * @param message: 来自webview的消息内容
     */
    async isLogin(global: any, message: any) {
        const flag = Utils.isPortLogin(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, flag);
    },

    /**
     * 获取arm安装包路径
     */
    getArmUrl(global: any): any {
        return Utils.getConfigJson(global.context).pkg_url[0].arm;
    },

    /**
     * 获取x86安装包路径
     */
    getX86Url(global: any): any {
        return Utils.getConfigJson(global.context).pkg_url[0].x86;
    },

    /**
     * 获取KEY路径
     */
    getKeyUrl(global: any): any {
        return Utils.getConfigJson(global.context).pkg_url[0].key;
    },

    getCurrentAppName(global: any, message: any) {
        message.cmd = 'callbackProcess';
        Utils.invokeCallback(global.toolPanel.panel, message, vscode.env.appName);
    },

    async cloudIDEupload(global: any, message: any) {
        vscode.commands.getCommands().then(commands => {
            if (commands.includes('cloudide.showUploadDialog')) {
                vscode.commands.executeCommand(
                    'cloudide.showUploadDialog',
                    { defaultUri: vscode.Uri.parse('/home/user/temp') }
                ).then((result: any) => {
                    const filePathList: Array<string> = result.map((item: any) => (item.path));
                    message.cmd = 'callbackProcess';
                    Utils.invokeCallback(global.toolPanel.panel, message, Utils.getFileProps(...filePathList));
                });
            } else {
                vscode.window.showErrorMessage('command "cloudide.showUploadDialog" not found');
            }
        });
    },

    /**
     * worker为0消息提示
     * @param global 上下文
     * @param message webview消息体{data: {type: 消息类型}
     */
    showMessageByWorker(global: any, message: {data: {type: string}}) {
        AnalysisUtil.showWorkerTip(global.context, message.data.type);
    },

    /**
     * 文本消息弹框
     * @param global 上下文
     * @param message webview消息体{data: {type: 消息类型, string: 消息内容}}
     */
    showTextMsg(global: any, message: {data: { type: string, msg: string}}) {
        const {type, msg} = message.data;
        if (type === 'error') {
            vscode.window.showErrorMessage(msg);
        } else if (type === 'warn') {
            vscode.window.showWarningMessage(msg);
        } else {
            vscode.window.showInformationMessage(msg);
        }
    }
};

function handleTerminalException(terminal: vscode.Terminal, ssh2Tools: SSH2Tools,
                                 fileList: Array<string>, log: (data: string) => void, callback: any) {

    const handleException = async () => {
        clearInterval(terminalStatusInterval);
        if (terminalCloseEvent) { terminalCloseEvent.dispose(); }
        // 非正常退出时才做处理
        if (ssh2Tools.status === 'connected') {
            let results: any;
            try {
                results = await ssh2Tools.clear(fileList, 3);
            } catch (err) {
                results = fileList.map(item => ({ item, error: 'sftp connected failed' }));
            }
            results.forEach((result: any) => {
                log(result.filePath + ': ' + result.error || 'success');
            });
            callback('terminal exception failed');
        }
    };

    let sshIsStart = false;
    clearInterval(terminalStatusInterval);
    if (terminalCloseEvent) { terminalCloseEvent.dispose(); }
    terminalStatusInterval = setInterval(() => {
        if (terminal.name === 'ssh') { sshIsStart = true; }
        if (sshIsStart && terminal.name !== 'ssh') {
            handleException();
        }
    }, 100);
    terminalCloseEvent = vscode.window.onDidCloseTerminal(async t => {
        const currProcessId = await t.processId;
        const processId = await terminal.processId;
        if (currProcessId === processId) {
            handleException();
        }
    });

}
