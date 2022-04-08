import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Subscription, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BatchRequestService {
  // 所有的线程的及其数据的列表
  public threadCpuDataSheet: any[] = [];
  public threadMemDataSheet: any[] = [];
  public threadDiskDataSheet: any[] = [];
  public threadContextDataSheet: any[] = [];
  public sumRequest = new Subject<any>();
  constructor(
    public http: HttpService,
  ) { }
  /**
   * 数组拆分并返回合并的数组
   * @param arr 原数组
   * @param size 拆分大小
   * @returns 合并数组
   */
  public sliceArr(arr: any[], size: number){
    const totalNum = Math.ceil(arr.length / size);
    let index = 0;
    let resIndex = 0;
    const returnArr = [];
    while (index < totalNum){
      returnArr[index] = arr.slice(resIndex, size + resIndex);
      resIndex += size;
      index++;
    }
    return returnArr;
  }

  public sendRequest(pidList: Set<string>, url: string, params: any, max: number, callbackFunc: any, isInit: boolean){
    const maxPidLine = 150;
    const totalRequestNum = Math.ceil(pidList.size / maxPidLine); // 总请求数量
    const requestArr = this.sliceArr([...pidList], maxPidLine);
    const blockQueue: any = []; // 等待的队列
    let currentReqNum = 0; // 现在请求的数量
    let numberOfreq = 0; // 已经请求的数量
    const results = new Array(totalRequestNum).fill(false); // 所有请求结果初始化

    const init = async () => {
      for (let i = 0; i < totalRequestNum; i++){
        request(i, requestArr[i].join(','));
      }
    };
    const request = async (index: number, reqUrl: string) => {
      if (currentReqNum >= max){
        await new Promise((resolve) => blockQueue.push(resolve)); // 阻塞队列增加一个pending状态的Promise
      }
      reqHandler(index, reqUrl);
    };
    const reqHandler = async (index: number, reqUrl: string) => {
      currentReqNum++;
      try{
        params['query-ptid'] = reqUrl;
        const result = await this.http.get(url, {params,
            headers: {
              showLoading: false,
            }});
        results[index] = result;
      } catch (err){
        results[index] = err;
      } finally {
        currentReqNum--;
        numberOfreq++;
        if (blockQueue.length) {
          blockQueue[0]();
          blockQueue.shift();
        } else if (numberOfreq === totalRequestNum){
          callbackFunc(results, isInit);
        }
      }
    };
    init();
  }
}
