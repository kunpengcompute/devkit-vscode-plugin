import { Injectable } from '@angular/core';
import { VscodeService } from './vscode.service';
import { Utils } from './utils.service';
import { Observable } from 'rxjs';
import { TiTableDataState, TiTableColumns } from '@cloud/tiny3';

// 总览页签-进程/线程切换
type TidPidSwitchFilterList = 'task_list' | 'tid_list' | 'pid_list';  // 进程名 | TID | PID
// 总览页签-NUMA节点切换表格 筛选列表
type NumSwitchFilterList = 'taskname_lis' | 'pid_lis' | 'ppid_lis';  // 进程名 | TID | PID
// CPU调度页签 筛选列表(总的CPU列表| 有数据的CPU列表 | 应用相关的CPU列表 | 总的进程线程列表 | 应用相关的PID列表)
type CPUFilterList = 'cpu_list' | 'used_cpus' | 'app_cpus' | 'pid_ppid_rels' | 'app_ppids';
// 进程/线程调度 筛选列表
type ProcessFilterList = 'pid_ppid_rels' | 'app_ppids';  // 总的进程线程列表 | 应用相关的PID列表
type FilterList = NumSwitchFilterList | CPUFilterList | ProcessFilterList | TidPidSwitchFilterList;

// 线程名 | TID | PID | 运行时间 | 平均调度延迟时间 | 最大调度时间 | 最大调度延迟时间 | 切换次数
export type pidTidSwitchSortKey = 'taskname' | 'pid' | 'ppid' | 'task' | 'runtime' | 'avg_delay' |
    'max_delay' | 'max_delay_at' | 'switches';
export type NumaNodeSwitchSortKey = 'taskname' | 'pid' | 'ppid' | 'numa_switch_num'; // 线程名 | TID | PID | 切换次数
export type SortStatus = '' | 'asc' | 'desc';  // 不排序 | 升序 | 降序

@Injectable({
    providedIn: 'root'
})
export class InterfaceService {

    constructor(public vscodeService: VscodeService) { }

    /**
     * get请求
     */
    private get(url: string, params: object): Observable<any> {
        return new Observable((observer) => {
            const option = {
                url: url + Utils.converUrl(params)
            };

            this.vscodeService.get(option, res => {
                observer.next(res);
            });
        });
    }

    /**
     * post请求
     */
    private post(url: string, params: object): Observable<any> {
        return new Observable((observer) => {
            const option = {
                url,
                params
            };

            this.vscodeService.post(option, res => {
                observer.next(res);
            });
        });
    }

    /**
     * 获取总览页进程/线程切换列表数据
     * @param taskId taskId
     * @param nodeId nodeId
     * @param dataState 表格状态
     * @param columns 表格列
     */
    public getTableData(taskId: number, nodeId: number, dataState: TiTableDataState, columns: Array<TiTableColumns>) {
        const url = `/tasks/${taskId}/resource-analysis/process-schedule/`;
        // 排序
        let sortBy: string;
        let sortStatus: SortStatus;
        if (dataState.sort.sortKey && (dataState.sort.asc !== null)) {
            sortBy = dataState.sort.sortKey;
            sortStatus = dataState.sort.asc ? 'asc' : 'desc';
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

        return this.post(url, params);
    }

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
     * 获取筛选框的列表数据，支持多个列表查询
     * @param taskId 任务id
     * @param nodeId 节点id
     * @param keys 要获取的筛选框数据的列表
     */
    public getList(taskId, nodeId, keys: FilterList[]) {
        const url = `/tasks/${taskId}/resource-analysis/common-data/`;
        const params = {
            'node-id': nodeId,
            keys,
        };

        return this.post(url, params);
    }
    /**
     * 获取总时间范围
     * @param taskId 任务id
     * @param nodeId 节点id
     */
    public getTotalTimeRange(taskId, nodeId, queryType: 'cpu' | 'process') {
        const url = `/tasks/${taskId}/resource-analysis/maxmin-time/?`;
        const params = {
            'node-id': nodeId,
            'query-type': queryType,
        };

        return this.get(url, params);
    }

    // -- 总览 - NUMA节点切换 --
    /**
     * 获取 NUMA节点切换 数据
     */
    public getNumaNodeSwitchData(
        {
            taskId, nodeId, pageNo, pageSize, sortBy, sortStatus, tasknameList, TidList, PidList
        }: {
            taskId: any,  // 任务id
            nodeId: any, // 节点id
            pageNo: number, // 页码，从1开始
            pageSize: number, // 每页多少条
            sortBy?: NumaNodeSwitchSortKey,  // 排序字段
            sortStatus?: SortStatus, // 排序顺序
            tasknameList?: string, // 筛选的线程名列表,不传表示全选,以,连接为字符串
            TidList?: string, // 筛选的TID列表,不传表示全选,以,连接为字符串
            PidList?: string,  // 筛选的PID列表,不传表示全选,以,连接为字符串
    }) {
        const url = `/tasks/${taskId}/resource-analysis/numa-switch/`;
        const params = {
            'node-id': nodeId,
            page_index: pageNo - 1,
            page_size: pageSize,
            sortBy,
            sortStatus: sortStatus === '' ? undefined : sortStatus === 'asc' ? 0 : 1,
            taskname: tasknameList,
            tar_tid: TidList,
            tar_pid: PidList,
        };

        return this.post(url, params);
    }

    // -- CPU调度 --
    /**
     * 获取 echart 数据
     */
    public getCpuScheduleData(
        {
            currentType, taskId, nodeId, pageNo, pageSize, cpuList, pidList, sortBy, sortStatus, startTime, endTime
        }: {
            currentType: string, // 当前图例状态
            taskId: any,  // 任务id
            nodeId: any, // 节点id
            pageNo: number, // 页码，从1开始
            pageSize: number, // 每页多少条
            cpuList?: string, // 筛选的CPU列表,不传表示全选,以,连接为字符串
            pidList?: string, // 筛选的pid列表,以,连接为字符串
            sortBy?: 'Running' | 'Idle',  // 排序字段
            sortStatus?: SortStatus, // 排序顺序
            startTime?: number, // 数据窗口范围的起始数值
            endTime?: number,  // 数据窗口范围的结束数值
    }) {
        const url = `/tasks/${taskId}/resource-analysis/cpu-schedule/`;
        let params: any = {
            'node-id': nodeId,
            'schedule-type': 'CPU',
            'page-index': pageNo - 1,
            'page-size': pageSize,
            'start-time': startTime,
            'end-time': endTime,
        };
        if (currentType === 'cpuStatus') {
            params = {
                ...params,
                'cpu-list': cpuList,
            };
        } else if (currentType === 'durationSummary') {
            params = {
                ...params,
                'order-by': sortBy,
                'order-status': sortStatus,
                'cpu-list': cpuList,
            };
        } else if (currentType === 'locatePTid') {
            params = {
                ...params,
                'pid-list': pidList,
            };
        }

        return this.post(url, params);
    }

    // -- 进程/线程调度 --
    /**
     * 获取 echart 数据
     */
    public getPidTidScheduleData(
        {
            currentType, taskId, nodeId, pageNo, pageSize, pidList, sortBy, sortStatus, startTime, endTime
        }: {
            currentType: string, // 当前图例状态
            taskId: any, // 任务id
            nodeId: any, // 节点id
            pageNo: number, // 页码，从1开始
            pageSize: number, // 每页多少条
            pidList?: string, // 筛选的PID列表,不传表示全选,以,连接为字符串
            sortBy?: 'Wait' | 'Schedule' | 'Running',  // 排序字段
            sortStatus?: SortStatus, // 排序顺序
            startTime?: number, // 数据窗口范围的起始数值
            endTime?: number,  // 数据窗口范围的结束数值
    }) {
        const url = `/tasks/${taskId}/resource-analysis/pthread-schedule/`;
        let params: any = {
            'node-id': nodeId,
            'page-index': pageNo - 1,
            'page-size': pageSize,
            'pid-list': pidList,
            'start-time': startTime,
            'end-time': endTime,
        };
        if (currentType === 'durationSummary') {
            params = {
                ...params,
                'order-by': sortBy,
                'order-status': sortStatus,
            };
        }

        return this.post(url, params);
    }
    /**
     * 转换 asc | desc | 'none' 为 true | false | null
     * @param sortStatus 任务id
     */
    public calcSortStatus(sortStatus: any) {
        return sortStatus === 'asc' ? true : sortStatus === 'desc' ? false : null;
    }
}
