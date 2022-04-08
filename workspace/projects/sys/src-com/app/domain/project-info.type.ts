/**
 * 任务信息
 */
export type ProjectInfo = {
  nodeList: {
    id: number;
    installPath: string;
    nickName: string;
    nodeId: string;
    nodeIp: string;
    nodePort: null;
    nodeStatus: 'on' | 'off';
    userName: string;
  }[];
  ownerId: string;
  ownerName: string;
  projectId: number;
  projectName: string;
  timeCreated: string;
};
