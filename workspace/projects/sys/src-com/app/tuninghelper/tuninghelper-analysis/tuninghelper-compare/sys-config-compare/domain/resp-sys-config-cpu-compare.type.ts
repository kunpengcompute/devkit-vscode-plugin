import { CommonValue } from './common-value.type';

export type RespCompareCpuInfo = {
  core_count: [number, number, boolean];
  version: [string, string, boolean];
  title: ['version', 'max_speed', 'current_speed', 'core_count'];
  cpus: {
    data: {
      [cpuName: string]: CommonValue[];
    }
  }
};

export type RespCompareNumaNodeInfo = {
  numa_balancing: [string, string, boolean];
  title: ['cpus', 'total_mem', 'free_mem'];
  node_info: {
    data: {
      [numaNodeId: number]: CommonValue[];
    }
  }
};

export type RespCompareNumaNodeDistanceInfo = {
  title: ['0', '1', '2', '3'],
  data: {
    [numaNodeId: number]: CommonValue[];
  }
};

export type RespCompareCacheInfo = {
  title: ['L1d', 'L1i', 'L2', 'L3']
  data: {
    L1d: CommonValue;
    L1i: CommonValue;
    L2: CommonValue;
    L3: CommonValue;
  }
};

export type RespSysConfigCpuCompare = {
  data: {
    cpu_info: RespCompareCpuInfo;
    numa_node_info: RespCompareNumaNodeInfo;
    numa_node_distance_info: RespCompareNumaNodeDistanceInfo;
    cache_info: RespCompareCacheInfo;
  }
};
