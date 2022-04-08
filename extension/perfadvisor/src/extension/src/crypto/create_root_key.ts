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

// 生成 根组件 以及根 秘钥
const fs = require('fs');
const crypto = require('crypto');

const { xor, sertFilePermission } = require('./util');
const { createWorkingKey } = require('./create_working_key');

const ONE_ROOT_FILE = 'e96ee3778b64e3e4d27497d206821d08';
const TWO_ROOT_FILE = 'af723f561d1d7f1c1e2964cc4a0c3528';
const DEFAULT_BYTES = 'c819906c3d40ec2c31e4215d2f53c106ed5c6194e73c8c497937567c3c4\
298049514ca14e9023b516c1fa186ecaef3f5f10a2aa841d479723e8f9e5b799633e5';

/**
 * 生成 1024 位安全随机数
 * @param pwd 用户密码
 * @param userPath 用户路径
 */
function createRandomBytes(pwd: string, userPath: string) {
  fs.mkdirSync(`${userPath}`);
  sertFilePermission(`${userPath}`, true);

  fs.mkdirSync(`${userPath}/.e`);
  sertFilePermission(`${userPath}/.e`, true);

  for (let i = 0; i < 2; i++) {
    const data = crypto.randomBytes(64).toString('hex');
    createComponentKeys(i, data, userPath);
  }
  const rootKey = createRootKey(userPath);
  // 生成 working_key
  createWorkingKey(rootKey, pwd, userPath);
}

/**
 * 创建根密钥组件
 * @param index 索引
 * @param data 128字节随机数
 * @param userPath 用户路径
 */
function createComponentKeys(index: number, data: string, userPath: string) {
  // 创建第一个组件
  if (index === 0) {
    fs.mkdirSync(`${userPath}/.e/.f`);
    sertFilePermission(`${userPath}/.e/.f`, true);

    fs.appendFileSync(`${userPath}/.e/.f/${ONE_ROOT_FILE}`, data);
    sertFilePermission(`${userPath}/.e/.f/${ONE_ROOT_FILE}`, false);
  } else { // 创建第二个组件
    fs.mkdirSync(`${userPath}/.e/.s`);
    sertFilePermission(`${userPath}/.e/.s`, true);

    fs.appendFileSync(`${userPath}/.e/.s/${TWO_ROOT_FILE}`, data);
    sertFilePermission(`${userPath}/.e/.s/${TWO_ROOT_FILE}`, false);
  }
}

const iterations = 10000; // 迭代次数
const keylen = 128; // 期望得到秘钥的长度
const digest = 'sha256'; // 一个伪随机函数

/**
 * 生成 根秘钥
 * @param userPath 用户路径
 */
function createRootKey(userPath: string) {
  const oneData = searchOneFileData(userPath);
  const twoData = searchTwoFileData(userPath);
  // 对三个生成的 随机数组件 进行异或
  const xorData = xor(oneData, twoData, DEFAULT_BYTES);

  // 得到 根秘钥
  return PBKDF2(xorData, userPath);
}

/**
 * 保存盐值到 .e/.p 文件中
 * @param salt 盐值
 * @param userPath 用户路径
 */
function savaSalt(salt: string, userPath: string) {
  try {
    fs.readFileSync(`${userPath}/.e/.p`);
  } catch (error) {
    const data = {
      Salt_key: salt
    };
    fs.appendFileSync(`${userPath}/.e/.p`, JSON.stringify(data));
    sertFilePermission(`${userPath}/.e/.p`, false);
  }
}

/**
 * 秘钥派生算法 PBKDF2 生成根秘钥
 * @param xorData 根秘钥组件 异或 数据
 * @param userPath 用户路径
 */
function PBKDF2(xorData: string, userPath: string) {
  const salt = xorData.slice(0, 32);
  savaSalt(salt, userPath);
  try {
    const derivedKey = crypto.pbkdf2Sync(xorData, salt, iterations, keylen, digest);
    return derivedKey.toString('hex');
  } catch (error) {
    throw(error);
  }
}

/**
 * 查询 .e/.f 文件夹中的内容
 * @param userPath 用户路径
 */
function searchOneFileData(userPath: string) {
  try {
    return fs.readFileSync(`${userPath}/.e/.f/${ONE_ROOT_FILE}`, 'utf-8');
  } catch (err) {
    return false;
  }
}

/**
 * 查询 .e/.s 文件夹中的内容
 * @param userPath 用户路径
 */
function searchTwoFileData(userPath: string) {
  try {
    return fs.readFileSync(`${userPath}/.e/.s/${TWO_ROOT_FILE}`, 'utf-8');
  } catch (err) {
    return false;
  }
}

/**
 * 根据 根秘钥组件 是否存在处理相关逻辑
 * @param pwd 用户密码
 * @param userPath 用户路径
 */
function handleRootKey(pwd: string, userPath: string) {
  // 根秘钥组件是否存在
  if (searchOneFileData(userPath) && searchTwoFileData(userPath) ) {
    const rootKey = createRootKey(userPath);
    // 生成 working_key
    createWorkingKey(rootKey, pwd, userPath);
  }  else { // 创建 根组件
    createRandomBytes(pwd, userPath);
  }
}

export {
  handleRootKey,
  createRootKey
};


