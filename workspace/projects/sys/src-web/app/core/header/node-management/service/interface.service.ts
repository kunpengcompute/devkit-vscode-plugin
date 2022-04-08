import { Injectable } from '@angular/core';
import { ToolType } from 'projects/domain';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
@Injectable({
  providedIn: 'root'
})
export class InterfaceService {
  private url: any;
  constructor(
    private Axios: AxiosService,
    private urlService: UrlService,
  ) {
    this.url = this.urlService.Url();
  }
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  /**
   * 添加节点
   * @param params params
   */
  public addNode(params: {
    ip: string; // 节点Ip
    port: number; // 端口
    user_name: string;  // 用户名
    verification_method: 'password' | 'private_key';  // 认证方式：口令认证 | 秘钥认证
    node_name?: string;  // 节点名称
    agent_install_path?: string;  // 安装路径
    password?: string;  // 口令
    identity_file?: string; // 	私钥文件
    passphrase?: string;  // 密码短语
    root_password?: string; // root口令
  }) {
    // 删除值为null的项
    Object.keys(params).forEach((key: keyof typeof params) => {
      if (params[key] == null) {
        delete params[key];
      }
    });

    return new Promise<void>((resolve, reject) => {
      this.Axios.axios.post(this.url.nodes, params).then((res: any) => {
        resolve();
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * 删除节点
   * @param params params
   */
  public deleteNode(nodeId: number, params: {
    ip: string; // 节点Ip
    user_name: string;  // 用户名
    verification_method: 'password' | 'private_key';  // 认证方式：口令认证 | 秘钥认证
    password?: string;  // 口令
    identity_file?: string; // 	私钥文件
    passphrase?: string;  // 密码短语
    root_password?: string; // root口令
  }) {
    // 删除值为null的项
    Object.keys(params).forEach((key: keyof typeof params) => {
      if (params[key] == null) {
        delete params[key];
      }
    });

    return new Promise<void>((resolve, reject) => {
      const type = this.isDiagnose ? '?analysis-type=memory_diagnostic' : '';
      this.Axios.axios.delete(`/nodes/${encodeURIComponent(nodeId)}/${type}`, { data: params }).then((res: any) => {
        resolve();
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }
}
