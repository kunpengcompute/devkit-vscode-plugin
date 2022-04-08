import { OptStateInfo } from './opt-state-info.model';
import { BatchOptState } from '../domain';
import { TemplateRef } from '@angular/core';
import { TiModalConfig, TiModalRef } from '@cloud/tiny3';
import { StateMachineRef } from './state-machine-ref.model';

export type OpenModelFn = (
  tpl: TemplateRef<any>,
  config?: TiModalConfig
) => TiModalRef;

/**
 * 状态调度器
 */
export interface IStateScheduler {
  exec: (
    initPayLoad: any,
    fsmRef: StateMachineRef,
    stateMap: Map<BatchOptState, OptStateInfo>,
    openModel: OpenModelFn
  ) => void;
}
