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
 * 定义菜单树节点
 */
import * as vscode from 'vscode';
export class ToolItemNode extends vscode.TreeItem {
    public children: ToolItemNode[] | undefined;
    public module: string;
    public extInfo: any;
    public id: string;
    constructor(nodeInfo: any, children?: ToolItemNode[] | undefined) {
        super(nodeInfo.lable, children === undefined ? vscode.TreeItemCollapsibleState.None :
            (children.length === 1 && children[0].id.indexOf('Nodata') > -1 ?
            vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded));
        this.id = nodeInfo.id;
        this.module = nodeInfo.module;
        this.label = nodeInfo.label;
        this.iconPath = nodeInfo.iconPath;
        if (typeof (children) !== 'undefined') {
            this.children = children;
        }
        this.contextValue = nodeInfo.contextValue;

        this.extInfo = nodeInfo.extInfo;

        this.command = {
            title: nodeInfo.label,          // 标题
            command: 'itemclick',       // 命令 ID
            tooltip: this.label,        // 鼠标覆盖时的小小提示框
            arguments: [this.label, this.id, this.module, this.contextValue, this.extInfo]    // 向 registerCommand 传递的参数。
        };
    }

    /**
     * 将报告id格式化
     * @param reportId 报告id
     */
    public static formatCreatedId(reportId: string) {
        const years = reportId.slice(0, 4);
        const months = reportId.slice(4, 6);
        const days = reportId.slice(6, 8);
        const hours = reportId.slice(8, 10);
        const minutes = reportId.slice(10, 12);
        const seconds = reportId.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }
}
