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

const path = require('path');
const crypto = require('crypto');

import { handleRootKey, createRootKey } from './create_root_key';
import { readFileData, regPwd, delFolder } from './util';
import { handleErrScene } from './handle_err_scene';
import { decrypt } from './crypto';

const PLUGIN_PATH = path.join(__dirname, '../../../');
const MESSAGE = {
  infochinese: '加密文件已损坏，请重新输入密码',
  info: 'The encrypted file is damaged, please re-enter the password'
};

/**
 * 生成 本地文件 保存 相关数据
 * @param pwd 用户密码
 * @param username 用户名
 * @param ip 服务器地址
 */
function savaData(username: string, pwd: string, ip: string): any {
  if (typeof username !== 'string' || typeof pwd !== 'string') {
    return {
      infochinese: '用户名或密码类型不对，请传入字符串'
    };
  }
  if (!regPwd(pwd)) {
    return {
      infochinese: '必须包含大写字母、小写字母、数字以及特殊字符（`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?）中两种及以上类型的组合，长度为8~32个字符，不能含空格。',
      info: 'It must contain 8 to 32 characters and at least two types of the following characters: \
uppercase letters, lowercase letters, digits, \
and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?).Spaces are not allowed.'
    };
  }

  // 生成对应的 用户目录  ip/username
  const ipAndUsername = `${ip}@${username}`;
  const ipAndUsernameHash = crypto.createHash('sha256').update(ipAndUsername).digest('hex');
  const userPath = getUserPath(ipAndUsernameHash);
  handleRootKey(pwd, userPath);
}

/**
 * 根据保存的 password 密文 得到 相应的明文
 * @param username 用户名
 * @param cb 回调函数 获取明文密码
 * @param ip 服务器地址
 */
function getPwd(username: string, ip: string, cb: (msg: any) => void): any {
  // 生成对应的 用户目录  ip@username
  const ipAndUsername = `${ip}@${username}`;
  // 避免不同平台大小写引起的问题
  const ipAndUsernameHash = crypto.createHash('sha256').update(ipAndUsername).digest('hex');
  const userPath = getUserPath(ipAndUsernameHash);
  const result = handleErrScene(userPath, ipAndUsernameHash);
  if (!result) { cb(MESSAGE); }

  const json = readFileData(userPath);
  if (!json) { return false; }

  // 1. 获取 root_key 以及 working_key(工作密文)
  const rootKey = createRootKey(userPath);
  const workingKey = json.Working_key;

  // 2. 解密 working_key明文
  decrypt(workingKey, rootKey, userPath, (workKey: any) => {
    if (workKey.length !== 64) {
      delFolder(userPath);
      cb(MESSAGE);
    }

    // 3. 获取 password 密文
    const pwdKey = json.Password_key;

    // 4. 解密 password 明文
    decrypt(pwdKey, workKey, userPath, (pwd: any) => {
      cb(pwd);
    });
  });
}

/**
 * 删除指定的用户 所保存的相关信息
 * @param username 用户名
 * @param ip 服务器地址
 */
function delUser(username: string, ip: string): boolean | void {
  const ipAndUsername = `${ip}@${username}`;
  const ipAndUsernameHash = crypto.createHash('sha256').update(ipAndUsername).digest('hex');
  const userPath = getUserPath(ipAndUsernameHash);
  const result = handleErrScene(userPath, ipAndUsernameHash);
  if (!result) { return false; }
  delFolder(userPath);
}

/**
 * @param ipAndUsernameHash ip@用户名的hash值
 */
function getUserPath(ipAndUsernameHash: string): string {
  const pluginPath = `${PLUGIN_PATH}`;
  const userPath = path.join(pluginPath, ipAndUsernameHash);
  return userPath;
}

export {
  savaData,
  getPwd,
  delUser
};
