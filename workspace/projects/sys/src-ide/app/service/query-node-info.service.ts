import { Injectable } from '@angular/core';
import { VscodeService } from './vscode.service';
import { Utils } from '../service/utils.service';
import { ToolType } from 'projects/domain';

/** 协议类型 */
export type KeyType = 'ECDSA' | 'RSA' | 'ED25519' | 'DSA';

/** 加密类型 */
export type HashType = 'SHA5' | 'SHA256';

type FingerPrintInfoList = {
    [propName in HashType]: Array<{
        finger_print: string;
        hash_type: HashType;
        key_length: number;
        key_type: KeyType;
        node_ip: string;
    }>;
};

@Injectable({
    providedIn: 'root'
})
export class QueryNodeInfoService {
   public toolType = sessionStorage.getItem('toolType');
    constructor(
        private vscodeService: VscodeService,
    ) { }

    /**
     * 查询指纹
     * @param nodeIP 节点IP
     * @param port 端口
     */
    public getFingerPrint(nodeIP: string, port?: number) {
        return new Promise<FingerPrintInfoList>((resolve, reject) => {
            let params = {};
            if (port) {
                params = {
                    node_ip: nodeIP,
                    ssh_port: port,
                };
            } else {
                params = {
                    node_ip: nodeIP,
                };
            }
            let url = this.toolType === ToolType.DIAGNOSE ?
            `/nodes/None/finger-print/?analysis-type=memory_diagnostic&` : `/nodes/None/finger-print/?`;
            url += Utils.converUrl(params);

            this.vscodeService.get({ url }, (res: any) => {
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
            });
        });
    }
}
