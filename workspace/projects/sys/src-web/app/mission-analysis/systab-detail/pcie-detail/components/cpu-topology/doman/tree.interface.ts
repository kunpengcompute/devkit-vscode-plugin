export enum NodeType {
  NONE,
  NUMA,
  ROOT_COMPLEX,
  BRIDGE = 'PCIe Bridge',
  END_POINT = 'Endpoint',
}

export interface Tree {
  id: number;
  name: string;
  subName?: string;
  type: NodeType;
  /** 所属numa */
  numa: string;
  children: Tree[];
  /** 后端节点数据 */
  nodeData: any;
  /** 是否有建议 */
  suggestionFlag?: boolean;
}
