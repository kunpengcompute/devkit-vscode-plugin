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
import { DepReport } from '../apprise-report';
import { ReportHelper } from '../report-helper';
import { ReportSoftWareBuild } from '../report/report-software-build';
import { Utils } from '../utils';

const https = require('https');
const axios = require('axios');

export class CloudIDEService {

    /**
     * 调用cloudIDE下载命令下载文件
     * @param path 文件所在的服务器路径
     */
    public static cloudIDEDowmload(path: string) {
        vscode.commands.getCommands().then(commands => {
            if (commands.includes('cloudide.download')) {
                vscode.commands.executeCommand('cloudide.download', path);
            } else {
                vscode.window.showErrorMessage('command "cloudide.download" not found');
            }
        });
    }

    /**
     * cloudIDE 左侧树下载重构软件包
     * @param context 插件上下文
     * @param reportId 报告id
     * @param module 模块
     */
    public static async downloadRebuildPkgByLeft(context: vscode.ExtensionContext, reportId: any, module: any) {
        // 获取报告详细信息
        const res: any = await ReportHelper.getReportDetail(context, reportId, module);

        // 提示错误信息
        if (!res) {
            ReportHelper.showErrorMessage(res);
            return;
        }
        const resObj = JSON.parse(res.replace(/#/g, ':'));
        const path = resObj?.data?.result_path || '';   // 重构包所在服务器路径
        if (path) {
            CloudIDEService.cloudIDEDowmload(path);
        }
    }

    /**
     * cloudIDE获取软件包重构历史报告html页面
     * @param global 上下文
     * @param message 来自webview的消息内容
     */
    public static async getSoftPkgRebuildHTMLContent(global: any, message: any) {
        const reportSoftWareBuild = new ReportSoftWareBuild();
        // 获取html页面
        const htmlContent: any = await reportSoftWareBuild.createReportHTML(global.context, message.data.htmlData);

        // 回调消息命令
        message.cmd = 'callbackProcess';

        // 将html模板发送到webview页面
        Utils.invokeCallback(global.toolPanel.panel, message, htmlContent);
    }

    /**
     * 软件迁移评估webview页面下载csv和html
     * @param global 插件上下文
     * @param message.data 报告信息{reportId:报告id, reportType:报告类型，0-csv,1-html, label:报告的创建时间}
     */
    public static async cloudIDEDownloadDepReport(global: any, message: any) {
        const url = `/portadv/binary/${message.data.reportId}/?report_type=${message.data.reportType}`;
        const option = {
            url,
            method: 'GET'
        };
        const responseBody: any = await Utils.requestDataHelper(global.context, option, constant.TOOL_NAME_PORTING);
        if (constant.STATUS_FAILED === responseBody.status) {
            ReportHelper.showErrorMessage(responseBody);
            return;
        }
        let fileName = '';
        let content: string | undefined;
        if ('0' === message.data.reportType) {
            fileName = `\\${message.data.reportId}.csv`;
            content = '\ufeff' + responseBody;  // \ufeff 解决csv文件中文乱码的问题
        } else {
            fileName = `\\${message.data.reportId}.html`;
            content = new DepReport().getReportHtml(responseBody, global.context, message.data.label);
        }

        // 发送到webview页面
        message.cmd = 'callbackProcess';
        Utils.invokeCallback(global.toolPanel.panel, message, content);
    }

    /**
     * 软件迁移评估左侧树下载csv文件报告
     * @param global 插件上下文
     * @param reportInfo 报告信息{reportId:报告id, reportType:报告类型，0-csv,1-html, label:报告的创建时间}
     */
    public static async downloadDepCsvReport(context: vscode.ExtensionContext, reportInfo: any) {
        const path = `/porting/api/portadv/binary/${reportInfo.reportId}/?report_type=${reportInfo.reportType}`;
        const option: any = {
            url: 'https://' + context.globalState.get('portingIp') + ':' + context.globalState.get('portingPort') + path,
            method: 'GET',
            headers: { Authorization: context.globalState.get('portingToken') },
        };
        option.httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        // 获取软件包在服务器上的保存路径
        axios(option).then((res: any) => {
            if (res?.headers) {
                let filepath = res.headers['content-disposition'] ? res.headers['content-disposition'].split(';')[1].split('=')[1] : '';
                filepath = filepath.split('"').join('');
                if (filepath) {
                    CloudIDEService.cloudIDEDowmload(filepath);
                }
            }
        }).catch((error: any) => {
            vscode.window.showErrorMessage(error);
        });
    }
}
