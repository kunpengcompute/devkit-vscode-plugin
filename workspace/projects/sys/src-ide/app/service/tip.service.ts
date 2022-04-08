import { Injectable } from '@angular/core';
import { MyTip, MyTipOptions } from 'sys/model';
import { VscodeService } from './vscode.service';

@Injectable({
  providedIn: 'root'
})
export class TipService extends MyTip {

  constructor(
    private vscodeService: VscodeService,
  ) {
    super();
  }

  public alertInfo(options: MyTipOptions): void {
    switch (options.type) {
      case 'warn':
        this.warn(options.content);
        break;
      case 'error':
        this.error(options.content);
        break;
      case 'success':
      case 'tip':
      default:
        this.tip(options.content);
        break;
    }
  }

  public warn(content: string, time?: number): void {
    this.vscodeService.showInfoBox(content, 'warn');
  }

  public success(content: string, time?: number): void {
    this.vscodeService.showInfoBox(content, 'info');
  }

  public error(content: string, time?: number): void {
    this.vscodeService.showInfoBox(content, 'error');
  }

  public tip(content: string, time?: number): void {
    this.vscodeService.showInfoBox(content, 'info');
  }

}
