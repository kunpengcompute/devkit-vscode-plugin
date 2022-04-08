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
import { ToolItemNode } from '../toolmenu/tree-node';
import { PerfMenu } from '../toolmenu/perf-menu';
import { Utils } from '../utils';
import * as constant from '../constant';
import { I18nService } from '../i18nservice';
import { LogManager, LOG_LEVEL } from '../log-manager';

const i18n = I18nService.I18n();
/**
 * 导航信息处理类
 */
export class PerfHelper {

    public static samplingRecords: any = [];
    public static samplingThreshold: any;

    /**
     * 调用后端服务器获取已创建的工程
     *
     * @param context 上下文
     * @param params 请求参数
     * @param module 模块，perfadvisor下子模块sysPerf和javaPerf
     */
    static async getGuardianList(context: vscode.ExtensionContext): Promise<any> {
        const projectList: Array<ToolItemNode> = [];
        try {
            const option = {
                url: constant.JAVAPERF_URIS.GUARDIANS_QUERY_URI,
                method: 'GET'
            };
            // 获取已存在的工程
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            if (response?.members) {
                // 初始化project树节点
                for (const project of response.members) {
                    const nodeInfo = {
                        label: PerfHelper.getGuardianLabel(context, project),
                        id: project.id,
                        parentId: 'guardianList',
                        status: project.state,
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        iconPath: PerfHelper.getIconPath(context, project),
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        selfInfo: project
                    };
                    projectList.push(new ToolItemNode(nodeInfo));
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(projectList);
            } else {
                LogManager.log(context, 'getGuardianList failed.' + response?.members,
                    constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(projectList);
            }
        } catch (error) {
            LogManager.log(context, 'getGuardianList error.', constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(false);
        }
        return Promise.resolve(projectList);
    }

    /**
     * 调用后端服务器获取用户列表
     *
     * @param context 上下文
     */
    static async getUserList(context: vscode.ExtensionContext): Promise<any> {
        let userList: Array<ToolItemNode> = [];
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        // 判断是否为特权用户（管理员）
        if (session?.role === constant.PERF_ROLE.ADMIN) {
            // 查询用户列表
            const urlOption = {
                url: constant.SYSPERF_URIS.PERF_QUERY_USERS_URI,
                subModule: constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
                method: 'GET'
            };
            // 获取用户列表
            const userResp: any = await Utils.requestDataHelper(context, urlOption, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            if (userResp.code === constant.HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                userList = userResp.data.users;
            }
        }
        return Promise.resolve(userList);
    }

    /**
     * 根据guardianId查询Guardian信息
     * @param context 插件上下文
     * @param guardianId guardianId
     */
    static async getGuardianDetail(context: vscode.ExtensionContext, guardianId: any) {
        const option = {
            url: constant.JAVAPERF_URIS.GUARDIANS_QUERY_URI + encodeURIComponent(guardianId),
            method: 'GET'
        };
        // 获取已存在的工程
        const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
        return response;
    }

    /**
     * 获取sample分析记录
     * @param context 上下文
     */
    static async getSampleRecords(context: vscode.ExtensionContext, parentId?: string, userData?: any): Promise<any> {
        const sampleRecordsList: Array<ToolItemNode> = [];
        try {
            let option = {};
            let userId = '';
            if (userData) {
                userId = userData.id;
                option = {
                    url: constant.JAVAPERF_URIS.SAMPLE_RECORDS_USERS_URI,
                    method: 'POST',
                    params: {
                        userId
                    }
                };
            } else {
                option = {
                    url: constant.JAVAPERF_URIS.SAMPLE_RECORDS_URI,
                    method: 'GET',
                };
            }
            // 获取已存在的离线采样分析记录
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);

            if (response?.members) {
                const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                this.samplingRecords = response.members;
                // 初始化project树节点
                for (const project of response.members) {
                    let label = project.name;
                    if (project.source === 'UPLOAD') {
                        label += I18nService.I18n().plugins_javaperf_title_importTime;
                    } else {
                        label += I18nService.I18n().plugins_javaperf_title_createTime;
                    }
                    label += Utils.dateFormat(project.createTime * 1000, 'yyyy-MM-dd hh:mm:ss');
                    const nodeInfo = {
                        label,
                        id: project.id,
                        parentId: parentId || 'samplingRecords',
                        status: project.state,
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        iconPath: PerfHelper.getSampleIconPath(context, project),
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        contextValue: userId && userId !== session?.loginId ?
                            constant.CONTEXT_VALUES.javaPerfSamplingDelete : constant.CONTEXT_VALUES.javaPerfSampling,
                        tooltip: userId && userId !== session?.loginId ?
                            I18nService.I18n().plugins_javaperf_label_no_permission_display + label : label,
                        selfInfo: project,
                        userData
                    };
                    sampleRecordsList.push(new ToolItemNode(nodeInfo));
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(sampleRecordsList);
            } else {
                LogManager.log(context, 'getSampleRecords failed.' + response?.members,
                    constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(sampleRecordsList);
            }
        } catch (error) {
            LogManager.log(context, 'getSampleRecords error.', constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(false);
        }
        return Promise.resolve(sampleRecordsList);
    }


    /**
     * 获取sampling记录阈值
     * @param context 上下文
     */
    static async getSampleThreshold(context: vscode.ExtensionContext): Promise<any> {
        try {
            const option = {
                url: constant.JAVAPERF_URIS.SAMPLE_THRESHOLD_URI,
                method: 'GET'
            };
            // 获取已存在的记录
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            if (response) {
                this.samplingThreshold = response;
            }
            return Promise.resolve(response);
        } catch (error) {
            LogManager.log(context, 'getSampleThreshold error.', constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(false);
        }
    }
    /**
     * 获取已保存的内存转储记录
     * @param context context 上下文
     * @param parentId 父节点id
     * @param userId 当前数据列表用户id
     */
    static async getSavedHeapdumpReportRecords(context: vscode.ExtensionContext, parentId?: string, userData?: any): Promise<any> {
        const savedHeapdumpReportList: Array<ToolItemNode> = [];
        try {
            let option = {};
            let userId = '';
            if (userData) {
                userId = userData.id;
                option = {
                    url: '/heap/actions/query',
                    method: 'POST',
                    params: {
                        userId
                    }
                };
            } else {
                option = {
                    url: '/heap/actions/list',
                    method: 'GET',
                };
            }
            // 获取已保存内存转储记录
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            if (response?.data) {
                const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                // 初始化project树节点
                for (const report of response.data) {
                    let label = report.alias;
                    if (report.source === 'IMPORT') {
                        label += I18nService.I18n().plugins_javaperf_title_importTime;
                    } else {
                        label += `(${report.lvmId})` + I18nService.I18n().plugins_javaperf_title_createTime;
                    }
                    label += Utils.dateFormat(report.createTime, 'yyyy-MM-dd hh:mm:ss');
                    const nodeInfo = {
                        label,
                        id: report.id,
                        parentId: parentId || 'heapdumpReport',
                        status: report.state,
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        iconPath: PerfHelper.getHeapdumpReportIconPath(context, report),
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        contextValue: userId && userId !== session?.loginId ?
                            constant.CONTEXT_VALUES.javaPerfHeapdumpDelete : constant.CONTEXT_VALUES.javaPerfHeapdump,
                        tooltip: userId && userId !== session?.loginId ?
                            I18nService.I18n().plugins_javaperf_label_no_permission_display + label : label,
                        selfInfo: report,
                        userData
                    };
                    savedHeapdumpReportList.push(new ToolItemNode(nodeInfo));
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(savedHeapdumpReportList);
            } else {
                LogManager.log(context, 'getSavedHeapdumpReportRecords failed.' + response?.members,
                    constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(savedHeapdumpReportList);
            }
        } catch (error) {
            LogManager.log(context, 'getSavedHeapdumpReportRecords error.', constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(false);
        }
        return Promise.resolve(savedHeapdumpReportList);
    }
    /**
     * 获取已保存的线程转储记录
     * @param context context 上下文
     * @param parentId 父节点id
     * @param userId 当前数据列表用户id
     */
    static async getSavedThreaddumpReportRecords(context: vscode.ExtensionContext, parentId?: string, userData?: any): Promise<any> {
        const savedThreaddumpReportList: Array<ToolItemNode> = [];
        try {
            let option = {};
            let userId = '';
            if (userData) {
                userId = userData.id;
                option = {
                    url: '/threadDump/query',
                    method: 'POST',
                    params: {
                        userId
                    }
                };
            } else {
                option = {
                    url: '/threadDump/list',
                    method: 'GET',
                };
            }
            // 获取已保存线程转储记录
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            if (response?.data) {
                const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                // 初始化project树节点
                for (const report of response.data) {
                    let label = report.reportName;
                    if (report.reportSource === 'IMPORT') {
                        label += I18nService.I18n().plugins_javaperf_title_importTime;
                    } else {
                        label += `(${report.lvmId})` + I18nService.I18n().plugins_javaperf_title_createTime;
                    }
                    label += Utils.dateFormat(report.createTime, 'yyyy-MM-dd hh:mm:ss');
                    if (!report.state) {
                        report.state = 'PARSE_COMPLETED';
                    }
                    const nodeInfo = {
                        label,
                        id: report.id,
                        parentId: parentId || 'threaddumpReport',
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        iconPath: PerfHelper.getHeapdumpReportIconPath(context, report),
                        contextValue: userId && userId !== session?.loginId ?
                            constant.CONTEXT_VALUES.javaPerfThreaddumpDelete : constant.CONTEXT_VALUES.javaPerfThreaddump,
                        tooltip: userId && userId !== session?.loginId ?
                            I18nService.I18n().plugins_javaperf_label_no_permission_display + label : label,
                        selfInfo: report,
                        userData
                    };
                    savedThreaddumpReportList.push(new ToolItemNode(nodeInfo));
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(savedThreaddumpReportList);
            } else {
                LogManager.log(context, 'getSavedThreaddumpReportRecords failed.' + response?.members,
                    constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(savedThreaddumpReportList);
            }
        } catch (error) {
            LogManager.log(context, 'getSavedThreaddumpReportRecords error.',
                constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(false);
        }
        return Promise.resolve(savedThreaddumpReportList);
    }

    /**
     * 获取已保存的gclog报告记录
     * @param context context 上下文
     * @param parentId 父节点id
     * @param userId 当前数据列表用户id
     */
    static async getSavedGclogReportRecords(context: vscode.ExtensionContext, parentId?: string, userData?: any): Promise<any> {
        const savedGclogReportList: Array<ToolItemNode> = [];
        try {
            let option = {};
            let userId = '';
            if (userData) {
                userId = userData.id;
                option = {
                    url: '/gcLog/query',
                    method: 'POST',
                    params: {
                        userId
                    }
                };
            } else {
                option = {
                    url: '/gcLog/list',
                    method: 'GET',
                };
            }
            // 获取已保存线程转储记录
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
            if (response?.data) {
                const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
                // 初始化project树节点
                for (const report of response.data) {
                    let label = report.logName;
                    if (report.reportSource === 'IMPORT') {
                        label += I18nService.I18n().plugins_javaperf_title_importTime;
                    } else {
                        label += I18nService.I18n().plugins_javaperf_title_createTime;
                    }
                    label += Utils.dateFormat(report.createTime, 'yyyy-MM-dd hh:mm:ss');
                    const nodeInfo = {
                        label,
                        id: report.id,
                        parentId: parentId || 'gclogReport',
                        module: constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR,
                        status: report.state,
                        iconPath: PerfHelper.getHeapdumpReportIconPath(context, report),
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        contextValue: userId && userId !== session?.loginId ?
                            constant.CONTEXT_VALUES.javaPerfGclogDelete : constant.CONTEXT_VALUES.javaPerfGclog,
                        tooltip: userId && userId !== session?.loginId ?
                            I18nService.I18n().plugins_javaperf_label_no_permission_display + label : label,
                        selfInfo: report,
                        userData
                    };
                    savedGclogReportList.push(new ToolItemNode(nodeInfo));
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(savedGclogReportList);
            } else {
                LogManager.log(context, 'getSavedGclogReportRecords failed.' + response?.members,
                    constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(savedGclogReportList);
            }
        } catch (error) {
            LogManager.log(context, 'getSavedGclogReportRecords error.',
                constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(false);
        }
        return Promise.resolve(savedGclogReportList);
    }


    /**
     * 生成panel
     * @param context 插件上下文
     * @param project Guardian工程信息
     */
    public static getGuardianLabel(context: vscode.ExtensionContext, project: any) {
        let label = project.name;
        if (Utils.isAdmin(context) && project.owner.username !== 'tunadmin') {
            label += ' (' + project.owner.username + ')';
        }
        return label;
    }
    private static getIconPath(context: vscode.ExtensionContext, project: any) {
        let iconPath = '';
        if (project.isRunningInContainer) {
            if (project.state === 'CONNECTED') {
                iconPath = constant.NODE_STATUS_PIC.JAVAPERF_CONTAINER_CONNECTED;
            } else if (project.state === 'DISCONNECTED') {
                iconPath = constant.NODE_STATUS_PIC.JAVAPERF_CONTAINER_DISCONNECTED;
            } else {
                iconPath = constant.NODE_STATUS_PIC.JAVAPERF_CONTAINER_CREATING;
            }
        } else {
            if (project.state === 'CONNECTED') {
                iconPath = constant.NODE_STATUS_PIC.JAVAPERF_PHYSICS_CONNECTED;
            } else if (project.state === 'DISCONNECTED') {
                iconPath = constant.NODE_STATUS_PIC.JAVAPERF_PHYSICS_DISCONNECTED;
            } else {
                iconPath = constant.NODE_STATUS_PIC.JAVAPERF_PHYSICS_CREATING;
            }
        }
        return Utils.getExtensionFileAbsolutePath(context,
            Utils.getCurrentPicPath() + iconPath);
    }

    /**
     * Sample记录左侧图标
     */
    private static getSampleIconPath(context: vscode.ExtensionContext, project: any) {
        let iconPath = '';
        if (project.state === 'FINISHED') {
            iconPath = constant.NODE_STATUS_PIC.JAVAPERF_SAMPLE_DONE;
        } else {
            iconPath = constant.NODE_STATUS_PIC.JAVAPERF_SAMPLE_DOING;
        }
        return Utils.getExtensionFileAbsolutePath(context,
            Utils.getCurrentPicPath() + iconPath);
    }

    /**
     * Sample记录左侧图标
     */
    private static getHeapdumpReportIconPath(context: vscode.ExtensionContext, project: any) {
        let iconPath = '';
        if (project.state === 'PARSE_COMPLETED') {
            iconPath = constant.NODE_STATUS_PIC.JAVAPERF_SAMPLE_DONE;
        } else {
            iconPath = constant.NODE_STATUS_PIC.JAVAPERF_SAMPLE_DOING;
        }
        return Utils.getExtensionFileAbsolutePath(context,
            Utils.getCurrentPicPath() + iconPath);
    }

    /**
     * 获取联动分析任务列表
     */
    public static async getLinkageTaskList(context: vscode.ExtensionContext) {
        const taskMap: {
            [projectName: string]: {
                projectInfo: any,
                taskList: any[]
            }
        } = {};
        // 查询联动分析工程列表
        const projectOption = {
            url: '/projects/?auto-flag=off&analysis-type=task_contrast',
            method: 'GET'
        };
        const projectResp: any = await Utils.requestDataHelper(context, projectOption, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        const projectNames = projectResp?.data?.projects?.map((item: any) => {
            taskMap[item.projectName] = {
                projectInfo: item,
                taskList: []
            };
            return item.projectName;
        }).join(',');
        if (!projectNames) { return []; }
        // 查询所有工程下的任务
        const taskOption = {
            url: `/tasks/task-summary/?analysis-type=task_contrast&project-name=${projectNames}&auto-flag=on&page=1&per-page=1000`,
            method: 'GET'
        };
        const taskResp: any = await Utils.requestDataHelper(context, taskOption, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        taskResp.data.forEach((item: any) => {
            taskMap[item.projectname].taskList = item.tasklist;
        });
        return taskMap;
    }

    /**
     * 获取系统性能分析工程列表
     *
     * @param context 上下文
     */
    static async getProjectList(context: vscode.ExtensionContext): Promise<ToolItemNode[]> {
        const projectList: Array<ToolItemNode> = [];
        try {
            const option = {
                url: constant.SYSPERF_URIS.PERF_SYSPERF_QUERY_URI + '?auto-flag=on' + '&date=' + Date.now(),
                method: 'GET'
            };
            // 获取已存在的工程
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

            if (response?.data?.projects.length > 0) {
                let itemDef: ToolItemNode;
                response.data.projects.sort(
                    (a: any, b: any) => (Utils.getDate(b.timeCreated).getTime() - Utils.getDate(a.timeCreated).getTime()));
                const projectListDef = response.data.projects;

                // 查询所有工程下task
                let projectNames = '';
                const projectMap: Map<string, any> = new Map<string, any>();
                for (const project of projectListDef) {
                    projectNames = projectNames + project.projectName + ',';
                    projectMap.set(project.projectName, project);
                }
                const projectTaskMap: Map<string, ToolItemNode[]> = await PerfHelper.getTaskList(context,
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
                    itemDef = PerfHelper.updatProjectNodeStatus(context, nodeInfo, projectTaskMap.get(project.projectName), project);

                    projectList.push(itemDef);
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: response.message }, true);
            }
        } catch (error) {
            LogManager.log(context, 'getProjectList error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(projectList);
        }

        // 如果没有工程的情况下需要展示新建工程
        if (projectList.length === 0) {
            const noReportInfo = new ToolItemNode({
                label: I18nService.I18n().plugins_common_title_create_project,
                id: 'sysPerfProjectNoData',
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                contextValue: constant.CONTEXT_VALUES.noProject,
                collapsibleState: vscode.TreeItemCollapsibleState.None
            });
            projectList.push(noReportInfo);
        }

        return Promise.resolve(projectList);
    }

    /**
     * 查询内存诊断工程列表
     *
     * @param context 上下文
     */
    static async getDiagnoseProjectList(context: vscode.ExtensionContext): Promise<ToolItemNode[]> {
        const projectList: Array<ToolItemNode> = [];
        try {
            const option = {
                url: '/memory-project/' + '?auto-flag=on' + '&date=' + Date.now(),
                method: 'GET'
            };
            // 获取已存在的工程
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

            if (response?.data?.projects.length > 0) {
                let itemDef: ToolItemNode;
                response.data.projects.sort(
                    (a: any, b: any) => (Utils.getDate(b.timeCreated).getTime() - Utils.getDate(a.timeCreated).getTime())
                );
                // 查询所有工程下task
                let projectNames = '';
                const projectMap: Map<string, any> = new Map<string, any>();
                for (const project of response.data.projects) {
                    projectNames += project.projectName + ',';
                    projectMap.set(project.projectName, project);
                }
                const projectTaskMap: Map<string, ToolItemNode[]> = await PerfHelper.getDiagnoseTaskList(context,
                    { projectMap, auto: 'on', projectNames: projectNames.substring(0, projectNames.length - 1), page: 1, perPage: 1000 }
                );

                // 初始化project树节点
                for (const project of response.data.projects) {
                    const nodeInfo = {
                        label: project.projectName,
                        id: 'diagnose-' + project.projectId,
                        status: project.status,
                        module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                        selfInfo: project,
                        command: 'extension.view.diagnose.viewProject'
                    };
                    itemDef = PerfHelper.updateDiagnoseProjectNodeStatus(
                        context,
                        nodeInfo,
                        projectTaskMap.get(project.projectName),
                        project
                    );

                    projectList.push(itemDef);
                }

            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: response.message }, true);
            }
        } catch (error) {
            LogManager.log(context, 'getDiagnoseProjectList error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(projectList);
        }

        // 如果没有工程的情况下需要展示新建工程
        if (projectList.length === 0) {
            const noReportInfo = new ToolItemNode({
                label: I18nService.I18n().plugins_common_title_create_project,
                id: 'diagnoseProjectNoData',
                module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                collapsibleState: vscode.TreeItemCollapsibleState.None,
                command: 'extension.view.diagnose.createProject'
            });
            projectList.push(noReportInfo);
        }

        return Promise.resolve(projectList);
    }

    /**
     * 调用后端服务器获取已创建的工程的任务
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
                    '&auto-flag=' + encodeURIComponent(params.auto) + '&page=' + params.page + '&per-page=' + params.perPage,
                method: 'GET'
            };
            // 获取已存在的工程的任务
            const response: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            if (response?.data?.length > 0) {
                const projectTasksDef = response.data;
                // 遍历project
                for (const project of projectTasksDef) {
                    project.tasklist.sort(
                        (a: any, b: any) => (Utils.getDate(b.createtime).getTime() - Utils.getDate(a.createtime).getTime()));
                    const taskList: Array<ToolItemNode> = [];
                    // 遍历工程下task
                    for (const task of project.tasklist) {
                        let itemDef: ToolItemNode;

                        if (!task['analysis-target'] && task['analysis-type'] === 'miss_event') {
                            const param = JSON.parse(task.task_param);
                            if (param.target === 'app') {
                                task['analysis-target'] = 'Launch Application';
                            } else if (param.target === 'pid') {
                                task['analysis-target'] = 'Attach to Process';
                            } else {
                                task['analysis-target'] = 'Profile System';
                            }
                        }
                        const nodeInfo = {
                            parentId: params.projectMap.get(project.projectname).projectId,
                            parentLabel: params.projectMap.get(project.projectname).projectName,
                            selfInfo: task,
                            status: task['task-status'],
                            label: task.taskname,
                            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                            is_import: params.projectMap.get(project.projectname).is_import,
                            is_schedule: task.is_schedule
                        };
                        nodeInfo.selfInfo.selfId = task.id;
                        // 获取task下node
                        const taskNodeMap: Map<string, ToolItemNode[]> = await PerfHelper.getNodeList(context, {
                            taskNodes: {
                                taskId: task.id,
                                taskName: task.taskname,
                                anaType: task['analysis-type'],
                                nodeList: task.nodeList,
                                parentLabel: params.projectMap.get(project.projectname).projectName
                            }
                        });
                        itemDef = PerfHelper.updateTaskNodeStatus(context, nodeInfo, taskNodeMap.get(task.taskname), project);

                        taskList.push(itemDef);
                    }
                    projectTaskMap.set(project.projectname, taskList);

                }
            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(projectTaskMap);
            } else {
                LogManager.log(context, 'getTaskList failed.' + response?.data,
                    constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(projectTaskMap);
            }
        } catch (error) {
            LogManager.log(context, 'getTaskList error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(projectTaskMap);
        }
        return Promise.resolve(projectTaskMap);
    }

    /**
     * 查询内存诊断任务列表
     *
     * @param context 上下文
     * @param params 请求参数，包含查询的工程名
     * @param module 模块，perfadvisor下子模块sysPerf和javaPerf
     */
    static async getDiagnoseTaskList(context: vscode.ExtensionContext, params: any): Promise<Map<string, ToolItemNode[]>> {
        const projectTaskMap: Map<string, ToolItemNode[]> = new Map<string, ToolItemNode[]>();
        try {
            const option = {
                url: '/memory-tasks/task-summary/?analysis-type=all&project-name=' + encodeURIComponent(params.projectNames) +
                    '&auto-flag=' + encodeURIComponent(params.auto) + '&page=' + params.page + '&per-page=' + params.perPage,
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

                        if (!task['analysis-target'] && task['analysis-type'] === 'miss_event') {
                            const param = JSON.parse(task.task_param);
                            if (param.target === 'app') {
                                task['analysis-target'] = 'Launch Application';
                            } else if (param.target === 'pid') {
                                task['analysis-target'] = 'Attach to Process';
                            } else {
                                task['analysis-target'] = 'Profile System';
                            }
                        }
                        const nodeInfo = {
                            parentId: params.projectMap.get(project.projectname).projectId,
                            parentLabel: params.projectMap.get(project.projectname).projectName,
                            selfInfo: task,
                            status: task['task-status'],
                            label: task.taskname,
                            module: constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                            is_import: params.projectMap.get(project.projectname).is_import,
                            is_schedule: task.is_schedule
                        };
                        nodeInfo.selfInfo.selfId = task.id;
                        // 获取task下node
                        const taskNodeMap: Map<string, ToolItemNode[]> = await PerfHelper.getDiagnoseNodeList(context, {
                            taskNodes: {
                                taskId: task.id,
                                taskName: task.taskname,
                                anaType: task['analysis-type'],
                                nodeList: task.nodeList,
                                parentLabel: params.projectMap.get(project.projectname).projectName
                            }
                        });
                        itemDef = PerfHelper.updateDiagnoseTaskNodeStatus(context, nodeInfo, taskNodeMap.get(task.taskname), project);

                        taskList.push(itemDef);
                    }
                    projectTaskMap.set(project.projectname, taskList);

                }
            } else if (constant.STATUS_INSUFFICIENT_SPACE === response.status) {
                return Promise.resolve(projectTaskMap);
            } else {
                LogManager.log(context, 'getTaskList failed.' + response?.data,
                    constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
                return Promise.resolve(projectTaskMap);
            }
        } catch (error) {
            LogManager.log(context, 'getTaskList error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
            return Promise.resolve(projectTaskMap);
        }
        return Promise.resolve(projectTaskMap);
    }

    /**
     * 组装工程任务下的节点树
     *
     * @param context 上下文
     * @param params 请求参数，包含taskName及其包含的node
     * @param module 模块，perfadvisor下子模块sysPerf和javaPerf
     */
    static async getNodeList(context: vscode.ExtensionContext, params: any): Promise<Map<string, ToolItemNode[]>> {
        const taskNodeMap: Map<string, ToolItemNode[]> = new Map<string, ToolItemNode[]>();
        try {
            // 获取已存在的工程的任务
            if (params?.taskNodes?.nodeList.length > 0) {
                const taskNodeList = params.taskNodes.nodeList;
                // 在 system_lock 或者 I/O分析中， taskNodeList 中每一个 taskNode 的缺失三个参数：analysis-type, taskname, projectname, 所这里进行“补齐”
                const taskNodes = params?.taskNodes;
                if (taskNodes != null && (taskNodes.anaType === 'system_lock' || taskNodes.anaType === 'ioperformance')) {
                    const analysisType = taskNodes.anaType;
                    const taskname = taskNodes.taskName;
                    const projectname = taskNodes.parentLabel;

                    for (const taskNode of taskNodeList) {
                        taskNode.taskParam['analysis-type'] = analysisType;
                        taskNode.taskParam.taskname = taskname;
                        taskNode.taskParam.projectname = projectname;
                    }
                }

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
                        parentName: params.taskNodes.parentLabel
                    };
                    nodeInfo.selfInfo.selfId = node.nodeId;
                    itemDef = PerfHelper.updateNodeStatus(context, nodeInfo, params.taskNodes);

                    nodeList.push(itemDef);
                    taskNodeMap.set(params.taskNodes.taskName, nodeList);
                }
            }
        } catch (error) {
            LogManager.log(context, 'getNodeList error.' + error, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
        }
        return Promise.resolve(taskNodeMap);
    }

    /**
     * 内存诊断组装工程任务下的节点树
     *
     * @param context 上下文
     * @param params 请求参数，包含taskName及其包含的node
     * @param module 模块，perfadvisor下子模块sysPerf和javaPerf
     */
    static async getDiagnoseNodeList(context: vscode.ExtensionContext, params: any): Promise<Map<string, ToolItemNode[]>> {
        const taskNodeMap: Map<string, ToolItemNode[]> = new Map<string, ToolItemNode[]>();
        try {
            // 获取已存在的工程的任务
            if (params?.taskNodes?.nodeList.length > 0) {
                const taskNodeList = params.taskNodes.nodeList;
                // 在 system_lock 或者 I/O分析中， taskNodeList 中每一个 taskNode 的缺失三个参数：analysis-type, taskname, projectname, 所这里进行“补齐”
                const taskNodes = params?.taskNodes;
                if (taskNodes != null && (taskNodes.anaType === 'system_lock' || taskNodes.anaType === 'ioperformance')) {
                    const analysisType = taskNodes.anaType;
                    const taskname = taskNodes.taskName;
                    const projectname = taskNodes.parentLabel;

                    for (const taskNode of taskNodeList) {
                        taskNode.taskParam['analysis-type'] = analysisType;
                        taskNode.taskParam.taskname = taskname;
                        taskNode.taskParam.projectname = projectname;
                    }
                }

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
                        command: 'extension.view.diagnose.viewTask'
                    };
                    nodeInfo.selfInfo.selfId = node.nodeId;
                    itemDef = PerfHelper.updateNodeStatus(context, nodeInfo, params.taskNodes);

                    nodeList.push(itemDef);
                    taskNodeMap.set(params.taskNodes.taskName, nodeList);
                }
            }
        } catch (error) {
            LogManager.log(context, 'getNodeList error.' + error, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
        }
        return Promise.resolve(taskNodeMap);
    }

    /**
     * 设置project节点状态等信息
     * @param context 上下文
     * @param projectNodeInfo 任务节点
     * @param project 项目信息
     */
    private static updatProjectNodeStatus(context: vscode.ExtensionContext, nodeInfo: any, children: any, project: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let iconPath = '';
        // 查询project状态， 并当前用户相关contextValue
        if (String(session.loginId) === project.ownerId) {
            // 当前用户对该项具有操作权限
            if (!nodeInfo.selfInfo.is_import) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_self;
                nodeInfo.tooltip = project.projectName;
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_importProject;
                nodeInfo.tooltip = project.projectName;
            }
        } else if (String(session.loginId) !== project.ownerId && Utils.isAdmin(context)) {
            // 管理员操作权限
            if (!nodeInfo.selfInfo.is_import) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_noself_admin;
                nodeInfo.tooltip = project.projectName;
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_importProject;
                nodeInfo.tooltip = project.projectName;
            }
        } else {
            nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject;
        }

        // 查询project状态， 并添加图标
        if (constant.PROJECT_STATUS.NORMAL === nodeInfo.status && !nodeInfo.selfInfo.is_import) {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.NORMAL);

        } else if (constant.PROJECT_STATUS.ABNORMAL === nodeInfo.status && !nodeInfo.selfInfo.is_import) {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.ABNORMAL);
        } else {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.IMPORTPROJECT);
        }

        const projectNodeInfo = new ToolItemNode(nodeInfo, children);
        projectNodeInfo.iconPath = iconPath;
        return projectNodeInfo;
    }

    /**
     * 设置内存诊断工程节点状态等信息
     * @param context 上下文
     * @param projectNodeInfo 任务节点
     * @param project 项目信息
     */
    private static updateDiagnoseProjectNodeStatus(context: vscode.ExtensionContext, nodeInfo: any, children: any, project: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let iconPath = '';
        // 查询project状态， 并当前用户相关contextValue
        if (String(session.loginId) === project.ownerId) {
            // 当前用户对该项具有操作权限
            if (!nodeInfo.selfInfo.is_import) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseProjectSelf;
                nodeInfo.tooltip = project.projectName;
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseProjectImport;
                nodeInfo.tooltip = project.projectName;
            }
        } else if (Utils.isAdmin(context)) {
            // 管理员操作权限
            if (!nodeInfo.selfInfo.is_import) {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseProjectAdmin;
                nodeInfo.tooltip = project.projectName;
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseProjectImport;
                nodeInfo.tooltip = project.projectName;
            }
        } else {
            nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseProject;
        }

        // 查询project状态， 并添加图标
        if (constant.PROJECT_STATUS.NORMAL === nodeInfo.status && !nodeInfo.selfInfo.is_import) {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.NORMAL);

        } else if (constant.PROJECT_STATUS.ABNORMAL === nodeInfo.status && !nodeInfo.selfInfo.is_import) {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.ABNORMAL);
        } else {
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.PROJECT_STATUS_PIC.IMPORTPROJECT);
        }

        const projectNodeInfo = new ToolItemNode(nodeInfo, children);
        projectNodeInfo.iconPath = iconPath;
        return projectNodeInfo;
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
            case 'C/C++ Program':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[0];
                break;
            case 'system':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[1];
                break;
            case 'process-thread-analysis':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[2];
                break;
            case 'resource_schedule':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[3];
                break;
            case 'system_lock':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[4];
                break;
            case 'miss_event':
            case 'mem_access':
            case 'falsesharing':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[5];
                break;
            case 'microarchitecture':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[6];
                break;
            case 'ioperformance':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[7];
                break;
            case 'hpc_analysis':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[8];
                break;
            case 'memory_diagnostic':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[9];
                break;
            case 'netio_diagnostic':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[11];
                break;
            case 'storageio_diagnostic':
                receiveStr = I18nService.I18n().plugins_sysperf_label_allTypes[12];
                break;
            default:
                break;
        }
        return receiveStr;
    }


    /**
     * 设置task节点状态等信息
     * @param context 上下文
     * @param nodeInfo 任务节点
     * @param project 任务所属项目信息
     */
    private static updateTaskNodeStatus(context: vscode.ExtensionContext, nodeInfo: any, children: any, project: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let iconPath = '';
        let analysisTarget = this.setTooltipText(nodeInfo.selfInfo['analysis-target']);
        analysisTarget = (!analysisTarget) ? I18nService.I18n().plugins_sysperf_label_allTargets[0] : analysisTarget;
        const analysisType = this.setTooltipText(nodeInfo.selfInfo['analysis-type']);
        const toolTip = `${I18nService.I18n().plugins_sysperf_label_targetName}: ${nodeInfo.selfInfo.taskname}
${I18nService.I18n().plugins_sysperf_label_analysisTarget}: ${analysisTarget}
${I18nService.I18n().plugins_sysperf_label_analysisType}: ${analysisType}`;
        nodeInfo.tooltip = toolTip;
        // 查询task状态， 并添加图标
        if (constant.TASK_STATUS.CREATED === nodeInfo.status || constant.TASK_STATUS.WAITING === nodeInfo.status) {
            // 非立即执行任务
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.TASK_STATUS_PIC.CREATED);
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isCreated_self;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_importTask;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isCreated;
            }
        } else if ((constant.TASK_STATUS.COMPLETED === nodeInfo.status || constant.TASK_STATUS.FAILED === nodeInfo.status)
            && nodeInfo.is_schedule) {
            // 执行完成的预约任务
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.TASK_STATUS_PIC.RESERVATIONTASK);
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isReserved_self;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_importTask;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isReserved;
            }
        } else if (constant.TASK_STATUS.SAMPLING === nodeInfo.status || constant.TASK_STATUS.ANALYZING === nodeInfo.status) {
            // 分析中
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isRunning_self;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_importTask;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isRunning;
            }
        } else {
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isCompleted_self;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProject_importTask;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTask_isCompleted;
            }
        }

        const taskNodeInfo = new ToolItemNode(nodeInfo, children);
        taskNodeInfo.iconPath = iconPath;

        return taskNodeInfo;
    }


    /**
     * 设置task节点状态等信息
     * @param context 上下文
     * @param nodeInfo 任务节点
     * @param project 任务所属项目信息
     */
    private static updateDiagnoseTaskNodeStatus(context: vscode.ExtensionContext, nodeInfo: any, children: any, project: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        let iconPath = '';
        const analysisTarget = nodeInfo?.selfInfo?.['analysis-target'] === 'Profile System'
        ? I18nService.I18n().plugins_sysperf_label_allTargets[0]
        : I18nService.I18n().plugins_sysperf_label_allTargets[1];
        const analysisType = this.setTooltipText(nodeInfo.selfInfo['analysis-type']);
        const toolTip = `${I18nService.I18n().plugins_sysperf_label_targetName}: ${nodeInfo.selfInfo.taskname}
${I18nService.I18n().plugins_sysperf_label_analysisTarget}: ${analysisTarget}
${I18nService.I18n().plugins_sysperf_label_diagnoseObj}: ${analysisType}`;
        nodeInfo.tooltip = toolTip;
        // 查询task状态， 并添加图标
        if (constant.TASK_STATUS.CREATED === nodeInfo.status || constant.TASK_STATUS.WAITING === nodeInfo.status) {
            // 非立即执行任务
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.TASK_STATUS_PIC.CREATED);
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskCreatedSelf;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskImport;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskCreated;
            }
        } else if ((constant.TASK_STATUS.COMPLETED === nodeInfo.status || constant.TASK_STATUS.FAILED === nodeInfo.status)
            && nodeInfo.is_schedule) {
            // 执行完成的预约任务
            iconPath = Utils.getExtensionFileAbsolutePath(context,
                Utils.getCurrentPicPath() + constant.TASK_STATUS_PIC.RESERVATIONTASK);
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskReservedSelf;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskImport;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskReserved;
            }
        } else if (constant.TASK_STATUS.SAMPLING === nodeInfo.status || constant.TASK_STATUS.ANALYZING === nodeInfo.status) {
            // 分析中
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskRunningSelf;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskImport;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskRunning;
            }
        } else {
            if (String(session.loginId) === project.ownerid || Utils.isAdmin(context)) {
                // 当前用户对该项具有操作权限
                if (!nodeInfo.is_import) {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskCompletedSelf;
                } else {
                    nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskImport;
                }
            } else {
                nodeInfo.contextValue = constant.CONTEXT_VALUES.diagnoseTaskCompleted;
            }
        }

        const taskNodeInfo = new ToolItemNode(nodeInfo, children);
        taskNodeInfo.iconPath = iconPath;

        return taskNodeInfo;
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
        nodeInfo.contextValue = constant.CONTEXT_VALUES.sysPerfProjectTaskNode;

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

}
