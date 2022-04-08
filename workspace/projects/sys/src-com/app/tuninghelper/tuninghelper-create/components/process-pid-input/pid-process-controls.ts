/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FormGroup, ValidationErrors, AbstractControl, } from '@angular/forms';
import { Observable } from 'rxjs';

interface PidProcess {
  targetPid?: string; // pid 的值
  processName?: string; // 进程名称
}
/**
 * NONE: pid 和 process 都没有
 * BOTH: pid 和 process 都有
 * PID: 只有 pid
 * PROCESS: 只有 process
 * PID_TEN：pid 的数量为10
 */
enum ValueState {
  NONE,
  BOTH,
  PID,
  PROCESS,
  PID_TEN,
}

/**
 * PID: pid 可输入
 * PROCESS: process 可输入
 * BOTH: pid 和 process 可输入
 * PID_ONLY: pid 的条数超过10 ，仅 pid 可输入
 */
enum ControlsState {
  PID,
  PROCESS,
  BOTH,
  PID_ONLY,
}

/**
 * 为组件提供：控件交互逻辑处理；控件输入验证等服务
 *
 * @publicApi initControlsInteraction: 初始化控件之间的交互逻辑
 * @publicApi pidInputValidator: pid 的输入的验证器
 * @publicApi splitStr: 将输入的字符串分隔符分割为数组, 并去掉末尾的空字符
 * @publicApi setControlsByWrite: 根据输入状态设置控件的状态
 */
export class PidProcessControls {
  private atMostPid: number;
  constructor(
    atMostPid: number
  ) {
    this.atMostPid = atMostPid;
  }

  /**
   * 初始化控件之间的交互逻辑
   * @param ppFormGroup 控件组
   */
  public initControlsInteraction(ppFormGroup: FormGroup) {
    const ctl = ppFormGroup.controls;

    // 可订阅的控件的 valueChanges 主题
    const pidCheckChange$ = ctl.pidCheck.valueChanges;
    const processCheckChange$ = ctl.processCheck.valueChanges;
    const pidInputChange$ = ctl.pidInput.valueChanges;

    // Pid 的 Checkbox 的交互逻辑
    pidCheckChange$.subscribe((enable: boolean) => {
      if (enable) {
        ctl.pidInput.enable({ emitEvent: false });
        ctl.processCheck.enable({ emitEvent: false });
      } else {
        ctl.pidInput.disable({ emitEvent: false });
        ctl.pidInput.setValue('', { emitEvent: false });

        ctl.processCheck.disable({ emitEvent: false });
      }
    });

    // 进程名称的 Checkbox 的交互逻辑
    processCheckChange$.subscribe((enable: boolean) => {
      if (enable) {
        ctl.processInput.enable({ emitEvent: false });
        ctl.pidCheck.enable({ emitEvent: false });
      } else {
        ctl.processInput.disable({ emitEvent: false });
        ctl.processInput.setValue('', { emitEvent: false });

        ctl.pidCheck.disable({ emitEvent: false });
      }
    });

    // Pid 的输入的交互逻辑
    this.handlePidInputChange(pidInputChange$, ppFormGroup);
  }

  /**
   * pid 的输入的验证器
   * @param i18n 翻译
   */
  public pidInputValidator(i18n: any) {
    // 用于记录上一次输入的 pid 值
    let prevPidList: string[] = [];

    return (control: AbstractControl): ValidationErrors | null => {
      const pidInput: string = control.value;

      // 分割
      let pidList = this.splitStr(pidInput);

      // 当 pid 的输入大于atMostPid时，输入无效
      if (pidList.length > this.atMostPid) {
        control.setValue(prevPidList.join(','), { emitEvent: false });
        pidList = [...prevPidList];
      } else {
        prevPidList = [...pidList];
      }

      // 验证 pid 的合理性
      const isVaildPid = pidList.every(item => /^[1-9][0-9]*$/.test(item));
      if (!isVaildPid) {
        return { pid: { tiErrorMessage: i18n.mission_create.pid_valid_tip } };
      }

      return null;
    };
  }

  /**
   * 根据输入状态设置控件的状态
   * @param formGroup 控件组
   * @param value 写入值
   */
  public setControlsByWrite(formGroup: FormGroup, value: PidProcess) {
    const ctl = formGroup.controls;

    // 由写入值，确定值状态
    const { targetPid, processName } = value;
    let valueState = ValueState.PROCESS;
    const pidIs = targetPid != null && targetPid !== '';
    const processIs = processName != null && processName !== '';
    switch (true) {
      case !pidIs && !processIs:
        valueState = ValueState.NONE;
        break;
      case !pidIs && processIs:
        valueState = ValueState.PROCESS;
        break;
      case pidIs && !processIs:
        valueState = ValueState.PID;
        break;
      case pidIs && processIs:
        valueState = ValueState.BOTH;
        break;
      default:
    }
    if (valueState === ValueState.PID) {
      const pidValue = ctl.pidInput.value;
      const pidNum = this.splitStr(pidValue).length;
      if (pidNum >= this.atMostPid) {
        valueState = ValueState.PID_TEN;
      }
    }

    // 由值状态, 确定控件状态
    let controlsState: ControlsState;
    switch (valueState) {
      case ValueState.NONE:
      case ValueState.PROCESS:
        controlsState = ControlsState.PROCESS;
        break;
      case ValueState.PID:
        controlsState = ControlsState.PID;
        break;
      case ValueState.BOTH:
        controlsState = ControlsState.BOTH;
        break;
      case ValueState.PID_TEN:
        controlsState = ControlsState.PID_ONLY;
        break;
      default:
    }

    // 设置控件状态
    this.setControlsState(formGroup, controlsState);
  }

  /**
   * 将输入的字符串分隔符分割为数组, 并去掉末尾的空字符
   * @example
   * 1,2,3 : [1, 2, 3]
   * 1,2,3, : [1, 2, 3]
   * @param pidInput pid 输入的字符串
   * @param separator 分隔符，默认为: ','
   */
  public splitStr(str: string, separator: string = ','): string[] {
    // 为空不判断
    if (str === '' || str == null) { return []; }

    // 分割 pid
    const list = str.split(separator);

    // 去尾部的空值
    const last = list.pop();
    if (last !== '') {
      list.push(last);
    }

    return list;
  }

  /**
   * Pid 的输入的交互逻辑
   * @param pidCheckChange$ Pid 的输入的变化的主题
   */
  private handlePidInputChange(pidInputChange$: Observable<any>, ppFormGroup: any) {
    const ctl: { [key: string]: AbstractControl } = ppFormGroup.controls;

    let isOnceOverstep = false;
    let processStateBefore: {
      inputEnabled: boolean;
      inputValue: string;
      checkEnabled: boolean;
      checkValue: boolean;
    } = null;

    let pidStateBefore: {
      checkEnabled: boolean,
    } = null;

    pidInputChange$.subscribe((input: string) => {
      // 分割
      const pidList = this.splitStr(input);

      // 当 pid 的输入大于等于atMostPid时，线程名称输入无效
      if (pidList.length >= this.atMostPid && !isOnceOverstep) {
        processStateBefore = {
          inputEnabled: ctl.processInput.enabled,
          inputValue: ctl.processInput.value,
          checkEnabled: ctl.processCheck.enabled,
          checkValue: ctl.processCheck.value,
        };

        pidStateBefore = {
          checkEnabled: ctl.pidCheck.enabled,
        };

        this.setControlsState(ppFormGroup, ControlsState.PID_ONLY);

        isOnceOverstep = true;
      }

      // 当 pid 的输入恢复小于atMostPid时，线程名称的状态恢复恢复从前
      if (isOnceOverstep && pidList.length < this.atMostPid) {
        if (processStateBefore.inputEnabled) { ctl.processInput.enable({ emitEvent: false }); }
        ctl.processInput.setValue(processStateBefore.inputValue, { emitEvent: false });
        if (processStateBefore.checkEnabled) { ctl.processCheck.enable({ emitEvent: false }); }
        ctl.processCheck.setValue(processStateBefore.checkValue, { emitEvent: false });

        if (pidStateBefore.checkEnabled) { ctl.pidCheck.enable({ emitEvent: false }); }

        processStateBefore = null;
        pidStateBefore = null;
        isOnceOverstep = false;
      }
    });
  }

  /**
   * 设置控件状态
   * @param formGroup 控件组
   * @param state 控件状态枚举
   */
  private setControlsState(formGroup: FormGroup, state: ControlsState) {
    const ctl = formGroup.controls;
    switch (state) {
      case ControlsState.PROCESS:
        ctl.processCheck.disable({ emitEvent: false });
        ctl.processCheck.setValue(true, { emitEvent: false });
        ctl.processInput.enable({ emitEvent: false });

        ctl.pidCheck.enable({ emitEvent: false });
        ctl.pidCheck.setValue(false, { emitEvent: false });
        ctl.pidInput.disable({ emitEvent: false });
        ctl.pidInput.setValue('', { emitEvent: false });
        break;
      case ControlsState.PID:
        ctl.pidCheck.disable({ emitEvent: false });
        ctl.pidCheck.setValue(true, { emitEvent: false });
        ctl.pidInput.enable({ emitEvent: false });

        ctl.processCheck.enable({ emitEvent: false });
        ctl.processCheck.setValue(false, { emitEvent: false });
        ctl.processInput.disable({ emitEvent: false });
        ctl.processInput.setValue('', { emitEvent: false });
        break;
      case ControlsState.BOTH:
        ctl.pidCheck.enable({ emitEvent: false });
        ctl.pidCheck.setValue(true, { emitEvent: false });
        ctl.pidInput.enable({ emitEvent: false });

        ctl.processCheck.enable({ emitEvent: false });
        ctl.processCheck.setValue(true, { emitEvent: false });
        ctl.processInput.enable({ emitEvent: false });
        break;
      case ControlsState.PID_ONLY:
        ctl.pidCheck.disable({ emitEvent: false });
        ctl.pidCheck.setValue(true, { emitEvent: false });
        ctl.pidInput.enable({ emitEvent: false });

        ctl.processCheck.disable({ emitEvent: false });
        ctl.processCheck.setValue(false, { emitEvent: false });
        ctl.processInput.disable({ emitEvent: false });
        ctl.processInput.setValue('', { emitEvent: false });
        break;
      default:
    }
  }
}
