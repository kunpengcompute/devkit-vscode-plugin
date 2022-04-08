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

/**
 * 节点类型
 */
export enum NodeType {
    /** 工具 */
    TOOL,
    /** 系统性能分析工具的普通任务目录 */
    SYS_FOLDER_NORMAL_TASK,
    /** 系统性能分析工具的联动分析任务目录 */
    SYS_FOLDER_LINKAGE_TASK,
    /** 调优助手的普通任务目录 */
    TUNING_ASSISTANT_FOLDER_NORMAL_TASK,
    /** 调优助手的对比分析任务目录 */
    TUNING_ASSISTANT_FOLDER_COMPARE_TASK,
    /** 系统性能分析工具的工程 */
    SYS_PROJECT,
    /** 系统性能分析工具的任务 */
    SYS_TASK,
    /** 调优助手普通任务 */
    TUN_FOLDER_NORMAAL_TASK,
    /** 调优助手对比任务 */
    TUN_FOLDER_COMPARE_TASK
}

export class ToolItemNode extends vscode.TreeItem {
    /** 节点类型，左侧树根据节点类型获取对应类型的子节点 */
    public nodeType: NodeType;
    public childen: ToolItemNode[] | undefined;
    /** 节点所属模块 */
    public module: string;
    public status: string;
    // 父级节点id
    public parentId: any;
    // 父级节点名称
    public parentLabel: any;
    public anaType: any;
    // 自定义未解析的信息
    public selfInfo: any;
    // 用户信息
    public userData: any;
    // 工程名
    public parentName: any;

    constructor(nodeInfo: any, children?: ToolItemNode[] | undefined) {
        super(nodeInfo.lable, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
        this.nodeType = nodeInfo.nodeType;
        this.id = nodeInfo.id;
        this.module = nodeInfo.module;
        this.label = nodeInfo.label;
        this.anaType = nodeInfo.anaType;
        if (typeof (children) !== 'undefined') {
            this.childen = children;
        }
        if (typeof (nodeInfo.iconPath) !== 'undefined') {
            this.iconPath = nodeInfo.iconPath;
        }
        this.parentId = nodeInfo.parentId;
        this.parentLabel = nodeInfo.parentLabel;
        this.status = nodeInfo.status;
        this.selfInfo = nodeInfo.selfInfo;
        this.userData = nodeInfo.userData;
        this.contextValue = nodeInfo.contextValue;
        this.collapsibleState = (nodeInfo.collapsibleState || nodeInfo.collapsibleState === vscode.TreeItemCollapsibleState.None) ?
            nodeInfo.collapsibleState : vscode.TreeItemCollapsibleState.Collapsed;
        this.tooltip = nodeInfo.tooltip;
        this.parentName = nodeInfo?.parentName;
        if (!nodeInfo.noCmd) {
            this.command = {
                title: nodeInfo.label, // 标题
                command: nodeInfo.command ? nodeInfo.command : 'perfItemclick', // 命令 ID
                tooltip: this.label as string, // 鼠标覆盖时的小小提示框
                // 向 registerCommand 传递的参数。
                arguments: [this]
            };
        }
    }

}
