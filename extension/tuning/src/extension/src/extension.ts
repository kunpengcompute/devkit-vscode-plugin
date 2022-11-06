import * as vscode from 'vscode';
import { Utils } from './utils';
import { ToolPanelManager } from './panel-manager';

export function activate(context: vscode.ExtensionContext) {
   // 响应VSCode配置修改
   Utils.addConfigListening();
   // 清除Vscode缓存信息
   Utils.initVscodeCache(context, true);
   // 响应perfadvisor左侧菜单树所有按钮的命令来打开不同的webview
   ToolPanelManager.createOrShowPanelForPerfCommand(context);
   
}

export function deactivate() { }
