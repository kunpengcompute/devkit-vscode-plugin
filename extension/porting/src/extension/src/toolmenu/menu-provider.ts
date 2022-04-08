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

/**
 * 工具菜单树父类
 */

import * as vscode from 'vscode';
import { ToolItemNode } from './tree-node';

export class MenuDataProvider implements vscode.TreeDataProvider<ToolItemNode> {
    context: vscode.ExtensionContext;

    private treeDataEventEmitter: vscode.EventEmitter<ToolItemNode | undefined> = new vscode.EventEmitter<ToolItemNode | undefined>();

    onDidChangeTreeData?: vscode.Event<ToolItemNode | null | undefined> = this.treeDataEventEmitter.event;

    private reportIdObj: object = {
        dep: [],  // 软件迁移报告id
        porting: [],  // 源码迁移报告id
        softwarepkg: [],  // 软件包重构报告id
    };

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * 刷新左侧panel树
     */
    refresh(): void {
        for (const key in this.reportIdObj) {
            if (Object.prototype.hasOwnProperty.call(this.reportIdObj, key)) {
                this.reportIdObj[key] = [];
            }
        }
        this.treeDataEventEmitter.fire();
    }

    /**
     * 获取子菜单
     * @param element 子菜单
     */
    getChildren(element?: ToolItemNode | undefined): vscode.ProviderResult<ToolItemNode[]> {
        const childrenNodes: Array<ToolItemNode> = [];
        return Promise.resolve(childrenNodes);
    }

    /**
     * 获取树子节点
     * @param element 子节点
     */
    getTreeItem(element: ToolItemNode): vscode.TreeItem {
        return element;
    }

    /**
     * 将获取到报告的id放入reportIds数组中，便于后续获取
     *
     * @param reportList 数据列表
     */
    setReportIds(reportList: Array<ToolItemNode>, type: string) {
        if (null != reportList && 0 !== reportList.length) {
            for (const report of reportList) {
                if (typeof (report.id) === 'string' && this.reportIdObj[type].indexOf(report.id) === -1) {
                    this.reportIdObj[type].push(report.id);
                }
            }
        }
    }

    /**
     * 获取报告ID列表
     */
    public getReportIds(type: string): Array<string> {
        return this.reportIdObj[type];
    }
}
