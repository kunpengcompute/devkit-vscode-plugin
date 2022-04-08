import { Injectable } from '@angular/core';
import {
  IDialTestRaw,
  INetLoadRawData,
  PocketLossRaw,
  CapturePkgRaw
} from '../domain';
import { HttpService } from 'sys/src-com/app/service';
import { NetIoSrcCode } from '../domain/pocket-loss/net-io-src-code.type';

@Injectable({
  providedIn: 'root',
})
export class NetIoService {
  constructor(private http: HttpService) { }
  // numa的数量
  public numaNum: number;
  // 获取拨测数据
  /**
   *
   * @param taskId 任务ID
   * @param nodeId 节点ID
   * @returns 接口数组
   */
  pullDialingData(
    taskId: number,
    nodeId: number
  ): Promise<{ data: { Dialing: IDialTestRaw } }> {
    const params = {
      queryTarget: 'Dialing',
      nodeId,
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio-summary/`, {
      params,
    });
  }

  /**
   * 获取负载数据
   * @param taskId 任务ID
   * @param nodeId 节点ID
   * @returns 接口数组
   */
  pullLoadData(
    taskId: number,
    nodeId: number
  ): Promise<{ data: { Load: INetLoadRawData } }> {
    const params = {
      queryTarget: 'Load',
      nodeId,
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio-summary/`, {
      params,
    });
  }

  /**
   * 获取任务配置信息
   * @param taskId 任务ID
   * @param nodeId 节点ID
   * @returns 接口数组
   */
  pullTaskConfInfo(taskId: number, nodeId: number): Promise<any> {
    const params = { 'node-id': nodeId };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/configuration/`, {
      params,
    });
  }

  /**
   * 获取抓包数据
   * @param taskId 任务ID
   * @param nodeId 节点ID
   * @returns 接口数组
   */
  pullCaptureData(
    taskId: number,
    nodeId: number
  ): Promise<{ data: { NetCaught: CapturePkgRaw } }> {
    const params = {
      queryTarget: 'NetCaught',
      nodeId,
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio-summary/`, {
      params,
    });
  }

  /**
   * 抓包采集文件下载
   * @param taskId 任务ID
   * @param nodeId 节点ID
   */
  downloadNetioSummary(taskId: number, nodeId: number) {
    const params = {
      nodeId,
      responseHeaders: true
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio_analysis/download/`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * 获取丢包数据
   * @param taskId 任务ID
   * @param nodeId 节点ID
   * @returns 接口数组
   */
  pullPacketLossData(
    taskId: number,
    nodeId: number
  ): Promise<{ data: { PacketLoss: PocketLossRaw } }> {
    const params = {
      queryTarget: 'PacketLoss',
      nodeId,
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio-summary/`, {
      params,
    });
  }

  /**
   * 获取源码数据
   * @param taskId 任务ID
   * @param nodeId 节点ID
   * @param packetLossModule 丢包模块名
   * @param packetLossFunction 丢包函数名
   * @returns 接口数组
   */
  pullSourceCode(
    taskId: number,
    nodeId: number,
    packetLossModule: string,
    packetLossFunction: string
  ): Promise<{ data: { SourceCode: { data: NetIoSrcCode } } }> {
    const params = {
      queryTarget: 'SourceCode',
      nodeId,
      packetLossModule,
      packetLossFunction
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio-summary/`, {
      params,
    });
  }

  /**
   * 网络IO诊断源码获取svg信息
   * @param taskId 任务ID
   * @param svgName svg 名
   * @param nodeId 节点ID
   */
  pullSvgData(taskId: number, svgName: string, nodeId: string | number) {
    const params = {
      'svg-name': svgName,
      nodeId
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio_analysis/svg-content/`, {
      params,
    });
  }
}
