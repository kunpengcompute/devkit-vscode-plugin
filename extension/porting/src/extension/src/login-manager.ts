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
import { ToolPanelManager } from './panel-manager';
import * as constant from './constant';
import { Utils } from './utils';
import { PortMenu } from './toolmenu/port-menu';
import { CodeSuggestViewHandler } from './reportoperation/code-view-hanlder';
import { I18nService } from './i18nservice';
import { LogManager, LOG_LEVEL } from './log-manager';
import { savaData, getPwd } from './crypto';
import { from } from 'form-data';
const i18n = I18nService.I18n();
const cp = require('child_process');
export class LoginManager {
    public static userName: string;
    public static isRidrect = false;
    /**
     * 处理登录时相关逻辑
     */
    public static loginProcess(context: vscode.ExtensionContext, req: any, body: any, module: string) {
        if (req.url.indexOf('users/login/') > -1) {
            LoginManager.loginInProcess(context, body, module);
        } else {
            LoginManager.loginOutProcess(context, module);
        }
    }

    /**
     * 更新 session 信息到全局变量中
     */
    public static loginInProcess(context: vscode.ExtensionContext, body: any, module: string) {
        if (body.realStatus === '0x040300') {
            // 清除工作文件临时目录及源码迁移建议handler
            Utils.clearWorkFile(context, '');
            CodeSuggestViewHandler.clearAll();

            const webviewSession = {
                role: body.data.role,
                username: body.data.username,
                loginId: body.data.id,
                workspace: body.data.workspace,
                isFirst: 0,
                language: vscode.env.language,
                migrationTip: true,
                showCheckEnvTips: true,
            };
            LoginManager.userName = body.data.username;
            context.globalState.update(module + 'Session', webviewSession);

            // 版本校验
            this.checkVersion(context, module);
        }
    }

    /**
     * 清除全局变量中的 session 信息
     */
    public static loginOutProcess(context: vscode.ExtensionContext, module: string) {
        LoginManager.clearCache(context, module);
        // 清除工作文件临时目录及源码迁移建议handler
        Utils.clearWorkFile(context, '');
        CodeSuggestViewHandler.clearAll();
        context.globalState.update(module + 'uploadProcessFlag', 0);
    }

    /**
     * 清空缓存
     *
     * @param context 插件上下文
     * @param module 模块
     */
    public static clearCache(context: vscode.ExtensionContext, module: string) {
        context.globalState.update(module + 'Session', null);
        context.globalState.update(module + 'Token', null);
        context.globalState.update('rightPorting', null);
        context.globalState.update('anyCtaskId', null);
    }
    /**
     * 版本校验
     * @param context 上下文
     */
    public static async checkVersion(context: vscode.ExtensionContext, module: any) {
        let toolVersions = '';
        if (constant.TOOL_NAME_PORTING === module) {
            toolVersions = Utils.getConfigJson(context).portVersion;
        }
        const option = {
            url: '/tools/version/',
            method: 'GET',
            subModule: module
        };
        const resp: any = await Utils.requestDataHelper(context, option, module);
        if (!toolVersions.includes(resp.version)) {
            const warnMsg = I18nService.I18nReplace(i18n.plugins_common_message_versionCompatibility, {
                0: toolVersions,
                1: resp.version

            });
            vscode.window.showWarningMessage(warnMsg);
        }
    }

    /**
     * session超时重定向到登录，或密码错误
     *
     * @param context 插件上下文
     * @param module 模块
     */
    public static redirectToLogin(context: vscode.ExtensionContext, module: string) {
        // 重定向之前清空之前登录的session
        LoginManager.clearCache(context, module);

        // 清除工作文件临时目录及源码迁移建议handler
        Utils.clearWorkFile(context, '');
        CodeSuggestViewHandler.clearAll();

        // 关闭当前所有的panel
        ToolPanelManager.closePanelsByRemained(module, new Array<string>());

        // 打开登录
        if (constant.TOOL_NAME_PORTING === module) {
            ToolPanelManager.openPortLoginPanel(context, 'login');

            // view上的按钮隐藏，左侧树显示登录按钮
            vscode.commands.executeCommand('setContext', 'isportlogined', Utils.isPortLogin(context));

            PortMenu.getInstance().refresh();
        }
    }

    /**
     * 退出不清空缓存
     *
     * @param context 插件上下文
     * @param module 模块
     */
     public static redirectToLoginSaveSession(context: vscode.ExtensionContext, module: string) {
        LoginManager.userName = '';
        // 清除工作文件临时目录及源码迁移建议handler
        Utils.clearWorkFile(context, '');
        CodeSuggestViewHandler.clearAll();

        // 关闭当前所有的panel
        ToolPanelManager.closePanelsByRemained(module, new Array<string>());

        // 打开登录
        if (constant.TOOL_NAME_PORTING === module) {
            ToolPanelManager.openPortLoginPanel(context, 'login');

            // view上的按钮隐藏，左侧树显示登录按钮
            vscode.commands.executeCommand('setContext', 'isportlogined', false);

            PortMenu.getInstance().refresh();
        }
    }

    /**
     * 自动登录加解密
     * @param global  插件上下文
     * @param message 传入信息
     */
    public static async loginRememberPwd(context: vscode.ExtensionContext, message: any) {
        return new Promise((resolve, reject) => {
            const json = Utils.getConfigJson(context);
            if (message.encrypt) {
                savaData(message.username, message.pwd, json.portConfig[0].ip);
            } else {
                getPwd(message.username, json.portConfig[0].ip, pwd => {
                        resolve(pwd);
                });
            }
        });
    }

    /**
     * 自动登录
     * @param global  插件上下文
     * @param message 传入信息
     */
    public static async autoLogin(context: vscode.ExtensionContext) {
        context.globalState.update(constant.TOOL_NAME_PORTING + 'autoLoginFlag', 1);
        const param = {
            username: context.globalState.get('autoLoginUser'),
            encrypt: false
        };
        const loginPwd = await LoginManager.loginRememberPwd(context, param);
        // 调用登录接口
        const option = {
            url: '/users/login/',
            params: {
                username: context.globalState.get('autoLoginUser'),
                password: loginPwd
            },
            method: 'POST'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        if (resp && resp.status === constant.STATUS_SUCCESS) {
            // view上的按钮从隐藏变成可见
            vscode.commands.executeCommand('setContext', 'isportlogined', Utils.isPortLogin(context));

            // view上菜单，admin和普通用户的菜单不同
            let role = 'user';
            if (context.globalState.get('autoLoginUser') === 'portadmin') {
                role = 'Admin';
            }
            vscode.commands.executeCommand('setContext', 'isPortAdmin', role === 'Admin');

            // 刷新左侧树
            PortMenu.getInstance().pathList = [];
            PortMenu.getInstance().refresh();

            ToolPanelManager.openPortAppraisePanel('migrationAppraise', context, null);
            context.globalState.update(constant.TOOL_NAME_PORTING + 'autoLoginFlag', 0);
            LogManager.log(context, 'User automatically logged in successfully ', constant.TOOL_NAME_PORTING, LOG_LEVEL.INFO);
        }
    }

    /**
     * 用户自动登录
     * @param context 上下文
     */
    public static autoLogIn(context: vscode.ExtensionContext) {
        if (context.globalState.get('autoLoginConfig') && context.globalState.get(constant.PORT_DESCLAIMER_CONF)) {
            LoginManager.autoLogin(context);
        }
    }
}
