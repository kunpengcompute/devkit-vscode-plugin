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

// ============ 加密/解密数据模块 ===========
const crypto = require('crypto');
const { readFileData } = require('./util');

// ------------------ 加密数据 -------------------
const algorithm = 'aes-256-gcm'; // algorithm 是算法的意思

/**
 * 获取 盐值 和 初始化向量
 * @param userPath 用户路径
 */
function getData(userPath: string) {
    const json = readFileData(userPath);
    const salt = json.Salt_key; // 盐值
    const iv = json.ASE_iv; // 初始化向量
    return {
        salt,
        iv
    };
}

/**
 * @param data 要加密的数据，必须是utf8格式的字符串
 * @param password 用于生产密钥的密码
 * @param userPath 用户路径
 * @param callback 处理结果集的回调函数
 */
function encrypt(data: string, password: string, userPath: string, callback: any) {
    const { salt, iv } = getData(userPath);

    crypto.scrypt(password, salt, 32, (err: any, derivedKey: any) => {
        if (err) {
            throw err;
        } else {
            const cipher = crypto.createCipheriv(algorithm, derivedKey, iv); 	// 创建 cipher 实例

            // 加密数据
            let cipherText = cipher.update(data, 'utf8', 'hex');
            cipherText += cipher.final('hex');
            cipherText += (password + salt + iv);
            callback(cipherText);
        }
    });

}

/**
 * 解密通过 encrypt(); 加密的数据
 * @param cipherText 通过 encrypt() 加密的数据
 * @param password 用于生产密钥的密码
 * @param userPath 用户路径
 * @param callback 处理结果集的回调函数
 */
function decrypt(cipherText: string, password: string, userPath: string, callback: any) {
    const { salt, iv } = getData(userPath);
    const len = cipherText.length - password.length - salt.length - iv.length;
    const data = cipherText.slice(0, len);  // 获取密文

    crypto.scrypt(password, salt, 32, (err: any, derivedKey: any) => {
        if (err) {
            throw err;
        } else {
            const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv); 	// 创建 decipher 实例

            // 解密数据
            const txt = decipher.update(data, 'hex', 'utf8');
            callback(txt);
        }
    });
}

// ----------- 导出 加密/解密数据模块 --------------
export {
    encrypt,
    decrypt
};


