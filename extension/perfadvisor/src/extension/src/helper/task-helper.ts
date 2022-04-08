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
import { Utils } from '../utils';
import * as constant from '../constant';
import { PerfMenu } from '../toolmenu/perf-menu';
import { ToolPanelManager } from '../panel-manager';
import { PerfHelper } from './perf-helper';
import { ToolItemNode } from '../toolmenu/tree-node';
import { I18nService, LANGUAGE_TYPE } from '../i18nservice';
import { LogManager, LOG_LEVEL } from '../log-manager';
import { messageHandler } from '../webview-msg-handler';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { ResponseType } from 'axios';
const i18n = I18nService.I18n();
const importExportStatusMap = {
    // 导出
    pre_export: { text: i18n.plugins_sysperf_project.toBeExported, status: 'running' },
    export_start_fail: { text: i18n.plugins_sysperf_project.exportTaskStartFailed, status: 'failed' },
    exporting: { text: i18n.plugins_sysperf_project.exporting, status: 'running' },
    malluma_export_fail: { text: i18n.plugins_sysperf_project.exportFailed, status: 'failed' },
    packaging: { text: i18n.plugins_sysperf_project.packaging, status: 'running' },
    package_fail: { text: i18n.plugins_sysperf_project.packagingFailed, status: 'failed' },
    export_success: { text: i18n.plugins_sysperf_project.exportSucceeded, status: 'succeeded' },

    // 导入
    uploading: { text: i18n.plugins_sysperf_project.uploading, status: 'uploading' },
    upload_fail: { text: i18n.plugins_sysperf_project.uploadFailed, status: 'failed' },
    upload_success: { text: i18n.plugins_sysperf_project.uploaded, status: 'succeeded' },
    extracting: { text: i18n.plugins_sysperf_project.decompressing, status: 'running' },
    extract_fail: { text: i18n.plugins_sysperf_project.decompressionFailed, status: 'failed' },
    extracting_success: { text: i18n.plugins_sysperf_project.decompressed, status: 'succeeded' },
    import_check_fail: { text: i18n.plugins_sysperf_project.verificationFailed, status: 'failed' },
    pre_import: { text: i18n.plugins_sysperf_project.toBeImported, status: 'running' },
    import_start_fail: { text: i18n.plugins_sysperf_project.importTaskStartFailed, status: 'failed' },
    importing: { text: i18n.plugins_sysperf_project.importing, status: 'running' },
    import_fail: { text: i18n.plugins_sysperf_project.importFailed, status: 'failed' },
    adding_task_info: { text: i18n.plugins_sysperf_project.importingTaskInfo, status: 'running' },
    adding_task_info_fail: { text: i18n.plugins_sysperf_project.importTaskFailed, status: 'failed' },
    import_success: { text: i18n.plugins_sysperf_project.imported, status: 'succeeded' },
};

/**
 * 任务Task信息处理类
 */
export class TaskHelper {
    public static timer: any;
    public static isPolling = true; // 是否轮询

    /**
     * 删除任务
     *
     * @param TaskName 用来标识打开的功能
     * @param context 插件上下文
     */
    public static async deleteTask(taskName: string | undefined, context: vscode.ExtensionContext, taskId: any) {
        // 校验Task信息
        vscode.window.showWarningMessage(
            I18nService.I18nReplace(i18n.plugins_sysperf_deleteTask_confirm, { 0: taskName }),
            i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
            .then(async select => {
                if (select === i18n.plugins_sysperf_button_confirm) {
                    try {
                        // 调用删除任务接口
                        const option = {
                            url: '/tasks/'.concat(taskId).concat('/'),
                            method: 'DELETE',
                        };
                        const resp = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
                        if (resp.code === constant.HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                            // 刷新左侧树
                            PerfMenu.updataTree(context);
                            // 关闭该任务下所有打开面板
                            TaskHelper.closeTaskRelatedPinal(taskName);
                            Utils.showMessageByType(constant.MESSAGE_TYPE.INFO,
                                { info: I18nService.I18nReplace(i18n.plugins_sysperf_deleteTask, { 0: taskName }) }, true);
                        } else {
                            Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING,
                                { info: resp.data.message }, true);
                        }
                    } catch (error) {
                        LogManager.log(context, 'deleteTask error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
                    }
                }
            });
    }

    /**
     * 导入任务或者重试导入任务
     *
     * @param context vscode上下文
     * @param operation 操作类型，导入还是重试导入
     * @param params
     *     uploadPath 上传方式，web表示上传本地文件
     *     server表示选择服务器文件
     *     fileList 文件属性列表
     *         如果是web，则是本地文件属性列表，{fileName, filePath, fileSize}都需要
     *         如果是server，则是服务器文件路径列表，只需要{filePath}
     *     projectname 工程名
     *     taskname 任务名 导入时选择提供，重试时必须提供
     *     taskId 任务id 重试时必须提供
     */
    public static async importTask(context: vscode.ExtensionContext, operation: 'import' | 'retry', params: {
        uploadPath?: 'web' | 'server',
        fileList?: Array<{ fileName?: string, filePath?: string, fileSize?: number }>,
        projectname?: any,
        taskname?: any,
        taskId?: number
    }) {
        if (operation === 'import') {
            if (!params.uploadPath) {
                throw new Error('In import mode. The "params.uploadPath" parameter cannot be empty.');
            }
            if (!params.fileList) {
                throw new Error('In import mode. The "params.fileList" parameter is mandatory.');
            }
            const flag = await this.getErrMsg(params);
            if (!flag) { return; }
            if (params.uploadPath === 'web') {
                if (params.fileList.length === 0) {
                    throw new Error('In import-web mode. The "params.fileList" parameter cannot be empty.');
                }
                params.taskId = await this.createImportTask(context, {
                    section_qty: params.fileList.length,
                    task_filesize: params.fileList.map(file => (file.fileSize)).reduce((item1 = 0, item2 = 0) => (item1 + item2)),
                    upload_type: params.uploadPath,
                    project_name: params.projectname,
                    task_name: params.taskname
                });
                const tilteArray = params.fileList.map((item) => {
                    return item.fileName + ' (' + Utils.formatFileSizeUnit(item.fileSize, 'B') + ') ';
                });
                const vscodeProgressTitle = tilteArray.join(',');
                for (const file of params.fileList) {
                    if (!file.filePath) { continue; }
                    const fileChunkList = await this.fileSplit(file, params.taskId);
                    const uploadProgressTitle = file.fileName + i18n.plugins_sysperf_project.uploading;
                    const vscodeProgress = await Utils.showVscodeProgress(uploadProgressTitle);
                    try {
                        await this.uploadTaskFile(context, vscodeProgress.progress, fileChunkList);
                        await this.getUploadSuccess(context, params.taskId, file.fileName || '');
                    } catch (error) {
                        vscodeProgress.finished();
                        vscode.window.showInformationMessage(i18n.plugins_sysperf_project.uploadFailed);
                        return;
                    }
                    vscodeProgress.finished();
                }
                this.startListenImportFile(vscodeProgressTitle, context, params);
            } else {
                if (params.fileList.length !== 1) {
                    throw new Error('In import-server mode. The length of the "params.fileList" parameter must be 1.');
                }
                params.taskId = await this.createImportTask(context, {
                    file_path: params.fileList[0].filePath,
                    upload_type: params.uploadPath,
                    project_name: params.projectname,
                    task_name: params.taskname
                });
                const vscodeProgressTitle = params.fileList[0].filePath || '';
                this.startListenImportFile(vscodeProgressTitle, context, params);
            }

        } else if (operation === 'retry') {
            if (params.taskId === undefined) { throw new Error('In retry mode. The "params.id" parameter cannot be undefined.'); }
            if (!params.fileList || params.fileList.length === 0) { return; }
            const newParams: any = {
                id: params.taskId
            };
            if (params.projectname) {
                newParams.project_name = params.projectname;
            }
            if (params.taskname) {
                newParams.task_name = params.taskname;
            }
            params.taskId = await this.createImportTask(context, newParams);
            const vscodeProgressTitle = params.fileList.map(file => (file.fileName)).join(',');
            this.startListenImportFile(vscodeProgressTitle, context, params);
        }
    }
    /**
     * 获取文件失败信息
     */
    private static async getErrMsg(params: any) {
        return new Promise((resolve) => {
            params.fileList.forEach((item: any, i: any) => {
                fs.stat(item.filePath, (err) => {
                    if (err) {
                        vscode.window.showErrorMessage(err.message);
                        resolve(false);
                    } else if ((i + 1) === params.fileList.length) {
                        resolve(true);
                    }
                });
            });
        });
    }

    /**
     * 开始监听导入任务进度
     *
     * @param vscodeProgressTitle 进度条标题
     * @param context vscode上下文
     * @param taskInfo 导入任务信息
     */
    private static async startListenImportFile(vscodeProgressTitle: string, context: any, taskInfo: any) {
        const vscodeProgress = await Utils.showVscodeProgress(vscodeProgressTitle);
        await this.vscodeProgressListenerForTask(context, vscodeProgress.progress, taskInfo,
            vscodeProgressTitle, 'import');
        vscodeProgress.finished();
    }

    /**
     * vscode进度弹窗监听函数，监听任务导入导出进度
     *
     * @param context vscode上下文
     * @param vscodeProgress vscode进度弹窗的进度的手柄
     * @param taskId 导入导出任务id
     * @param fileNames 所有文件拼接的名称，中间用逗号分隔
     */
    private static vscodeProgressListenerForTask(
        context: vscode.ExtensionContext,
        vscodeProgress: vscode.Progress<{
            message?: string;
            increment?: number;
        }>,
        taskInfo: {
            taskId: number,
            projectname: string,
            taskname: string,
        },
        fileNames: string,
        operate: 'import' | 'export'
    ) {
        return new Promise(resolve => {
            const currentLang = I18nService.getLang().language.substr(0, 2);
            this.pollingImportExportProgress(context, {
                language: currentLang,
                taskId: taskInfo.taskId
            }, (respData) => {
                if (!respData) { return false; }
                const progressStatus = importExportStatusMap[respData.process_status];
                if (progressStatus.status === 'succeeded') {
                    PerfMenu.updataTree(context);
                    resolve('');
                    if (operate === 'import') {
                        const msg = I18nService.I18nReplace(i18n.plugins_perf_message_process.importSuccess, {
                            0: respData.projectname,
                            1: respData.taskname,
                        });
                        vscode.window.showInformationMessage(msg, i18n.plugins_common_term_view).then(result => {
                            if (result === i18n.plugins_common_term_view) {
                                this.getImportExportTasksDetail(context, currentLang, taskInfo.taskId).then((resp: any) => {
                                    if (resp.data.data.is_delete) {
                                        ToolPanelManager.openSysPerfMultiPanel('', context, {
                                            innerItem: 'itemImportAndExportTask',
                                            isShowDeletedTip: true,
                                            taskInfo: JSON.stringify(resp.data.data)
                                        });
                                    } else {
                                        messageHandler.openSomeNode({ context }, {
                                            data: {
                                                projectName: resp.data.data.projectname,
                                                projectId: resp.data.data.project_id,
                                                taskId: resp.data.data.task_id,
                                                taskName: resp.data.data.taskname,
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        const msg = I18nService.I18nReplace(i18n.plugins_perf_message_process.exportSucDetail, {
                            0: respData.projectname,
                            1: respData.taskname,
                            2: respData.file_section_qty,
                            3: Utils.formatFileSizeUnit(respData.task_filesize, 'B'),
                        });
                        vscode.window.showInformationMessage(msg, i18n.plugins_perf_message_process.download).then(select => {
                            if (select === i18n.plugins_perf_message_process.download) {
                                try {
                                    this.downloadTaskFile(respData.id, respData.file_section_qty, respData.file_name, context);
                                } catch (error) {
                                    LogManager.log(context, 'downloadTask error.',
                                        constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
                                }
                            }
                        });
                    }
                    return true;
                } else if (progressStatus.status === 'failed') {
                    resolve('');
                    if (operate === 'import') {
                        vscode.window.showErrorMessage(
                            progressStatus.text + ' /' + respData.detail_info,
                            i18n.plugins_sysperf_project.retry
                        ).then(result => {
                            if (result === i18n.plugins_sysperf_project.retry) {
                                const fileList = fileNames.split(',').map(fileName => ({ fileName }));
                                this.importTask(context, 'retry', { taskId: taskInfo.taskId, fileList });
                            }
                        });
                    } else {
                        vscode.window.showErrorMessage(
                            progressStatus.text + ' /' + respData.detail_info,
                            i18n.plugins_sysperf_project.retry
                        ).then(result => {
                            if (result === i18n.plugins_sysperf_project.retry) {
                                this.exportTask(context, 'retry', taskInfo);
                            }
                        });
                    }
                    return true;
                }
                vscodeProgress.report({ message: progressStatus.text });
                return false;
            });
        });
    }

    /**
     * 轮询服务器查询导入导出进度
     *
     * @param context vscode上下文
     * @param params 参数
     * @param listener 轮询结果处理函数
     */
    private static pollingImportExportProgress(
        context: vscode.ExtensionContext,
        params: { language: string, taskId: number },
        listener: (respData: any) => boolean
    ) {
        const polling = setInterval(() => {
            this.getImportExportTasksDetail(context, params.language, params.taskId).then((resp: any) => {
                if (listener(resp.data.data)) {
                    clearInterval(polling);
                }
            });
        }, 5000);
    }

    /**
     * 查询某次导入或导出任务详情
     *
     * @param language 服务器返回的语言
     * @param taskId 任务id
     */
    private static getImportExportTasksDetail(context: vscode.ExtensionContext, language: string, taskId: number) {
        const option = {
            method: 'GET',
            url: `/import_export_tasks/?language=${language}&id=${encodeURIComponent(taskId)}`
        };
        return Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
    }
    /**
     * 文件分片
     *
     * @param file 文件
     * @param taskId 上传任务id
     */
    private static async fileSplit(file: any, taskId: number) {
        const fileChunkList: any = [];
        const size = 25 * 1024 * 1024;
        const num = Math.ceil(file.fileSize / size);
        for (let i = 0; i < num; i++) {
            const formData = new FormData();
            formData.append('id', taskId);
            formData.append('file_name', file.fileName);
            formData.append('chunk', i);
            formData.append('file_size', file.fileSize);
            const end = (size * (i + 1)) > file.fileSize ? file.fileSize : size * (i + 1);
            // 读取从start到end的字节，包括start和end两个字节
            const rs = fs.createReadStream(file.filePath, { start: size * i, end: (end - 1) });
            formData.append('file', rs);
            const headers = formData.getHeaders();
            headers['Accept-Language'] = I18nService.getLang().language;
            fileChunkList.push({ formData, headers });
        }
        return fileChunkList;
    }
    /**
     * 合并上传的分片
     *
     * @param context vscode上下文
     * @param uploadTaskId 上传的任务id
     * @param fileName 上传的文件名
     */
    private static async getUploadSuccess(context: vscode.ExtensionContext, uploadTaskId: number, fileName: string) {
        const option = {
            method: 'POST', url: '/import_export_tasks/upload_success/', params: {
                id: uploadTaskId,
                file_name: fileName
            },
            timeout: 1000 * 60 * 5
        };
        const resp: any = await Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (resp.status !== constant.HTTP_STATUS.HTTP_200_OK) {
            throw new Error(resp.data.message);
        }
    }

    /**
     * 上传任务文件
     *
     * @param context vscode上下文
     * @param fileChunkList 文件分片列表
     */
    private static async uploadTaskFile(
        context: vscode.ExtensionContext,
        progress: vscode.Progress<{
            message?: string;
            increment?: number;
        }>,
        fileChunkList: Array<{ formData: FormData, headers: any }>
    ) {
        const length = fileChunkList.length;
        const progressClip = Math.round((1 / length) * 100);
        for (let i = 0; i < length; i++) {
            const fileChunk = fileChunkList[i];
            const option = {
                method: 'POST', url: '/import_export_tasks/index/',
                params: fileChunk.formData, headers: fileChunk.headers, contentFlag: true
            };
            const resp: any = await Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            if (resp.status !== constant.HTTP_STATUS.HTTP_200_OK) {
                throw new Error(resp.data.message);
            }

            const progressNum = (i === length - 1) ? 99 : progressClip * (i + 1);
            progress.report({
                message: progressNum + '%',
                increment: progressClip
            });
        }
    }

    /**
     * 创建导入任务
     *
     * @param context vscode上下文
     * @param params 请求参数
     */
    private static async createImportTask(context: vscode.ExtensionContext, params: any): Promise<number> {
        const option = { method: 'POST', url: '/import_export_tasks/import_task/', params };
        const resp: any = await Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (resp.status !== constant.HTTP_STATUS.HTTP_200_OK) {
            vscode.window.showErrorMessage(resp.data.message);
            throw new Error(resp.data.message);
        }
        return resp.data.data.id;
    }

    /**
     * 创建导出任务
     *
     * @param context vscode上下文
     * @param params 请求参数
     */
    private static async createExportTask(context: vscode.ExtensionContext, params: any): Promise<number> {
        const option = { method: 'POST', url: '/import_export_tasks/export/', params };
        const resp: any = await Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (resp.status !== constant.HTTP_STATUS.HTTP_200_OK) {
            vscode.window.showErrorMessage(resp.data.message);
            throw new Error(resp.data.message);
        }
        return resp.data.data.id;
    }

    /**
     * 导出任务或者重试导出任务
     *
     * @param context vscode上下文
     * @param taskInfo projectname 工程名, taskname 任务名, taskId 导出任务id，如果id存在，则表示重试导出任务
     */
    public static async exportTask(context: vscode.ExtensionContext, operation: 'export' | 'retry', taskInfo: {
        projectname: string,
        taskname: string,
        taskId?: number
    }) {
        if (operation === 'retry' && taskInfo.taskId === undefined) {
            throw new Error('retry export task nedd params.id');
        }
        const vscodeProgressTitle = taskInfo.projectname + '/' + taskInfo.taskname;
        // 校验Task信息
        if (operation === 'export') {
            const resp = await vscode.window.showInformationMessage(
                I18nService.I18nReplace(i18n.plugins_sysperf_exportTask, {
                    0: taskInfo.projectname,
                    1: taskInfo.taskname
                }),
                { modal: true },
                i18n.plugins_sysperf_exportTask_openUrl,
                i18n.plugins_sysperf_continueExport
            );
            if (resp === i18n.plugins_sysperf_continueExport) {
                taskInfo.taskId = await this.createExportTask(context, taskInfo);
                this.startListenExportFile(vscodeProgressTitle, context, taskInfo);
            } else if (resp === i18n.plugins_sysperf_exportTask_openUrl) {
                const pluginUrlCfg = Utils.getURLConfigJson(context);
                const lang = I18nService.getLang();
                const faq = LANGUAGE_TYPE.ZH === lang
                          ? vscode.Uri.parse(pluginUrlCfg.exportTaskUserGuideUrl)
                          : vscode.Uri.parse(pluginUrlCfg.exportTaskUserGuideUrlEn);
                vscode.commands.executeCommand('vscode.open', faq);
            }
        } else if (operation === 'retry') {
            taskInfo.taskId = await this.createExportTask(context, taskInfo);
            this.startListenExportFile(vscodeProgressTitle, context, taskInfo);
        }
    }

    /**
     * 开始监听导出任务进度
     *
     * @param vscodeProgressTitle 进度条标题
     * @param context vscode上下文
     * @param taskInfo 导出任务信息
     */
    private static async startListenExportFile(vscodeProgressTitle: any, context: any, taskInfo: any) {
        const vscodeProgress = await Utils.showVscodeProgress(vscodeProgressTitle);
        vscodeProgress.progress.report({ message: i18n.plugins_sysperf_project.toBeExported });
        await this.vscodeProgressListenerForTask(context, vscodeProgress.progress, taskInfo,
            vscodeProgressTitle, 'export');
        vscodeProgress.finished();
    }

    /**
     * 下载任务文件
     * @param taskId 任务 id
     * @param filesNum 压缩包个数
     */
    public static downloadTaskFile(taskId: any, filesNum: any, filename: any, context: vscode.ExtensionContext) {
        return new Promise((resolve, reject) => {
            let sectionIndex = 0;
            const download = () => {
                ++sectionIndex;
                const option = {
                    url: '/import_export_tasks/download/?id=' + encodeURIComponent(taskId) + '&section=' + sectionIndex,
                    responseType: 'arraybuffer' as ResponseType,
                    method: 'GET',
                };
                Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR).then((resp: any) => {
                    if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
                        messageHandler.downloadFile({ context, toolPanel: { getPanel() { } } }, {
                            data: {
                                invokeLocalSave: true,
                                contentType: 'arraybuffer',
                                fileName: filename + '.tar',
                                fileContent: resp?.data
                            }
                        });
                        resolve('success');
                    } else {
                        vscode.window.showErrorMessage(resp.data.message);
                    }
                });
                if (sectionIndex < filesNum) {
                    download();
                }
            };
            download();
        });
    }


    /**
     * 立即分析任务
     *
     * @param TaskName 用来标识打开的功能
     * @param context 插件上下文
     */
    public static async runTask(projectName: string, taskName: string | undefined, context: vscode.ExtensionContext, selfInfo: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        // 校验磁盘空间信息
        if (taskName) {
            taskName = encodeURIComponent(taskName);
        }
        let option = {
            url: '/res-status/?type=disk_space&project-name=' + encodeURIComponent(projectName)
                + '&task-name=' + taskName,
            method: 'GET',
            params: {}
        };
        let resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

        // 校验task信息无误后调用分析接口
        if (resp.code === constant.HTTP_STATUS_CODE.SYSPERF_SUCCESS && resp.data.status === constant.STATUS_SUCCESS) {
            try {
                // 调用分析任务接口
                option = {
                    url: '/tasks/'.concat(selfInfo.id).concat('/status/'),
                    method: 'PUT',
                    params: { status: 'running' }
                };
                resp = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

                // 打开任务分析进度页面
                ToolPanelManager.openSysPerfTaskLoadingPanel('', context, { projectName, taskName, selfInfo });

                if (resp.code === constant.HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                    setTimeout(() => {
                        // 刷新左侧树
                        PerfMenu.updataTree(context);
                    }, 3500);
                }

            } catch (error) {
                LogManager.log(context, 'runTask error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
            }
        } else {
            Utils.showMessageByType(constant.MESSAGE_TYPE.ERROR, { info: resp.data.info }, true);
        }
    }

    /**
     * 通过工程名和任务id获取任务详细信息
     *
     * @param TaskName 用来标识打开的功能
     * @param context 插件上下文
     */
    public static async getTaskByProjectAndTaskId(
        projectName: string,
        task: any,
        context: vscode.ExtensionContext,
        toolType: constant.PERF_SUBMODULE
    ) {
        // 查询任务信息，树节点信息
        return new Promise(async (resolve) => {
            const projectMap: Map<string, any> = new Map<string, any>();
            projectMap.set(projectName, { projectName });
            let projectTaskMap: Map<string, ToolItemNode[]>;
            if (toolType === constant.PERF_SUBMODULE.TOOL_MEM_DIAGNOSE) {
                projectTaskMap = await PerfHelper.getDiagnoseTaskList(context,
                    { projectMap, auto: 'off', projectNames: projectName, page: 1, perPage: 1000 }
                );
            } else {
                projectTaskMap = await PerfHelper.getTaskList(context,
                    { projectMap, auto: 'off', projectNames: projectName, page: 1, perPage: 1000 }
                );
            }
            // 校验task信息无误后调用分析接口
            if (projectTaskMap.get(projectName)) {
                const taskInfo: any = {};
                projectTaskMap.get(projectName)?.forEach(item => {
                    if (item.selfInfo.taskname === task.taskParam.taskname) {
                        taskInfo.taskId = item.selfInfo.selfId;
                        item.childen?.forEach(itemItem => {
                            if (itemItem.selfInfo.nodeId === task.nodeId) {
                                const panelId = projectName + '-' + task.taskParam.taskname + '-' + task.nodeNickName + '-' + task.nodeIP;
                                taskInfo.selfInfo = itemItem.selfInfo;
                                taskInfo.params = {
                                    taskName: itemItem.parentLabel,
                                    projectName,
                                    analysisType: itemItem.anaType,
                                    taskType: itemItem.anaType,
                                };
                                taskInfo.isRedirect = true;
                                taskInfo.panelId = panelId;
                            }
                            // 兼容联动分析
                            if ( itemItem.anaType === 'task_contrast' && itemItem.selfInfo.nodeId === task?.nodeList?.[0]?.nodeId) {
                                const panelId = projectName + '-' + task.taskParam.taskname + '-' + task.nodeNickName + '-' + task.nodeIP;
                                taskInfo.selfInfo = itemItem.selfInfo;
                                taskInfo.params = {
                                    taskName: itemItem.parentLabel,
                                    projectName,
                                    analysisType: itemItem.anaType,
                                    taskType: itemItem.anaType,
                                };
                                taskInfo.isRedirect = true;
                                taskInfo.panelId = panelId;
                            }
                        });
                    }
                });
                return resolve(taskInfo);
            }

            resolve(false);
        });
    }
    /**
     * 获取左侧树节点信息
     *
     * @param message webview发送的消息
     * @param context 插件上下文
     */
    public static async getNodeByProject(projectName: string, message: any, context: vscode.ExtensionContext) {
        // 查询任务信息，树节点信息
        return new Promise(async (resolve, reject) => {
            const projectMap: Map<string, any> = new Map<string, any>();
            projectMap.set(projectName, { projectName });
            const projectTaskMap: Map<string, ToolItemNode[]> = await PerfHelper.getTaskList(context,
                { projectMap, auto: 'off', projectNames: projectName, page: 1, perPage: 1000 }
            );
            // 校验task信息无误后调用分析接口
            if (projectTaskMap.get(projectName)) {
                projectTaskMap.get(projectName)?.forEach(item => {
                    if (item.selfInfo.selfId === message.data.taskId) {
                        if (message.data.nodeIp) {
                            item.childen?.forEach(itemItem => {
                                if (itemItem.selfInfo.nodeIP === message.data.nodeIp) {
                                    return resolve(itemItem);
                                }
                            });
                        } else if (item.childen) { // 查看导入导出任务默认打开当前任务下的第一个节点
                            return resolve(item.childen[0]);
                        }
                    }
                });
            }
            resolve(false);
        });
    }


    /**
     * 停止分析任务
     *
     * @param TaskName 用来标识打开的功能
     * @param context 插件上下文
     */
    public static async stopTask(projectName: string, taskName: string | undefined, context: vscode.ExtensionContext, selfInfo: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        try {
            // 调用停止任务接口
            const option = {
                url: '/tasks/'.concat(selfInfo.id).concat('/status/'),
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
            LogManager.log(context, 'stopTask error.', constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
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
            if (
                (items.length > 0 && taskName === items[0]) ||
                (items.length > 1 && taskName === items[1]) ||
                (items.length > 1 && taskName === items[items.length - 1]) // FIX 兼容联动分析
            ) {
                deletePanleIds.push(element.getPanelId());
            }
        });

        // 关闭面板
        ToolPanelManager.closePanel(deletePanleIds, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
    }

}
