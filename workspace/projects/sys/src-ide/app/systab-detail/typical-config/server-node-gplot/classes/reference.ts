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

import { Type } from '@angular/core';

/**
 * 二数字的元组，通常表示用于坐标：[x, y]
 */
export type TwoNumber = [number, number];

/**
 * 节点类型枚举
 */
export enum TreeDirectionEnum {
    UP = 'up',
    DOWN = 'down'
}

/**
 * 拓扑树的方向
 */
export type TreeDirection = TreeDirectionEnum;

/**
 * 节点类型枚举
 */
export enum GplotNodeTypeEnum {
    NAMENODE = 'NameNode',
    DATANODE = 'DataNode'
}

/**
 * 拓扑节点的类型：NameNode——具名节点， DataNode——数据节点
 */
export type GplotNodeType = GplotNodeTypeEnum;

/**
 * 分析场景枚举
 */
export enum AnalysisScenarioEnum {
    BIG_DATA = 'big_data',
    SCENE_DATA = 'scene_data'
}

/**
 * 分析的场景： big_data——大数据， scene_data——分布式
 */
export type AnalysisScenario = AnalysisScenarioEnum;

/**
 * 拓扑节点的数据接口类，与后端返回的一致
 */
export interface GplotNodeData {
    IP: string;
    IS_VM: boolean; // 是否为虚拟机
    MEM: string;
    MEM_PER: string;
    MEM_SPEED: string;
    CPU_CORE: string;
    nodeSolution: boolean; // 是否显示小火箭
    NODE_TYPE?: GplotNodeType | ''; // 节点类型
    'CEPH-OSD'?: number;
    'CEPH-MGR'?: number;
    'CEPH-MON'?: number;
}

/**
 * 拓扑节点的信息接口类
 */
export interface GplotNodeInfo {
    isFocusNode: boolean; // 该节点是否为当前节点
    nodeData: GplotNodeData; // 节点的数据
    isBigData: boolean; // 是否是大数据场景
}

/**
 * 拓扑树节点的数据接口类
 */
export interface TreeNodeRef {
    trunkLen: number; // 树干的长度
    borderRadius: number; // 圆角，单位为: px
    parentPos: TwoNumber; // 父节点的位置
    childenPos: TwoNumber[]; // 所有子节点的位置
    direction: TreeDirection; // 树的方向
}

/**
 * 拓扑图接口类，分为：大数据——有、无拓扑， 分布式——无拓扑
 */
export interface GplotType {
    type: AnalysisScenario;
    hasTopolopy: boolean;
}


/**
 * 拓扑节点接口类，包括节点的ComponentRef与其对应的数据
 */
export class GplotNode {
    constructor(public component: Type<any>, public data: GplotNodeData) { }
}
