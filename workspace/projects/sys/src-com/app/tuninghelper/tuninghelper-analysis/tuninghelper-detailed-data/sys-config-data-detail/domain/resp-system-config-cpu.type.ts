export type RespCpuInfo = {
  core_count: number;
  version: string;
  cpus: {
    title: ['name', 'version', 'max_speed', 'current_speed', 'core_count'];
    data: Array<[string, string, string, string, number]>
  };
};

export type RespNumaNodeInfo = {
  numa_balancing: string;
  node_info: {
    title: ['node', 'cpus', 'total_mem', 'free_mem'];
    data: Array<[string, string, string, string]>
  }
};

export type RespNumaNodeDistanceInfo = Array<{
  [nodeId: number]: [string, string, string, string]
}>;

export type RespCacheInfo = {
  L1d: string;
  L1i: string;
  L2: string;
  L3: string;
};

export type RespCpuConfig = {
  cpu_info: RespCpuInfo;
  numa_node_info: RespNumaNodeInfo;
  numa_node_distance_info: RespNumaNodeDistanceInfo;
  cache_info: RespCacheInfo;
};

export type RespSystemConfigCpu = {
  optimization: {
    data: RespCpuConfig;
    info: string;
    status: number;
  };
};
