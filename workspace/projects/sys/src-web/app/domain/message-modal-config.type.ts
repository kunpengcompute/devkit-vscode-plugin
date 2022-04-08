import { TiModalConfig, TiMessageButtonConfig } from '@cloud/tiny3';

export interface MessageModalConfig extends TiModalConfig {
  /**
   * 组件类型
   * default 'confirm'
   */
  type?: 'confirm' | 'warn' | 'error' | 'prompt';
  /**
   * 头部标题
   */
  title?: string;
  /**
   * 内容，支持设置为字符串/template模板/组件形式
   */
  content?: string;
  /**
   * 底部ok按钮配置
   */
  okButton?: TiMessageButtonConfig;
  /**
   * 底部cancel按钮配置
   */
  cancelButton?: TiMessageButtonConfig;
}
