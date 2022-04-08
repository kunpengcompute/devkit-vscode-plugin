/** com - sys 消息类型 */
export enum TuningSysMessageType {
  // 创建、重启任务
  CreateSysTask = 'createSysTask',
  // 查看任务
  ViewSysTask = 'viewSysTask',
  // 查看关联报告
  ViewAssociatedReport = 'viewAssociatedReport',
  // 更新优化建议
  UpdateOptimization = 'updateOptimization',
  // 更新优化建议
  UpdateRecord = 'updateTuningRecordDetail',
}
