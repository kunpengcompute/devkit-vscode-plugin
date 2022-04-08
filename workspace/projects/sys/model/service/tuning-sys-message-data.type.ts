/** 消息data详情 */

/** 创建、重启任务 */
export type TuningSysCreateTaskData = {
  scenes: number,  // 前端通用场景 3
  task: {
    projectId: number,  // 创建好的工程id
    projectName: string,  // 创建好的工程名
    analysisType: string,  // 任务分析类型
    nodeId: number,  // 节点id
    nickName: string,
    suggestionId: number,  // 优化建议id
    optimizationId: number,  // 调优助手任务id
    isFromTuningHelper: true,  // 调优助手创建任务的标识
    tabPanelId: string,  // 当前页签id标识
    id: number,  // 已创建的分析任务id
    isCreateDiagnoseTask: boolean,  // 是否是创建内存诊断分析任务
    sysTasktName?: string,   // 已创建的分析任务名  vscdoe用到
  },
  type: string
};

/** 查看分析报告 */
export type TuningSysViewTaskData = {
  nodeId: number, // 节点的id
  taskId: number, // sys任务的id
  analysisType: string,  // 任务分析类型,
  taskName: string,  // sys任务名称,
  projectName: string,  // sys工程名称,
  nodeIP: string, // 节点IP
  isFromTuningHelper: boolean,  // 调优助手创建任务的标识
  isCreateDiagnoseTask: boolean,
};

/** 查看关联报告（分析路径） */
export type ViewAssociatedReportData = {
  projectName: string,  // 工程名称
  taskDetail: any;  // 任务详情
};



/** 更新优化建议 */
export type updateOptimizationData = {
  tabPanelId: string;  // tab页签id
};




