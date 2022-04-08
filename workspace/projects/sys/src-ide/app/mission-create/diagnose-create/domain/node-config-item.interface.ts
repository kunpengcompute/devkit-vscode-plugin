export interface NodeConfigItem {
    nodeId: number; // 节点Id
    nickName: string; // 节点别名
    nodeIp: string; // 节点IP
    nodeStatus: 'on' | 'off' | string;
    taskParam: any;
}
