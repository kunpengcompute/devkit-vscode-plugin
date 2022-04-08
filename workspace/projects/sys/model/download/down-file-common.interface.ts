import { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';

export type ExtensionConfig = {
  fileName?: string;
  invokeLocalSave?: boolean;
  contentType?: ResponseType;
  fileContent?: any;
};

export interface DownloadFileCommon {
  // 下载文件
  downloadCom<T = any, R = AxiosResponse<T>>(
    url: string,
    axiosConfig?: AxiosRequestConfig,
    extensionConfig?: ExtensionConfig
  ): Promise<R> | void;
}
