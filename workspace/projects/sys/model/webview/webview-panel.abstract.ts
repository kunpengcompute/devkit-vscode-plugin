import { IPanelOpreationBasis, WebviewPanelInfo } from './panel-operation-basis.interface';


export abstract class WebviewPanel implements IPanelOpreationBasis {
  abstract addPanel(panelInfo: WebviewPanelInfo): void;

  abstract deletePanel(
    title: WebviewPanelInfo['title'],
    id?: WebviewPanelInfo['id']
  ): void;

  abstract openPanel(panelInfo: WebviewPanelInfo): void;

  abstract updatePanel(panelInfo: WebviewPanelInfo): void;

  abstract queryPanel(
    title: WebviewPanelInfo['title'],
    id?: WebviewPanelInfo['id']
  ): WebviewPanelInfo;
}
