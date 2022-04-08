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

const fs = require('fs');

/**
 * 16进制 异或方法
 * @returns 返回异或后的 16进制
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
      // 以下场景需使用位运算，因此禁用tslint
      // tslint:disable-next-line:no-bitwise
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
 */
function regPwd(pwd: string) {
  // 正则表达式不能换行，因此禁用tslint长度检测
  const reg = new RegExp(
    // tslint:disable-next-line:max-line-length
    /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/
  );
  return reg.test(pwd);
}

/**
 * 将传过来的对象写入 data中
 * @param obj 要写入的数据
 * @param userPath 用户路径
 */
function writeFileData(obj: any, userPath: string) {
  const content = fs.readFileSync(`${userPath}/.e/.p`, 'utf-8');
  const newObj = Object.assign(JSON.parse(content), obj);
  fs.writeFileSync(`${userPath}/.e/.p`, JSON.stringify(newObj));
}

/**
 * 读取保存的数据
 * @param userPath 用户路径
 */
function readFileData(userPath: string) {
  try {
    const content = fs.readFileSync(`${userPath}/.e/.p`, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return false;
  }
}

/**
 * 设置文件权限 文件夹：700 文件：600
 * @param path 要设置的具体路径
 * @param isFolder 是否为 文件夹
 */
function sertFilePermission(path: string, isFolder: boolean) {
  isFolder ? fs.chmodSync(path, 0o700) : fs.chmodSync(path, 0o600);
}

/**
 * 递归删除对应用户 文件夹
 * @param path 路径
 */
function delFolder(path: string) {
  try {
    const fileList = fs.readdirSync(path);
    fileList.forEach((file: any) => {
      const curPath = `${path}/${file}`;
      // 如果是文件夹
      if (fs.statSync(curPath).isDirectory()) {
        delFolder(curPath);
      } else { // 删除文件
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  } catch (error) {
    throw new Error('当前用户目录不存在');
  }
}

export {
  xor,
  regPwd,
  readFileData,
  writeFileData,
  sertFilePermission,
  delFolder
};
