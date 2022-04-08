import { DownloadFileBasis } from './down-file.interface';
import { DownloadFileCommon } from './down-file-common.interface';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ExtensionConfig } from '.';

export abstract class DownloadFile
  implements DownloadFileBasis, DownloadFileCommon
{
  abstract download(url: string, nodeId: number): void;
  abstract downloadCom<T = any, R = AxiosResponse<T>>(
    url: string,
    axiosConfig?: AxiosRequestConfig,
    extensionConfig?: ExtensionConfig
  ): Promise<R> | void;
}
