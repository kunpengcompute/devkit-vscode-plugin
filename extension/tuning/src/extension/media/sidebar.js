//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
// import {I18nService} from "./I18nService";
(function () {
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { colors: [] };

  /** @type {Array<{ value: string }>} */
  let colors = oldState.colors;

  updateColorList(colors);

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', (event) => {});
})();
