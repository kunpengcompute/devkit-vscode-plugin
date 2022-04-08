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
import { Utils } from './utils';
import { I18nService } from './i18nservice';
import { ToolPanelManager } from './panel-manager';
import { PerfHelper } from './helper/perf-helper';
import { messageHandler } from './webview-msg-handler';
import { PerfMenu } from './toolmenu/perf-menu';
import * as fs from 'fs';
const i18n = I18nService.I18n();
import axios, { AxiosRequestConfig, ResponseType } from 'axios';

/**
 * 最大可导入的采样分析报告文件大小，即250M，单位byte
 */
const MAX_SAMPLING_FILE_SIZE = 1024 * 1024 * 250;

export default class JavaperfRecordManage {

    private static axiosInstance = axios.create();

    /**
     * 停止在线分析
     */
    public static stopProfiling() {
        vscode.window.showInformationMessage(i18n.plugins_javaperf_message_stopProfiling,
            i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel).then((select) => {
                if (select === i18n.plugins_sysperf_button_confirm) {
                    for (const panel of ToolPanelManager.javaPerfToolPanels) {
                        const option = { cmd: 'stopProfiling' };
                        Utils.invokeCallback(panel.getPanel(), option, null);
                    }
                }
            });
    }

    /**
     * 查询在线分析
     */
    public static queryProfiling() {
        const profilingPanel = ToolPanelManager.javaPerfToolPanels.find(panel => {
            return panel.getPanelId() === constant.PANEL_ID.profiling
                || panel.getPanelId() === constant.PANEL_ID.downloadProfile;
        });
        let data;
        if (profilingPanel) {
            data = {
                name: profilingPanel.getPanel()?.title,
                state: profilingPanel.getPanelId(),
                createTime: profilingPanel.getCreateTime().getTime()
            };
        }
        return data;
    }

    /**
     * 导入在线分析
     */
    public static importProfiling(context: vscode.ExtensionContext) {

        // 读取导入文件函数
        const readProfilingJSONFile = () => {
            Utils.readFile({ filters: { Json: ['json'] } }).then((jsonStr: any) => {
                if (jsonStr !== undefined) {
                    const keys = ['profileInfo', 'jvmName', 'overview', 'environment', 'keyword'];
                    const unMatchedKeysLength = keys.filter(key => (jsonStr.indexOf(key) === -1)).length;

                    // 检查导入的文件内容是否正确
                    if (unMatchedKeysLength > 0) {
                        vscode.window.showErrorMessage(i18n.plugins_javaperf_message_importProfiling_errTip);
                        return;
                    }
                    const webviewSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR + 'Session');
                    const downloadDatas = JSON.parse(jsonStr);
                    const navMessage = Utils.generateMessage('navigate', {
                        page: '/profiling/' + downloadDatas.profileInfo.jvmName,
                        pageParams: {
                            queryParams: {
                                downloadDatas: String(jsonStr),
                                currentSelectJvm: downloadDatas.profileInfo.jvmName,
                                jvmId: downloadDatas.profileInfo.jvmId,
                                role: webviewSession?.role,
                                username: webviewSession?.username,
                                loginId: webviewSession?.loginId,
                                downloadProfile: 'true'
                            }
                        },
                        webSession: { language: vscode.env.language }
                    });
                    const importTime = Utils.formatDatetime(new Date(), 'yyyy-MM-dd hh:mm:ss');
                    const panelOption = {
                        panelId: constant.PANEL_ID.downloadProfile,
                        viewType: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        viewTitle: downloadDatas.profileInfo.jvmName + I18nService.I18n().plugins_javaperf_title_importTime + importTime,
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        message: navMessage,
                        createTime: new Date(downloadDatas.profileInfo.createTime)
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, context);
                }
            });
        };
        const profilingPanel = ToolPanelManager.javaPerfToolPanels.find(panel => {
            return panel.getPanelId() === constant.PANEL_ID.profiling;
        });
        const downloadProfilePanel = ToolPanelManager.javaPerfToolPanels.find(panel => {
            return panel.getPanelId() === constant.PANEL_ID.downloadProfile;
        });

        // 检查是否已有profiling
        if (profilingPanel) {
            vscode.window.showWarningMessage(i18n.plugins_javaperf_message_importProfiling_warningtip,
                i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel).then((select) => {
                    if (select === i18n.plugins_sysperf_button_confirm) {
                        for (const panel of ToolPanelManager.javaPerfToolPanels) {
                            const message = { cmd: 'stopProfiling' };
                            Utils.invokeCallback(panel.getPanel(), message, null);
                        }
                        ToolPanelManager.closePanel([constant.PANEL_ID.profiling], constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
                        readProfilingJSONFile();
                    }
                });
            // 检测是否已有downloadProfile窗口
        } else if (downloadProfilePanel) {
            vscode.window.showWarningMessage(i18n.plugins_javaperf_message_importProfiling_warningtip2,
                i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel).then((select) => {
                    if (select === i18n.plugins_sysperf_button_confirm) {
                        ToolPanelManager.closePanel([constant.PANEL_ID.downloadProfile], constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
                        readProfilingJSONFile();
                    }
                });
        } else {
            readProfilingJSONFile();
        }
    }

    /**
     * 导出在线分析
     */
    public static exportProfiling() {
        for (const panel of ToolPanelManager.javaPerfToolPanels) {
            const message = { cmd: 'exportProfiling' };
            Utils.invokeCallback(panel.getPanel(), message, panel.getCreateTime().getTime());
        }
    }

    /**
     * 删除采样分析
     */
    public static deleteSampling(context: vscode.ExtensionContext, samplingId?: string, samplingName?: string, userData?: any) {
        if (!samplingId) { return; }
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_sampling_delete_tip, { 0: samplingName });
        // 风险操作检验
        if (session?.role === constant.PERF_ROLE.ADMIN && session?.loginId !== userData.id) {
            tipMsg = I18nService.I18nReplace(i18n.plugins_perf_java_sampling_delete_user_tip,
                { 0: userData.username, 1: samplingName });
        }
        vscode.window.showWarningMessage(tipMsg,
            i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
            .then((select) => {
                if (select === i18n.plugins_sysperf_button_confirm) {
                    const option = {
                        method: 'DELETE',
                        url: '/records/' + samplingId
                    };
                    Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
                        if (resp.status === 200) {
                            PerfMenu.updataTree(context);
                        }
                    });
                }
            });
    }

    /**
     * 设置项打开建议反馈外链
     * @param context 插件上下文
     * @param module 模块标识
     */
    public static openAdviceLink(context: vscode.ExtensionContext, module: string) {
        const pluginUrlCfg = Utils.getURLConfigJson(context);
        const urlStr = pluginUrlCfg.hikunpengUrl;
        const faq = vscode.Uri.parse(pluginUrlCfg.hikunpengUrl);
        vscode.commands.executeCommand('vscode.open', faq);
    }

    /**
     * 查询采样分析
     */
    public static querySampling() {
        return PerfHelper.samplingRecords;
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
        const panelID = (module === 'sysPerf') ?
            constant.PANEL_ID.sysperfAdviceError : constant.PANEL_ID.javaperfAdviceError;
        const panelOption = {
            panelId: panelID,
            viewType: constant.VIEW_TYPE.feedbackError,
            viewTitle: i18n.plugins_common_term_connect_fail,
            module,
            message
        };
        ToolPanelManager.createOrShowPanel(panelOption, context);
    }



    /**
     * 阈值提示弹窗
     */
    public static popWarnTip(res: any): boolean {
        if (PerfHelper.samplingRecords.length >= res.alarmJFRCount &&
            PerfHelper.samplingRecords.length < res.maxJFRCount) {
            vscode.window.showInformationMessage(I18nService.I18nReplace(i18n.threshold.tips_content, {
                0: PerfHelper.samplingRecords.length,
                1: res.alarmJFRCount
            }));
        } else if (PerfHelper.samplingRecords.length >= res.maxJFRCount) {
            vscode.window.showWarningMessage(I18nService.I18nReplace(i18n.threshold.warn_content, {
                0: PerfHelper.samplingRecords.length,
                1: res.maxJFRCount
            }));
            return false;
        }
        return true;
    }


    /**
     * 导入采样分析
     */
    public static importSampling(context: vscode.ExtensionContext) {
        let thresholdValue = '';
        PerfHelper.getSampleRecords(context);
        PerfHelper.getSampleThreshold(context).then((resData) => {
            thresholdValue = resData;
            if (resData && resData.alarmJFRCount && resData.maxJFRCount) {
                if (!this.popWarnTip(resData)) {
                    return;
                }

                // 打开文件选择框
                vscode.window.showOpenDialog({}).then(data => {
                    if (data && data.length > 0) {
                        const filePath = data[0].path.substr(1);
                        const fileStats = fs.statSync(filePath);
                        if (fileStats.size > MAX_SAMPLING_FILE_SIZE) {
                            vscode.window.showErrorMessage(i18n.plugins_javaperf_import_sampling_error);
                            return;
                        }
                        const fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
                        const option = {
                            method: 'POST',
                            url: '/records/actions/upload',
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
                                        PerfHelper.getSampleRecords(context).then(() => {
                                            this.popWarnTip(thresholdValue);
                                        });
                                    } else {
                                        resolve('');
                                        vscode.window.showErrorMessage(resp.data.message);
                                    }
                                });
                            });
                        });
                    }
                });
            }
        });
    }


    /**
     * 导出采样分析
     */
    public static exportSampling(context: vscode.ExtensionContext, samplingId?: string, samplingName?: string) {
        if (!samplingId) { return; }
        const option = {
            method: 'GET',
            url: '/records/actions/download/' + samplingId,
            responseType: 'arraybuffer' as ResponseType
        };
        Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR).then((resp: any) => {
            messageHandler.downloadFile({ context, toolPanel: { getPanel() { } } }, {
                data: {
                    invokeLocalSave: true,
                    contentType: 'arraybuffer',
                    fileName: samplingName || samplingId,
                    fileContent: resp?.data
                }
            });
        });
    }

    /**
     * 关闭添加目标环境页面
     */
    public static closeTargetEnvirpoment(global: any) {
        ToolPanelManager.closePanel([constant.PANEL_ID.targetEnvirpoment], constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        PerfMenu.updataTree(global.context);
    }
}
