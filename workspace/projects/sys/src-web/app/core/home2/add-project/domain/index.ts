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

/** 场景列表：通用场景| 大数据 | 分布式存储 | HPC */
export type SceneType = 'general_scenario' | 'big_data' | 'distributed_storage' | 'HPC';

/** 打开弹框的方式：创建工程 | 修改工程 | 查看工程信息 */
export type OpenType = 'create' | 'edit' | 'showProjectInfo';

/** 根据工程场景ID寻找所在的场景、组件等 */
export interface SceneAddress {
  [propName: number]: {
    sceneId?: number,
    componentId?: number,
    applicationScenarioId?: number,
    storageTypeId?: number,
    storageTypeDetailId?: number,
    databaseTypeId?: number,
  };
}
