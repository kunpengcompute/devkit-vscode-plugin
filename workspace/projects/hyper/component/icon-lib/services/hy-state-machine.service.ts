import { Injectable } from '@angular/core';
import { HyIconStatus, HyIconEvent } from '../domain';
import { HyIconLibServiceModule } from './hy-icon-lib.service.module';

@Injectable({
  providedIn: HyIconLibServiceModule
})
export class HyStateMachineService {

  constructor() { }

  /**
   * 根据 icon 的状态的有限状态机来设置 icon 的状态
   *
   * @param iEvent 事件类型
   *
   * @useages 此函数一般在事件回调中使用，它会事件被放到回调队列中的什么位置，
   * 在小概率上会出现逻辑上的“错误”，因为事件何时将响应逻辑交给回调队列，
   * 有太多的不可控因素。所以 icon 的有限状态机会有反逻辑的状态转换。
   * 在出现反逻辑的状态转换时，会将传入的状态作为返回值。
   */
  calcIconStatus(iStatus: HyIconStatus, iEvent: HyIconEvent): HyIconStatus {

    if (iStatus === HyIconStatus.Normal) {
      switch (iEvent) {
        case HyIconEvent.IconEnter:
          return HyIconStatus.Hover;
        default:
      }
    } else if (iStatus === HyIconStatus.Hover) {
      switch (iEvent) {
        case HyIconEvent.IconDown:
          return HyIconStatus.Active;
        case HyIconEvent.IconLeave:
          return HyIconStatus.Normal;
        default:
      }
    } else if (iStatus === HyIconStatus.Active) {
      switch (iEvent) {
        case HyIconEvent.IconUp:
          return HyIconStatus.Hover;
        case HyIconEvent.DocuUp:
          return HyIconStatus.Normal;
        default:
      }
    }

    return iStatus;
  }
}
