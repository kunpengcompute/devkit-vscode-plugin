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
import * as constant from './constant';
import { ToolPanelManager } from './panel-manager';
import { I18nService } from './i18nservice';

const i18n = I18nService.I18n();
/**
 * 错误处理类
 */
export class ErrorHelper {
    /**
     * 接口异常处理
     * @param context 插件上下文
     * @param module 模块标识
     */
    static errorHandler(context: vscode.ExtensionContext, module: string, deployIP?: string) {
        let errorMessage = i18n.plugins_common_message_responseError;
        if (deployIP !== undefined) {
            errorMessage = i18n.plugins_common_message_responseError_deployScenario;
        }
        vscode.window.showErrorMessage(errorMessage, i18n.plugins_common_button_checkErrorDetails)
            .then(async select => {
                if (select === i18n.plugins_common_button_checkErrorDetails) {
                    const serverIP = context.globalState.get('portingIp');
                    const servicePort = context.globalState.get('portingPort');
                    const session = {
                        language: vscode.env.language
                    };
                    const message = Utils.generateMessage('navigate', {
                        page: '/errorInstruction',
                        pageParams: { queryParams: { ip: serverIP, port: servicePort, deployIP } }, webSession: session
                    });
                    const panelID = constant.PANEL_ID.portErrorInstruction;
                    const panelOption = {
                        panelId: panelID,
                        viewType: constant.VIEW_TYPE.serverError,
                        viewTitle: i18n.plugins_common_title_errorInstruction,
                        module,
                        message
                    };
                    ToolPanelManager.createOrShowPanel(panelOption, context);
                }
            });
    }
}
