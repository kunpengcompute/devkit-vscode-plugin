import { Injectable } from '@angular/core';
import { DownloadFile, ExtensionConfig } from 'sys/model';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root',
})
export class DownloadFileService extends DownloadFile {
  constructor(private axiosServe: AxiosService) {
    super();
  }

  download(url: string, nodeId: number) {
    const params = {
      nodeId,
      responseHeaders: true,
    };
    this.axiosServe.axios
      .get(url, {
        params,
        responseType: 'blob',
      })
      .then(({ data, headers }: any) => {
        let filename;
        const disposition =
          headers['Content-Disposition'] || headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        this.axiosServe.downloadFile(data, filename);
      });
  }

  downloadCom<T = any, R = AxiosResponse<T>>(
    url: string,
    axiosConfig?: AxiosRequestConfig
  ): Promise<R> | void {
    const { params = {} } = axiosConfig;

    const requestConfig = {
      params: { ...params, responseHeaders: true },
      responseType: 'blob',
      ...axiosConfig,
    };

    return this.axiosServe.axios
      .get(url, requestConfig)
      .then(({ data, headers }: any) => {
        let filename;
        const disposition =
          headers['Content-Disposition'] || headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        this.axiosServe.downloadFile(data, filename);
      });
  }
}
