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
import { ToolItemNode } from '../../toolmenu/tree-node';
import * as constant from '../../constant';
import { Utils } from '../../utils';
import { LogManager, LOG_LEVEL } from '../../log-manager';
import { I18nService } from '../../i18nservice';
import { PerfMenu } from '../../toolmenu/perf-menu';
import { ToolPanelManager } from '../../panel-manager';
const i18n = I18nService.I18n();

/**
 * 调优助手
 */
export class TuningAssistantPerfHelper {

    /**
     * 删除任务
     *
     * @param TaskName 用来标识打开的功能
     * @param context 插件上下文
     */
    public static async deleteTuningAssistantTask(taskName: string | undefined, context: vscode.ExtensionContext, taskId: any) {
        // 校验Task信息
        vscode.window.showWarningMessage(
            I18nService.I18nReplace(i18n.plugins_sysperf_deleteTask_confirm, { 0: taskName }),
            i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
            .then(async select => {
                if (select === i18n.plugins_sysperf_button_confirm) {
                    this.sureDeleteTask(taskName, context, taskId);
                }
            });
    }
    /**
     * 确认删除任务
     * @param taskName taskName
     * @param context 全局上下文
     * @param taskId taskId
     * @param panelId panelId
     */
    static async sureDeleteTask(taskName: string | undefined, context: vscode.ExtensionContext, taskId: any, panelId?: string) {
        try {
            // 调用删除任务接口
            let option: any;
            if (Object.prototype.toString.call(taskId) === '[object Object]' &&
                Object.prototype.hasOwnProperty.call(taskId, 'compare_name')) {
                option = {
                    url: `/data-comparison/delete-report/`,
                    method: 'DELETE',
                    params: { id: taskId.id }
                };
            } else {
                option = {
                    url: `/tasks/${taskId}/`,
                    method: 'DELETE',
                };
            }
            const resp = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            if (resp.code === constant.HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                // 刷新左侧树
                PerfMenu.updataTree(context);
                // 关闭该任务下所有打开面板
                TuningAssistantPerfHelper.closeTaskRelatedPinal(taskName);
                Utils.showMessageByType(constant.MESSAGE_TYPE.INFO,
                    { info: I18nService.I18nReplace(i18n.plugins_sysperf_deleteTask, { 0: taskName }) }, true);
            } else {
                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING,
                    { info: resp.data.message }, true);
            }
            if (panelId) {
                ToolPanelManager.closePanel([panelId], constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            }
        } catch (error) {
            LogManager.log(context, 'deleteTask error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
        }
    }
    /**
     * 删除之前提示会删除关联的对比分析任务
     */
    static async deleteBefore(id: number, isTask: boolean, context: vscode.ExtensionContext) {
        const option = {
            url: `/data-comparison/query-deletion-report/?id=${id}&&is-task=${isTask}`,
            method: 'GET',
        };
        const res = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        return Promise.resolve(res.data);
    }
    /**
     * 调优助手停止分析任务
     * @param context 上下文
     * @param taskId 任务id
     */
    public static async stopTuningAssistantTask(context: vscode.ExtensionContext, taskId: string) {
        try {
            // 调用停止任务接口
            const option = {
                url: '/tasks/'.concat(taskId).concat('/status/'),
                method: 'PUT',
                params: { status: constant.TASK_STATUS.CANCELLED.toLowerCase() }
            };
            const resp = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

            if (resp.code === constant.HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                setTimeout(() => {
                    // 刷新左侧树
                    PerfMenu.updataTree(context);
                }, 3500);
            } else {
                Utils.showMessageByType(constant.MESSAGE_TYPE.ERROR, { info: resp.message }, true);
            }

        } catch (error) {
            LogManager.log(context, 'stopTuningAssistantTask error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
        }
    }

    /**
     * 关闭该项目下所有打开面板
     * @param taskName 任务名称
     */
    private static closeTaskRelatedPinal(taskName: string | undefined) {
        if (taskName) {
            taskName = taskName.split('-')[0];
        }
        const deletePanleIds: Array<string> = [];
        // 获取需要关闭的panelid列表
        ToolPanelManager.sysPerfToolPanels.forEach(element => {
            const items = element.getPanelId().split('-');
            if ((items.length > 0 && taskName === items[0]) || (items.length > 1 && taskName === items[1])) {
                deletePanleIds.push(element.getPanelId());
            }
        });

        // 关闭面板
        ToolPanelManager.closePanel(deletePanleIds, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
    }

    /**
     * 进入查看基本信息和日志界面
     * @param context 上下文
     * @param projectName 工程名称
     * @param taskName 任务名称
     * @param taskId 任务ID
     * @param selfInfo 节点参数
     */
    public static viewTuningAssistantInfoAndLogPanel(
        context: vscode.ExtensionContext,
        projectName: string,
        taskName: string,
        taskId: string,
        selfInfo: any) {
        const nodeName = selfInfo.nodeNickName;
        selfInfo.taskParam['analysis-type'] = 'tuninghelperInfoLog';
        selfInfo.task = {
            parentNode: {
                projectName,
            },
            taskname: taskName
        };
        selfInfo.taskId = taskId;
        const viewTitle = `${i18n.plugins_common_term_task_detail}-${taskName}-${nodeName}-${projectName}`;
        const panelId = `tuninghelperInfoLog-${taskName}-${nodeName}-${projectName}`;
        const sendMessage = JSON.stringify({
            selfInfo,
        }).replace(/:/g, '#');
        const sysSession: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        const panelOption = {
            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
            needAsycnUpdate: true,
            panelId,
            viewType: constant.VIEW_TYPE.sysPerfProjectTaskNode,
            viewTitle,
            message: Utils.generateMessage('navigate', {
                page: '/' + constant.NAVIGATE_PAGE.tuningAssistantTaskInfoLog,
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

    /**
     * 查询调优助手对比分析任务列表
     *
     * @param context 上下文
     */
    static async getCompareTaskList(context: vscode.ExtensionContext): Promise<ToolItemNode[]> {
        const iconPath = {
            succeed: constant.NODE_STATUS_PIC.COMPLETED,
            Aborted: constant.NODE_STATUS_PIC.COMPLETED,
            comparing: constant.NODE_STATUS_PIC.SAMPLING,
            failed: constant.NODE_STATUS_PIC.FAILED,
            Created: constant.NODE_STATUS_PIC.CREATED,
        };
        const option = {
            url: '/data-comparison/compare-reports/',
            method: 'GET'
        };
        const resp = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        const loginId = session.loginId;
        const isAdmin = Utils.isAdmin(context);
        let taskList
            = (resp.data ?? []).map((item: any) => {
                const isDeletable = item.owner_id === loginId || isAdmin;
                const value = {
                    label: item.compare_name,
                    id: 'COMPARE_' + item.id,
                    selfInfo: item,
                    iconPath: Utils.getExtensionFileAbsolutePath(context,
                        Utils.getCurrentPicPath() + iconPath[item.status]),
                    contextValue: isDeletable ? 'isDeletable' : 'notDeletable',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                    command: 'extension.view.tuningAssistant.viewCompareTask'
                };
                return new ToolItemNode(value);
            });

        // 任务列表按时逆序排序
        taskList = taskList.sort((a: any, b: any) => {
            return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
        });
        return taskList;
    }

    /**
     * 查询调优助手工程列表
     *
     * @param context 上下文
     */
    static async getTuningAssistantProjectList(context: vscode.ExtensionContext): Promise<ToolItemNode[]> {
        const projectList: Array<ToolItemNode> = [];
        try {
            const option = {
                url: constant.SYSPERF_URIS.PERF_SYSPERF_QUERY_URI + '?auto-flag=on' + '&date=' + Date.now() + '&analysis-type=optimization',
                method: 'GET'
            };
            // 获取已存在的工程
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

            if (response?.data?.projects.length > 0) {
                response.data.projects.sort(
                    (a: any, b: any) => (Utils.getDate(b.timeCreated).getTime() - Utils.getDate(a.timeCreated).getTime())
                );
                let itemDef: ToolItemNode;
                const projectListDef = response.data.projects;

                // 查询所有工程下任务
                let projectNames = '';
                const projectMap: Map<string, any> = new Map<string, any>();
                for (const project of projectListDef) {
                    projectNames = projectNames + project.projectName + ',';
                    projectMap.set(project.projectName, project);
                }
                const projectTaskMap: Map<string, ToolItemNode[]> = await TuningAssistantPerfHelper.getTaskList(context,
                    { projectMap, auto: 'on', projectNames: projectNames.substring(0, projectNames.length - 1), page: 1, perPage: 1000 }
                );

                // 初始化project树节点
                for (const project of projectListDef) {
                    const nodeInfo = {
                        label: project.projectName,
                        id: project.projectId,
                        status: project.status,
                        module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                        selfInfo: project
                    };
                    itemDef = TuningAssistantPerfHelper.updatTuningAssistantProjectNodeStatus(context, nodeInfo,
                        projectTaskMap.get(project.projectName), project);

                    projectList.push(itemDef);
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: response.message }, true);
            }
        } catch (error) {
            LogManager.log(context, 'getTuningAssistantProjectList error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(projectList);
        }

        // 如果没有工程的情况下需要展示新建工程
        if (projectList.length === 0) {
            const noReportInfo = new ToolItemNode({
                label: I18nService.I18n().plugins_common_title_create_project,
                id: 'tuningAssistantProjectNoData',
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                collapsibleState: vscode.TreeItemCollapsibleState.None,
                command: 'extension.view.tuningAssistant.createProject'
            });
            projectList.push(noReportInfo);
        }

        return Promise.resolve(projectList);
    }

    /**
     * 设置工程节点状态等信息
     * @param context 上下文
     * @param projectNodeInfo 任务节点
     * @param project 项目信息
     */
    private static updatTuningAssistantProjectNodeStatus(context: vscode.ExtensionContext, nodeInfo: any, children: any, project: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let iconPath = '';
        // 查询project状态， 并当前用户相关contextValue
        if (String(session.loginId) === project.ownerId) {
            // 当前用户对该项具有操作权限
            nodeInfo.contextValue = constant.TUNING_ASSISTANT_CONTEXT_VALUE.tuningAssistantProjectSelf;
        } else if (Utils.isAdmin(context)) {
            // 管理员操作权限
            nodeInfo.contextValue = constant.TUNING_ASSISTANT_CONTEXT_VALUE.tuningAssistantProjectAdmin;
        } else {
            nodeInfo.contextValue = constant.TUNING_ASSISTANT_CONTEXT_VALUE.tuningAssistantProject;
        }

        // 查询project状态， 并添加图标
        if (constant.PROJECT_STATUS.NORMAL === nodeInfo.status && !nodeInfo.selfInfo.is_import) {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.NORMAL);
        } else if (constant.PROJECT_STATUS.ABNORMAL === nodeInfo.status && !nodeInfo.selfInfo.is_import) {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.ABNORMAL);
        }
        nodeInfo.tooltip = project.projectName;
        const projectNodeInfo = new ToolItemNode(nodeInfo, children);
        projectNodeInfo.iconPath = iconPath;
        return projectNodeInfo;
    }

    /**
     * 调优助手调用后端服务器获取已创建的工程的任务
     *
     * @param context 上下文
     * @param params 请求参数，包含查询的工程名
     * @param module 模块，perfadvisor下子模块sysPerf和javaPerf
     */
    static async getTaskList(context: vscode.ExtensionContext, params: any): Promise<Map<string, ToolItemNode[]>> {
        const projectTaskMap: Map<string, ToolItemNode[]> = new Map<string, ToolItemNode[]>();
        try {
            const option = {
                url: '/tasks/task-summary/?analysis-type=all&project-name=' + encodeURIComponent(params.projectNames) +
                    '&auto-flag=' + encodeURIComponent(params.auto) + '&page=' + params.page + '&per-page=' + params.perPage +
                    '&analysis-type=optimization',
                method: 'GET'
            };
            // 获取已存在的工程的任务
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            if (response?.data?.length > 0) {
                const projectTasksDef = response.data;
                // 遍历project
                for (const project of projectTasksDef) {
                    project.tasklist.sort(
                        (a: any, b: any) => (Utils.getDate(b.createtime).getTime() - Utils.getDate(a.createtime).getTime())
                    );
                    const taskList: Array<ToolItemNode> = [];
                    // 遍历工程下task
                    for (const task of project.tasklist) {
                        let itemDef: ToolItemNode;
                        const nodeInfo = {
                            parentId: params.projectMap.get(project.projectname).projectId,
                            parentLabel: params.projectMap.get(project.projectname).projectName,
                            selfInfo: task,
                            status: task['task-status'],
                            label: task.taskname,
                            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                            is_import: params.projectMap.get(project.projectname).is_import
                        };
                        nodeInfo.selfInfo.selfId = task.id;
                        project.projectId = nodeInfo.parentId;
                        // 获取task下node
                        const taskNodeMap: Map<string, ToolItemNode[]> = await TuningAssistantPerfHelper.getTuningAssistantNodeList(
                            context, {
                            taskNodes: {
                                taskId: task.id,
                                taskName: task.taskname,
                                anaType: task['analysis-type'],
                                nodeList: task.nodeList,
                                parentLabel: params.projectMap.get(project.projectname).projectName,
                                project
                            }
                        });
                        itemDef = TuningAssistantPerfHelper.updateTuningAssistantTaskNodeStatus(
                            context, nodeInfo, taskNodeMap.get(task.taskname), project);

                        taskList.push(itemDef);
                    }
                    projectTaskMap.set(project.projectname, taskList);

                }
            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(projectTaskMap);
            } else {
                LogManager.log(context, 'getTuningAssistantTaskList failed.' + response?.data,
                    constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(projectTaskMap);
            }
        } catch (error) {
            LogManager.log(context, 'getTuningAssistantTaskList error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(projectTaskMap);
        }
        return Promise.resolve(projectTaskMap);
    }

    /**
     * 设置task节点状态等信息
     * @param context 上下文
     * @param nodeInfo 任务节点
     * @param project 任务所属项目信息
     */
    private static updateTuningAssistantTaskNodeStatus(context: vscode.ExtensionContext, nodeInfo: any, children: any, project: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        const iconPath = '';
        let analysisTarget = this.setTooltipText(nodeInfo.selfInfo['analysis-target']);
        const analysisType = this.setTooltipText(nodeInfo.selfInfo['analysis-type']);
        analysisTarget = (!analysisTarget) ? I18nService.I18n().plugins_sysperf_label_allTargets[0] : analysisTarget;
        const toolTip = `${I18nService.I18n().plugins_sysperf_label_targetName}: ${nodeInfo.selfInfo.taskname}
${I18nService.I18n().plugins_sysperf_label_analysisTarget}: ${analysisTarget}
${I18nService.I18n().plugins_sysperf_label_analysisType}: ${analysisType}`;
        nodeInfo.tooltip = toolTip;

        // 任务状态对应操作 ['Created', 'Waiting', 'Sampling', 'Analyzing', 'Stopping', 'Cancelling', 'Completed', 'Failed', 'running', 'Cancelled']
        // 再次分析 -- 完成状态才可以 R
        // 删除 -- 采集中、分析中状态不能删除 D
        // 查看分析路径 -- 所有状态都能查看分析路径，但是非Completed状态无优化建议 A
        // 停止任务 -- 采集中才可以 Sampling S
        const taskOperate = {
            delete: ['Created', 'Waiting', 'Stopping', 'Cancelling', 'Completed', 'Failed', 'running', 'Cancelled']
        };
        // 查询task状态， 并添加图标
        if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
            if (constant.TASK_STATUS.COMPLETED === nodeInfo.status) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantTaskReanalyze;
            } else if (constant.TASK_STATUS.SAMPLING === nodeInfo.status) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantTaskStop;
            } else if (taskOperate.delete.includes(nodeInfo.status)) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantTaskDelete;
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantTaskNormal;
            }
        } else {
            nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantTaskNormal;
        }
        const taskNodeInfo = new ToolItemNode(nodeInfo, children);
        taskNodeInfo.iconPath = iconPath;

        return taskNodeInfo;
    }

    /**
     * 设置tooltip提示文字
     * @param context 上下文
     */
    private static setTooltipText(tipStr: any) {
        let receiveStr = null;
        switch (tipStr) {
            case 'Attach to Process':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTargets[1];
                break;
            case 'Profile System':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTargets[0];
                break;
            case 'Launch Application':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTargets[1];
                break;
            case 'optimization':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[10];
                break;
            default:
                break;
        }
        return receiveStr;
    }

    /**
     * 组装工程任务下的节点树
     *
     * @param context 上下文
     * @param params 请求参数，包含taskName及其包含的node
     * @param module 模块，perfadvisor下子模块sysPerf和javaPerf
     */
    static async getTuningAssistantNodeList(context: vscode.ExtensionContext, params: any): Promise<Map<string, ToolItemNode[]>> {
        const taskNodeMap: Map<string, ToolItemNode[]> = new Map<string, ToolItemNode[]>();
        try {
            // 获取已存在的工程的任务
            if (params?.taskNodes?.nodeList.length > 0) {
                const taskNodeList = params.taskNodes.nodeList;
                const nodeList: Array<ToolItemNode> = [];
                // 遍历task下node
                for (const node of taskNodeList) {
                    let itemDef: ToolItemNode;
                    const nodeInfo = {
                        parentId: params.taskNodes.taskId,
                        parentLabel: params.taskNodes.taskName,
                        anaType: params.taskNodes.anaType,
                        selfInfo: node,
                        status: node.sampleStatus,
                        label: node.nodeNickName,
                        module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        parentName: params.taskNodes.parentLabel,
                        command: 'extension.view.tuningAssistant.viewTask'
                    };
                    nodeInfo.selfInfo.selfId = node.nodeId;
                    nodeInfo.selfInfo.ownerId = params.taskNodes.project.ownerid;
                    nodeInfo.selfInfo.projectId = params.taskNodes.project.projectId;
                    nodeInfo.selfInfo.projectName = params.taskNodes.project.projectname;
                    itemDef = TuningAssistantPerfHelper.updateNodeStatus(context, nodeInfo, params.taskNodes);

                    nodeList.push(itemDef);
                    taskNodeMap.set(params.taskNodes.taskName, nodeList);
                }
            }
        } catch (error) {
            LogManager.log(context,
                'getTuningAssistantNodeList error.' + error, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
        }
        return Promise.resolve(taskNodeMap);
    }

    /**
     * 设置agent节点状态等信息
     * @param context 上下文
     * @param taskNodeInfo 任务节点
     * @param task 所属任务信息
     */
    private static updateNodeStatus(context: vscode.ExtensionContext, nodeInfo: any, task: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let iconPath = '';
        // 查询节点状态， 并添加操作图标
        if (String(session.loginId) === task.project.ownerid || Utils.isAdmin(context)) {
            if (constant.TASK_STATUS.COMPLETED === nodeInfo.status) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantNodeRA;
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantNodeA;
            }
        } else {
            nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistantNodeA;
        }

        // 查询node状态， 并添加图标
        if (constant.NODE_STATUS.COMPLETED === nodeInfo.status || constant.NODE_STATUS.ABORTED === nodeInfo.status) {
            // 已执行完成
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.NODE_STATUS_PIC.COMPLETED);
        } else if (constant.NODE_STATUS.SAMPLING === nodeInfo.status || constant.NODE_STATUS.ANALYZING === nodeInfo.status
            || constant.NODE_STATUS.STOPPING === nodeInfo.status) {
            // 分析中
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.NODE_STATUS_PIC.SAMPLING);
        } else if (constant.TASK_STATUS.FAILED === nodeInfo.status || constant.NODE_STATUS.CANCELLED === nodeInfo.status) {
            // 执行失败
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.NODE_STATUS_PIC.FAILED);
        }

        const taskNodeInfo = new ToolItemNode(nodeInfo);
        taskNodeInfo.iconPath = iconPath;

        return taskNodeInfo;
    }
    /**
     * 删除之前提示会删除关联的对比分析任务
     */
    public async deleteBefore(id: number, isTask: boolean, context: vscode.ExtensionContext) {
        const option = {
            url: `/data-comparison/query-deletion-report/?id=${id}&&is-task=${isTask}`,
            method: 'GET',
        };
        const res = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        return Promise.resolve(res.data);
    }
}
