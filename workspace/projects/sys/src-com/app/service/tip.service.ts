import { Injectable } from '@angular/core';
import { CommonInjector } from '../../injector';
import { MyTip, MyTipOptions } from 'sys/model';

@Injectable({
  providedIn: 'root'
})
export class TipService extends MyTip {

  private myTip: MyTip;

  constructor(
    private commonInjector: CommonInjector
  ) {
    super();
    this.myTip = this.commonInjector.get(MyTip);
  }

  alertInfo(options: MyTipOptions): void {
    return this.myTip.alertInfo(options);
  }

  warn(content: string, time?: number): void {
    return this.myTip.warn(content, time);
  }

  success(content: string, time?: number): void {
    return this.myTip.success(content, time);
  }

  error(content: string, time?: number): void {
    return this.myTip.error(content, time);
  }

  tip(content: string, time?: number): void {
    return this.myTip.tip(content, time);
  }

}
