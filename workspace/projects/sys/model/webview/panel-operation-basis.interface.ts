export type WebviewPanelInfo = {
  id?: any;
  viewType: string;
  title: string;
  showOptions?: {};
  options?: {};
  message?: {};
  [key: string]: any;
};

/**
 * webview 基本操作
 */
export interface IPanelOpreationBasis {
  /**
   * 新增 panel：
   * 1. 当前 panel 如果存在，使其获取焦点；
   * 2. 当前 panel 如果不存在，新增一个 panel, 使其获取焦点；
   * @param panelInfo panle 信息
   */
  addPanel(panelInfo: WebviewPanelInfo): void;

  openPanel(panelInfo: WebviewPanelInfo): void;

  /**
   * 删除 panel：
   * 1. 如果还存在 panel，让其右侧 panel 获取焦点，如何右侧没有 panel，使其左侧 panel 获取焦点
   * @param panelInfo panle 信息
   */
  deletePanel(
    title: WebviewPanelInfo['title'],
    id?: WebviewPanelInfo['id']
  ): void;

  /**
   * 更新 panel 信息
   * @param panelInfo panle 信息
   */
  updatePanel(panelInfo: Pick<WebviewPanelInfo, 'title'>): void;

  /**
   * 查询 panel 信息
   * @param panelInfo panle 信息
   */
  queryPanel(
    title: WebviewPanelInfo['title'],
    id?: WebviewPanelInfo['id']
  ): void;
}
