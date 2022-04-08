import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableDataState } from '@cloud/tiny3';
import { FormBuilder } from '@angular/forms';
import { MytipService } from '../../service/mytip.service';
import { I18nService } from '../../service/i18n.service';
import {VscodeService, COLOR_THEME, currentTheme} from '../../service/vscode.service';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';
import { ToolType } from 'projects/domain';
const LOG_MIN_VALUE = 30;
const LOG_MAX_VALUE = 180;
const CURRENTPAGE = 1;
const TOTALNUMBER = 0;

@Component({
    selector: 'app-operalog-manage',
    templateUrl: './operalog-manage.component.html',
    styleUrls: ['./operalog-manage.component.scss']
})

export class OperaLogManageComponent implements OnInit {
    private url: any;
    constructor(
        public fb: FormBuilder,
        public vscodeService: VscodeService,
        public router: Router,
        public mytip: MytipService,
        public i18nService: I18nService,
        private urlService: UrlService,
    ) {
        this.url = this.urlService.Url();
        this.i18n = this.i18nService.I18n();
        // vscode颜色主题
        this.currTheme = currentTheme();
    }
    public i18n: any;
    public logList: TiTableSrcData;
    public displayedLog: Array<TiTableRowData> = [];
    public columsLog: Array<TiTableColumns> = [];
    public isOperate = false;
    public errorFlag = false;
    // 操作日志错误提示
    public errorLogMessage = '';
    public currentPageLog = CURRENTPAGE;
    public totalNumberLog = TOTALNUMBER;
    public pageSizeLog: { options: Array<number>; size: number } = {
        options: [10, 20, 30, 40, 50],
        size: 20,
    };
    // 修改操作日志老化时间
    public isModifyOperaLogFlag = false;
    // 操作日志老化时间(天)
    public operationLogAgeValue: number;
    // 修改之前的操作日志时间
    public tempLogPreVal: any;
    // 修改之后的操作日志时间
    public temLogAfterVal: any;
    public notShowTimeFlag = false;
    public currTheme = COLOR_THEME.Dark;
    public themeDark = COLOR_THEME.Dark;
    public themeLight = COLOR_THEME.Light;
    public toolType: ToolType;

    /**
     * 初始加载
     */
    ngOnInit() {
        this.toolType = sessionStorage.getItem('toolType') as ToolType;

        // 用户角色判断
        this.isOperate = VscodeService.isAdmin();
        this.showLogList(this.currentPageLog, this.pageSizeLog.size);
        this.columsLog = [
            {
                title: this.i18n.common_term_log_user,
                width: '12%',
            },
            {
                title: this.i18n.common_term_log_event,
                width: '13%',
            },
            {
                title: this.i18n.common_term_log_result,
                sortKey: 'age',
                width: '15%',
            },
            {
                title: this.i18n.common_term_log_ip,
                width: '15%',
            },
            {
                title: this.i18n.common_term_log_time,
                width: '20%',
            },
            {
                title: this.i18n.common_term_log_Detail,
                width: '25%',
            },
        ];
        this.errorLogMessage = this.i18n.plugins_perf_tip_inputErr;
    }

    /**
     * 查询操作日志老化时间
     */
    public requestConfigData() {
        const option = {
            url: this.url.configSystem
        };
        this.vscodeService.get(option, (data: any) => {
            this.operationLogAgeValue = data.data.OPT_LOG_DAYS;
        });
    }

    /**
     * 开始修改操作日志老化时间
     * @param val val
     */
    public changeLogTime() {
        this.isModifyOperaLogFlag = true;
        this.tempLogPreVal = this.operationLogAgeValue;
    }

    /**
     * 取消修改操作日志老化时间
     */
    public onCancel() {
        this.isModifyOperaLogFlag = false;
    }

    /**
     * 日志老化时间校验
     */
    public operaLogCheck() {
        const reg = new RegExp(/^[+]{0,1}(\d+)$/);
        let operaTime: any = this.operationLogAgeValue;
        // 操作日志时间非数值校验
        this.errorFlag = !reg.test(operaTime);
        // 操作日志时间数值异常范围校验
        operaTime = Number(operaTime);
        if (operaTime < LOG_MIN_VALUE || operaTime > LOG_MAX_VALUE) {
            this.errorFlag = true;
        }
    }

    /**
     * 确认修改操作日志老化时间
     * @ param val
     */
    public onOperationLogAgeConfirm() {
        const params = {
            system_config: { OPT_LOG_DAYS: this.operationLogAgeValue }
        };
        const option = {
            url: this.url.configSystem,
            param: params
        };
        this.vscodeService.put(option, (data: any) => {
            this.temLogAfterVal = this.operationLogAgeValue;
            if (this.tempLogPreVal === this.temLogAfterVal) {
                const contentPre = this.i18n.plugins_perf_tip_sameLogTime;
                this.vscodeService.showInfoBox(contentPre, 'warn');
            } else {
                const content = this.i18n.plugins_perf_tip_modifySuc;
                this.vscodeService.showInfoBox(content, 'info');
            }
            this.isModifyOperaLogFlag = false;
        });
    }

    /**
     * 查询系统性能分析操作日志
     * @param currentPage currentPage
     * @param pageSize  pageSize
     */
    public showLogList(currentPage, pageSize) {
        const url = this.toolType === ToolType.DIAGNOSE
            ? '/memory-operation-logs/'
            : '/operation-logs/';
        const option = {
            url: url + '?page=' + currentPage + '&per-page=' + pageSize
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.data.logs) {
                this.logList = {
                    data: data.data.logs,
                    state: {
                        searched: false,
                        sorted: false,
                        paginated: true,
                    },
                };
                this.totalNumberLog = data.data.totalCounts;
            }
        });
    }

    /**
     * 更新系统性能分析操作日志
     * @param e e
     */
    public logUpdate(e) {
        const dataState: TiTableDataState = e.getDataState();
        this.showLogList(
            dataState.pagination.currentPage,
            dataState.pagination.itemsPerPage
        );
    }

    /**
     * 更新操作日志
     * @param data data
     */
    onPageUpdateLog(data) { }

    /**
     * 更新操作日志
     * @param data data
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
     * 下载操作日志
     * @param data data
     */
    public downloadOperaLog(item) {
        // 对下载的文件命名
        const str = this.toolType === ToolType.DIAGNOSE
            ? this.i18n.diagnostic.analysis_log
            : this.i18n.plugins_perf_tip_sysSet.sysLog;
        const url = this.toolType === ToolType.DIAGNOSE
            ? '/memory-operation-logs/download/'
            : '/operation-logs/download/';
        const option = {
            url,
            responseType: 'arraybuffer'
        };
        this.vscodeService.get(option, (res: any) => {
            const message = {
                cmd: 'downloadFile',
                data: {
                    fileName: str + '.csv',
                    fileContent: res,
                    invokeLocalSave: true,
                    contentType: 'arraybuffer'
                }
            };
            this.vscodeService.postMessage(message, null);
        });
    }
}
