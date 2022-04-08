/** 任务分析类型 */
export enum AnalysisType {
  // 微架构分析
  Microarchitecture = 'microarchitecture',
  // 伪共享分析
  FalseSharing = 'falsesharing',
  // 访存统计分析
  MemAccess = 'mem_access',
  // 热点函数分析
  CProgram = 'C/C++ Program',
  // 任务阻塞，采用锁与等待分析功能分析
  SystemLock = 'system_lock',
  // 资源调度分析
  ResourceSchedule = 'resource_schedule',
  // 内存诊断调试分析
  MemoryDiagnostic = 'memory_diagnostic',
  // 网络IO诊断调试分析
  NetioDiagnostic = 'netio_diagnostic',
  // 查看top %user进程线程分析
  ProcessThreadAnalysisUser = 'process_thread_analysis_user',
  // 查看top %system进程线程分析
  ProcessThreadAnalysisSys = 'process_thread_analysis_sys',
  // 查看进程线程性能详细数据
  ProcessPerformanceDetail = 'process_performance_detail',
}

/** 任务操作类型 */
export enum TaskOperationType {
  // 创建
  Create = 'create',
  // 重启
  Restart = 'restart'
}

