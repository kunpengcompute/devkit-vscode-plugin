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
import * as os from 'os';
import { Utils } from './utils';
import { I18nService } from './i18nservice';
import { ToolPanelManager } from './panel-manager';
import * as constant from './constant';
import { PortMenu } from './toolmenu/port-menu';
import { CancelTaskUtils } from './cancel-task-utils';
import { PortWorkerStatus, CacheLineStatus } from './constant';
import { ReportHelper } from './report-helper';
import { UploadUtil } from './upload-util';

/**
 * 处理任务进度弹框
 */
const enum WHITELISTMANAGEMENT {
    BACKUP = 0,
    RECOVERY = 1,
    UPDATE = 2
}
export class Progress {
    public static SCAN_STATUS_FAIL = 1;
    public static PROGRESS_DONE = 100;
    public static PERCENT = '%';
    public static BYTE_TASK_OK = 0;
    public static BYTE_REPORT_INPROGRESS = 1;
    public static BYTE_REPORT_DONE = 2;  // 迁移预检进度已完成
    public static WEAK_TASK_OK = 0;
    public static WEAK_REPORT_INPROGRESS = 2;
    public static STATUS_OK = 0;  //  任务成功
    public static LOG_COMPRESS_INPROGRESS = 2;  // 日志文件压缩中
    public static LOG_COMPRESS_FINISH = 0;  // 日志文件压缩完成
    /**
     * 扫描任务新建之后刷新进度条
     *
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    public static scanProcess(global: any, message: any) {
        const analysisingTitle = I18nService.I18n().plugins_apprise_message_analysising;
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: analysisingTitle,
            cancellable: true
        }, async (progress, token) => {
            // 是否确认取消源码迁移
            token.onCancellationRequested(() =>
                vscode.window.showInformationMessage(I18nService.I18nReplace(I18nService.I18n().plugins_porting_close_task_confirm_tip,
                    { 0: I18nService.I18n().plugins_porting_assessment_label }),
                    I18nService.I18n().confirm_button, I18nService.I18n().cancel_button).then(async select => {
                        // 确认取消正在进行的源码迁移
                        if (select === I18nService.I18n().confirm_button) {
                            CancelTaskUtils.delPortAssessmentTask(global, message);
                            return;
                        } else {
                            Progress.scanProcess(global, message);
                        }
                    })
            );
            const data: any = await this.runningStatus(global, message, progress, 0);
            const p = new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 100);
            });
        });
    }

    /**
     * 刷新进度
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
    public static async runningStatus(
        global: any, message: any, progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progessNumber: number) {
        const option = {
            url: `/task/progress/?task_type=7&task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };
        let data: any = await Utils.requestDataHelper(global.context, option, constant.TOOL_NAME_PORTING);
        if (data) {
            if (data.status === 0) {
                if (data.data.scanstatus === this.SCAN_STATUS_FAIL) {
                    Utils.showErrorInfoByLangType(data.data);
                } else {
                    const lastProgessNumber = data.data.progress;
                    const progessValue = lastProgessNumber + this.PERCENT;
                    progress.report({ increment: lastProgessNumber - progessNumber, message: progessValue });
                    if (lastProgessNumber < this.PROGRESS_DONE) {
                        await this.sleep(1000);
                        data = await this.runningStatus(global, message, progress, lastProgessNumber);
                    } else {
                        // 扫描分析完成时，分析路径下没有可迁移的内容场景没有报告id返回
                        if (!data.data.report_id) {
                            Utils.showInfoByLangType(data);
                            global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data, cbid: message.cbid });
                        } else {
                            let formatReportId = Utils.formatCreatedId(data.data.report_id);
                            formatReportId = vscode.env.language === 'zh-cn' ? `（${formatReportId}）` : `(${formatReportId})`;
                            Utils.showInfo(I18nService.I18n().plugins_dependency_message_createAnalysisReport + formatReportId);
                            setTimeout(() => {
                                // 刷新左侧树
                                PortMenu.getInstance().refresh();

                                // 用报告页面刷掉原来新建扫描任务页面
                                const panelOption = {
                                    module: constant.TOOL_NAME_DEP,
                                    id: data.data.report_id
                                };
                                ToolPanelManager.updatePanel(global.toolPanel, global.context, panelOption);
                            }, 1000);
                        }
                    }
                }
            } else {
                // 由于切换用户之后，token 发生变化，用新 token 查询报告会报错
                if ((data.info || '').indexOf('Failed to read the report') > -1) {
                    return;
                }
                // 任务不存在
                if (data.realStatus !== '0x0d0311') {
                    Utils.showErrorInfoByLangType(data);
                }
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data, cbid: message.cbid });
            }
        }
        return data;
    }

    /**
     * 获取源码报告
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
    static async getSourceAnaReport(
        global: any, message: any, progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progessNumber: number) {
        const option = {
            url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(message.data.reportId)}`,
            method: 'GET'
        };
        let progressContent: string;
        while (progessNumber < 100) {
            const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
            if (resp && resp.status === 0) {
                if (resp.realStatus === PortWorkerStatus.PROGRESS_WAIT_WORKER_STATUS) {
                    // 没有可用的worker，等待中
                    progressContent = I18nService.I18n().plugins_porting_message_waiting;
                    progress.report({ message: progressContent });
                    continue;
                }
                const curProgressNumber = resp.data.progress;
                progressContent = I18nService.I18n().plugins_porting_message_analysising + curProgressNumber + this.PERCENT;
                progress.report({ increment: curProgressNumber - progessNumber, message: progressContent });
                if (curProgressNumber < 100) {
                    progessNumber = curProgressNumber;
                    await this.sleep(1000);
                } else {
                    const flag = Object.keys(resp.data.portingresult).length > 0;
                    if (flag) {
                        const formatReportId = Utils.formatCreatedId(message.data.reportId);
                        Utils.showInfo(I18nService.I18n().plugins_dependency_message_sourceReport + '(' + formatReportId + ')');
                        setTimeout(() => {
                            // 刷新左侧树
                            PortMenu.getInstance().refresh();

                            // 用报告页面刷掉原来新建扫描任务页面
                            const panelOption = {
                                module: constant.TOOL_NAME_PORTING,
                                id: message.data.reportId,
                                filePath: message.data.filePath
                            };
                            ToolPanelManager.updatePanel(global.toolPanel, global.context, panelOption);
                        }, 1000);
                    } else {
                        Utils.showInfoByLangType(resp, 'true', global.toolPanel.getPanelId(), message.module);
                        global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', resp, cbid: message.cbid });
                    }
                    break;

                }
            } else {
                // 由于切换用户之后，token 发生变化，用新 token 查询报告会报错
                if ((resp.info || '').indexOf('Failed to read the report') > -1) {
                    break;
                }

                Utils.showErrorInfoByLangType(resp, 'true', global.toolPanel.getPanelId(), message.module);
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                break;
            }
        }
    }

    /**
     * 上传等待中进度条
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     */
    public static async getWaitingUploadTask(
      global: any,
      message: any,
      progress: vscode.Progress<{
        message?: string | undefined;
        increment?: number | undefined;
      }>,
      token: any
    ) {

      let progressContent: string;  // 消息框显示文本
      let isDone = false;  // 是否查询到数据
      let num = 0; // 是否轮询次数达到20次
      while (!isDone && num < 20) {
        const resp: any = await UploadUtil.uploadWaitingProgress(global.context, message, progress, token);
        if (resp.status) {
          if (resp.realStatus === '0x010125') { // 任务处于等待中
            progressContent = I18nService.I18n().upload_maxium;
            progress.report({ message: progressContent });
            num++;
            await this.sleep(30000);
          } else if (resp.status === 0) { // 运行完成
            isDone = true;
            num = 0;
            UploadUtil.uploadProgress(global.context, message);
            break;
          }
        } else {
          isDone = true;
          num = 0;
          global.toolPanel.panel.webview.postMessage({ cmd: 'waitingUploadTask', resp });
        }
      }

      global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: true, cbid: message.cbid });
    }

    /**
     * 64位运行模式进度条
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     */
    public static async getBit64Progress(
        global: any,
        message: any,
        progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        stopFlagObj: any) {

        const option = {
            url: `/task/progress/?task_type=5&task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };

        let progressContent: string;  // 消息框显示文本
        while (true) {
            const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
            if (resp && resp.status === Progress.BYTE_TASK_OK) {
                if (resp.realStatus === PortWorkerStatus.PROGRESS_WAIT_WORKER_STATUS) {
                    // 没有可用的worker，等待中
                    progressContent = I18nService.I18n().plugins_porting_portcheck_waiting;
                    if (message.data.showProcess) {
                        progress.report({ message: progressContent });
                    }
                    continue;
                }
                if (resp.data.status === Progress.BYTE_REPORT_INPROGRESS) {
                    progressContent = I18nService.I18n().plugins_porting_portcheck_checking + resp.data.scan_current_file;
                    if (message.data.showProcess) {
                      progress.report({ message: progressContent });
                    }
                    await this.sleep(1000);
                } else if (resp.data.status === Progress.BYTE_REPORT_DONE) {
                    resp.vscodePlatform = os.platform();
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                }
            } else {
                // 当取消任务时，会查不到任务，此时不需要提示
                if (!stopFlagObj.stopFlag && message.data.showProcess) {
                    Utils.showErrorInfoByLangType(resp, 'true', global.toolPanel.getPanelId(), message.module);
                }
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                break;
            }
        }
    }

    /**
     * 缓存行检查进度
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     */
    public static async getCacheLineProgress(
        global: any,
        message: any,
        progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        stopFlagObj: any) {

        const option = {
            url: `/task/progress/?task_type=12&task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };
        let progressContent: string;  // 消息框显示文本
        while (true) {
            const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
            if (resp && resp.status === Progress.BYTE_TASK_OK) {
                if (resp.realStatus === CacheLineStatus.CACHE_CHECK_TASK_RUNNING) {
                    progressContent = I18nService.I18n().plugins_common_cacheline_check.operation;
                    if (message.data.showProcess) {
                        progress.report({ message: progressContent });
                    }
                    await this.sleep(1000);
                } else if (resp.realStatus === CacheLineStatus.CACHE_CHECK_TASK_SCAN_SUCCESS) {
                    resp.vscodePlatform = os.platform();
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                }
            } else {
                // 当取消任务时，会查不到任务，此时不需要提示
                if (!stopFlagObj.stopFlag && message.data.showProcess) {
                    Utils.showErrorInfoByLangType(resp, 'true', global.toolPanel.getPanelId(), message.module);
                }
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                break;
            }
        }
    }

    /**
     * 获内存一致性编译文件进度条
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
     public static async getWeakCompileProgress(
            global: any,
            message: any,
            progress: vscode.Progress<{
                message?: string | undefined;
                increment?: number | undefined;
            }>,
            progessNumber: number,
            stopFlagObj: any) {
            const option = {
                url: `/task/progress/?task_type=9&task_id=${encodeURIComponent(message.data.taskId)}`,
                method: 'GET'
            };
            let progressContent: string;
            while (progessNumber < 100) {
                const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
                if (resp && resp.status === Progress.WEAK_TASK_OK) {
                    if (resp.realStatus === PortWorkerStatus.PROGRESS_WAIT_WORKER_STATUS) {
                        // 没有可用的worker，等待中
                        progressContent = I18nService.I18n().plugins_porting_weak_check_compile_file_waiting;
                        if (message.data.showProcess) {
                            progress.report({ message: progressContent });
                        }
                        continue;
                    }
                    if (resp.data.runningstatus === Progress.WEAK_REPORT_INPROGRESS) {
                        progressContent = I18nService.I18n().plugins_porting_weak_check_compile_file;
                        if (message.data.showProcess) {
                            progress.report({ message: progressContent });
                        }
                        await this.sleep(1000);
                    } else {
                        resp.vscodePlatform = os.platform();
                        global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                        break;
                    }
                } else if (resp.realStatus === '0x0d0b11') {
                    Utils.showErrorInfoByLangTypeWeak(global.context, resp);
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                } else if (resp.realStatus === '0x0d0b20') {
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                }  else {
                    // 当取消任务时，会查不到任务，此时不需要提示
                    if (!stopFlagObj.stopFlag) {
                    Utils.showErrorInfoByLangType(resp, 'false', global.toolPanel.getPanelId(), message.module);
                    }
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                }
            }
    }

    /**
     * 获字节对齐进度
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
    public static async getByteAlignProgress(
        global: any,
        message: any,
        progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progessNumber: number,
        stopFlagObj: any) {

        const option = {
            url: `/task/progress/?task_type=6&task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };

        let progressContent: string;
        while (progessNumber < 100) {
            const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
            resp.vscodePlatform = os.platform();
            if (resp && resp.status === Progress.BYTE_TASK_OK) {
                if (resp.realStatus === PortWorkerStatus.PROGRESS_WAIT_WORKER_STATUS) {
                    // 没有可用的worker，等待中
                    progressContent = I18nService.I18n().plugins_porting_enhance_function_byte_align_waiting;
                    if (message.data.showProcess) {
                      progress.report({ message: progressContent });
                    }
                    continue;
                }
                if (resp.data.status === Progress.BYTE_REPORT_INPROGRESS) {
                    const curProgressNumber = resp.data.progress;
                    progressContent = I18nService.I18n().plugins_porting_enhance_function_byte_align_processing +
                        curProgressNumber + this.PERCENT;
                    if (message.data.showProcess) {
                      progress.report({ increment: curProgressNumber - progessNumber, message: progressContent });
                    }
                    if (curProgressNumber < 100) {
                        progessNumber = curProgressNumber;
                        await this.sleep(1000);
                    }
                } else {
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                }
            } else {
                // 当取消任务时，会查不到任务，此时不需要提示
                if (!stopFlagObj.stopFlag && message.data.showProcess) {
                    Utils.showErrorInfoByLangType(resp, 'false', global.toolPanel.getPanelId(), message.module);
                }
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                break;
            }
        }
    }

    /**
     * 内存一致性
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
    public static async getWeakCheckProgress(
        global: any,
        message: any,
        progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progessNumber: number,
        stopFlagObj: any) {

        const option = {
            url: `/task/progress/?task_type=10&task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };

        let progressContent: string;
        while (progessNumber < 100) {
            const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
            resp.vscodePlatform = os.platform();
            if (resp && resp.status === Progress.WEAK_TASK_OK) {
                if (resp.realStatus === PortWorkerStatus.PROGRESS_WAIT_WORKER_STATUS) {
                    // 没有可用的worker，等待中
                    progressContent = I18nService.I18n().plugins_porting_weakcheck_progress_label_waiting;
                    progress.report({ message: progressContent });
                    continue;
                }
                if (resp.data.runningstatus === Progress.WEAK_REPORT_INPROGRESS) {
                    const curProgressNumber = resp.data.progress;
                    progressContent = I18nService.I18n().plugins_porting_enhance_function_weak_check_processing_tip +
                        curProgressNumber + this.PERCENT;
                    progress.report({ increment: curProgressNumber - progessNumber, message: progressContent });
                    if (curProgressNumber < 100) {
                        progessNumber = curProgressNumber;
                        await this.sleep(1000);
                    }
                } else {
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                }
            } else {
                // 当取消任务时，会查不到任务，此时不需要提示
                if (!stopFlagObj.stopFlag) {
                    Utils.showErrorInfoByLangType(resp, 'true', global.toolPanel.getPanelId(), message.module);
                }
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                break;
            }
        }
    }
    /**
     * 获内存一致性bc
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
    public static async getBcCheckProgress(
        global: any,
        message: any,
        progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progessNumber: number,
        stopFlagObj: any) {

        const option = {
            url: `/task/progress/?task_type=11&task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };

        while (progessNumber < 100) {
            const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
            if (resp && resp.status === Progress.WEAK_TASK_OK) {
                if (resp.data.runningstatus === Progress.WEAK_REPORT_INPROGRESS) {
                    const curProgressNumber = resp.data.progress;
                    const progessValue = curProgressNumber + this.PERCENT;
                    if (message.data.showProcess) {
                        progress.report({ increment: curProgressNumber - progessNumber, message: progessValue });
                    }
                    if (curProgressNumber < 100) {
                        progessNumber = curProgressNumber;
                        await this.sleep(1000);
                    }
                } else {
                    global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                    break;
                }
            } else {
                // 当取消任务时，会查不到任务，此时不需要提示
                if (!stopFlagObj.stopFlag) {
                    Utils.showErrorInfoByLangType(resp, 'true', global.toolPanel.getPanelId(), message.module);
                }
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                break;
            }
        }
    }

    /**
     * 依赖字典管理任务新建之后刷新进度条
     *
     * @param global 插件上下文,以及当前的panel
     * @param message 来自webview的消息内容
     */
    public static whitelistManagementProcess(global: any, message: any) {
        let whiteListManagementOperatingTitle: any;
        switch (message.data.option) {
            case WHITELISTMANAGEMENT.BACKUP:
                whiteListManagementOperatingTitle = I18nService.I18n().plugins_common_message_whiteListManagement_backUping;
                break;
            case WHITELISTMANAGEMENT.RECOVERY:
                whiteListManagementOperatingTitle = I18nService.I18n().plugins_common_message_whiteListManagement_recoverying;
                break;
            case WHITELISTMANAGEMENT.UPDATE:
                whiteListManagementOperatingTitle = I18nService.I18n().plugins_common_message_whiteListManagement_upgrading;
                break;
            default:
                break;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: whiteListManagementOperatingTitle,
            cancellable: false
        }, async (progress, token) => {
            const data: any = await this.whitelistManagementStatus(global, message, progress, 0);
            const promise = new Promise<void>(resolve => {
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data, cbid: message.cbid });
                setTimeout(() => {
                    resolve();
                }, 100);
            });
        });
    }

    /**
     * 刷新依赖字典管理进度
     * @param global 全局上下文
     * @param message 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
    public static async whitelistManagementStatus(
        global: any, message: any, progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progessNumber: number) {
        // task_type=2：依赖字典管理
        const url = '/task/progress/?task_type=2&task_id=';
        const option = {
            url: `${url}${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };
        let data: any = await Utils.requestDataHelper(global.context, option, message.module);

        if (data && data.status === 0) {
            let lastProgessNumber = data.data.progress;
            if (data.data.status === 0 && lastProgessNumber === this.PROGRESS_DONE) {
                progress.report({ increment: lastProgessNumber - progessNumber, message: this.PROGRESS_DONE + this.PERCENT });
                const info = {
                    info: data.data.option_info,
                    infochinese: data.data.option_info_chinese
                };
                Utils.showInfoByLangType(info);
            } else if (data.data.status === 1) {
                // 任务正在执行中
                if (lastProgessNumber < progessNumber) {
                    lastProgessNumber = progessNumber;
                }
                const progessValue = lastProgessNumber + this.PERCENT;
                const i18n: any = vscode.env.language;
                if (i18n && i18n.indexOf('en') !== -1) {
                    progress.report({
                        increment: lastProgessNumber - progessNumber,
                        message: data.data.option_info + ' ' + progessValue
                    });
                } else {
                    progress.report({
                        increment: lastProgessNumber - progessNumber,
                        message: data.data.option_info_chinese + ' ' + progessValue
                    });
                }
                await this.sleep(3000);
                data = await this.whitelistManagementStatus(global, message, progress, lastProgessNumber);
            } else {
                const info = {
                  info: data.data.option_info,
                  infochinese: data.data.option_info_chinese,
                  url: Utils.getUrlConfigJson(global.context).faqDependencyDictionaryZn,
                  urlEn: Utils.getUrlConfigJson(global.context).faqDependencyDictionaryEn
                };
                Utils.faqControl(info);
            }
        } else {
            const info = {
              info: data.data.option_info,
              infochinese: data.data.option_info_chinese,
              url: Utils.getUrlConfigJson(global.context).faqDependencyDictionaryZn,
              urlEn: Utils.getUrlConfigJson(global.context).faqDependencyDictionaryEn
            };
            Utils.faqControl(info);
        }

        return data;
    }

    /**
     * 等待指定的时间
     * @param ms，等待时间，单位毫秒
     */
    private static async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }

    /**
     * 获取日志压缩进度
     * @param global 全局上下文
     * @param logInfo 消息
     * @param progress 进度条对象
     * @param progessNumber 进度
     */
    public static async getCompressLogProgress(
        global: any,
        message: any,
        progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        stopFlagObj: any) {

        const option = {
            url: `/portadv/runlog/zip_log/?task_id=${encodeURIComponent(message.data.taskId)}`,
            method: 'GET'
        };

        let isDone = false;  // 是否已经运行完
        while (!isDone && !stopFlagObj.stopFlag) {  // 日志压缩未完成或任务未取消
            const resp: any = await Utils.requestDataHelper(global.context, option, 'porting');
            if (resp && resp.status === Progress.STATUS_OK) {
                if (resp.data.status === Progress.LOG_COMPRESS_INPROGRESS) {  // 日志压缩中
                    await this.sleep(1000);
                } else if (resp.data.status === Progress.LOG_COMPRESS_FINISH) {
                    // 压缩运行完成
                    isDone = true;

                    // 下载日志
                    const bufferData = await Progress.downloadLog(global.context, message.data.logName);
                    if (bufferData) {
                        // 保存日志在本地
                        const logInfo = {
                            bufferData,  // 文件buffer数据
                            logName: message.data.logName  // 日志文件名log.zip
                        };
                        ReportHelper.downloadRunLog(global.context, logInfo);

                        // 关闭提示框
                        global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                        break;
                    }
                }
            } else {
                // 当取消任务时，会查不到任务，此时不需要提示
                if (!stopFlagObj.stopFlag) {
                    Utils.showErrorInfoByLangType(resp, 'true', global.toolPanel.getPanelId(), message.module);
                }
                global.toolPanel.panel.webview.postMessage({ cmd: 'callbackProcess', data: resp, cbid: message.cbid });
                break;
            }
        }
    }

    /**
     * 调用下载运行日志接口
     * @param context context
     * @param file_path 文件名
     * @returns 返回数据
     */
    public static async downloadLog(context: vscode.ExtensionContext, logName: string) {
        const option = {
            url: '/portadv/download/',
            params: {
                sub_path: 'downloadlog',
                file_path: logName
            },
            responseType: 'arraybuffer',
            method: 'POST'
        };
        const respBuffer: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        return respBuffer;
    }
}
