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

import { FormControl } from '@angular/forms';
import { OrderConfig } from '../../domain';

export interface RawDataIOBase {
  appDir?: string;
  'app-parameters'?: string;
  analysisTarget?: string; // Profile System, Launch Application, Attach to Process
  targetPid?: string;
  process_name?: string;
  analysisType?: string; // I/O performance
  projectName?: string;
  taskName?: string;
  duration?: number;
  statistical?: number;
  size?: number;
  stack?: boolean;
  cycle?: boolean; // 是否周期采集
  cycleStart?: string; // 采集开始时间
  cycleStop?: string; // 采集截止时间
  targetTime?: string; // 采集时间
  appointment?: string; // TODO
}

/**
 * 真正的后端结构的数据结构
 */
export interface RawDataIO {
  switch?: boolean;
  status?: string;
  appDir?: string;
  'app-parameters'?: string;
  analysisTarget?: string; // Profile System, Launch Application, Attach to Process
  targetPid?: string;
  process_name?: string;
  analysisType?: string; // I/O performance
  projectName?: string;
  taskName?: string;
  duration?: number;
  statistical?: number;
  size?: number;
  stack?: boolean;
  cycle?: boolean; // 是否周期采集
  cycleStart?: string; // 采集开始时间
  cycleStop?: string; // 采集截止时间
  targetTime?: string; // 采集时间IP
  appointment?: string; // TODO
  nodeConfig?: Array<{
    nodeId?: number,
    nodeIp?: string, // 节点IP
    nickName?: string, // 在发给后端的数据中所有的
    nodeNickName?: string, // 在后端发来的数据中所有的
    nodeStatus?: string,
    taskParam?: RawDataIOBase
  }>;
  user_message?: {
    [key: string]: {
      user_name: string,
      password: string
    }
  };
  is_user?: boolean;
}

/**
 * 表单的数据结构
 */
export interface FormDataIO {
  taskName: string; // 任务名称
  appAndParams: any; // 应用和应用参数
  pidProcess: any; // 进程ID和进程名称
  duration: number; // 采样时长
  statistical: number; // 统计周期
  size: number; // 采集文件大小
  stack: boolean; // 采集调用栈
  doOrder?: boolean; // 是否预约定时启动
  orderConfig?: OrderConfig[]; // 预约配置
  doNodeConfig?: boolean; // 是否进行节点参数配置
  nodeConfig?: NodeConfigItem[]; // 节点配置
  taskStartNow: boolean; // 立即启动
  nodeList: any; // 选择节点
}

/**
 * 表单所有控件的数据结构
 */
export type IoFormControls = {
  [K in keyof FormDataIO]?: FormControl;
};

/**
 * 节点信息
 */
export interface NodeConfigItem {
  nodeId: number; // 节点Id
  nickName: string; // 节点别名
  nodeIp: string; // 节点IP
  nodeStatus: 'on' | 'off' | string;
  taskParam: {
    status: boolean, // 修改状态
    appDir?: string; // 应用路径
    'app-parameters'?: string; // 应用参数
    targetPid?: string; // 进程的PID
    process_name?: string; // 进程的名称
  };
  runUserData: {
    runUser: boolean;
    user: string;
    password: string;
  };
}

/**
 * 后端接口返回的数据的节点数据结构
 */
export interface RawNodeItem {
  nodeId: string; // 节点Id
  nodeNickName: string; // 节点别名
  nodeIp: string; // 节点IP
  taskStatus: string; // 任务状态
  statusCode: string; // 状态码
  task_param: {
    status: boolean, // 修改状态
    appDir?: string; // 应用路径
    'app-parameters'?: string; // 应用参数
    targetPid?: string; // 进程的PID
    process_name?: string; // 进程的名称
  };
}

/**
 *  父组件的传入的数据
 */
export interface SuperData {
  projectName: string;
  taskName: string;
  projectId: number;
  modeAppParams: string;
  modeApplication: string;
  modePid: string;
  modeProcess: string;
  restartAndEditId: any;
  scheduleTaskId: any;
  runUserStatus: boolean;
  user_name: string;
  password: string;
}
