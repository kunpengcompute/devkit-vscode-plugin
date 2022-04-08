export enum VerificationMethod {
  Password = 'password',
  PrivateKey = 'private_key',
}

export type BatchNodeInfo = {
  count?: string; // 序号
  node_name?: string; // 节点别名 否	字符串，长度6-32个字符，符合节点名校验规则
  ip: string; // 需要安装agent的服务器ip 是	字符串，符合[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}校验规则
  port?: string; // 服务器端口 是	字符串，长度1-10个字符
  agent_install_path?: string; // 节点安装路径 否	字符串
  user_name: string; // 用户名 是	字符串，长度1-32个字符
  verification_method: VerificationMethod; // 认证方式 是	枚举类型，password或是private_key
  password: string; // 口令 否	字符串，如果认证方式为password则为必填项
  identity_file: string; // 私钥文件 否	字符串，如果认证方式为private_key，必填项
  passphrase: string; // 密码短语 否	字符串，如果认证方式为private_key，选填项
  root_password: string; // root用户密码 否	字符串，非root用户登录必填
};

export type BatchNodeErrorInfo = {
  [key in keyof BatchNodeInfo]: {
    error?: string[] | null;
    value: BatchNodeInfo[key];
  };
};
