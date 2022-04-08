import { Injectable } from '@angular/core';
import { AxiosService } from 'java/src-web/app/service/axios.service';
import { AxiosStatic } from 'axios';
import { IThreadDumpLimit, IHeapDumpLimit, IGcLogLimit } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class HomeHttpService {

  private http: AxiosStatic;

  constructor(
    private axios: AxiosService
  ) {
    this.http = this.axios.axios;
  }

  /**
   * 获取HeapDump数据限定
   */
  async getThreadDumpLimit(): Promise<IThreadDumpLimit> {

    const threadDumpLimit = await this.http.get('tools/settings/threadDump');
    return {
      alarmThreadDumpCount: +(threadDumpLimit as any).alarmThreadDumpCount,
      maxThreadDumpCount: +(threadDumpLimit as any).maxThreadDumpCount,
    };
  }


  /**
   * 获取HeapDump数据限定
   */
  async getHeapDumpLimit(): Promise<IHeapDumpLimit> {

    const heapDumpLimit = await this.http.get('tools/settings/heap');
    return {
      alarmHeapCount: +(heapDumpLimit as any).alarmHeapCount,
      maxHeapCount: +(heapDumpLimit as any).maxHeapCount,
      maxHeapSize: +(heapDumpLimit as any).maxHeapSize,
    };
  }


  /**
   * 获取GCLogs数据限定
   */
  async getGcLogLimit(): Promise<IGcLogLimit> {

    const gcLogLimit = await this.http.get('tools/settings/gcLog');

    return {
      alarmGcLogCount: +(gcLogLimit as any).alarmGcLogCount,
      maxGcLogCount: +(gcLogLimit as any).maxGcLogCount
    };
  }
}
