import { NodeRankInfo } from './node-rank-info.type';

/**
 * Rank 节点配置逻辑的控制器
 */
export interface RankSetControl {
  action: (nodeInfoList: NodeRankInfo[]) => void;
  dismiss?: () => {};
}
