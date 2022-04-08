import { TiTableRowData } from '@cloud/tiny3';

/**
 * 除config外，其他属性为后端返回的节点信息参数
 */
export interface NodeInfo extends TiTableRowData {
  id: number;
  installPath: string;
  nickName: string;
  nodeId: string;
  nodeIp: string;
  nodePort: number;
  nodeStatus: string;
  userName: string;
  /** 节点配置信息 */
  config: any;
  configStatus: boolean;
}
