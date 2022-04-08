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
import { MenuDataProvider } from './menu-provider';
import { ToolItemNode } from './tree-node';
import * as constant from '../constant';
import { ReportHelper } from '../report-helper';
import { Utils } from '../utils';
import { I18nService } from '../i18nservice';
import { PORTING_ROOT_NODE_ID } from '../constant';
import { LoginManager } from '../login-manager';

const PORTING_TREE_ROOT_NODES_NAMES = {
    portingAppraise: I18nService.I18n().plugins_port_migration_appraise,
    sourPorting: I18nService.I18n().port_source_migrate,
    softBuild: I18nService.I18n().port_software_build,
    softPorting: I18nService.I18n().port_software_migration,
    portingPrecheck: I18nService.I18n().plugins_porting_enhance_function_label
};

/**
 * Porting 工具菜单树数据提供类
 */
export class PortingMenuDataProvider extends MenuDataProvider {

    public pathList = [];

    /**
     * 获取子节点
     * @param element 当前节点
     */
    async getChildren(element?: ToolItemNode | undefined): Promise<ToolItemNode[]> {
        let treeNodeList: Array<ToolItemNode> = [];
        if (typeof (element) === 'undefined') {
            if (Utils.isPortServerConfigured(this.context) && Utils.isPortLogin(this.context) && !LoginManager.isRidrect) {
                for (const node of constant.PORTING_MENU_PARAM) {
                    const nodeInfo = {
                        label: node.label,
                        id: node.id,
                        module: constant.TOOL_NAME_PORTING,
                        contextValue: node.contextValue,
                    };
                    let children: Array<ToolItemNode> = [];
                    if (node.getChildren) {
                        children = await node.getChildren(this.context, node.childrenParam);
                    }
                    if (node.extHandler) {
                        node.extHandler(children);
                    }

                    if (children.length === 0) {
                        // 如果软件迁移评估&源码迁移&软件包重构报告数量为0，展示暂无历史报告，请新建分析任务。
                        if (node.id === PORTING_ROOT_NODE_ID.MIG_APPRAISE ||
                            node.id === PORTING_ROOT_NODE_ID.SRC_PORTING ||
                            node.id === PORTING_ROOT_NODE_ID.PKG_REBUILD) {
                            const noReportInfo = new ToolItemNode({
                                label: I18nService.I18n().plugins_common_title_noData,
                                id: `${node.id}Nodata`,
                                module: constant.TOOL_NAME_PORTING,
                                contextValue: ''
                            });
                            noReportInfo.command = undefined;
                            children.push(noReportInfo);
                            treeNodeList.push(new ToolItemNode(nodeInfo, children));
                        } else {
                            treeNodeList.push(new ToolItemNode(nodeInfo));
                        }
                    } else {
                        treeNodeList.push(new ToolItemNode(nodeInfo, children));
                    }
                }
            }
        } else {
            if (typeof (element.children) !== 'undefined') {
                treeNodeList = element.children;
            }
        }
        return Promise.resolve(treeNodeList);
    }
}
