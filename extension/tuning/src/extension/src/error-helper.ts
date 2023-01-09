import * as vscode from 'vscode';
import * as constant from './constant';
import { ToolPanelManager } from './panel-manager';
import { I18nService } from './I18nService';
import { Utils } from './utils';

const i18n = I18nService.I18n();
/**
 * 错误处理类
 */
export class ErrorHelper {
  /**
   * 接口异常处理
   * @param context 插件上下文
   * @param module 模块标识
   */
  static errorHandler(
    context: vscode.ExtensionContext,
    module: string,
    errorMessage: string,
    deployIP?: string
  ) {
    if (context.globalState.get('closeShowErrorMessage')) {
      return;
    }
    if (deployIP !== undefined) {
      errorMessage = i18n.plugins_common_message_responseError_deployScenario;
    }
    if (!errorMessage) {
      errorMessage = i18n.plugins_common_message_responseError;
    }
    vscode.window
      .showErrorMessage(
        errorMessage,
        i18n.plugins_common_button_checkErrorDetails
      )
      .then(async (select) => {
        if (select === i18n.plugins_common_button_checkErrorDetails) {
          const serverIP = context.globalState.get('tuningIp');
          const servicePort = context.globalState.get('tuningPort');
          const session = {
            language: vscode.env.language,
          };
          const message = Utils.generateMessage('navigate', {
            page: '/errorInstruction',
            pageParams: {
              queryParams: { ip: serverIP, port: servicePort, deployIP },
            },
            webSession: session,
          });
          const panelID = constant.PANEL_ID.tuningErrorInstruction;
          const panelOption = {
            panelId: panelID,
            viewType: constant.VIEW_TYPE.serverError,
            viewTitle: i18n.plugins_common_title_errorInstruction,
            module,
            message,
          };
          ToolPanelManager.createOrShowPanel(panelOption, context);
        }
      });
  }
}
