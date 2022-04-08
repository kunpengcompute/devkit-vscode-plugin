import { BehaviorSubject, Subject } from 'rxjs';
import { BatchOptEvent, BatchOptType } from '../domain';
import { OpenModelFn } from './state-scheduler.model';

/**
 * 用于表征控制承载弹框实例的操作
 */
export interface StateController {
  action: (payLoad?: any, openModel?: OpenModelFn) => void;
  dismiss?: () => void;
}

/**
 * 用于表征控制承载弹框实例的操作
 */
export interface DispatchInfo {
  event: BatchOptEvent;
  payLoad?: any;
}

/**
 * 批量导入/删除的的基础操作
 */
export interface StateBaseOpreation {
  // 批量操作类型
  batchOptType?: BatchOptType;
  // 初始化完成
  inited: BehaviorSubject<StateController>;
  // 派遣事件
  dispatch: Subject<DispatchInfo>;
}
