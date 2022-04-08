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
import { Utils } from './utils';
import { I18nService } from './i18nservice';
import { PortMenu } from './toolmenu/port-menu';
import { CancelTaskUtils } from './cancel-task-utils';
import { ToolPanelManager } from './panel-manager';
import { TOOL_NAME_SOFTWARE_PACKAGE, SOFTWARE_PACKAGE_URLS, ENV_APP_NAME, MessageType } from './constant';
import { ReportHelper } from './report-helper';
import { CloudIDEService } from './cloudIDE/CloudIDEServie';
const fs = require('fs');

/**
 * 压缩包上传状态
 */
const enum PACK_PROGRESS {
    PROGRESS_FAILED = -1,
    PROGRESS_START = 0,
    PROGRESS_END = 100,
    PROGRESS_SUCCESS = 101
}

/**
 * 响应状态
 */
const enum RESPONSE_STATUS {
    PROCESS_SUCCESS = 0,
    PROCESS_RUNNING = 1,
    PROCESS_FAILED = 2,
    PROCESS_FINISH = 3
}

/**
 * 消息映射
 */
const enum MESSAGE_MAP {
    SHOW_PROGRESS = 'getStatus',
    SHOW_COMMON_PROGRESS = 'getMenuStatus',
    FILE_SIZE_EXCEEED = 'fileSizeExceed',
    PROCESS_FAILED = 'processFailed',
    PROCESS_SUCCESS = 'processSuccess'
}

const OS_DIR_SEP = '/';
const PROGRESS_FRESH_INTERVAL = 500;

export class AnalysisUtil {
    /**
     * 派发消息
     *
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    public static async dispathMessage(global: any, message: any) {
        const messageID = message.data.msgID;
        switch (messageID) {
            case MESSAGE_MAP.SHOW_PROGRESS:
                AnalysisUtil.showProcess(global, message);
                break;
            case MESSAGE_MAP.SHOW_COMMON_PROGRESS:
                AnalysisUtil.showCommonProcess(global, message);
                break;
            case MESSAGE_MAP.PROCESS_FAILED:
                vscode.window.showErrorMessage(AnalysisUtil.getRspMessage(message.data));
                break;
            case MESSAGE_MAP.PROCESS_SUCCESS:
                vscode.window.showInformationMessage(AnalysisUtil.getRspMessage(message.data));
                break;
            case MESSAGE_MAP.FILE_SIZE_EXCEEED:
                Utils.showInfo(I18nService.I18n().plugins_porting_webpack_file_size_exceed);
                break;
            default:
                break;
        }
    }

    /**
     * 刷新进度条公共提示方法
     *
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    public static async showCommonProcess(global: any, message: any) {
        await AnalysisUtil.getProgress(global.context, message).then((resp) => {
            let situation = AnalysisUtil.getProgressStatus(resp, true);
            if (situation < PACK_PROGRESS.PROGRESS_START || situation > PACK_PROGRESS.PROGRESS_END) {
                AnalysisUtil.showMigTip(global.context, resp);
            } else {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    // message.data.i18NInfoKeys.suces成功刷新进度条
                    title: I18nService.I18n()[message.data.i18NInfoKeys.sucess],
                    cancellable: false
                }, async (progress, token) => {
                    let lastRate = PACK_PROGRESS.PROGRESS_START;
                    while (situation >= PACK_PROGRESS.PROGRESS_START && situation <= PACK_PROGRESS.PROGRESS_END) {
                        progress.report({
                            increment: situation - lastRate,
                            // message.data.i18NInfoKeys.suces正在刷新进度条
                            message: I18nService.I18nReplace(
                                I18nService.I18n()[message.data.i18NInfoKeys.sucProcessing],
                                { 0: situation })
                        });
                        lastRate = situation;
                        await AnalysisUtil.sleep(PROGRESS_FRESH_INTERVAL);
                        resp = await AnalysisUtil.getProgress(global.context, message);
                        situation = AnalysisUtil.getProgressStatus(resp, false);
                    }
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', resp, cbid: message.cbid });
                    AnalysisUtil.showMigTip(global.context, resp);
                });
            }
        });
    }

    /**
     * 刷新进度条
     *
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    public static async showProcess(global: any, message: any) {
        const context: vscode.ExtensionContext = global.context;
        let msg: any;
        let resp = await AnalysisUtil.getProgress(context, message);
        msg = AnalysisUtil.getRspMessage(resp);
        let situation = AnalysisUtil.getProgressStatus(resp, true);
        const stopSoftPkgFlagObj: any = { stopSoftPkgFlag: false };
        if (situation < PACK_PROGRESS.PROGRESS_START || situation > PACK_PROGRESS.PROGRESS_END) {
            AnalysisUtil.clearTaskId(context);
            AnalysisUtil.showTip(resp, message, context);
        } else {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: I18nService.I18n().plugins_porting_webpack_task_success,
                cancellable: true
            }, async (progress, token) => {
                token.onCancellationRequested(() =>
                    vscode.window.showInformationMessage(
                        I18nService.I18nReplace(I18nService.I18n().plugins_porting_close_task_confirm_tip,
                        { 0: I18nService.I18n().plugins_porting_rebuilding_label }),
                        I18nService.I18n().confirm_button, I18nService.I18n().cancel_button).then(async select => {
                        // 确认取消正在进行中的软件包重构
                        if (select === I18nService.I18n().confirm_button) {
                            AnalysisUtil.clearTaskId(context);
                            CancelTaskUtils.delSoftwarePackageTask(global, message, stopSoftPkgFlagObj);
                        } else {
                            stopSoftPkgFlagObj.stopSoftPkgFlag = true;
                            AnalysisUtil.showProcess(global, message);
                        }
                        }));
                let lastRate = PACK_PROGRESS.PROGRESS_START;
                while (situation >= PACK_PROGRESS.PROGRESS_START && situation <= PACK_PROGRESS.PROGRESS_END) {
                    progress.report({
                        increment: situation - lastRate,
                        message: msg + I18nService.I18nReplace(
                            I18nService.I18n().plugins_porting_webpack_task_progress,
                            { 0: situation })
                    });
                    lastRate = situation;
                    await AnalysisUtil.sleep(PROGRESS_FRESH_INTERVAL);
                    if (!stopSoftPkgFlagObj.stopSoftPkgFlag) {
                        resp = await AnalysisUtil.getProgress(context, message);
                        msg = AnalysisUtil.getRspMessage(resp);
                        situation = AnalysisUtil.getProgressStatus(resp, false);
                    } else {
                        break;
                    }
                }
                if (!stopSoftPkgFlagObj.stopSoftPkgFlag) {
                    // 刷新左侧树
                    PortMenu.getInstance().refresh();

                    // 提示重构结果信息
                    AnalysisUtil.showTip(resp, message, context);

                    // 刷新webview
                    Utils.freshWebview(global, {}, message);

                    // 用报告页面刷掉原来新建扫描任务页面
                    const panelOption = {
                        module: TOOL_NAME_SOFTWARE_PACKAGE,  // 软件包重构
                        id: message.data.taskID,  // 任务id
                        name: resp?.data?.result ? resp.data.result : message.data.packageName  // 上传的软件包名
                    };
                    ToolPanelManager.updatePanel(global.toolPanel, global.context, panelOption);
                }
            });
        }
    }

    /**
     * 迁移模板弹框提示
     * @ param resp
     */
    private static showMigTip(context: vscode.ExtensionContext, resp: any) {
        if (resp.data.infochinese && resp.data.info) {
            const situation = AnalysisUtil.getProgressStatus(resp, false);
            Utils.analysisShowInfoByStatusType(context, resp);
        }
    }

    private static showTip(resp: any, message: any, context: vscode.ExtensionContext) {
        const situation = AnalysisUtil.getProgressStatus(resp, false);
        if (situation === PACK_PROGRESS.PROGRESS_FAILED) { // status:-1或2 软包重构失败
            const data = {
              info: I18nService.I18n().plugins_porting_webpack_fail + resp.info,
              infochinese: I18nService.I18n().plugins_porting_webpack_fail + resp.infochinese,
              url: Utils.getUrlConfigJson(context).faqPackageRebuildZn,
              urlEn: Utils.getUrlConfigJson(context).faqPackageRebuildEn
            };
            Utils.faqControl(data);
        } else {
            const outName = resp.data.result || '';
            if (outName) {
                const download = I18nService.I18n().plugins_porting_webpack_success_file_download;
                vscode.window.showInformationMessage(AnalysisUtil.getSuccessInfo(resp, outName), download)
                    .then(result => {
                    if (result === download) {
                        if (vscode.env.appName === ENV_APP_NAME.CLOUDIDE) {
                            const path =
                                SOFTWARE_PACKAGE_URLS.SOFTWAREPKG_DOWNLOAD_PKG
                                + message.data.taskID + '/' + outName;
                            CloudIDEService.cloudIDEDowmload(path);
                        } else {
                            AnalysisUtil.downloadRebuildPkg(
                                context,
                                outName,
                                AnalysisUtil.getFilePath(message, outName), message.module);
                        }
                    }
                });
            } else {
                if (resp.data && resp.data.status === 3) {
                    // status:3 软件包已支持鲲鹏平台，无需重新构建
                    Utils.showInfo(AnalysisUtil.getRspMessage(resp));
                } else {
                    // status:0 软包重构成功
                    Utils.showInfo(AnalysisUtil.getSuccessInfo());
                }
            }
        }
    }

    private static getRspMessage(data: any): any {
        let respMessage = 'Unknown error';
        if (vscode.env.language === 'zh-cn') {
            respMessage = data.infochinese;
        } else {
            respMessage = data.info;
        }
        return respMessage;
    }

    /**
     * 删除重构软件包
     * @param context 插件上下文
     * @param name 软件包名
     * @param path 软件包目录
     * @param module 模块
     */
    public static async deleteRebuildPackage(
        context: vscode.ExtensionContext,
        name: string,
        path: string,
        module: any) {
        const option = {
            url: SOFTWARE_PACKAGE_URLS.SOFTWAREPKG_REPORT_DELETE_URL + `?name=${name}&path=${path}`,
            method: 'DELETE',
            param: { name, path }
        };
        const resp: any = await Utils.requestDataHelper(context, option, module);
        return resp;
    }

    /**
     * 下载重构软件包
     * @param context 插件上下文
     * @param fileName 软件包名
     * @param filePath 软件包目录
     * @param module 模块
     */
    public static async downloadRebuildPkg(
        context: vscode.ExtensionContext,
        fileName: string,
        filePath: string,
        module: any) {
        const outFile = context.extensionPath + OS_DIR_SEP + fileName;
        const saveFileName = await Utils.saveFileBySaveDialog(outFile);

        // 用户取消
        if (!saveFileName) {
            return;
        }

        const path = AnalysisUtil.generateFileName(saveFileName);

        const fileStream = fs.createWriteStream(path);

        const querystring = require('querystring');

        const option: any = {
            url: 'https://' + context.globalState.get('portingIp')
                + ':' + context.globalState.get('portingPort') + SOFTWARE_PACKAGE_URLS.SOFTWAREPKG_PACKAGE_DOWNLOAD_URL,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: context.globalState.get('portingToken') },
            responseType: 'stream',
            data: querystring.stringify({ sub_path: 'report/packagerebuild', file_path: filePath })
        };
        const https = require('https');
        option.httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        const axios = require('axios');
        axios(option).then((response: any) => {
            // 当接口返回 token 有更新时，需要同步更新token
            if (response && response.headers && response.headers.token
                && response.headers.token !== context.globalState.get('portingToken')) {
                context.globalState.update(module + 'Token', response.headers.token);
            }

            response.data.pipe(fileStream);
        });

        fileStream.on('finish', () => {
            const pos = path.lastIndexOf('.');
            const tmpFileName = path.slice(0, pos);
            fs.renameSync(path, tmpFileName);
            const downloadMsg = I18nService.I18n().plugins_porting_webpack_file_download_path + `${tmpFileName}`;
            vscode.window.showInformationMessage(downloadMsg);
        });

        fileStream.on('error', (error: any) => {
            fs.unlinkSync(path, () => { });
            AnalysisUtil.generateFailMsg(error);
        });
    }

    /**
     * cloudIDE下载重构软件包
     * @param context 插件上下文
     * @param reportId 报告id
     * @param module 模块
     */
    public static async cloudIDEDownloadRebuildPkg(context: vscode.ExtensionContext, reportId: any, module: any) {
        // 获取报告详细信息
        const res: any = await ReportHelper.getReportDetail(context, reportId, module);

        // 提示错误信息
        if (!res) {
            ReportHelper.showErrorMessage(res);
            return;
        }
        const resObj = JSON.parse(res.replace(/#/g, ':'));
        const path = resObj?.data?.result_path || '';
        if (path) {
            vscode.commands.getCommands().then(commands => {
                if (commands.includes('cloudide.download')) {
                    vscode.commands.executeCommand('cloudide.download', path);
                } else {
                    vscode.window.showErrorMessage('command "cloudide.download" not found');
                }
            });
        }
    }

    private static getFilePath(message: any, fileName: string) {
        const params = message.data.url.split('=');
        if (params.length > 0) {
            const taskId = params[params.length - 1];
            return taskId + '/' + fileName;
        }
        return '';
    }

    private static generateFileName(path: any) {
        const fileName = path;
        return fileName + '.tmp';
    }

    private static generateFailMsg(error: any) {
        if (error) {
            vscode.window.showErrorMessage(error.message);
        } else {
            vscode.window.showErrorMessage(I18nService.I18n().plugins_porting_webpack_download_failed);
        }

    }

    private static getSuccessInfo(resp?: any, outName?: string): string {
        if (!outName) {
            return I18nService.I18n().plugins_porting_webpack_success;
        }
        if (vscode.env.language === 'zh-cn') {
            return I18nService.I18n().plugins_porting_webpack_success + '：' + resp.infochinese;
        } else {
            return I18nService.I18n().plugins_porting_webpack_success + '：' + resp.info;
        }
    }

    private static getProgress(context: vscode.ExtensionContext, message: any): Thenable<any> {
        const resp: any = Utils.requestDataHelper(context, message.data, message.module);
        return resp;
    }

    /**
     * 等待指定的时间
     * @param ms 等待时间
     */
    private static async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }

    private static getProgressStatus(resp: any, mustShowProgress: boolean) {
        if (!resp) {
            return PACK_PROGRESS.PROGRESS_FAILED;
        }

        // 软件迁移模板管理进度条
        if (resp.data.status === RESPONSE_STATUS.PROCESS_RUNNING
            || resp.data.runningstatus === RESPONSE_STATUS.PROCESS_RUNNING) {
            return resp.data.progress;
        } else if (resp.data.status === RESPONSE_STATUS.PROCESS_SUCCESS
            || resp.data.status === RESPONSE_STATUS.PROCESS_FINISH
            || resp.data.runningstatus === RESPONSE_STATUS.PROCESS_SUCCESS
            || resp.data.runningstatus === RESPONSE_STATUS.PROCESS_FINISH) {
            if (mustShowProgress) {
                return PACK_PROGRESS.PROGRESS_SUCCESS - 1;
            }
            return PACK_PROGRESS.PROGRESS_SUCCESS;
        } else if (resp.data.status === RESPONSE_STATUS.PROCESS_FAILED
            || resp.data.runningstatus === RESPONSE_STATUS.PROCESS_FAILED) {
            return PACK_PROGRESS.PROGRESS_FAILED;
        }

        if (resp.status === RESPONSE_STATUS.PROCESS_RUNNING) {
            return resp.progress;
        } else if (resp.status === RESPONSE_STATUS.PROCESS_SUCCESS
            || resp.status === RESPONSE_STATUS.PROCESS_FINISH) {
            return PACK_PROGRESS.PROGRESS_SUCCESS;
        }

        return PACK_PROGRESS.PROGRESS_FAILED;
    }
    private static clearTaskId(context: any) {
        context.globalState.update('anyCtaskId', null);
    }

    /**
     * 后端worker用户数量提示
     * @param context 上下文
     * @param type 消息提示类型
     */
    public static showWorkerTip(context: vscode.ExtensionContext, type: string) {

        // worker为1-3
        if (type === MessageType.INFO) {
            vscode.window.showInformationMessage(I18nService.I18n().tip_lack_worker,
            I18nService.I18n().plugins_common_tips_checkConn_openFAQ).then(
                async select => {
                    if (select === I18nService.I18n().plugins_common_tips_checkConn_openFAQ) {
                        AnalysisUtil.openUserGuide(context);
                    }
                }
            );
            return;
        }

        // worker为0
        if (type === MessageType.ERROR) {
            vscode.window.showErrorMessage(I18nService.I18n().tip_no_worker,
            I18nService.I18n().plugins_common_tips_checkConn_openFAQ).then(
                async select => {
                    if (select === I18nService.I18n().plugins_common_tips_checkConn_openFAQ) {
                        AnalysisUtil.openUserGuide(context);
                    }
                }
            );
        }
    }

    /**
     * 打开userguide弹窗
     * @param context 插件上下文
     */
    public static openUserGuide(context: vscode.ExtensionContext) {
        const pluginUrlCfg = Utils.getUrlConfigJson(context);
        const userGuideUrl = vscode.env.language === 'zh-cn' ? vscode.Uri.parse(pluginUrlCfg.faqFiftySixZn)
        : vscode.Uri.parse(pluginUrlCfg.faqFiftySixEn);
        vscode.commands.executeCommand('vscode.open', userGuideUrl);
    }
}
