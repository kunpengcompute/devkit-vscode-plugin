import * as vscode from 'vscode';
import * as constant from './constant';
import { I18nService } from './i18nservice';
import { Utils } from './utils';
const fs = require('fs');
const i18n = I18nService.I18n();

class Download {
  public static async getData(global: any, message: any, module: string) {
    const resp: any = await Utils.requestData(
      global.context,
      message.data,
      message.module
    );
    if (resp.status === constant.HTTP_STATUS.HTTP_200_OK) {
      const caFile = resp.data.data.ca;
      Download.downloadFile(global, {
        fileContent: caFile,
        fileName: 'ca.crt',
        invokeLocalSave: false,
      });
    }
  }
  /**
   * 将文本内容写入文件，模拟web端下载文件
   *
   * @param global 插件上下文
   * @param data.fileName 文件名称
   * @param data.fileContent 文件内容
   */
  static async downloadFile(global: any, data: any) {
    let file: any;
    let fileNameArr;
    let fileName = data.fileName;
    if (data.fileName.indexOf(i18n.plugins_tuning_title_createTime) !== -1) {
      fileNameArr = data.fileName.split(i18n.plugins_tuning_title_createTime);
    }
    if (data.fileName.indexOf(i18n.plugins_tuning_title_importTime) !== -1) {
      fileNameArr = data.fileName.split(i18n.plugins_tuning_title_importTime);
    }
    if (fileNameArr?.length > 0) {
      fileName = fileNameArr[0].trim();
    }

    file = vscode.Uri.file(global.context.extensionPath + '/' + fileName);

    // 将文件内容写入file文件
    try {
      // 文件写入回调函数
      function fileWriteCallback(err: any) {
        if (err) {
          // 下载文件失败，删除错误文件
          fs.readFile(file, 'utf-8', (readFileErr: any) => {
            if (readFileErr) {
              return;
            }
            fs.unlinkSync(file);
          });
          vscode.window.showErrorMessage(err.message);
        }
        vscode.window.showInformationMessage(
          I18nService.I18nReplace(i18n.plugins_tuning_dowloadPath, {
            0: file.fsPath,
          })
        );
      }
      if (data.contentType === 'arraybuffer') {
        await fs.writeFile(
          file.fsPath,
          Buffer.from(data.fileContent),
          fileWriteCallback
        );
      } else if (data.contentType === 'base64') {
        await fs.writeFile(
          file.fsPath,
          Buffer.from(data.fileContent, 'base64'),
          fileWriteCallback
        );
      } else {
        await fs.writeFile(
          file.fsPath,
          data.fileContent,
          'utf-8',
          fileWriteCallback
        );
      }
      // Utils.invokeCallback(global.toolPanel.getPanel(), message, file.fsPath);
      Download.openCaFile(global, { Path: file.fsPath });
      Download.changeCertInstallTag(global);
    } catch (error) {}
  }

  /**
   * 打开证书安装引导
   *
   * @param context 插件上下文
   * @param filePath 证书路径
   */
  private static openCaFile(global: any, data: any) {
    const terminal = vscode.window.createTerminal('Install Cert', process.env.COMSPEC);
    terminal.sendText('rundll32.exe cryptext.dll,CryptExtAddCER ' + data.Path);
    setTimeout(() => {
      terminal.dispose();
    }, 3000);

    Utils.showMessageByType(
      'info',
      { info: i18n.plugins_tuning_message_cart },
      true
    );
  }

  private static changeCertInstallTag(global: any) {
    const resourcePath = Utils.getExtensionFileAbsolutePath(
      global.context,
      'out/assets/config.json'
    );
    let data = JSON.parse(fs.readFileSync(resourcePath, 'utf-8'));
    data.wss.cert_installed = true;
    data.wss.enabled = true;
    data.wss.domain_name = 'HyperTuner';
    fs.writeFileSync(resourcePath, JSON.stringify(data));
  }
}

export default Download;
