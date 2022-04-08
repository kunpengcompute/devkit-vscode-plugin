import { ToolType } from 'projects/domain';

export type ProjectNodesShip = {
  id?: number;
  projectname: string;
  username: string;
  ownTool?: ToolType;
  related_node: string[];
};

/**
 * 接口数据
 */
export type ProjectNodesShipRaw = {
  projectList: ProjectNodesShip[];
  memoryProjectList: ProjectNodesShip[];
  optimizationProjectList: ProjectNodesShip[];
};
