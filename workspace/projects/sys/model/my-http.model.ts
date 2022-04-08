import {
  AxiosInstance, AxiosResponse,
  AxiosInterceptorManager
} from 'axios';
import { MyRequestConfig } from './domain';


/**
 * 这里是根据目前的需求，选择性的实现接口 AxiosInstance 的属性，
 * 如果需要扩展，可以添加
 */
type MyAxiosInstance = Pick<
  AxiosInstance,
  'interceptors' | 'get' | 'delete' | 'post' | 'put'
>;

/**
 * 数据请求接口
 */
export abstract class MyHttp implements MyAxiosInstance {

  interceptors: {
    request: AxiosInterceptorManager<MyRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };

  abstract get<T = any, R = AxiosResponse<T>>(
    url: string, config?: MyRequestConfig
  ): Promise<R>;

  abstract delete<T = any, R = AxiosResponse<T>>(
    url: string, config?: MyRequestConfig
  ): Promise<R>;

  abstract post<T = any, R = AxiosResponse<T>>(
    url: string, data?: any, config?: MyRequestConfig
  ): Promise<R>;

  abstract put<T = any, R = AxiosResponse<T>>(
    url: string, data?: any, config?: MyRequestConfig
  ): Promise<R>;
}
