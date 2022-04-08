/**
 * 任务分析状态
 * 值为后端返回的任务分析状态
 *
 * --目前不全，后期需要用到请新增
 */
export enum TaskStatus {
  Created = 'Created',
  Waiting = 'Waiting',
  Sampling = 'Sampling',
  Analyzing = 'Analyzing',
  Stopping = 'Stopping',
  Aborted = 'Aborted',
  Failed = 'Failed',
  Completed = 'Completed',
  On = 'on',
  Off = 'off',
  Cancelled = 'Cancelled',
  Cancelling = 'Cancelling'
}
