export enum CompareQueryTypeEnum {
  // 对比分析请求类型
  CPUUTILIZATION = 'cpu_utilization', // CPU利用率
  CPULOAD = 'cpu_load', // cpu负载
  CPUMICROINFO = 'cpu_micro_info', // 微架构
  CPUCONTEXTSWITCH = 'cpu_context_switch', // 任务创建和上下文切换统计
  NUMA_INFO = 'numa_info', // numa node
  SOFTIRQINFO = 'softirq_info', // 软中断
  CPUMICRO = 'cpu_micro', // 微架构
  CPU_IRQ_INFO = 'cpu_irq_info', // 中断信息-硬中断编号视图
  IRQ_CPU_INFO = 'irq_cpu_info', // cpu视图
  INTERRUPT_DISTRIBUTION = 'interrupt_distribution', // 中断分布
  INTERRUPT_DISTRIBUTIONS = 'interrupt_distributions' // 中断分布echarts
}
