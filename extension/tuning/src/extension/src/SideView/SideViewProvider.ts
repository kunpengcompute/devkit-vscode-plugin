import * as vscode from 'vscode'
import {I18nService} from '../i18nservice';
import path = require('path');

const i18n = I18nService.I18n();


export class SideViewProvider implements vscode.WebviewViewProvider {
    // private static _ip_address = '';
    // private static  _port = '';
    // private static  _test_content = '';

    private _ip_address = '';
    private _port = '';
    private _test_content = '';

    private _failure_info = '';
    private _shouldFailureInfoShown = false;

    public static readonly viewType = 'configurationInfo'
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {

    }
    public getIp() {
        return this._ip_address;
    }
    public getPort(){
        return this._port;
    }

    public dispose() {
        this._view?.onDidDispose
    }

    public FailureArbeitUpdaten(failure_info: string){
        this._failure_info = failure_info;
    }

    public updateServerConfiguration(new_ip_address: string, new_port: string) {
        this._ip_address = new_ip_address;
        this._port = new_port;
    }

    public updateTestContent(new_content: string) {
        this._test_content = new_content;
    }

    public resolveWebviewView(
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

    public shouldFailureInfoShown(info: boolean) {
        this._shouldFailureInfoShown = info;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'sidebar.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/extension/media', 'sidebar.css'));

        const nonce = getNonce();

        if (this._shouldFailureInfoShown) {
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
                      <td class="info-cell">&emsp;&emsp;</div></td>
                      <td class="info-cell">${this._ip_address}</td>
                    </tr>
                    <tr class="info-line">
                      <td class="info-cell">${i18n.port_title}</td>
                      <td class="info-cell">&emsp;&emsp;</td>
                      <td class="info-cell">${this._port}</td>
                    </tr>
                    <tr class="info-line">
                        <td class="info-cell">${i18n.server_connection_status}</td>
                        <td class="info-cell">&emsp;&emsp;</td>
                        <td class="info-cell"><svg width="8" height="10" xmlns="http://www.w3.org/2000/svg">
 <title>Red</title>
 <g>
  <title>Layer 1</title>
  <text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_3" y="218.93716" x="264.18744" stroke-width="0" stroke="#000" fill="#ec4b4b">*</text>
  <text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_2" y="25.43716" x="9.18744" stroke-width="0" stroke="#000" fill="#000000"/>
  <ellipse stroke-width="0" stroke="#000" ry="4.18744" rx="4.18745" id="svg_4" cy="20.78091" cx="4.18745" fill="#ed4b4b"/>
  <ellipse stroke="#000" stroke-width="0" ry="4.0937" rx="3.56245" id="svg_5" cy="5.49999" cx="4" fill="#ed4b4b"/>
 </g>

</svg>&nbsp;失败</td>
                    </tr>
                    <tr class="info-line">
                        <td class="info-cell">${i18n.failure_cause}</td>
                        <td class="info-cell">&emsp;&emsp;</td>
                        <td class="info-cell">${this._failure_info}</td>
                    </tr>
                </table>
				<script nonce="${nonce}" type="module" src="${scriptUri}"></script>
			</body>
			<script>
			    
            </script>
			</html>`;
        }
        else {
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
                      <td class="info-cell">&emsp;&emsp;</div></td>
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
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
