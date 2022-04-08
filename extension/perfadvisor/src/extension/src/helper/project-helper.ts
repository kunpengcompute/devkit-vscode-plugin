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
import { Utils } from '../utils';
import * as constant from '../constant';
import { PerfMenu } from '../toolmenu/perf-menu';
import { ToolPanelManager } from '../panel-manager';
import { I18nService } from '../i18nservice';
import { LogManager, LOG_LEVEL } from '../log-manager';

const i18n = I18nService.I18n();
/**
 * 工程project信息处理类
 */
export class ProjectHelper {

    /**
     * 删除工程
     *
     * @param projectName 用来标识打开的功能
     * @param context 插件上下文
     */
    public static async deleteProject(projectName: string | undefined, context: vscode.ExtensionContext, projectId: any) {
        const session: any = context.globalState.get(constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR + 'Session');

        // 校验project信息
        let option = {
            url: '/schedule-tasks/?project-id='.concat(projectId),
            method: 'GET',
        };
        let resp: any = await Utils.requestDataHelper(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

        // 校验project信息无误后调用删除接口
        if (resp.code === constant.HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
            vscode.window.showWarningMessage(
                I18nService.I18nReplace(i18n.plugins_sysperf_deleteProject_confirm, { 0: projectName }),
                i18n.plugins_sysperf_button_confirm, i18n.plugins_sysperf_button_cancel)
                .then(async select => {
                    if (select === i18n.plugins_sysperf_button_confirm) {
                        try {
                            // 调用删除工程接口
                            option = {
                                url: '/projects/'.concat(projectId).concat('/'),
                                method: 'DELETE',
                            };
                            resp = await Utils.requestData(context, option, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);

                            if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
                                // 刷新左侧树
                                PerfMenu.updataTree(context);

                                // 关闭该项目下所有打开面板
                                ProjectHelper.closeProjectRelatedPinal(projectName);
                                Utils.showMessageByType(constant.MESSAGE_TYPE.INFO,
                                    { info: I18nService.I18nReplace(i18n.plugins_sysperf_deleteProject, { 0: projectName }) }, true);
                            } else if (resp.status === constant.HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: resp.data.message }, true);
                            } else if (resp.status === constant.HTTP_STATUS.HTTP_409_CONFLICT) {
                                Utils.showMessageByType(constant.MESSAGE_TYPE.WARNING, { info: resp.data.message }, true);
                            }

                        } catch (error) {
                            LogManager.log(context, 'deleteProject error.',
                                constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR, LOG_LEVEL.ERROR);
                        }
                    }
                });
        }
    }

    /**
     * 关闭该项目下所有打开面板
     * @param projectName 项目名称
     */
    private static closeProjectRelatedPinal(projectName: string | undefined) {
        const deletePanleIds: Array<string> = [];

        // 获取需要关闭的panelid列表
        ToolPanelManager.sysPerfToolPanels.forEach(element => {
            if (element.getPanelId().startsWith(projectName + '-')) {
                deletePanleIds.push(element.getPanelId());
            }
        });

        // 关闭面板
        ToolPanelManager.closePanel(deletePanleIds, constant.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR);
    }

}
