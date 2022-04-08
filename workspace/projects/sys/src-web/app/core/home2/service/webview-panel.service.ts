import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  WebviewPanelInfo,
  WebviewPanel,
  IPanelOpreationBasis,
} from 'sys/model';
import { OpenNodeService } from '../project-manage/services/open-node.service';

type PanelAction = {
  func: keyof IPanelOpreationBasis;
  info: Partial<WebviewPanelInfo>;
};

@Injectable({
  providedIn: 'root',
})
export class WebviewPanelService extends WebviewPanel {
  // 订阅源
  private panelSource = new Subject<PanelAction>();

  constructor(private openNodeServe: OpenNodeService) {
    super();
  }

  addPanel(panelInfo: WebviewPanelInfo) {
    this.panelSource.next({ func: 'addPanel', info: panelInfo });
  }

  openPanel(panelInfo: WebviewPanelInfo) {
    const openNodeInfo = { taskId: panelInfo.taskId, nodeIp: panelInfo.nodeIp };
    this.openNodeServe.openNode(openNodeInfo);
  }

  updatePanel(panelInfo: WebviewPanelInfo) {
    const info: WebviewPanelInfo = { ...panelInfo };
    this.panelSource.next({ func: 'updatePanel', info });
  }

  deletePanel(title: string, id: any) {
    this.panelSource.next({
      func: 'deletePanel',
      info: { title, id },
    });
  }

  queryPanel(title: string, id: any) {
    return { title: 'xxx', viewType: 'xx' };
  }

  getObservable(): Observable<PanelAction> {
    return this.panelSource.asObservable();
  }
}
