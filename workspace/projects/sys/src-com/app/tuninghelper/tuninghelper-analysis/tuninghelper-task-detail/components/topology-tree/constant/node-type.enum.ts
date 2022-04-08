/**
 * 节点类型，用于更换节点图标
 */
export enum NodeType {
  Root = 'root',
  Middle= 'middle',
  Leaf = 'leaf',
}

/**
 * 节点图标类型，用于更换节点图标
 */
export type NodeImgType = {
  normal: string;
  hover: string;
  active: string;
};

