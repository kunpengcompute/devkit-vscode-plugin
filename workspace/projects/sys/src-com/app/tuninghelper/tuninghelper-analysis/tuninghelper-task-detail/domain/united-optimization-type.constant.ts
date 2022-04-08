import { OptimizationTypeEnum, respOptimizationType } from '.';

/**
 * 联合优化类型常量
 * 键名：OptimizationTypeEnum
 * 键值：优化类型接口传参值
 */
export const unitedOptimizationType: {
  [name in OptimizationTypeEnum]: respOptimizationType
} = {
  systemConfig: 'system_config',
  hotFunction: 'hot_function',
  systemPerf: 'system_performance',
  processPerf: 'process_performance',
};

