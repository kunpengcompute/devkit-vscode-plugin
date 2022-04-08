import { TopologyTreeMessageType } from './topology-tree-message-type.enum';

/** 树图消息详情 */
export type TopologyTreeMessageDetail<T> = {
  type: TopologyTreeMessageType,
  data?: T
};
