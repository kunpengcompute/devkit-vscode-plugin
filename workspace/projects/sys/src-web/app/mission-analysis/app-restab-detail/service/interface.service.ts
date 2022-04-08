import { Injectable } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';

@Injectable({
  providedIn: 'root'
})
export class InterfaceService {
  public topList10: any = [];
  constructor(public Axios: AxiosService) { }

  /**
   * 获取筛选框的列表数据，支持多个列表查询
   * @param taskId 任务id
   * @param nodeId 节点id
   * @param keys 要获取的筛选框数据的列表
   */
  public getFilterList(taskId: any, nodeId: any, keys: any[]) {
    return new Promise<{ [propName: string]: string[]; }>((resolve, reject) => {
      const params = {
        'node-id': nodeId,
        keys,
      };

      this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/common-data/`, params, {
        headers: {
          showLoading: false,
        },
      }).then((res: any) => {
        resolve(res.data);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  /**
   * 获取总时间范围
   * @param taskId 任务id
   * @param nodeId 节点id
   */
  public getTotalTimeRange(taskId: any, nodeId: any, queryType: 'cpu' | 'process') {
    return new Promise((resolve, reject) => {
      const params = {
        'node-id': nodeId,
        'query-type': queryType,
      };

      this.Axios.axios.get(`/tasks/${taskId}/resource-analysis/maxmin-time/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }


  // -- CPU调度 --
  /**
   * 获取CPU状态图数据
   * @param params params
   */
  public getCpuStatusData({ taskId, nodeId, pageNo, pageSize, cpuList, startTime, endTime, ifInit}: {
    taskId: any,  // 任务id
    nodeId: any, // 节点id
    pageNo: number, // 页码，从1开始
    pageSize: number, // 每页多少条
    cpuList?: string, // 筛选的CPU列表,不传表示无数据
    startTime?: number, // 数据窗口范围的起始数值
    endTime?: number,  // 数据窗口范围的结束数值
    ifInit?: boolean,
  }) {
    return new Promise((resolve, reject) => {
      const params = {
        'node-id': nodeId,
        'schedule-type': 'CPU',
        'page-index': pageNo - 1,
        'page-size': pageSize,
        'cpu-list': cpuList,
        'start-time': startTime,
        'end-time': endTime,
      };
      if (!cpuList && !ifInit){
        reject();
      } else {
       this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/cpu-schedule/`, params, {
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
      }


    });
  }

  /**
   * 获取时长总览图数据
   * @param params params
   */
  public getDurationSummaryData({
    taskId, nodeId, pageNo, pageSize, sortBy, sortStatus, cpuList, startTime, endTime, ifInit
  }: {
    taskId: any,  // 任务id
    nodeId: any, // 节点id
    pageNo: number, // 页码，从1开始
    pageSize: number, // 每页多少条
    sortBy: string,  // 排序字段
    sortStatus: string, // 排序顺序
    cpuList?: string, // 筛选的CPU列表,不传表示全选,以,连接为字符串
    startTime?: number, // 数据窗口范围的起始数值
    endTime?: number,  // 数据窗口范围的结束数值
    ifInit?: boolean,
  }) {
    return new Promise((resolve, reject) => {
      const params = {
        'node-id': nodeId,
        'schedule-type': 'CPU',
        'page-index': pageNo - 1,
        'page-size': pageSize,
        'order-by': sortBy,
        'order-status': sortStatus,
        'cpu-list': cpuList,
        'start-time': startTime,
        'end-time': endTime,
      };
      if (!cpuList && !ifInit){
        reject();
      } else {
      this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/cpu-schedule/`, params, {
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      }); }
    });
  }

  /**
   * 筛选ptid
   * @param params params
   */
  public getLocatePTidData({ taskId, nodeId, pageNo, pageSize, pidList, startTime, endTime, ifInit }: {
    taskId: any,  // 任务id
    nodeId: any, // 节点id
    pageNo: number, // 页码，从1开始
    pageSize: number, // 每页多少条
    pidList?: string, // 筛选的pid列表,以,连接为字符串
    startTime?: number, // 数据窗口范围的起始数值
    endTime?: number,  // 数据窗口范围的结束数值
    ifInit?: boolean,
  }) {
    return new Promise((resolve, reject) => {
      const params = {
        'node-id': nodeId,
        'schedule-type': 'CPU',
        'page-index': pageNo - 1,
        'page-size': pageSize,
        'pid-list': pidList,
        'start-time': startTime,
        'end-time': endTime,
      };
      if (!pidList && !ifInit){
        reject();
      } else {
      this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/cpu-schedule/`, params, {
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      }); }
    });
  }


  // -- 进程/线程调度 --
  /**
   * 获取状态图数据
   * @param params params
   */
  public getPidStatusData({ taskId, nodeId, pageNo, pageSize, pidList, startTime, endTime, ifInit }: {
    taskId: any,  // 任务id
    nodeId: any, // 节点id
    pageNo: number, // 页码，从1开始
    pageSize: number, // 每页多少条
    pidList?: string, // 筛选的PID列表,不传表示全选,以,连接为字符串
    startTime?: number, // 数据窗口范围的起始数值
    endTime?: number,  // 数据窗口范围的结束数值
    ifInit?: boolean,
  }) {
    return new Promise((resolve, reject) => {
      const params = {
        'node-id': nodeId,
        'page-index': pageNo - 1,
        'page-size': pageSize,
        'pid-list': pidList,
        'start-time': startTime,
        'end-time': endTime,
      };
      if (!pidList && !ifInit){
        reject();
      } else {
      this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/pthread-schedule/`, params, {
        headers: {
          showLoading: false,
        },
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      }); }
    });
  }

  /**
   * 获取时长总览图数据
   * @param params params
   */
  public getPidDurationSummaryData({
    taskId, nodeId, pageNo, pageSize, sortBy, sortStatus, pidList, startTime, endTime, ifInit
  }: {
    taskId: any,  // 任务id
    nodeId: any, // 节点id
    pageNo: number, // 页码，从1开始
    pageSize: number, // 每页多少条
    sortBy: string,  // 排序字段
    sortStatus: string, // 排序顺序
    pidList?: string, // 筛选的PID列表,不传表示全选,以,连接为字符串
    startTime?: number, // 数据窗口范围的起始数值
    endTime?: number,  // 数据窗口范围的结束数值
    ifInit?: boolean,
  }) {
    return new Promise((resolve, reject) => {
      const params = {
        'node-id': nodeId,
        'page-index': pageNo - 1,
        'page-size': pageSize,
        'order-by': sortBy,
        'order-status': sortStatus,
        'pid-list': pidList,
        'start-time': startTime,
        'end-time': endTime,
      };
      if (!pidList && !ifInit){
        reject();
      } else {
      this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/pthread-schedule/`, params, {
        headers: {
          showLoading: false,
        },
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      }); }
    });
  }
}
