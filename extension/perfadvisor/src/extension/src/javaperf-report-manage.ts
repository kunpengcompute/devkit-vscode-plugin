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
import { I18nService } from './i18nservice';
import { Utils } from './utils';
import * as constant from './constant';
import { PerfMenu } from './toolmenu/perf-menu';
import { messageHandler } from './webview-msg-handler';
import * as fs from 'fs';
import { Method, ResponseType } from 'axios';
const i18n = I18nService.I18n();

export default class JavaperfReportManage {
    public static loadExportReports: any = [];
    public static maxHeapSize = 0;
    public static maxThreadSize = 50;
    public static maxGclogSize = 250;
    /**
     * 删除内存转储
     */
    public static deleteHeapdumpReport(context: vscode.ExtensionContext, reportId?: string, reportName?: string, userData?: any) {
        if (!reportId) { return; }
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_heapdump_report_delete_tip, { 0: reportName });
        // 风险操作检验
        if (session?.role === constant.PERF_ROLE.ADMIN && session?.loginId !== userData.id) {
            tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_heapdump_report_delete_user_tip,
                { 0: userData.username, 1: reportName });
        }
        vscode.window.showWarningMessage(tipMsg, i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
            .then((select) => {
                if (select === i18n.plugins_sysperf_button_confirm) {
                    const option = {
                        method: 'DELETE' as Method,
                        url: '/heap/actions/delete/' + reportId
                    };
                    Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                        if (resp.status === 200) {
                            messageHandler.updateHeapReportConfig({ context, toolPanel: { getPanel() { } } }, {});
                            PerfMenu.updataTree(context);
                        }
                    });
                }
            });
    }

    /**
     * 删除线程转储
     */
    public static deleteThreaddumpReport(context: vscode.ExtensionContext, reportId?: string, reportName?: string, userData?: any) {
        if (!reportId) { return; }
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_threaddump_report_delete_tip, { 0: reportName });
        // 风险操作检验
        if (session?.role === constant.PERF_ROLE.ADMIN && session?.loginId !== userData.id) {
            tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_threaddump_report_delete_user_tip,
                { 0: userData.username, 1: reportName });
        }
        vscode.window.showWarningMessage(tipMsg,
            i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
            .then((select) => {
                if (select === i18n.plugins_sysperf_button_confirm) {
                    const option = {
                        method: 'DELETE' as Method,
                        url: '/threadDump/' + reportId
                    };
                    Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                        if (resp.status === 200) {
                            messageHandler.updateThreadReportConfig({ context, toolPanel: { getPanel() { } } }, {});
                            PerfMenu.updataTree(context);
                        }
                    });
                }
            });
    }

    /**
     * 删除gclog报告
     */
    public static deleteGclogReport(context: vscode.ExtensionContext, reportId?: string, reportName?: string, userData?: any) {
        if (!reportId) { return; }
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_gclog_report_delete_tip, { 0: reportName });
        // 风险操作检验
        if (session?.role === constant.PERF_ROLE.ADMIN && session?.loginId !== userData.id) {
            tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_gclog_report_delete_user_tip,
                { 0: userData.username, 1: reportName });
        }
        vscode.window.showWarningMessage(tipMsg,
            i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
            .then((select) => {
                if (select === i18n.plugins_sysperf_button_confirm) {
                    const option = {
                        method: 'DELETE' as Method,
                        url: '/gcLog/' + reportId
                    };
                    Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                        if (resp.status === 200) {
                            messageHandler.updateGclogReportConfig({ context, toolPanel: { getPanel() { } } }, {});
                            PerfMenu.updataTree(context);
                        }
                    });
                }
            });
    }

    /**
     * 导出内存转储
     */
    public static exportHeapdumpReport(context: vscode.ExtensionContext, reportData: any, reportName?: string) {
        if (!reportData.id) { return; }
        // 判断该报告是否正在导出
        if (this.loadExportReports.indexOf(reportData.id) > -1) {
            return;
        }
        const option = {
            method: 'GET' as Method,
            url: '/heap/actions/download/' + reportData.id,
            responseType: 'arraybuffer' as ResponseType,
        };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: I18nService.I18nReplace(i18n.plugins_perf_java_heapdump_report_export_loading, { 0: reportName }),
            cancellable: false
        }, () => {
            return new Promise(resolve => {
                // 将正在导出的报告记录下来，防止重复导出
                this.loadExportReports.push(reportData.id);
                Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                    // 本次导出完成，将导出的报告记录删除
                    const loadIndex = this.loadExportReports.indexOf(reportData.id);
                    if (loadIndex > -1) {
                        this.loadExportReports.splice(loadIndex, 1);
                    }
                    const fileName = `${reportData.alias}`;
                    messageHandler.downloadFile({ context, toolPanel: { getPanel() { } } }, {
                        data: {
                            invokeLocalSave: true,
                            contentType: 'arraybuffer',
                            fileName,
                            fileContent: resp?.data
                        }
                    });
                    resolve('');
                });
            });
        });
    }

    /**
     * 导出线程转储
     */
    public static exportThreaddumpReport(context: vscode.ExtensionContext, reportData: any, reportName?: string) {
        if (!reportData.id) { return; }
        // 判断该报告是否正在导出
        if (this.loadExportReports.indexOf(reportData.id) > -1) {
            return;
        }
        const option = {
            method: 'GET' as Method,
            url: '/threadDump/actions/download/' + reportData.id,
            responseType: 'arraybuffer' as ResponseType,
        };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: I18nService.I18nReplace(i18n.plugins_perf_java_threaddump_report_export_loading, { 0: reportName }),
            cancellable: false
        }, () => {
            return new Promise(resolve => {
                // 将正在导出的报告记录下来，防止重复导出
                this.loadExportReports.push(reportData.id);
                Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                    // 本次导出完成，将导出的报告记录删除
                    const loadIndex = this.loadExportReports.indexOf(reportData.id);
                    if (loadIndex > -1) {
                        this.loadExportReports.splice(loadIndex, 1);
                    }
                    const fileName = `${reportData.reportName}`;
                    messageHandler.downloadFile({ context, toolPanel: { getPanel() { } } }, {
                        data: {
                            invokeLocalSave: true,
                            contentType: 'arraybuffer',
                            fileName,
                            fileContent: resp?.data
                        }
                    });
                    resolve('');
                });
            });
        });
    }

    /**
     * 导出gclog报告
     */
    public static exportGclogReport(context: vscode.ExtensionContext, reportData: any, reportName?: string) {
        if (!reportData.id) { return; }
        // 判断该报告是否正在导出
        if (this.loadExportReports.indexOf(reportData.id) > -1) {
            return;
        }
        const option = {
            method: 'GET' as Method,
            url: '/gcLog/actions/download/' + reportData.id,
            responseType: 'arraybuffer' as ResponseType,
        };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: I18nService.I18nReplace(i18n.plugins_perf_java_gclog_report_export_loading, { 0: reportName }),
            cancellable: false
        }, () => {
            return new Promise(resolve => {
                // 将正在导出的报告记录下来，防止重复导出
                this.loadExportReports.push(reportData.id);
                Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                    // 本次导出完成，将导出的报告记录删除
                    const loadIndex = this.loadExportReports.indexOf(reportData.id);
                    if (loadIndex > -1) {
                        this.loadExportReports.splice(loadIndex, 1);
                    }
                    const fileName = `${reportData.logName}`;
                    messageHandler.downloadFile({ context, toolPanel: { getPanel() { } } }, {
                        data: {
                            invokeLocalSave: true,
                            contentType: 'arraybuffer',
                            fileName,
                            fileContent: resp?.data
                        }
                    });
                    resolve('');
                });
            });
        });
    }

    /**
     * 导入内存转储
     */
    public static async importHeapdumpReport(context: vscode.ExtensionContext) {
        const checkResult = await this.checkHeapdumpReportThreshold(context);
        if (checkResult) {
            vscode.window.showOpenDialog({}).then((data: any) => {
                if (data && data.length > 0) {
                    const filePath = data[0].path.substr(1);
                    const fileStats = fs.statSync(filePath);
                    const fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
                    const reg = new RegExp(/^[a-zA-Z][\w\.\+\-\(\)\s]{5,127}$/);
                    if (!reg.test(fileName)) {
                        vscode.window.showWarningMessage(i18n.threshold.heapdump_report_name_tip);
                        return;
                    }
                    if (fileStats.size > this.maxHeapSize * 1024 * 1024) {
                        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                        // 判断是否为特权用户（管理员）
                        if (session?.role === constant.PERF_ROLE.ADMIN) {
                            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.heapdump_max_size_tips_admin, {
                                0: fileName,
                                1: this.maxHeapSize
                            }));
                        } else {
                            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.heapdump_max_size_tips_normal, {
                                0: fileName,
                                1: this.maxHeapSize
                            }));
                        }
                        return;
                    }
                    const option = {
                        method: 'POST' as Method,
                        url: '/heap/actions/upload',
                        fileUpload: true,
                        filePath
                    };
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: fileName + '-' + i18n.plugins_common_term_upload,
                        cancellable: false
                    }, () => {
                        return new Promise(resolve => {
                            Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                                if (resp.data.id) {
                                    PerfMenu.updataTree(context).then(resolve);
                                    vscode.window.showInformationMessage(i18n.plugins_perf_java_heapdump_report_import_success);
                                    messageHandler.updateHeapReportConfig({ context, toolPanel: { getPanel() { } } }, {});
                                } else {
                                    resolve('');
                                    vscode.window.showWarningMessage(resp.data.message);
                                }
                            });
                        });
                    });
                }
            });
        }
    }

    /**
     * 导入线程转储
     */
    public static async importThreaddumpReport(context: vscode.ExtensionContext) {
        const checkResult = await this.checkThreaddumpReportThreshold(context);
        if (checkResult) {
            vscode.window.showOpenDialog({}).then((data: any) => {
                if (data && data.length > 0) {
                    const filePath = data[0].path.substr(1);
                    const fileStats = fs.statSync(filePath);
                    const fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
                    const reg = new RegExp(/^[a-zA-Z][\w\.\+\-\(\)\s]{5,127}$/);
                    if (!reg.test(fileName)) {
                        vscode.window.showWarningMessage(i18n.threshold.threaddump_report_name_tip);
                        return;
                    }
                    if (fileStats.size > this.maxThreadSize * 1024 * 1024) {
                        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                        // 判断是否为特权用户（管理员）
                        if (session?.role === constant.PERF_ROLE.ADMIN) {
                            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.threaddump_max_size_tips_admin, {
                                0: fileName,
                                1: this.maxThreadSize
                            }));
                        } else {
                            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.threaddump_max_size_tips_normal, {
                                0: fileName,
                                1: this.maxThreadSize
                            }));
                        }
                        return;
                    }
                    const option = {
                        method: 'POST' as Method,
                        url: '/threadDump/actions/upload',
                        fileUpload: true,
                        filePath
                    };
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: fileName + '-' + i18n.plugins_common_term_upload,
                        cancellable: false
                    }, () => {
                        return new Promise(resolve => {
                            Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                                if (resp.data.id) {
                                    PerfMenu.updataTree(context).then(resolve);
                                    vscode.window.showInformationMessage(i18n.plugins_perf_java_heapdump_report_import_success);
                                    messageHandler.updateThreadReportConfig({ context, toolPanel: { getPanel() { } } }, {});
                                } else {
                                    resolve('');
                                    vscode.window.showWarningMessage(resp.data.message);
                                }
                            });
                        });
                    });
                }
            });
        }
    }

    /**
     * 导入gclog报告
     */
    public static async importGclogReport(context: vscode.ExtensionContext) {
        const checkResult = await this.checkGclogReportThreshold(context);
        if (checkResult) {
            vscode.window.showOpenDialog({}).then((data: any) => {
                if (data && data.length > 0) {
                    const filePath = data[0].path.substr(1);
                    const fileStats = fs.statSync(filePath);
                    const fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
                    const reg = new RegExp(/^[a-zA-Z][\w\.\+\-\(\)\s]{5,127}$/);
                    if (!reg.test(fileName)) {
                        vscode.window.showWarningMessage(i18n.threshold.gclog_report_name_tip);
                        return;
                    }
                    if (fileStats.size > this.maxGclogSize * 1024 * 1024) {
                        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                        // 判断是否为特权用户（管理员）
                        if (session?.role === constant.PERF_ROLE.ADMIN) {
                            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.gclog_max_size_tips_admin, {
                                0: fileName,
                                1: this.maxGclogSize
                            }));
                        } else {
                            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.gclog_max_size_tips_normal, {
                                0: fileName,
                                1: this.maxGclogSize
                            }));
                        }
                        return;
                    }
                    const option = {
                        method: 'POST' as Method,
                        url: '/gcLog/actions/upload',
                        fileUpload: true,
                        filePath
                    };
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: fileName + '-' + i18n.plugins_common_term_upload,
                        cancellable: false
                    }, () => {
                        return new Promise(resolve => {
                            Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                                if (resp.data.id) {
                                    PerfMenu.updataTree(context).then(resolve);
                                    vscode.window.showInformationMessage(i18n.plugins_perf_java_heapdump_report_import_success);
                                    messageHandler.updateGclogReportConfig({ context, toolPanel: { getPanel() { } } }, {});
                                } else {
                                    resolve('');
                                    vscode.window.showWarningMessage(resp.data.message);
                                }
                            });
                        });
                    });
                }
            });
        }
    }

    /**
     * 导入内存转储阈值检测
     */
    public static async checkHeapdumpReportThreshold(context: vscode.ExtensionContext): Promise<boolean> {
        const reportOption = {
            url: '/heap/actions/list',
            method: 'GET'
        };
        // 获取已保存内存转储记录
        const reportResp: any = await Utils.requestDataHelper(context, reportOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        const reportNum = reportResp?.data.length || 0;
        const thresholdOption = {
            url: '/tools/settings/heap',
            method: 'GET'
        };
        const thresholdResp: any = await Utils.requestDataHelper(context, thresholdOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        this.maxHeapSize = thresholdResp.maxHeapSize;
        context.globalState.update('maxHeapCount', thresholdResp.maxHeapCount);
        context.globalState.update('heapReportNum', reportNum);
        if (reportNum >= thresholdResp.alarmHeapCount && reportNum < thresholdResp.maxHeapCount) {
            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.heapdump_tips_content, {
                0: reportNum,
                1: thresholdResp.alarmHeapCount
            }));
        } else if (reportNum >= thresholdResp.maxHeapCount) {
            vscode.window.showErrorMessage(I18nService.I18nReplace(i18n.threshold.heapdump_warn_content, {
                0: reportNum,
                1: thresholdResp.maxHeapCount
            }));
            return false;
        }
        return true;
    }

    /**
     * 导入线程转储阈值检测
     */
    public static async checkThreaddumpReportThreshold(context: vscode.ExtensionContext): Promise<boolean> {
        const reportOption = {
            url: '/threadDump/list',
            method: 'GET'
        };
        // 获取已保存线程转储记录
        const reportResp: any = await Utils.requestDataHelper(context, reportOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        const reportNum = reportResp?.data.length || 0;
        const thresholdOption = {
            url: '/tools/settings/threadDump',
            method: 'GET'
        };
        const thresholdResp: any = await Utils.requestDataHelper(context, thresholdOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        context.globalState.update('maxThreadDumpCount', thresholdResp.maxThreadDumpCount);
        context.globalState.update('threadReportNum', reportNum);
        if (reportNum >= thresholdResp.alarmThreadDumpCount && reportNum < thresholdResp.maxThreadDumpCount) {
            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.threaddump_tips_content, {
                0: reportNum,
                1: thresholdResp.alarmThreadDumpCount
            }));
        } else if (reportNum >= thresholdResp.maxThreadDumpCount) {
            vscode.window.showErrorMessage(I18nService.I18nReplace(i18n.threshold.threaddump_warn_content, {
                0: reportNum,
                1: thresholdResp.maxThreadDumpCount
            }));
            return false;
        }
        return true;
    }

    /**
     * 导入gclog报告阈值检测
     */
    public static async checkGclogReportThreshold(context: vscode.ExtensionContext): Promise<boolean> {
        const reportOption = {
            url: '/gcLog/list',
            method: 'GET'
        };
        // 获取已保存gclog报告记录
        const reportResp: any = await Utils.requestDataHelper(context, reportOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        const reportNum = reportResp?.data.length || 0;
        const thresholdOption = {
            url: '/tools/settings/gcLog',
            method: 'GET'
        };
        const thresholdResp: any = await Utils.requestDataHelper(context, thresholdOption, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        context.globalState.update('maxGcLogCount', thresholdResp.maxGcLogCount);
        context.globalState.update('gclogReportNum', reportNum);
        if (reportNum >= thresholdResp.alarmGcLogCount && reportNum < thresholdResp.maxGcLogCount) {
            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.gclog_tips_content, {
                0: reportNum,
                1: thresholdResp.alarmGcLogCount
            }));
        } else if (reportNum >= thresholdResp.maxGcLogCount) {
            vscode.window.showErrorMessage(I18nService.I18nReplace(i18n.threshold.gclog_warn_content, {
                0: reportNum,
                1: thresholdResp.maxGcLogCount
            }));
            return false;
        }
        return true;
    }
}
