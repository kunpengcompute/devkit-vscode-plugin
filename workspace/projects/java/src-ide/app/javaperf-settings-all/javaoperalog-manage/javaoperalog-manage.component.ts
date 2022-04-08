import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableDataState, TiTableComponent } from '@cloud/tiny3';

const CURRENTPAGE = 1;
const TOTALNUMBER = 20;

@Component({
    selector: 'app-javaoperalog-manage',
    templateUrl: './javaoperalog-manage.component.html',
    styleUrls: ['./javaoperalog-manage.component.scss']
})
export class JavaOperalogManageComponent implements OnInit {
    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService,
    ) {
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any;
    // 获取主题颜色
    public currTheme = COLOR_THEME.Dark;
    public isOperate = false;
    public currentPageLog = CURRENTPAGE;
    public totalNumberLog = TOTALNUMBER;
    public displayedLog: Array<TiTableRowData> = [];
    public columsLog: Array<TiTableColumns> = [];
    public logList: TiTableSrcData;
    public pageSizeLog: { options: Array<number>; size: number } = {
        options: [10, 20, 30, 40, 50],
        size: 20,
    };
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public showLoading = false;

    /**
     * 初始加载
     */
    ngOnInit() {
        // 用户角色判断
        this.isOperate = VscodeService.isAdmin();
        this.columsLog = [
            {
                title: this.i18n.plugins_perf_javaperfsetting.common_term_log_user,
                width: '12%',
            },
            {
                title: this.i18n.plugins_perf_javaperfsetting.common_term_log_event,
                width: '13%',
            },
            {
                title: this.i18n.plugins_perf_javaperfsetting.common_term_log_result,
                sortKey: 'age',
                width: '15%',
            },
            {
                title: this.i18n.plugins_perf_javaperfsetting.common_term_log_ip,
                width: '15%',
            },
            {
                title: this.i18n.plugins_perf_javaperfsetting.common_term_log_time,
                width: '20%',
            },
            {
                title: this.i18n.plugins_perf_javaperfsetting.common_term_log_Detail,
                width: '25%',
            },
        ];

        this.showLoading = true;
        this.showLogList(this.currentPageLog, this.pageSizeLog.size);
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     */
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 查询java性能分析操作日志
     */
    public showLogList(currentPageLog: any, totalNumberLog: any) {
        this.showLoading = true;
        const option = {
            url: `/audits?page=${currentPageLog - 1}&size=${totalNumberLog}`
        };
        this.vscodeService.get(option, (data: any) => {
            if (data) {
                this.logList = {
                    data: data.members,
                    state: {
                        searched: false,
                        sorted: false,
                        paginated: true,
                    },
                };
                this.totalNumberLog = data.totalElements;
            }

            this.showLoading = false;
        });
    }

    /**
     * 更新java性能分析操作日志
     */
    public stateUpdate(tiTable: TiTableComponent): void {
        const dataState: TiTableDataState = tiTable.getDataState();
        this.showLogList(
            dataState.pagination.currentPage,
            dataState.pagination.itemsPerPage
        );
    }

    /**
     * 操作日志时间格式 formatOperaLogTime
     * @param date date
     * @param fmt yyyy-MM-dd hh:mm:ss
     */
    public formatOperaLogTime(date: any, fmt: any) {
        const getDate = new Date(date);
        const operaTime = {
            'M+': getDate.getMonth() + 1,
            'd+': getDate.getDate(),
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: getDate.getMilliseconds(),
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (getDate.getFullYear().toString()).substr(4 - RegExp.$1.length)
            );
        }
        for (const k in operaTime) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1, RegExp.$1.length === 1
                        ? (operaTime as any)[k]
                        : (`00${(operaTime as any)[k]}`).substr((`${(operaTime as any)[k]}`).length)
                );
            }
        }
        return fmt;
    }

    /**
     * 下载操作日志
     */
    public operationLogDownload() {
        // 对下载的文件命名
        const operaLogFileName = this.i18n.plugins_perf_javaperfsetting.optimize_log;
        const option = {
            url: '/audits/file',
        };

        this.vscodeService.get(option, (res: any) => {
            if (res.members) {
                let fileContent = this.i18n.plugins_perf_javaperfsetting.common_term_log_user +
                    ',' + this.i18n.plugins_perf_javaperfsetting.common_term_log_event +
                    ',' + this.i18n.plugins_perf_javaperfsetting.common_term_log_result +
                    ',' + this.i18n.plugins_perf_javaperfsetting.common_term_log_ip +
                    ',' + this.i18n.plugins_perf_javaperfsetting.common_term_log_time +
                    ',' + this.i18n.plugins_perf_javaperfsetting.common_term_log_Detail +
                    '\n';
                res.members.forEach((log: any) => {
                    const operationUser = (log.userId && log.username) ? log.username : '';
                    const operationResult = log.succeed ? 'Successful' : 'Failed';
                    const operationTime = this.formatOperaLogTime(log.createTime * 1000, 'yyyy-MM-dd hh:mm:ss');
                    const line = operationUser + ',' + log.operation + ',' + operationResult +
                        ',' + log.clientIp + ',' + operationTime + ',' + log.resource + '\n';
                    fileContent += line;
                });
                const message = {
                    cmd: 'downloadFile',
                    data: {
                        fileName: operaLogFileName + '.csv',
                        fileContent: '\ufeff' + fileContent,
                        invokeLocalSave: true
                    }
                };
                this.vscodeService.postMessage(message, null);
            }
        });
    }
}
