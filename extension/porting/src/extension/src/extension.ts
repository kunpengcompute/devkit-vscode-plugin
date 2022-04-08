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
import { PortMenu } from './toolmenu/port-menu';
import { ToolPanelManager } from './panel-manager';
import { ReportHelper } from './report-helper';
import { Utils } from './utils';
import { LoginManager } from './login-manager';
import { CodeActionProviders } from './reportoperation/code-action-provider';
import { LogManager } from './log-manager';

/**
 * 插件入口
 *
 * @param context 插件上下文
 */
export function activate(context: vscode.ExtensionContext) {

    // 初始化日志
    LogManager.init(context);

    Utils.initVscodeCache(context);

    // 判断系统是否支持自动登录
    Utils.getAutoSystemFlag();

    // 初始化服务器配置
    Utils.initCloudIDEConfig(context);

    // 展示左侧porting菜单树
    PortMenu.init(context);

    // 目前迁移评估使用 响应Apprise左侧菜单树所有按钮的命令来打开不同的webview
    ToolPanelManager.crateOrShowPanelForDepCommand(context);

    // 响应Porting左侧菜单树所有按钮的命令来打开不同的webview
    ToolPanelManager.crateOrShowPanelForPortCommand(context);

    // 响应Apprise下载报告命令
    ReportHelper.dowloadDepReportCommand(context);

    // 响应Apprise删除单个历史报告
    ReportHelper.deleteDepReport(context);

    // 响应Porting删除单个历史报告
    ReportHelper.deletePortReport(context);

    // 响应Apprise清除所有的历史报告
    ReportHelper.clearDepReports(context);

    // 响应Porting清除所有的历史报告
    ReportHelper.clearPortReports(context);

    // 响应软件包重构报告操作命令（下载、删除）
    ReportHelper.regPkgRebuildHisCmd(context);

    // 撤销快捷键重写
    CodeActionProviders.registerUndo(context);

    // 响应Porting下载报告命令
    ReportHelper.dowloadPortReportCommand(context);

    // 响应VSCode配置修改
    Utils.addConfigListening();

    // 用户自动登录
    LoginManager.autoLogIn(context);

    // 判断是否从CloudIDE启动
    Utils.isCloudIDEHideBasicFunc();

}

// deactivate函数，在插件未激活时，会被调用
export function deactivate() { }
