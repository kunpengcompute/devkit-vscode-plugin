
import { OptimizationTypeEnum, SuggestionSelectValue } from '../../domain';
import { ProcessCpuTarget } from '../../process-perf/domain';

/** 消息data类型 */
export type TopologyTreeMessageData = {
  optimizationType?: OptimizationTypeEnum; // 优化建议类型
  [propName: string]: any;  // 其他参数
};

/** 查看进程线程分析data */
export type ViewProcessThreadData = {
  viewCpuTarget: ProcessCpuTarget;  // 分析类型 user or sys
};

/** 建议范围改变传值data */
export type suggestionSelectChangeData = {
  suggestionSelect: SuggestionSelectValue;  // 分析类型 user or sys
};


