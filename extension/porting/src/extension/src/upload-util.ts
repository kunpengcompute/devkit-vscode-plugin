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
import * as constant from './constant';
import { I18nService } from './i18nservice';
import { ErrorHelper } from './error-helper';
import { LoginManager } from './login-manager';
import { LogManager, LOG_LEVEL } from './log-manager';
import { CancelTaskUtils } from './cancel-task-utils';
import { PANEL_ID } from './constant';

import path = require('path');
const JSZip = require('jszip');
import os = require('os');
import fs = require('fs');

import https = require('https');
const i18n = I18nService.I18n();

const PROGRESS_FRESH_INTERVAL = 500;
const PROGRESS_WAIT_INTERVAL = 10;
const PROGRESS_DONE = 100;
const PERCENT = '%';
const ZIP_DONE_PERCENT = 20;
const UPLOAD_DONE_PERCENT = 80;

export class UploadUtil {

    /**
     * 刷新上传进度
     * @param context 插件上下文
     * @param message 消息
     */
    public static async uploadProgress(context: vscode.ExtensionContext, message: any) {
        let data: any;
        // 进度条弹框表示，1：表示弹框，0：表示异常情况需关闭弹框
        context.globalState.update(message.module + 'uploadProcessFlag', 1);

        const uploadTip = (message.module === 'porting') ?
            (message.data.uploadPrefix) ? message.data.uploadPrefix + I18nService.I18n().plugins_porting_upload_tip
                : message.data.fileName + I18nService.I18n().plugins_porting_upload_tip
            : I18nService.I18n().plugins_common_upload_tip;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: uploadTip,
            cancellable: true
        }, async (progress, token) => {
            if (message.data.whiteListOpt) {
                this.cancelWhiteListUploading(context, message, token);
            }
            progress.report({ increment: 0, message: '0%' });
            const option = message.data;
            let tempFile: any = '';
            const zipFileGenerated = false;
            // 上传文件夹的逻辑是先将文件夹压缩成文件，然后通过文件上传
            if (option.folderUpload) {
                tempFile = await UploadUtil.toZipFile(option, progress);
            }
            data = await UploadUtil.uploadFile(context, message, tempFile, zipFileGenerated, progress, token);
        });
        return data;
    }

    /**
     * 获取等待中的上传任务状态
     * @param context 插件上下文
     * @param message 消息
     * @param progress 上传任务是否等待中
     * @param token 上传任务token
     */
    public static async uploadWaitingProgress(context: vscode.ExtensionContext, message: any, progress: any, token: any) {
        let data: any;
        // 进度条弹框表示，1：表示弹框，0：表示异常情况需关闭弹框
        context.globalState.update(message.module + 'uploadProcessFlag', 1);

        const option = message.data;
        let tempFile: any = '';
        const zipFileGenerated = false;
        // 上传文件夹的逻辑是先将文件夹压缩成文件，然后通过文件上传
        if (option.folderUpload) {
            tempFile = await UploadUtil.toZipFile(option, progress, true);
        }
        data = await UploadUtil.uploadWaitingFile(context, message, tempFile, zipFileGenerated, progress, token);
        return data;
    }

    /**
     * 取消上传依赖字典压缩包
     * @param context 插件上下文
     * @param message 消息体
     */
    private static async cancelWhiteListUploading(context: vscode.ExtensionContext, message: any, token: any) {
        token.onCancellationRequested(() =>
            vscode.window.showInformationMessage(I18nService.I18nReplace(I18nService.I18n().plugins_porting_close_task_confirm_tip,
                { 0: I18nService.I18n().plugins_porting_whitelist_upgrade }),
                I18nService.I18n().confirm_button, I18nService.I18n().cancel_button).then(async select => {
                    if (select === I18nService.I18n().confirm_button) {
                        message.data.stopUploadingFlag = true;
                        vscode.window.showInformationMessage(I18nService.I18n().plugins_porting_clear_label);
                        CancelTaskUtils.sendStopMsgToWebView('upgradeCanceled', 'upgradeCanceled', PANEL_ID.portMultipleview);
                    } else {
                        this.uploadProgress(context, message);
                    }
                }));
    }

    /**
     * 上传文件夹进度刷新
     * @param context 插件上下文
     * @param req 请求对象
     * @param message 消息
     * @param tempFile 临时文件
     * @param zipFileGenerated 是否压缩
     * @param progress 进度条对象
     */
    public static async uploadFile(
        context: vscode.ExtensionContext, message: any, tempFile: string,
        zipFileGenerated: boolean, progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progressToken: vscode.CancellationToken) {
        let token: string | undefined;
        const option = message.data;
        const module = message.module;
        let ip: string | undefined;
        let port: string | undefined;
        let url: string | undefined;
        if (module === 'porting') {
            ip = context.globalState.get('portingIp');
            port = context.globalState.get('portingPort');
            token = context.globalState.get('portingToken');
            url = '/porting/api' + option.url;
        }

        const boundaryKey = '----WebKitFormBoundary' + new Date().getTime();
        const httpsOption: any = {
            host: ip,
            port,
            method: 'POST',
            rejectUnauthorized: false,
            path: url,
            agent: false,
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
            }
        };

        let tempPath = '';
        let overridePath = '';
        if (option.autoPack) {
            if (option.autoPack.choice) {
                httpsOption.headers.choice = option.autoPack.choice;
                // 文件另存为复制一份临时文件，上传完成删除
                if ((option.autoPack.choice === 'save_as') && !option.folderUpload) {
                    tempPath = path.dirname(option.filePath).concat(path.sep).concat(option.overrideName);
                    fs.copyFileSync(option.filePath, tempPath);
                } else if (option.autoPack.choice === 'override' && !option.folderUpload) {
                    overridePath = path.dirname(option.filePath).concat(path.sep).concat(option.overrideName);
                }
            }
            httpsOption.headers['scan-type'] = option.autoPack['scan-type'];
        }

        let formDataFileName = '';
        let fileStream: any;
        if (tempFile) {
            // 上传文件夹时，对应的压缩文件
            fileStream = fs.createReadStream(tempFile);
            formDataFileName = path.basename(tempFile);
            httpsOption.headers['need-unzip'] = true;
        } else if (option.autoPack?.choice === 'override') {
            fileStream = fs.createReadStream(option.filePath);
            formDataFileName = path.basename(overridePath);
        } else {
            fileStream = fs.createReadStream(tempPath ? tempPath : option.filePath);
            formDataFileName = path.basename(tempPath ? tempPath : option.filePath);
        }

        if (token) {
            httpsOption.headers.Authorization = token;
        }

        if (option.need_unzip) {
            httpsOption.headers['need-unzip'] = true;
        }

        if (option.notChmod) {
            httpsOption.headers['not-chmod'] = true;
        }

        if (option.code_path) {
            httpsOption.headers['code-path'] = option.code_path;
        }

        // 迁移模板管理请求头中有文件名
        if (option.needHeaderFileName && option.fileName) {
            httpsOption.headers.filename = option.fileName;
        }

        let serviceStatus = constant.HTTP_STATUS.HTTP_200_OK;
        return new Promise(async (resolve, reject) => {
            const httpsReq = https.request(httpsOption, (response: any) => {
                let str = '';
                response.on('data', (chunk: any) => {
                    str += chunk;
                });

                // 当接口返回 token 有更新时，需要同步更新token
                if (response && response.headers && response.headers.token && response.headers.token !== token) {
                    context.globalState.update(module + 'Token', response.headers.token);
                }

                response.on('end', (res: any) => {
                    progress.report({ increment: 2, message: PROGRESS_DONE + PERCENT });
                    if (zipFileGenerated) {
                        fs.unlinkSync(tempFile);
                    }

                    if (zipFileGenerated) {
                        fs.unlinkSync(tempFile);
                    }

                    if (tempPath && option.autoPack.choice !== 'override') {
                        fs.unlinkSync(tempPath);
                    }

                    // 超时
                    if (response && response.statusCode === constant.HTTP_STATUS.HTTP_401_UNAUTHORIZED) {
                        LogManager.log(context, 'upload file 401', module, LOG_LEVEL.ERROR);
                        context.globalState.update(module + 'Session', null);
                        context.globalState.update(module + 'Token', null);
                        // 用户被挤退
                        if (str.search('CrowdedOut') > -1) {
                            context.globalState.update(module + 'uploadProcessFlag', 0);
                            vscode.window.showErrorMessage(i18n.plugins_common_term_login_other);
                        } else {
                            serviceStatus = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
                            vscode.window.showErrorMessage(i18n.plugins_common_term_report_401);
                        }
                        LoginManager.redirectToLogin(context, module);
                        reject();
                    }

                    // 服务器错误 dep 返回的 413 || port 返回的 502
                    if (response && response.statusCode === constant.HTTP_STATUS.HTTP_502_SERVERERROR ||
                        response.statusCode === constant.HTTP_STATUS.HTTP_413_UPLOADFAILED) {
                        vscode.window.showErrorMessage(i18n.plugins_porting_file_uploadFailed);
                        context.globalState.update(module + 'uploadProcessFlag', 0);
                        // 服务器错误，文件上传失败，返回 status 给webview 端
                        const rsp = {
                            status: constant.HTTP_STATUS.HTTP_502_SERVERERROR
                        };
                        resolve(rsp);
                    }
                    if (str) {
                        const respo: any = JSON.parse(str);
                        respo.realStatus = respo.status;  // 后端返回的真实状态码
                        if (respo.status) {
                            respo.status = Number(String(respo.status).substr(-2, 1));  // 返回倒数第二位状态码
                        }
                        resolve(respo);
                    } else {
                        resolve(JSON.parse(str));
                    }
                });
            });
            progressToken.onCancellationRequested(() => {
                if (!httpsReq.writableEnded) {
                    httpsReq.destroy(new Error('Canceled'));
                }
            });
            httpsReq.on('error', (error: Error) => {
                if (error.message === 'Canceled') {
                    resolve('');
                    return;
                }
                LogManager.log(context, 'upload file 500', module, LOG_LEVEL.ERROR);
                serviceStatus = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
                ErrorHelper.errorHandler(context, module);
            });

            httpsReq.write(
                '--' + boundaryKey + '\r\n' +
                'Content-Disposition: form-data; name="file"; filename=' + formDataFileName + '\r\n' +
                'Content-Type:application/x-gzip\r\n\r\n'
            );

            fileStream.pipe(httpsReq, { end: false });
            fileStream.on('end', () => {
                httpsReq.end('\r\n--' + boundaryKey + '--');
            });

            await UploadUtil.sleep(PROGRESS_FRESH_INTERVAL);
            progress.report({ increment: 8, message: ZIP_DONE_PERCENT + PERCENT });
            const fileSize = option.fileSize;
            let dispatched = httpsReq.socket.bytesWritten || 0;
            let percent = Math.round(dispatched / fileSize * UPLOAD_DONE_PERCENT) + ZIP_DONE_PERCENT;
            let lastRate = ZIP_DONE_PERCENT;
            const uploadProcess = 98;
            while (percent >= lastRate && percent < uploadProcess) {
                progress.report({ increment: percent - lastRate, message: percent + PERCENT });
                lastRate = percent;
                await UploadUtil.sleep(PROGRESS_FRESH_INTERVAL);
                dispatched = httpsReq.socket.bytesWritten || 0;
                percent = Math.round(dispatched / fileSize * UPLOAD_DONE_PERCENT) + ZIP_DONE_PERCENT;

                const uploadProcessFlag = context.globalState.get(module + 'uploadProcessFlag');
                if (option.stopUploadingFlag || uploadProcessFlag === 0 || serviceStatus === constant.HTTP_STATUS.HTTP_502_SERVERERROR) {
                    resolve('');
                    break;
                }
            }
        });
    }

    /**
     * 上传等待文件夹刷新
     * @param context 插件上下文
     * @param req 请求对象
     * @param message 消息
     * @param tempFile 临时文件
     * @param zipFileGenerated 是否压缩
     * @param progress 进度条对象
     */
    public static async uploadWaitingFile(
        context: vscode.ExtensionContext, message: any, tempFile: string,
        zipFileGenerated: boolean, progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        progressToken: vscode.CancellationToken
    ) {
        let token: string | undefined;
        const option = message.data;
        const module = message.module;
        let ip: string | undefined;
        let port: string | undefined;
        let url: string | undefined;
        if (module === 'porting') {
            ip = context.globalState.get('portingIp');
            port = context.globalState.get('portingPort');
            token = context.globalState.get('portingToken');
            url = '/porting/api' + option.url;
        }

        const boundaryKey = '----WebKitFormBoundary' + new Date().getTime();
        const httpsOption: any = {
            host: ip,
            port,
            method: 'POST',
            rejectUnauthorized: false,
            path: url,
            agent: false,
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
            }
        };

        let tempPath = '';
        let overridePath = '';
        if (option.autoPack) {
            if (option.autoPack.choice) {
                httpsOption.headers.choice = option.autoPack.choice;
                // 文件另存为复制一份临时文件，上传完成删除
                if ((option.autoPack.choice === 'save_as') && !option.folderUpload) {
                    tempPath = path.dirname(option.filePath).concat(path.sep).concat(option.overrideName);
                } else if (option.autoPack.choice === 'override' && !option.folderUpload) {
                    overridePath = path.dirname(option.filePath).concat(path.sep).concat(option.overrideName);
                }
            }
            httpsOption.headers['scan-type'] = option.autoPack['scan-type'];
        }

        let formDataFileName = '';
        let fileStream: any;
        if (tempFile) {
            // 上传文件夹时，对应的压缩文件
            fileStream = fs.createReadStream(tempFile);
            formDataFileName = path.basename(tempFile);
            httpsOption.headers['need-unzip'] = true;
        } else if (option.autoPack?.choice === 'override') {
            fileStream = fs.createReadStream(option.filePath);
            formDataFileName = path.basename(overridePath);
        } else {
            fileStream = fs.createReadStream(tempPath ? tempPath : option.filePath);
            formDataFileName = path.basename(tempPath ? tempPath : option.filePath);
        }

        if (token) {
            httpsOption.headers.Authorization = token;
        }

        if (option.need_unzip) {
            httpsOption.headers['need-unzip'] = true;
        }

        if (option.notChmod) {
            httpsOption.headers['not-chmod'] = true;
        }

        if (option.code_path) {
            httpsOption.headers['code-path'] = option.code_path;
        }

        // 迁移模板管理请求头中有文件名
        if (option.needHeaderFileName && option.fileName) {
            httpsOption.headers.filename = option.fileName;
        }

        let serviceStatus = constant.HTTP_STATUS.HTTP_200_OK;
        return new Promise(async (resolve, reject) => {
            const httpsReq = https.request(httpsOption, (response: any) => {
                let str = '';
                response.on('data', (chunk: any) => {
                    str += chunk;
                });

                // 当接口返回 token 有更新时，需要同步更新token
                if (response && response.headers && response.headers.token && response.headers.token !== token) {
                    context.globalState.update(module + 'Token', response.headers.token);
                }

                response.on('end', (res: any) => {
                    if (zipFileGenerated) {
                        fs.unlinkSync(tempFile);
                    }

                    if (zipFileGenerated) {
                        fs.unlinkSync(tempFile);
                    }

                    if (str) {
                        const respo: any = JSON.parse(str);
                        respo.realStatus = respo.status;  // 后端返回的真实状态码
                        if (respo.status) {
                            respo.status = Number(String(respo.status).substr(-2, 1));  // 返回倒数第二位状态码
                        }
                        resolve(respo);
                    } else {
                        resolve(JSON.parse(str));
                    }
                });
            });
            progressToken.onCancellationRequested(() => {
                if (!httpsReq.writableEnded) {
                    httpsReq.destroy(new Error('Canceled'));
                }
            });
            httpsReq.on('error', (error: Error) => {
                if (error.message === 'Canceled') {
                    resolve('');
                    return;
                }
                LogManager.log(context, 'upload file 500', module, LOG_LEVEL.ERROR);
                serviceStatus = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
                ErrorHelper.errorHandler(context, module);
            });

            httpsReq.write(
                '--' + boundaryKey + '\r\n' +
                'Content-Disposition: form-data; name="file"; filename=' + formDataFileName + '\r\n' +
                'Content-Type:application/x-gzip\r\n\r\n'
            );
            fileStream.pipe(httpsReq, { end: false });
            fileStream.on('end', () => {
                httpsReq.end('\r\n--' + boundaryKey + '--');
            });
            await UploadUtil.sleep(PROGRESS_FRESH_INTERVAL);
        });
    }

    /**
     * 上传文件夹
     */
    static async toZipFile(
        option: any,
        progress: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>,
        isWaiting?: boolean
    ) {
        let tempFile = '';
        if (option.folderUpload) {
            const osTmpDir = os.tmpdir();
            const tempDir = fs.mkdtempSync(osTmpDir + path.sep);
            tempFile = tempDir + path.sep + option.filePath + '.zip';

            if (option.fileList) {
                const zip = new JSZip();
                for (const element of option.fileList) {
                    const filePath = element[0];
                    const fileName = element[1];
                    const zipFolder = element[2];
                    const file = fs.readFileSync(filePath);
                    zip.folder(zipFolder)?.file(fileName, file);
                }
                const incrementFor = 2;
                if (!isWaiting) {
                    progress.report({ increment: incrementFor, message: incrementFor + PERCENT });
                }
                await zip.generateAsync({
                    type: 'nodebuffer',
                    streamFiles: true
                }).then((content: any) => {
                    fs.writeFileSync(tempFile, content, 'utf-8');
                    if (!isWaiting) {
                        const incrementZip = 10;
                        progress.report({ increment: incrementZip, message: incrementZip + incrementFor + PERCENT });
                    }
                });

            }
        }
        return tempFile;
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
}
