type MultiNodesStr = string; // 多个节点组成的字符串，如："x.x.x.x, x.x.x.x"
export type ProjectNodes = {
  [projecName in string]: MultiNodesStr;
};
