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
import { Utils } from './utils';
import * as constant from './constant';
const path = require('path');
const os = require('os');
import { messageHandler } from './webview-msg-handler';
import { I18nService } from './i18nservice';
import { ReportHelper } from './report-helper';
import { PortMenu } from './toolmenu/port-menu';
import { LoginManager } from './login-manager';
const fs = require('fs');
import { LOG_LEVEL, LogManager } from './log-manager';
const i18n = I18nService.I18n();



/**
 * 插件面板类，用来打开webview
 */
class ToolPanel {
    public context: vscode.ExtensionContext;
    private panelId: string;
    private panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];
    private module: string;

    constructor(panelOption: any, private disposeHandle: any, context: vscode.ExtensionContext) {
        this.panelId = panelOption.panelId;
        this.module = panelOption.module;
        this.context = context;

        // 调用vscode 接口创建一个存放webview的panel
        const panel = vscode.window.createWebviewPanel(
            panelOption.viewType,
            panelOption.viewTitle,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
            });

        this.panel = panel;

        // 转换资源路径
        if (panel !== undefined) {
            Utils.initPage(context, panel.webview, 'out/porting/index.html');
        }

        // 设置panel中的webview的HTML,将需要跳转的信息写入Html中，解决vscode 发送消息有延迟导致的页面需要点击两次才能打开的问题，优化加载时间
        this.setWebViewHtml(context);
        const content = 'self.navigatorPage = ' + JSON.stringify(panelOption.message);
        this.panel.webview.html = this.panel.webview.html.replace('self.navigatorPage', content);

        // 相应panel的关闭事件
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        // 侦听来自webview的消息
        const global = { context, toolPanel: this };
        this.panel.webview.onDidReceiveMessage(message => {
            if (messageHandler[message.cmd]) {
                messageHandler[message.cmd](global, message);
            } else {
                LogManager.log(context, 'onDidReceiveMessage, the method is not found: ' + message.cmd,
                    constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
            }

        }, undefined, this.disposables);

        // 侦听面板的状态改变事件
        this.panel.onDidChangeViewState(
            e => { },
            null,
            this.disposables
        );
    }
    /**
     * 设置porting的html
     *
     * @param context 插件上下文
     */
    private setWebViewHtml(context: vscode.ExtensionContext) {
        if (this.module === constant.TOOL_NAME_PORTING) {
            this.panel.webview.html = Utils.getWebViewContent(context, 'out/porting/index.html');
        }
    }

    /**
     * 获取panelId
     */
    public getPanelId(): string {
        return this.panelId;
    }

    /**
     * 设置panelId
     * @param panelId panelId
     */
    public setPanelId(panelId: string) {
        this.panelId = panelId;
    }

    /**
     * 获取panel
     */
    public getPanel(): vscode.WebviewPanel {
        return this.panel;
    }

    /**
     * 获取模块标识
     * @param panelId panelId
     */
    public getModule() {
        return this.module;
    }
    /**
     * 关闭panel时的处理
     */
    public dispose() {
        this.disposeHandle(this);

        this.panel.dispose();

        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }

        // 关闭的是软件迁移评估页面或源码迁移页面
        if (constant.PANEL_ID.portAppraise === this.panelId || constant.PANEL_ID.portCreatescSanTask === this.panelId) {
            // 未签署免责申明跳转到登录页面
            if (!this.context.globalState.get(constant.PORT_DESCLAIMER_CONF)) {
                LoginManager.redirectToLogin(this.context, this.module);
            }
        }
    }
}

export class ToolPanelManager {
    // 存储porting面板
    public static portToolPanels: Array<ToolPanel> = [];

    /**
     * 判断panel是否已被关闭
     * @param global 全局上下文
     */
    public static isPanelClosed(global: any) {
        if (global.toolPanel.getModule() === constant.TOOL_NAME_PORTING) {
            return ToolPanelManager.portToolPanels
              .filter(item => item.getPanelId() === global.toolPanel.getPanelId()).length === 0;
        }

        return true;
    }

    /**
     * 关闭webview所在的panel
     * @param toolPanel panel
     */
    static closeToolPanel(toolPanel: ToolPanel): void {
        // 将存储到全局的panel从list中去掉
        if (toolPanel.getModule() === constant.TOOL_NAME_PORTING) {
            ToolPanelManager.portToolPanels = ToolPanelManager.portToolPanels
              .filter(item => item.getPanelId() !== toolPanel.getPanelId());
        }

        // 增强功能页面关闭，需要关闭关联的其它报告页面
        if (toolPanel.getPanelId() === 'PortingPre-check') {
            const closePanels = [];
            for (const item of ToolPanelManager.portToolPanels) {
                if (item.getPanelId().indexOf('enhance') > -1) {
                    closePanels.push(item.getPanelId());
                }
            }

            // 字节对齐报告webview panel
            if (closePanels.length > 0) {
                ToolPanelManager.closePanel(closePanels, constant.TOOL_NAME_PORTING);
            }

            // 关闭增强功能总报告页面，需要关联关闭对应的报告详情页面
            const openedFiles: any = toolPanel.context.globalState.get('enhanceOpenedFiles') || [];
            const reportId = toolPanel.context.globalState.get('preCheckId');
            if (openedFiles.length > 0 && reportId) {
                const textEditorArr = vscode.window.visibleTextEditors;
                for (const filePath of openedFiles) {
                    const workFilePath = Utils.getExtensionFileAbsolutePath(toolPanel.context,
                        'resources/worksources/' + reportId + filePath);
                    const textEditor = textEditorArr.find((item: any) => item.filePath = workFilePath);
                    // hide 函数下个版本不能用
                    if (textEditor) {
                        try {
                            (textEditor as any).hide();
                        } catch {
                            LogManager.log(toolPanel.context, 'vscode\'s TextEditor is deprecated,\
                            Use the command`workbench.action.closeActiveEditor` instead',
                              constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
                        }
                    }

                    // 删除临时文件
                    fs.unlink(workFilePath, (error: any) => {
                        // 日志打印只能打印相对路径，不能打印绝对路径
                        LogManager.log(toolPanel.context, 'delete file failed, file is: ' + reportId + filePath,
                            constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
                    });
                }

                toolPanel.context.globalState.update('enhanceOpenedFiles', []);
            }
        }
    }

    /**
     * 打开选择的webview
     * param panelOption webview信息
     * param context vscode上下文信息
     */
    public static createOrShowPanel(panelOption: any, context: vscode.ExtensionContext) {
        const showPanel = this.needShowPanel(context, panelOption);
        if (!showPanel) {
            return;
        }


        for (const toolPanel of ToolPanelManager.portToolPanels) {
            if (toolPanel.getPanelId() === panelOption.panelId) {
                if ((panelOption.panelId !== constant.CONTEXT_VALUES.softPorting
                        && panelOption.panelId !== constant.PANEL_ID.portCreatescSanTask
                        && panelOption.panelId !== constant.PANEL_ID.portPreCheck)
                    || (panelOption.panelId === constant.PANEL_ID.portCreatescSanTask &&
                        (context.globalState.get('rightPorting') ||
                            context.globalState.get('rightPorting') === null))
                    || (panelOption.panelId === constant.PANEL_ID.portPreCheck &&
                        (context.globalState.get('rightPorting') ||
                            context.globalState.get('rightPorting') === null))) {
                    toolPanel.getPanel().webview.postMessage(panelOption.message);
                }
                if ((panelOption.panelId === constant.PANEL_ID.portCreatescSanTask
                    && context.globalState.get('rightPorting') === false)
                    || (panelOption.panelId === constant.PANEL_ID.portPreCheck
                        && context.globalState.get('rightPorting') === false)) {
                    toolPanel.getPanel().webview.postMessage(panelOption.message);
                }
                toolPanel.getPanel().reveal();
                return toolPanel;
            }
        }
        const newToolPanel: ToolPanel = new ToolPanel(panelOption, ToolPanelManager.closeToolPanel, context);
        ToolPanelManager.portToolPanels.push(newToolPanel);
        return newToolPanel;
    }

    /**
     * 目前迁移评估使用 Apprise响应不同的命令来打开panel
     *
     * @param context 插件上下文
     */
    public static crateOrShowPanelForDepCommand(context: vscode.ExtensionContext) {

        // 响应点击左侧树事件
        context.subscriptions
          .push(vscode.commands
            .registerCommand('itemclick', async (label, id, module, contextValue, extInfo?: any) => {
            let resp: any;
            if (constant.CONTEXT_VALUES.depreport === contextValue
              || constant.CONTEXT_VALUES.pkgRebuildF === contextValue
              || constant.CONTEXT_VALUES.pkgRebuildS === contextValue) {
                // 获取报告详细信息
                resp = await ReportHelper.getReportDetail(context, id, module);
                if (!resp) {
                    return;
                }
            } else if (constant.CONTEXT_VALUES.portreport === contextValue) {
                // 在webview中请求数据，防止报告较大，点击没有反应
                resp = {};
            }

            module = constant.TOOL_NAME_PORTING;
            const webSession: any = context.globalState.get(module + 'Session');

            // 不同的树节点打开的页面不同，需要根据contextvalue和模块来获取页面地址
            const page: string = ToolPanelManager.getPageForTreeNode(module, contextValue);
            if (-1 === constant.NO_CREATE_PANLE_IDS.indexOf(id)) {
                let message;
                message = Utils.generateMessage('navigate',
                    { page,
                        pageParams: {
                        queryParams: { response: resp, report: id, name: extInfo ? extInfo.name : ''} },
                        webSession });

                const panelOption = {
                    panelId: id,
                    viewType: constant.VIEW_TYPE.report,
                    viewTitle: label,
                    module,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }
        }));
    }



    /**
     * 给Apprise webview发送消息
     * @param fun webview路由名
     * @param context 插件上下文
     * @param params 参数
     */
    static sendMassageToApprisePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const message = Utils.generateMessage('sendMessage', { value: 'isreportChange', type: 'isreportChange' });
        const panelOption = {
            panelId: constant.PANEL_ID.portAppraise,
            viewType: constant.VIEW_TYPE.portAppraise,
            viewTitle: i18n.plugins_port_newmigration_appraise,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * Porting响应不同的命令来打开panel
     *
     * @param context 插件上下文
     */
    public static crateOrShowPanelForPortCommand(context: vscode.ExtensionContext) {
        // 打开porting服务器配置panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portserverconfig',
            () => {
                const portSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate', { page: '/config', webSession: portSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.portNonServerConfig,
                    viewType: constant.VIEW_TYPE.serverConfig,
                    viewTitle: i18n.port_configure_remote_server,
                    module: constant.TOOL_NAME_PORTING,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));

        // 打开免费试用远程服务器panel
        context.subscriptions
          .push(vscode.commands.registerCommand('extension.view.portfreetrialremoteenvironment', () => {
            const portSession = {
                language: vscode.env.language
            };
            const message = Utils
              .generateMessage('navigate', { page: '/freeTrialProcessEnvironment', webSession: portSession });
            const panelOption = {
                panelId: constant.PANEL_ID.portFreeTrialRemoteEnvironment,
                viewType: constant.VIEW_TYPE.freeTrialRemoteEnvironment,
                viewTitle: i18n.plugins_porting_free_trial_remote_environment,
                module: constant.TOOL_NAME_PORTING,
                message
            };
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }));

        // 打开porting登录panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portlogin',
            () => {
                ToolPanelManager.openPortLoginPanel(context, 'login');
            }));

        // 响应打开porting依赖字典，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portwhitelistmanage',
            () => {
                ToolPanelManager.openPortMultiPanel('portwhitelistmanage', context, { innerItem: 'itemWhitelist' });
            }));

        // 响应打开porting依赖字典，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portwebservercertificate',
            () => {
                ToolPanelManager
                  .openPortMultiPanel('portwebservercertificate', context, { innerItem: 'itemWebServerCertificate' });
            }));
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portcertificaterevocationlist',
          () => {
              ToolPanelManager.openPortMultiPanel('portcertificaterevocationlist',
                context, { innerItem: 'itemCertificateRevocationList' });
          }));
        // 响应打开porting依赖字典，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portweakpassworddictionary',
            () => {
                ToolPanelManager.openPortMultiPanel('portweakpassworddictionary',
                  context, { innerItem: 'itemWeakPasswordDictionary' });
            }));
        // 响应打开porting依赖字典，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portSysSetting',
            () => {
                ToolPanelManager.openPortMultiPanel('portSysSetting', context, { innerItem: 'itemSysSetting' });
            }));
        // 响应打开porting 软件迁移模板，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板,修改密码共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portingtemplateman',
            () => {
                ToolPanelManager.openPortMultiPanel('portingtemplateman', context, { innerItem: 'itemMigratemp' });
            }));

        // 响应打开porting 扫描参数设置，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板,修改密码共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portscanparaconfig',
            () => {
                ToolPanelManager.openPortMultiPanel('portscanparaconfige', context, { innerItem: 'itemDepparam' });
            }));

        // 响应打开porting 历史报告配置，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板,修改密码共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portthresholdconfig',
            () => {
                ToolPanelManager.openPortMultiPanel('portthresholdconfig', context, { innerItem: 'itemThreshold' });
            }));

        // 响应打开porting 历史报告配置，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板,修改密码共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portloginconfig',
            () => {
                ToolPanelManager.openPortMultiPanel('portloginconfig', context, { innerItem: 'itemLogin' });
            }));

        // 响应打开porting 操作日志
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portoperatlog',
            () => {
                ToolPanelManager.openPortMultiPanel('portoperatlog', context, { innerItem: 'itemOperatlog' });
            }));
        // 响应打开porting 运行日志
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portrunlog',
            () => {
                ToolPanelManager.openPortMultiPanel('portrunlog', context, { innerItem: 'itemRunlog' });
            }));

        // 响应打开porting 用户管理，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板,修改密码共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portusermanage',
            () => {
                ToolPanelManager.openPortMultiPanel('portusermanage', context, { innerItem: 'itemUser' });
            }));

        // 响应打开porting 修改密码，依赖字典，扫描参数设置，用户管理，历史报告配置，软件迁移模板,修改密码共用一个panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portmodifypwd',
            () => {
                ToolPanelManager.openPortMultiPanel('portmodifypsw', context, { innerItem: 'itemModifypsw' });
            }));

        // 响应porting点击查看用户事件
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portShowUser', () => {
            const session: any = Utils.getPortUser(context);
            const rolename = session.role === constant.PORTING_ADMIN ?
                i18n.plugins_common_show_user_admin_user :
                i18n.plugins_common_show_user_normal_user;
            vscode.window
              .showInformationMessage(
                i18n.plugins_common_show_user_current_user + session.username + '(' + rolename + ')',
                i18n.plugins_common_show_user_btn_true).then((select) => {
                    if (select === i18n.plugins_common_show_user_btn_true) { }
                });
        }));

        // 响应打开porting登出事件
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portlogout', () => {
            vscode.window
              .showWarningMessage(i18n.plugins_porting_message_logout, i18n.confirm_button, i18n.cancel_button)
                .then(async select => {
                    if (select === i18n.confirm_button) {
                        context.globalState.update('isProcess', true);
                        try {
                            // 调用登出接口
                            const option = {
                                url: constant.PORTING_URIS.PORTING_LOG_OUT,
                                method: 'POST'
                            };
                            const resp: any =
                              await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);

                            if (resp.status === constant.STATUS_SUCCESS) {

                                // 关闭所有的pannel
                                for (const toolPanel of ToolPanelManager.portToolPanels) {
                                    toolPanel.getPanel().dispose();
                                }
                                vscode.commands.executeCommand('setContext', 'isportlogined', false);
                                LoginManager.loginOutProcess(context, constant.TOOL_NAME_PORTING);

                                // 刷新左侧树
                                vscode.window.showInformationMessage(i18n.plugins_common_logout_ok);
                                PortMenu.getInstance().pathList = [];
                                PortMenu.getInstance().refresh();
                            }

                        } catch (error) {
                            vscode.window.showErrorMessage(error);
                        }
                    }
                });
        }));

        // 响应打开porting新建扫描任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portcreatetask',
            () => {
                ToolPanelManager.openPortHomePanel('home', context, null);
            }));
        // 响应打开porting新建软件包重构任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portCreateSoftWareBuildTask',
            () => {
                ToolPanelManager.openPortSoftWareBuildPanel('/analysisCenter', context, null);
            }));

        // 响应打开免责声明
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portdisclaimer',
            () => {
                const portSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate', { page: '/disclaimer', webSession: portSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.portDisclaimerView,
                    viewType: constant.VIEW_TYPE.disclaimerView,
                    viewTitle: i18n.plugins_porting_disclaimer_title,
                    module: constant.TOOL_NAME_PORTING,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));

        // 响应打开建议反馈
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portfeedback',
            () => {
              // 查询用户登录状态是否有效
              const option = {
                noToken: 'true',
                url: '/users/admin/status/',
                timeout: 3000,
                advFeedback: true,
                method: 'GET',
                subModule: 'porting',
              };
              const ip = context.globalState.get('portingIp');
              const port = context.globalState.get('portingPort');
              const pluginUrlCfg = Utils.getUrlConfigJson(context);
              const feedbackUrl = vscode.Uri.parse(pluginUrlCfg.communityFeedback);
              if (ip && port) {
                Utils.requestData(context, option, 'porting', '', true).then((resp: any) => {
                  if (resp.data && Object.keys(resp.data).length > 0) {
                    vscode.commands.executeCommand('vscode.open', feedbackUrl);
                  } else {
                    Utils.showAdviceFeedbackError(context, 'porting');
                  }
                });
              } else {
                vscode.commands.executeCommand('vscode.open', feedbackUrl);
              }
            }));

        // 卸载工具
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portuninstall',
            () => {
                const portSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate', { page: '/uninstall', webSession: portSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.portUnInstall,
                    viewType: constant.VIEW_TYPE.uninstallView,
                    viewTitle: i18n.plugins_porting_message_uninstall,
                    module: constant.TOOL_NAME_PORTING,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));

        // 升级工具
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portupgrade',
            () => {
                const portSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate', { page: '/upgrade', webSession: portSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.portUpgrade,
                    viewType: constant.VIEW_TYPE.upgradeView,
                    viewTitle: i18n.plugins_porting_message_upgrade,
                    module: constant.TOOL_NAME_PORTING,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));

        // 响应新建打开64位预检任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portcreateprechecktask',
            () => {
                const portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
                const isProcess = context.globalState.get('isProcess');
                const message =
                  Utils.generateMessage('navigate', {
                      page: '/PortingPre-check',
                      pageParams: {
                        queryParams: { isProcess }
                      },
                      webSession: portSession });
                context.globalState.update('isProcess', false);
                const panelOption = {
                    panelId: constant.PANEL_ID.portPreCheck,
                    viewType: constant.VIEW_TYPE.portPreCheck,
                    viewTitle: i18n.plugins_porting_enhance_function_label,
                    module: constant.TOOL_NAME_PORTING,
                    message
                };
                for (const toolPanel of ToolPanelManager.portToolPanels) {
                    if (toolPanel.getPanelId() === panelOption.panelId) {
                        toolPanel.getPanel().dispose();
                    }
                }
                ToolPanelManager.createOrShowPanel(panelOption, context);

                // 刷新左侧树
                PortMenu.getInstance().pathList = [];
                PortMenu.getInstance().refresh();
            }));

        // 响应新建打开迁移评估
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.migratAppraise',
            () => {
                const portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
                const message =
                  Utils.generateMessage('navigate', { page: '/migrationAppraise', webSession: portSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.portAppraise,
                    viewType: constant.VIEW_TYPE.report,
                    viewTitle: i18n.plugins_port_newmigration_appraise,
                    module: constant.TOOL_NAME_PORTING,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));
        // 响应用户右键文件发起源码迁移
        context.subscriptions.push(vscode.commands.registerCommand('extension.checkFile',
            async (uri) => {
                ToolPanelManager.rightKeySourceCodeCommandDealwith(context, uri);
            }));

        // 响应右键源码迁移整个目录
        context.subscriptions.push(vscode.commands.registerCommand('extension.checkProject', async (uri) => {
            const workspaceFolders: any = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                const inx = workspaceFolders.findIndex((folder: any) => {
                    const isContains = Utils.strAContainStrB(uri.fsPath, folder.uri.fsPath);
                    return isContains;
                });
                if (inx > -1) {
                    const workspaceFolderUri = workspaceFolders[inx].uri;
                    ToolPanelManager.rightKeySourceCodeCommandDealwith(context, workspaceFolderUri);
                }
            }

        }));

        // 响应亲和性扫目录描入口
        context.subscriptions.push(vscode.commands.registerCommand('extension.checkAffinity', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;

            if (workspaceFolders !== undefined && workspaceFolders[0] !== undefined) {
                const uri = workspaceFolders[0].uri;
                ToolPanelManager.rightKeySourceCodeCommandDealwith(context, uri, 'affinity');
            }
        }));

        // 响应亲和性扫描全目录入口
        context.subscriptions.push(vscode.commands.registerCommand('extension.checkSourceAffinity', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;

            if (workspaceFolders !== undefined && workspaceFolders[0] !== undefined) {
                const uri = workspaceFolders[0].uri;
                ToolPanelManager.rightKeySourceCodeCommandDealwith(context, uri, 'affinity');
            }
        }));

        // 响应源码扫描全目录入口
        context.subscriptions.push(vscode.commands.registerCommand('extension.checkSource', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;

            if (workspaceFolders !== undefined && workspaceFolders[0] !== undefined) {
                const uri = workspaceFolders[0].uri;
                ToolPanelManager.rightKeySourceCodeCommandDealwith(context, uri);
            }
        }));

    }

    /**
     * 右键源码迁移指令处理
     * @param context 必填参数 上下文消息
     * @param uri 必填参数 文件路径详细数据
     * @param checkType 可选参数，用来区分扫描类型
     */
    static rightKeySourceCodeCommandDealwith(context: vscode.ExtensionContext, uri: any, checkType?: string) {
        const filePath = uri.fsPath;
        const fileName = path.basename(filePath);
        if (Utils.checkUploadFileNameValidity(fileName)) {
            vscode.window.showErrorMessage(i18n.plugins_porting_tips_fileNameIsValidity);
            return;
        }
        const isSingle = false;
        let isAffinity = false;
        if (checkType === 'affinity') {
            isAffinity = true;
        }

        // 预检文件是否可以用于源码迁移分析
        const res = Utils.canPorting(filePath);
        if (res !== 'success') {
            Utils.showError(res);
            return;
        }

        let portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
        // 如果是首次登录只需要将语言传递给webview
        if (null === portSession) {
            portSession = {
                language: vscode.env.language
            };
        }
        // 判断是否配置服务器，没有跳转配置服务器
        if (!Utils.isPortServerConfigured(context)) {
            // 跳转配置服务器页面
            const message = Utils.generateMessage('navigate', {
                page: '/config',
                pageParams: { queryParams: { filePath, fileName, isSingle, isAffinity } }, webSession: portSession
            });
            const panelOption = {
                panelId: constant.PANEL_ID.portNonServerConfig,
                viewType: constant.VIEW_TYPE.serverConfig,
                viewTitle: i18n.port_configure_remote_server,
                module: constant.TOOL_NAME_PORTING,
                message
            };
            ToolPanelManager.createOrShowPanel(panelOption, context);
            return;
        }

        // 查询用户登录状态是否有效
        const option = {
            url: '/tools/version/',
            method: 'GET',
            subModule: 'porting'
        };
        Utils.requestData(context, option, 'porting', '', true).then((resp: any) => {
            if (resp.data && Object.keys(resp.data).length > 0) {
                if (checkType === 'affinity') {
                    // 打开增强功能
                    const message = Utils.generateMessage('navigate', {
                        page: '/PortingPre-check',
                        pageParams: { queryParams: { filePath, fileName, isSingle } }, webSession: portSession
                    });
                    const panelOption = {
                        panelId: constant.PANEL_ID.portPreCheck,
                        viewType: constant.VIEW_TYPE.portPreCheck,
                        viewTitle: i18n.port_create_affinity_task,
                        module: constant.TOOL_NAME_PORTING,
                        message
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, context);
                } else {
                    // 打开源码迁移页面
                    const message = Utils.generateMessage('navigate', {
                        page: '/home',
                        pageParams: { queryParams: { filePath, fileName, isSingle } }, webSession: portSession
                    });
                    const panelOption = {
                        panelId: constant.PANEL_ID.portCreatescSanTask,
                        viewType: constant.VIEW_TYPE.createTask,
                        viewTitle: i18n.port_create_source_task,
                        module: constant.TOOL_NAME_PORTING,
                        message
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, context);
                }

            } else {
                if (context.globalState.get('autoLoginConfig') && os.type() === 'Windows_NT') {
                    LoginManager.autoLogin(context);
                } else {
                    // 先跳转登录页面
                    LoginManager.clearCache(context, 'porting');
                    const message = Utils.generateMessage('navigate', {
                        page: '/login',
                        pageParams: { queryParams: { filePath, fileName, isSingle, isAffinity } },
                        webSession: portSession
                    });
                    const panelOption = {
                        panelId: constant.PANEL_ID.portNonLogin,
                        viewType: constant.VIEW_TYPE.login,
                        viewTitle: i18n.port_login,
                        module: constant.TOOL_NAME_PORTING,
                        message
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, context);
                }
            }
        });
    }

    /**
     * Porting打开依赖字典，扫描参数设置，用户管理，历史报告，软件迁移模板共用的panel
     *
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     */
    static openPortMultiPanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');

        const message = Utils.generateMessage('navigate',
            { page: '/portsettings', pageParams: { queryParams: params }, webSession: portSession });
        const panelOption = {
            panelId: constant.PANEL_ID.portMultipleview,
            viewType: constant.VIEW_TYPE.multipleview,
            viewTitle: i18n.port_setting,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        const toolPanel = ToolPanelManager.getToolPanelByPanelId(panelOption.panelId, constant.TOOL_NAME_PORTING);
        if (toolPanel) {
            ToolPanelManager.sentMessageToPanel(toolPanel, null, constant.TOOL_NAME_PORTING,
                { value: constant.NAVIGATE_PAGE.portsettings, type: params.innerItem });
        }
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开porting
     * @param fun webview路由名
     * @param context 插件上下文
     * @param params 参数
     */
    static openPortSoftWareBuildPanel(page: string, context: vscode.ExtensionContext, params: any) {
        const portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
        const message =
          Utils.generateMessage('navigate', { page, pageParams: { queryParams: params }, webSession: portSession });
        const panelOption = {
            panelId: constant.PANEL_ID.portSoftBuild,
            viewType: constant.VIEW_TYPE.createTask,
            viewTitle: i18n.port_software_build_task,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }
    /**
     * 打开porting
     * @param fun webview路由名
     * @param context 插件上下文
     * @param params 参数
     */
    static openPortHomePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
        const message = Utils.generateMessage('navigate',
          { page: '/home', pageParams: { queryParams: params },
              webSession: portSession });
        const panelOption = {
            panelId: constant.PANEL_ID.portCreatescSanTask,
            viewType: constant.VIEW_TYPE.createTask,
            viewTitle: i18n.port_create_source_task,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }
    /**
     * 打开porting
     * @param fun webview路由名
     * @param context 插件上下文
     * @param params 参数
     */
    static openPortAppraisePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
        const message = Utils.generateMessage('navigate', {
            page: '/migrationAppraise',
            pageParams: { queryParams: params }, webSession: portSession
        });
        const panelOption = {
            panelId: constant.PANEL_ID.portAppraise,
            viewType: constant.VIEW_TYPE.portAppraise,
            viewTitle: i18n.plugins_port_newmigration_appraise,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 给porting webview发送消息
     * @param fun webview路由名
     * @param context 插件上下文
     * @param params 参数
     */
    static sendMassageToPortHomePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const message = Utils.generateMessage('sendMessage', { value: 'isreportChange', type: 'isreportChange' });
        const panelOption = {
            panelId: constant.PANEL_ID.portCreatescSanTask,
            viewType: constant.VIEW_TYPE.createTask,
            viewTitle: i18n.port_create_source_task,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开字节对齐报告页面
     *
     * @param context 插件上下文
     */
    public static openByteAlignPortPanel(context: vscode.ExtensionContext, params: any) {
        let portSession: any = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');

        // 如果是首次登录只需要将语言传递给webview
        if (null === portSession) {
            portSession = {
                language: vscode.env.language
            };
        }

        const message = Utils.generateMessage('navigate',
          { page: '/bytereport',
              pageParams: params,
              webSession: portSession });
        const panelOption = {
            panelId: constant.PANEL_ID.portPreCheck,
            viewType: constant.VIEW_TYPE.portPreCheck,
            viewTitle: i18n.plugins_porting_enhance_function_byte_align,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }


    /**
     * 打开porting登录页面
     *
     * @param context 插件上下文
     */
    public static openPortLoginPanel(context: vscode.ExtensionContext, loginType: string) {
        let portSession: any = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');

        // 如果是首次登录只需要将语言传递给webview
        if (null === portSession) {
            portSession = {
                language: vscode.env.language
            };
        }

        // 通过logintype来区分是正常登录还是切换账户：
        const param = {
            queryParams: {
                loginType
            }
        };
        const message = Utils.generateMessage('navigate',
          { page: '/login', pageParams: param, webSession: portSession });
        const panelOption = {
            panelId: constant.PANEL_ID.portNonLogin,
            viewType: constant.VIEW_TYPE.login,
            viewTitle: i18n.port_login,
            module: constant.TOOL_NAME_PORTING,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 根据节点不同的contextvalue获取不同的页面地址
     *
     * @param module porting工具
     * @param contextValue 区分每个节点的类别
     */
    private static getPageForTreeNode(module: string, contextValue: string): string {
        let page = '/home';

        // 如果是porting工具，就要根据contextvalue页面
        if (constant.TOOL_NAME_PORTING === module) {
            switch (contextValue) {
                // 软件包构建
                case constant.CONTEXT_VALUES.softBuild:
                    page = '/analysisCenter';
                    break;
                // 软件迁移
                case constant.CONTEXT_VALUES.softPorting:
                    page = '/migrationCenter';
                    break;
                // 迁移评估
                case constant.CONTEXT_VALUES.portingAppraise:
                    page = '/migrationAppraise';
                    break;
                // 64位迁移预检
                case constant.CONTEXT_VALUES.portingPrecheck:
                    page = '/PortingPre-check';
                    break;
                // 源码迁移的历史报告
                case constant.CONTEXT_VALUES.portreport:
                    page = '/reportDetail';
                    break;
                // 软件迁移评估的历史报告
                case constant.CONTEXT_VALUES.depreport:
                    page = '/reportDepDetail';
                    break;
                // 软件包重构成功历史报告
                case constant.CONTEXT_VALUES.pkgRebuildS:
                    page = '/SoftwarePackageReport';
                    break;
                // 软件包重构失败历史报告
                case constant.CONTEXT_VALUES.pkgRebuildF:
                    page = '/SoftwarePackageReport';
                    break;
                default:
                    break;
            }
        }
        return page;
    }

    /**
     * 关闭对应工具的panel
     *
     * @param panleIds 待关闭的panelid列表
     * @param module 工具
     */
    static closePanel(panleIds: string[], module: string) {

        if (constant.TOOL_NAME_PORTING === module) {
            const deletePanels: Array<ToolPanel>
                = ToolPanelManager.portToolPanels.filter(item => panleIds.indexOf(item.getPanelId()) !== -1);
            for (const delPanel of deletePanels) {
                delPanel.getPanel().dispose();
            }
        }
    }
    /**
     * 更新panel
     *
     * @param toolPanel panel实例
     * @param module 模块
     */
    static async updatePanel(toolPanel: ToolPanel, context: vscode.ExtensionContext, option?: any) {
        const panelId: string = toolPanel.getPanelId();
        if (constant.TOOL_NAME_DEP === option.module) {
            switch (panelId) { // 迁移评估更新
                case constant.PANEL_ID.portAppraise:
                    // 调用后端接口获取报告详情
                    const res: any = await ReportHelper.getReportDetail(context, option.id, option.module);
                    // 提示错误信息
                    if (!res) {
                        ReportHelper.showErrorMessage(res);
                        break;
                    }
                    // 更新panel
                    toolPanel.getPanel().title = Utils.formatCreatedId(option.id);
                    toolPanel.setPanelId(option.id);
                    const webSesion: any = context.globalState.get(option.module + 'Session');
                    const msg = Utils.generateMessage('navigate',
                        {
                            page: '/reportDepDetail', pageParams: {
                                queryParams: {
                                    response: res, report: option.id,
                                }
                            }, webSesion
                        });
                    toolPanel.getPanel().webview.postMessage(msg);
                    break;

                default:
                    break;
            }
        }
        if (constant.TOOL_NAME_PORTING === option.module) {
            switch (panelId) {
                // 安装成功之后panel的更新
                case constant.PANEL_ID.portInstall:
                    toolPanel.getPanel().title = i18n.port_login;
                    toolPanel.setPanelId(constant.PANEL_ID.portNonLogin);
                    break;
                // 升级成功之后panel的更新
                case constant.PANEL_ID.portUpgrade:
                    toolPanel.getPanel().title = i18n.port_login;
                    toolPanel.setPanelId(constant.PANEL_ID.portNonLogin);
                    break;
                // 登录成功之后panel的更新，title改成扫描主页面
                case constant.PANEL_ID.portNonLogin:
                    toolPanel.getPanel().title = i18n.plugins_port_newmigration_appraise;
                    toolPanel.setPanelId(constant.PANEL_ID.portAppraise);
                    break;
                // 右键源码
                case constant.PANEL_ID.portCheckFile:
                    toolPanel.getPanel().title = i18n.port_create_source_task;
                    toolPanel.setPanelId(constant.PANEL_ID.portCreatescSanTask);
                    break;
                // 增强功能
                case constant.PANEL_ID.portPreCheck:
                    // 64 位预检
                    if (option.type === constant.ENHANCE_TYPE.PRECHECK) {
                        toolPanel.getPanel().title = i18n.plugins_porting_enhance_function_precheck;
                    } else if ((option.type === constant.ENHANCE_TYPE.BYTE_ALGIN)) {
                        toolPanel.getPanel().title = i18n.plugins_porting_enhance_function_byte_align;
                    } else if ((option.type === 'Affinity')) {
                        // 右键亲和扫描
                        toolPanel.getPanel().title = i18n.port_create_affinity_task;
                    }
                    break;
                case constant.PANEL_ID.portCreatescSanTask:
                    // 调用后端接口获取报告详情
                    const resp: any = await ReportHelper.getReportDetail(context, option.id, option.module);

                    // 提示错误信息
                    if (!resp) {
                        break;
                    }

                    // 更新panel
                    toolPanel.getPanel().title = Utils.formatCreatedId(option.id);
                    toolPanel.setPanelId(option.id);
                    const webSession: any = context.globalState.get(option.module + 'Session');
                    const message = Utils.generateMessage('navigate',
                        {
                            page: '/reportDetail', pageParams: {
                                queryParams: {
                                    response: resp, report: option.id,
                                }
                            }, webSession
                        });
                    toolPanel.getPanel().webview.postMessage(message);
                    break;
                // 修改密码之后，webview已经登出，需要除当前的panel之外的其他所有panel关闭，刷新当前panel的title，刷新左侧树
                case constant.PANEL_ID.portMultipleview:

                    // 删除除当前panel之外其他的panel
                    ToolPanelManager.closePanelsByRemained(option.module, new Array<string>(toolPanel.getPanelId()));

                    // 更新panel
                    toolPanel.getPanel().title = i18n.port_login;
                    toolPanel.setPanelId(constant.PANEL_ID.portNonLogin);

                    // 刷新左侧树
                    PortMenu.getInstance().refresh();
                    vscode.commands.executeCommand('setContext', 'isportlogined', Utils.isPortLogin(context));
                    break;
                default:
                    break;
            }
        }

        // 软件包重构
        if (constant.TOOL_NAME_SOFTWARE_PACKAGE === option.module) {
            switch (panelId) {
                case constant.PANEL_ID.portSoftBuild:
                    // 调用后端接口获取报告详情
                    const res: any = await ReportHelper.getReportDetail(context, option.id, option.module, true);
                    // 提示错误信息
                    if (!res) {
                        ReportHelper.showErrorMessage(res);
                        break;
                    }
                    // 更新panel
                    const resObj = JSON.parse(res.replace(/#/g, ':'));
                    toolPanel.getPanel().title = option.name + ' (' + resObj.data.report_time + ')';
                    toolPanel.setPanelId(option.id);
                    const webSession: any = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
                    const msg = Utils.generateMessage('navigate',
                        {
                            page: '/SoftwarePackageReport', pageParams: {
                                queryParams: {
                                    response: res,
                                    report: option.id,
                                    name: option.name
                                }
                            }, webSession
                        });
                    toolPanel.getPanel().webview.postMessage(msg);
                    break;
                default:
                    break;
            }
        }
    }
    /**
     * 关闭除remainPanelIds以外的panel
     *
     * @param module 模块
     * @param remainPanelIds 需要保留的panel的id,如传空则关闭所有的panel
     */
    static closePanelsByRemained(module: string, remainPanelIds: Array<string>) {
        const deletePanleIds: Array<string> = [];


        // 关闭Porting中remainPanelIds以外的panel
        if (constant.TOOL_NAME_PORTING === module) {
            // 获取需要关闭的panelid列表
            ToolPanelManager.portToolPanels.forEach(element => {
                if ((null === remainPanelIds || 0 === remainPanelIds.length)
                    || remainPanelIds.indexOf(element.getPanelId()) === -1) {
                    deletePanleIds.push(element.getPanelId());
                }
            });
        }

        // 关闭panels
        if (deletePanleIds.length !== 0) {
            ToolPanelManager.closePanel(deletePanleIds, module);
        }

    }

    private static needShowPanel(context: vscode.ExtensionContext, panelOption: any): boolean {
        for (const conf of constant.DESCLAIMER_BYPASS) {
            if (conf.module === panelOption.module) {
                const disclaimerConfirm = context.globalState.get(conf.desclaimer);
                if (disclaimerConfirm || conf.panels.indexOf(panelOption.panelId) !== -1) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 根据panelID 获取指定面板
     * @param panelId 面板ID
     * @param module 所属模块
     */
    public static getToolPanelByPanelId(panelId: any, module: string): ToolPanel {
        let panel: any;

        // 在当前打开面板中查找指定面板
        ToolPanelManager.portToolPanels.forEach(element => {
            if (element.getPanelId() === panelId) {
                panel = element;
                return panel;
            }
        });

        return panel;
    }

    /**
     * 发送订阅消息到指定panel
     * @param panelId 面板ID
     * @param module 模块
     * @param message 参考信息体{ value: '', type: 'itemNodeManaga' }，可完全自定义
     */
    public static sentMessageToPanel(toolPanel: ToolPanel, panelId: any, module: string, message: any) {
        toolPanel = (toolPanel) ? toolPanel : ToolPanelManager.getToolPanelByPanelId(panelId, module);
        toolPanel.getPanel().webview.postMessage(Utils.generateMessage('sendMessage', message));
    }


}
