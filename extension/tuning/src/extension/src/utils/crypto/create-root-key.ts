import * as path from 'path';
import * as fs from 'fs';
import { xor, setFilePermission } from './util';
import { createWorkingKey } from './create-working-key';

const crypto = require('crypto');

const ONE_ROOT_FILE = 'e96ee3778b64e3e4d27497d206821d08';
const TWO_ROOT_FILE = 'af723f561d1d7f1c1e2964cc4a0c3528';
const DEFAULT_BYTES =
  'c819906c3d40ec2c31e4215d2f53c106ed5c6194e73c8c49793\
7567c3c4298049514ca14e9023b516c1fa186ecaef3f5f10a2aa841d479723e8f9e5b799633e5';

/**
 * 生成 1024 位安全随机数
 * @param pwd
 * @param userPath
 */
function createRandomBytes(pwd: string, userPath: string) {
  fs.mkdirSync(userPath);
  setFilePermission(userPath, true);
  const efilePath = path.join(userPath, '.e');
  fs.mkdirSync(efilePath);
  setFilePermission(efilePath, true);
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
    const fFilePath = path.join(userPath, '.e', '.f');
    fs.mkdirSync(fFilePath);
    setFilePermission(fFilePath, true);
    const oneRootFilePath = path.join(fFilePath, ONE_ROOT_FILE);
    fs.appendFileSync(oneRootFilePath, data);
    setFilePermission(oneRootFilePath, false);
  } else {
    // 创建第二个组件
    const sFilePath = path.join(userPath, '.e', '.s');
    fs.mkdirSync(sFilePath);
    setFilePermission(sFilePath, true);
    const twoRootFilePath = path.join(sFilePath, TWO_ROOT_FILE);
    fs.appendFileSync(twoRootFilePath, data);
    setFilePermission(twoRootFilePath, false);
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
  const pFilePath = path.join(userPath, '.e', '.p');
  try {
    fs.readFileSync(pFilePath);
  } catch (error) {
    const data = {
      Salt_key: salt,
    };
    fs.appendFileSync(pFilePath, JSON.stringify(data));
    setFilePermission(pFilePath, false);
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
    const derivedKey = crypto.pbkdf2Sync(
      xorData,
      salt,
      iterations,
      keylen,
      digest
    );
    return derivedKey.toString('hex');
  } catch (error) {
    throw error;
  }
}

/**
 * 查询 .e/.f 文件夹中的内容
 * @param userPath 用户路径
 */
function searchOneFileData(userPath: string) {
  const oneRootFilePath = path.join(userPath, '.e', '.f', ONE_ROOT_FILE);
  try {
    return fs.readFileSync(oneRootFilePath, 'utf-8');
  } catch (err) {
    return false;
  }
}

/**
 * 查询 .e/.s 文件夹中的内容
 * @param userPath 用户路径
 */
function searchTwoFileData(userPath: string) {
  const twoRootFilePath = path.join(userPath, '.e', '.s', TWO_ROOT_FILE);
  try {
    return fs.readFileSync(twoRootFilePath, 'utf-8');
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
  if (searchOneFileData(userPath) && searchTwoFileData(userPath)) {
    const rootKey = createRootKey(userPath);
    // 生成 Working_key
    createWorkingKey(rootKey, pwd, userPath);
  } else {
    // 创建 根组件
    createRandomBytes(pwd, userPath);
  }
}

export { handleRootKey, createRootKey };
