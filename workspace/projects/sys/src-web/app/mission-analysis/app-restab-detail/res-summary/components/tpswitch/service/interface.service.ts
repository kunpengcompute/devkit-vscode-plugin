import { Injectable } from '@angular/core';
import { TiTableDataState, TiTableColumns } from '@cloud/tiny3';

import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { PublicMethodService } from '../../../../service/public-method.service';

import { SortStatus } from '../../../../domain';

@Injectable({
  providedIn: 'root'
})
export class InterfaceService {

  constructor(
    private Axios: AxiosService,
    private publicMethodService: PublicMethodService,
  ) { }

  /**
   * 获取筛选字段
   * @param columns 表格列
   */
  private getFilterList(columns: Array<TiTableColumns>): { taskList: string, TidList: string, PidList: string } {
    const taskColumn = columns.find((column: any) => column.prop === 'task');
    const tidColumn = columns.find((column: any) => column.prop === 'tid');
    const pidColumn = columns.find((column: any) => column.prop === 'pid');
    const calcFilterList = (column: TiTableColumns) => {
      if (column.filter.selected && column.filter.selected.length) {
        return column.filter.selected.map((option: any) => option.prop).join(',');
      }
    };
    const taskList =
      columns[0].filter.selected.length === columns[0].filter.list.length
        ? '' : calcFilterList(taskColumn);
    const TidList =
      columns[1].filter.selected.length === columns[1].filter.list.length
        ? '' : calcFilterList(tidColumn);
    const PidList =
      columns[2].filter.selected.length === columns[2].filter.list.length
        ? '' : calcFilterList(pidColumn);

    return {
      taskList,
      TidList,
      PidList,
    };
  }

  /**
   * 获取表格数据
   * @param taskId taskId
   * @param nodeId nodeId
   * @param dataState 表格状态
   * @param columns 表格列
   */
  public getTableData(
    taskId: number, nodeId: number, dataState: TiTableDataState,
    columns: Array<TiTableColumns>, ifInit?: boolean
  ) {
    return new Promise<{ list: any[], total: number }>((resolve, reject) => {
      // 排序
      let sortBy: string;
      let sortStatus: SortStatus;
      if (dataState.sort.sortKey && (dataState.sort.asc !== null)) {
        sortBy = dataState.sort.sortKey;
        sortStatus = dataState.sort.asc ? SortStatus.Asc : SortStatus.Desc;
      }

      // 筛选
      const { taskList, TidList, PidList } = this.getFilterList(columns);

      const params: any = {
        'node-id': nodeId,
        'page-index': dataState.pagination.currentPage - 1, // 后端是从0开始
        'page-size': dataState.pagination.itemsPerPage,
        'order-by': sortBy,
        'order-status': sortStatus,
        'tar-task': taskList,
        'tar-tid': TidList,
        'tar-pid': PidList,
      };

      this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/process-schedule/`, params, {
        headers: {
          showLoading: false,
        },
      }).then((res: any) => {
        resolve({
          list: res.data.data.map((item: any) => {
            return {
              task: this.publicMethodService.transformLabel(item.task),
              tid: this.publicMethodService.transformLabel(item.tid),
              pid: this.publicMethodService.transformLabel(item.pid),
              runtime: +item.runtime,
              switches: +item.switches,
              avg_delay: +item.avg_delay,
              max_delay: +item.max_delay,
              max_delay_at: +item.max_delay_at,
            };
          }),
          total: res.data.total_num,
        });
      }).catch((e: any) => {
        reject(e);
      });
    });
  }
}
