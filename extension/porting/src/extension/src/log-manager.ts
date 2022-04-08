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
import * as path from 'path';

const log4js = require('log4js');
const fs = require('fs');

const MAX_SIZE = 20 * 1024 * 1024;
const MAX_DATE = 30;
let extensionPath: any;

/**
 * 日志级别
 */
export const enum LOG_LEVEL {
    INFO = 'info',
    ERROR = 'error',
    DEBUG = 'debug',
}

/**
 * 日志类
 */
export class LogManager {
    /**
     * 清理过期日志
     * @param context 插件上下文
     */
    static async clean(context: vscode.ExtensionContext, bInit: boolean) {
        extensionPath = path.join(context.extensionPath, 'log/');
        if (!fs.existsSync(extensionPath)) {
            return;
        }

        const readDirArray = fs.readdirSync(extensionPath);
        let regx = /[a-zA-Z]+\.log(\.\d+)+$/;
        if (bInit) {
            regx = /[a-zA-Z]+\.log(\.\d+)?$/;
        }
        readDirArray.forEach(async (item: any) => {
            if (regx.test(item)) {
                const stats = fs.statSync(extensionPath + item);
                // 日志超过30天没修改就删除
                if ((new Date().getTime() - stats.birthtime.getTime()) > (MAX_DATE * 24 * 3600 * 1000)) {
                    fs.unlinkSync(extensionPath + item, null);
                }
            }
        });
    }


    /**
     * 初始化处理
     * @param context 插件上下文
     */
    static async init(context: vscode.ExtensionContext) {
        extensionPath = path.join(context.extensionPath, 'log/');
        // 加载插件时调用，清理过期日志
        await this.clean(context, true);

        log4js.configure({
            appenders: {
                porting: {
                    type: 'file',
                    filename: extensionPath + 'porting.log',
                    maxLogSize: MAX_SIZE,
                    alwaysIncludePattern: true,
                    backups: 5, // keep five backup files
                    encoding: 'utf-8',
                }
            },
            categories: {
                default: { appenders: ['porting'], level: 'debug' },
                porting: { appenders: ['porting'], level: 'debug' },
            }
        });
    }

    /**
     * 记录info级别日志
     * @param content 日志内容
     */
    static async log(context: vscode.ExtensionContext, content: string, module: string, level: LOG_LEVEL) {
        // 每次打日志时调用，清理过期日志
        await this.clean(context, false);

        extensionPath = path.join(context.extensionPath, 'log/');
        const portLogPath = path.join(extensionPath, 'porting.log');
        if (!fs.existsSync(portLogPath)) {
            this.init(context);
        }

        const logger = log4js.getLogger(module);
        switch (level) {
            case LOG_LEVEL.INFO:
                logger.info(content);
                break;
            case LOG_LEVEL.DEBUG:
                logger.debug(content);
                break;
            case LOG_LEVEL.ERROR:
                logger.error(content);
                break;
        }
    }
}
