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
import * as Constant from './constant';
import { ToolPanelManager } from './panel-manager';
import { CancelTaskUtils } from './cancel-task-utils';

/**
 * 处理状态-客户端
 */
const enum PROGRESS {
    PROGRESS_FAIL = -1,
    PROGRESS_START = 0,
    PROGRESS_END = 100,
    PROGRESS_SUCCESS = 101
}

/**
 * 状态码-软件迁移评估
 */
const enum MIGRATION {
    YUM_FAIL = '0x0d0604'
}

/**
 * 处理状态-服务端
 */
const enum PROGRESS_SERVER {
    PROGRESS_SUCCESS = 0,
    PROGRESS_RUNNING = 1
}

const PROGRESS_FRESH_INTERVAL = 1000;

/**
 * 进度入口-服务端
 */
const enum PROGRESS_ENTRY { PROGRESS_ENTRY_MIGRATION = 'center' }

const PROGRESS_FILE_SEPARATOR = '\\';

const MIGRATION_STEP_VALID_START = 0;

export class MigrationProgress {

    private static isRunning = false;

    private static errInfos = new Map<string, string>([
        ['steps', I18nService.I18n().common_term_migration_fail_steps],
        ['precheck', I18nService.I18n().common_term_migration_fail_precheck],
        ['bash', I18nService.I18n().common_term_migration_fail_bash],
        ['oscheck', I18nService.I18n().common_term_migration_fail_oscheck],
    ]);

    /**
     * 刷新进度条
     *
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    public static async showProcess(global: any, message: any) {
        if (this.isRunning) { return; }
        this.isRunning = true;
        const stopPortingFlagObj: any = { stopPortingFlag: false };
        let resp: any = await MigrationProgress.getAndFreshProgress(global, message);
        if (resp.status === 0 && resp.data.task_name && !message.data.taskID) {
            message.data.taskID = resp.data.task_name;
            message.data.url += '&task_id=' + message.data.taskID;
        }
        let situation = MigrationProgress.getProgressStatus(resp);
        if (situation < PROGRESS.PROGRESS_START || situation > PROGRESS.PROGRESS_END) {
            this.isRunning = false;
            if (!MigrationProgress.isCenterEntry(message.data) && !stopPortingFlagObj.stopPortingFlag) {
                MigrationProgress.sendStopMsgToWebView();
                MigrationProgress.showTip(resp, message, global);
            }
        } else {

            // 更新URL参数
            MigrationProgress.updateUrl(message.data, resp.data);

            let bPageClosed = false;

            // 显示进度
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: '',
                cancellable: true
            }, async (progress, token) => {
                // 取消正在进行中的专项软件迁移任务
                token.onCancellationRequested(() =>
                    vscode.window.showInformationMessage(I18nService.I18nReplace(I18nService.I18n().plugins_porting_close_task_confirm_tip,
                        { 0: I18nService.I18n().plugins_porting_dedicated_label }),
                        I18nService.I18n().confirm_button, I18nService.I18n().cancel_button).then(async select => {
                            // 确认取消正在进行中的专项软件迁移任务
                            if (select === I18nService.I18n().confirm_button) {
                                CancelTaskUtils.delSoftwarePortingTask(global, message, stopPortingFlagObj);
                            } else {
                                stopPortingFlagObj.stopPortingFlag = true;
                                this.isRunning = false;
                                MigrationProgress.showProcess(global, message);
                            }
                        }));
                let lastRate = PROGRESS.PROGRESS_START;
                if (MigrationProgress.isCenterEntry(message.data) && !stopPortingFlagObj.stopPortingFlag) {
                    progress.report({
                        increment: lastRate,
                        message: this.getRunningInfo(resp.data.type, resp.data.id, situation, resp.data.solution_xml)
                    });
                }
                while (situation >= PROGRESS.PROGRESS_START && situation <= PROGRESS.PROGRESS_END) {
                    if (!stopPortingFlagObj.stopPortingFlag) {
                        progress.report({
                            increment: situation - lastRate,
                            message: this.getRunningInfo(resp.data.type, resp.data.id, situation, resp.data.solution_xml)
                        });
                        lastRate = situation;
                        await this.sleep(PROGRESS_FRESH_INTERVAL);
                        if (ToolPanelManager.isPanelClosed(global)) {
                            bPageClosed = true;
                            break;
                        }
                        resp = await MigrationProgress.getAndFreshProgress(global, message);
                        situation = MigrationProgress.getProgressStatus(resp);
                    } else {
                        break;
                    }
                }

                if (!bPageClosed && !stopPortingFlagObj.stopPortingFlag) {
                    MigrationProgress.showTip(resp, message, global);
                }

                this.isRunning = false;
            });
        }
    }

    private static async getAndFreshProgress(global: any, message: any) {
        const resp = await Utils.requestDataHelper(global.context, message.data, message.module);
        MigrationProgress.freshWebview(resp);
        return resp;
    }

    private static freshWebview(data: any) {
        const panelId = Constant.PANEL_ID.portSoftPorting;
        const toolPortPanel = ToolPanelManager.getToolPanelByPanelId(panelId, Constant.TOOL_NAME_PORTING);
        if (toolPortPanel) {
            ToolPanelManager.sentMessageToPanel(toolPortPanel, null, Constant.TOOL_NAME_PORTING,
                {value: data, type: 'freshProgress', taskName: data.data.solution_xml });
        }
    }

    private static isCenterEntry(option: any) {
        return (option.entry === PROGRESS_ENTRY.PROGRESS_ENTRY_MIGRATION);
    }

    private static updateUrl(option: any, data: any) {
        if (MigrationProgress.isCenterEntry(option)) {
            option.url = option.url + '&task_id=' + MigrationProgress.getTaskId(data);
        }
    }

    private static getTaskId(data: any) {
        return data.task_name;
    }

    private static async showTip(resp: any, message: any, global: any) {
        if (resp.status !== Constant.STATUS_SUCCESS) {
            let warningMsg = resp.info;
            if (vscode.env.language === 'zh-cn') {
                warningMsg = resp.infochinese;
            }
            vscode.window.showWarningMessage(warningMsg);
            MigrationProgress.sendStopMsgToWebView();
            return;
        }

        const situation = MigrationProgress.getProgressStatus(resp);
        if (situation < PROGRESS.PROGRESS_START) {
            if (resp.realStatus === MIGRATION.YUM_FAIL) {
              const msg = I18nService.I18nReplace(I18nService.I18n().common_term_migration_fail, { 0: resp.data.solution_xml });
              const info = {
                info: msg + resp.info,
                infochinese: msg + resp.infochinese,
                url: Utils.getUrlConfigJson(global.context).faqMigrationTemplateZn,
                urlEn: Utils.getUrlConfigJson(global.context).faqMigrationTemplateEn
              };
              Utils.faqControl(info);
            } else {
              vscode.window.showErrorMessage(
                MigrationProgress.getFailInfo(resp.data.type, resp.data.id, message.data.fixPath || '', resp.data.solution_xml));
            }
            MigrationProgress.sendStopMsgToWebView();
        } else {
            const [outName, steps] = await MigrationProgress.getOutName(global.context, message.data, resp.data);
            // 判断是否执行最后一步操作
            let hasLastStep = false;
            if (steps?.length) {
                const lastStepId = steps[steps.length - 1].stepid;
                if (resp?.data?.steps && resp.data.steps.indexOf(lastStepId) !== -1) {
                    hasLastStep = true;
                }
            }
            if (outName && hasLastStep) {
                const download = I18nService.I18n().common_term_migration_success_file_download;
                vscode.window.showInformationMessage(MigrationProgress.getSuccessInfo(resp.data.solution_xml, outName), download)
                .then(async result => {
                    if (result === download) {
                        await this.downloadFile(global.context, outName);
                    }

                    MigrationProgress.sendStopMsgToWebView();
                });
            } else {
                vscode.window.showInformationMessage(MigrationProgress.getSuccessInfo(resp.data.solution_xml));
                MigrationProgress.sendStopMsgToWebView();
            }
        }
    }

    private static async getOutName(context: vscode.ExtensionContext, runningStatusData: any, respData: any) {
        if (!MigrationProgress.isCenterEntry(runningStatusData)) {
            return [runningStatusData.outputName, runningStatusData.steps];
        }
        const data = {
            url: `/portadv/solution/detailinfo/` + '?software=' + respData.solution_xml,
            method: 'GET'
        };
        const resp: any = await Utils.requestDataHelper(context, data, 'porting');
        if (!resp || resp.status !== Constant.STATUS_SUCCESS || !resp.data || !resp.data.sw_info) {
            return ['', []];
        }
        return [resp.data.sw_info.outname, resp.data.steps];
    }

    private static async downloadFile(context: vscode.ExtensionContext, outName: string) {
        const saveFilePath = await Utils.saveFileBySaveDialog(context.extensionPath + PROGRESS_FILE_SEPARATOR
            + MigrationProgress.getFileName(outName));

        // 用户取消
        if (!saveFilePath) {
            return;
        }

        const streamPath = this.getStreamPath(saveFilePath);
        // 设置请求参数
        const req: any = {
            host: context.globalState.get('portingIp'),
            port: context.globalState.get('portingPort'),
            rejectUnauthorized: false,
            headers: { 'content-type': 'application/json', Authorization: context.globalState.get('portingToken') },
            method: 'POST',
            path: '/porting/api/portadv/solution/result/',
            body: { file: outName }
        };

        const fs = require('fs');
        const fileStream = fs.createWriteStream(streamPath);
        const https = require('https');
        const request = https.request(req, (response: any) => {
            if (response.statusCode !== 200) {
                return;
            }

            // 当接口返回 token 有更新时，需要同步更新token
            if (response && response.headers && response.headers.token
                && response.headers.token !== context.globalState.get('portingToken')) {
                context.globalState.update(module + 'Token', response.headers.token);
            }

            response.pipe(fileStream);
        });

        fileStream.on('finish', () => {
            fs.renameSync(streamPath, saveFilePath);
            vscode.window.showInformationMessage(I18nService.I18nReplace(I18nService.I18n().common_term_download_success,
                { 0: saveFilePath }));
        });

        request.on('error', (err: any) => {
            fs.unlinkSync(streamPath, null);
            vscode.window.showErrorMessage(err.message);
        });

        fileStream.on('error', (err: any) => {
            fs.unlinkSync(streamPath, null);
            vscode.window.showErrorMessage(err.message);
        });

        const body = JSON.stringify({ file: outName });
        request.write(body);

        request.end();
    }

    private static getStreamPath(saveFilePath: any) {
        return saveFilePath + '.tmp';
    }

    private static getRunningInfo(type: string, stepId: number, situation: number, name: string) {
        return I18nService.I18nReplace(I18nService.I18n().common_term_migration_info,
            {
                0: name,
                1: situation + '%',
                2: this.getStepInfo(type, stepId)
            });
    }

    private static getStepInfo(type: string, stepId: number) {
        let stepInfo = '';
        if (stepId >= MIGRATION_STEP_VALID_START) {
            stepInfo = I18nService.I18nReplace((this.errInfos.get(type) || ''), { 0: stepId + 1 });
        } else {
            stepInfo = this.errInfos.get(type) || '';
        }
        return stepInfo;
    }

    private static getFailInfo(type: string, stepId: number, logPath: string, name: string): string {
        let errInfo = this.errInfos.get(type) || '';
        if (stepId >= MIGRATION_STEP_VALID_START) {
            errInfo = I18nService.I18nReplace((this.errInfos.get(type) || ''), { 0: stepId + 1 })
                + I18nService.I18n().common_term_migration_fail_sup;
        } else {
            errInfo = this.errInfos.get(type) + I18nService.I18n().common_term_migration_fail_sup;
        }
        return I18nService.I18nReplace(I18nService.I18n().common_term_migration_fail, { 0: name })
            + I18nService.I18nReplace(I18nService.I18n().common_term_migration_fail_content, { 0: errInfo, 1: logPath });
    }

    private static getSuccessInfo(name: string, outName?: string): string {
        const successInfo = I18nService.I18nReplace(I18nService.I18n().common_term_migration_success, { 0: name });
        if (!outName) {
            return successInfo;
        }
        return successInfo +
            I18nService.I18nReplace(I18nService.I18n().common_term_migration_success_file_tips,
                { 0: MigrationProgress.getFileName(outName) });
    }

    private static getFileName(outName: string) {
        let fileName = outName;
        const pos = outName.lastIndexOf('/');
        if (pos > -1) {
            fileName = outName.slice(pos + 1);
        }
        return fileName;
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

    private static getProgressStatus(resp: any) {
        if (!resp || resp.status !== Constant.STATUS_SUCCESS) {
            return PROGRESS.PROGRESS_FAIL;
        }

        if (resp.data.runningstatus === PROGRESS_SERVER.PROGRESS_RUNNING) {
            return resp.data.progress_fake;
        } else if (resp.data.runningstatus === PROGRESS_SERVER.PROGRESS_SUCCESS) {
            return PROGRESS.PROGRESS_SUCCESS;
        }

        return PROGRESS.PROGRESS_FAIL;
    }
    /**
     * 发送迁移任务结束到专项软件迁移
     */
    private static sendStopMsgToWebView() {
        this.isRunning = false;
        const panelId = Constant.PANEL_ID.portSoftPorting;
        const toolPortPanel = ToolPanelManager.getToolPanelByPanelId(panelId,
            Constant.TOOL_NAME_PORTING);
        if (toolPortPanel) {
            ToolPanelManager.sentMessageToPanel(ToolPanelManager.getToolPanelByPanelId(panelId,
                Constant.TOOL_NAME_PORTING), null, Constant.TOOL_NAME_PORTING,
                { value: true, type: 'migrationFinished' });
        }
    }
}
