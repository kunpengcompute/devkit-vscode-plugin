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

export const enum LANGUAGE_TYPE {
  // ZH表示界面语言为中文
  ZH = 'zh-cn',
}

/** 状态码 */
export const enum STATUS_CODE {
  // 请求成功
  SUCCESS = 'SysPerf.Success',
}

/** 用户角色 */
export const enum USER_ROLE {
  // 管理员
  ADMIN = 'Admin',
  USER= 'User'
}

export const HPC_NODE_NUM_MAX = 101;
export const NET_HPC_NODE_NUM_MAX = 101;
export const ATTACH_PROCESS_PID_NUM_MAX = 128; // 至多可输入pid数量
