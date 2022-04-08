import { createMachine } from '@xstate/fsm';
import { StateMachineRef } from '../model';
import { baseStateConfig } from './base-state-config';

export class AddStateMachine implements StateMachineRef {
  private fsmConfig = {
    initial: 'emptyStatus',
    states: {
      ...baseStateConfig,
      // 后端验证（秘钥和私钥）（逻辑）
      backValid: {
        on: {
          fail: 'backValidFail',
          success: 'fingerprint',
          error: 'emptyStatus',
        },
      },
      // 验证失败的节点信息展示
      backValidFail: {
        on: {
          close: 'emptyStatus',
        },
      },
      // 查询节点关联工程（逻辑）
      fingerprint: {
        on: {
          confirm: 'addNodes',
          cancel: 'emptyStatus',
        },
      },
      // 查询节点关联工程（逻辑）
      addNodes: {
        on: {
          importSuccess: 'emptyStatus',
          error: 'emptyStatus',
        },
      },
    },
  };

  getStateMachine(): any {
    return createMachine(this.fsmConfig);
  }
}
