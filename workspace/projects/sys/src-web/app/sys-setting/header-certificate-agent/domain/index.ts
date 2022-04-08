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

/** 证书状态：有效 | 即将过期 | 已过期 */
export type certStatus = 'valid' | 'nearFailure' | 'failure';
/** 节点别名 */
export type nodeName = 'server' | 'agent';

/** 证书信息 */
export interface CertInfo {
  id: string;
  certExpTime: string;  // 证书到期时间
  certName: string; // 证书名称
  certStatus: certStatus;
}

/** 节点信息 */
export interface NodeInfo {
  isLocal: boolean; // 是不是本机IP
  nodeIp: string; // 节点IP
  nodeName: nodeName;
  userName: string; // 用户名
  certInfo: CertInfo[];
}

/** 提示信息 */
export interface NoticeInfo {
  nodeIp: string;
  certName: string;
  certExpTime: string;
  certStatus: certStatus;
}

export interface ReplaceCertParams {
  node_name: 'server' | 'agent';  // 节点名称
  user_name?: string;  // 用户名
  ip?: string; // 【node_name为agent】节点IP，必填，符合[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}校验规则
  verification_method?: 'password' | 'private_key';  // 【node_name为agent且不为本机ip】认证方式，必填
  password?: string;  // 【node_name为agent且不为本机ip、认证方式为password】口令，必填
  identity_file?: string; // 【node_name为agent且不为本机ip、认证方式为private_key】私钥文件，必填
  passphrase?: string;  // 【node_name为agent且不为本机ip、认证方式为private_key】密码短语，选填
  root_password?: string;  // 【user_name不为root时】root用户口令，必填
}

/** 节点认证参数 */
export interface NodeAuthParams {
  user_name: string;  // 用户名
  verification_method: 'password' | 'private_key';  // 认证方式
  password: string;  // 口令
  identity_file: string; // 私钥文件
  passphrase?: string;  // 密码短语
  root_password?: string;  // 【user_name不为root时】root用户口令，必填
}
