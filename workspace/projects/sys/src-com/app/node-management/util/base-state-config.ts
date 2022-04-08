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
 * 转态机基础配置
 */
export const baseStateConfig = {
  // 空状态
  emptyStatus: { on: { batchAction: 'templateUpDown' } },
  // 上传和下载模板
  templateUpDown: {
    on: {
      uploadTpl: 'excelParse',
      error: 'emptyStatus',
      close: 'emptyStatus',
    },
  },
  // 文件解析和类型、节点数量校验。展示校验失败原因，选择重试或替换
  excelParse: {
    on: {
      success: 'dataValid',
      close: 'emptyStatus',
      replace: 'templateUpDown',
    },
  },
  // 数据有效性验证（逻辑）
  dataValid: {
    on: {
      fail: 'dataValidFail',
      success: 'backValid',
    },
  },
  // 失败原因展示页面
  dataValidFail: {
    on: {
      close: 'emptyStatus',
    },
  },
};
