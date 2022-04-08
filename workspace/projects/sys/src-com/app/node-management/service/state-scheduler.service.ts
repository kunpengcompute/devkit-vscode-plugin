import { Injectable, Injector, Type } from '@angular/core';
import { TiPopupService } from '@cloud/tiny3';
import { BatchOptEvent, BatchOptState, BatchOptType } from '../domain';
import {
  DispatchInfo,
  StateBaseOpreation,
  StateController,
  OptStateInfo,
  OpenModelFn,
} from '../model';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateSchedulerService implements StateBaseOpreation {
  inited = new BehaviorSubject<StateController>(null);
  dispatch = new Subject<DispatchInfo>();

  /** 有限状态机 */
  private fsm: any;
  /** 状态和状态操作信息的map */
  private stateMap: Map<BatchOptState, OptStateInfo>;
  /** 弹框函数 */
  private openModel: OpenModelFn;
  /** 当前状态机的状态 */
  private currFsmState: BatchOptState;

  /** 当前的状态操作信息 */
  private currStateInfo: OptStateInfo;
  /** 当前分发信息 */
  private currDispatchInfo: DispatchInfo;

  constructor(
    private tiPopupServe: TiPopupService<StateBaseOpreation>,
    private injector: Injector
  ) {
    this.inited.next({
      action: (
        payLoad: {
          batchOptType: BatchOptType;
          fsmRef: any;
          stateMap: Map<BatchOptState, OptStateInfo>;
        },
        openModel: OpenModelFn
      ) => {
        const { fsmRef, stateMap, batchOptType } = payLoad;
        this.fsm = fsmRef.getStateMachine();
        this.stateMap = stateMap;
        this.openModel = openModel;

        // 初始化操作
        this.currDispatchInfo = {
          event: BatchOptEvent.BatchAction,
        };
        const { initialState } = this.fsm;
        const nextState = this.fsm.transition(
          initialState,
          BatchOptEvent.BatchAction
        );
        this.currFsmState = nextState.value;
        this.currStateInfo = this.stateMap.get(this.currFsmState);
        this.schedule(batchOptType);
      },
    });
  }

  /**
   * 各个状态之间的调度函数
   * @param batchOptType 批量操作类型
   */
  private async schedule(batchOptType: BatchOptType) {
    while (true) {
      switch (this.currStateInfo.type) {
        case 'component':
          this.currDispatchInfo = await this.componentHandler(
            batchOptType,
            this.currStateInfo.token,
            this.currDispatchInfo?.payLoad
          );
          break;
        case 'service':
          this.currDispatchInfo = await this.serviceHandler(
            batchOptType,
            this.currStateInfo.token,
            this.currDispatchInfo?.payLoad
          );
          break;
        default:
          throw new Error('Schedule process error');
      }

      const nextState = this.fsm.transition(
        this.currFsmState,
        this.currDispatchInfo.event
      );
      this.currFsmState = nextState.value;
      this.currStateInfo = this.stateMap.get(this.currFsmState);

      // 当操作成功时，派发通知
      if (
        [BatchOptEvent.DeleteSuccess, BatchOptEvent.ImportSuccess].includes(
          this.currDispatchInfo.event
        )
      ) {
        this.dispatch.next({
          event: this.currDispatchInfo.event,
        });
      }

      // 当状态为空时， 停止调度
      if (BatchOptState.EmptyStatus === this.currFsmState) {
        break;
      }
    }
  }

  /**
   * 组件状态的处理者
   * @param batchOptType 批量操作类型
   * @param token 令牌
   * @param payLoad 负载
   * @returns 派发的信息
   */
  private componentHandler(
    batchOptType: BatchOptType,
    componentType: Type<StateBaseOpreation>,
    payLoad: any
  ): Promise<DispatchInfo> {
    // 创建 Component 的引用
    const componentRef = this.tiPopupServe.createCompoentRef({
      componentType,
    });

    const instance: StateBaseOpreation = componentRef.instance;
    instance.batchOptType = batchOptType;
    return new Promise((resolve) => {
      instance.dispatch.subscribe((info: DispatchInfo) => {
        if (null == info) {
          return;
        }
        resolve(info);
      });
      instance.inited.subscribe((controller: StateController) => {
        if (null == controller) {
          return;
        }
        controller.action(payLoad, this.openModel);
      });
    });
  }

  /**
   * 服务状态的处理者
   * @param batchOptType 批量操作类型
   * @param token 令牌
   * @param payLoad 负载
   * @returns 派发的信息
   */
  private serviceHandler(
    batchOptType: BatchOptType,
    token: Type<StateBaseOpreation>,
    payLoad: any
  ): Promise<DispatchInfo> {
    // 获取依赖的实例
    const instance: StateBaseOpreation = this.injector.get(token);
    instance.batchOptType = batchOptType;
    return new Promise((resolve) => {
      instance.dispatch.subscribe((info: DispatchInfo) => {
        if (null == info) {
          return;
        }
        resolve(info);
      });
      instance.inited.subscribe((controller: StateController) => {
        if (null == controller) {
          return;
        }
        controller.action(payLoad);
      });
    });
  }
}
