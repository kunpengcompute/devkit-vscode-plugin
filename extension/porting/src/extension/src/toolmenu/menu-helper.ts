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

import { ToolItemNode } from './tree-node';
import { Utils } from '../utils';
import * as constant from '../constant';
import * as vscode from 'vscode';
import { PortMenu } from './port-menu';

export class MenuHelper {
    private static REPORT_ID_RADIX = 10;
    /**
     * 获取历史重构软件包
     * @param context 插件上下文
     */
    public static async getPkgRebuildHis(context: vscode.ExtensionContext, childrenParam: any): Promise<Array<ToolItemNode>> {
        const pkgList: Array<ToolItemNode> = [];
        const option = {
            url: '/portadv/autopack/history/',
            method: 'GET'
        };
        // 获取已存在的工程
        const response: any = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
        if (response && response.data) {
            // 0x010599 历史报告已达到最大阈值
            if (constant.STATUS_SUCCESS === response.status || '0x010599' === response.realStatus) {
                const taskList = response.data.tasklist;
                let temp: ToolItemNode;
                if (taskList.length > 0) {
                    // 获取到之后报告之后先排序
                    let reportListTemp = response.data.tasklist;
                    reportListTemp = reportListTemp.sort((report1: any, report2: any) => {
                        return parseInt(report2.path, MenuHelper.REPORT_ID_RADIX)
                            - parseInt(report1.path, MenuHelper.REPORT_ID_RADIX);
                    });
                    for (const task of reportListTemp) {
                        const nodeInfo = {
                            status: task.status,  // 0：重构成功，1：重构失败
                            label: task.name + ' (' + task.create_time + ')',
                            id: task.path,
                            module: constant.TOOL_NAME_SOFTWARE_PACKAGE,
                            contextValue: task.status === 0 ? constant.CONTEXT_VALUES.pkgRebuildS : constant.CONTEXT_VALUES.pkgRebuildF,
                            iconPath: childrenParam.iconPath(context, task),
                            collapsibleState: vscode.TreeItemCollapsibleState.None,
                            extInfo: task
                        };
                        temp = new ToolItemNode(nodeInfo);
                        pkgList.push(temp);
                    }
                }
            }
        }
        return pkgList;
    }

    /**
     * 获取重构软件包展示图标
     * @param context 插件上下文
     * @param pkg 软件包信息
     */
    public static getPkgRebuildIcon(context: vscode.ExtensionContext, pkg: any) {
        let iconPath = 'package.svg';
        if (pkg.status === 1) {
            iconPath = 'pkg-rebuild-fail.svg';
        }
        return Utils.getExtensionFileAbsolutePath(context,
            Utils.getCurrentPicPath() + iconPath);
    }

    /**
     * 获取64位预检报告
     */
    public static getPreCheckNodes() {
        const preCheckNodeList: Array<ToolItemNode> = [];
        for (const path of PortMenu.getInstance().pathList) {
            const subInfo = {
                label: path,
                id: path,
                module: constant.TOOL_NAME_PORTING,
                contextValue: constant.CONTEXT_VALUES.preCheckDetail,
            };
            preCheckNodeList.push(new ToolItemNode(subInfo));
        }
        return preCheckNodeList;
    }
}
