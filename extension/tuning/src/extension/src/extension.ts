import * as vscode from 'vscode';
import {Utils} from './utils';
import {ToolPanelManager} from './panel-manager';
import * as sidebar from './TreeViewProvider';
import {SideViewProvider} from './SideView/SideViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // 响应VSCode配置修改
    Utils.addConfigListening();
    // 清除Vscode缓存信息
    Utils.initVscodeCache(context, true);
    // 响应perfadvisor左侧菜单树所有按钮的命令来打开不同的webview
    // console.log('here')
    Utils.reloadConfigurations(context);
    ToolPanelManager.createOrShowPanelForPerfCommand(context);

    // const sidebar_test = new sidebar.TreeViewProvider();
    // vscode.window.registerTreeDataProvider("perfadvisorTools", sidebar_test);
    // vscode.commands.executeCommand('setContext', 'ipconfig', true);
    // const provider = new SideViewProvider(context.extensionUri);
    // context.subscriptions.push(
    //     vscode.window.registerWebviewViewProvider(SideViewProvider.viewType, provider));
}

export function deactivate() {
}
