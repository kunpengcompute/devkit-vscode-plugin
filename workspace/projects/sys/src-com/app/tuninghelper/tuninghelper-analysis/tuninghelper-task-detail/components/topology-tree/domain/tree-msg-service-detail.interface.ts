import { OptimizationTypeEnum } from '../../../domain';
import { NodeType } from '../constant';

/**
 * tree到右侧消息详情
 */
export interface TreeMsgServiceDetail {
  optimizationType: OptimizationTypeEnum;  // 优化类型
  isGetTreeSug: boolean;  // 是否获取优化建议
  isEmptyTree: boolean;  // 树图是否为空
  treeNodeType?: NodeType;  // 树节点类型
  treeNodeId?: number;  // 树节点id
  treeNodeName?: string;  // 树节点名称
}
