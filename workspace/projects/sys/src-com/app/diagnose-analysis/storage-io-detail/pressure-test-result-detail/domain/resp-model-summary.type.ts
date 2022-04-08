/** 时延状态 */
export type LatencyStatus = 'fast' | 'good' | 'slow';

/** 读写类型 */
export type RwType = 'read' | 'write' | 'rw' | 'randread' | 'randwrite' | 'randrw';

/** 时延优化建议 */
export type LatencySuggestion = {
  suggest_chs: string;
  suggest_en: string;
  title_chs: string;
  title_en: string;
};

/**
 * 关键指标数据类型
 */
export type KeyIndicator = {
  // 读吞吐量
  read_throughput: string;
  // 写吞吐量
  write_throughput: string;
  // 读时延
  read_latency: {
    value: string;
    status: LatencyStatus;
    suggestion: LatencySuggestion;
  };
  // 写时延
  write_latency: {
    value: string;
    status: LatencyStatus;
    suggestion: LatencySuggestion;
  };
  // 读iops
  read_IOPS: string;
  // 写iops
  write_IOPS: string;
};

/**
 * 总览信息数据类型
 */
export type ModelSummaryData = {
  // 模型id
  model_id: number;
  // 块大小
  block_size: string;
  // 读写模式
  rw_type: RwType;
  // 读写比例
  rw_mix_read_ratio: string;
  // io队列深度
  iodepth: number;
  // io引擎
  ioengine: string;
  // 并发度
  numjobs: number;
  // direct i/o
  direct: string;
  // IO大小
  size: number;
  // 测试时长
  runtime: string;
  // 关键指标详情
  key_indicator: KeyIndicator;
  // 关键指标
  indicator_form: 'iops' | 'latency' | 'throughput';
};

/**
 * 接口返回的测试模型总览数据类型
 */
export type RespModelSummaryData = {
  Diagnostics: {
    data: {
      test_object: string;
      summary_list: Array<ModelSummaryData>;
    };
    err_code: string;
    info: string;
    status: number;
  }
};
