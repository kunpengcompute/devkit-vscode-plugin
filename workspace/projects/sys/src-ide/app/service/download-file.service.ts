import { Injectable } from '@angular/core';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DownloadFile, ExtensionConfig } from 'sys/model';
import { VscodeService } from './vscode.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadFileService extends DownloadFile {
  constructor(private vscodeService: VscodeService, private http: HttpService) {
    super();
  }

  download(url: string, nodeId: number) {
    const option = {
      url,
      responseType: 'arraybuffer',
    };
    this.vscodeService.get(option, (res: any) => {
      if (res) {
        const message = {
          cmd: 'downloadFile',
          data: {
            fileName: 'tcpdump.tar.gz',
            fileContent: res,
            invokeLocalSave: true,
            contentType: 'arraybuffer',
          },
        };
        this.vscodeService.postMessage(message, null);
      }
    });
  }

  downloadCom<T = any, R = AxiosResponse<T>>(
    url: string,
    _: AxiosRequestConfig = {},
    extensionConfig: ExtensionConfig = {}
  ): Promise<R> | void {
    const extConfig: ExtensionConfig = {
      invokeLocalSave: true,
      contentType: 'arraybuffer',
      fileName: 'unkown',
      ...extensionConfig,
    };
    const option = {
      url,
      responseType: 'arraybuffer',
    };
    this.vscodeService.get(option, (res: any) => {
      if (res) {
        const message = {
          cmd: 'downloadFile',
          data: { ...extConfig, fileContent: res },
        };
        this.vscodeService.postMessage(message, null);
      }
    });
  }
}
