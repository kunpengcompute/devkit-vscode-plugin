// 节点信息
export interface INodeInfo {
  nickName: string;
  nodeId: number;
  nodeIp: string;
  nodeStatus: string;
  num?: number;
  prop?: string;
  label?: string;
  taskParam: { status: boolean };
}
