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

import { TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { SortStatus } from '../../service';

export interface CommonTreeNode extends TiTreeNode {
    /** 列是否展开 */
    headerExpanded?: boolean;
    /** 列宽 */
    width?: string;
    /** 列关联的数据的key，父节点可不传 */
    key?: string;
    /** 排序依据的key */
    sortKey?: string;
    /** 排序方式 */
    sortStatus?: SortStatus;
    /** 问号tip */
    tip?: string;
    /** 搜索依据的key */
    searchKey?: string;
    /** 搜索时按照对比整体来搜索 */
    searchByCompare?: boolean;
    /** 列固定 */
    fixed?: 'left' | 'right';
    /** 过滤配置 */
    filterConfig?: {
        /** 选项 */
        options: any[] | any;
        /** 默认选择项 */
        selected?: any[] | any;
        /** 接口控制表头过滤下拉中显示的字段，默认为'label'，10.0.2版本新增 */
        labelKey?: string;
        /** 接口控制表头过滤下拉是否开启搜索功能，默认不开启，10.0.2版本新增 */
        searchable?: boolean;
        /** 选择事件 */
        select?: (selected: any, column: any, columns: any, tableData: any) => void;
        /** 接口控制表头过滤下拉面板展开方向，默认左对齐,9.0.4版本新增 */
        panelAlign?: string;
        /** 接口控制表头过滤下拉框的宽度，10.0.2版本新增，默认为'auto'，10.1.2起搜索场景下默认值修改为“180px” */
        panelWidth?: string;
        /** 接口控制表头过滤是否为多选，默认为单选。 */
        multiple?: boolean;
        /** 接口控制表头过滤下拉多选是否开启全选功能，默认不开启。 */
        selectAll?: boolean;
    };
    /** 列宽类型 */
    widthType?: 'px' | '%';
    /** 子节点 */
    children?: Array<CommonTreeNode>;
}

export interface CommonTableData {
    /**
     * 表头列-支持二级表头-树结构传递
     */
    columnsTree: Array<CommonTreeNode>;
    /**
     * 组件上 srcData 输入接口的数据类型接口
     */
    srcData: TiTableSrcData;
    /**
     * 是否显示列过滤下拉图标
     */
    isFilters?: boolean;
    /**
     * 表格名称
     */
    tableName?: string;
    /**
     * 表格上方显示的标题
     */
    title?: string;
    /**
     * 表格是否展开详情
     */
    isDetails?: boolean;
    /**
     * 表格是否需要行合并
     */
    isNeedMergeRow?: boolean;
    /**
     * 是否需要设置列宽
     */
    isNeedSetColumnWidth?: boolean;
    /**
     * 允许有多余的属性字段
     */
    [propName: string]: any;
}


