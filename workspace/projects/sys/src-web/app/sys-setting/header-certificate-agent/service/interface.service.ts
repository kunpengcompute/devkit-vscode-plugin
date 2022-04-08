import { Injectable } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';

@Injectable({
  providedIn: 'root'
})
export class InterfaceService {
  private url: any;
  constructor(
    private Axios: AxiosService,
    private urlService: UrlService
  ) {
    this.url = this.urlService.Url();
  }

  /** 生成证书 */
  public createCert() {
    return new Promise<void>((resolve, reject) => {
      this.Axios.axios.post(this.url.certificates, null, { headers: { showLoading: false } }).then(() => {
        resolve();
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * 更换证书
   * @param params params
   */
  public replaceCert(params: {
    node_name: 'server' | 'agent';  // 节点名称
    user_name?: string;  // 用户名
    ip?: string; // 【node_name为agent】节点IP，必填，符合[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}校验规则
    verification_method?: 'password' | 'private_key';  // 【node_name为agent且不为本机ip】认证方式，必填
    password?: string;  // 【node_name为agent且不为本机ip、认证方式为password】口令，必填
    identity_file?: string; // 【node_name为agent且不为本机ip、认证方式为private_key】私钥文件，必填
    passphrase?: string;  // 【node_name为agent且不为本机ip、认证方式为private_key】密码短语，选填
    root_password?: string;  // 【user_name不为root时】root用户口令，必填
  }) {
    return new Promise<void>((resolve, reject) => {
      this.Axios.axios.put(this.url.certificates, params).then(() => {
        resolve();
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * 更换工作秘钥
   * @param params params
   */
  public replaceWorkingSecretKey(params: {
    node_name: 'server' | 'agent';  // 节点名称
    user_name?: string;  // 用户名
    ip?: string; // 【node_name为agent】节点IP，必填，符合[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}校验规则
    verification_method?: 'password' | 'private_key';  // 【node_name为agent且不为本机ip】认证方式，必填
    password?: string;  // 【node_name为agent且不为本机ip、认证方式为password】口令，必填
    identity_file?: string; // 【node_name为agent且不为本机ip、认证方式为private_key】私钥文件，必填
    passphrase?: string;  // 【node_name为agent且不为本机ip、认证方式为private_key】密码短语，选填
    root_password?: string;  // 【user_name不为root时】root用户口令，必填
  }) {
    return new Promise<void>((resolve, reject) => {
      this.Axios.axios.put(this.url.workKey, params, { headers: { showLoading: false } }).then(() => {
        resolve();
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }
}
