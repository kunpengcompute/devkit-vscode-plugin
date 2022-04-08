import { Injectable } from '@angular/core';
import { AxiosService } from './axios.service';
import { FingerPrintInfo } from 'projects/sys/src-web/app/domain';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
@Injectable({
  providedIn: 'root'
})
export class QueryNodeInfoService {
  private url: any;
  constructor(
    private urlService: UrlService,
    private Axios: AxiosService
  ) {
    this.url = this.urlService.Url();
  }
  /**
   * 查询指纹
   * @param nodeIP 节点IP
   * @param port 端口
   */
  public getFingerPrint(nodeIP: string, port?: number) {
    return new Promise<FingerPrintInfo>((resolve, reject) => {
      const params = {
        node_ip: nodeIP,
        ssh_port: port,
      };

      this.Axios.axios.get(this.url.fingerPrint, { params }).then((res: any) => {
        try {
          const dataMap = (data: any) => {
            return {
              finger_print: data.finger_print,
              hash_type: data.hash_type,
              key_length: data.key_length,
              key_type: data.key_type,
              node_ip: data.node_ip,
            };
          };

          resolve({
            SHA5: res.data.md5.map((item: any) => dataMap(item)),
            SHA256: res.data.sha256.map((item: any) => dataMap(item)),
          });
        } catch (error) {
          reject(error);
        }
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }
}
