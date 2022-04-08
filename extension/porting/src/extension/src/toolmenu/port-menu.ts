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
import { PortingMenuDataProvider } from './port-menu-provider';
import { Utils } from '../utils';

/**
 * 创建porting工具菜单树
 */
export class PortMenu {
    private static instance: PortingMenuDataProvider;

    /**
     * 获取porting菜单实例
     */
    public static getInstance(): PortingMenuDataProvider {
        return PortMenu.instance;
    }

    /**
     * 初始化porting菜单
     * @param context 插件上下文
     */
    public static init(context: vscode.ExtensionContext) {
        if (null == PortMenu.instance) {
            PortMenu.instance = new PortingMenuDataProvider(context);
            vscode.window.createTreeView('portingTools', {
                treeDataProvider: PortMenu.instance
            });
        }

        // 如树为空，则展示welcome内容,根据是否配置服务器和是否登录决定welcome的内容
        this.showViewWelcom(context);
    }

    private static showViewWelcom(context: vscode.ExtensionContext) {

        vscode.commands.executeCommand('setContext', 'isportconfigured', Utils.isPortServerConfigured(context));

        /**
         * 设置portipconfig是为了解决已经配置了ip，但首次打开插件的时候会先显示配置服务器，再显示登录的情况。
         * 类似于异步处理，等获取到ip状态之后再显示左侧按钮
         */
        const ip = context.globalState.get('portingIp');
        if (ip == null) {
            // portipconfig字段名不能与性能分析插件相同，否则会引起冲突导致左侧栏空白
            vscode.commands.executeCommand('setContext', 'portipconfig', true);
        }
        vscode.commands.executeCommand('setContext', 'isportlogined', Utils.isPortLogin(context));
        vscode.commands.executeCommand('setContext', 'isZhCn', vscode.env.language === 'zh-cn');
    }
}
