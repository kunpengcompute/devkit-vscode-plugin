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
import { MenuDataProvider } from './menu-provider';
import { NodeType, ToolItemNode } from './tree-node';
import * as constant from '../constant';
import { Utils } from '../utils';
import { I18nService } from '../i18nservice';
import { PerfHelper } from '../helper/perf-helper';
import { ToolPanelManager } from '../panel-manager';
import { TuningAssistantPerfHelper } from '../helper/tuningAssistant/tuning-assistant-helper';

const i18n = I18nService.I18n();
// 子工具栏名称
const PERF_TREE_ROOT_NODES_NAMES = {
    sysPerf: i18n.perf_sysperf_advisor,
    javaPerf: i18n.perf_javaperf_advisor,
    diagnose: i18n.perf_memory_diagnose,
    tuningAssistant: i18n.perf_tuning_assistant
};

/**
 * perf 工具菜单树数据提供类
 */
export class PerfMenuDataProvider extends MenuDataProvider {
    public static PERF_TREE_ROOT_NODES_IDS: any = [];

    /**
     * 获取工具列表
     */
    private getToolNode() {
        const treeNodeList: Array<ToolItemNode> = [];
        if (Utils.isPerfadvisorServerConfigured(this.context) && Utils.isSysPerfLogin(this.context)) {
            for (const id of PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS) {
                const nodeInfo: any = {
                    nodeType: NodeType.TOOL,
                    label: PERF_TREE_ROOT_NODES_NAMES[id],
                    id,
                    module: constant.TOOL_NAME_PERF,
                    tooltip: i18n.plugins_common_right_click_menu,
                    noCmd: true
                };
                if (id === constant.PERF_TREE_ROOT_NODES_IDS.sysPerf) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerf;
                } else if (id === constant.PERF_TREE_ROOT_NODES_IDS.javaPerf) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.javaPerf;
                } else if (id === constant.PERF_TREE_ROOT_NODES_IDS.diagnose) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnose;
                } else if (id === constant.PERF_TREE_ROOT_NODES_IDS.tuningAssistant) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.tuningAssistant;
                }
                treeNodeList.push(new ToolItemNode(nodeInfo));
            }
        }
        return treeNodeList;
    }

    /**
     * 获取系统性能分析子节点
     */
    private getSysPerfChildren() {
        return [
            new ToolItemNode({
                nodeType: NodeType.SYS_FOLDER_NORMAL_TASK,
                label: constant.SYS_PERF_SUB_NODE.normalTask.label,
                id: constant.SYS_PERF_SUB_NODE.normalTask.id,
                contextValue: constant.CONTEXT_VALUES.sysFolderNormalTask,
                noCmd: true
            }),
            new ToolItemNode({
                nodeType: NodeType.SYS_FOLDER_LINKAGE_TASK,
                label: constant.SYS_PERF_SUB_NODE.linkageTask.label,
                id: constant.SYS_PERF_SUB_NODE.linkageTask.id,
                contextValue: constant.CONTEXT_VALUES.sysFolderLinkageTask,
                noCmd: true
            }),
        ];
    }

    /**
     * 获取调优助手子节点
     */
    private getTuningAssistantChildren() {
        return [
            new ToolItemNode({
                nodeType: NodeType.TUNING_ASSISTANT_FOLDER_NORMAL_TASK,
                label: constant.TUNING_ASSISTANT_SUB_NODE.normalTask.label,
                id: constant.TUNING_ASSISTANT_SUB_NODE.normalTask.id,
                contextValue: constant.CONTEXT_VALUES.tuningAssistantFolderNormalTask,
                noCmd: true
            }),
            new ToolItemNode({
                nodeType: NodeType.TUNING_ASSISTANT_FOLDER_COMPARE_TASK,
                label: constant.TUNING_ASSISTANT_SUB_NODE.compareTask.label,
                id: constant.TUNING_ASSISTANT_SUB_NODE.compareTask.id,
                contextValue: constant.CONTEXT_VALUES.tuningAssistantFolderCompareTask,
                noCmd: true
            }),
        ];
    }

    /**
     * 获取工具下的子节点
     */
    private async getToolChildren(element: ToolItemNode) {
        let treeNodeList: Array<ToolItemNode> = [];
        if (element.id === constant.PERF_TREE_ROOT_NODES_IDS.sysPerf) {
            if (this.context?.globalState?.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Token')) {
                treeNodeList = this.getSysPerfChildren();
                element.childen = treeNodeList;
            }
        } else if (element.id === constant.PERF_TREE_ROOT_NODES_IDS.javaPerf) {
            if (this.context?.globalState?.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Token')) {
                treeNodeList = await this.buildJavaPerfSubTree(this.context);
                element.childen = treeNodeList;
            }
        } else if (element.id === constant.PERF_TREE_ROOT_NODES_IDS.diagnose) {
            if (this.context?.globalState?.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Token')) {
                treeNodeList = await PerfHelper.getDiagnoseProjectList(this.context);
                element.childen = treeNodeList;
            }
        } else if (element.id === constant.PERF_TREE_ROOT_NODES_IDS.tuningAssistant) {
            if (this.context?.globalState?.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Token')) {
                treeNodeList = this.getTuningAssistantChildren();
                element.childen = treeNodeList;
            }
        }
        return treeNodeList;
    }

    /**
     * 获取联动分析下的节点列表
     */
    private async getLinkageTaskNodeList() {
        const iconPath = {
            Completed: constant.NODE_STATUS_PIC.COMPLETED,
            Aborted: constant.NODE_STATUS_PIC.COMPLETED,
            Running: constant.NODE_STATUS_PIC.SAMPLING,
            Failed: constant.NODE_STATUS_PIC.FAILED,
            Created: constant.NODE_STATUS_PIC.CREATED,
        };
        const taskMap = await PerfHelper.getLinkageTaskList(this.context);
        let linkageTaskList: any[] = [];
        const session: any = this.context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        const isAdmin = Utils.isAdmin(this.context);
        Object.values(taskMap).forEach(item => {
            const isSelf = session.username === item.projectInfo.ownerName;
            let contextValue = '';
            if (isAdmin) {
                contextValue = constant.CONTEXT_VALUES.linkageTaskAdmin;
            } else if (isSelf) {
                contextValue = constant.CONTEXT_VALUES.linkageTaskSelf;
            } else {
                contextValue = constant.CONTEXT_VALUES.linkageTask;
            }
            linkageTaskList = linkageTaskList.concat(item.taskList.map(taskInfo => {
                const analysisType = taskInfo['analysis-target'] === 'system' ?
                I18nService.I18n().plugins_sysperf_label_linkagedObject :
                I18nService.I18n().plugins_sysperf_label_hotspotAnalysis;
                const compareType = taskInfo.comparison_type === 'horizontal analysis' ?
                I18nService.I18n().plugins_sysperf_label_horizontal : I18nService.I18n().plugins_sysperf_label_hvertical;
                const tooltip = `${I18nService.I18n().plugins_sysperf_label_targetName}: ${taskInfo.taskname}
${I18nService.I18n().plugins_sysperf_label_analysisType}: ${analysisType}
${I18nService.I18n().plugins_sysperf_label_compareType}: ${compareType}`;
                return new ToolItemNode({
                    label: taskInfo.taskname,
                    id: 'linkageTask-' + taskInfo.id,
                    status: taskInfo['task-status'],
                    module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                    selfInfo: taskInfo,
                    tooltip,
                    contextValue,
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    iconPath: Utils.getExtensionFileAbsolutePath(this.context,
                        Utils.getCurrentPicPath() + iconPath[taskInfo['task-status']]),
                    parentId: item.projectInfo.projectId,
                    parentLabel: item.projectInfo.projectName,
                    parentName: item.projectInfo.projectName,
                    command: 'extension.view.linkage.viewTask'
                });
            }));
        });
        linkageTaskList.sort(
            (a: any, b: any) => (Utils.getDate(b.selfInfo.createtime).getTime() - Utils.getDate(a.selfInfo.createtime).getTime())
        );
        return linkageTaskList;
    }

    /**
     * 获取子节点
     * @param element 当前节点
     */
    async getChildren(element?: ToolItemNode): Promise<ToolItemNode[]> {
        let treeNodeList: Array<ToolItemNode> = [];
        if (!element) {
            treeNodeList = this.getToolNode();
        } else {
            switch (element.nodeType) {
                // 获取工具下的子节点
                case NodeType.TOOL:
                    treeNodeList = await this.getToolChildren(element);
                    break;
                case NodeType.SYS_FOLDER_NORMAL_TASK:
                    treeNodeList = await PerfHelper.getProjectList(this.context);
                    break;
                case NodeType.SYS_FOLDER_LINKAGE_TASK:
                    treeNodeList = await this.getLinkageTaskNodeList();
                    break;
                case NodeType.TUNING_ASSISTANT_FOLDER_NORMAL_TASK:
                    treeNodeList = await TuningAssistantPerfHelper.getTuningAssistantProjectList(this.context);
                    break;
                case NodeType.TUNING_ASSISTANT_FOLDER_COMPARE_TASK:
                    treeNodeList = await TuningAssistantPerfHelper.getCompareTaskList(this.context);
                    break;
                default:
                    treeNodeList = element.childen || [];
                    break;
            }
        }

        await Utils.setTreeUpdataSuccess(true);
        return Promise.resolve(treeNodeList);
    }

    private async buildJavaPerfSubTree(context: vscode.ExtensionContext) {
        const subTreeList: Array<ToolItemNode> = [];
        const userList = await PerfHelper.getUserList(this.context);
        for (const node of constant.PERF_TREE_SUB_NODES_IDS_JAVA) {
            let children: any;
            if ('samplingRecords' === node.id) {
                children = this.getSampleRecords(context, userList);
            } else if ('guardianList' === node.id) {
                children = await this.getGuardianList();
            } else if ('profillingRecords' === node.id) {
                children = await this.getGuardianList();
                if (!children) {
                    continue;
                }
                children = this.getProfilingRecords(context, children, node.id);
            } else {
                children = this.getSavedReportTree(context, userList);
            }
            subTreeList.push(new ToolItemNode({
                label: node.name,
                id: node.id,
                module: node.module,
                contextValue: node.contextValue,
                noCmd: true,
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded
            }, children));
        }

        return subTreeList;
    }

    private getProfilingRecords(context: vscode.ExtensionContext, guardianList: any, parentId: any) {
        const profilingList: Array<ToolItemNode> = [];
        const guardians = guardianList.filter((item: any) => item.id !== 'javaPerfNoData');
        if (guardians.length > 0) {
            const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
            guardians.forEach((guardian: any) => {
                guardian.selfInfo.jvms.forEach((jvm: any) => {
                    if (jvm.profileState === 'PROFILING'
                        && guardian.selfInfo.owner.uid === jvm.occupiedBy
                        && guardian.selfInfo.owner.uid === String(session?.loginId)) {
                        profilingList.push(new ToolItemNode({
                            label: this.getProfilingLabel(context, jvm),
                            id: jvm.id,
                            parentId,
                            iconPath: Utils.getExtensionFileAbsolutePath(context,
                                Utils.getCurrentPicPath() + constant.NODE_STATUS_PIC.JAVAPERF_PROFILING),
                            collapsibleState: vscode.TreeItemCollapsibleState.None,
                            module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                            selfInfo: guardian.selfInfo,
                            contextValue: constant.CONTEXT_VALUES.javaPerfProfiling,
                            noCmd: true
                        }));
                    }
                });
            });
        }
        // 为导入的在线分析记录添加节点
        ToolPanelManager.javaPerfToolPanels.forEach(panel => {
            if (panel.getPanelId() === constant.PANEL_ID.downloadProfile) {
                profilingList.push(new ToolItemNode({
                    label: panel.getPanel().title,
                    id: panel.getPanelId(),
                    parentId,
                    iconPath: Utils.getExtensionFileAbsolutePath(context,
                        Utils.getCurrentPicPath() + constant.NODE_STATUS_PIC.JAVAPERF_SAMPLE_DONE),
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                    contextValue: constant.CONTEXT_VALUES.javaPerfDownloadProfile,
                    noCmd: true
                }));
            }
        });
        return profilingList;
    }

    private getProfilingLabel(context: vscode.ExtensionContext, project: any) {
        const createTime = i18n.plugins_javaperf_title_createTime + context.globalState.get('profilingCreateTime');
        return project.name + ' (' + project.lvmid + ')' + createTime;
    }

    private async getGuardianList(): Promise<any> {
        const guardianList: Array<ToolItemNode> = await PerfHelper.getGuardianList(this.context);
        if (!guardianList) {
            return Promise.resolve(false);
        }

        // 如果没有工程的情况下需要展示一个无数据
        if (guardianList.length === 0) {
            const subInfo = new ToolItemNode({
                label: i18n.plugins_javaperf_title_create_guardian,
                id: 'javaPerfNoData',
                parentId: 'guardianList',
                module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                collapsibleState: vscode.TreeItemCollapsibleState.None,
                contextValue: '',
                command: 'javaPerf.view.item.addTargetEnvironment'
            });
            guardianList.push(subInfo);
        }
        return guardianList;
    }

    /**
     * 获取离线采样分析记录构造树视图
     * @param context 插件上下文
     * @returns 树视图
     */
    private async getSampleRecords(context: vscode.ExtensionContext, userList: Array<any>) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        // 判断是否为特权用户（管理员）
        if (session?.role === constant.PERF_ROLE.ADMIN) {
            const userTreeList: Array<ToolItemNode> = [];
            for (const userData of userList) {
                const sampleRecordsList: Array<ToolItemNode> = await PerfHelper.getSampleRecords(
                    this.context, 'samplingRecordsUser' + userData.id, userData);
                if (sampleRecordsList.length > 0) {
                    const nodeInfo = {
                        label: this.getSampleRecordsUserLabel(userData),
                        id: 'samplingRecordsUser' + userData.id,
                        parentId: 'samplingRecords',
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        noCmd: true
                    };
                    userTreeList.push(new ToolItemNode(nodeInfo, sampleRecordsList));
                }
            }
            return userTreeList;
        } else {
            const sampleRecordsList: Array<ToolItemNode> = await PerfHelper.getSampleRecords(this.context, 'samplingRecords');
            if (!sampleRecordsList) {
                return Promise.resolve(false);
            }
            return sampleRecordsList;
        }
    }

    /**
     * 构造用户名
     * @param userData 用户名
     * @returns 用户名
     */
    private getSampleRecordsUserLabel(userData: any) {
        return `${i18n.plugins_common_show_user}(${userData.username})`;
    }

    /**
     * 获取已保存报告构造树视图
     */
    private async getSavedReportTree(context: vscode.ExtensionContext, userList: Array<any>) {
        const subTreeList: Array<ToolItemNode> = [];
        for (const node of constant.PERF_TREE_SAVED_REPORT) {
            let children: any;
            if (node.id === 'heapdumpReport') {
                children = this.getSavedHeapdumpReportTree(context, userList);
            } else if (node.id === 'threaddumpReport') {
                children = this.getSavedThreaddumpReportTree(context, userList);
            } else if (node.id === 'gclogReport') {
                children = this.getSavedGclogReportTree(context, userList);
            }
            subTreeList.push(new ToolItemNode({
                label: node.name,
                id: node.id,
                module: node.module,
                contextValue: node.contextValue,
                noCmd: true,
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
            }, children));
        }
        return subTreeList;
    }

    /**
     * 获取内存转储记录构造树视图
     * @param context 插件上下文
     * @returns 树视图
     */
    private async getSavedHeapdumpReportTree(context: vscode.ExtensionContext, userList: Array<any>) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        // 判断是否为特权用户（管理员）
        if (session?.role === constant.PERF_ROLE.ADMIN) {
            const userTreeList: Array<ToolItemNode> = [];
            for (const userData of userList) {
                const heapdumpReportList: Array<ToolItemNode> = await PerfHelper.getSavedHeapdumpReportRecords(
                    this.context, 'heapdumpReport' + userData.id, userData);
                if (heapdumpReportList.length > 0) {
                    const nodeInfo = {
                        label: this.getSampleRecordsUserLabel(userData),
                        id: 'heapdumpReport' + userData.id,
                        parentId: 'heapdumpReport',
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        noCmd: true
                    };
                    userTreeList.push(new ToolItemNode(nodeInfo, heapdumpReportList));
                }
            }
            return userTreeList;
        } else {
            const heapdumpReportList: Array<ToolItemNode> = await PerfHelper.getSavedHeapdumpReportRecords(this.context, 'heapdumpReport');
            if (!heapdumpReportList) {
                return Promise.resolve(false);
            }
            return heapdumpReportList;
        }
    }

    /**
     * 获取线程转储记录构造树视图
     * @param context 插件上下文
     * @returns 树视图
     */
    private async getSavedThreaddumpReportTree(context: vscode.ExtensionContext, userList: Array<any>) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        // 判断是否为特权用户（管理员）
        if (session?.role === constant.PERF_ROLE.ADMIN) {
            const userTreeList: Array<ToolItemNode> = [];
            for (const userData of userList) {
                const threaddumpReportList: Array<ToolItemNode> = await PerfHelper.getSavedThreaddumpReportRecords(
                    this.context, 'threaddumpReport' + userData.id, userData);
                if (threaddumpReportList.length > 0) {
                    const nodeInfo = {
                        label: this.getSampleRecordsUserLabel(userData),
                        id: 'threaddumpReport' + userData.id,
                        parentId: 'threaddumpReport',
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        noCmd: true
                    };
                    userTreeList.push(new ToolItemNode(nodeInfo, threaddumpReportList));
                }
            }
            return userTreeList;
        } else {
            const threaddumpReportList: Array<ToolItemNode> =
                await PerfHelper.getSavedThreaddumpReportRecords(this.context, 'threaddumpReport');
            if (!threaddumpReportList) {
                return Promise.resolve(false);
            }
            return threaddumpReportList;
        }
    }

    /**
     * 获取gclog报告记录构造树视图
     * @param context 插件上下文
     * @returns 树视图
     */
    private async getSavedGclogReportTree(context: vscode.ExtensionContext, userList: Array<any>) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        // 判断是否为特权用户（管理员）
        if (session?.role === constant.PERF_ROLE.ADMIN) {
            const userTreeList: Array<ToolItemNode> = [];
            for (const userData of userList) {
                const gclogReportList: Array<ToolItemNode> = await PerfHelper.getSavedGclogReportRecords(
                    this.context, 'gclogReport' + userData.id, userData);
                if (gclogReportList.length > 0) {
                    const nodeInfo = {
                        label: this.getSampleRecordsUserLabel(userData),
                        id: 'gclogReport' + userData.id,
                        parentId: 'gclogReport',
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        noCmd: true
                    };
                    userTreeList.push(new ToolItemNode(nodeInfo, gclogReportList));
                }
            }
            return userTreeList;
        } else {
            const gclogReportList: Array<ToolItemNode> =
                await PerfHelper.getSavedGclogReportRecords(this.context, 'gclogReport');
            if (!gclogReportList) {
                return Promise.resolve(false);
            }
            return gclogReportList;
        }
    }
}
