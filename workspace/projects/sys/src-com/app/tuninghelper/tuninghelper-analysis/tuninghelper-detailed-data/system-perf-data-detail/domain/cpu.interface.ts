import { CommonTableData } from 'projects/sys/src-com/app/shared/domain';

interface CpuUtilization {
  value: string | number;
  usr: string | number;
  nice: string | number;
  sys: string | number;
  iowait: string | number;
  irq: string | number;
  soft: string | number;
  idle: string | number;
  showSub?: boolean;
  level?: number;
  subData?: CpuUtilization[];
}

interface CpuLoad {
  blocked: string;
  'ldavg-1': string;
  'ldavg-5': string;
  'ldavg-15': string;
  'plist-sz': string;
  'runq-sz': string;
}
interface CpuContextSwitch {
  'proc/s': string;
  'cswch/s': string;
}
interface CoreDetail {
  cpu_process: string[];
  cpu_hard_irq: Array<any>;
  cpu_soft_irq: Array<any>;
}

interface MetricsList {
  title: string;
  prop: string;
  open: boolean;
  data?: CommonTableData;
}

interface CpuIrqInfo {
  cpu_core: number;
  irq_affinity_mask_dict: {};
  irq_affinity_mask_num: number;
  rps_affinity_mask_dict: {};
  rps_affinity_mask_num: number;
  xps_affinity_mask_dict: {};
  xps_affinity_mask_num: number;
}

interface IrqAffinityDetail {
  eth_name: string;
  irq_affinity_mask: string;
  irq_count: 0;
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

interface TableContainerData {
  // 表格标题
  title?: string;
  // 表格高度
  height?: string;
  columns: {
    // 列名
    title: string;
    // 列宽
    width?: string;
    // 排序字段
    sortKey?: string;
    // 默认升序(true)降序(false)不排序('none')与sortKey同传
    asc?: boolean | string,
    // 搜索字段
    searchKey?: string;
    // 列属性名
    prop: string;
    // 辅助说明字段
    dataKey?: string;
    // 回调函数
    callBack?: boolean;
  }[];
  // 表格源数据
  srcData: any[];
  // 复选行已选中行
  selectedData?: any[];
}
interface Affinity {
  softirq_count_list: number[];
  softirq_count: number;
}
interface SoftwareInterTableData {
  [key: string]: Affinity;
}
interface SoftwareInterRowData {
  type: string;
  label: string; // 用于过滤
  frequency: number;
  softCountList: number[];
}
export {
  // Cpu利用率
  CpuUtilization,
  // Cpu负载
  CpuLoad,
  // 任务创建和上下文切换统计
  CpuContextSwitch,
  // core详情
  CoreDetail,
  // 进程详情
  MetricsList,
  // 硬中断信息CpuCore视图
  CpuIrqInfo,
  // 中断绑核详情信息
  IrqAffinityDetail,
  // TableContainerComponent表格组件参数
  TableContainerData,
  // 软中断分布
  Affinity,
  SoftwareInterTableData,
  SoftwareInterRowData
};

