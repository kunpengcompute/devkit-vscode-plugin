import { Injectable } from '@angular/core';
import { TiTableDataState, TiTableColumns } from '@cloud/tiny3';

import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { PublicMethodService } from '../../../../service/public-method.service';

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
  private getFilterList(columns: Array<TiTableColumns>): { tasknameList: string, TidList: string, PidList: string } {
    const tasknameColumn = columns.find((column: any) => column.prop === 'taskname');
    const pidColumn = columns.find((column: any) => column.prop === 'pid');
    const ppidColumn = columns.find((column: any) => column.prop === 'ppid');
    const calcFilterList = (column: TiTableColumns) => {
      if (column.filter.selected && column.filter.selected.length) {
        return column.filter.selected.map((option: any) => option.prop).join(',');
      }
    };
    const tasknameList =
      JSON.stringify(columns[0].filter.selected) === JSON.stringify(columns[0].filter.list)
      ? '' : calcFilterList(tasknameColumn);
    const TidList =
      JSON.stringify(columns[1].filter.selected) === JSON.stringify(columns[1].filter.list)
      ? '' : calcFilterList(pidColumn);
    const PidList =
      JSON.stringify(columns[2].filter.selected) === JSON.stringify(columns[2].filter.list)
      ? '' : calcFilterList(ppidColumn);

    return {
      tasknameList,
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
    return new Promise<{
      sugg_threshold: number, // 优化建议阈值
      list: any[], // 当前页数据
      total: number, // 总数
      sugg_list: any[], // 优化建议列表
    }>((resolve, reject) => {
      // 排序
      let sortBy: string;
      let sortStatus: number;
      if (dataState.sort.sortKey && (dataState.sort.asc !== null)) {
        sortBy = dataState.sort.sortKey;
        sortStatus = dataState.sort.asc ? 0 : 1;
      }

      // 筛选
      const { tasknameList, TidList, PidList } = this.getFilterList(columns);

      const params = {
        'node-id': nodeId,
        page_index: dataState.pagination.currentPage - 1, // 后端从0开始
        page_size: dataState.pagination.itemsPerPage,
        sortBy,
        sortStatus,
        taskname: tasknameList,
        tar_tid: TidList,
        tar_pid: PidList,
      };

      this.Axios.axios.post(`/tasks/${taskId}/resource-analysis/numa-switch/`, params, {
        headers: {
          showLoading: false,
        },
      }).then((res: any) => {
        resolve({
          sugg_threshold: res.data.sugg_threshold || 1000,
          list: res.data.list.map((item: any) => {
            return {
              taskname: this.publicMethodService.transformLabel(item.taskname),
              pid: this.publicMethodService.transformLabel(item.pid),
              ppid: this.publicMethodService.transformLabel(item.ppid),
              numa_switch_num: +item.numa_switch_num,
              switches: item.switches,
              standard_en: item.standard_en,
              suggestion_ch: item.suggestion_ch,
            };
          }),
          total: res.data.total,
          sugg_list: [{
            title_chs: res.data.title_chs,
            title_en: res.data.title_en,
            suggest_chs: res.data.suggestion_ch,
            suggest_en: res.data.standard_en
          }]
        });
      }).catch((e: any) => {
        reject(e);
      });
    });
  }
}
