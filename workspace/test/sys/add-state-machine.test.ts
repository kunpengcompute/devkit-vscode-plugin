import {
  BatchOptEvent,
  BatchOptState,
} from 'sys/src-com/app/node-management/domain';
import { AddStateMachine } from 'sys/src-com/app/node-management/util';

describe('addStateMachine', () => {
  const addStateMachine = new AddStateMachine();

  const addFsm = addStateMachine.getStateMachine();
  const { initialState } = addFsm;
  const state1 = addFsm.transition(initialState, BatchOptEvent.BatchAction);

  // 上传和下载模板
  test('TemplateUpDown', () => {
    const state2 = addFsm.transition(state1, BatchOptEvent.UploadTpl);
    expect(state2.value).toEqual(BatchOptState.ExcelParse);

    const state3 = addFsm.transition(state1, BatchOptEvent.Replace);
    expect(state3.value).toEqual(BatchOptState.TemplateUpDown);

    const state4 = addFsm.transition(state3, BatchOptEvent.Error);
    expect(state4.value).toEqual(BatchOptState.EmptyStatus);

    const state5 = addFsm.transition(state4, BatchOptEvent.Close);
    expect(state5.value).toEqual(BatchOptState.EmptyStatus);
  });

  // 文件解析和类型、节点数量校验。展示校验失败原因，选择重试或替换
  test('ExcelParse', () => {
    const state2 = addFsm.transition(state1, BatchOptEvent.UploadTpl);
    expect(state2.value).toEqual(BatchOptState.ExcelParse);

    const state5 = addFsm.transition(state2, BatchOptEvent.Close);
    expect(state5.value).toEqual(BatchOptState.EmptyStatus);
  });

  // 数据有效性验证（逻辑）
  test('DataValid', () => {
    const state4 = addFsm.transition(state1, BatchOptEvent.UploadTpl);
    expect(state4.value).toEqual(BatchOptState.ExcelParse);

    const state5 = addFsm.transition(state4, BatchOptEvent.Success);
    expect(state5.value).toEqual(BatchOptState.DataValid);

    const state6 = addFsm.transition(state5, BatchOptEvent.Fail);
    expect(state6.value).toEqual(BatchOptState.DataValidFail);

    const state7 = addFsm.transition(state6, BatchOptEvent.Close);
    expect(state7.value).toEqual(BatchOptState.EmptyStatus);

    const state8 = addFsm.transition(state5, BatchOptEvent.Success);
    expect(state8.value).toEqual(BatchOptState.BackValid);
  });

  // 后端验证（秘钥和私钥）（逻辑）
  test('BackValid', () => {
    const state4 = addFsm.transition(state1, BatchOptEvent.UploadTpl);
    expect(state4.value).toEqual(BatchOptState.ExcelParse);

    const state5 = addFsm.transition(state4, BatchOptEvent.Success);
    expect(state5.value).toEqual(BatchOptState.DataValid);

    const state8 = addFsm.transition(state5, BatchOptEvent.Success);
    expect(state8.value).toEqual(BatchOptState.BackValid);

    const state14 = addFsm.transition(state8, BatchOptEvent.Error);
    expect(state14.value).toEqual(BatchOptState.EmptyStatus);

    const state9 = addFsm.transition(state8, BatchOptEvent.Fail);
    expect(state9.value).toEqual(BatchOptState.BackValidFail);

    const state10 = addFsm.transition(state9, BatchOptEvent.Close);
    expect(state10.value).toEqual(BatchOptState.EmptyStatus);

    const state11 = addFsm.transition(state8, BatchOptEvent.Success);
    expect(state11.value).toEqual(BatchOptState.Fingerprint);
  });

  // 添加节点
  test('addNodes', () => {
    const state4 = addFsm.transition(state1, BatchOptEvent.UploadTpl);
    expect(state4.value).toEqual(BatchOptState.ExcelParse);

    const state5 = addFsm.transition(state4, BatchOptEvent.Success);
    expect(state5.value).toEqual(BatchOptState.DataValid);

    const state8 = addFsm.transition(state5, BatchOptEvent.Success);
    expect(state8.value).toEqual(BatchOptState.BackValid);

    const state11 = addFsm.transition(state8, BatchOptEvent.Success);
    expect(state11.value).toEqual(BatchOptState.Fingerprint);

    const state12 = addFsm.transition(state11, BatchOptEvent.Confirm);
    expect(state12.value).toEqual(BatchOptState.AddNodes);

    const state13 = addFsm.transition(state12, BatchOptEvent.ImportSuccess);
    expect(state13.value).toEqual(BatchOptState.EmptyStatus);
    const state14 = addFsm.transition(state12, BatchOptEvent.Error);
    expect(state14.value).toEqual(BatchOptState.EmptyStatus);

    const state15 = addFsm.transition(state11, BatchOptEvent.Cancel);
    expect(state15.value).toEqual(BatchOptState.EmptyStatus);
  });
});
