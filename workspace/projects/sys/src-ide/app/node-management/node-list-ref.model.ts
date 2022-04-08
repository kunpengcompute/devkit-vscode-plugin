/**
 * nodeList 组件的引用
 */
export interface INodeListRef {
  /**
   * 请求信息节点
   * @param isInit 是否为初始化，用于控制 loading 等效果
   */
  getNodes: (isInit: boolean) => void;
}
