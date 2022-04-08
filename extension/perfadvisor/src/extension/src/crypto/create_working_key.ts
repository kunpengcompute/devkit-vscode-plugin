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

const crypto = require('crypto');

import { readFileData, writeFileData } from './util';
import { encrypt, decrypt } from './crypto';
import { cryptoPwd } from './handle_pwd';

/**
 * 保存 Working_key密文 以及 初始化向量
 * @param rootKey 根秘钥
 * @param pwd 用户密码
 * @param userPath 用户路径
 */
function createKeyIv(rootKey: any, pwd: string, userPath: string) {
  // 生成 256 位 Working_key 明文
  const workingData = crypto.randomBytes(32).toString('hex');

  // 生成及保存 初始化向量
  const iv = crypto.randomBytes(8).toString('hex');
  writeFileData({ ASE_iv: iv }, userPath);

  // 得到并保存 Working_key 密文
  encrypt(workingData, rootKey, userPath, (result: string) => {
    writeFileData({ Working_key: result }, userPath);
  });

  // 加密 password
  cryptoPwd(pwd, workingData, userPath);
}

/**
 * 处理 working_key 以及 password
 * @param rootKey 根秘钥
 * @param workingKey working_key 密文
 * @param pwd 用户密码
 * @param userPath 用户路径
 */
function transformWorkingKey(rootKey: string, workingKey: string, pwd: string, userPath: string) {
  // 1. 将 working_key 密文 转换为 working_key 明文
  decrypt(workingKey, rootKey, userPath, (result: string) => {
    // 2. 将 password 明文 转换为 password密文
    cryptoPwd(pwd, result, userPath);
  });
}

/**
 * 当前文件入口函数
 * @param rootKey 根秘钥
 * @param pwd 用户密码
 * @param userPath 用户路径
 */
function createWorkingKey(rootKey: string, pwd: string, userPath: string) {
  const json = readFileData(userPath);
  // 初始化向量 或 工作秘钥 不存在
  if (!json.ASE_iv || !json.Working_key) {
    createKeyIv(rootKey, pwd, userPath);
  } else {
    transformWorkingKey(rootKey, json.Working_key, pwd, userPath);
  }
}

export {
  createWorkingKey
};
