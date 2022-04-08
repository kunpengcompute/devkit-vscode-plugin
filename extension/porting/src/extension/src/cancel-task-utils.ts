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

import * as constant from './constant';
import { ToolPanelManager } from './panel-manager';
import { Utils } from './utils';
import { PANEL_ID } from './constant';
import { I18nService } from './i18nservice';
import { MigrationProgress } from './migration-progress';
import * as vscode from 'vscode';

/**
 * 取消正在进行中的任务
 */
export class CancelTaskUtils {
    /**
     * 确认清除源码迁移临时文件
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delSourceCodeTask(global: any, message: any) {
        const option = {
            url: `/portadv/tasks/${encodeURIComponent(message.data.reportId)}/`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(global.context, option, constant.TOOL_NAME_PORTING);
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfoByLangType(resp);
            // 删除中间文件后发送消息到源码迁移面板
            CancelTaskUtils.sendStopMsgToWebView('isSourceCodeChange', 'isSourceCodeChange', PANEL_ID.portCreatescSanTask);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认清除软件包重构临时文件
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delSoftwarePackageTask(global: any, message: any, stopSoftPkgFlagObj: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/autopack/${encodeURIComponent(message.data.taskID)}/`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            stopSoftPkgFlagObj.stopSoftPkgFlag = true;
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
            // 删除中间文件后发送消息到软件包重构面板
            CancelTaskUtils.sendStopMsgToWebView('isSoftwarePackageChange', 'isSoftwarePackageChange', PANEL_ID.portSoftBuild);
        } else {
            stopSoftPkgFlagObj.stopSoftPkgFlag = false;
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认取消64位迁移预检分析任务
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delBit64AlignTask(global: any, message: any, stopFlagObj?: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/tasks/migrationscan/${encodeURIComponent(message.data.taskId)}/`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        stopFlagObj.stopFlag = true;
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认取消缓存行检查任务
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delCacheLineTask(global: any, message: any, stopFlagObj?: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/tasks/migration/cachelinealignment/task/${encodeURIComponent(message.data.taskId)}/`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        stopFlagObj.stopFlag = true;
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认取消字节对齐任务
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delByteAlignTask(global: any, message: any, stopFlagObj?: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/tasks/migration/bytealignment/task/${encodeURIComponent(message.data.taskId)}/`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        stopFlagObj.stopFlag = true;
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
            // 发送消息到软件包重构面板
            CancelTaskUtils.sendStopMsgToWebView('isSoftwarePackageChange', 'isSoftwarePackageChange', PANEL_ID.portPreCheck);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认取消生成编译任务
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delWeakCompileTask(global: any, message: any, stopFlagObj?: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/weakconsistency/tasks/${encodeURIComponent(message.data.taskId)}/stop/?task_type=9`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        stopFlagObj.stopFlag = true;
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
            // 发送消息到软件包重构面板
            CancelTaskUtils.sendStopMsgToWebView('weakCompileTask', 'taskCancel', PANEL_ID.portPreCheck);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认取消生成编译任务
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delWeakCheckTask(global: any, message: any, stopFlagObj?: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/weakconsistency/tasks/${encodeURIComponent(message.data.taskId)}/stop/?task_type=10`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        stopFlagObj.stopFlag = true;
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
            // 发送消息到软件包重构面板
            CancelTaskUtils.sendStopMsgToWebView('weakCheckTask', 'taskCancel', PANEL_ID.portPreCheck);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认取消生成编译任务
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delBcCheckTask(global: any, message: any, stopFlagObj?: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/weakconsistency/tasks/${encodeURIComponent(message.data.taskId)}/stop/?task_type=11`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        stopFlagObj.stopFlag = true;
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
            // 发送消息到bc面板
            CancelTaskUtils.sendStopMsgToWebView('bcCheckTask', 'taskCancel', PANEL_ID.portPreCheck);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认清除专项软件迁移临时文件
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delSoftwarePortingTask(global: any, message: any, stopPortingFlagObj: any) {
        const option = {
            url: `/portadv/solution/${encodeURIComponent(message.data.taskID)}/`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(global.context, option, constant.TOOL_NAME_PORTING);
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            stopPortingFlagObj.stopPortingFlag = true;
            vscode.window.showInformationMessage(I18nService.I18n().plugins_porting_clear_label);
            // 删除中间文件后发送消息到专项软件迁移面板
            CancelTaskUtils.sendStopMsgToWebView('isSoftwarePortingChange', 'isSoftwarePortingChange', PANEL_ID.portSoftPorting);
        } else {
            stopPortingFlagObj.stopPortingFlag = false;
            const errorInfo = (vscode.env.language === 'zh-cn') ? resp.infochinese : resp.info;
            vscode.window.showErrorMessage(errorInfo);
        }
        CancelTaskUtils.sendStopMsgToWebView('migrationFinished', 'migrationFinished', PANEL_ID.portSoftPorting);
    }


    /**
     * 发送任务中止消息到各业务面板
     * @param value 中止任务值
     * @param type 中止任务类型
     */
    public static sendStopMsgToWebView(taskValue: string, taskType: string, panelId: any) {
        const toolPortPanel = ToolPanelManager.getToolPanelByPanelId(panelId,
            constant.TOOL_NAME_PORTING);
        if (toolPortPanel) {
            ToolPanelManager.sentMessageToPanel(ToolPanelManager.getToolPanelByPanelId(panelId,
                constant.TOOL_NAME_PORTING), null, constant.TOOL_NAME_PORTING,
                { value: taskValue, type: taskType });
        }
    }

    /**
     * 确认清除源码迁移临时文件
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delPortAssessmentTask(global: any, message: any) {
        const option = {
            url: `/portadv/binary/${encodeURIComponent(message.data.taskId)}/`,
            method: 'DELETE'
        };
        const resp: any = await Utils.requestDataHelper(global.context, option, constant.TOOL_NAME_PORTING);
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfoByLangType(resp);
            // 删除中间文件后发送消息到源码迁移面板
            CancelTaskUtils.sendStopMsgToWebView('isSourceCodeChange', 'isSourceCodeChange', PANEL_ID.portAppraise);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
    }

    /**
     * 确认日志压缩任务
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的提示内容{info:弹框显示的信息, type:弹框级别,{error,info}}
     */
    public static async delCompressLogTask(global: any, message: any, stopFlagObj?: any) {
        const context: vscode.ExtensionContext = global.context;
        const option = {
            url: `/portadv/runlog/zip_log/?task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'DELETE',
            params: {
                task_id: message.data.taskId
            }
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        stopFlagObj.stopFlag = true;
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            Utils.showInfo(I18nService.I18n().plugins_porting_clear_label);
        } else {
            Utils.showErrorInfoByLangType(resp);
        }
        global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
    }
}

