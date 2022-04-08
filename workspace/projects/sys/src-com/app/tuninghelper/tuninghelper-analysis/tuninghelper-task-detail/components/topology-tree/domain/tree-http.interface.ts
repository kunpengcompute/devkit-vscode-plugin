import { CpuTargetStatus, respOptimizationType } from '../../../domain';
import { SystemCpuTarget } from '../../../system-perf/domain';
import { CpuIndicator, IndicatorDetail, Threshold } from './tree-optimization-sug.type';
/**
 * 树图相关接口查询参数
 */
interface TreeReqParams {
  'node-id': number;
  'service-type'?: string;
  'optimization-type'?: respOptimizationType;
  'cpu-status'?: CpuTargetStatus;
  'all-suggestion'?: boolean;
  cpu?: SystemCpuTarget;
  id?: number;
  type?: string;
}

/**
 * 树图相关接口返回的数据格式
 */
interface TreeRespData<T> {
  optimization: {
    data: T;
    info: string;
    status: number;
  };
}

/**
 * 树图节点数据格式
 */
interface TreeNodeRespData {
  id: number;  // 树节点id
  pid: number;  // 父节点id
  indicator_describe_cn?: string;  // 根节点和中间节点label
  indicator_describe_en?: string;
  sug_cn?: string;  // 叶子节点lable
  sug_en?: string;
  is_accepted: number;  // 是否已采纳优化建议
}

/**
 * detail_data
 */
interface DetailData {
  relavant_config?: Array<IndicatorDetail> | CpuIndicator;  // 相关配置
  relavant_indicator?: Array<IndicatorDetail> | CpuIndicator;  // 相关指标
}
/**
 * 树图节点返回的优化建议详情
 */
interface TreeRespOptimizationData {
  detail_data?: DetailData;  // 详情
  threshold?: Array<Threshold>;  // 阈值
  sug_introduction_cn?: string;  // 指标说明
  sug_introduction_en?: string;
}
/**
 * 创建工程成功返回的数据类型
 */
interface TreeRespCreateProject {
  id: number;  // 工程id
  projectName: string;  // 工程名称
  timeCreated: string;  // 创建时间
}

export {
  TreeReqParams,
  TreeRespData,
  TreeNodeRespData,
  DetailData,
  TreeRespOptimizationData,
  TreeRespCreateProject,
};
