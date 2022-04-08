import { Subject } from 'rxjs';
import { PaginationType } from 'sys/src-com/app/shared/domain';
import {
  CpuTargetStatus,
  OptimizationTypeEnum,
  ServiceType,
  SuggestionSelectValue,
  TargetThreshold
} from '../tuninghelper-task-detail/domain';
import { ProcessCpuTarget } from '../tuninghelper-task-detail/process-perf/domain';
import { SystemCpuTarget } from '../tuninghelper-task-detail/system-perf/domain';

/**
 * 状态管理服务
 *
 * 保存了调优助手详情页的公共状态
 */
export class TuninghelperStatusService {

  /**
   * 节点id
   */
  public nodeId: number;
  /**
   * 任务id
   */
  public taskId: number;

  /**
   * 所属用户id
   */
  public ownerId: string;
  /**
   * 业务类型复选框选择状态
   */
  public serviceType: Array<ServiceType> = [];
  public serviceTypeChange = new Subject<Array<ServiceType>>();

  /**
   * 选择的建议范围
   */
  public suggestionSelect: SuggestionSelectValue;

  /** cpu指标详情 */
  public cpuTargetDetail: {
    /** 系统性能 */
    [OptimizationTypeEnum.systemPerf]: {
      /** 当前选中指标 */
      currTarget: SystemCpuTarget;
      /** 当前选中指标阈值 */
      currThreshold: TargetThreshold;
      /** 当前查看的cpu状态 */
      currCoreView: CpuTargetStatus;
    },
    /** 进程线程性能 */
    [OptimizationTypeEnum.processPerf]: {
      /** 当前选中指标 */
      currTarget: ProcessCpuTarget;
      /** 当前选中指标阈值 */
      currThreshold: TargetThreshold;
      /** 当前查看的cpu状态 */
      currCoreView: CpuTargetStatus;
    }
  } = {
    systemPerf: {
      currTarget: SystemCpuTarget.sys,
      currThreshold: {
        id: 0,
        lowValue: 0,
        highValue: 0,
      },
      currCoreView: 'busy',
    },
    processPerf: {
      currTarget: ProcessCpuTarget.sys,
      currThreshold: {
        id: 0,
        lowValue: 0,
        highValue: 0,
      },
      currCoreView: 'busy',
    }
  };

  /** 是否展开右侧详情 */
  public rightExpand = false;
  public rightExpandChange = new Subject<boolean>();

  /** 分页类型 */
  public paginationType: {
    [name in PaginationType]: PaginationType
  } = {
    mini: 'mini',
    simple: 'simple',
    default: 'default'
  };

  /**
   * 获取接口传值的业务类型
   * @returns 字符串数组
   */
  public getServiceType(): string {
    return JSON.stringify(this.serviceType.filter(item => item.checked)
    .map(item => item.value));
  }
}
