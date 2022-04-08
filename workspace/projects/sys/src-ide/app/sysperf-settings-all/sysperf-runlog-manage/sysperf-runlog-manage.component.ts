import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import {VscodeService, COLOR_THEME, currentTheme} from '../../service/vscode.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';
import { ToolType } from 'projects/domain';

/**
 * 日志类型
 */
const enum LOGTYPE {
    WEB_SERVER = 1,
    DATA_ANALYSIS = 2,
    DATA_COLLECTION = 3
}
@Component({
    selector: 'app-sysperf-runlog-manage',
    templateUrl: './sysperf-runlog-manage.component.html',
    styleUrls: ['./sysperf-runlog-manage.component.scss']
})

export class SyperfRunLogManageComponent implements OnInit {

    @ViewChild('downLoad', { static: false }) downLoad;
    @ViewChild('CollectDownLoad', { static: false }) CollectDownLoad;

    // 获取主题颜色
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public i18n: any;
    public isAdmin = false;

    // 运行日志下载
    public columns: Array<TiTableColumns> = [];
    public displayed: Array<TiTableRowData> = [];
    public srcData: TiTableSrcData;
    public displayedOk: Array<TiTableRowData> = [];
    public srcDataOk: TiTableSrcData;
    public fileList = [];
    public fileName = '';
    public columnsOK: Array<TiTableColumns> = [];
    public displayedDetailsOk: Array<TiTableColumns> = [];
    public srcDataDetails: TiTableSrcData;
    public sortLog: any = [];
    public downLoadTitle: any;
    private downloadType: any;
    public logType = {
        WEB_SERVER: LOGTYPE.WEB_SERVER,
        DATA_ANALYSIS: LOGTYPE.DATA_ANALYSIS,
        DATA_COLLECTION: LOGTYPE.DATA_COLLECTION
    };
    public columnsCollect: Array<TiTableColumns> = [];
    public displayedCollect: Array<TiTableRowData> = [];
    public displayedCollectData: Array<TiTableRowData> = [];
    public srcCollectData: TiTableSrcData;
    public checkedList: Array<TiTableRowData> = []; // 默认选中项
    public showLoading = false;
    public runlogDownloaded = false;
    private isFirst = true;
    public toolType = sessionStorage.getItem('toolType');
    private url: any;
    constructor(
        private urlService: UrlService,
        public vscodeService: VscodeService,
        public i18nService: I18nService,
    ) {
        // vscode颜色主题
        this.currTheme = currentTheme();
        this.i18n = this.i18nService.I18n();
        this.url = this.urlService.Url();
    }

    /**
     * 初始加载
     */
    ngOnInit() {

        // 用户角色判断
        this.isAdmin = VscodeService.isAdmin();

        this.sortLog = [
            {
                title: this.i18n.plugins_perf_runlog_webServerLog,
                type: LOGTYPE.WEB_SERVER
            },
            {
                title: this.i18n.plugins_perf_runlog_dataAnalysis,
                type: LOGTYPE.DATA_ANALYSIS
            },
            {
                title: this.i18n.plugins_perf_runlog_dataCollection,
                type: LOGTYPE.DATA_COLLECTION
            }
        ];

        this.columns = [
            {
                title: '',
                width: '5%'
            },
            {
                title: this.i18n.plugins_perf_tip_sysSet.logFileName,
                width: '65%'
            },
            {
                title: this.i18n.plugins_perf_tip_sysSet.action,
                width: '30%'
            },
        ];

        this.columnsOK = [
            {
                title: this.i18n.plugins_perf_tip_sysSet.logFileName,
                width: '54%',
            },
            {
                title: this.i18n.plugins_perf_tip_sysSet.size,
                width: '46%',
            }
        ];
        this.srcData = {
            data: this.sortLog.map(item => {
                const title = item.title;
                const type = item.type;
                return {
                    title,
                    type
                };
            }),
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        this.srcDataOk = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.srcDataDetails = {
            data: [],
            state: {
              searched: false,
              sorted: false,
              paginated: false
            }
        };
        this.columnsCollect = [
            {
              title: ''
            },
            {
              title: this.i18n.operationLog.logFileName,
              width: '70%'
            },
            {
              title: this.i18n.operationLog.size,
              width: '30%'
            },
        ];
        this.srcCollectData = {
            data: [],
            state: {
              searched: false,
              sorted: false,
              paginated: false
            }
        };
    }

    /**
     * 获取运行日志文件
     * @param data  行数据
     */
    public logDownload(row) {
        this.downLoadTitle = this.i18nService.I18nReplace(this.i18n.plugins_perf_runlog_webServerLog_download, {
            0: row.title
        });
        this.downloadType = row.type;
        this.fileList = [];
        this.srcDataOk.data = [];
        if (this.downloadType === LOGTYPE.WEB_SERVER) {
            this.getRunLogFile(this.url.runLog);
        } else if (this.downloadType === LOGTYPE.DATA_ANALYSIS) {
            this.getRunLogFile(this.url.runlogAnalyzer);
        } else {
            this.getDataCollectionLog('open');
        }
    }

    private getDataCollectionLog(status?: any) {
        if (this.isFirst) {
            this.showLoading = true;
        }
        this.isFirst = false;
        const fileData = [];
        const option = {
            url: this.url.runlogCollector,
            timeout: 60000,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR
        };
        try {
            this.vscodeService.get(option, (res: any) => {
                res.data.logs.forEach(node => {
                    node.file_name.forEach((file, index) => {
                        const item = {
                            name: file,
                            size: node.file_size[index],
                            id: index,
                            ip: node.node_name
                        };
                        fileData.push(item);
                        this.fileList.push(file);
                    });
                });
                this.srcDataDetails.data = fileData;
                this.showLoading = false;
                if (status === 'open') {
                    this.srcCollectData.data = fileData;
                    this.checkedList = fileData.slice(); // 初始选中项
                    this.CollectDownLoad.Open();
                } else {
                    this.srcDataOk.data = fileData;
                    this.runlogDownloaded = !!fileData?.length;
                }
            });
        } catch (error) {
            this.showLoading = false;
        } finally {
            this.showLoading = false;
        }
    }
    /**
     * 获取下载文件
     */
    public getRunLogFile(url) {
        this.showLoading = true;
        const fileData = [];
        const option = {
            url,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR
        };
        this.vscodeService.get(option, (res: any) => {
            this.fileList = res.data.logs.file_name;
            res.data.logs.file_name.forEach((file, index) => {
                const item = {
                    name: file,
                    size: res.data.logs.file_size[index]
                };
                fileData.push(item);
            });
            this.srcDataOk.data = fileData;
            this.showLoading = false;
            this.downLoad.Open();
        });
    }

    /**
     * 关闭下载
     */
    public closeDownloadRunLog() {
        this.downLoad.Close();
        this.CollectDownLoad.Close();
    }

    /**
     * 确认下载
     */
    public downloadRunLog() {
        if (this.downloadType === LOGTYPE.DATA_COLLECTION) { // 下载全部
            this.fileList = [];
            this.checkedList.forEach(val => {
                this.fileList.push(val.name);
            });
        }
        if (this.fileList.length === 0) {
            return;
        }
        this.fileList.forEach(file => {
            const type = this.toolType === ToolType.DIAGNOSE ? '&analysis-type=memory_diagnostic' : '';
            const option = {
                url: '/run-logs/download/?log-name=' + file + type,
                subModule: VscodeService.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR,
                responseType: 'arraybuffer'
            };
            this.vscodeService.get(option, (res: any) => {
                this.closeDownloadRunLog();
                const message = {
                    cmd: 'downloadFile',
                    data: {
                        fileName: file,
                        fileContent: res,
                        invokeLocalSave: true,
                        contentType: 'arraybuffer'
                    }
                };
                this.vscodeService.postMessage(message, null);
            });
        });
    }
    /**
     * 数据采集运行日志详情
     */
    public beforeToggle(row: TiTableRowData): void {

      row.showDetails = !row.showDetails;

      if (row.showDetails && !this.runlogDownloaded) {
        this.getDataCollectionLog();
      }
    }
    /**
     * 下载单个节点的数据采集日志
     */
    public colletorLogDownload(row) {
        this.downLoadTitle = this.i18nService.I18nReplace(this.i18n.plugins_perf_runlog_webServerLog_download, {
            0: this.i18n.plugins_perf_runlog_dataCollection
        });
        this.fileList = [];
        this.fileList.push(row.name);
        this.srcDataOk.data = [];
        this.srcDataOk.data.push(row);
        this.downLoad.Open();
    }
    /**
     * trackBy数据条目中的某个唯一属性值
     */
    public trackByFn(index: number, item: any): number {
        return item.id;
    }
}
