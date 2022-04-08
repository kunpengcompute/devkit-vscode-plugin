import { NodeImgType, NodeType } from '../constant';
import { AdoptedType } from './tree-leaf-optimization.type';

/** 节点图标 */
type ItreeIcon = {
  root: NodeImgType,
  middle: NodeImgType,
  leaf: {
    adopted: NodeImgType,
    noAdopted: NodeImgType
  },
};

/** 树图节点 */
interface ItreeNode {
  id: number;
  name: string;
  symbol: string;
  nodeType: NodeType;
  isActive: boolean;
  isAdopted?: AdoptedType;
  itemStyle?: {
    shadowColor: string,
    shadowBlur?: number,
    shadowOffsetX?: number,
    shadowOffsetY?: number,
    [propName: string]: any,
  };
  children?: Array<ItreeNode>;
  [propName: string]: any;
}

// echarts series
interface ISeries {
  type: string;
  orient: string;
  roam: boolean | string;
  symbolSize: number;
  label: {
    color: string,
    fontSize: number,
    position: any,
    offset?: Array<any>
    [propName: string]: any;
  };
  itemStyle?: {
    shadowColor?: string,
    shadowBlur?: number,
    shadowOffsetX?: number,
    shadowOffsetY?: number,
    [propName: string]: any,
  };
  lineStyle: {
    color: string,
    width: number,
    [propName: string]: any;
  };
  expandAndCollapse: boolean;
  data: Array<ItreeNode>;
  leaves: {
    label: {
      position: any,
      offset?: Array<any>,
      [propName: string]: any;
    }
  };
  emphasis?: {
    lineStyle?: {
      color: string,
      [propName: string]: any;
    },
    [propName: string]: any;
  };
  [propName: string]: any;
}

// echarts option
interface IOption {
  animation: boolean;
  series: Array<ISeries>;
  [propName: string]: any;
}

export {
  ItreeIcon,
  ItreeNode,
  ISeries,
  IOption,
};
