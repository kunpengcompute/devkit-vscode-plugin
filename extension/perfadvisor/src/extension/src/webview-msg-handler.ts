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
import { PerfMenu } from './toolmenu/perf-menu';
import { TaskHelper } from './helper/task-helper';
import { DiagnoseTaskHelper } from './helper/diagnose/task-helper';
import { I18nService } from './i18nservice';
import { ToolPanelManager } from './panel-manager';
import { SSH2Tools } from './ssh2tools';
import { LogManager, LOG_LEVEL } from './log-manager';

const fs = require('fs');
const path = require('path');
import { Utils } from './utils';
import { LoginManager } from './login-manager';
import { PerfHelper } from './helper/perf-helper';
import { ErrorHelper } from './error-helper';
import { clearInterval, setInterval } from 'timers';
import JavaperfRecordManage from './javaperf-record-manage';
import JavaperfReportManage from './javaperf-report-manage';
import { getPwd } from './crypto';
import { TuningAssistantPerfHelper } from './helper/tuningAssistant/tuning-assistant-helper';
import { OPEN_NEWPAGE_MGS_TYPE } from './constant';
import { DiagnoseCommandCallback } from './command-callback/diagnose';
import { TuningAssistantCommandCallback } from './command-callback/tuning-assistant';

const i18n = I18nService.I18n();
let terminalStatusInterval: any;
let terminalCloseEvent: any;
// 定时器map，用前销毁上一次
const intervalMap: any = {};

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
export const messageHandler = {

    async getData(global: any, message: any, modelu: string) {
        /**
         * message example:
         * cbid:1591436984731
         * cmd:'getData'
         * data:Object {method: 'POST', params: Object, url: '/users/login/'}
         * module:'porting'
         */
        const resp: any = await Utils.requestData(global.context, message.data, message.module);
        // 新建任务接口失败时返回400，创建同名任务时返回409,磁盘告警507
        if (resp.status === constant.HTTP_STATUS.HTTP_200_OK
            || resp.status === constant.HTTP_STATUS.HTTP_400_BAD_REQUEST
            || resp.status === constant.HTTP_STATUS.HTTP_409_CONFLICT
            || resp.status === constant.HTTP_STATUS.HTTP_507_SERVERERROR
            || resp.status === constant.HTTP_STATUS.HTTP_408_REQUEST_TIMEOUT ) {
            Utils.invokeCallback(global.toolPanel.panel, message, resp.data);
        } else {
            resp.data = {};
        }
    },

    /**
     * 获取全局变量
     */
    async getGlobalValue(global: any, message: any) {
        const flag = Utils.getGlobalValue(global.context, message.data.key);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, flag);
    },

    /**
     * 设置全局变量
     */
    async setGlobalValue(global: any, message: any) {
        Utils.setGlobalValue(global.context, message.data.key, message.data.value);
    },

    /**
     * perfadvisor登录成功之后需要刷新左侧树和更新panel信息
     * view上的按钮从隐藏变成可见
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    async loginSuccess(global: any, message: any) {
        // 定时器信号量
        let intervalLoginFlag = true;
        await Utils.setTreeUpdataSuccess(false);
        if (intervalMap.loginSuccess) {
            clearInterval(intervalMap.loginSuccess);
        }
        await LoginManager.loginInSuccess(global.context);

        // 更新panel信息
        const option = {
            module: message.module
        };

        // 将除当前panel之外的其他的panel全部掉
        ToolPanelManager.closePanelsByRemained(message.module, new Array<string>(global.toolPanel.getPanelId()));

        message.cmd = 'getData';
        intervalMap.loginSuccess = setInterval(async () => {
            if (Utils.getTreeUpdataSuccess() && intervalLoginFlag) {
                Utils.invokeCallback(global.toolPanel.panel, message, null);
                await Utils.setTreeUpdataSuccess(false);
                intervalLoginFlag = false;
                clearInterval(intervalMap.loginSuccess);
            }
        }, 500);
    },

    // 操作任务成功刷新树
    async optTaskSuccess(global: any, message: any) {

        if (constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR === message.module ||
            constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR === message.module) {

            // 新建任务
            if (message.data && message.data.type === 'confirm') {
                // 刷新左侧树
                PerfMenu.updataTree(global.context);
                // 关闭已打开的任务结果页panel
                const newPanelId = message.data.task.title;
                const alreadyExistPanelId = ToolPanelManager.sysPerfToolPanels.find(item => {
                    const oldPanelId = item.getPanelId();
                    return newPanelId === oldPanelId;
                });
                if (alreadyExistPanelId) {
                    ToolPanelManager.closePanel([alreadyExistPanelId.getPanelId()], constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
                }
                global.toolPanel.setPanelId(newPanelId);
                global.toolPanel.getPanel().title = newPanelId;
            } else {
                ToolPanelManager.closePanel(new Array<string>(global.toolPanel.getPanelId()), message.module);
            }
        }
    },

    // 创建工程成功，更新panel标题
    async optProjectSuccess(global: any, message: any) {
        // 刷新左侧树
        PerfMenu.updataTree(global.context);
        global.toolPanel.getPanel().title = message.data.project.title;
    },

    // 检查ssh连接是否通畅
    async checkConn(global: any, message: any) {
        const pluginUrlCfg = Utils.getURLConfigJson(global.context);
        const username = message.data.username;
        if (username.toLocaleLowerCase() === 'root') {
            const resp = await vscode.window.showInformationMessage(
                i18n.plugins_common_tips_checkConn_root,
                { modal: true },
                i18n.plugins_common_tips_checkConn_openFAQ,
                i18n.plugins_sysperf_button_confirm
            );
            if (resp === i18n.plugins_common_tips_checkConn_openFAQ) {
                const faq = vscode.Uri.parse(pluginUrlCfg.checkConn_openFAQ1);
                vscode.commands.executeCommand('vscode.open', faq);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            } else if (resp !== i18n.plugins_sysperf_button_confirm) {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            }
        } else {
            const resp = await vscode.window.showInformationMessage(
                i18n.plugins_common_tips_checkConn_noroot.replace(/\{0\}/g, username),
                { modal: true },
                i18n.plugins_common_tips_checkConn_openFAQ,
                i18n.plugins_sysperf_button_confirm
            );
            if (resp === i18n.plugins_common_tips_checkConn_openFAQ) {
                const faq = vscode.Uri.parse(pluginUrlCfg.checkConn_openFAQ2);
                vscode.commands.executeCommand('vscode.open', faq);
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            } else if (resp !== i18n.plugins_sysperf_button_confirm) {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
                return;
            }
        }

        const ssh2Tools = new SSH2Tools();
        const sshCheckResult = await ssh2Tools.sshClientCheck();
        if (!sshCheckResult) {
            Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: i18n.plugins_common_message_sshClientCheck }, true);
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
                    ErrorHelper.errorHandler(global.context, message.module, data.message, server.host);
                } else if (data.message.search(/no matching/) !== -1) {
                    vscode.window.showErrorMessage(i18n.plugins_common_message_sshAlgError);
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
        if (message.data.type === 'auto') {
            const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
            data = fs.writeFileSync(resourcePath, message.data.data);
            global.context.globalState.update('autoLoginUser', null);
            global.context.globalState.update('autoRememberConfig', null);
            global.context.globalState.update('autoLoginConfig', null);
            const json = Utils.getConfigJson(global.context);
            if (json.autoLoginConfig.length > 0) {
                global.context.globalState.update('autoLoginUser', json.autoLoginConfig[0].user);
                global.context.globalState.update('autoRememberConfig', json.autoLoginConfig[0].remember);
                global.context.globalState.update('autoLoginConfig', json.autoLoginConfig[0].auto);
            }
            if (message.data.pwd) {
                const param = {
                    username: json.autoLoginConfig[0].user,
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
            global.context.globalState.update('closeShowErrorMessage', false);

            const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
            data = fs.writeFileSync(resourcePath, message.data.data);
        }
        if (message.data.disclaimeSave) {
            if (message.module === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {
                global.context.globalState.update(constant.PORT_DESCLAIMER_CONF, true);
            }
            return;
        }
        if (message.data.disclaimeCancel) {
            if (message.module === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {
                global.context.globalState.update(constant.PORT_DESCLAIMER_CONF, false);
            }
            return;
        }

        // 清空session缓存,并将新的配置更新到session中
        Utils.initVscodeCache(global.context);
        PerfMenu.deleteTimedUpdataTree();
        // 通过调用首次登陆接口判断修改的IP和端口是否可正常访问
        const queryOptions = {
            url: '/users/admin-status/',
            method: 'GET',
            subModule: 'userManagement'
        };
        const resp: any = await Utils.requestData(global.context, queryOptions as any, message.module);
        if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
            // 刷新左侧登录按钮
            vscode.commands.executeCommand('setContext', 'isPerfadvisorLogined', false);
            vscode.commands.executeCommand('setContext', 'ipconfig', false);
            vscode.commands.executeCommand('setContext', 'isPerfadvisorConfigured', true);
        } else {
            // 刷新左侧树至配置服务器状态
            vscode.commands.executeCommand('setContext', 'ipconfig', true);
            vscode.commands.executeCommand('setContext', 'isPerfadvisorConfigured', false);
        }
        PerfMenu.getInstance().refresh();

        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
        // 拉起vscode弹出框提示
        if (message.data.showInfoBox && resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
            LogManager.log(global.context, 'Save Config Invalid certificate' + message.data.selected, message.module, LOG_LEVEL.ERROR);
            vscode.window.showInformationMessage(i18n.plugins_common_message_configSuccess,
                i18n.plugins_common_button_login).then((select) => {
                    const panelId = constant.PANEL_ID.perfNonLogin;
                    const title = i18n.plugins_common_title_login;
                    if (select === i18n.plugins_common_button_login) {
                        const dataMsg = {
                            data: {
                                cmd: 'openNewPage', router: 'login', panelId,
                                viewTitle: title, message: {}
                            },
                            module: message.module
                        };
                        this.openNewPage(global, dataMsg);
                    }
                });
        }

        // 关闭其他页面
        ToolPanelManager.closePanelsByRemained(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, [global.toolPanel.getPanelId()]);
        ToolPanelManager.closePanelsByRemained(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, [global.toolPanel.getPanelId()]);
        global.context.globalState.update(message.module + 'uploadProcessFlag', 0);
        if (message.data.logout) {
            ToolPanelManager.closePanelsByRemained(message.module, []);
        }
    },

    async getpwd(global: any, message: any) {
        const json = Utils.getConfigJson(global.context);
        getPwd(message.data.username, json.sysPerfConfig[0].ip, pwd => {
            if (typeof pwd === 'object') {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, '');
            } else {
                Utils.invokeCallback(global.toolPanel.getPanel(), message, pwd);
            }
        });
    },

    // 清理json配置文件中的ip和port
    async cleanConfig(global: any, message: any) {
        global.context.globalState.update('closeShowErrorMessage', true);

        await LoginManager.checkInstall(global.context);
        if (!global.context.globalState.get('installType')) {
            message.data.data = JSON.parse(message.data.data);
            message.data.data.sysPerfConfig = [];
            const resourcePath = Utils.getExtensionFileAbsolutePath(global.context, 'src/extension/assets/config.json');
            const data = fs.writeFileSync(resourcePath, JSON.stringify(message.data.data));

            // 刷新左侧树至配置服务器状态
            vscode.commands.executeCommand('setContext', 'ipconfig', true);
            vscode.commands.executeCommand('setContext', 'isPerfadvisorConfigured', false);
            PerfMenu.updataTree(global.context);
        }

        Utils.invokeCallback(global.toolPanel.getPanel(), message, { cleanOk: true });

        // 清空session缓存,并将新的配置更新到session中
        Utils.initVscodeCache(global.context);

        // 关闭其他页面
        ToolPanelManager.closePanelsByRemained(message.module, [global.toolPanel.getPanelId()]);
        global.context.globalState.update(message.module + 'uploadProcessFlag', 0);
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

    // 关闭panel
    closePanel(global: any, message: any) {
        ToolPanelManager.closePanel(global.toolPanel.getPanelId(), message.module);
    },

    // 关闭所有panel
    closeAllPanel(global: any, message: any) {
        if (message.data.isSameIp) {
            // 关闭全部panel
            ToolPanelManager.closePanelsByRemained(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, new Array<string>());
            ToolPanelManager.closePanelsByRemained(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, new Array<string>());
        } else {
            this.closePanel(global, message);
        }
    },

    /**
     * webview侧发消息给vscode发消息需在右下角弹提醒框
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info,warn}}
     */
    async showInfoBox(global: any, message: any) {
        Utils.showMessageByType(message.data.type, { info: message.data.info }, true);
    },

    /**
     * webview侧发消息给vscode发消息需在右下角弹提醒框
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info,warn}}
     */
    async showInfoBoxWithButton(global: any, message: any) {
        Utils.showMessageWithButtonByType(global, message);
    },

    /**
     * 打开新的vscode窗口
     *
     * @param global 全局上下文
     * @param message 消息内容
     */
    openNewPage(global: any, message: any) {
        let session = {
            language: vscode.env.language
        };
        let navMessage;
        if ('message' in message.data) {
            const sysSession: any = global.context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            if (message.data?.panelId === 'profiling') {
                message.data.message.maxHeapCount = global.context.globalState.get('maxHeapCount');
                message.data.message.heapReportNum = global.context.globalState.get('heapReportNum');

                message.data.message.maxThreadDumpCount = global.context.globalState.get('maxThreadDumpCount');
                message.data.message.threadReportNum = global.context.globalState.get('threadReportNum');

                message.data.message.maxGcLogCount = global.context.globalState.get('maxGcLogCount');
                message.data.message.gclogReportNum = global.context.globalState.get('gclogReportNum');
            }
            if (message.data.msgType === OPEN_NEWPAGE_MGS_TYPE.PathToDetail) {
                session = {
                    ...sysSession,
                    toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
                };
            }
            // 优化建议详情页跳转分析路径
            if (message.data.msgType === OPEN_NEWPAGE_MGS_TYPE.DetailToPath) {
                session = {
                    ...sysSession,
                    toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
                };
            }
            // 优化建议详情页查看sys任务分析报告
            if (message.data.msgType === OPEN_NEWPAGE_MGS_TYPE.TuningViewSysReport) {
                session = {
                    ...sysSession,
                    toolType: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR
                };
            }
            // 优化建议详情页创建诊断调试分析任务
            if (message.data.msgType === OPEN_NEWPAGE_MGS_TYPE.TuningCreateDiagnoseTask
                || message.data.msgType === OPEN_NEWPAGE_MGS_TYPE.TuningViewDiagnoseReport) {
                session = {
                    ...sysSession,
                    toolType: constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE
                };
            }
            navMessage = Utils.generateMessage('navigate', {
                page: '/' + message.data.router, pageParams: { queryParams: message.data.message }, webSession: session
            });
        } else {
            navMessage = Utils.generateMessage('navigate', {
                page: '/' + message.data.router, webSession: session
            });
        }
        if (message.data?.panelId === 'profiling') {
            global.context.globalState.update('profilingCreateTime', Utils.formatDatetime(new Date(), 'yyyy-MM-dd hh:mm:ss'));
        }
        let viewTitle = message.data.viewTitle;
        if (message.data.message && message.data.message.functionName) {
            viewTitle = message.data.message.functionName;
        }
        const panelOption = {
            panelId: message.data.panelId,
            viewType: message.data.viewType || message.module,
            viewTitle,
            module: message.module,
            message: navMessage,
        };

        // 调优助手查看内存诊断分析报告
        if (message.data.msgType === OPEN_NEWPAGE_MGS_TYPE.TuningViewDiagnoseReport) {
            Object.assign(panelOption, { needAsycnUpdate: true });
        }
        ToolPanelManager.createOrShowPanel(panelOption, global.context);
    },

    // 从配置文件读取ip与port
    readConfig(global: any, message: any) {
        const json = Utils.getConfigJson(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, json);
    },

    // 从配置文件读取url
    readURLConfig(global: any, message: any) {
        const json = Utils.getURLConfigJson(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, json);
    },

    // 打开建议反馈错误提示
    openAdviceLinkError(global: any, message: any) {
        JavaperfRecordManage.showAdviceFeedbackError(global.context, message.data.module);
    },

    /**
     * 停止Profiling记录
     *
     * @param global 全局上下文
     * @param message 消息内容
     */
    stopProfiling(global: any, message: any) {
        JavaperfRecordManage.stopProfiling();
    },

    /**
     * 获取在线分析或导入的在线分析记录面板
     *
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    queryProfiling(global: any, message: any) {
        message.cmd = 'callbackProcess';
        Utils.invokeCallback(global.toolPanel.getPanel(), message, JavaperfRecordManage.queryProfiling());
    },

    /**
     * 导入在线分析记录
     *
     * @param global 全局上下文
     * @param message 消息内容
     */
    importProfiling(global: any, message: any) {
        JavaperfRecordManage.importProfiling(global.context);
    },

    /**
     * 导出Profiling记录
     *
     * @param global 全局上下文
     * @param message 消息内容
     */
    exportProfiling(global: any, message: any) {
        JavaperfRecordManage.exportProfiling();
    },

    /**
     * 删除采样分析记录
     *
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    deleteSampling(global: any, message: any) {
        JavaperfRecordManage.deleteSampling(global.context, message.data.samplingId, message.data.samplingName);
    },

    /**
     * 获取采样分析记录
     *
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    querySampling(global: any, message: any) {
        message.cmd = 'callbackProcess';
        Utils.invokeCallback(global.toolPanel.getPanel(), message, JavaperfRecordManage.querySampling());
    },

    /**
     * 导入采样分析记录
     *
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    importSampling(global: any, message: any) {
        JavaperfRecordManage.importSampling(global.context);
    },

    /**
     * 导出采样分析记录
     *
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    exportSampling(global: any, message: any) {
        JavaperfRecordManage.exportSampling(global.context, message.data.samplingId, message.data.samplingName);
    },

    /**
     * 关闭webview页签
     */
    closeTargetEnvirpoment(global: any) {
        JavaperfRecordManage.closeTargetEnvirpoment(global);
    },
    getPanelCreateTime(global: any, message: any) {
        message.cmd = 'callbackProcess';
        Utils.invokeCallback(global.toolPanel.getPanel(), message, global.toolPanel.getCreateTime().getTime());
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
        let fileNameArr;
        let fileName = message.data.fileName;
        if (message.data.fileName.indexOf(I18nService.I18n().plugins_javaperf_title_createTime) !== -1) {
            fileNameArr = message.data.fileName.split(I18nService.I18n().plugins_javaperf_title_createTime);
        }
        if (message.data.fileName.indexOf(I18nService.I18n().plugins_javaperf_title_importTime) !== -1) {
            fileNameArr = message.data.fileName.split(I18nService.I18n().plugins_javaperf_title_importTime);
        }
        if (fileNameArr?.length > 0) {
            fileName = fileNameArr[0].trim();
        }

        // 是否调用系统本地资源管理器
        if (message.data.invokeLocalSave) {
            file = await Utils.saveFileBySaveDialog(global.context.extensionPath + '/' + fileName, message.data.filters);
        } else {
            file = vscode.Uri.file(global.context.extensionPath + '/' + fileName);
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
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.plugins_sysperf_dowloadPath, { 0: file.fsPath }));
            }
            if (message.data.contentType === 'arraybuffer') {
                await fs.writeFile(file.fsPath, Buffer.from(message.data.fileContent), fileWriteCallback);
            } else if (message.data.contentType === 'base64') {
                await fs.writeFile(file.fsPath, Buffer.from(message.data.fileContent, 'base64'), fileWriteCallback);
            } else {
                await fs.writeFile(file.fsPath, message.data.fileContent, 'utf-8', fileWriteCallback);
            }

            Utils.invokeCallback(global.toolPanel.getPanel(), message, file.fsPath);
        } catch (error) {
            LogManager.log(global.context, 'downloadFile error.' + error, constant.TOOL_NAME_PERF, LOG_LEVEL.ERROR);
        }
    },
    /**
     * 调优助手删除前提示
     *
     * @param global 插件上下文
     * @param message 消息体
     */
    tuningHelperBeforeDelete(global: any, message: any) {
        if (message.data.isTask === 'true') {
            TuningAssistantPerfHelper.sureDeleteTask(message.data.label, global.context, message.data.selfId, message.data.panelId);
        } else {
            const projectInfo = {
                projectId: message.data.selfId,
                projectName: message.data.label,
            };
            TuningAssistantCommandCallback.sureDeleteProject(projectInfo, global.context, message.data.panelId);
        }
    },

    /**
     * 导出任务文件
     *
     * @param global 插件上下文
     * @param message 消息体
     */
    async exportFileTask(global: any, message: any) {
        try {
            if (message.data.toolType === constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE) {
                DiagnoseTaskHelper.exportTask(global.context, message.data.operate, message.data.params);
            } else {
                TaskHelper.exportTask(global.context, message.data.operate, message.data.params);
            }
        } catch (error) {
            LogManager.log(global.context, 'exportTask error.' + error, constant.TOOL_NAME_PERF, LOG_LEVEL.ERROR);
        }
    },
    /**
     * 导入任务文件
     *
     * @param global 插件上下文
     * @param message 消息体
     */
    async importFileTask(global: any, message: any) {
        try {
            if (message.data.toolType === constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE) {
                DiagnoseTaskHelper.importTask(global.context, message.data.operate, message.data.params);
            } else {
                TaskHelper.importTask(global.context, message.data.operate, message.data.params);
            }
        } catch (error) {
            LogManager.log(global.context, `importTask error.` + error, constant.TOOL_NAME_PERF, LOG_LEVEL.ERROR);
        }
    },
    /**
     * 删除任务文件
     *
     * @param global 插件上下文
     * @param message 消息体
     */
    async deleteFileTask(global: any, message: any) {
        try {
            TaskHelper.deleteTask(message.data.taskName, global.context, message.data.taskId);
        } catch (error) {
            LogManager.log(global.context, 'deleteTask error.' + error, constant.TOOL_NAME_PERF, LOG_LEVEL.ERROR);
        }
    },
    /**
     * 下载任务文件
     *
     * @param global 插件上下文
     * @param message 消息体
     */
    async downloadFileTask(global: any, message: any) {
        try {
            TaskHelper.downloadTaskFile(message.data.taskId, message.data.filesNum, message.data.filename, global.context);
        } catch (error) {
            LogManager.log(global.context, 'downloadTask error.' + error, constant.TOOL_NAME_PERF, LOG_LEVEL.ERROR);
        }
    },

    /**
     * 打开证书安装引导
     *
     * @param context 插件上下文
     * @param filePath 证书路径
     */
    openCaFile(global: any, message: any) {
        const terminal = vscode.window.createTerminal();
        terminal.sendText('rundll32.exe cryptext.dll,CryptExtAddCER ' + message.data.Path);
        setTimeout(() => {
            terminal.dispose();
        }, 3000);
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
            '@' + server.host + ' bash ' + workDir + preShellName + ' -u ' + this.getUrl(global) +
            ' -c "' + this.getKeyUrl(global) + '" \n');

        // 查询是否部署完成
        const stepName = '.install_' + message.module + '.step';
        ssh2Tools.tailFlow(workDir + stepName, processHandler).catch(processHandler);
        LogManager.log(global.context, server.username + ' install start', message.module, LOG_LEVEL.INFO);
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
        const shellName = message.module + '_log.sh';
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
            return ssh2Tools.exec('rm -rf ' + workDir + stepName);
        };
        // 清除用户信息
        server = undefined;
        message.data.username = undefined;
        message.data.password = undefined;
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
        const shellName = message.module + '_upgrade.sh';
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
            '@' + server.host + ' bash ' + workDir + preShellName + ' -u ' + this.getUrl(global) +
            ' -c "' + this.getKeyUrl(global) + '" \n');

        // 查询是否部署完成
        const stepName = '.upgrade_' + message.module + '.step';
        ssh2Tools.tailFlow(workDir + stepName, processHandler).catch(processHandler);
        LogManager.log(global.context, server.username + ' upgrade start', message.module, LOG_LEVEL.INFO);
        // 添加关闭连接前事件
        ssh2Tools.onCloseBefore = () => {
            return ssh2Tools.exec('rm -rf ' + workDir + stepName);
        };
        // 清除用户信息
        server = undefined;
        message.data.username = undefined;
        message.data.password = undefined;
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

    // 刷新左侧导航树
    async updateTree(global: any, message: any) {
        // 刷新左侧树
        PerfMenu.updataTree(global.context);

        // 关闭需要关闭的面板
        if (message.data.closePanel) {
            ToolPanelManager.closePanel(new Array<string>(message.data.closePanel)
                , constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        }

        // 跳转至任务报告详细页面
        if (message.data.isShowReport) {
            const params: any = await TaskHelper.getTaskByProjectAndTaskId(
                message.data.projectName,
                message.data.task,
                global.context,
                message.data.toolType
            );
            // 如果为调优助手任务取消，跳转调优助手查看任务基本信息和日志页面
            if (params?.selfInfo?.sampleStatus === constant.TASK_STATUS.CANCELLED &&
                params.params.analysisType === 'optimization') {
                TuningAssistantPerfHelper.viewTuningAssistantInfoAndLogPanel(
                    global.context, params.params.projectName, params.params.taskName, params.taskId, params.selfInfo);
            } else {
                const messageDef = {
                    data: {
                        navigate: constant.NAVIGATE_PAGE.home,
                        params: {
                            ...params,
                            ownerId: message.data?.ownerId,
                        },
                    }
                };
                messageHandler.navigateToPanel(global, messageDef, message.data.toolType);
            }
        }

        /**
         * 调优助手优化建议详情创建sys分析任务
         * 查找tuning创建sys任务的webview页面
         * 发送消息更新此页面的优化建议详情
         */
        if (message.data.fromTuningTabId) {
            const fromTuningSugDetaiTab = ToolPanelManager.sysPerfToolPanels.find((panel: any) => {
                return panel.getPanelId() === message.data.fromTuningTabId;
            });
            if (fromTuningSugDetaiTab) {
                fromTuningSugDetaiTab.getPanel().webview.postMessage({
                    cmd: 'handleVscodeMsg',
                    type: 'updateTuningSugDetail',
                    data: message.data
                });
            }
        }
        Utils.showMessageByType(message.data.type, { info: message.data.info }, true);
    },

    // 跳转至新面板
    navigateToPanel(global: any, messageDef: any, toolType: constant.PERF_SUBMODULE) {
        toolType = messageDef?.data?.params?.toolType || toolType;
        if (Utils.strAStartWithStrB(constant.NAVIGATE_PAGE.modifyProject, messageDef.data.navigate)) {
            ToolPanelManager.openSysPerfProjectManagePanel(messageDef.data.navigate, global.context, messageDef.data.params);
        } else if (Utils.strAStartWithStrB(constant.NAVIGATE_PAGE.sysperfSettings, messageDef.data.navigate)) {
            if (toolType === constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE) {
                ToolPanelManager.openDiagnoseSettingPanel(global.context, messageDef.data.params);
            } else {
                ToolPanelManager.openSysPerfMultiPanel('', global.context, messageDef.data.params);
            }
        } else if (Utils.strAStartWithStrB(constant.NAVIGATE_PAGE.createProject, messageDef.data.navigate)) {
            ToolPanelManager.openSysPerfProjectManagePanel(messageDef.data.navigate, global.context, messageDef.data.params);
        } else if (Utils.strAStartWithStrB(constant.NAVIGATE_PAGE.javaperfsetting, messageDef.data.navigate)) {
            ToolPanelManager.openJavaPerfManagePanel(constant.PERF_JAVA_MANAGE_PAGE_MAP.get('javaPerf'),
                global.context, messageDef.data.param);
        } else if (Utils.strAStartWithStrB(constant.NAVIGATE_PAGE.home, messageDef.data.navigate)) {
            const webSession: any = global.context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const sendMessage = JSON.stringify(messageDef.data.params).replace(/:/g, '#');
            const page = constant.NAVIGATE_PAGE.home;
            const message = Utils.generateMessage('navigate',
                { page, pageParams: { queryParams: { sendMessage } }, webSession: { ...webSession, toolType } });
            const taskName = messageDef.data.params.params.taskName;
            const projectName = messageDef.data.params.params.projectName;
            const analysisType = messageDef.data?.params?.params?.analysisType;
            const panelOption = {
                panelId: messageDef.data.params.panelId,
                viewType: constant.VIEW_TYPE.sysPerfProjectTaskNode,
                viewTitle: taskName + '-' + messageDef.data.params.selfInfo.nodeIP + '-' + projectName,
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                message
            };

            // 兼容联动分析的命名方式
            if ('task_contrast' === analysisType) {
                panelOption.viewTitle = taskName;
            }

            // 展示页面面板
            ToolPanelManager.createOrShowPanel(panelOption, global.context);
        } else if (Utils.strAStartWithStrB(constant.NAVIGATE_PAGE.targetEnviroment, messageDef.data.navigate)) {
            const value = constant.PERF_JAVA_MANAGE_PAGE_MAP.get('targetEnviroment');
            ToolPanelManager.openTargetEnvironment(value, global.context, value.cmdParam.param);
        }
    },

    /**
     * 引导页打开页面
     * @param global 全局上下文
     * @param message 消息内容
     */
    openGuidePage(global: any, message: any) {
        const guideType = message.data.guideType;
        switch (guideType) {
            case 'sys':
                ToolPanelManager.openSysPerfProjectManagePanel(
                    constant.NAVIGATE_PAGE.createProject, global.context, {
                    projectName: i18n.plugins_sysperf_createProject
                });
                break;
            case 'java':
                const value = constant.PERF_JAVA_MANAGE_PAGE_MAP.get(
                    constant.NAVIGATE_PAGE.targetEnviroment);
                ToolPanelManager.openTargetEnvironment(value, global.context, value.cmdParam.param);
                break;
            case 'diagnose':
                DiagnoseCommandCallback[constant.NAVIGATE_PAGE.createProject]?.apply(
                    DiagnoseCommandCallback, [global.context]);
                break;
            case 'tuningHelper':
                TuningAssistantCommandCallback[constant.NAVIGATE_PAGE.createProject]?.apply(
                    TuningAssistantCommandCallback, [global.context]);
                break;
            default:
                break;
        }
    },

    /**
     * 登出
     *
     * @param global 全局上下文
     * @param message 消息内容
     */
    loginOut(global: any, message: any) {
        if (message.data.isInstalled && message.data.isSameIp) {
            // 重定向之前清空之前登录的session
            ToolPanelManager.closePanelsByRemained(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                new Array<string>(global.toolPanel.getPanelId()));
            ToolPanelManager.closePanelsByRemained(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                new Array<string>(global.toolPanel.getPanelId()));
            // 清空缓存
            LoginManager.clearCacheAllModule(global.context);
            // view上的按钮隐藏，左侧树显示登录按钮
            PerfMenu.updataTree(global.context);
            PerfMenu.deleteTimedUpdataTree();
        }
        Utils.invokeCallback(global.toolPanel.panel, message, { loginOut: true });
    },

    async updateMenu(global: any, message: any) {
        // 刷新左侧树
        PerfMenu.updataTree(global.context);

        // 刷新右侧webview窗口
        if (message.data.menuType === 'guardianList') {
            const panel = ToolPanelManager.getToolPanelByPanelId(message.data.guardian.id, message.module);
            if (panel) {
                if (message.data.operType === constant.GUARDIAN_OPER_TYPE.MOD) {
                    const guardian = await PerfHelper.getGuardianDetail(global.context, message.data.guardian.id);
                    Object.assign(guardian, { owner: message.data.guardian.owner });
                    panel.getPanel().title = PerfHelper.getGuardianLabel(global.context, guardian);
                } else if (message.data.operType === constant.GUARDIAN_OPER_TYPE.DEL
                    || message.data.operType === constant.GUARDIAN_OPER_TYPE.DEL_OUT) {
                    ToolPanelManager.closePanel(
                        new Array<string>(panel.getPanelId()),
                        constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
                    );
                }
            }
        }
    },

    /**
     * 打开调优助手设置
     */
    async navigateToTuningHelperSettingPanel(global: any, message: any) {
        ToolPanelManager.openTuningAssistantSettingPanel(global.context, { innerItem: 'itemNodeManaga' });
    },

    async openSomeNode(global: any, message: any) {
        if (message.data.toolType === constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE) {
            const params: any = await DiagnoseTaskHelper.getNodeByProject(message.data.projectName, message, global.context);
            params.selfInfo.taskParam['analysis-type'] = params.anaType;
            ToolPanelManager.handleDiagnoseTaskNodeClick(global.context, params);
        } else {
            const params = await TaskHelper.getNodeByProject(message.data.projectName, message, global.context);
            ToolPanelManager.handleSysPerfTreeNodeClick(global.context, params);
        }
    },
    /**
     * 调优助手分析页面采纳更新调优路径建议列表
     */
    updateTuningRecordDetail(global: any, message: any) {
        ToolPanelManager.sysPerfToolPanels.forEach((fromTuningSugDetaiTab: any) => {
            fromTuningSugDetaiTab.getPanel().webview.postMessage({
                cmd: 'handleVscodeMsg',
                type: 'updateTuningRecordDetail',
                data: message.data.taskId
            });
        });
    },

    async getPwdLogOut(global: any, message: any) {
        const resp: any = await LoginManager.logOutCurrentUser(global.context, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (resp) {
            LoginManager.redirectToLogin(global.context, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        }
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
        const flag = Utils.isSysPerfLogin(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, flag);
    },

    /**
     * 获取安装包路径
     */
    getUrl(global: any): any {
        return Utils.getConfigJson(global.context).pkg_url;
    },

    /**
     * 读取样式内容
     *
     * @param global 插件上下文，以及当前的panel
     * @param message 来自webview的消息内容
     */
    getStyle(global: any, message: any) {
        if (message.data.relativePath) {
            const absolutePath = path.join(__dirname, message.data.relativePath);
            const data = fs.readFileSync(absolutePath, 'utf-8');
            Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
        }
    },

    /**
     * 获取KEY路径
     */
    getKeyUrl(global: any): any {
        return Utils.getConfigJson(global.context).key;
    },

    /**
     * 剪切板
     */
    clipboard(global: any, message: any) {
        if (message.data.content) {
            vscode.env.clipboard.writeText(message.data.content);
            this.showInfoBox(global, {
                data: {
                    info: i18n.plugins_common_tips_copySucceeded,
                    type: 'info'
                }
            });
        }
    },

    /**
     * 内存转储阈值检测
     */
    async checkHeapdumpReportThreshold(global: any, message: any) {
        const data = await JavaperfReportManage.checkHeapdumpReportThreshold(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
    },
    /**
     * 线程转储阈值检测
     */
    async checkThreaddumpReportThreshold(global: any, message: any) {
        const data = await JavaperfReportManage.checkThreaddumpReportThreshold(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
    },

    /**
     * gclog报告阈值检测
     */
    async checkGclogReportThreshold(global: any, message: any) {
        const data = await JavaperfReportManage.checkGclogReportThreshold(global.context);
        Utils.invokeCallback(global.toolPanel.getPanel(), message, data);
    },

    /**
     * 更新内存转储阈值
     */
    async updateHeapReportConfig(global: any, message: any) {
        if (!message.data) {
            const reportOption = {
                url: '/heap/actions/list',
                method: 'GET'
            };
            // 获取已保存内存转储记录
            const reportResp: any = await Utils.requestDataHelper(
                global.context, reportOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            const heapReportNum = reportResp?.data.length || 0;
            const thresholdOption = {
                url: '/tools/settings/heap',
                method: 'GET'
            };
            const thresholdRes: any = await Utils.requestDataHelper(
                global.context, thresholdOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            message.data = {
                heapReportNum,
                maxHeapCount: thresholdRes.maxHeapCount
            };
        }

        ToolPanelManager.javaPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({
                cmd: 'handleVscodeMsg',
                type: 'updateHeapReportConfig',
                data: message.data
            });
        });
    },

    /**
     * 更新线程转储阈值
     */
    async updateThreadReportConfig(global: any, message: any) {
        if (!message.data) {
            const reportOption = {
                url: '/threadDump/list',
                method: 'GET'
            };
            // 获取已保存内存转储记录
            const reportResp: any = await Utils.requestDataHelper(
                global.context, reportOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            const threadReportNum = reportResp?.data.length || 0;
            const thresholdOption = {
                url: '/tools/settings/threadDump',
                method: 'GET'
            };
            const thresholdRes: any = await Utils.requestDataHelper(
                global.context, thresholdOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            message.data = {
                threadReportNum,
                maxThreadDumpCount: thresholdRes.maxThreadDumpCount
            };
        }

        ToolPanelManager.javaPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({
                cmd: 'handleVscodeMsg',
                type: 'updateThreadReportConfig',
                data: message.data
            });
        });
    },

    /**
     * 更新gclog报告阈值
     */
    async updateGclogReportConfig(global: any, message: any) {
        if (!message.data) {
            const reportOption = {
                url: '/gcLog/list',
                method: 'GET'
            };
            // 获取已保存内存转储记录
            const reportResp: any = await Utils.requestDataHelper(
                global.context, reportOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            const gclogReportNum = reportResp?.data.length || 0;
            const thresholdOption = {
                url: '/tools/settings/gcLog',
                method: 'GET'
            };
            const thresholdRes: any = await Utils.requestDataHelper(
                global.context, thresholdOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            message.data = {
                gclogReportNum,
                maxGcLogCount: thresholdRes.maxGcLogCount
            };
        }

        ToolPanelManager.javaPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({
                cmd: 'handleVscodeMsg',
                type: 'updateGClogReportConfig',
                data: message.data
            });
        });
    },


    /**
     * 保存报告-线程&内存转储&GC日志
     */
    async savedReportShowInfo(global: any, message: any) {
        // 刷新左侧树
        PerfMenu.updataTree(global.context);
        if (message.data.type === 'heapdump') {
            this.updateHeapReportConfig(global, {});
        } else if (message.data.type === 'threaddump') {
            this.updateThreadReportConfig(global, {});
        } else if (message.data.type === 'gclog') {
            this.updateGclogReportConfig(global, {});
        }
        vscode.window.showInformationMessage(i18n.plugins_perf_java_saved_report_sucess,
            i18n.plugin_common_button_look).then(async (select) => {
                if (select === i18n.plugin_common_button_look) {
                    const option = {
                        method: 'GET',
                        url: ''
                    };
                    let nodePageMapId = '';
                    if (message.data.type === 'heapdump') {
                        option.url = '/heap/actions/record/' + message.data.taskId;
                        nodePageMapId = 'heapdumpReport';
                    } else if (message.data.type === 'threaddump') {
                        option.url = '/threadDump/' + message.data.taskId;
                        nodePageMapId = 'threaddumpReport';
                    } else if (message.data.type === 'gclog') {
                        option.url = '/gcLog/' + message.data.taskId;
                        nodePageMapId = 'gclogReport';
                    }
                    let report: any = {};
                    // 判断是否传递报告详细信息，没有传递则请求报告详细信息
                    if (!message.data.reportData) {
                        const resp: any = await Utils.requestData(global.context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
                        if (resp.status === 200 && resp.data.code === 0) {
                            // 获取table信息
                            report = resp.data.data;
                        }
                    } else {
                        report = message.data.reportData;
                    }
                    let label = report.reportName || report.alias || report.logName;
                    if (report?.reportSource === 'IMPORT' || report?.source === 'IMPORT') {
                        label += I18nService.I18n().plugins_javaperf_title_importTime;
                    } else {
                        label += `(${report.lvmId})` + I18nService.I18n().plugins_javaperf_title_createTime;
                    }
                    label += Utils.dateFormat(report.createTime, 'yyyy-MM-dd hh:mm:ss');

                    const panelMessage = Utils.generateMessage('navigate',
                        {
                            page: constant.NODE_PAGE_MAP.get(nodePageMapId).page + (constant.NODE_PAGE_MAP.get(nodePageMapId).param || ''),
                            pageParams: {
                                queryParams: {
                                    sendMessage: JSON.stringify({
                                        taskId: message.data.taskId
                                    }).replace(/:/g, '#'),
                                    taskId: message.data.taskId
                                }
                            }, webSession: global.context.globalState.get(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR + 'Session')
                        });
                    const panelOption = {
                        panelId: message.data.taskId,
                        viewTitle: label,
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        message: panelMessage
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, global.context);
                }
            });
    },

    /**
     * 创建新的在线分析时，弹出有操作按钮的文本消息弹窗
     * @param message webview消息体{data: {type: 消息类型, string: 消息内容}}
     */
    showWarningMessage(global: any, message: any) {
        vscode.window.showWarningMessage(message.data.message.info, message.data.message.confirm, message.data.message.cancel)
            .then((select) => {
                if (select === message.data.message.confirm) {
                    ToolPanelManager.closePanel(
                        [constant.PANEL_ID.profiling],
                        constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
                    ToolPanelManager.javaPerfToolPanels.forEach((panel) => {
                        const option = { cmd: 'openNewProfiling' };
                        Utils.invokeCallback(panel.getPanel(), option, null);
                    });
                }
            });
    }
};

function handleTerminalException(
    terminal: vscode.Terminal, ssh2Tools: SSH2Tools,
    fileList: Array<string>, log: (data: string) => void, callback: any
) {

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
