export type RespCoreInfo = {
  id?: number;
  core_id: number;
  numa_id: number;
  idle: number;
  iowait: number;
  irq: number;
  soft: number;
  sys: number;
  type: number;
  usr: number;
};

export type RespOptimizationQuery = {
  optimization: {
    data: {
      core_list: Array<RespCoreInfo>;
    };
    info: string;
    status: number;
  };
};
