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

import { encrypt } from './crypto';
import { writeFileData } from './util';

/**
 * 加密 password
 * @param pwd 用户输入的password明文
 * @param workingKey Working_key 明文
 * @param userPath 用户路径
 */
function cryptoPwd(pwd: string, workingData: string, userPath: string) {
  // 得到并保存 password_key 密文
  encrypt(pwd, workingData, userPath, (result: string) => {
    writeFileData({ Password_key: result }, userPath);
  });
}

export {
  cryptoPwd
};
