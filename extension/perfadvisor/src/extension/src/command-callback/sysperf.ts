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
import * as constant from '../constant';
import { TaskHelper } from '../helper/task-helper';
import { I18nService } from '../i18nservice';
import { ToolPanelManager } from '../panel-manager';
import { ToolItemNode } from '../toolmenu/tree-node';
import { Utils } from '../utils';
const i18n = I18nService.I18n();

export const SysperfCommandCallback = {

    createLinkageTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const panelId = 'createLinkageTask-' + new Date().getTime();

            const message = Utils.generateMessage('navigate', {
                page: '/' + constant.NAVIGATE_PAGE.home,
                pageParams: {
                    queryParams: {
                        operation: 'createTask',
                        panelId: 'createLinkageTask'
                    }
                },
                webSession: sysPerfSession
            });
            const panelOption = {
                panelId,
                viewType: constant.VIEW_TYPE.perfCreateTask,
                viewTitle: i18n.plugins_sysperf_title_createtask,
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                message
            };

            // 展示页面面板
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }
    },

    viewLinkageTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        treeItem.selfInfo.isLinkageTask = true;
        ToolPanelManager.handleSysPerfTreeNodeClick(context, treeItem);
    },

    deleteLinkageTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            if (treeItem.status !== 'Sampling') {
                TaskHelper.deleteTask(treeItem.label as string, context, treeItem.selfInfo.id);
            } else {
                vscode.window.showWarningMessage(
                    I18nService.I18nReplace(i18n.plugins_sysperf_message_task_forbidden_delete, { 0: treeItem.label })
                );
            }
        }
    },

};
