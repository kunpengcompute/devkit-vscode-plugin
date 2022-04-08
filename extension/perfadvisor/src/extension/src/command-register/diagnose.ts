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
import { DiagnoseCommandCallback } from '../command-callback/diagnose';

export class DiagnoseCommandRegister {

    static readonly commands = [
        { command: 'extension.view.diagnose.viewProject', callback: 'viewProject' },
        { command: 'extension.view.diagnose.viewTask', callback: 'viewTask' },
        // extension.view.sysPerfCreateProject
        { command: 'extension.view.diagnose.createProject', callback: 'createProject' },
        // extension.view.sysPerfModifyProject
        { command: 'extension.view.diagnose.modifyProject', callback: 'modifyProject' },
        // extension.view.sysPerfDeleteProject
        { command: 'extension.view.diagnose.deleteProject', callback: 'deleteProject' },
        // extension.view.sysPerfImportTask
        { command: 'extension.view.diagnose.importTask', callback: 'importTask' },
        // extension.view.sysPerfExportTask
        { command: 'extension.view.diagnose.exportTask', callback: 'exportTask' },
        // extension.view.sysPerfCreateTask
        { command: 'extension.view.diagnose.createTask', callback: 'createTask' },
        // extension.view.sysPerfModifyTask
        { command: 'extension.view.diagnose.modifyTask', callback: 'modifyTask' },
        // extension.view.sysPerfDeleteTask
        { command: 'extension.view.diagnose.deleteTask', callback: 'deleteTask' },
        // extension.view.sysPerfRunTask
        { command: 'extension.view.diagnose.runTask', callback: 'runTask' },
        // extension.view.sysPerfStopTask
        { command: 'extension.view.diagnose.stopTask', callback: 'stopTask' },
        // extension.view.sysPerfReanalysisTask
        { command: 'extension.view.diagnose.reanalysisTask', callback: 'reanalysisTask' },
        // extension.view.perfNodesManagement
        { command: 'extension.view.diagnose.nodesManagement', callback: 'openSetting' },
        // extension.view.perfReservationTaskManagement
        { command: 'extension.view.diagnose.reservationTaskManagement', callback: 'openSetting' },
        // extension.view.sysPerfImportAndExportTask
        { command: 'extension.view.diagnose.importAndExportTask', callback: 'openSetting' },
        // extension.view.perfTaskTemplateManagement
        { command: 'extension.view.diagnose.taskTempManagement', callback: 'openSetting' },
        // extension.view.sysPerfPath
        { command: 'extension.view.diagnose.settings', callback: 'openSetting' },
        // extension.view.sysPerfOperationLog
        { command: 'extension.view.diagnose.operationLog', callback: 'openSetting' },
        // extension.view.perfLog
        { command: 'extension.view.diagnose.log', callback: 'openSetting' },
        // extension.view.agentServerCert
        { command: 'extension.view.diagnose.agentServerCert', callback: 'openSetting' },
    ];

    /**
     * 注册命令
     */
    public static register(context: vscode.ExtensionContext) {
        this.commands.forEach(({ command, callback }) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(command, (treeNode) => {
                    DiagnoseCommandCallback[callback]?.apply(DiagnoseCommandCallback, [context, treeNode, command]);
                })
            );
        });
    }

}
