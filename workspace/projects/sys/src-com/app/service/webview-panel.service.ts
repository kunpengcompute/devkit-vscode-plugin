import { Injectable } from '@angular/core';
import { CommonInjector } from '../../injector';
import { WebviewPanel, WebviewPanelInfo } from 'sys/model';

@Injectable({
  providedIn: 'root',
})
export class WebviewPanelService extends WebviewPanel {
  private panelServe: WebviewPanel;
  constructor(private commonInjector: CommonInjector) {
    super();
    this.panelServe = this.commonInjector.get(WebviewPanel);
  }

  addPanel(panelInfo: WebviewPanelInfo) {
    this.panelServe.addPanel(panelInfo);
  }

  openPanel(panelInfo: WebviewPanelInfo) {
    this.panelServe.openPanel(panelInfo);
  }

  updatePanel(panelInfo: WebviewPanelInfo) {
    this.panelServe.updatePanel(panelInfo);
  }

  deletePanel(title: string, id: any) {
    this.panelServe.deletePanel(title, id);
  }

  queryPanel(title: string, id: any) {
    this.panelServe.queryPanel(title, id);
    return { title: 'xxx', viewType: 'xx' };
  }
}
