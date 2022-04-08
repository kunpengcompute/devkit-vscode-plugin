
/** 树图消息类型 */
export enum TopologyTreeMessageType {
  viewTopProceeThread,  // 查看进线程分析
  updateLeafNode,  // 更新树图叶子节点
  updateTree,  // 更新树图
  cancelSelectTreeNode,  // 取消选中树图节点
  suggestionSelectChange,  // 建议范围改变
}
