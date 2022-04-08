import { FormGroup } from '@angular/forms';

/**
 * 本服务 为 PidProcessInputComponent 提供状态设置服务
 * @description
 *
 * @publicApi setControlsDisableState 设置组件的disable状态 和 恢复disable前的状态
 *
 * @usageNotes
 * 因为本服务以依赖注入的方式提供，在使用时只能获取单例，并且在服务中设有属性（prevPidProcess），
 * 故多处使用时，应该十分谨慎
 */
export class PidProcessDisableUtil {
  /**
   * 根据 isDisable 来组件的disable状态 和 恢复disable前的状态
   * @param formGroup 控件组
   * @param isDisable 是否为 disable 状态
   */
  static handleControlsDisableState(formGroup: FormGroup, isDisable: boolean, prevDisabledState: any) {
    const ctl = formGroup.controls;
    if (isDisable) {
      prevDisabledState = {
        processCheckDisable: ctl.processCheck.disabled,
        processInputDisable: ctl.processInput.disabled,
        pidCheckDisable: ctl.pidCheck.disabled,
        pidInputDisable: ctl.pidInput.disabled,
      };
      ctl.processCheck.disable({ emitEvent: false });
      ctl.processInput.disable({ emitEvent: false });
      ctl.pidCheck.disable({ emitEvent: false });
      ctl.pidInput.disable({ emitEvent: false });
    } else {
      if (prevDisabledState == null) { return; }

      if (!prevDisabledState.processCheckDisable) { ctl.processCheck.enable({ emitEvent: false }); }
      if (!prevDisabledState.processInputDisable) { ctl.processInput.enable({ emitEvent: false }); }
      if (!prevDisabledState.pidCheckDisable) { ctl.pidCheck.enable({ emitEvent: false }); }
      if (!prevDisabledState.pidInputDisable) { ctl.pidInput.enable({ emitEvent: false }); }
    }
    return prevDisabledState;
  }
}
