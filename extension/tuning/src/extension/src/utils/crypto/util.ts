import { chmodSync } from 'fs';
import * as path from 'path';
const fs = require('fs');

/**
 * 16进制 异或算法
 * @param items
 * @returns 返回异或后的16进制数据
 */
function xor(...items: any) {
  if (items.length < 2) {
    throw new Error('argument error');
  }
  let minLen = items[0].length;
  items.forEach((element: string) => {
    minLen = element.length < minLen ? element.length : minLen;
  });
  const hexArr = [];
  for (let i = 0; i < minLen; i++) {
    const xorRes = items.reduce((a: any, c: any) => {
      const aChart = a;
      const cChart = c[i];
      const aDec = parseInt(aChart, 16);
      const cDec = parseInt(cChart, 16);
      const xorVal = aDec ^ cDec;
      return xorVal.toString(16);
    }, '0');
    hexArr.push(xorRes);
  }
  return hexArr.join('');
}

/**
 * 正则校验密码是否满足规则
 * @param pwd 密码
 * @returns Boolean
 */
function regPwd(pwd: string) {
  const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{8,32}$/);
  return reg.test(pwd);
}

/**
 * 将传入的对象写入 data 中
 * @param obj 写入数据
 * @param userPath 用户路径
 */
function writeFileData(obj: any, userPath: string) {
  const targetFilePath = path.join(userPath, '.e', '.p');
  const content = fs.readFileSync(targetFilePath, 'utf-8');
  const newObj = Object.assign(JSON.parse(content), obj);
  fs.writeFileSync(targetFilePath, JSON.stringify(newObj));
}

/**
 * 读取保存的数据
 * @param userPath 用户路径
 * @returns 数据
 */
function readFileData(userPath: string) {
  try {
    const targetFilePath = path.join(userPath, '.e', '.p');
    const content = fs.readFileSync(targetFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return false;
  }
}

/**
 * 设置文件权限 文件夹 700 文件 600
 * @param filePath 要设置的文件路径
 * @param isFolder 是否为文件夹
 */
function setFilePermission(filePath: string, isFolder: boolean) {
  isFolder ? fs.chmodSync(filePath, 0o700) : fs.chmodSync(filePath, 0o600);
}

/**
 * 递归删除对应用户的文件夹
 * @param filePath
 */
function delFolder(filePath: string) {
  try {
    const fileList = fs.readdirSync(filePath);
    fileList.forEach((file: any) => {
      const curPath = path.join(filePath, file);
      if (fs.statSync(curPath).isDirectory()) {
        delFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(filePath);
  } catch (error) {
    throw new Error('当前用户目录不存在');
  }
}

export {
  xor,
  regPwd,
  readFileData,
  writeFileData,
  setFilePermission,
  delFolder,
};
