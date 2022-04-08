/**
 * CPU 中断详情信息
 */
export interface ICpuIrqDetail {
  irq_affinity_mask_dict: {};
  irq_affinity_mask_num: number;
  rps_affinity_mask_dict: {};
  rps_affinity_mask_num: number;
  xps_affinity_mask_dict: {};
  xps_affinity_mask_num: number;
}

/**
 * 中断绑核详情信息
 */
export interface IrqAffinityDetail {
  eth_name: string;
  irq_affinity_mask: string;
  irq_count: number;
  irq_count_list: 1[] | 0[];
  irq_device_bdf: string;
  irq_device_name: string;
  irq_event_name: string;
  numa_node: string;
  queue_name: string;
  rps_affinity_mask: string;
  rps_flow_cnt: string;
  xps_affinity_mask: string;
}

/**
 * 网络负载监控的接口数据
 */
export type INetLoadRawData = {
  // arp信息
  arp_info: string[][];
  // bound信息
  bond_info_dict: {
    [key in string]: string[];
  };
  context_info: {
    interval: number;
    start_time: number;
    numa_num?: number;
  };
  // 整个系统硬中断（包括xps/rps）信息（CPU core视图）
  cpu_irq_info: {
    [key in string]: ICpuIrqDetail;
  };
  // cpu负载信息
  cpu_load: string[];
  // cpu利用率核视图
  cpu_usage_core_view: string[][];
  // cpu利用率NUMA视图
  cpu_usage_numa_view: string[][];
  // 网口对应硬中断（包括xps/rps）信息（CPU core视图）
  eth_cpu_irq_info: {
    [key in string]: {
      [prop in string]: ICpuIrqDetail;
    };
  };
  // 网口对应硬中断（包括xps/rps）信息
  eth_irq_affinity_info: {
    [key in string]: {
      [prop in string]: IrqAffinityDetail;
    };
  };
  // 网口配置信息
  iface_config_info: {
    [key in string]: string[];
  };
  // 整个系统硬中断（包括xps/rps）信息
  irq_affinity_info: {
    [key in string]: IrqAffinityDetail;
  };
  ksoftirqd_list: number[];
  // 内存利用率信息
  mem_usage: string[];
  // 网络IO时序信息
  net_io_detail: {
    [key in string]: {
      'rxkB/s': [string, string];
      'rxpck/s': [string, string];
      'txkB/s': [string, string];
      'txpck/s': [string, string];
    };
  };
  // 网络IO统计信息
  net_io_stat: string[][];
  netstat_info: {
    [key in string]: string[][];
  };
  pid_info: {
    [key in number]: {
      cpu_affinity_info: [];
      mem_affinity_info: string[][];
      pidstat_info: [];
      process_numa_allocation: string[][];
    };
  };
  // 路由配置信息
  route_info: string[][];
  rps_ipi_info?: string[];
  // 软中断信息
  softirq_info: {
    [key in string]: {
      softirq_count: number;
      softirq_count_list: number[];
    };
  };
};

// 网络 IO统计 接口
interface NetIORow {
  cpuCore: string;
  user: string;
  nice: string;
  system: string;
  iowait: string;
  irq: string;
  soft: string;
  idle: string;
  showDetails?: boolean;
  levelIndex?: number;
  children?: NetIORow[];
}

interface NetIODetail {
  'rxpck/s': string;
  'txpck/s': string;
  'rxkB/s': string;
  'txkB/s': string;
}
interface NetIO {
  [key: string]: NetIODetail;
}

export { NetIORow, NetIODetail, NetIO };
