import { Injectable } from '@angular/core';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DownloadFile, ExtensionConfig } from 'sys/model';
import { CommonInjector } from 'sys/src-com/injector';

@Injectable({
  providedIn: 'root',
})
export class DownloadFileService extends DownloadFile {
  private downloadServe: DownloadFile;

  constructor(private commonInjector: CommonInjector) {
    super();
    this.downloadServe = this.commonInjector.get(DownloadFile);
  }

  download(url: string, nodeId: number) {
    this.downloadServe.download(url, nodeId);
  }

  downloadCom<T = any, R = AxiosResponse<T>>(
    url: string,
    axiosConfig?: AxiosRequestConfig,
    extensionConfig?: ExtensionConfig
  ): Promise<R> | void {
    return this.downloadServe.downloadCom(url, axiosConfig, extensionConfig);
  }
}
