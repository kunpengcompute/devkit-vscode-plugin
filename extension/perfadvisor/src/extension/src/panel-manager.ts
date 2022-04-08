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
import * as path from 'path';
import { I18nService } from './i18nservice';
import { Utils } from './utils';
import { messageHandler } from './webview-msg-handler';
import { LoginManager } from './login-manager';
import { PerfMenu } from './toolmenu/perf-menu';
import { ToolItemNode } from './toolmenu/tree-node';
import { ProjectHelper } from './helper/project-helper';
import { TaskHelper } from './helper/task-helper';
import JavaperfRecordManage from './javaperf-record-manage';
import JavaperfReportManage from './javaperf-report-manage';
import { DiagnoseCommandRegister } from './command-register/diagnose';
import { SysperfCommandRegister } from './command-register/sysperf';
import { TuningAssistantCommandRegister } from './command-register/tuning-assistant';
const i18n = I18nService.I18n();
/**
 * 插件面板类，用来打开webview
 */
class ToolPanel {
    private panelId: string;
    private panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];
    private module: string;
    // 是否需要接受通知消息，同步刷新页面数据
    private needAsycnUpdate = false;
    /**
     * 面板创建时间
     */
    private createTime: Date;

    constructor(panelOption: any, private disposeHandle: any, context: vscode.ExtensionContext) {
        this.panelId = panelOption.panelId;
        this.module = panelOption.module;
        this.needAsycnUpdate = panelOption.needAsycnUpdate || false;
        this.createTime = panelOption.createTime || new Date();

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
            if (this.module === constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR) {
                Utils.initPage(context, panel.webview, 'out/javaperfanalysis/index.html');
            } else {
                Utils.initPage(context, panel.webview, 'out/sysperfanalysis/index.html');
            }
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
     * 设置perfadvisor的html
     *
     * @param context 插件上下文
     */
    private setWebViewHtml(context: vscode.ExtensionContext) {
        if (this.module === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {
            this.panel.webview.html = Utils.getWebViewContent(context, 'out/sysperfanalysis/index.html');
        }
        if (this.module === constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR) {
            this.panel.webview.html = Utils.getWebViewContent(context, 'out/javaperfanalysis/index.html');
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
     * 获取接收通知标识
     */
    public getNeedAsycnUpdate() {
        return this.needAsycnUpdate;
    }

    /**
     * 获取面板创建时间
     */
    public getCreateTime() {
        return this.createTime;
    }

    /**
     * 关闭panel时的处理
     */
    public dispose() {
        this.disposeHandle(this);

        this.panel.dispose();

        // 首次登录异常操作校验
        LoginManager.firstLoginNoModefyPasswd();

        while (this.disposables.length) {
            const disPanel = this.disposables.pop();
            if (disPanel) {
                disPanel.dispose();
            }
        }
    }
}

export class ToolPanelManager {
    // 存储sysPerf的面板
    public static sysPerfToolPanels: Array<ToolPanel> = [];
    // 存储javaPerf的面板
    public static javaPerfToolPanels: Array<ToolPanel> = [];

    /**
     * 关闭webview所在的panel
     * @param toolPanel panel
     */
    static closeToolPanel(toolPanel: ToolPanel): void {
        // 将存储到全局的panel从list中去掉
        if (toolPanel.getModule() === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {
            ToolPanelManager.sysPerfToolPanels = ToolPanelManager.sysPerfToolPanels.filter(item =>
                item.getPanelId() !== toolPanel.getPanelId());
        }
        if (toolPanel.getModule() === constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR) {
            ToolPanelManager.javaPerfToolPanels = ToolPanelManager.javaPerfToolPanels.filter(item =>
                item.getPanelId() !== toolPanel.getPanelId());
            if (toolPanel.getPanelId() === constant.PANEL_ID.profiling) {
                for (const panel of ToolPanelManager.javaPerfToolPanels) {
                    const message = { cmd: 'stopProfiling' };
                    Utils.invokeCallback(panel.getPanel(), message, null);
                }
            }
        }
    }

    /**
     * 根据panelID 获取指定面板
     * @param panelId 面板ID
     * @param module 所属模块
     */
    public static getToolPanelByPanelId(panelId: any, module: string): ToolPanel {
        let panel: any;

        // 在当前打开面板中查找指定面板
        if (constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR === module) {
            ToolPanelManager.sysPerfToolPanels.forEach(element => {
                if (element.getPanelId() === panelId) {
                    panel = element;
                    return panel;
                }
            });
        } else {
            ToolPanelManager.javaPerfToolPanels.forEach(element => {
                if (element.getPanelId() === panelId) {
                    panel = element;
                    return panel;
                }
            });
        }

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

    /**
     * 打开选择的webview
     * param panelOption webview信息
     * param context vscode上下文信息
     */
    public static createOrShowPanel(panelOption: any, context: vscode.ExtensionContext) {
        const showPanel = this.needShowPanel(context, panelOption);
        if (!showPanel) {
            return undefined;
        }

        if (panelOption.module === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {

            // 用于处理联合分析创建任务，临时解决
            const linkageToolPanel = ToolPanelManager.sysPerfToolPanels.find(toolPanel => {
                return (toolPanel.getPanelId() as string).includes('createLinkageTask');
            });
            const isLinkageExisted = Boolean(linkageToolPanel?.getPanelId());
            const isLinkageSym = (panelOption.panelId).includes('createLinkageTask');
            if (isLinkageExisted && isLinkageSym) {
                linkageToolPanel?.getPanel?.()?.reveal();
                return linkageToolPanel;
            }

            for (const toolPanel of ToolPanelManager.sysPerfToolPanels) {
                if (toolPanel.getPanelId() === panelOption.panelId) {
                    // 临时解决创建工程页面图片丢失的情况
                    if (panelOption.panelId !== 'createProject') {
                        toolPanel.getPanel().webview.postMessage(panelOption.message);
                    }
                    toolPanel.getPanel().reveal();
                    return toolPanel;
                }
            }
            const newToolPanel: ToolPanel = new ToolPanel(panelOption, ToolPanelManager.closeToolPanel, context);
            const newPanelId = newToolPanel.getPanelId().split('-');

            // FIX alreadyExistPanelId 的为真判断会使有的窗口不能被重复打开，只用通过简单的过滤来
            if (!newPanelId.includes('tuninghelperInfoLog')
                && !newPanelId.includes('TuninghelperProcessPidDetail')
                && !newPanelId.some(item => item.includes('TASKCONTRAST'))
            ) {
                const alreadyExistPanelId = ToolPanelManager.sysPerfToolPanels.find(item => {
                    const oldPanelId = item.getPanelId();
                    return newToolPanel.getPanelId() === oldPanelId;
                });
                if (alreadyExistPanelId) {
                    ToolPanelManager.closePanel([alreadyExistPanelId.getPanelId()], constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
                }
            }
            ToolPanelManager.sysPerfToolPanels.push(newToolPanel);
            return newToolPanel;
        }
        if (panelOption.module === constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR) {
            for (const toolPanel of ToolPanelManager.javaPerfToolPanels) {
                if (toolPanel.getPanelId() === panelOption.panelId) {
                    if (toolPanel.getPanelId() === 'profiling') {
                        vscode.window.showInformationMessage(i18n.plugins_perf_java_profiling_dulTip);
                    }
                    if (panelOption.message) {
                        toolPanel.getPanel().webview.postMessage(panelOption.message);
                    }
                    toolPanel.getPanel().reveal();
                    return toolPanel;
                    // 在已导入在线分析记录的情况下，又打开新的在线分析
                } else if (toolPanel.getPanelId() === constant.PANEL_ID.downloadProfile
                    && panelOption.panelId === constant.PANEL_ID.profiling) {
                    vscode.window.showWarningMessage(i18n.plugins_perf_java_profiling_dulTip2,
                        i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel).then((select) => {
                            if (select === i18n.plugins_sysperf_button_confirm) {
                                ToolPanelManager.closePanel(
                                    [constant.PANEL_ID.downloadProfile],
                                    constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
                                ToolPanelManager.javaPerfToolPanels.push(
                                    new ToolPanel(panelOption, ToolPanelManager.closeToolPanel, context)
                                );
                            }
                        });
                    return undefined;
                }
            }
            const newToolPanel: ToolPanel = new ToolPanel(panelOption, ToolPanelManager.closeToolPanel, context);
            ToolPanelManager.javaPerfToolPanels.push(newToolPanel);
            return newToolPanel;
        }

        return undefined;
    }

    /**
     * perfadvisor响应不同的命令来打开panel
     *
     * @param context 插件上下文
     */
    public static createOrShowPanelForPerfCommand(context: vscode.ExtensionContext) {

        // 打开服务器配置panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.perfadvisorserverconfig',
            () => {
                const sysPerfSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate',
                    { page: '/' + constant.NAVIGATE_PAGE.config, webSession: sysPerfSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.perfNonServerConfig,
                    viewType: constant.VIEW_TYPE.serverConfig,
                    viewTitle: i18n.plugins_common_configure_remoteServer,
                    module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));

        // 打开免费试用远程服务器panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.perfadvfreetrialremoteenvironment', () => {
            const sysPerfSession = {
                language: vscode.env.language
            };
            const message = Utils.generateMessage('navigate',
                { page: '/' + constant.NAVIGATE_PAGE.freeTrialProcessEnvironment, webSession: sysPerfSession });
            const panelOption = {
                panelId: constant.PANEL_ID.perfFreeTrialRemoteEnvironment,
                viewType: constant.VIEW_TYPE.freeTrialRemoteEnvironment,
                viewTitle: i18n.plugins_perfadvisor_free_trial_remote_environment,
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                message
            };
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }));

        // 打开登录panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.perfadvisorlogin',
            () => {
                ToolPanelManager.openPerfLoginPanel(context, 'login');
            }));

        // 升级性能分析工具
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.perfUpgrade',
            () => {
                const sysPerfSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate', { page: '/upgrade', webSession: sysPerfSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.perfUpgrade,
                    viewType: constant.VIEW_TYPE.upgrade,
                    viewTitle: i18n.plugins_common_upgrade_remoteServer,
                    module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));

        // 卸载性能分析工具
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.perfUninstall',
            () => {
                const sysPerfSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate', { page: '/uninstall', webSession: sysPerfSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.perfUninstall,
                    viewType: constant.VIEW_TYPE.uninstall,
                    viewTitle: i18n.plugins_common_uninstall_remoteServer,
                    module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));
        // 建议反馈
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.feedback',
            () => {
                JavaperfRecordManage.openAdviceLink(context, 'sysPerf');
            }));
        // 免责声明
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.perfDisclaimer',
            () => {
                const sysPerfSession = {
                    language: vscode.env.language
                };
                const message = Utils.generateMessage('navigate', { page: '/disclaimer', webSession: sysPerfSession });
                const panelOption = {
                    panelId: constant.PANEL_ID.perDeclare,
                    viewType: constant.VIEW_TYPE.perfdisclaimer,
                    viewTitle: i18n.plugins_perfadvisor_title_disclaimer,
                    module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                    message
                };
                ToolPanelManager.createOrShowPanel(panelOption, context);
            }));

        DiagnoseCommandRegister.register(context);
        SysperfCommandRegister.register(context);
        // 调优助手指令注册
        TuningAssistantCommandRegister.register(context);

        // 响应打开节点管理，任务模板管理，预约任务管理，运行日志和操作日志共用一个panel
        ToolPanelManager.registerSysPerfManageCmds(context);

        // 响应打开用户管理，公共运行日志，公共操作日志，系统配置共用一个panel
        ToolPanelManager.registerPerfManageCmds(context);

        // 注册工程管理导航栏命令
        ToolPanelManager.sysPerfProjectManagement(context);

        // 注册任务管理导航栏命令
        ToolPanelManager.sysPerfTaskManagement(context);

        // 响应打开性能分析登出事件
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.perfLogout', () => {
            vscode.window.showWarningMessage(
                i18n.plugins_sysperf_message_logout, i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
                .then(async select => {
                    if (select === i18n.plugins_sysperf_button_confirm) {
                        LoginManager.logOutCurrentUser(context, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
                    }
                });
        }));

        // 注册JavaPerf管理命令
        ToolPanelManager.registerJavaPerfManageCmds(context);

        // 响应点击查看用户事件
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.showUser', () => {
            const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const rolename = Utils.isAdmin(context) ? i18n.plugins_common_show_user_admin_user : i18n.plugins_common_show_user_normal_user;
            vscode.window.showInformationMessage(i18n.plugins_common_show_user_current_user + session.username + '(' + rolename + ')',
                i18n.plugins_common_show_user_btn_true).then((select) => {
                    if (select === i18n.plugins_common_show_user_btn_true) { }
                });
        }));

        // 响应点击左侧树事件
        context.subscriptions.push(vscode.commands.registerCommand('perfItemclick', (itemNode) => {
            if (itemNode.module === constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR) {
                ToolPanelManager.handleJavaPerfTreeNodeClick(context, itemNode);
            } else {
                ToolPanelManager.handleSysPerfTreeNodeClick(context, itemNode);
            }
        }));
    }
    /**
     * 隐藏terminal
     * @param context: 插件上下文
     * @param itemNode: 某个节点信息
     */
    public static handleSysPerfTreeNodeClick(context: vscode.ExtensionContext, itemNode: any) {
        // 不同的树节点打开的页面不同，需要根据contextvalue和模块来获取页面地址
        let page = ToolPanelManager.getPageForTreeNode(itemNode.module, itemNode.contextValue, itemNode.selfInfo, itemNode.anaType);
        let title = itemNode.parentLabel ?
            itemNode.parentLabel + '-' + itemNode.label + '-' + itemNode.parentName : itemNode.label + '-' + i18n.plugins_sysperf_detail;

        // 兼容联动分析
        if (itemNode?.selfInfo?.['analysis-type'] === 'task_contrast') {
            title = itemNode.label;
        }

        let viewType = constant.VIEW_TYPE.sysPerfProjectTaskNode;

        const panelId = ToolPanelManager.getPanelId(itemNode);
        // 发送的信息
        const sendMessage: any = ToolPanelManager.getSendMsg(itemNode, panelId);
        let queryParams: any = { sendMessage };
        if (sendMessage === '') {
            if (constant.CONTEXT_VALUES.noProject !== itemNode.contextValue) {
                return;
            }

            page = '/createProject';
            title = i18n.plugins_sysperf_term_new_project;
            viewType = constant.VIEW_TYPE.createProject;
            queryParams = { projectName: title, panelId };
        }

        const message = Utils.generateMessage('navigate',
            {
                page, pageParams: { queryParams },
                webSession: context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session')
            });

        const panelOption = {
            panelId,
            viewType,
            viewTitle: title,
            module: itemNode.module,
            needAsycnUpdate: true,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 内存诊断任务节点点击事件
     */
    public static handleDiagnoseTaskNodeClick(context: vscode.ExtensionContext, itemNode: any) {
        // 不同的树节点打开的页面不同，需要根据contextvalue和模块来获取页面地址
        let page = '/' + constant.NAVIGATE_PAGE.home;
        let title = itemNode.parentLabel ?
            itemNode.parentLabel + '-' + itemNode.label + '-' + itemNode.parentName : itemNode.label + '-' + i18n.plugins_sysperf_detail;
        let viewType = constant.VIEW_TYPE.sysPerfProjectTaskNode;

        const panelId = ToolPanelManager.getPanelId(itemNode);
        // 发送的信息
        const sendMessage: any = ToolPanelManager.getSendMsg(itemNode, panelId);
        let queryParams: any = { sendMessage };
        if (sendMessage === '') {
            if (constant.CONTEXT_VALUES.noProject !== itemNode.contextValue) {
                return;
            }

            page = '/createProject';
            title = i18n.plugins_sysperf_term_new_project;
            viewType = constant.VIEW_TYPE.createProject;
            queryParams = { projectName: title, panelId };
        }

        const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate',
            {
                page, pageParams: { queryParams },
                webSession: {
                    ...sysSession,
                    toolType: constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE
                }
            });

        const panelOption = {
            panelId,
            viewType,
            viewTitle: title,
            module: itemNode.module,
            needAsycnUpdate: true,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    private static getSendMsg(itemNode: any, panelId: any) {
        const linkageTask = [
            constant.CONTEXT_VALUES.linkageTask,
            constant.CONTEXT_VALUES.linkageTaskAdmin,
            constant.CONTEXT_VALUES.linkageTaskSelf,
        ];
        let sendMessage = '';
        if (constant.CONTEXT_VALUES.sysPerfProjectTaskNode === itemNode.contextValue ||
            linkageTask.includes(itemNode.contextValue)
        ) {
            const msg: any = { taskId: itemNode.parentId, selfInfo: itemNode.selfInfo, panelId };
            if (linkageTask.includes(itemNode.contextValue)) {
                msg.projectName = itemNode.parentName;
            }
            sendMessage = JSON.stringify(msg).replace(/:/g, '#');
        } else if (
            constant.CONTEXT_VALUES.sysPerfProject_self === itemNode.contextValue ||
            constant.CONTEXT_VALUES.sysPerfProject_noself_admin === itemNode.contextValue ||
            constant.CONTEXT_VALUES.sysPerfProject === itemNode.contextValue
        ) {
            sendMessage = JSON.stringify({
                projectId: itemNode.id,
                projectName: itemNode.label,
                panelId,
                isSelfProject: constant.CONTEXT_VALUES.sysPerfProject_self === itemNode.contextValue
            }).replace(/:/g, '#');
        }

        return sendMessage;
    }

    private static getPanelId(itemNode: any) {
        let panelId = (itemNode.selfInfo?.taskParam?.projectname ? itemNode.selfInfo?.taskParam?.projectname
            : itemNode.parentName ? itemNode.parentName : '') + '-' +
            ((itemNode.parentLabel) ? itemNode.parentLabel : '') + '-' + ((itemNode.label) ? itemNode.label : '');
        if (constant.CONTEXT_VALUES.sysPerfProjectTaskNode === itemNode.contextValue ||
            constant.CONTEXT_VALUES.linkageTask === itemNode.contextValue ||
            constant.CONTEXT_VALUES.linkageTaskAdmin === itemNode.contextValue ||
            constant.CONTEXT_VALUES.linkageTaskSelf === itemNode.contextValue) {
            panelId = panelId.substring(0, panelId.lastIndexOf('-') + 1) +
                (itemNode.selfInfo?.nodeNickName ? itemNode.selfInfo?.nodeNickName : '') + (itemNode.label ? ('-' + itemNode.label) : '');
        } else if (constant.CONTEXT_VALUES.sysPerfProject_self === itemNode.contextValue ||
            constant.CONTEXT_VALUES.sysPerfProject_noself_admin === itemNode.contextValue) {
            // 自己和管理员可查看
            panelId = itemNode.label + '-';
        } else if (constant.CONTEXT_VALUES.noProject === itemNode.contextValue) {
            // 无工程，点击新建工程
            panelId = constant.PANEL_ID.createProject;
        }

        return panelId;
    }

    private static handleJavaPerfTreeNodeClick(context: vscode.ExtensionContext, itemNode: any) {
        // 如果点击离线采样分析记录，判断是否为当前用户记录，否则不允查看
        if (!((itemNode.parentId.indexOf('samplingRecords') > -1 &&
            itemNode.contextValue === constant.CONTEXT_VALUES.javaPerfSamplingDelete) ||
            (itemNode.parentId.indexOf('heapdumpReport') > -1 &&
                itemNode.contextValue === constant.CONTEXT_VALUES.javaPerfHeapdumpDelete) ||
            (itemNode.parentId.indexOf('threaddumpReport') > -1 &&
                itemNode.contextValue === constant.CONTEXT_VALUES.javaPerfThreaddumpDelete) ||
            (itemNode.parentId.indexOf('gclogReport') > -1 &&
                itemNode.contextValue === constant.CONTEXT_VALUES.javaPerfGclogDelete))) {
            const panel = ToolPanelManager.buildPanelOption(itemNode, context);
            ToolPanelManager.createOrShowPanel(panel, context);
        }
    }

    private static buildPanelOption(itemNode: ToolItemNode, context: vscode.ExtensionContext) {
        this.buildPanelPageParam(itemNode);
        let nodePageMapId = itemNode.parentId;
        if (itemNode.parentId.indexOf('samplingRecords') > -1) {
            nodePageMapId = 'samplingRecords';
        } else if (itemNode.parentId.indexOf('heapdumpReport') > -1) {
            nodePageMapId = 'heapdumpReport';
        } else if (itemNode.parentId.indexOf('threaddumpReport') > -1) {
            nodePageMapId = 'threaddumpReport';
        } else if (itemNode.parentId.indexOf('gclogReport') > -1) {
            nodePageMapId = 'gclogReport';
        }
        const message = Utils.generateMessage('navigate',
            {
                page: constant.NODE_PAGE_MAP.get(nodePageMapId).page + (constant.NODE_PAGE_MAP.get(nodePageMapId).param || ''),
                pageParams: {
                    queryParams: {
                        sendMessage: JSON.stringify({
                            taskId: itemNode.id,
                            selfInfo: itemNode.selfInfo,
                            panelId: itemNode.label,
                            alarmType: context.globalState.get('alarmType')
                        }).replace(/:/g, '#'),
                        taskId: itemNode.id
                    }
                }, webSession: context.globalState.get(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR + 'Session')
            });
        const panelOption = {
            panelId: itemNode.id,
            viewTitle: itemNode.label,
            module: itemNode.module,
            message
        };

        return panelOption;
    }
    private static buildPanelPageParam(itemNode: ToolItemNode) {
        if (itemNode.parentId === 'profillingRecords') {
            constant.NODE_PAGE_MAP.get(itemNode.parentId).param = itemNode.selfInfo.jvms[0].name;
        }
    }
    private static registerPerfManageCmds(context: vscode.ExtensionContext) {

        constant.PREF_SETTING_COMMAND_TERM.forEach(item => {
            context.subscriptions.push(vscode.commands.registerCommand(item.command,
                () => {
                    ToolPanelManager.openPerfMultiPanel(item.func, context, item.param);
                }));
        });
    }

    private static registerSysPerfManageCmds(context: vscode.ExtensionContext) {

        constant.SYS_PREF_SETTING_COMMAND_TERM.forEach(item => {
            context.subscriptions.push(vscode.commands.registerCommand(item.command,
                () => {
                    ToolPanelManager.openSysPerfMultiPanel(item.func, context, item.param);
                }));
        });
    }

    private static registerJavaPerfManageCmds(context: vscode.ExtensionContext) {
        constant.PERF_JAVA_MANAGE_PAGE_MAP.forEach((value, key) => {
            if (value instanceof Object) {
                value.cmdParam.forEach((cmdParam: any) => {
                    if (cmdParam.cmdReg) {
                        context.subscriptions.push(vscode.commands.registerCommand(cmdParam.cmd,
                            (treeItem: ToolItemNode) => {
                                if (cmdParam.cmd === 'javaPerf.view.item.stopProfiling') {
                                    JavaperfRecordManage.stopProfiling();
                                } else if (cmdParam.cmd === 'javaPerf.view.item.importProfiling') {
                                    JavaperfRecordManage.importProfiling(context);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.exportProfiling') {
                                    JavaperfRecordManage.exportProfiling();
                                } else if (cmdParam.cmd === 'javaPerf.view.item.deleteSampling') {
                                    JavaperfRecordManage.deleteSampling(context, treeItem?.id, treeItem?.label as string,
                                        treeItem?.userData);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.importSampling') {
                                    JavaperfRecordManage.importSampling(context);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.exportSampling') {
                                    JavaperfRecordManage.exportSampling(context, treeItem?.id, treeItem?.label as string);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.addTargetEnvironment') {
                                    ToolPanelManager.openTargetEnvironment(value, context, cmdParam.param);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.deleteHeapdumpReport') {
                                    JavaperfReportManage.deleteHeapdumpReport(
                                        context,
                                        treeItem?.id,
                                        treeItem?.label as string,
                                        treeItem?.userData
                                    );
                                } else if (cmdParam.cmd === 'javaPerf.view.item.exportHeapdumpReport') {
                                    JavaperfReportManage.exportHeapdumpReport(context, treeItem?.selfInfo, treeItem?.label as string);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.importHeapdumpReport') {
                                    JavaperfReportManage.importHeapdumpReport(context);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.deleteThreaddumpReport') {
                                    JavaperfReportManage.deleteThreaddumpReport(context, treeItem?.id,
                                        treeItem?.label as string, treeItem?.userData);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.exportThreaddumpReport') {
                                    JavaperfReportManage.exportThreaddumpReport(context, treeItem?.selfInfo, treeItem?.label as string);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.importThreaddumpReport') {
                                    JavaperfReportManage.importThreaddumpReport(context);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.deleteGclogReport') {
                                    JavaperfReportManage.deleteGclogReport(
                                        context, treeItem?.id,
                                        treeItem?.label as string,
                                        treeItem?.userData
                                    );
                                } else if (cmdParam.cmd === 'javaPerf.view.item.exportGclogReport') {
                                    JavaperfReportManage.exportGclogReport(context, treeItem?.selfInfo, treeItem?.label as string);
                                } else if (cmdParam.cmd === 'javaPerf.view.item.importGclogReport') {
                                    JavaperfReportManage.importGclogReport(context);
                                } else {
                                    ToolPanelManager.openJavaPerfManagePanel(value, context, cmdParam.param);
                                }
                            }));
                    }
                });
            }
        });
    }

    /**
     * 打开添加目标环境页面
     * @param cmdConfig cmd
     * @param context 上下文
     * @param params 入参
     */
    public static openTargetEnvironment(cmdConfig: any, context: vscode.ExtensionContext, params: any) {
        const javaPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate',
            { page: cmdConfig.page, pageParams: { queryParams: params }, webSession: javaPerfSession });
        const panelOption = {
            message
        };
        Object.assign(panelOption, cmdConfig.panelOption);

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开Java设置页面
     * @param cmdConfig cmd
     * @param context 上下文
     * @param params 入参
     */
    public static openJavaPerfManagePanel(cmdConfig: any, context: vscode.ExtensionContext, params: any) {
        const javaPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate',
            { page: cmdConfig.page, pageParams: { queryParams: params }, webSession: javaPerfSession });
        const panelOption = {
            message
        };
        Object.assign(panelOption, cmdConfig.panelOption);

        const toolPanel = ToolPanelManager.getToolPanelByPanelId(
            cmdConfig.panelOption.panelId, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        if (toolPanel) {
            ToolPanelManager.sentMessageToPanel(toolPanel, null, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                { value: constant.NAVIGATE_PAGE.javaperfsetting, type: params.innerItem });
        }

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * sysPerf工程管理命令事件注册
     * @param context 插件上下文
     */
    private static sysPerfProjectManagement(context: vscode.ExtensionContext) {
        // 创建新工程
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfCreateProject',
            () => {
                ToolPanelManager.openSysPerfProjectManagePanel('createProject', context,
                    { projectName: i18n.plugins_sysperf_term_new_project });
            }));

        // 修改工程
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfModifyProject',
            async (treeItem: ToolItemNode) => {
                if (treeItem) {
                    ToolPanelManager.openSysPerfProjectManagePanel('modifyProject', context,
                        { projectId: treeItem.id, projectName: treeItem.label, viewTitle: treeItem.label + '-' });
                }
            }));

        // 删除工程
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfDeleteProject',
            async (treeItem: ToolItemNode) => {
                if (treeItem) {
                    ProjectHelper.deleteProject(treeItem.label as string, context, treeItem.id);
                }
            }));
    }

    /**
     * sysPerf任务管理命令事件注册
     * @param context 插件上下文
     */
    private static sysPerfTaskManagement(context: vscode.ExtensionContext) {
        // 打开创建任务主页面panel
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfCreateTask',
            async (treeItem: ToolItemNode) => {
                if (treeItem) {
                    ToolPanelManager.openSysPerfTaskManagePanel(constant.NAVIGATE_PAGE.home, context,
                        { projectId: treeItem.id, projectName: treeItem.label, operation: 'createTask' });
                }
            }));

        // 导入任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfImportTask',
            async (treeItem: ToolItemNode) => {
                if (treeItem) {
                    ToolPanelManager.openSysPerfTaskManagePanel(constant.NAVIGATE_PAGE.importTask, context,
                        {
                            projectId: treeItem.id,
                            projectName: treeItem.parentLabel,
                            operation: 'importTask',
                            taskName: i18n.plugins_sysperf_project.importTask
                        });
                }
            }));

        // 导出任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfExportTask',
            async (treeItem: ToolItemNode) => {
                if (treeItem && treeItem.label) {
                    TaskHelper.exportTask(context, 'export',
                        {
                            projectname: treeItem.parentLabel,
                            taskname: treeItem.selfInfo.taskname
                        });
                }
            }));

        // 修改任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfModifyTask',
            async (treeItem: ToolItemNode) => {
                const samplingState = 'Sampling';
                if (treeItem && treeItem.status !== samplingState) {
                    ToolPanelManager.openSysPerfTaskManagePanel(constant.NAVIGATE_PAGE.home, context,
                        {
                            timeWaiting: true,
                            projectId: treeItem.parentId,
                            projectName: treeItem.parentLabel,
                            taskId: treeItem.selfInfo.id,
                            taskName: treeItem.label,
                            analysisType: treeItem.selfInfo['analysis-type'],
                            operation: 'modifyTask'
                        });
                } else {
                    // 如果任务正在分析中，禁止修改
                    if (treeItem) {
                        vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.plugins_sysperf_message_task_forbidden_modify,
                            { 0: treeItem.label }));
                    }
                }

            }));

        // 立即分析任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfRunTask',
            async (treeItem: ToolItemNode) => {
                if (treeItem) {
                    TaskHelper.runTask(treeItem.parentLabel, treeItem.label as string, context, treeItem.selfInfo);
                }
            }));

        // 停止任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfStopTask',
            async (treeItem: ToolItemNode) => {
                if (treeItem) {
                    TaskHelper.stopTask(treeItem.parentLabel, treeItem.label as string, context, treeItem.selfInfo);
                }
            }));

        // 重新分析任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfReanalysisTask',
            async (treeItem: ToolItemNode) => {
                if (treeItem) {
                    ToolPanelManager.openSysPerfTaskManagePanel(constant.NAVIGATE_PAGE.home, context,
                        {
                            projectId: treeItem.parentId,
                            projectName: treeItem.parentLabel,
                            taskId: treeItem.selfInfo.id,
                            taskName: treeItem.label,
                            analysisType: treeItem.selfInfo['analysis-type'],
                            operation: 'reanalysisTask'
                        });
                }
            }));

        // 删除任务
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.sysPerfDeleteTask',
            async (treeItem: ToolItemNode) => {
                const samplingState = 'Sampling';
                if (treeItem) {
                    if (treeItem.status !== samplingState) {
                        TaskHelper.deleteTask(treeItem.label as string, context, treeItem.selfInfo.id);
                    } else {
                        // 如果任务正在分析中，禁止删除
                        vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.plugins_sysperf_message_task_forbidden_delete,
                            { 0: treeItem.label }));
                    }
                }
            }));
    }

    /**
     * 打开创建新工程, 修改工程和修改工程的panel
     *
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     */
    static openSysPerfProjectManagePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        const panelId = (params.viewTitle) ? params.viewTitle : constant.PANEL_ID[fun];
        params.panelId = panelId;

        const message = Utils.generateMessage('navigate',
            { page: '/' + fun, pageParams: { queryParams: params }, webSession: sysPerfSession });
        const panelOption = {
            panelId,
            viewType: constant.VIEW_TYPE[fun],
            viewTitle: params.projectName,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            needAsycnUpdate: true,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开创建新任务, 修改任务的panel
     *
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     */
    static openSysPerfTaskManagePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let panelId = ((params.projectName) ? params.projectName : '');
        if (params.operation === 'reanalysisTask' || params.timeWaiting) {
            panelId += '-' + ((params.taskName) ? params.taskName : '');
        } else {
            panelId += '-' + ((params.taskName) ? params.taskName : '') + '-' + new Date().getTime();
        }

        params.panelId = panelId;
        const message = Utils.generateMessage('navigate',
            {
                page: '/' + fun, pageParams:
                    { queryParams: params }, webSession: sysPerfSession
            });
        const panelOption = {
            panelId,
            viewType: constant.VIEW_TYPE.perfCreateTask,
            viewTitle: (params.taskName) ? params.taskName : i18n.plugins_sysperf_title_createtask,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 内存诊断打开创建新任务, 修改任务的panel
     *
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     */
    static openDiagnoseTaskManagePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let panelId = ((params.projectName) ? params.projectName : '');
        if (params.operation === 'reanalysisTask' || params.timeWaiting) {
            panelId += '-' + ((params.taskName) ? params.taskName : '');
        } else {
            panelId += '-' + ((params.taskName) ? params.taskName : '') + '-' + new Date().getTime();
        }

        params.panelId = panelId;
        const message = Utils.generateMessage('navigate', {
            page: '/' + fun,
            pageParams: { queryParams: params },
            webSession: {
                ...sysPerfSession,
                toolType: constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE
            }
        });
        const panelOption = {
            panelId,
            viewType: constant.VIEW_TYPE.perfCreateTask,
            viewTitle: (params.taskName) ? params.taskName : i18n.plugins_sysperf_title_createtask,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 调优助手打开创建新任务, 修改任务的panel
     *
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     */
    static openTuningHelperTaskManagePanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let panelId = ((params.projectName) ? params.projectName : '');
        if (params.timeWaiting) {
            panelId += '-' + ((params.taskName) ? params.taskName : '');
        } else {
            panelId += '-' + ((params.taskName) ? params.taskName : '') + '-' + new Date().getTime();
        }
        params.panelId = panelId;
        const message = Utils.generateMessage('navigate', {
            page: '/' + fun,
            pageParams: { queryParams: params },
            webSession: {
                ...sysPerfSession,
                toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
            }
        });
        const titleList = {
            createTuninghelperTask: i18n.plugins_sysperf_title_createtask,
            reanalyzeTask: `${i18n.plugins_sysperf_title_reanalyzeTask} ${params.taskName}`,
            reanalyzeServer: `${i18n.plugins_sysperf_title_reanalyzeServer} ${params.label}`,
        };
        const pannelTitle = titleList[params.operation];
        const panelOption = {
            panelId,
            viewType: constant.VIEW_TYPE.perfCreateTask,
            viewTitle: pannelTitle,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }
    /**
     * 打开创建任务分析进度页面
     *
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     */
    static openSysPerfTaskLoadingPanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const panelId = ((params.projectName) ? params.projectName : '') + '-' + ((params.taskName) ? params.taskName : '') + '-' +
            constant.PANEL_ID.loading;
        params.panelId = panelId;
        const sendMessage = JSON.stringify({ operation: 'immediateAnal', params }).replace(/:/g, '#');
        const message = Utils.generateMessage('navigate',
            {
                page: '/' + constant.NAVIGATE_PAGE.loading, pageParams:
                    { queryParams: { sendMessage } }, webSession: sysPerfSession
            });

        const panelOption = {
            panelId,
            viewType: constant.VIEW_TYPE.loading,
            viewTitle: params.taskName,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开节点管理，任务模板管理，预约任务管理，运行日志和操作日志共用的panel
     *
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     */
    static openSysPerfMultiPanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate',
            { page: '/' + constant.NAVIGATE_PAGE.sysperfSettings, pageParams: { queryParams: params }, webSession: sysPerfSession });
        const panelOption = {
            panelId: constant.PANEL_ID.sysPerfMultiple,
            viewType: constant.VIEW_TYPE.sysPerfMultiple,
            viewTitle: i18n.sysperf_setting,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            needAsycnUpdate: true,
            message
        };

        const toolPanel = ToolPanelManager.getToolPanelByPanelId(panelOption.panelId, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (toolPanel) {
            ToolPanelManager.sentMessageToPanel(toolPanel, null, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                { value: constant.NAVIGATE_PAGE.sysperfSettings, type: params.innerItem });
        }

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开节点管理，任务模板管理，预约任务管理，运行日志和操作日志共用的panel
     *
     * @param context 插件上下文
     */
    static openDiagnoseSettingPanel(context: vscode.ExtensionContext, params: any) {
        const sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate', {
            page: '/' + constant.NAVIGATE_PAGE.sysperfSettings,
            pageParams: { queryParams: params },
            webSession: {
                ...sysPerfSession,
                toolType: constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE
            }
        });
        const panelOption = {
            panelId: constant.PANEL_ID.diagnoseMultiple,
            viewType: constant.VIEW_TYPE.diagnoseMultiple,
            viewTitle: i18n.diagnose_setting,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            needAsycnUpdate: true,
            message
        };

        const toolPanel = ToolPanelManager.getToolPanelByPanelId(panelOption.panelId, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (toolPanel) {
            ToolPanelManager.sentMessageToPanel(toolPanel, null, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                { value: constant.NAVIGATE_PAGE.sysperfSettings, type: params.innerItem });
        }

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 调优助手-打开节点管理，任务模板管理，预约任务管理，运行日志和操作日志共用的panel
     *
     * @param context 插件上下文
     */
    static openTuningAssistantSettingPanel(context: vscode.ExtensionContext, params: any) {
        const sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate', {
            page: '/' + constant.NAVIGATE_PAGE.sysperfSettings,
            pageParams: { queryParams: params },
            webSession: {
                ...sysPerfSession,
                toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
            }
        });
        const panelOption = {
            panelId: constant.PANEL_ID.tuningAssistantMultiple,
            viewType: constant.VIEW_TYPE.tuningAssistantMultiple,
            viewTitle: i18n.plugins_tuning_assistant_setting,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            needAsycnUpdate: true,
            message
        };

        const toolPanel = ToolPanelManager.getToolPanelByPanelId(panelOption.panelId, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (toolPanel) {
            ToolPanelManager.sentMessageToPanel(toolPanel, null, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                { value: constant.NAVIGATE_PAGE.sysperfSettings, type: params.innerItem });
        }

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开用户管理，操作日志，系统配置共用的panel
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     * @param params 入参
     */
    private static openPerfMultiPanel(fun: string, context: vscode.ExtensionContext, params: any) {
        const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate',
            { page: '/tunset', pageParams: { queryParams: params }, webSession: sysPerfSession });
        const panelOption = {
            panelId: constant.PANEL_ID.perfMultiple,
            viewType: constant.VIEW_TYPE.perfMultiple,
            viewTitle: i18n.perf_setting,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开mainHome主页面
     * @param fun 用来标识打开的功能
     * @param context 插件上下文
     * @param params 入参
     */
    public static openMainHomePanel(context: vscode.ExtensionContext) {
        const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate',
            { page: '/mainHome', webSession: sysPerfSession });
        const panelOption = {
            panelId: constant.PANEL_ID.perfNonLogin,
            viewType: constant.VIEW_TYPE.login,
            viewTitle: i18n.perfadvisor_login,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 打开perfadvisor登录页面
     *
     * @param context 插件上下文
     */
    public static openPerfLoginPanel(context: vscode.ExtensionContext, loginType: string) {
        let sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        // 如果是首次登录只需要将语言传递给webview
        if (null === sysPerfSession) {
            sysPerfSession = {
                language: vscode.env.language
            };
        }

        // 通过logintype来区分是正常登录还是切换账户：
        const toolVersions = Utils.getConfigJson(context).sysPerfVersion;
        const param = {
            queryParams: {
                loginType,
                toolVersions,
                panelId: constant.PANEL_ID.perfNonLogin
            }
        };
        const message = Utils.generateMessage('navigate',
            { page: '/' + constant.NAVIGATE_PAGE.login, pageParams: param, webSession: sysPerfSession });
        const panelOption = {
            panelId: constant.PANEL_ID.perfNonLogin,
            viewType: constant.VIEW_TYPE.login,
            viewTitle: i18n.perfadvisor_login,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }

    /**
     * 关闭对应工具的panel
     *
     * @param panleIds 待关闭的panelid列表
     * @param module 工具
     */
    static closePanel(panleIds: string[], module: string) {

        if (constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR === module) {
            const deletePanels: Array<ToolPanel>
                = ToolPanelManager.sysPerfToolPanels.filter(item => panleIds.indexOf(item.getPanelId()) !== -1);
            for (const delPanel of deletePanels) {
                delPanel.getPanel().dispose();
            }
        }
        if (constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR === module) {
            const deletePanels: Array<ToolPanel>
                = ToolPanelManager.javaPerfToolPanels.filter(item => panleIds.indexOf(item.getPanelId()) !== -1);
            for (const delPanel of deletePanels) {
                delPanel.getPanel().dispose();
            }
        }
    }

    /**
     * 关闭所有打开panel
     */
    public static closeAllPanels() {
        // 关闭所有的pannel
        for (const toolPanel of ToolPanelManager.sysPerfToolPanels) {
            toolPanel.getPanel().dispose();
        }
        for (const toolPanel of ToolPanelManager.javaPerfToolPanels) {
            toolPanel.getPanel().dispose();
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

        // 关闭sysPerf中remainPanelIds以外的panel
        if (constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR === module) {
            // 获取需要关闭的panelid列表
            ToolPanelManager.sysPerfToolPanels.forEach(element => {
                if (null === remainPanelIds || 0 === remainPanelIds.length
                    || remainPanelIds.indexOf(element.getPanelId()) === -1) {
                    deletePanleIds.push(element.getPanelId());
                }
            });
        }

        // 关闭javaPerf中remainPanelIds以外的panel
        if (constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR === module) {
            // 获取需要关闭的panelid列表
            ToolPanelManager.javaPerfToolPanels.forEach(element => {
                if (null === remainPanelIds || 0 === remainPanelIds.length
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
            const disclaimerConfirm = context.globalState.get(conf.desclaimer);
            if (!disclaimerConfirm) {
                if (conf.panels.indexOf(panelOption.panelId) !== -1) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        if (panelOption.module === constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR ||
            panelOption.module === constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR) {
            return true;
        }

        return false;
    }

    /**
     * 根据节点不同的contextvalue获取不同的页面地址
     *
     * @param module sysPerf还是javaPerf工具
     * @param contextValue 区分每个节点的类别
     */
    private static getPageForTreeNode(module: string, contextValue: string, selfInfo: any, anaType: string): string {
        let page: any = '/' + constant.NAVIGATE_PAGE.home;
        // 如果是javaPerf
        if (constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR === module) {
            page = '/' + constant.NAVIGATE_PAGE.home;
        }

        // sysPerf工具，根据contextValue区分页面
        if (constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR === module) {
            switch (contextValue) {
                // 任务节点详细页面
                case constant.CONTEXT_VALUES.sysPerfProjectTaskNode:
                    page = '/' + constant.NAVIGATE_PAGE.home;
                    if (anaType === 'microarchitecture') {
                        page = '/microarchitecture';
                    }
                    break;
                // project详细页面
                case constant.CONTEXT_VALUES.sysPerfProject:
                    page = '/' + constant.NAVIGATE_PAGE.viewProject;
                    break;
                case constant.CONTEXT_VALUES.sysPerfProject_self:
                    page = '/' + constant.NAVIGATE_PAGE.viewProject;
                    break;
                case constant.CONTEXT_VALUES.sysPerfProject_noself_admin:
                    page = '/' + constant.NAVIGATE_PAGE.viewProject;
                    break;
                default:
                    break;
            }
        }

        return page;
    }

    /**
     * 更新panel
     *
     * @param toolPanel panel实例
     * @param module 模块
     */
    static async updatePanel(toolPanel: ToolPanel, context: vscode.ExtensionContext, option?: any) {
        const panelId: string = toolPanel.getPanelId();
        if (constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR === option.module ||
            constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR === option.module) {
            switch (panelId) {
                // 安装成功后更新panel
                case constant.PANEL_ID.perfInstall:
                    toolPanel.getPanel().title = i18n.perfadvisor_login;
                    toolPanel.setPanelId(constant.PANEL_ID.perfNonLogin);
                    break;
                // 升级成功后更新panel
                case constant.PANEL_ID.perfUpgrade:
                    toolPanel.getPanel().title = i18n.perfadvisor_login;
                    toolPanel.setPanelId(constant.PANEL_ID.perfNonLogin);
                    break;
                // 修改密码之后，webview已经登出，需要除当前的panel之外的其他所有panel关闭，刷新当前panel的title，刷新左侧树
                case constant.PANEL_ID.perfUserMultiple:

                    // 删除除当前panel之外其他的panel
                    ToolPanelManager.closePanelsByRemained(option.module, new Array<string>(toolPanel.getPanelId()));

                    // 更新panel
                    toolPanel.getPanel().title = i18n.perfadvisor_login;
                    toolPanel.setPanelId(constant.PANEL_ID.perfNonLogin);

                    // 刷新左侧树
                    vscode.commands.executeCommand('setContext', 'isPerfadvisorLogined', Utils.isSysPerfLogin(context));
                    PerfMenu.updataTree(context);
                    break;

                default:
                    break;
            }
        }
    }
}
