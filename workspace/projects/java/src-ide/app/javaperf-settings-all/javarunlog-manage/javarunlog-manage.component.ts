import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
    selector: 'app-javarunlog-manage',
    templateUrl: './javarunlog-manage.component.html',
    styleUrls: ['./javarunlog-manage.component.scss']
})
export class JavaRunlogManageComponent implements OnInit {
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
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    // 运行日志列表
    public displayedRunLog: Array<TiTableRowData> = [];
    public runLogList: TiTableSrcData;
    public columnsRunLog: Array<TiTableColumns> = [];
    public sortLog: any = [];
    public downTitle: string;

    // 下载运行日志弹框内容
    public displayedDetailLog: Array<TiTableRowData> = [];
    public detailLogData: TiTableSrcData;
    public detailLogColumns: Array<TiTableColumns> = [];

    // 用户角色判断
    public isOperate = false;

    @ViewChild('logDown', { static: false }) logDown: any;

    /**
     * 初始加载
     */
    ngOnInit() {
        // 用户角色判断
        this.isOperate = VscodeService.isAdmin();

        this.sortLog = [
            this.i18n.plugins_perf_javaperfsetting.javaRunLogName
        ];

        this.columnsRunLog = [
            {
                title: this.i18n.plugins_perf_javaperfsetting.logFileName,
                width: '80%',
            },
            {
                title: this.i18n.plugins_perf_javaperfsetting.logOpera,
                width: '20%',
            },
        ];

        this.detailLogColumns = [
            {
                title: this.i18n.common_term_log_detail,
                width: '54%',
            },
            {
                title: this.i18n.common_term_log_size,
                width: '46%',
            }
        ];
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
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
     * 确认下载运行日志
     */
    public downloadRunLog() {
        this.detailLogData.data.forEach((ele) => {
            this.runLogDownload(ele.fileName);
        });
        this.logDown.close();
    }

    /**
     * 开始下载运行日志数据
     * @param data data
     */
    public runLogDownload(data: any) {
        const runLogFileName = this.i18n.plugins_perf_javaperfsetting.javaRunLog;
        const option = {
            url: `/logging/files/download?fileName=${data}`,
            responseType: 'arraybuffer'
        };
        this.vscodeService.get(option, (res: any) => {
            const message = {
                cmd: 'downloadFile',
                data: {
                    fileName: runLogFileName + '.log',
                    fileContent: res,
                    invokeLocalSave: true,
                    contentType: 'arraybuffer'
                }
            };
            this.vscodeService.postMessage(message, null);
        });
    }

    /**
     * 点击下载 运行日志下载弹框
     * @param data data
     */
    public logDownload(data: any) {
        this.logDown.open();
        this.downTitle = data;
        this.getRunLogFile();

    }

    /**
     * 获取Java性能分析运行日志
     */
    public getRunLogFile() {
        const option = {
            url: '/logging/files'
        };
        this.vscodeService.get(option, (res: any) => {
            const data = res.members;
            this.detailLogData = {
                data,
                state: {
                    searched: true,
                    sorted: true,
                    paginated: true,
                },
            };
        });
    }

    /**
     * 关闭运行日志下载
     */
    public closeLogDown() {
        this.logDown.close();
    }

}
