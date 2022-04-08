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
import { ErrorHelper } from './error-helper';
import { LogManager, LOG_LEVEL } from './log-manager';
import { I18nService } from './i18nservice';
const path = require('path');
const fs = require('fs');
const https = require('https');

export class UploadUtil {

    /**
     * 上传文件
     * @param context 插件上下文
     * @param req 请求对象
     * @param option 文件内容
     * @param module    模块 ex: 'sysPerf','javaPerf'
     */
    public static async uploadFile(context: vscode.ExtensionContext, module: any, req: any, ip: any, port: any, token: any, option: any) {
        const boundaryKey = '----WebKitFormBoundary' + new Date().getTime();
        const httpsOption: any = {
            host: ip,
            port,
            method: req.method,
            rejectUnauthorized: false,
            path: req.url,
            agent: false,
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
                'Accept-Language': I18nService.getLang().language
            }
        };


        let formDataFileName = '';
        let fileStream: any;
        fileStream = fs.createReadStream(option.filePath);
        formDataFileName = path.basename(option.filePath);
        if (token) {
            httpsOption.headers.Authorization = token;
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
                    resolve(JSON.parse(str));
                });
            });
            httpsReq.on('error', (error: any) => {
                LogManager.log(context, 'upload file 500', module, LOG_LEVEL.ERROR);
                serviceStatus = constant.HTTP_STATUS.HTTP_502_SERVERERROR;
                ErrorHelper.errorHandler(context, module, error.msg);
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
        });
    }

}
