import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { MessageService } from '../../service/message.service';
import { I18nService } from '../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { Subscription } from 'rxjs';
import { Utils } from '../../service/utils.service';

@Component({
    selector: 'app-profile-overview',
    templateUrl: './profile-overview.component.html',
    styleUrls: ['./profile-overview.component.scss']
})
export class ProfileOverviewComponent implements OnInit, OnDestroy {
    @ViewChild('chart', { static: false }) chart: any;
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    i18n: any;

    constructor(
        private stompService: StompService,
        private vscodeService: VscodeService,
        public utils: Utils,
        private msgService: MessageService,
        public i18nService: I18nService,
        private downloadService: ProfileDownloadService
    ) {
        this.i18n = this.i18nService.I18n();
        this.propColumns = [
            {
                title: this.i18n.protalserver_profiling_overview_env.keyword,
                width: '50%',
                isSort: true,
                sortKey: 'keyword'
            },
            {
                title: this.i18n.protalserver_profiling_overview_env.value,
                width: '50%'
            }
        ];
        this.searchOptions = [
            {
                label: this.i18n.protalserver_profiling_overview_env.keyword,
                value: 'keyword'
            },
            {
                label: this.i18n.protalserver_profiling_overview_env.value,
                value: 'value'
            }
        ];
        this.searchKeys.push(this.searchOptions[0].value);
    }
    @ViewChild('overviewAnalysis', { static: false }) analysis: any;
    @ViewChild('diffIns', { static: false }) diffIns: any;

    private jvmId: string;
    private guardianId = '';
    public timeData: any[] = []; // 时间轴数据
    public timeLine = {
        start: 0,
        end: 100
    };
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public count = 180;
    public updateOptions: any;
    public startBtnDisabled: any;

    private overviewItems = [
        'heap_usedSize',
        'heap_committedSize',
        'nonHeap_UsedSize',
        'nonHeap_CommittedSize',
        'processPhysical_MemoryUsedSize',
        'systemFreePhysical_MemorySize',
        'gc_activity',
        'classes',
        'threads_RUNNABLE',
        'threads_WAITING',
        'threads_BLOCKED',
        'cpu_load_total',
        'cpu_load_progress'
    ];
    public overViewDatas: any = {
        heap_usedSize: [],
        heap_committedSize: [],

        nonHeap_UsedSize: [],
        nonHeap_CommittedSize: [],
        processPhysical_MemoryUsedSize: [],
        systemFreePhysical_MemorySize: [],
        gc_activity: [],
        classes: [],
        threads_RUNNABLE: [],
        threads_WAITING: [],
        threads_BLOCKED: [],
        cpu_load_total: [],
        cpu_load_progress: []
    };

    public clickOver = true;
    public overviewEnv = {
        title: 'Env',
        items: [
            {
                label: 'PID',
                value: '',
                key: 'lvmid'
            },
            {
                label: 'Host',
                value: '',
                key: 'host'
            },
            {
                label: 'Main Class',
                value: '',
                key: 'name'
            },
            {
                label: 'Arguments',
                value: '',
                key: 'java_command'
            },
            {
                label: 'JVM',
                value: '',
                key: 'vmVersion'
            },
            {
                label: 'Java',
                value: '',
                key: 'jdkVersion'
            }
        ]
    };

    public overviewArgs = {
        title: 'Args',
        value: ''
    };

    private isStopMsgSub: Subscription;
    public propDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public propSrcData: TiTableSrcData = {
        data: [],
        state: {
            searched: false,
            sorted: false,
            paginated: false
        }
    };
    public propColumns: Array<TiTableColumns> = [];
    public fileList: Array<any> = [];
    public noDadaInfo = '';
    public isDownload = false;
    public isNoEchartsFlag = false;
    public isNoArgsFlag = false;
    public searchWords: Array<string> = [];
    public searchKeys: Array<string> = [];
    public searchOptions: any[] = [];
    public suggestArr: any = [];
    public allSuggestArr: any = [];
    public sugtype = 1;
    public showOverview = true;

    /**
     * 初始化
     */
    ngOnInit() {
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // 如果是intellij加载，一秒后初始化；vscode直接初始化
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'
            && (self as any).webviewSession.getItem('downloadProfile') === true) {
            setTimeout(() => {
                this.initWithSession();
            }, 1000);
        } else {
            this.initWithSession();
        }
    }

    /**
     * 获取传参后继续初始化
     */
    initWithSession() {
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.overview;
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop') || 'false');
        if (this.isDownload) {
            if (this.downloadService.downloadItems.tabs[0].link !== 'overview') {
                this.showOverview = false;
            }
            // 导入头部基本信息
            const envs = this.downloadService.downloadItems.overview.environment;
            this.overviewEnv.items.map((item) => {
                item.value = envs[item.label] || '';
            });
            // 导入环境变量
            const keywords = this.downloadService.downloadItems.overview.keyword;
            this.propSrcData.data = Object.keys(keywords).map((key) => {
                return {
                    keyword: key,
                    value: keywords[key] || ''
                };
            });

            const overviewArr: Array<any> = this.downloadService.downloadItems.overview.suggestArr ?? [];
            const gcArr: Array<any> = this.downloadService.downloadItems.gc.suggestArr ?? [];
            const gclogArr: Array<any> = this.downloadService.downloadItems.gclog.suggestArr ?? [];
            const jdbcpoolArr: Array<any> = this.downloadService.downloadItems.jdbcpool.suggestArr ?? [];
            this.downloadService.downloadItems.profileInfo.allSuggestArr =
                [...overviewArr, ...gcArr, ...jdbcpoolArr, ...gclogArr];
            this.suggestArr = this.downloadService.downloadItems.overview.suggestArr ?? [];
            this.getSuggestTip();
            // 导入参数
            const args = this.downloadService.downloadItems.overview.arguments;
            const argStr = args ? args.trim() : '';
            this.overviewArgs.value = argStr.split(/\s+/).join('</br>');
            this.isNoArgsFlag = argStr === '';
            return;
        }

        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');

        setTimeout(() => {
            this.stompService.stateSub = this.msgService.getMessage()
                .subscribe((msg) => {
                    if (msg.type === 'updata_state') {
                        this.updateData(msg.state.data);
                    }
                });
        }, 1000);

        this.getParams();
        this.suggestArr = this.downloadService.downloadItems.overview.suggestArr;
        this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'
                && msg.type === 'updata_state') {
                this.updateData(msg.state.data);
            }
            if (msg.type === 'isStopPro') {
                this.startBtnDisabled = true;
            }
            if (msg.type === 'suggest') {
                this.suggestArr = msg.data.filter((item: any) => {
                    return item.label === 1;
                });
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    this.suggestArr = this.vscodeService.deduplicateSuggestions(this.suggestArr);
                }
                this.downloadService.downloadItems.overview.suggestArr = this.suggestArr;
                this.getSuggestTip();
            }
        });
        if (this.suggestArr.length > 0) {
            this.getSuggestTip();
        }
    }

    private updateData(data: any) {
        this.overviewItems.forEach((item) => {
            if (data[item] instanceof Array) {
                this.overViewDatas[item] = data[item];
            } else {
                this.overViewDatas[item].push(data[item]);
            }
        });
        this.isNoEchartsFlag = this.overViewDatas.length === 0;
        if (this.chart) {
            this.chart.updateEchartsData(this.overViewDatas);
        }
    }

    private getParams() {
        const gId = encodeURIComponent(this.guardianId);
        this.vscodeService
            .get({ url: `/guardians/${gId}/jvms/${encodeURIComponent(this.jvmId)}` }, (resp: any) => {
                this.propSrcData.data = [];
                if (resp.id) {
                    this.overviewEnv.items.forEach((item) => {
                        item.value = resp[item.key] || resp.jvmArguments[item.key];
                        this.downloadService.downloadItems.overview.environment[item.label] = item.value;
                    });
                    if (resp.jvmArguments.jvm_args) {
                        const argStr = resp.jvmArguments.jvm_args.trim();
                        this.overviewArgs.value = argStr.split(/\s+/).join('</br>');
                        this.downloadService.downloadItems.overview.arguments = resp.jvmArguments.jvm_args;
                    }
                    this.isNoArgsFlag = !resp.jvmArguments.jvm_args;
                    this.downloadService.downloadItems.overview.keyword = resp.properties;
                    this.propSrcData.data = Object.keys(resp.properties).map((key) => {
                        return {
                            keyword: key,
                            value: resp.properties[key]
                        };
                    });
                }
            });
    }

    /**
     * 获取数据过度动画
     */
    private showLoding() {
        document.getElementById('sample-loading-box').style.display = 'flex';
    }
    /**
     * 结束获取数据过度动画
     */
    private closeLoding() {
        document.getElementById('sample-loading-box').style.display = 'none';
    }

    /**
     * 执行线程转储
     */
    public dumpHandle() {
        const guardianId = (self as any).webviewSession.getItem('guardianId');

        if (!this.startBtnDisabled) {
            this.startBtnDisabled = true;
            const params = {
                jvmId: (self as any).webviewSession.getItem('jvmId'),
            };
            this.showLoding();
            const option = {
                url: `/guardians/${guardianId}/cmds/dump-thread`,
                params
            };
            this.vscodeService.post(option, (resp: any) => {
                this.closeLoding();
                this.getFiles(resp);
                this.startBtnDisabled = false;
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.vscodeService.showTuningInfo(resp.message, 'info', 'dumpHandle');
                }
            });
        }
    }

    /**
     * 线程转储数据处理方法
     */
    public getFiles(resp: any) {
        this.fileList = [];
        const itemFile: any = {};
        itemFile.name = this.utils.dateFormat(resp.startTime, 'yyyy/MM/dd hh:mm:ss');
        itemFile.startTime = resp.startTime;
        itemFile.isOpen = false;
        itemFile.expanded = true;
        itemFile.checked = false;
        itemFile.files = [];
        itemFile.deadlockNum = 0;
        itemFile.content = resp.content;
        const content = resp.content;
        const files = content.split('\n\n');
        const deadlockReg = /Found\s+\d+\s+deadlock./;
        const deadLockStrIdx = files.findIndex((item: any) => {
            return deadlockReg.test(item);
        });
        if (deadLockStrIdx >= 0) {
            const deadlock = files[deadLockStrIdx].match(/\d+/);
            itemFile.deadlockNum = deadlock[0];
        }
        const reg = /\s+#\d+\s+/;
        const deadLockThreads: any[] = [];
        const deadLockStrReg = /Found one Java-level deadlock:/;
        files.forEach((file: any) => {
            const matchObj = file.match(reg);
            if (matchObj) {
                itemFile.files.push({
                    fileName: file.slice(1, matchObj.index - 1),
                    content: file.slice(matchObj.index + matchObj[0].length),
                    isActive: itemFile.files.length === 0,
                });
            }
            if (deadLockStrReg.test(file)) {
                const threads = file.split('\n');
                threads.forEach((item: any) => {
                    if (deadLockStrReg.test(item)) { return; }
                    const idx = item.indexOf(':');
                    if (idx >= 0) {
                        deadLockThreads.push({
                            type: 'deadLockThread',
                            name: item.slice(1, idx - 1),
                        });
                    }
                });
            }
        });
        itemFile.files = itemFile.files.concat(deadLockThreads);
        itemFile.label = itemFile.name;
        itemFile.value = this.fileList.length;
        this.downloadService.downloadItems.thread.threadDump.push(itemFile);
        this.utils.showInfoBox(this.i18n.protalserver_sampling_tab.dumpSuccess, 'info');
    }

    /**
     * 时间轴筛选
     */
    public timeLineData(e: any) {
        this.timeLine = e;
        this.chart.upDateTimeLine(e);
    }
    /**
     * 搜索
     */
    public searchEvent(event: any): void {
        this.searchKeys[0] = event.key;
        this.searchWords[0] = event.value;
    }

    /**
     * 页面销毁
     */
    ngOnDestroy(): void {
        this.downloadService.downloadItems.overview.suggestArr = this.suggestArr;
    }
    /**
     * 开启弹框
     */
    public openSuggest() {
        this.allSuggestArr = this.downloadService.downloadItems.profileInfo.allSuggestArr;
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.allSuggestArr = this.vscodeService.deduplicateSuggestions(this.allSuggestArr);
        }
        this.analysis.setTypeTab();
        this.analysis.openSetType();
        this.analysis.show();
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.suggestArr.forEach((el: { [x: string]: string; label: any; }) => {
                switch (el.label) {
                    case 1:
                        el.name = this.i18n.protalserver_profiling_tab.overview;
                        el.tab = 'overview';
                        break;
                    case 2:
                        el.name = this.i18n.protalserver_profiling_tab.gc;
                        el.tab = 'gc';
                        break;
                    case 4:
                        el.name = this.i18n.protalserver_profiling_tab.jdbcpool;
                        el.tab = 'jdbcpool';
                        break;
                    case 5:
                        el.name = this.i18n.protalserver_profiling_tab.gcLog;
                        el.tab = 'gcLog';
                        break;
                    default:
                }
            });
        }
    }
    /**
     * 获取当前页面优化建议的Tip数
     */
    public getSuggestTip() {
        this.allSuggestArr = this.downloadService.downloadItems.profileInfo.allSuggestArr;
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.allSuggestArr = this.vscodeService.deduplicateSuggestions(this.allSuggestArr);
        }
    }
}
