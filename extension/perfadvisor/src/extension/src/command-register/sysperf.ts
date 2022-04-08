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
import { SysperfCommandCallback } from '../command-callback/sysperf';

export class SysperfCommandRegister {

    static readonly commands = [
        { command: 'extension.view.linkage.createTask', callback: 'createLinkageTask' },
        { command: 'extension.view.linkage.viewTask', callback: 'viewLinkageTask' },
        { command: 'extension.view.linkage.deleteTask', callback: 'deleteLinkageTask' },
    ];

    /**
     * 注册命令
     */
    public static register(context: vscode.ExtensionContext) {
        this.commands.forEach(({ command, callback }) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(command, (treeNode) => {
                    SysperfCommandCallback[callback]?.apply(SysperfCommandCallback, [context, treeNode, command]);
                })
            );
        });
    }

}
