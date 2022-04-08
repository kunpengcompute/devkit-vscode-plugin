import { Injectable } from '@angular/core';
import { WebviewPanelInfo, WebviewPanel } from 'sys/model';
import { VscodeService } from 'sys/src-ide/app/service/vscode.service';

@Injectable({
  providedIn: 'root',
})
export class WebviewPanelService extends WebviewPanel {
  constructor(private vscodeService: VscodeService) {
    super();
  }

  addPanel(panelInfo: WebviewPanelInfo) {
    if (
      panelInfo.viewType.indexOf('Tuninghelper') > -1 ||
      panelInfo.viewType.indexOf('tuninghelper') > -1
    ) {
      this.vscodeService.postMessage(
        {
          cmd: 'openNewPage',
          data: {
            router: panelInfo.router,
            panelId: panelInfo.id,
            viewTitle: panelInfo.title,
            message: {
              ...panelInfo.message,
            },
          },
        },
        null
      );
    } else {
      const router =
        panelInfo.viewType === 'netCaptureSource'
          ? 'netCaptureSource'
          : 'netPortDisplay';
      const message =
        router === 'netCaptureSource'
          ? {
              data: JSON.stringify(panelInfo.message),
            }
          : { ...panelInfo.message };
      this.vscodeService.postMessage(
        {
          cmd: 'openNewPage',
          data: {
            router,
            panelId: panelInfo.viewType + panelInfo.title,
            viewTitle: panelInfo.title,
            message,
          },
        },
        null
      );
    }
  }

  openPanel(panelInfo: WebviewPanelInfo) {
    const message = {
      cmd: 'openSomeNode',
      data: panelInfo,
    };
    this.vscodeService.postMessage(message, null);
  }

  updatePanel(panelInfo: WebviewPanelInfo) {}

  deletePanel(title: string, id: any) {}

  queryPanel(title: string, id: any) {
    return { title: 'xxx', viewType: 'xx' };
  }
}
