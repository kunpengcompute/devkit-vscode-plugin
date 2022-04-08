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
import { messageHandler } from './webview-msg-handler';
import { PerfMenu } from './toolmenu/perf-menu';
import { ToolPanelManager } from './panel-manager';
import { LoginManager } from './login-manager';
import { LogManager } from './log-manager';

const os = require('os');

/**
 * 插件入口
 *
 * @param context 插件上下文
 */
export function activate(context: vscode.ExtensionContext) {

    // 初始化日志
    LogManager.init(context);

    // 响应VSCode配置修改
    Utils.addConfigListening();

    // 清除Vscode缓存信息
    Utils.initVscodeCache(context);

    // 判断系统是否支持自动登录
    Utils.getAutoSystemFlag();

    // 展示左侧Perf菜单树
    PerfMenu.init(context);

    // 响应perfadvisor左侧菜单树所有按钮的命令来打开不同的webview
    ToolPanelManager.createOrShowPanelForPerfCommand(context);

    // 用户自动登录
    LoginManager.autoLogIn(context);

}

// deactivate函数，在插件未激活时，会被调用
export function deactivate() { }
