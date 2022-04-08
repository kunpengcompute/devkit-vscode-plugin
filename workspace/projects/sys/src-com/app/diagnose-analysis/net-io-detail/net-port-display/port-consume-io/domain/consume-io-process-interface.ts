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

interface ConsumeIORowData {
  localInterface: string;
  protocol: string;
  localIP: string;
  localPort: string;
  remoteIP: string;
  remoteInterface: string;
  remotePort: string;
  pID: string;
  command: string;
}

enum SORTSTATUS {
  NORMAL = 0,
  ASC = 1, // 升序
  DESC = 2 // 降序
}

export {
  ConsumeIORowData,
  SORTSTATUS
};
