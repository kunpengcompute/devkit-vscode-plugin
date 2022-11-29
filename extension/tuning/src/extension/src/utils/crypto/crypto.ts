// 加密/解密数据模块
const crypto = require('crypto');
const { readFileData } = require('./util');

// 加密算法
const algorithm = 'aes-256-gcm';

/**
 * 获取 盐值 和 初始化向量
 * @param userPath 用户路径
 * @returns salt 盐值 iv 初始化向量
 */
function getData(userPath: string) {
  const json = readFileData(userPath);
  const salt = json.Salt_key;
  const iv = json.ASE_iv;
  return {
    salt,
    iv,
  };
}

/**
 * 加密
 * @param data 要加密的数据，utf8格式的字符串
 * @param password 用于生产密钥的密码
 * @param userPath 用户路径
 * @param callback 处理结果集的回调函数
 */
function encrypt(
  data: string,
  password: string,
  userPath: string,
  callback: any
) {
  const { salt, iv } = getData(userPath);
  crypto.scrypt(password, salt, 32, (err: any, derivedKey: any) => {
    if (err) {
      throw err;
    } else {
      // 创建 cipher 实例
      const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);

      // 加密数据
      let cipherText = cipher.update(data, 'utf8', 'hex');
      cipherText += cipher.final('hex');
      cipherText += password + salt + iv;
      callback(cipherText);
    }
  });
}

/**
 * 解密通过 encrypt() 加密的数据
 * @param cipherText 加密数据
 * @param password 用于生产密钥的密码
 * @param userPath 用户路径
 * @param callback 处理结果集的回调函数
 */
function decrypt(
  cipherText: string,
  password: string,
  userPath: string,
  callback: any
) {
  const { salt, iv } = getData(userPath);
  const len = cipherText.length - password.length - salt.length - iv.length;
  // 获取密文
  const data = cipherText.slice(0, len);

  crypto.scrypt(password, salt, 32, (err: any, derivedKey: any) => {
    if (err) {
      throw err;
    } else {
      // 创建 decipher 实例
      const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);

      // 解密数据
      const text = decipher.update(data, 'hex', 'utf8');
      callback(text);
    }
  });
}

export { encrypt, decrypt };
