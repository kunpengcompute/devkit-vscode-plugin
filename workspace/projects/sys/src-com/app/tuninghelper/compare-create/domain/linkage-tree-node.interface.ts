import { TiTreeNode } from '@cloud/tiny3';

export interface LinkageTreeNode extends TiTreeNode {
  level: 'project' | 'task' | 'node';
  taskId?: number;
  nodeId?: number;
  ip?: number;
  children?: Array<LinkageTreeNode>;
}
