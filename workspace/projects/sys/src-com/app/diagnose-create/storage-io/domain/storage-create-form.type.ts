
/**
 * 压测对象数据
 */
export type TestTarget = {
  // 节点id
  nodeId: number;
  // 节点IP
  nodeIp: string;
  // 节点名称
  nodeName: string;
  // 当前节点的任务状态
  taskStatus?: string;
  statusCode?: string;
  taskParam: {
    nodeId?: number;
    nodeIp?: string;
    nodeName?: string;
    // 逻辑盘名或文件名
    file_name: string[];
    diagnosticType?: string[];
  }
};
/**
 * 模型数据
 */
export type ModelData = {
  id: number;
  // 请求块大小（KiB）
  block_size: string;
  // 读写模式
  rw_type: string;
  // 读写比例
  rw_mix_read_ratio: string;
  // I/O队列深度
  io_depth: string;
  // I/O引擎
  io_engine: string;
  // 并发度
  num_jobs: string;
  // Direct I/O
  direct: string;
  // I/O大小（MiB）
  size: string;
  // 测试时长（s）
  runtime: string;
  // 相关指标
  indicator_type: string;
};

/**
 * 预约定时启动的数据结构
 */
export type OrderConfig = {
  // 是否周期采集
  cycle: boolean;
  // 采集开始时间
  cycleStart?: string;
  // 采集截止时间
  cycleStop?: string;
  // 采集时间
  targetTime?: string;
  // TODO
  appointment?: string;
};
/**
 * 存储IO创建任务请求参数
 */
export type StorageCreateForm = {
  // 任务名称
  taskName: string;
  // 工程名称
  projectName: string;
  // 分析对象 Profile System 默认系统
  analysisTarget: string;
  // 诊断对象 storageio_diagnostic
  analysisType: string;
  // 诊断功能
  diagnosticFunc: string[];
  // 压测对象
  nodeConfig: TestTarget[];
  // 吞吐量
  throughput: boolean,
  // iops
  iops: boolean,
  // 时延
  latency: boolean,
  // 关键指标
  indicatorForm: ModelData[];
  // 采集时长
  collectDuration: number;
  // 采样间隔
  collectSeparation: number;
  // 周期统计
  cycleOn: boolean;
  // 统计周期
  cyclePeriod: number;
  // 采集文件大小（MiB）
  collectSize: number;
  // true: 周期采集 false：单次采集
  cycle?: boolean;
  // 周期采集 开始时间
  cycleStart?: string;
  // 周期采集结束时间
  cycleStop?: string;
  // 单次采集 日期 年月日
  appointment?: string;
  // 单次采集 时间 时分秒
  targetTime?: string;
  switch?: boolean;
};
