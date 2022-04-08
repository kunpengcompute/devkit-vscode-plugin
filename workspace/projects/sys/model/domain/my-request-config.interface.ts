import { AxiosRequestConfig } from 'axios';

/**
 * 网络请求的扩展属性
 */
export interface MyRequestConfig extends AxiosRequestConfig {

  /**
   * 由 vscode 请求而扩展
   */

  // 明确类型
  subModeule?: string;

  /**
   * 由 vscode 请求而扩展
   */
  noToken?: boolean;

  /**
   * 由 vscode 请求而扩展
   */

  // 明确类型
  cancelId?: any;
}
