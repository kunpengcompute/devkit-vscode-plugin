export interface RespSysInfo {
  CPU: number;
  'NUMA node': string;
  NUMA_Detail: {
    'NUMA node1 CPUS': string,
    'NUMA node2 CPUS': string,
    'NUMA node3 CPUS': string,
    'NUMA node4 CPUS': string,
  };
  linux_kernel: string;
}
