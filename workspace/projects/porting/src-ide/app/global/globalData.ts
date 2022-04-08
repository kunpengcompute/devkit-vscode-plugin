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

const fileSize = 1024; // 上传文件大小限制值
const DEFAULT_OS = 'CentOS7.6';
const ADMIN = 'Admin';
const enum LanguageType {
  ZH_CN = 'zh-cn',
  EN_US = 'en-us'
}
export {
  fileSize,
  DEFAULT_OS,
  ADMIN,
  LanguageType,
};
