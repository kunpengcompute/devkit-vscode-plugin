import * as vscode from 'vscode'
import {I18nService} from '../i18nservice';
import path = require('path');

const i18n = I18nService.I18n();


export class SideViewProvider implements vscode.WebviewViewProvider {
    // private static _ip_address = '';
    // private static  _port = '';
    // private static  _test_content = '';

    private  _ip_address = '';
    private   _port = '';
    private   _test_content = '';

    public static readonly viewType = 'configurationInfo'
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {

    }

    public dispose(){
        this._view?.onDidDispose
    }

    public  updateServerConfiguration(new_ip_address: string, new_port:string){
        this._ip_address = new_ip_address;
        this._port = new_port;
    }

    public  updateTestContent(new_content:string){
        this._test_content = new_content;
    }

    public  resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'colorSelected': {
                    vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
                    break;
                }
            }
        });
    }

    public static updateContent(){

    }

    private  _getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'sidebar.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'sidebar.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Cat Colors</title>
			</head>
			<body>
			    <table border="0" class="info-box">
                    <tr class="info-line">
                      <td class="info-cell">${i18n.ip_address_title}</td>
                      <td class="info-cell">${this._test_content}</div></td>
                      <td class="info-cell">${this._ip_address}</td>
                    </tr>
                    <tr class="info-line">
                      <td class="info-cell">${i18n.port_title}</td>
                      <td class="info-cell">&emsp;&emsp;</td>
                      <td class="info-cell">${this._port}</td>
                    </tr>
                </table>
				<script nonce="${nonce}" type="module" src="${scriptUri}"></script>
			</body>
			<script>
			    
            </script>
			</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
