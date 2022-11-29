const crypto = require('crypto');
const os = require('os');

import { readFileData, writeFileData } from './util';
import { encrypt, decrypt } from './crypto';
import { cryptoPwd } from './handle-pwd';

/**
 * 保存 Working_key 密文 以及 初始化向量
 * @param rootKey 根密钥
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

  // 加密保存 hostname
  const hostname = os.hostname();
  encrypt(hostname, workingData, userPath, (result: string) => {
    writeFileData({ Hostname: result }, userPath);
  });
}

/**
 * 处理 Working_key 以及 password
 * @param rootKey 根密钥
 * @param workingKey 密文
 * @param pwd 密码
 * @param userPath
 */
function transformWorkingKey(
  rootKey: string,
  workingKey: string,
  pwd: string,
  userPath: string
) {
  // 1.将 Working_key 密文 转换为 Working_key 明文
  decrypt(workingKey, rootKey, userPath, (result: string) => {
    // 2.将 password 明文 转换为 password 密文
    cryptoPwd(pwd, result, userPath);
  });
}

/**
 * 当前文件入口函数
 * @param rootKey
 * @param pwd
 * @param userPath
 */
function createWorkingKey(rootKey: string, pwd: string, userPath: string) {
  const json = readFileData(userPath);
  // 初始化向量 或 工作密钥 不存在
  if (!json.ASE_iv || !json.Working_key) {
    createKeyIv(rootKey, pwd, userPath);
  } else {
    transformWorkingKey(rootKey, json.Working_key, pwd, userPath);
  }
}

export { createWorkingKey };
