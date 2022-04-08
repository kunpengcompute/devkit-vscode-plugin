import { FormBuilder } from '@angular/forms';
import { TiTableSrcData, TiTableDataState } from '@cloud/tiny3';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';

/**
 * 用户管理
 */
export class OperationLog {

    public static instance: OperationLog;
    elementRef: any;

    // 静态实例常量
    constructor(
        public fb: FormBuilder,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        OperationLog.instance = this;
    }

    public logList: TiTableSrcData;
    public totalNumberLog = 0;
    public currentPageLog = 1;
    public pageSizeLog: { options: Array<number>; size: number } = {
        options: [10, 20, 30, 40, 50],
        size: 20,
    };


    /**
     * 初始化操作日志数据
     */
    public initOperationData() {
        this.logList = {
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
            data: [{
                Time: null,
                information: null,
                ipaddr: null,
                module_type: null,
                result: null,
                user_id: null,
                username: null,
            }]
        };
    }

    /**
     * 根据日志status映射为页面上展示的状态
     * @param status 日志的status
     */
    public statusFormat(status: string): string {
        let statusClass = 'success-icon';
        switch (status) {
            case 'Successful':
                statusClass = 'success-icon';
                break;
            case 'Failed':
                statusClass = 'failed-icon';
                break;
            default:
                statusClass = 'success-icon';
        }
        return statusClass;
    }

    /**
     * 触发页面更新
     * @param data 出发event
     */
    onPageUpdateLog(data) { }

    /**
     * 查询操作日志列表
     * @param currentPage 展示第几页
     * @param pageSize 每页展示的日志条数
     */
    showLogList(currentPage, pageSize) {
        const option = {
            url: '/operation-logs/?page=' + currentPage + '&per-page=' + pageSize,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            this.logList = {
                data: data.data.logs,
                state: {
                    searched: false,
                    sorted: false,
                    paginated: true,
                },
            };
            this.totalNumberLog = data.data.totalCounts;
        });
    }

    /**
     * 更新操作日志列表
     * @param e 前台修改分页参数触发的event
     */
    logUpdate(e) {
        const dataState: TiTableDataState = e.getDataState();
        this.showLogList(
            dataState.pagination.currentPage,
            dataState.pagination.itemsPerPage
        );
    }
}
