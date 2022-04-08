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
import { ToolItemNode } from './toolmenu/tree-node';
import { Utils } from './utils';
import * as constant from './constant';
import { PortMenu } from './toolmenu/port-menu';
import { ToolPanelManager } from './panel-manager';
import * as fs from 'fs';
import * as os from 'os';
import { DepReport } from './apprise-report';
import { I18nService } from './i18nservice';
import { ReportDetailUtil } from './port-report';
import { AnalysisUtil } from './analysis-util';
import { ReportSoftWareBuild } from './report/report-software-build';
import { ENV_APP_NAME } from './constant';
import { CloudIDEService } from './cloudIDE/CloudIDEServie';
import { LogManager, LOG_LEVEL } from './log-manager';

const i18n = I18nService.I18n();
/**
 * 报告处理类
 */
export class ReportHelper {
    private static REPORT_ID_RADIX = 10;
    /**
     * apprise下载报告
     *
     * @param context 上下文
     */
    static dowloadDepReportCommand(context: vscode.ExtensionContext) {
        // apprise 下载CSV报告
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.depdownloadcsvreport',
            async (treeItem: ToolItemNode) => {
                const reportInfo = {
                    reportId: treeItem.id,
                    reportType: '0',
                    label: treeItem.label
                };
                if (vscode.env.appName === constant.ENV_APP_NAME.CLOUDIDE) {  // cloudIDE下载csv文件
                    CloudIDEService.downloadDepCsvReport(context, reportInfo);
                } else {
                    ReportHelper.downloadDepReport(context, reportInfo);
                }
            }));

        // apprise 下载html报告
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.depdownloadhtmlreport',
            async (treeItem: ToolItemNode) => {
                const reportInfo = {
                    reportId: treeItem.id,
                    reportType: '1',
                    label: treeItem.label
                };
                ReportHelper.downloadDepReport(context, reportInfo);
            }));
    }

    /**
     * Porting下载报告
     *
     * @param context 上下文
     */
    static dowloadPortReportCommand(context: vscode.ExtensionContext) {
        // Porting 下载CSV报告
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portdownloadcsvreport',
            async (treeItem: ToolItemNode) => {
                await this.downOrOpenPage(context, treeItem);
            }));

        // Porting 下载html报告
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portdownloadhtmlreport',
            async (treeItem: ToolItemNode) => {
                await this.downOrOpenPage(context, treeItem, 1);
            }));
    }
    /**
     * Porting下载报告或者打开显示提示
     *
     * @param context 上下文
     */
    public static async downOrOpenPage(context: any, treeItem: any, reportType = 0) {
        const  option = {
            url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(treeItem.id)}`,
            method: 'GET',
        };
        await Utils.requestDataHelper(context, option, 'porting')
        .then( (resp) => {
            if (resp.realStatus === '0x0d0112') {
               vscode.window.showInformationMessage(i18n.plugins_porting_report_notNewReport, i18n.common_term_operate_Create)
               .then(async (select) => {
                    if (select === i18n.common_term_operate_Create) {
                        const portSession = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
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
                        ToolPanelManager.createOrShowPanel(panelOption, context);
                    }
               });
            } else if (resp.realStatus === '0x0d0223') {
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.common_term_operate_locked1_download,
                { 0:  Utils.formatCreatedId(resp.data.id) }), i18n.common_term_operate_Download)
                .then(async (select) => {
                    const newReportOption = {
                        url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(resp.data.id)}`,
                        method: 'GET'
                    };
                    const res: any = await Utils.requestDataHelper(context, newReportOption, 'porting');
                    if (select === i18n.common_term_operate_Download) {
                    const panelOption = {
                        message: {
                            cbid: new Date().getTime(),
                            cmd: 'navigate',
                            report: resp.data.id,
                            data: {
                                page: '/reportDetail',
                                pageParams: {queryParams: {response: JSON.stringify(res), report: resp.data.id, name: ''}},
                                webSession: context.globalState.get('porting' + 'Session')
                            }
                        },
                        module: 'porting',
                        panelId: resp.data.id,
                        viewType: 'report',
                        viewTitle: Utils.formatCreatedId(resp.data.id)
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, context);
                    }
                });
            } else {
                const reportInfo = {
                    reportId: treeItem.id,
                    reportType,
                    label: treeItem.label
                };
                ReportHelper.downloadPortReport(context, reportInfo);
            }
        });
    }

    /**
     * apprise清空历史报告
     *
     * @param context 上下文
     */
    static clearDepReports(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.depclearreports', async () => {
            vscode.window.showWarningMessage(i18n.plugins_apprise_message_clearReport,
              i18n.confirm_button,
              i18n.cancel_button)
                .then(async (select) => {
                    if (select === i18n.confirm_button) {
                        try {
                            const option = {
                                url: constant.BINARY_URIS.PORT_REPORT_DELETE_ALL_URI,
                                method: 'DELETE'
                            };
                            const report: any =
                              await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);

                            if (constant.STATUS_SUCCESS === report.status) {
                                vscode.window.showInformationMessage(i18n.clear_reports_success);

                                // 已删除的历史报告，如果已在vscode中打开，需要将panel关闭
                                const delPanelIds = PortMenu.getInstance().getReportIds(constant.TOOL_NAME_DEP);
                                ToolPanelManager.closePanel(delPanelIds, constant.TOOL_NAME_PORTING);

                                // 刷新左侧树
                                PortMenu.getInstance().refresh();
                            } else {
                                ReportHelper.showErrorMessage(report);
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(error);
                        }
                    }
                });
        }));
    }

    /**
     * Porting清空历史报告
     *
     * @param context 上下文
     */
    static clearPortReports(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portclearreports', async () => {
            const portDisclaimer = context.globalState.get(constant.PORT_DESCLAIMER_CONF);
            if (!portDisclaimer) {
                return;
            }
            vscode.window.showWarningMessage(i18n.plugins_porting_message_clearReport,
              i18n.confirm_button,
              i18n.cancel_button)
                .then(async (select) => {
                    if (select === i18n.confirm_button) {
                        try {
                            const option = {
                                url: constant.PORTING_URIS.PORT_REPORT_CLEAR_URI,
                                method: 'DELETE'
                            };
                            const report: any =
                              await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);

                            if (constant.STATUS_SUCCESS === report.status) {
                                vscode.window.showInformationMessage(i18n.clear_reports_success);

                                // 已删除的历史报告，如果已在vscode中打开，需要将panel关闭
                                const delPanelIds = PortMenu.getInstance().getReportIds(constant.TOOL_NAME_PORTING);
                                ToolPanelManager.closePanel(delPanelIds, constant.TOOL_NAME_PORTING);

                                // 刷新左侧树
                                PortMenu.getInstance().refresh();
                            } else {
                                ReportHelper.showErrorMessage(report);
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(error);
                        }
                    }
                });
        }));
    }


    /**
     * apprise删除单个历史报告
     *
     * @param context 插件上下文
     */
    static deleteDepReport(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.depdeletereport',
          async (node: ToolItemNode) => {
            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.plugins_apprise_message_deleteReport,
                { 0: node.id }),
                i18n.confirm_button, i18n.cancel_button)
                .then(async (select) => {
                    if (select === i18n.confirm_button) {
                        try {
                            const option = {
                                url: constant.BINARY_URIS.PORT_REPORT_DELETE_URI + node.id + '/',
                                method: 'DELETE'
                            };
                            const report: any =
                              await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
                            // 删除成功刷新左侧树
                            if (constant.STATUS_SUCCESS === report.status) {
                                if (vscode.env.language.indexOf('en') !== -1) {
                                    vscode.window.showInformationMessage(report.info);
                                } else {
                                    vscode.window.showInformationMessage(report.infochinese);
                                }
                                // 已删除的历史报告，如果已在vscode中打开，需要将panel关闭
                                const delPanelIds = new Array<string>();
                                if (typeof (node.id) === 'string') {
                                    delPanelIds.push(node.id);
                                }
                                ToolPanelManager.closePanel(delPanelIds, constant.TOOL_NAME_PORTING);

                                // 刷新左侧树
                                PortMenu.getInstance().refresh();

                                // 假如迁移扫描处于打开状态，则刷新home页
                                for (const toolPanel of ToolPanelManager.portToolPanels) {
                                    if (toolPanel.getPanelId() === constant.PANEL_ID.portAppraise) {
                                        ToolPanelManager.sendMassageToApprisePanel('home',
                                          context,
                                          { time: new Date().getTime() });
                                    }
                                }
                            } else {
                                ReportHelper.showErrorMessage(report);
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(error);
                        }
                    }
                });
        }));
    }

    /**
     * Porting删除单个历史报告
     *
     * @param context 插件上下文
     */
    static deletePortReport(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portdeletereport',
          async (node: ToolItemNode) => {
            const portDisclaimer = context.globalState.get(constant.PORT_DESCLAIMER_CONF);
            if (!portDisclaimer) {
                return;
            }
            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.plugins_porting_message_deleteReport,
                { 0: node.id }),
                i18n.confirm_button, i18n.cancel_button)
                .then(async (select) => {
                    if (select === i18n.confirm_button) {
                        try {
                            const option = {
                                url: constant.PORTING_URIS.PORT_REPORT_DELETE_URI + node.id + '/',
                                method: 'DELETE'
                            };
                            const report: any =
                              await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);

                            if (constant.STATUS_SUCCESS === report.status) {
                                if (vscode.env.language.indexOf('en') !== -1) {
                                    vscode.window.showInformationMessage(report.info);
                                } else {
                                    vscode.window.showInformationMessage(report.infochinese);
                                }

                                // 已删除的历史报告，如果已在vscode中打开，需要将panel关闭
                                const delPanelIds = new Array<string>();
                                if (typeof (node.id) === 'string') {
                                    delPanelIds.push(node.id);
                                }
                                ToolPanelManager.closePanel(delPanelIds, constant.TOOL_NAME_PORTING);

                                // 刷新左侧树
                                PortMenu.getInstance().refresh();

                                // 假如源码迁移处于打开状态，则刷新home页
                                for (const toolPanel of ToolPanelManager.portToolPanels) {
                                    if (toolPanel.getPanelId() === constant.PANEL_ID.portCreatescSanTask) {
                                        ToolPanelManager.sendMassageToPortHomePanel('home',
                                          context,
                                          { time: new Date().getTime() });
                                    }
                                }
                            } else {
                                ReportHelper.showErrorMessage(report);
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(error);
                        }
                    }
                });
        }));
    }

    /**
     * 软件包重构报告注册命令
     * 1、下载重构软件包
     * 2、下载重构软件包html报告
     * 3、删除软件包重构历史报告
     * @param context 插件上下文
     */
    static regPkgRebuildHisCmd(context: vscode.ExtensionContext) {
        // 下载重构软件包
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portDownloadSoftBuildHis',
            (node: ToolItemNode) => {
                if (vscode.env.appName === ENV_APP_NAME.CLOUDIDE) {  // cloudIDE下载
                    AnalysisUtil.cloudIDEDownloadRebuildPkg(context, node.id, node.module);
                } else {
                    AnalysisUtil.downloadRebuildPkg(context, node.extInfo.name,
                      node.extInfo.path + '/' + node.extInfo.name, node.module);
                }
            }));
        // 下载重构软件包html报告
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portDownloadSoftBuildHTML',
            (node: ToolItemNode) => {
                ReportHelper.downLoadSoftWareHTMLByNode(context, node.extInfo);
            }));
        // 删除软件包重构历史报告
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.portDelSoftBuildHis',
            (node: ToolItemNode) => {
                const del = i18n.plugins_porting_webpack_confirm;
                vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.plugins_porting_webpack_delConfirm,
                    { 0: node.label }),
                    del, i18n.plugins_porting_webpack_cancel).then(async result => {
                        if (result === del) {
                            const resp: any = await AnalysisUtil.deleteRebuildPackage(
                                context, node.extInfo.name, node.extInfo.path, constant.TOOL_NAME_PORTING);
                            if (constant.STATUS_SUCCESS === resp.status) {
                                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.delete_report_success,
                                    { 0: node.label }));
                                // 已删除的历史报告，如果已在vscode中打开，需要将panel关闭
                                const delPanelIds = new Array<string>();
                                if (typeof (node.id) === 'string') {
                                    delPanelIds.push(node.id);
                                }
                                ToolPanelManager.closePanel(delPanelIds, constant.TOOL_NAME_PORTING);
                                // 刷新左侧树
                                PortMenu.getInstance().refresh();
                            } else {
                                Utils.showErrorInfoByLangType(resp);
                            }
                        }
                    });
            }));

        // 清空软件包重构历史报告
        context.subscriptions.push(vscode.commands.registerCommand('extension.view.softwarepkgclearreports',
          async () => {
            ReportHelper.clearSoftwarePkgReports(context);
        }));
    }

    /**
     * 清空软件包重构历史报告
     * @param context 插件上下文
     */
    static clearSoftwarePkgReports(context: vscode.ExtensionContext) {
        vscode.window.showWarningMessage(i18n.plugins_softpkg_message_clearReport,
          i18n.confirm_button,
          i18n.cancel_button)
            .then(async (select) => {
                if (select === i18n.confirm_button) {
                    try {
                        const option = {
                            url: constant.SOFTWARE_PACKAGE_URLS.SOFTWAREPKG_REPORT_DELETE_URL,
                            method: 'DELETE'
                        };
                        const report: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);

                        if (constant.STATUS_SUCCESS === report.status) {
                            vscode.window.showInformationMessage(i18n.clear_reports_success);

                            // 已删除的历史报告，如果已在vscode中打开，需要将panel关闭
                            const delPanelIds =
                              PortMenu.getInstance().getReportIds(constant.TOOL_NAME_SOFTWARE_PACKAGE);
                            ToolPanelManager.closePanel(delPanelIds, constant.TOOL_NAME_PORTING);

                            // 刷新左侧树
                            PortMenu.getInstance().refresh();
                        } else {
                            ReportHelper.showErrorMessage(report);
                        }
                    } catch (error) {
                        vscode.window.showErrorMessage(error);
                    }
                }
            });
    }

    /**
     * 查询apprise扫描数据列表
     *
     * @param context 上下文
     */
    static async getDepReportList(context: vscode.ExtensionContext): Promise<ToolItemNode[]> {
        const reportList: Array<ToolItemNode> = [];
        try {
            const option = {
                url: constant.BINARY_URIS.PORT_REPORT_QUERY_URI,
                method: 'GET'
            };
            const response: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
            if (constant.STATUS_SUCCESS === response.status) {
                let temp: ToolItemNode;
                if (response.data.tasklist.length > 0) {
                    // 获取到之后报告之后先排序
                    let reportListTemp = response.data.tasklist;
                    reportListTemp = reportListTemp.sort((report1: any, report2: any) => {
                        return parseInt(report2.report_id, ReportHelper.REPORT_ID_RADIX)
                            - parseInt(report1.report_id, ReportHelper.REPORT_ID_RADIX);
                    });
                    for (const val of reportListTemp) {
                        const reportId = val.id;
                        const nodeInfo = {
                            label: ToolItemNode.formatCreatedId(reportId),
                            id: reportId,
                            module: constant.TOOL_NAME_DEP,
                            contextValue: constant.CONTEXT_VALUES.depreport
                        };
                        temp = new ToolItemNode(nodeInfo);
                        reportList.push(temp);
                    }
                }
            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(reportList);
            } else {
                ReportHelper.showErrorMessage(response);
            }
        } catch (error) {
            vscode.window.showErrorMessage(error);
        }
        return Promise.resolve(reportList);
    }

    /**
     * 调用后端服务器获取porting报告
     *
     * @param context 上下文
     * @param url 服务端接口的url
     * @param module 模块，porting工具
     */
    static async getPortReportList(context: vscode.ExtensionContext, childrenParam: any): Promise<ToolItemNode[]> {
        const reportList: Array<ToolItemNode> = [];
        try {
            const option = {
                url: constant.PORTING_URIS.PORT_REPORT_QUERY_URI,
                method: 'GET'
            };
            const response: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
            if (constant.STATUS_SUCCESS === response.status) {
                let temp: ToolItemNode;
                if (response.data.tasklist.length > 0) {
                    // 获取到之后报告之后先排序
                    let reportListTemp = response.data.tasklist;
                    reportListTemp = reportListTemp.sort((report1: any, report2: any) => {
                        return parseInt(report2.report_id, ReportHelper.REPORT_ID_RADIX)
                            - parseInt(report1.report_id, ReportHelper.REPORT_ID_RADIX);
                    });

                    for (const val of reportListTemp) {
                        const reportId = val.id;
                        const nodeInfo = {
                            label: ToolItemNode.formatCreatedId(reportId),
                            id: reportId,
                            module: constant.TOOL_NAME_PORTING,
                            contextValue: constant.CONTEXT_VALUES.portreport
                        };
                        temp = new ToolItemNode(nodeInfo);
                        reportList.push(temp);
                    }
                }
            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(reportList);
            } else {
                ReportHelper.showErrorMessage(response);
            }
        } catch (error) {
            vscode.window.showErrorMessage(error);
        }
        return Promise.resolve(reportList);
    }

    /**
     * 左侧树软件迁移报告子节点获取后处理
     * @param children 子节点列表
     * @param menuDataProvider 左侧树
     */
    static extHandlerDep(children: Array<ToolItemNode>) {
        if (children.length === 0) {
            vscode.commands.executeCommand('setContext', 'hasdepreports', false);
        } else {
            // 将获取到报告的id放入reportIds数组中
            PortMenu.getInstance().setReportIds(children, constant.TOOL_NAME_DEP);
            vscode.commands.executeCommand('setContext', 'hasdepreports', true);
        }
    }

    /**
     * 左侧树源码迁移报告子节点获取后处理
     * @param children 子节点列表
     * @param menuDataProvider 左侧树
     */
    static extHandlerPorting(children: Array<ToolItemNode>) {
        if (children.length === 0) {
            vscode.commands.executeCommand('setContext', 'hasportreports', false);
        } else {
            // 将获取到报告的id放入reportIds数组中
            PortMenu.getInstance().setReportIds(children, constant.TOOL_NAME_PORTING);
            vscode.commands.executeCommand('setContext', 'hasportreports', true);
        }
    }

    /**
     * 左侧树软件包重构报告子节点获取后处理
     * @param children 子节点列表
     * @param menuDataProvider 左侧树
     */
    static extHandlerSoftwarepkg(children: Array<ToolItemNode>) {
        if (children.length === 0) {
            vscode.commands.executeCommand('setContext', 'hassoftwarepkgreports', false);
        } else {
            // 将获取到报告的id放入reportIds数组中
            PortMenu.getInstance().setReportIds(children, constant.TOOL_NAME_SOFTWARE_PACKAGE);
            vscode.commands.executeCommand('setContext', 'hassoftwarepkgreports', true);
        }
    }


    /**
     * apprise报告下载函数
     * @param global 插件上下文
     * @param reportInfo 报告信息{reportId:报告id, reportType:报告类型，0-csv,1-html, label:报告的创建时间}
     */
    public static async downloadDepReport(context: vscode.ExtensionContext, reportInfo: any) {
        const url = `/portadv/binary/${reportInfo.reportId}/?report_type=${reportInfo.reportType}`;
        const option = {
            url,
            method: 'GET'
        };
        const responseBody: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        if (constant.STATUS_FAILED === responseBody.status) {
            ReportHelper.showErrorMessage(responseBody);
            return;
        }
        let fileName = '';
        let content: string | undefined;
        if ('0' === reportInfo.reportType) {
            fileName = `/${reportInfo.reportId}.csv`;
            content = '\ufeff' + responseBody;  // \ufeff 解决csv文件中文乱码的问题
        } else {
            fileName = `/${reportInfo.reportId}.html`;
            content = new DepReport().getReportHtml(responseBody, context, reportInfo.label);
        }

        // 调用文件管理器，选择文件保存路径
        let path: any = context.extensionPath + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(path);

        // 用户取消
        if (!saveFileName) {
            return;
        }

        path = saveFileName;

        fs.writeFile(path, content, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            } else {
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.download_report_success,
                  { 0: path }));
            }
        });
    }

    /**
     * Porting报告下载函数
     *
     * @param context 插件上下文
     * @param reportInfo 报告信息{reportId:报告id, reportType:报告类型，0-csv,1-html, label:报告的创建时间}
     */
    public static async downloadPortReport(context: vscode.ExtensionContext, reportInfo: any) {
        const portDisclaimer = context.globalState.get(constant.PORT_DESCLAIMER_CONF);
        if (!portDisclaimer) {
            return;
        }

        // 调用后端下载接口
        const reportId = reportInfo.reportId;
        const reportType = reportInfo.reportType;
        const url = `/portadv/tasks/${reportId}/download/?report_type=${reportType}`;
        const option = {
            url,
            method: 'GET',
            params: { report_type: reportInfo.reportType }
        };
        const responseBody: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);

        // 判断后端返回是否正常
        if (constant.STATUS_FAILED === responseBody.status) {
            ReportHelper.showErrorMessage(responseBody);
            return;
        }

        let fileName = '';
        let content = '';

        if ('0' === reportInfo.reportType || 0 === reportInfo.reportType) {
            fileName = `/${reportInfo.reportId}.csv`;
            content = '\ufeff' + responseBody;
        } else {
            fileName = `/${reportInfo.reportId}.html`;
            const contentObj = JSON.parse(responseBody.data.content);
            // 获取html内容
            const reportDetailUtil = new ReportDetailUtil();
            content = await reportDetailUtil.getHtmlContent(context, reportInfo.reportId, contentObj);
        }

        // 调用文件管理器，选择文件保存路径
        let path: any = context.extensionPath + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(path);

        // 用户取消
        if (!saveFileName) {
            return;
        }

        path = saveFileName;

        // 将文件内容写入path文件
        fs.writeFile(path, content, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            } else {
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.download_report_success,
                  { 0: path }));
            }
        });
    }

    /**
     * 左边树下载重构软件包html报告函数
     *
     * @param context 插件上下文
     * @param nodeInfo 报告信息
     */
    public static async downLoadSoftWareHTMLByNode(context: vscode.ExtensionContext, nodeInfo: any) {
        const reportSoftWareBuild = new ReportSoftWareBuild();

        // 获取报告详情数据
        const reportData: any = await reportSoftWareBuild.getReportDetail(context, nodeInfo.path);

        // 获取页面元素数据
        const htmlData: any = await reportSoftWareBuild.getHtmlContent(reportData, nodeInfo.name);

        // 获取html页面
        const htmlContent: string = await reportSoftWareBuild.createReportHTML(context, htmlData);

        // 下载HTML到本地
        ReportHelper.downloadRebuildHTML(context, nodeInfo, htmlContent);
    }

    /**
     * 页面下载重构软件包html报告函数
     *
     * @param context 插件上下文
     * @param reportInfo 报告信息{reportId:报告id}
     */
    public static async downLoadSoftWareHTMLByPage(context: vscode.ExtensionContext, reportInfo: any, htmlData: any) {

        const reportSoftWareBuild = new ReportSoftWareBuild();
        // 获取html页面
        const htmlContent: any = await reportSoftWareBuild.createReportHTML(context, htmlData);

        // 下载HTML到本地
        ReportHelper.downloadRebuildHTML(context, reportInfo, htmlContent);
    }
    /**
     * 软件包重构报告下载函数
     * @param context 插件上下文
     * @param reportInfo 报告信息{path:报告id, reportType:报告类型，0-csv,1-html, label:报告的创建时间}
     * @param htmlContent 报告详情内容
     */
    public static async downloadRebuildHTML(context: vscode.ExtensionContext, reportInfo: any, htmlContent: any) {
        const fileName = `/${reportInfo.name}_${reportInfo.path}.html`;
        // 调用文件管理器，选择文件保存路径
        let path: any = context.extensionPath + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(path);

        // 用户取消
        if (!saveFileName) {
            return;
        }

        path = saveFileName;

        // 将文件内容写入path文件
        fs.writeFile(path, htmlContent, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            } else {
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.download_report_success,
                  { 0: path }));
            }
        });
    }

    /**
     *  操作日报下载函数
     *  @param context 插件上下文
     *  @param reportInfo 报告信息{reportId:报告id, reportType:报告类型}
     */
    public static async downloadLog(context: vscode.ExtensionContext, reportInfo: any) {

        // 判断后端返回是否正常
        if (constant.STATUS_FAILED === reportInfo.status) {
            ReportHelper.showErrorMessage(reportInfo);
            return;
        }

        let fileName = '';
        let content = '';
        fileName = `/${reportInfo.reportId}.csv`;
        content = reportInfo.data;

        // 调用文件管理器，选择文件保存路径
        let path: any = context.extensionPath + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(path);

        // 用户取消
        if (!saveFileName) {
            return;
        }
        path = saveFileName;
        // 将文件内容写入path文件
        fs.writeFile(path, content, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            } else {
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_optdownload_success,
                  { 0: path }));
            }
        });
    }
    /**
     *  BC文件下载函数
     *  @param context 插件上下文
     *  @param reportInfo 报告信息{reportId: BC文件名, data: BC文件内容}
     */
    public static async downloadBcFile(context: vscode.ExtensionContext, reportInfo: any) {

      let fileName = '';
      let content: any;
      let fileArray = [];
      let errNum = 0;

      fileArray = reportInfo.data;

      fileArray.forEach((file: any) => {
        content = file.res;
        fileName = file.fileName;
        // 判断后端返回是否正常
        if ( content.status ) {
          // ReportHelper.showErrorMessage(content);
          LogManager.log(
            context,
            'The download of ' + fileName + ' failed, because of ' + content.info ,
            'porting',
            LOG_LEVEL.ERROR);
          errNum ++;
        }
      });

      if ( errNum === fileArray.length ) {
        fileArray.forEach((file: any) => {
          content = file.res;
          ReportHelper.showErrorMessage(content);
        });
        return;
      }

      let bcFileName = '';
      let path = '';
      const saveFileName = await Utils.saveBcFile();
      if (!saveFileName) {
        return;
      }

      fileArray.forEach((file: any) => {
        let num = 1;
        fileName = file.fileName;
        content = file.res;

        if ( content.status ) {
          LogManager.log(
              context,
            'The download of ' + fileName + ' failed, because of ' + content.info ,
            'porting',
            LOG_LEVEL.ERROR);
          ReportHelper.showErrorMessage(content);
          return;
        }
        path = saveFileName + '\\' + fileName;
        while (true) {
          if (fs.existsSync(path)) {
            bcFileName = fileName.split('.')[0] + `(${num})` + '.' + fileName.split('.')[1];
            path = saveFileName + '\\' + bcFileName;
            num ++;
          } else {
            break;
          }
        }
        fs.writeFileSync(path, Buffer.from(content));
        LogManager.log(
          context, fileName + ' downloaded successfully', 'porting', LOG_LEVEL.ERROR);
        vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_bcdownload_success,
          { 0: path }));
      });
    }

    /**
     * 保存下载的运行日志
     * @param context 插件上下文
     * @param reportInfo log信息
     */
    public static async downloadRunLog(context: vscode.ExtensionContext, reportInfo: any) {

        let fileName = '';
        fileName = `/${reportInfo.logName}`;
        // 调用文件管理器，选择文件保存路径
        let path: any = context.extensionPath + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(path);

        // 用户取消
        if (!saveFileName) {
            return;
        }
        path = saveFileName;

        // 用户取消
        if (!path) {
            return;
        }

        // 文件写入回调函数
        function fileWriteCallback(err: any) {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            } else {
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_rundownload_success,
                  { 0: path }));
            }
        }

        // 将文件内容写入path文件
        await fs.writeFile(path, Buffer.from(reportInfo.bufferData), fileWriteCallback);
    }

    /**
     * 运行日报创建函数
     *
     * @param context 插件上下文
     * @param reportInfo 报告信息{reportId:报告id, reportType:报告类型，0-csv,1-html, label:报告的创建时间}
     */
    public static async createrunlogtask(context: vscode.ExtensionContext, reportInfo: any) {

        // 判断后端返回是否正常
        if (constant.STATUS_FAILED === reportInfo.status) {
            ReportHelper.showErrorMessage(reportInfo);
            return;
        }

        let fileName = '';
        fileName = `/${reportInfo.reportId}`;
        // 调用文件管理器，选择文件保存路径
        let path: any = context.extensionPath + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(path);

        // 用户取消
        if (!saveFileName) {
            return;
        }
        path = saveFileName;

        const params = {
            download_path: path
        };

        const option = {
            url: '/portadv/runlog/create_log/',
            method: 'POST',
            params
        };

        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            const toolPortPanel = ToolPanelManager.getToolPanelByPanelId(constant.PANEL_ID.portMultipleview,
                constant.TOOL_NAME_PORTING);
            if (toolPortPanel) {
                ToolPanelManager.sentMessageToPanel(ToolPanelManager
                    .getToolPanelByPanelId(constant.PANEL_ID.portMultipleview,
                      constant.TOOL_NAME_PORTING), null, constant.TOOL_NAME_PORTING,
                  { value: 'isRunLogTaskCreate',
                      type: 'isRunLogTaskCreate',
                      taskId: resp.data.task_id, osSavePath: path });
            }
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 接口调用失败展示错误信息
     * @param responseBody 接口调用相应
     */
    public static showErrorMessage(responseBody: any) {
        if (!responseBody.info && !responseBody.infochinese) {
            vscode.window.showErrorMessage(responseBody.detail);
        }
        if (vscode.env.language.indexOf('en') !== -1) {
            vscode.window.showErrorMessage(responseBody.info);
        } else {
            vscode.window.showErrorMessage(responseBody.infochinese);
        }
    }

    /**
     * apprise根据报告id获取报告详情
     *
     * @param context 插件上下文
     * @param reportId 报告id
     */
    public static async getDepReportDetail(context: vscode.ExtensionContext, reportId: string): Promise<any> {
        const webSession: any = context.globalState.get(constant.TOOL_NAME_DEP + 'Session');
        let resp: any;
        // 组装报告查询参数
        const requestParams = {
            report_id: reportId,
            user_id: webSession.loginId
        };
        const option = {
            url: '/report/search/',
            method: 'POST',
            params: requestParams,
            noToken: false
        };
        // 查询报告并接收返回
        resp = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_DEP);

        return Promise.resolve(resp);
    }


    /**
     * 下载html类型报告
     * @param global 面板上下文
     * @param message 文件内容信息
     */
    public static async downloadReportHtml(global: any, message: any) {
        let file: any = global.context.extensionPath + '/' + message.data.fileName;
        let downloadMsg = '';

        // 调用文件管理器，选择文件保存路径
        const saveFileName = await Utils.saveFileBySaveDialog(file);

        // 用户取消
        if (!saveFileName) {
            return;
        }

        file = saveFileName;
        if (message.data.autoFix) {
            downloadMsg = I18nService.I18nReplace(i18n.download_autofix_success, { 0: file });
        } else {
            downloadMsg = I18nService.I18nReplace(i18n.download_report_success, { 0: file });
        }

        // 将文件内容写入file文件
        fs.writeFile(file, message.data.htmlContent, 'utf-8', (err: any) => {
            if (err) {
                // 下载文件失败，删除错误文件
                fs.readFile(file, 'utf8', (readFileErr: any, data: any) => {
                    if (readFileErr) { return; }

                    fs.unlinkSync(file);
                });
                vscode.window.showErrorMessage(err.message);
            }

            // 写入成功后读取测试
            vscode.window.showInformationMessage(downloadMsg);
        });

        Utils.invokeCallback(global.panel, message, null);
    }

    /**
     * 获取报告详细信息
     * @param context 上下文
     * @param id 报告id
     * @param module 模块名
     * @param isRebuild 是否是重构完后获取页面报告
     */
    public static async getReportDetail(context: vscode.ExtensionContext,
                                        id: any,
                                        module: string,
                                        isRebuild?: boolean) {
        let resp: any;
        let option: any;


        // dep模块查询报告详细
        if (constant.TOOL_NAME_PORTING === module) {
            option = {
                url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(id)}`,
                method: 'GET',
                noToken: false
            };
        }

        // porting模块查询报告详细
        if (constant.TOOL_NAME_DEP === module) {
            option = {
                url: `/task/progress/?task_type=7&task_id=${encodeURIComponent(id)}`,
                method: 'GET',
                noToken: false
            };
            module = constant.TOOL_NAME_PORTING;
        }

        // 软件包重构查询报告详细
        if (constant.TOOL_NAME_SOFTWARE_PACKAGE === module) {
            option = {
                url: `/portadv/autopack/history/${encodeURIComponent(id)}/`,
                method: 'GET',
            };
            module = constant.TOOL_NAME_PORTING;
        }

        // 发送请求，获取响应
        resp = await Utils.requestDataHelper(context, option, module);
        const vscodePlantForm = os.platform();
        resp.vscodePlantForm = vscodePlantForm;

        // 查询报告失败
        if ((constant.TOOL_NAME_PORTING === module && resp.status !== 1) && resp.status !== 0 && resp.status !== 2) {
            if (!isRebuild ) {
                ReportHelper.showErrorMessage(resp);
            }
            return new Promise((resolve, reject) => {
                resolve(false);
            });
        } else if (isRebuild && resp.status === 1) {
            return new Promise((resolve, reject) => {
                resolve(false);
            });
        }
        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(resp).replace(/:/g, '#'));
        });
    }

    /**
     * 获取预估人力说明
     * @param context 上下文
     * @param id 报告id
     * @param module 模块名
     */
    public static async getConfigData(context: vscode.ExtensionContext, id: any, module: string) {
        const webSession: any = context.globalState.get(constant.TOOL_NAME_PORTING + 'Session');
        let resp: any;
        let option: any;
        option = {
            url: `/users/${webSession.loginId}/config/`,
            method: 'GET',
            noToken: false
        };
        module = constant.TOOL_NAME_PORTING;

        // 发送请求，获取响应
        resp = await Utils.requestDataHelper(context, option, module);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(resp).replace(/:/g, '#'));
        });
    }
    /**
     * 下载Csr文件函数
     *
     * @param context 插件上下文
     * @param reportInfo 报告信息{reportId:cert.csr,}
     */
    public static async downloadCsrFile(context: vscode.ExtensionContext, info: any) {
        let fileName = '';
        let content = '';
        fileName = `/${info.fileName}`;
        content = info.data;

        // 调用文件管理器，选择文件保存路径
        let path: any = context.extensionPath + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(path);

        // 用户取消
        if (!saveFileName) {
            return;
        }
        path = saveFileName;
        // 将文件内容写入path文件
        fs.writeFile(path, content, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            } else {
                vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.plugins_porting_csrdownload_success,
                  { 0: path }));
            }
        });
    }
}
