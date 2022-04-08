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
import { TuningAssistantPerfHelper } from '../helper/tuningAssistant/tuning-assistant-helper';
import { I18nService } from '../i18nservice';
import { LogManager, LOG_LEVEL } from '../log-manager';
import { ToolPanelManager } from '../panel-manager';
import { PerfMenu } from '../toolmenu/perf-menu';
import { ToolItemNode } from '../toolmenu/tree-node';
import { Utils } from '../utils';
const i18n = I18nService.I18n();
export const TuningAssistantCommandCallback = {

    // 创建工程
    createProject(context: vscode.ExtensionContext) {
        const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        const message = Utils.generateMessage('navigate', {
            page: '/tuningHelperCreatePro',
            pageParams: {
                queryParams: {
                    panelId: 'tuningHelperCreatePro',
                    type: 'create',
                }
            },
            webSession: {
                ...sysSession,
                toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
            }
        });
        const panelOption = {
            panelId: 'tuningHelperCreatePro',
            viewType: 'tuningHelperCreatePro',
            viewTitle: i18n.plugins_sysperf_term_new_project,
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            needAsycnUpdate: true,
            message
        };
        // 展示页面面板
        ToolPanelManager.createOrShowPanel(panelOption, context);
    },

    // 删除工程
    async deleteProject(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        const list = await TuningAssistantPerfHelper.deleteBefore(treeItem.selfInfo.projectId, false, context);
        if (list.length > 0) {
            const sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const panelId = 'tuningHelperDeleteProject_' + treeItem.label;
            const message = Utils.generateMessage('navigate', {
                page: '/tuningHelperDelete',
                pageParams: {
                    queryParams: {
                        panelId,
                        type: 'view',
                        isTask: false,
                        list,
                        title: treeItem.label,
                        selfId: treeItem.selfInfo.projectId,
                    }
                },
                webSession: sysPerfSession
            });
            const panelOption = {
                panelId,
                viewType: treeItem.label,
                viewTitle: I18nService.I18n().plugins_sysperf_tuning_analysis,
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                needAsycnUpdate: true,
                message
            };

            // 展示页面面板
            ToolPanelManager.createOrShowPanel(panelOption, context);
        } else {
            const projectInfo = treeItem?.selfInfo;
            if (projectInfo) {
                vscode.window.showWarningMessage(
                    I18nService.I18nReplace(i18n.plugins_sysperf_deleteProject_confirm, { 0: projectInfo.projectName }),
                    i18n.plugins_sysperf_button_confirm,
                    i18n.plugins_sysperf_button_cancel
                ).then((select) => {
                    if (select !== i18n.plugins_sysperf_button_confirm) { return; }
                    this.sureDeleteProject(projectInfo, context);
                });

            }
        }

    },
    sureDeleteProject(projectInfo: any, context: vscode.ExtensionContext, panelId?: string) {
        // 调用删除工程接口
        const option = {
            url: `/projects/${projectInfo.projectId}/`,
            method: 'DELETE',
        };
        Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR).then((resp: any) => {
            if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
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
            } else if (resp.status === constant.HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: resp.data.message }, true);
            } else if (resp.status === constant.HTTP_STATUS.HTTP_409_CONFLICT) {
                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: resp.data.message }, true);
            }
            if (panelId) {
                ToolPanelManager.closePanel([panelId], constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            }
        }).catch(() => {
            LogManager.log(
                context,
                'deleteTuningAssistantProject error.',
                constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                LOG_LEVEL.ERROR
            );
        });
    },

    // 创建任务
    createTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            ToolPanelManager.openTuningHelperTaskManagePanel(constant.NAVIGATE_PAGE.home, context, {
                projectId: treeItem.selfInfo.projectId,
                projectName: treeItem.selfInfo.projectName,
                operation: 'createTuninghelperTask'
            });
        }
    },
    // 创建对比任务
    createCompareTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const panelId = 'createCompareTask-' + new Date().getTime();

            const message = Utils.generateMessage('navigate', {
                page: '/' + constant.NAVIGATE_PAGE.home,
                pageParams: {
                    queryParams: {
                        operation: 'createCompareTask',
                        panelId: 'createCompareTask'
                    }
                },
                webSession: {
                    ...sysSession,
                    toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
                }
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

    // 查看任务
    viewTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            const projectName = treeItem.parentName;
            const taskName = treeItem.parentLabel;
            const nodeName = treeItem.label;

            // 查看关联报告需要的信息
            const task = {
                level: 'node',
                taskname: taskName,
                taskId: treeItem.parentId,
                nodeNickName: treeItem.selfInfo.nodeNickName,
                parent: projectName,
                'analysis-type': treeItem.anaType,
                nodeId: treeItem.selfInfo.nodeId,
                nodeIP: treeItem.selfInfo.nodeIP,
                'analysis-target': treeItem.selfInfo.taskParam.analysisTarget,
                ownerId: treeItem.selfInfo.ownerId
            };
            treeItem.selfInfo.task = task;

            treeItem.selfInfo.taskParam['analysis-type'] = 'optimization';
            treeItem.selfInfo.taskParam.projectname = projectName;
            treeItem.selfInfo.taskParam.taskname = taskName;
            const panelId = projectName + '-' + taskName + '-' + task.nodeNickName + '-' + task.nodeIP;
            const sendMessage = JSON.stringify({
                taskId: treeItem.parentId,
                selfInfo: treeItem.selfInfo,
                panelId
            }).replace(/:/g, '#');
            const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const panelOption = {
                module: treeItem.module,
                needAsycnUpdate: true,
                panelId,
                viewType: constant.VIEW_TYPE.sysPerfProjectTaskNode,
                viewTitle: taskName + '-' + nodeName + '-' + projectName,
                message: Utils.generateMessage('navigate', {
                    page: '/' + constant.NAVIGATE_PAGE.home,
                    pageParams: {
                        queryParams: { sendMessage }
                    },
                    webSession: {
                        ...sysSession,
                        toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
                    }
                })
            };
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }
    },

    viewCompareTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            const projectName = '';
            const taskName = treeItem.label;
            const nodeName = '';

            treeItem.selfInfo.taskParam = {
                'analysis-type': 'tuninghelperCompare',
                projectname: projectName,
                taskname: taskName,
            };
            const panelId = taskName;
            const sendMessage = JSON.stringify({
                taskId: treeItem.selfInfo.id,
                selfInfo: treeItem.selfInfo,
                panelId
            }).replace(/:/g, '#');
            const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const panelOption = {
                module: treeItem.module,
                needAsycnUpdate: true,
                panelId,
                viewType: constant.VIEW_TYPE.sysPerfProjectTaskNode,
                viewTitle: taskName,
                message: Utils.generateMessage('navigate', {
                    page: '/' + constant.NAVIGATE_PAGE.home,
                    pageParams: {
                        queryParams: { sendMessage }
                    },
                    webSession: {
                        ...sysSession,
                        toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
                    }
                })
            };
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }
    },

    // 再次分析任务
    reanalyzeTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            ToolPanelManager.openTuningHelperTaskManagePanel(constant.NAVIGATE_PAGE.home, context, {
                taskInfo: JSON.stringify(treeItem.selfInfo),
                projectId: treeItem.parentId,
                taskName: treeItem.label,
                operation: 'reanalyzeTask'
            });
        }
    },

    // 删除任务
    deleteTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            if (treeItem.status !== 'Sampling') {
                TuningAssistantPerfHelper.deleteBefore(treeItem.selfInfo.id, true, context)
                    .then((list) => {
                        if (list.length > 0) {
                            const sysPerfSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                            const panelId = 'tuningHelperDeleteTask_' + treeItem.label;
                            const message = Utils.generateMessage('navigate', {
                                page: '/tuningHelperDelete',
                                pageParams: {
                                    queryParams: {
                                        panelId,
                                        type: 'view',
                                        isTask: true,
                                        list,
                                        title: treeItem.label,
                                        selfId: treeItem.selfInfo.id,
                                    }
                                },
                                webSession: sysPerfSession
                            });
                            const panelOption = {
                                panelId,
                                viewType: treeItem.label,
                                viewTitle: I18nService.I18n().plugins_sysperf_tuning_analysis,
                                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                                needAsycnUpdate: true,
                                message
                            };

                            // 展示页面面板
                            ToolPanelManager.createOrShowPanel(panelOption, context);
                        } else {
                            TuningAssistantPerfHelper.deleteTuningAssistantTask(treeItem.label as any, context, treeItem.selfInfo.id);
                        }
                    });
            } else {
                vscode.window.showWarningMessage(
                    I18nService.I18nReplace(i18n.plugins_sysperf_message_task_forbidden_delete, { 0: treeItem.label })
                );
            }
        }
    },
    // 删除对比任务
    deleteCompareTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            if (treeItem.status !== 'comparing') {
                TuningAssistantPerfHelper.deleteTuningAssistantTask(treeItem.label as string, context, treeItem.selfInfo);
            } else {
                vscode.window.showWarningMessage(
                    I18nService.I18nReplace(i18n.plugins_sysperf_message_task_forbidden_delete, { 0: treeItem.label })
                );
            }
        }
    },
    // 停止任务
    stopTask(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            TuningAssistantPerfHelper.stopTuningAssistantTask(context, treeItem.selfInfo.id);
        }
    },

    // 再次分析节点
    reanalyzeNode(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            ToolPanelManager.openTuningHelperTaskManagePanel(constant.NAVIGATE_PAGE.home, context, {
                taskInfo: JSON.stringify(treeItem.selfInfo),
                taskId: treeItem.parentId,
                label: treeItem.label,
                operation: 'reanalyzeServer'
            });
        }
    },

    // 查看任务分析路径
    associationTask(context: vscode.ExtensionContext, treeItem: any) {
        if (treeItem) {
            const projectName = treeItem.parentLabel;
            const taskName = treeItem.label;
            const task = {
                level: 'task',
                id: treeItem.selfInfo.id,
                taskname: taskName,
                parent: projectName,
                'analysis-type': 'tuninghelperRelation',
                'analysis-target': treeItem.selfInfo['analysis-target'],
                ownerId: treeItem.childen[0].selfInfo.ownerId
            };
            treeItem.selfInfo.task = task;

            const panelId = projectName + '-' + taskName;
            const sendMessage = JSON.stringify({
                taskId: treeItem.selfInfo.id,
                selfInfo: treeItem.selfInfo,
                panelId
            }).replace(/:/g, '#');
            const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const panelOption = {
                module: treeItem.module,
                needAsycnUpdate: true,
                panelId,
                viewType: constant.VIEW_TYPE.sysPerfProjectTaskNode,
                viewTitle: projectName + '-' + taskName,
                message: Utils.generateMessage('navigate', {
                    page: '/' + constant.NAVIGATE_PAGE.home,
                    pageParams: {
                        queryParams: { sendMessage }
                    },
                    webSession: {
                        ...sysSession,
                        toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
                    }
                })
            };
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }

    },

    // 查看任务分析路径
    associationNode(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            const projectName = treeItem.parentName;
            const taskName = treeItem.parentLabel;
            const nodeName = treeItem.label;
            const task = {
                level: 'node',
                taskname: taskName,
                taskId: treeItem.parentId,
                nodeNickName: treeItem.selfInfo.nodeNickName,
                parent: projectName,
                'analysis-type': treeItem.anaType,
                nodeId: treeItem.selfInfo.nodeId,
                nodeIP: treeItem.selfInfo.nodeIP,
                'analysis-target': treeItem.selfInfo.taskParam.analysisTarget,
                ownerId: treeItem.selfInfo.ownerId
            };
            treeItem.selfInfo.task = task;

            treeItem.selfInfo.taskParam['analysis-type'] = 'tuninghelperRelation';
            const panelId = projectName + '-' + taskName + '/' + nodeName;
            const sendMessage = JSON.stringify({
                taskId: treeItem.parentId,
                selfInfo: treeItem.selfInfo,
                panelId
            }).replace(/:/g, '#');
            const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            const panelOption = {
                module: treeItem.module,
                needAsycnUpdate: true,
                panelId,
                viewType: constant.VIEW_TYPE.sysPerfProjectTaskNode,
                viewTitle: panelId,
                message: Utils.generateMessage('navigate', {
                    page: '/' + constant.NAVIGATE_PAGE.home,
                    pageParams: {
                        queryParams: { sendMessage }
                    },
                    webSession: {
                        ...sysSession,
                        toolType: constant.PERF_SUBMODULE.TOOL_TUNINGHELPER
                    }
                })
            };
            ToolPanelManager.createOrShowPanel(panelOption, context);
        }
    },

    // 查看任务信息和日志
    viewTaskInfoAndLog(context: vscode.ExtensionContext, treeItem: ToolItemNode) {
        if (treeItem) {
            TuningAssistantPerfHelper.viewTuningAssistantInfoAndLogPanel(
                context, treeItem.parentName, treeItem.parentLabel, treeItem.parentId, treeItem.selfInfo);
        }
    },

    // 调优助手-设置
    openSetting(context: vscode.ExtensionContext, treeItem: ToolItemNode, command: string) {
        const paramsMap = {
            'extension.view.tuningAssistant.nodesManagement': { innerItem: 'itemNodeManaga' },
            'extension.view.tuningAssistant.settings': { innerItem: 'applicationPath' },
            'extension.view.tuningAssistant.operationLog': { innerItem: 'itemOperaLog' },
            'extension.view.tuningAssistant.log': { innerItem: 'itemOperaLog' },
            'extension.view.tuningAssistant.agentServerCert': { innerItem: 'itemAgent' },
        };
        ToolPanelManager.openTuningAssistantSettingPanel(context, paramsMap[command]);
    },

};
