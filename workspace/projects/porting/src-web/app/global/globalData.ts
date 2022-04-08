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

const fileSize = 1024;
const DEFAULT_OS = 'CentOS7.6';
const ADMIN = 'Admin';
const MAXFILENAMELENGTH = 255;
const enum LanguageType {
  ZH_CN = 'zh-cn',
  EN_US = 'en-us'
}
const enum scan_type {
  sourceCode = '0', // 源码迁移
  byteCheck = '1', // 字节对齐
  preCheck = '2', // 64位迁移
  packageRebuild = '3', // 软件包重构（包）
  packageRebuildData = '4', // 软件包重构（依赖文件）
  softwarePackage = '5', // 软件迁移
  weakConsistencystep1 = '6', // 内存一致性
  weakConsistencystep2 = '7', // 内存一致性
  weakConsistencyBC = '8', // 内存一致性bc文件
  cacheCheck = '12', // cacheline功能
}
export {
  fileSize,
  DEFAULT_OS,
  ADMIN,
  LanguageType,
  MAXFILENAMELENGTH,
  scan_type
};
