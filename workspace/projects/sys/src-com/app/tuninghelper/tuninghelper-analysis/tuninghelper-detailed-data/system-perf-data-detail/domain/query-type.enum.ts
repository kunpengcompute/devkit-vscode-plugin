export enum QueryTypeEnum {
  CPUUTILIZATION = 'cpu_utilization', // CPU利用率
  CPUALLPROCESS = 'cpu_all_process', // 所有运行的进程、线程
  CPULOAD = 'cpu_load', // cpu负载
  CPUPROCESSINFO = 'cpu_process_info', // 单个core运行的进程、线程
  CPUALLIRQINFO = 'cpu_all_irq_info', // 软-硬中断信息
  CPUHARDIRQ = 'cpu_hard_irq', // 硬中断
  CPUSOFTIRQ = 'cpu_soft_irq', // 软中断
  CPUMICROINFO = 'cpu_micro_info', // 微架构
  CPUCONTEXTSWITCH = 'cpu_context_switch', // 任务创建和上下文切换统计
  INDICATOR_INFORMATION = 'indicator_information', // 指标信息
  MICROARCHITECTURE_METRICS = 'microarchitecture_metrics', // 微架构指标
  MEMORY_ACCESS_INDICATOR = 'memory_access_indicator', // 内存指标
  CPU_AFFINITY = 'cpu_affinity', // CPU亲和性
  MEMORY_AFFINITY = 'memory_affinity', // 内存亲和性
  PROCESS_NUMA_ALLOCATION = 'process_numa_allocation', // 进程内存段NUMA分布
  HOTSPOT_FUNCTION = 'hotspot_function', // 热点函数
  HOTSPOT_MODULE = 'hotspot_module', // 热点函数
  OPERATED_FILEDS = 'operated_files', // 操作的文件
  OPERATED_NETWORK_PORT = 'operated_network_port', // 操作的网口
  SYSTEM_CALL = 'system_call', // 系统调用
}
