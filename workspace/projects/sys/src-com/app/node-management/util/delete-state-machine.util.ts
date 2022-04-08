import { createMachine } from '@xstate/fsm';
import { StateMachineRef } from '../model';
import { baseStateConfig } from './base-state-config';

export class DeleteStateMachine implements StateMachineRef {
  private fsmConfig = {
    initial: 'emptyStatus',
    states: {
      ...baseStateConfig,
      // 后端验证（秘钥和私钥）（逻辑）
      backValid: {
        on: {
          fail: 'backValidFail',
          success: 'queryNodeProject',
          error: 'emptyStatus',
        },
      },
      // 后端验证（秘钥和私钥）失败
      backValidFail: {
        on: {
          close: 'emptyStatus',
        },
      },
      // 查询节点关联工程（逻辑）
      queryNodeProject: {
        on: {
          noRelation: 'fingerprint',
          relation: 'displayNodeProject',
          error: 'emptyStatus',
        },
      },
      // 工程关联节点展示页面
      displayNodeProject: {
        on: {
          confirm: 'deleteNodeProject',
          cancel: 'emptyStatus',
        },
      },
      // 删除关联工程（逻辑）
      deleteNodeProject: {
        on: {
          success: 'fingerprint',
          error: 'emptyStatus',
        },
      },
      // 确认指纹页面
      fingerprint: {
        on: {
          cancel: 'emptyStatus',
          confirm: 'deleteNodes',
        },
      },
      // 删除节点（逻辑）
      deleteNodes: {
        on: {
          deleteSuccess: 'emptyStatus',
          error: 'emptyStatus',
        },
      },
    },
  };

  getStateMachine() {
    return createMachine(this.fsmConfig);
  }
}
