import { RespDiagram } from './resp-diagram.type';

/**
 * 模型详情数据类型
 */
export type ModelDetailData = {
  // 基础指标
  basic_indicator: any[][];
  // 时延时序
  latency_diagram: RespDiagram;
  // iops时序
  iops_diagram: RespDiagram;
  // 吞吐量时序
  throughput_diagram: RespDiagram;
  // 基础时延
  latency: any[][];
  // 时延分布
  latency_distribution: any[][];
  // io深度分布
  io_distribution: any[][];
  // 压测进程性能
  process_perf: any[][];
  // 存储设备性能
  dev_perf: any[][];
};

/**
 * 接口返回的测试模型详情数据类型
 */
export type RespModelDetailData = {
  Diagnostics: {
    data: ModelDetailData;
    err_code: string;
    info: string;
    status: number;
  }
};

