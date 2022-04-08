import { NodeInfo } from '.';

export interface Options {

  /**
   * 配置指定节点参数
   */
  label?: string;

  /**
   * 开关
   */
  switch?: {

    /**
     * 是否禁用
     */
    disabled?: boolean;

    /**
     * 开关状态
     */
    status?: boolean;

    /**
     * 开关后面的提示信息
     */
    tip?: string;

    /**
     * 开关在鼠标放上去时的提示信息
     */
    hoverTip?: string;

    /**
     * 开关状态时会执行的方法
     */
    onSwitchChange?: (status: boolean) => void;
  };

  /**
   * 关闭配置节点弹窗前会执行的方法
   * 该方法会阻塞弹窗打开，方法执行完成之后弹窗才会打开
   *
   * @param nodeInfo 节点信息
   */
  beforeConfig?: (nodeInfo: NodeInfo) => void;

  /**
   * 关闭配置节点弹窗后执行的方法
   * 该方法会阻塞弹窗关闭，方法返回true才关闭弹窗
   *
   * @param nodeInfo 节点信息
   * @returns 是否关闭弹窗
   */
  afterConfig?: (nodeInfo: NodeInfo) => boolean;
}
