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
import { PerfMenuDataProvider } from './perf-menu-provider';
import { Utils } from '../utils';
import { ToolPanelManager } from '../panel-manager';
import { LoginManager } from '../login-manager';

/**
 * 创建Perf工具菜单树
 */
export class PerfMenu {
    private static instance: PerfMenuDataProvider;
    private static treeInterval: NodeJS.Timeout;

    /**
     * 获取Perf菜单实例
     */
    public static getInstance(): PerfMenuDataProvider {
        return PerfMenu.instance;
    }

    /**
     * 初始化Perf菜单
     * @param context 插件上下文
     */
    public static init(context: vscode.ExtensionContext) {
        if (null == PerfMenu.instance) {
            PerfMenu.instance = new PerfMenuDataProvider(context);
            vscode.window.createTreeView('perfadvisorTools', {
                treeDataProvider: PerfMenu.instance
            });
        }

        // 如树为空，则展示welcome内容,根据是否配置服务器和是否登录决定welcome的内容
        this.showViewWelcom(context);
    }

    private static showViewWelcom(context: vscode.ExtensionContext) {

        vscode.commands.executeCommand('setContext', 'isPerfadvisorConfigured', Utils.isPerfadvisorServerConfigured(context));
        const ip = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Ip');
        if (ip == null) {
            vscode.commands.executeCommand('setContext', 'ipconfig', true);
        }
        vscode.commands.executeCommand('setContext', 'isPerfadvisorLogined', Utils.isSysPerfLogin(context));
    }

    /**
     * 创建定时刷新左侧树任务
     * @param context 插件上下文
     * @param IntervalMs 刷新间隔时长
     */
    public static createTimedUpdataTree(context: vscode.ExtensionContext, IntervalMs: number) {
        if (PerfMenu.treeInterval) {
            clearInterval(PerfMenu.treeInterval);
        }
        PerfMenu.treeInterval = setInterval(() => {
            if (Utils.isPerfadvisorServerConfigured(context) && Utils.isSysPerfLogin(context)) {
                PerfMenu.updataTree(context);
                PerfMenu.onFocusWebviewPostNoticeWithUpdatePage();
            }
        }, IntervalMs);

    }

    /**
     * 删除定时刷新左侧树任务
     */
    public static deleteTimedUpdataTree() {
        if (PerfMenu.treeInterval) {
            clearInterval(PerfMenu.treeInterval);
        }
        // 清除磁盘监控定时器
        if (LoginManager.discIterval) {
            clearInterval(LoginManager.discIterval);
        }
    }

    /**
     * 刷新左侧树
     * @param context 插件上下文
     */
    public static async updataTree(context: vscode.ExtensionContext) {
        // 刷新树的根节点信息
        const needUpdateTree = await PerfMenu.updatePerfRootNodeIDS(context);
        // 刷新左侧树
        if (needUpdateTree) {
            PerfMenu.getInstance().refresh();
        }
    }

    /**
     * 更新树的根节点信息
     */
    private static async updatePerfRootNodeIDS(context: vscode.ExtensionContext) {
        return new Promise((resolve, reject) => {
            const installType: any = context.globalState.get('installType');
            if (!installType) {
                // 从系统服务中未读取到已安装的工具信息，或查询改服务失败（后端服务错误或后端已手动卸载）
                vscode.commands.executeCommand('setContext', 'isPerfadvisorConfigured', false);
                vscode.commands.executeCommand('setContext', 'isPerfadvisorLogined', false);
                vscode.commands.executeCommand('setContext', 'ipconfig', true);
            }

            PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS = [];
            if (Utils.strAContainStrB(installType, 'sys')) {
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.sysPerf);
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.diagnose);
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.tuningAssistant);
            } else if (Utils.strAContainStrB(installType, 'java')) {
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.javaPerf);
            } else if (Utils.strAContainStrB(installType, 'all')) {
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.sysPerf);
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.javaPerf);
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.diagnose);
                PerfMenuDataProvider.PERF_TREE_ROOT_NODES_IDS.push(constant.PERF_TREE_ROOT_NODES_IDS.tuningAssistant);
            }

            resolve(true);
        });
    }

    /**
     * 向webview当前展示界面发送通知更新页面数据
     */
    public static onFocusWebviewPostNoticeWithUpdatePage() {
        for (const toolPanel of ToolPanelManager.sysPerfToolPanels) {
            if (toolPanel.getNeedAsycnUpdate() && toolPanel.getPanel().active) {
                const message = {
                    value: '',
                    type: ['nodeManager', 'taskTemplateManager', 'appointTaskManager', 'createProject', 'updateMenu']
                };
                ToolPanelManager.sentMessageToPanel(toolPanel, null, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, message);
            }
        }

        ToolPanelManager.javaPerfToolPanels.forEach((panel) => {
            panel.getPanel().webview.postMessage({ cmd: 'handleVscodeMsg', type: 'updateMenu', data: {} });
        });
    }
}
