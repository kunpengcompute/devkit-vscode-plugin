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
import { PerfMenu } from './toolmenu/perf-menu';
import { I18nService } from './i18nservice';
import { LogManager, LOG_LEVEL } from './log-manager';
import { getPwd, savaData } from './crypto';
const i18n = I18nService.I18n();
const cp = require('child_process');

/**
 * 证书状态
 */
const enum CERT_STATE {
    STATE_VALID = '0',
    STATE_EXPIRING = '1',
    STATE_EXPIRED = '2',
    STATE_NOCERT = '-1'
}
/**
 * 磁盘、工作空间告警阈值
 */
const enum ALARM_THRESHOLD {
    INFO_CANCLE = 0.75,
    INFO = 0.8,
    WARNING = 0.9
}

export class LoginManager {

    public static loginManagerStatusList: any = {};
    public static discIterval: any;

    /**
     * 处理登录时相关逻辑
     */
    public static loginProcess(context: vscode.ExtensionContext, req: any, body: any, module: string, token: any) {
        if (req.method === 'POST') {
            LoginManager.loginInProcess(context, body, module, token);
        } else {
            LoginManager.loginOutProcess(context, module);
        }
    }

    /**
     * 更新 session 信息到全局变量中
     */
    public static loginInProcess(context: vscode.ExtensionContext, body: any, module: string, token: any) {
        const webviewSession: any = {
            role: constant.ABNORMAL_INIT_VALUE.ABNORMAL_STRING,
            username: constant.ABNORMAL_INIT_VALUE.ABNORMAL_STRING,
            loginId: constant.ABNORMAL_INIT_VALUE.ABNORMAL_NUMBER,
            isFirst: constant.ABNORMAL_INIT_VALUE.ABNORMAL_NUMBER,
            language: vscode.env.language,
            token
        };

        // 成功登录
        if (Utils.strAContainStrB(body.code, constant.HTTP_STATUS_CODE.USERMANAGE_SUCCESS)) {
            webviewSession.isFirst = constant.USER_FIRST_LOGIN.IS_NO_FIRST_LOGIN;
        } else if (Utils.strAContainStrB(body.code, constant.HTTP_STATUS_CODE.USERMANAGE_FIRST_LOGIN)) {
            // 第一次登录，为修改初始密码
            webviewSession.isFirst = constant.USER_FIRST_LOGIN.IS_FIRST_LOGIN;
        }

        // 更新webviewSession
        if (body?.data) {
            webviewSession.role = body.data.role;
            webviewSession.username = body.data.username;
            webviewSession.loginId = body.data.id;
        }

        context.globalState.update(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session', webviewSession);
        context.globalState.update(constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR + 'Session', webviewSession);
        context.globalState.update('checkInstallType', false);
        context.globalState.update('closeShowErrorMessage', false);
        context.globalState.update('showWorkSpaceAlarm', false);
        context.globalState.update('showWorkSpaceTip', false);
        context.globalState.update('showDiskSpaceAlarm', false);
        context.globalState.update('showDiskSpaceTip', false);
        context.globalState.update('alarmType', '');
        LoginManager.loginManagerStatusList.context = context;
    }

    /**
     * 登录成功后处理
     */
    public static loginInSuccess(context: vscode.ExtensionContext) {
        return new Promise(async (resolve, reject) => {
            // 版本校验
            LoginManager.checkVersion(context);

            // 证书校验
            LoginManager.checkCert(context);

            await LoginManager.checkInstall(context);

            // 登录成功之后跳转到了扫描主界面，需要刷新左侧树和更新panel信息
            // view上的按钮从隐藏变成可见
            vscode.commands.executeCommand('setContext', 'isPerfadvisorLogined', Utils.isSysPerfLogin(context));

            // view上菜单，admin和普通用户的菜单不同
            vscode.commands.executeCommand('setContext', 'isAdmin', Utils.isAdmin(context));

            // 刷新左侧树
            PerfMenu.updataTree(context);

            // 创建定时刷新左侧树任务
            PerfMenu.createTimedUpdataTree(context, 10000);

            // 后端仅安装sys或全部安装时，创建定时任务监控磁盘空间
            const installType: any = context.globalState.get('installType');
            if (Utils.strAContainStrB(installType, 'sys') || Utils.strAContainStrB(installType, 'all')) {
                LoginManager.discIterval = setInterval(() => {
                    LoginManager.getDiscAlarm(context);
                }, 6000);
            }

            resolve(true);
        });
    }

    /**
     * 首次登录但未修改密码
     */
    public static firstLoginNoModefyPasswd() {
        if (!LoginManager.loginManagerStatusList?.context?.globalState) {
            return;
        }
        const session: any = LoginManager.loginManagerStatusList.context.globalState.get(
            constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');
        if (session?.isFirst === constant.USER_FIRST_LOGIN.IS_FIRST_LOGIN) {
            LoginManager.loginOutProcess(LoginManager.loginManagerStatusList.context, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
            // 重定向之前清空之前登录的session
            LoginManager.clearCacheAllModule(LoginManager.loginManagerStatusList.setContext);

            // 关闭当前所有的panel
            ToolPanelManager.closeAllPanels();
        }
    }

    /**
     * 清除全局变量中的 session 信息
     */
    public static loginOutProcess(context: vscode.ExtensionContext, module: string) {
        // 关闭当前所有的panel
        ToolPanelManager.closeAllPanels();

        // 清空缓存
        LoginManager.clearCacheAllModule(context);

        // 清除定时刷新
        PerfMenu.deleteTimedUpdataTree();

        // 延迟刷新导航树
        setTimeout(() => {
            PerfMenu.updataTree(context);
        }, 1000);
    }

    /**
     * 清空指定module缓存
     *
     * @param context 插件上下文
     * @param module 模块
     */
    public static clearCache(context: vscode.ExtensionContext, module: string) {
        context.globalState.update(module + 'Token', null);
        context.globalState.update(module + 'Session', null);
        context.globalState.update(module + 'uploadProcessFlag', 0);
        vscode.commands.executeCommand('setContext', 'isPerfadvisorLogined', false);
        vscode.commands.executeCommand('setContext', 'ipconfig', false);
        vscode.commands.executeCommand('setContext', 'isPerfadvisorConfigured', true);
    }

    /**
     * 清空所有module缓存
     *
     * @param context 插件上下文
     * @param module 模块
     */
    public static clearCacheAllModule(context: vscode.ExtensionContext) {
        LoginManager.clearCache(context, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        LoginManager.clearCache(context, constant.PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR);
    }

    /**
     * session超时重定向到登录，或密码错误
     *
     * @param context 插件上下文
     * @param module 模块
     */
    public static redirectToLogin(context: vscode.ExtensionContext, module: string) {
        // 重定向之前清空之前登录的session
        LoginManager.loginOutProcess(context, module);

        // 打开登录
        ToolPanelManager.openPerfLoginPanel(context, 'login');
    }

    /**
     * 退出当前登录用户
     * @param context 插件上下文
     * @param module 模块
     */
    public static async logOutCurrentUser(context: vscode.ExtensionContext, module: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

                // 调用登出接口
                const option = {
                    url: '/users/session/'.concat(encodeURIComponent(session.loginId)).concat('/'),
                    method: 'DELETE',
                    subModule: constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
                };
                const resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
                if (resp.code === constant.HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                    vscode.window.showInformationMessage(i18n.plugins_sysperf_message_logout_ok);
                    LoginManager.loginOutProcess(context, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
                }
                resolve(true);
            } catch (error) {
                LogManager.log(context, 'logOutCurrentUser error.', module, LOG_LEVEL.ERROR);
            }
        });
    }

    /**
     * 证书校验
     * @param context 上下文
     */
    public static async checkCert(context: vscode.ExtensionContext) {
        const option = {
            url: '/certificates/',
            method: 'GET',
            subModule: constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (resp.code === constant.HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
            const cert = resp.data[0];
            const status = cert.certStatus;
            let warnMsg = '';
            let showWarnMsg = false;
            switch (status) {
                case CERT_STATE.STATE_EXPIRED:
                    warnMsg = i18n.plugins_perf_cert_expired;
                    showWarnMsg = true;
                    break;
                case CERT_STATE.STATE_EXPIRING:
                    const validTime = cert.expireDate;
                    warnMsg = I18nService.I18nReplace(i18n.plugins_perf_cert_expiring, { 0: validTime });
                    showWarnMsg = true;
                    break;
                case CERT_STATE.STATE_NOCERT:
                    warnMsg = i18n.plugins_perf_cert_none;
                    showWarnMsg = true;
                    break;
                default:
                    showWarnMsg = false;
                    break;
            }
            if (showWarnMsg) {
                vscode.window.showWarningMessage(warnMsg);
            }
        }
    }

    /**
     * 版本校验
     * @param context 上下文
     */
    public static async checkVersion(context: vscode.ExtensionContext) {
        const toolVersions = Utils.getConfigJson(context).sysPerfVersion;
        const option = {
            url: '/users/version/',
            method: 'GET',
            subModule: constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        if (!toolVersions.includes(resp.data.version)) {
            const warnMsg = I18nService.I18nReplace(i18n.plugins_perf_message_versionCompatibility, {
                0: toolVersions,
                1: resp.data.version
            });
            vscode.window.showWarningMessage(warnMsg);
        }
    }

    /**
     * 已安装工具安装检查
     */
    public static async checkInstall(context: vscode.ExtensionContext) {
        return new Promise(async (resolve, reject) => {
            const option = {
                url: '/users/install-info/',
                method: 'GET',
                subModule: constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
            };
            try {
                const resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
                if (resp && resp.code === constant.HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                    // 更新当前系统里面已安装的工具， all/java/sys
                    context.globalState.update('installType', resp.data.data);
                } else {
                    context.globalState.update('installType', null);
                }

                resolve(true);
            } catch (error) {
                context.globalState.update('installType', null);
                LogManager.log(context, 'checkInstall error.', constant.TOOL_NAME_PERF, LOG_LEVEL.ERROR);
            }
        });
    }

    /**
     * 自动登录加解密
     * @param global  插件上下文
     * @param message 传入信息
     */
    public static async loginRememberPwd(context: vscode.ExtensionContext, message: any) {
        return new Promise((resolve, reject) => {
            const json = Utils.getConfigJson(context);
            // 加密
            if (message.encrypt) {
                savaData(message.username, message.pwd, json.sysPerfConfig[0].ip);
            } else { // 解密
                getPwd(message.username, json.sysPerfConfig[0].ip, pwd => {
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
            url: '/users/session/',
            params: {
                username: context.globalState.get('autoLoginUser'),
                password: loginPwd
            },
            subModule: constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
            method: 'POST'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_USER_MANAGEMENT);

        if (resp && resp.code === constant.HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {

            LoginManager.loginInSuccess(context);

            // 打开主页面
            ToolPanelManager.openMainHomePanel(context);

            context.globalState.update(constant.TOOL_NAME_PORTING + 'autoLoginFlag', 0);
            LogManager.log(context, 'User automatically logged in successfully ',
                constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.INFO);
        }
    }

    /**
     * 用户自动登录
     * @param context 上下文
     */
    public static autoLogIn(context: vscode.ExtensionContext) {
        if (context.globalState.get('autoLoginConfig')) {
            LoginManager.autoLogin(context);
        }
    }
    /**
     * 磁盘监控
     * @param context 上下文
     */
    public static async getDiscAlarm(context: vscode.ExtensionContext) {
        const option = {
            url: '/projects/1/alarm/?auto-flag=on&date=' + Date.now(),
            method: 'GET'
        };
        const resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
        // 计算使用率（被除数判断非0）
        let workspaceUsage = 0;
        if (resp.data.data.total) {
            workspaceUsage = (resp.data.data.total - resp.data.data.free) / resp.data.data.total;
        }
        let diskspaceUsage = 0;
        if (resp.data.data_all.total) {
            diskspaceUsage = (resp.data.data_all.total - resp.data.data_all.free) / resp.data.data_all.total;
        }
        let alarmType = '';
        // 工作空间
        if (resp.data.data.alarm !== 'Normal') {
            let tipInfo = i18n.plugins_sysperf_disk_message.spaceTip;
            if (resp.data.data.free > resp.data.data.suggest_space) {
                tipInfo = i18n.plugins_sysperf_disk_message.space;
            }
            tipInfo = I18nService.I18nReplace(tipInfo, {
                0: resp.data.data.total,
                1: resp.data.data.free,
                2: resp.data.data.suggest_space
            });
            // 工作空间使用率告警弹窗:工作空间使用率大于90% && 磁盘空间使用率小于等于90%
            if (workspaceUsage > ALARM_THRESHOLD.WARNING) {
                if (diskspaceUsage <= ALARM_THRESHOLD.WARNING) {
                    alarmType = 'workspace';
                    LoginManager.handleSpaceOperate(context, 'showWorkSpaceAlarm', 'warn', tipInfo);
                }
            } else if (workspaceUsage > ALARM_THRESHOLD.INFO_CANCLE) {
                // 工作空间使用率提示弹窗:增加到大于80%小于等于90%出现 || 从大于90%减少到大于75%时出现
                const addWorkspaceInfo = workspaceUsage > ALARM_THRESHOLD.INFO && !context.globalState.get('showWorkSpaceAlarm');
                const reduceWorkspaceInfo = context.globalState.get('showWorkSpaceAlarm');
                if (addWorkspaceInfo || reduceWorkspaceInfo) {
                    LoginManager.handleSpaceOperate(context, 'showWorkSpaceTip', 'info', tipInfo);
                }
            }
        }
        // 磁盘空间
        if (resp.data.data_all.alarm !== 'Normal') {
            let tipInfo = i18n.plugins_sysperf_disk_message.diskTip;
            if (resp.data.data_all.free > resp.data.data_all.suggest_space) {
                tipInfo = i18n.plugins_sysperf_disk_message.disk;
            }
            tipInfo = I18nService.I18nReplace(tipInfo, {
                0: resp.data.data_all.total,
                1: resp.data.data_all.free,
                2: resp.data.data_all.suggest_space
            });
            if (diskspaceUsage > ALARM_THRESHOLD.WARNING) {
                alarmType = 'diskSpace';
                LoginManager.handleSpaceOperate(context, 'showDiskSpaceAlarm', 'warn', tipInfo);
            } else if (diskspaceUsage > ALARM_THRESHOLD.INFO_CANCLE) {
                if ( workspaceUsage <= ALARM_THRESHOLD.WARNING) {
                    // 磁盘空间使用率提示弹窗:增加到大于80%小于等于90%出现 || 从大于90%减少到大于75%时出现 && 工作空间使用率小于等于90%
                    const addDiskspaceInfo = diskspaceUsage > ALARM_THRESHOLD.INFO && !context.globalState.get('showDiskSpaceAlarm');
                    const reduceDiskspaceInfo = context.globalState.get('showDiskSpaceAlarm');
                    if (addDiskspaceInfo || reduceDiskspaceInfo) {
                        LoginManager.handleSpaceOperate(context, 'showDiskSpaceTip', 'info', tipInfo);
                    }
                }
            }
        }
        // 磁盘空间或工作空间告警时禁用在线分析和采样分析
        const data = {
            value: alarmType ? true : false,
            type: alarmType
        };
        context.globalState.update('alarmType', alarmType);
        ToolPanelManager.javaPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({
                cmd: 'handleVscodeMsg',
                type: 'spaceAlarm',
                data
            });
        });
        ToolPanelManager.sysPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({
                cmd: 'handleVscodeMsg',
                type: 'memoryInfo',
                data: resp.data.agent_alarm_data
            });
        });
    }
    /**
     * 工作空间、磁盘弹窗
     * @param context 上下文
     * @param name 工作空间或磁盘空间
     * @param type 弹窗类型
     * @param info 弹窗内容
     */
    public static handleSpaceOperate(context: vscode.ExtensionContext, name: any, type: any, info: any) {
        if (!context.globalState.get(name)) {
            context.globalState.update(name, true);
            if (type === 'info') {
                vscode.window.showInformationMessage(info);
            } else {
                vscode.window.showWarningMessage(info);
            }
        }
    }
}
