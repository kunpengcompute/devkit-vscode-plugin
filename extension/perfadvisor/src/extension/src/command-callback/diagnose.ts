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

import * as constant from '../constant';
import * as vscode from 'vscode';
import { I18nService } from '../i18nservice';
import { ToolPanelManager } from '../panel-manager';
import { ToolItemNode } from '../toolmenu/tree-node';
import { Utils } from '../utils';
import { LogManager, LOG_LEVEL } from '../log-manager';
import { PerfMenu } from '../toolmenu/perf-menu';
import { DiagnoseTaskHelper } from '../helper/diagnose/task-helper';
const i18n = I18nService.I18n();

export const DiagnoseCommandCallback = {
    viewTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            treeItem.selfInfo.taskParam['analysis-type'] = treeItem.anaType;
            ToolPanelManager.handleDiagnoseTaskNodeClick(context, treeItem);
        }
    },

    viewProject(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        const projectInfo = treeItem?.selfInfo;
        if (projectInfo) {
            const sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

            const message = Utils.generateMessage('navigate', {
                page: '/diagnoseProjectManagement',
                pageParams: {
                    queryParams: {
                        panelId: projectInfo.projectName,
                        type: 'view',
                        projectId: projectInfo.projectId,
                        canEdit: +projectInfo.ownerId === sysPerfSession.loginId
                    }
                },
                webSession: sysPerfSession
            });
            const panelOption = {
                panelId: projectInfo.projectName,
                viewType: projectInfo.projectName,
                viewTitle: projectInfo.projectName,
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                needAsycnUpdate: true,
                message
            };

            // 展示页面面板
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }
    },

    createProject(context: vscode.ExtensionContext) {
        const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        const message = Utils.generateMessage('navigate', {
            page: '/diagnoseProjectManagement',
            pageParams: {
                queryParams: {
                    panelId: 'diagnoseProjectManagement',
                    type: 'create',
                }
            },
            webSession: sysPerfSession
        });
        const panelOption = {
            panelId: 'diagnoseProjectManagement',
            viewType: 'diagnoseProjectManagement',
            viewTitle: i18n.plugins_sysperf_term_new_project,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            needAsycnUpdate: true,
            message
        };

        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    },

    modifyProject(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        const projectInfo = treeItem?.selfInfo;
        if (projectInfo) {
            const sysPerfSession = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

            const message = Utils.generateMessage('navigate', {
                page: '/diagnoseProjectManagement',
                pageParams: {
                    queryParams: {
                        panelId: projectInfo.projectName,
                        type: 'modify',
                        projectId: projectInfo.projectId
                    }
                },
                webSession: sysPerfSession
            });
            const panelOption = {
                panelId: projectInfo.projectName,
                viewType: projectInfo.projectName,
                viewTitle: projectInfo.projectName,
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                needAsycnUpdate: true,
                message
            };

            // 展示页面面板
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }
    },

    async deleteProject(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        const projectInfo = treeItem?.selfInfo;
        if (projectInfo) {
            // 校验project信息
            let option = {
                url: `/schedule-tasks/?project-id=${projectInfo.projectId}&analysis-type=memory_diagnostic`,
                method: 'GET',
            };
            const resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

            // 校验project信息无误后调用删除接口
            if (resp.code !== constant.HTTP_STATUS_CODE.SYSPERF_SUCCESS) { return; }
            vscode.window.showWarningMessage(
                I18nService.I18nReplace(i18n.plugins_sysperf_deleteProject_confirm, { 0: projectInfo.projectName }),
                i18n.plugins_sysperf_button_confirm,
                i18n.plugins_sysperf_button_cancel
            ).then((select) => {
                if (select !== i18n.plugins_sysperf_button_confirm) { return; }
                // 调用删除工程接口
                option = {
                    url: `/memory-project/${projectInfo.projectId}/`,
                    method: 'DELETE',
                };
                Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR).then((response: any) => {
                    if (response.status === constant.HTTP_STATUS.HTTP_200_OK) {
                        // 刷新左侧树
                        PerfMenu.updataTree(context);
                        // 关闭与该工程有关的所有打开面板
                        const deletePanleIds = ToolPanelManager.sysPerfToolPanels
                            .filter(item => item.getPanelId().includes(projectInfo.projectName))
                            .map(item => item.getPanelId());
                        ToolPanelManager.closePanel(deletePanleIds, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

                        Utils.showMessageByType(
                            constant.MESSAGE_TYPE.INFO,
                            {
                                info: I18nService.I18nReplace(i18n.plugins_sysperf_deleteProject, {
                                    0: projectInfo.projectName,
                                }),
                            },
                            true
                        );
                    } else if (response.status === constant.HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                        Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: response.data.message }, true);
                    } else if (response.status === constant.HTTP_STATUS.HTTP_409_CONFLICT) {
                        Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: response.data.message }, true);
                    }
                }).catch(() => {
                    LogManager.log(
                        context,
                        'deleteProject error.',
                        constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                        LOG_LEVEL.ERROR
                    );
                });
            });
        }
    },

    importTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            ToolPanelManager.openDiagnoseTaskManagePanel(constant.NAVIGATE_PAGE.importTask, context, {
                projectId: treeItem.id,
                projectName: treeItem.parentLabel,
                operation: 'importTask',
                taskName: i18n.plugins_sysperf_project.importTask
            });
        }
    },

    exportTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem && treeItem.label) {
            DiagnoseTaskHelper.exportTask(context, 'export', {
                analysisType: 'memory_diagnostic',
                projectname: treeItem.parentLabel,
                taskname: treeItem.selfInfo.taskname
            });
        }
    },

    createTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            ToolPanelManager.openDiagnoseTaskManagePanel(constant.NAVIGATE_PAGE.home, context, {
                projectId: treeItem.selfInfo.projectId,
                projectName: treeItem.selfInfo.projectName,
                operation: 'createTask'
            });
        }
    },

    modifyTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (!treeItem) { return; }
        if (treeItem.status === 'Sampling') {
            vscode.window.showWarningMessage(
                I18nService.I18nReplace(i18n.plugins_sysperf_message_task_forbidden_modify, { 0: treeItem.label })
            );
        } else {
            ToolPanelManager.openDiagnoseTaskManagePanel(constant.NAVIGATE_PAGE.home, context, {
                timeWaiting: true,
                projectId: treeItem.parentId,
                projectName: treeItem.parentLabel,
                taskId: treeItem.selfInfo.id,
                taskName: treeItem.label,
                analysisType: treeItem.selfInfo['analysis-type'],
                operation: 'modifyTask'
            });
        }
    },

    deleteTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            if (treeItem.status !== 'Sampling') {
                DiagnoseTaskHelper.deleteDiagnoseTask(treeItem.label as string, context, treeItem.selfInfo.id);
            } else {
                vscode.window.showWarningMessage(
                    I18nService.I18nReplace(i18n.plugins_sysperf_message_task_forbidden_delete, { 0: treeItem.label })
                );
            }
        }
    },

    runTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            DiagnoseTaskHelper.runDiagnoseTask(treeItem.parentLabel, treeItem.label as string, context, treeItem.selfInfo);
        }
    },

    stopTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            DiagnoseTaskHelper.stopDiagnoseTask(context, treeItem.selfInfo);
        }
    },

    reanalysisTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            ToolPanelManager.openDiagnoseTaskManagePanel(constant.NAVIGATE_PAGE.home, context, {
                projectId: treeItem.parentId,
                projectName: treeItem.parentLabel,
                taskId: treeItem.selfInfo.id,
                taskName: treeItem.label,
                analysisType: treeItem.selfInfo['analysis-type'],
                operation: 'reanalysisTask'
            });
        }
    },

    openSetting(context: vscode.ExtensionContext, treeItem: ToolItemNode, command: string) {
        const paramsMap = {
            'extension.view.diagnose.nodesManagement': { innerItem: 'itemNodeManaga' },
            'extension.view.diagnose.reservationTaskManagement': { innerItem: 'itemAppointTask' },
            'extension.view.diagnose.importAndExportTask': { innerItem: 'itemImportAndExportTask' },
            'extension.view.diagnose.taskTempManagement': { innerItem: 'itemTaskModel' },
            'extension.view.diagnose.settings': { innerItem: 'applicationPath' },
            'extension.view.diagnose.operationLog': { innerItem: 'itemOperaLog' },
            'extension.view.diagnose.log': { innerItem: 'itemOperaLog' },
            'extension.view.diagnose.agentServerCert': { innerItem: 'itemAgent' },
        };
        ToolPanelManager.openDiagnoseSettingPanel(context, paramsMap[command]);
    },
};
