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
import { TuningAssistantCommandCallback } from '../command-callback/tuning-assistant';

export class TuningAssistantCommandRegister {

    static readonly commands = [
        { command: 'extension.view.tuningAssistant.createProject', callback: 'createProject' },
        { command: 'extension.view.tuningAssistant.deleteProject', callback: 'deleteProject' },
        { command: 'extension.view.tuningAssistant.viewTask', callback: 'viewTask' },
        { command: 'extension.view.tuningAssistant.createTask', callback: 'createTask' },
        { command: 'extension.view.tuningAssistant.reanalyzeTask', callback: 'reanalyzeTask'},
        { command: 'extension.view.tuningAssistant.associationTask', callback: 'associationTask'},
        { command: 'extension.view.tuningAssistant.deleteTask', callback: 'deleteTask'},
        { command: 'extension.view.tuningAssistant.stopTask', callback: 'stopTask'},
        { command: 'extension.view.tuningAssistant.reanalyzeNode', callback: 'reanalyzeNode'},
        { command: 'extension.view.tuningAssistant.associationNode', callback: 'associationNode'},
        { command: 'extension.view.tuningAssistant.viewTaskInfoAndLog', callback: 'viewTaskInfoAndLog' },
        { command: 'extension.view.tuningAssistant.nodesManagement', callback: 'openSetting' },
        { command: 'extension.view.tuningAssistant.agentServerCert', callback: 'openSetting' },
        { command: 'extension.view.tuningAssistant.settings', callback: 'openSetting' },
        { command: 'extension.view.tuningAssistant.log', callback: 'openSetting' },
        { command: 'extension.view.tuningAssistant.operationLog', callback: 'openSetting' },
        { command: 'extension.view.tuningAssistant.viewCompareTask', callback: 'viewCompareTask' },
        { command: 'extension.view.compare.createTask', callback: 'createCompareTask' },
        { command: 'extension.view.compare.deleteTask', callback: 'deleteCompareTask' },
    ];

    /**
     * 注册命令
     */
    public static register(context: vscode.ExtensionContext) {
        this.commands.forEach(({ command, callback }) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(command, (treeNode) => {
                    TuningAssistantCommandCallback[callback]?.apply(TuningAssistantCommandCallback, [context, treeNode, command]);
                })
            );
        });
    }

}
