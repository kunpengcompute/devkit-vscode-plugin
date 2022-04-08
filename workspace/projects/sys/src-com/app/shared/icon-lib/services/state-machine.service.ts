import { Injectable } from '@angular/core';
import { IconStatus, IconEvent } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class StateMachineService {

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
  calcIconStatus(iStatus: IconStatus, iEvent: IconEvent): IconStatus {
    if (iStatus === IconStatus.Disabled) {
      return IconStatus.Disabled;
    } else if (iStatus === IconStatus.Normal) {
      switch (iEvent) {
        case IconEvent.IconEnter:
          return IconStatus.Hover;
        case IconEvent.DocuUp:
          return IconStatus.Normal;
        default:
      }
    } else if (iStatus === IconStatus.Hover) {
      switch (iEvent) {
        case IconEvent.IconDown:
          return IconStatus.Active;
        case IconEvent.IconLeave:
          return IconStatus.Normal;
        default:
      }
    } else if (iStatus === IconStatus.Active) {
      switch (iEvent) {
        case IconEvent.IconEnter:
          return IconStatus.Active;
        case IconEvent.IconLeave:
          return IconStatus.Active;
        case IconEvent.IconUp:
          return IconStatus.Hover;
        case IconEvent.DocuUp:
          return IconStatus.Normal;
        default:
      }
    }
    return iStatus;
  }
}
