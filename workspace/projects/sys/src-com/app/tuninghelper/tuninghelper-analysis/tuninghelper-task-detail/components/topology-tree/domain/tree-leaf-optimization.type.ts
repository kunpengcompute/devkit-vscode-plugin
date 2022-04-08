import { AnalysisType } from '../constant';
import { TreeRespOptimizationData } from './tree-http.interface';

/** 叶子节点优化建议数据类型 */
interface TreeLeafOptimizationData extends TreeRespOptimizationData {
  // 任务类型
  analysis_type: AnalysisType;
  // 任务id
  associated_task_id: number;
  // 工程名
  project_name: string;
  // 工程id
  project_id: number;
  id: number;
  is_accepted: number;
  task_name: string;
  // 操作指导
  operation_cn?: string;
  operation_en?: string;
  // 优化建议
  sug_cn?: string;
  sug_en?: string;
  online_help_cn?: string;
  online_help_en?: string;
}

/** 采纳优化建议类型 */
const enum AdoptedType {
  // 已采纳
  isAdopted = 1,
  // 未采纳
  noAdopted = 0,
}

export {
  TreeLeafOptimizationData,
  AdoptedType,
};
