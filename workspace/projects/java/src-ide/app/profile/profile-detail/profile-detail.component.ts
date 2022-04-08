import {Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { UserGuideService } from '../../service/user-guide.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { LibService } from '../../service/lib.service';

/**
 * 语言类型
 */
const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}
@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.scss'],
})
export class ProfileDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('stopAnalysisIns', { static: false }) stopAnalysisIns: any;
    @ViewChild('deleteAll', { static: false }) deleteAll: any;
    @ViewChild('deleteOne', { static: false }) deleteOne: any;
    @ViewChild('dataLimitMsgBox', { static: false }) dataLimitMsgBox: any;
    @ViewChild('tipContent', { static: false }) tipContent: any;
    @ViewChild('profilethread', { static: false }) profilethread: any;
    public suggestNum: number;
    public suggestArr: any = [];
    public allSuggestArr: any = [];
    public profileSettingActive = false;
    public profileExportActive = false;
    public heapdumpSaved = false;
    public gclogSaved = false;
    public profileName: string;
    public currentTabPage: string;
    public showPhotoRoutes = ['memoryDump', 'io', 'fileIo', 'socketIo', 'database',
        'jdbcpool', 'jdbc', 'mongodb', 'cassandra', 'hbase', 'httpRequest', 'web'];
    public snapCount: number;
    public isDoSnapClick = true; // 防止重复点击
    public profileGuardianName: string;
    public profileId: string;
    public showStopBtn = true;
    public jvmId = '';
    public guardianId = '';
    private guardianName = '';
    i18n: any;
    public currentLang: any;
    public userRole: string;
    public reportData: any; // 暂存报告信息
    public profileInfo: any; // 暂存jvm信息
    constructor(
        private vscodeService: VscodeService,
        private elementRef: ElementRef,
        private router: Router,
        private route: ActivatedRoute,
        private stompService: StompService,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        public userGuide: UserGuideService,
        private tiModal: TiModalService,
        public libService: LibService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('analysis', { static: false }) analysis: any;
    public profileTabs = [
        {
            tabName: 'overview',
            link: 'overview',
            active: true,
        },
        {
            tabName: 'cpu',
            link: 'thread',
            active: false,
            children: [
                {
                    tabName: 'list',
                }
            ]
        },
        {
            tabName: 'memoryDump',
            link: 'memoryDump',
            active: false,
        },
        {
            tabName: 'hot',
            link: 'hot',
            active: false,
        },
        {
            tabName: 'gc',
            link: 'gc',
            active: false,
        },
        {
            tabName: 'io',
            link: 'io',
            active: false,
            children: [
                {
                    tabName: 'fileIo'
                },
                {
                    tabName: 'socketIo'
                }
            ]
        },
        {
            tabName: 'database',
            link: 'database',
            active: false,
            children: [
                {
                    tabName: 'jdbc'
                },
                {
                    tabName: 'jdbcpool'
                },
                {
                    tabName: 'mongodb'
                },
                {
                    tabName: 'cassandra'
                },
                {
                    tabName: 'hbase'
                }
            ]
        },
        {
            tabName: 'web',
            link: 'web',
            active: false,
            children: [
                {
                    tabName: 'httpRequest',
                },
                {
                    tabName: 'springBoot',
                }
            ]
        },
        {
            tabName: 'snapshot',
            link: 'snapshot',
            active: false
        }
    ];

    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;

    public timerFlag: any;
    public guarTimer: any = null;
    public guardianList: any[] = [];
    public curGuardian: any[] = [];
    public refresh = true;
    public showTip = false;
    public typeOptions: any = {};
    public typeSelected: any;
    public isDownload = false;
    public pageName: any;
    public snapshotTip: string;
    // 本次分析中是否还会弹出dataLimitMsgBox弹窗
    public noNext = false;
    private subProfileErrors: Subscription;
    private getSnapShotCount: Subscription;
    public configTitle: any;
    public jdbcpoolConfig: any[] = [];  // 数据库连接池配置信息
    public configContext: any;
    // 连接池配置参数表格
    public configPoolDisplayed: Array<TiTableRowData> = [];
    public configPoolSrcData: TiTableSrcData = {
        data: [],
        state: {
            searched: false,
            sorted: false,
            paginated: false
        }
    };
    public suggestionsSub: Subscription;
    public configPoolColumns: Array<TiTableColumns> = [];
    public sugReport = true;
    public sugtype = 1;
    public suggestItem: any = [
        {
            tabName: 'overview',
            suggest: [],
        },
        {
            tabName: 'gc',
            suggest: [],
        },
        {
            tabName: 'database',
            suggest: [],
        },
        {
            tabName: 'gcLog',
            suggest: [],
        },
    ];
    public tabLink: string;
    public maxThreadDumpCount: number;
    public threadReportNum: number;
    // 内存报告保存按钮能否使用
    public saveBtnDisable = false;
    // gc日志保存按钮能否使用
    public gcSaveDisable = false;
    public saveBtnTip: string;
    public saveBtnGcTip: string;
    public maxHeapCount: number;
    public heapReportNum: number;
    public maxGclogCount: number;
    public gclogNum: number;
    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    /**
     * oninit
     */
    ngOnInit() {
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.showPhotoRoutes.push('httpRequest');
        }
        this.configPoolColumns = [
            {
                title: 'key',
                width: '50%'
            },
            {
                title: 'value',
                width: '50%'
            }
        ];
        this.suggestItem[0].suggest = this.downloadService.downloadItems.overview.suggestArr;
        this.suggestItem[1].suggest = this.downloadService.downloadItems.gc.suggestArr;
        this.suggestItem[2].suggest = this.downloadService.downloadItems.jdbcpool.suggestArr;
        this.suggestItem[3].suggest = this.downloadService.downloadItems.gclog.suggestArr;
        this.suggestNum = this.downloadService.downloadItems.gc.suggestArr.length +
            this.downloadService.downloadItems.jdbcpool.suggestArr.length +
            this.downloadService.downloadItems.overview.suggestArr.length +
            this.downloadService.downloadItems.gclog.suggestArr.length;
        if (this.getSnapShotCount) { this.getSnapShotCount.unsubscribe(); }
        this.getSnapShotCount = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'getSnapShotCount') {
                this.handleSnapShotCount();
            }
            if (msg.type === 'updateJdbcpoolConfig') {
                // 更新数据库连接池配置信息
                this.handleJdbcpoolConfig(msg.config);
            }
        });

        // 监听内存转储数量阈值变换
        this.vscodeService.regVscodeMsgHandler('updateHeapReportConfig', (msgData: any) => {
            if (msgData.maxHeapCount && msgData.heapReportNum) {
                this.heapReportNum = Number(msgData.heapReportNum);
                this.maxHeapCount = Number(msgData.maxHeapCount);
                this.checkHeapdumpReportNum();
            }
        });

        // 监听内存转储数量阈值变换
        this.vscodeService.regVscodeMsgHandler('updateGClogReportConfig', (msgData: any) => {
            if (msgData.maxGcLogCount && msgData.gclogReportNum) {
                this.gclogNum = Number(msgData.gclogReportNum);
                this.maxGclogCount = Number(msgData.maxGcLogCount);
                this.checkGClogReportNum();
            }
        });
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.messageHandler.sendHeapdumpReport = (data: any) => {
                this.heapReportNum = Number(data.data.heapReportNum);
                this.maxHeapCount = Number(data.data.maxHeapCount);
                this.checkHeapdumpReportNum();
            };

            this.vscodeService.messageHandler.sendGClogReport = (data: any) => {
                this.gclogNum = Number(data.data.gclogReportNum);
                this.maxGclogCount = Number(data.data.maxGcLogCount);
                this.checkGClogReportNum();
            };
        }
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.suggestionsSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'suggestions') {
                this.suggestArr = this.downloadService.downloadItems.profileInfo.suggestArr;
                this.msgService.sendMessage({
                    type: 'suggest',
                    data: this.suggestArr
                });
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    this.downloadService.downloadItems.profileInfo.suggestArr =
                    this.vscodeService.deduplicateSuggestions(
                        this.downloadService.downloadItems.profileInfo.suggestArr);
                }
                this.suggestNum = this.downloadService.downloadItems.profileInfo.suggestArr.length
                    + this.downloadService.downloadItems.jdbcpool.suggestArr.length;
                this.parseData();
            }
            if (msg.type === 'connect-pool-suggest') {
                this.suggestItem[2].suggest = this.downloadService.downloadItems.jdbcpool.suggestArr;
                this.suggestNum = this.suggestItem[0].suggest.length + this.suggestItem[1].suggest.length
                    + this.suggestItem[2].suggest.length + this.suggestItem[3].suggest.length;
            }
            if (msg.type === 'suggest') {
                this.suggestItem[3].suggest = msg.data.filter((item: any) => {
                    return item.label === 5;
                });
            }
            if (msg.type === 'suggestions' || msg.type === 'connect-pool-suggest' || msg.type === 'suggest') {
                this.downloadService.downloadItems.profileInfo.allSuggestArr = [];
                this.downloadService.downloadItems.profileInfo.allSuggestArr =
                    [...this.suggestItem[0].suggest, ...this.suggestItem[1].suggest,
                    ...this.suggestItem[2].suggest, ...this.suggestItem[3].suggest];
                this.allSuggestArr = this.downloadService.downloadItems.profileInfo.allSuggestArr;
                setTimeout(() => {
                    this.analysis.setTypeTab();
                    this.analysis.openSetType();
                }, 0);
            }
            if (msg.data) {
                this.jdbcpoolConfig.forEach((item: any) => {
                    if (msg.data.subLabel === item.label) {
                        item.expected = msg.data.title;
                        item.descInfo = msg.data.potentialStuff[0];
                        const detailAll: any = [];
                        const detailArr = msg.data.suggestion.split(';').slice(0, -1);
                        detailArr.forEach((e: any) => {
                            const keyArr = e.split(':');
                            detailAll.push({
                                key: keyArr[0],
                                value: keyArr[1]
                            });
                        });
                        item.detail = detailAll;
                    }
                });
            }
            if (msg.type === 'deleteGcLogSuggest') {
                this.downloadService.downloadItems.gclog.suggestArr = [];
                this.suggestItem[3].suggest = [];
                this.suggestNum = this.suggestItem[0].suggest.length +
                    this.suggestItem[1].suggest.length + this.suggestItem[2].suggest.length;
            }
        });
        this.router.events.subscribe((event: any) => {
            const objStr = 'navigationTrigger';
            if (event[objStr]) {
                const str = 'url';
                this.snapCount = 0;
                const urls = event[str].split('/');
                this.currentTabPage = urls[urls.length - 1];
                if (this.currentTabPage.indexOf('?') > -1) {
                    this.currentTabPage = this.currentTabPage.substring(0, this.currentTabPage.indexOf('?'));
                }
                if (this.currentTabPage === 'log') {
                    this.checkGClogReportNum();
                } else if (this.currentTabPage === 'memoryDump') {
                    this.checkHeapdumpReportNum();
                }
                this.handleSnapShotCount();
                if (this.currentTabPage === 'memoryDump') {
                    this.snapshotTip = this.i18n.memorydump_snapshot_analysis_tips;
                } else {
                    this.snapshotTip = this.i18n.snapshot_analysis_tips;
                }
            }
        });
        this.typeOptions = [
            {
                label: this.i18n.plugins_javaperf_button_clear_all,
                id: 'all'
            },
            {
                label: this.i18n.plugins_javaperf_button_clear_one,
                id: 'one'
            }
        ];
        this.currentLang = I18nService.getLang();
        const routeParams = this.route.snapshot.queryParams;
        this.jvmId = routeParams.jvmId;
        this.profileName = routeParams.currentSelectJvm;
        this.userRole = routeParams.role;
        this.maxHeapCount = Number(routeParams.maxHeapCount);
        this.heapReportNum = Number(routeParams.heapReportNum);

        this.maxGclogCount = Number(routeParams.maxGcLogCount);
        this.gclogNum = Number(routeParams.gclogReportNum);

        (self as any).webviewSession.setItem('currentSelectJvm', routeParams.currentSelectJvm);
        (self as any).webviewSession.setItem('role', routeParams.role);
        (self as any).webviewSession.setItem('username', routeParams.username);
        (self as any).webviewSession.setItem('loginId', routeParams.loginId);
        (self as any).webviewSession.setItem('jvmId', routeParams.jvmId);
        (self as any).webviewSession.setItem('showSourceCode', 'true');
        (self as any).webviewSession.setItem('maxThreadDumpCount', routeParams.maxThreadDumpCount);
        (self as any).webviewSession.setItem('threadReportNum', routeParams.threadReportNum);

        if (routeParams.downloadProfile === 'true') {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                (self as any).webviewSession.setItem('downloadProfile', true);
                this.getIntellijImportData(routeParams.downloadDatas);
            } else {
                this.downloadService.downloadItems = JSON.parse(routeParams.downloadDatas);
                this.setDownloadServiceItems();
            }
            return;
        } else {
            this.guardianId = routeParams.guardianId;
            this.guardianName = routeParams.guardianName;
            this.profileGuardianName = routeParams.guardianName;
            (self as any).webviewSession.setItem('guardianId', routeParams.guardianId);
            (self as any).webviewSession.setItem('guardianName', routeParams.guardianName);
            (self as any).webviewSession.setItem('downloadProfile', 'false');
            (self as any).webviewSession.setItem('isProStop', 'false');
            (self as any).webviewSession.setItem('lvmid', routeParams.lvmid);
            this.downloadService.downloadItems.profileInfo.jvmName = this.profileName;
            (self as any).webviewSession.setItem('reportName', this.profileName);
            this.downloadService.downloadItems.profileInfo.jvmId = this.jvmId;
            this.isDownload = false;
            this.initWithSession();
        }
        // 获取线程转储数量
        this.getThreaddumpReportNum();
        // 处理内存转储数量
        this.checkHeapdumpReportNum();
        // 处理GC日志数量
        this.checkGClogReportNum();

        // 注册停止分析监听
        this.vscodeService.messageHandler.stopProfiling = () => {
            this.stompService.startStompRequest('/cmd/stop-profile', {
                jvmId: this.jvmId,
                guardianId: this.guardianId,
            });
            this.subStopAnalysis();
            this.stompService.disConnect();
            this.stopAnalysisIns.alert_close();
        };
        // 注册IDE获取目标环境信息监听
        this.vscodeService.messageHandler.queryGuardinsByIDE = (resp: any) => {
            this.queryGuardinsCallback(resp.data);
        };
        // 注册导出分析监听
        this.vscodeService.messageHandler.exportProfiling = () => {
            this.profileTabs.forEach((tab: any) => {
                if (tab.tabName !== 'memoryDump' && tab.tabName !== 'hot') {
                    this.downloadService.downloadItems.tabs.push({
                        tabName: tab.tabName,
                        link: tab.link
                    });
                    if (tab.children) {
                        tab.children.forEach((child: any) => {
                            this.downloadService.downloadItems.tabs.push({
                                tabName: child.tabName,
                                link: child.tabName,
                                parentTabName: tab.tabName,
                                parentLink: tab.link
                            });
                        });
                    }
                }
            });
            const profileDatas = this.downloadService.downloadItems;
            const option = {
                cmd: 'downloadFile',
                data: {
                    fileName: this.profileName + '.json',
                    fileContent: JSON.stringify(profileDatas),
                    invokeLocalSave: true,
                }
            };
            this.vscodeService.postMessage(option, null);
        };
        if (this.isIntellij) {
            this.profileTabs = this.profileTabs.filter(item => {
                return item.tabName !== 'hot';
            });
        }
    }

    /**
     * 从intellij通过回调拿导入的数据
     * @param downloadDatas 往intellij传递参数
     */
    getIntellijImportData(downloadDatas: any) {
        return new Promise((resolve) => {
            const option = {
                url: 'getIntellijImportData',
                param: downloadDatas
            };
            this.vscodeService.get(option, (data: any) => {
                resolve(data);
            });
        }).then(value => {
            this.downloadService.downloadItems = value;
            this.setDownloadServiceItems();
        });
    }

    setDownloadServiceItems(): void {
        this.profileTabs = [];
        if (this.downloadService.downloadItems.tabs.length !== 0) {
            this.downloadService.downloadItems.tabs.forEach((tab: any) => {
                this.profileTabs.push({
                    tabName: tab.parentTabName || tab.tabName,
                    link: tab.parentLink || tab.link,
                    active: false,
                });
            });
            const map = new Map();
            this.profileTabs = this.profileTabs.filter((tab: any) => {
                return !map.has(tab.tabName) && map.set(tab.tabName, 1);
            });
            this.profileTabs.forEach((item) => { item.active = false; });
            this.profileTabs[0].active = true;
            if (this.profileTabs[0].link !== 'overview') {
                this.router.navigate([this.profileTabs[0].link], { relativeTo: this.route });
            }
        }
        (self as any).webviewSession.setItem('downloadProfile', 'true');
        (self as any).webviewSession.setItem('isProStop', 'true');
        this.isDownload = true;
        const overviewArr: Array<any> = this.downloadService.downloadItems.overview.suggestArr ?? [];
        const gcArr: Array<any> = this.downloadService.downloadItems.gc.suggestArr ?? [];
        const gcLogArr: Array<any> = this.downloadService.downloadItems.gclog.suggestArr ?? [];
        const jdbcpoolArr: Array<any> = this.downloadService.downloadItems.jdbcpool.suggestArr ?? [];
        this.downloadService.downloadItems.profileInfo.allSuggestArr =
            [...overviewArr, ...gcArr, ...jdbcpoolArr, ...gcLogArr];
        this.allSuggestArr = this.downloadService.downloadItems.profileInfo.allSuggestArr;
        this.suggestNum = overviewArr.length + gcArr.length + jdbcpoolArr.length;
        this.initWithSession();
    }
    /**
     * 获取传参后继续初始化
     */
    initWithSession() {
        if (this.isDownload) {
            this.subStopAnalysis();
            return;
        }

        // change
        this.timerFlag = false;
        if (((self as any).webviewSession || {}).getItem('tuningOperation') !== 'hypertuner') {
            this.guarTimer = setInterval(() => {
                this.queryGuardins();
                if (this.timerFlag) {
                    clearInterval(this.guarTimer);
                    this.guarTimer = null;
                }
            }, 3000);
        }
        (self as any).webviewSession.removeItem('snapShot');

        const profileSubs = [
            `/user/queue/profile/jvms/${this.jvmId}/state`,
            `/user/queue/profile/jvms/${this.jvmId}/instance`,
            `/user/queue/profile/jvms/${this.jvmId}/thread-state`,
            `/user/queue/profile/jvms/${this.jvmId}/http`,
            `/user/queue/profile/jvms/${this.jvmId}/metrics`,
            `/user/queue/profile/jvms/${this.jvmId}/health`,
            `/user/queue/profile/jvms/${this.jvmId}/httptrace`,
            `/user/queue/profile/jvms/${this.jvmId}/jdbc`,
            `/user/queue/profile/jvms/${this.jvmId}/connect-pool`,
            `/user/queue/profile/jvms/${this.jvmId}/connect-pool-suggest`,
            `/user/queue/profile/jvms/${this.jvmId}/suggestions`,
            `/user/queue/profile/jvms/${this.jvmId}/file`,
            `/user/queue/profile/jvms/${this.jvmId}/socket`,
            `/user/queue/profile/jvms/${this.jvmId}/hbase`,
            `/user/queue/profile/jvms/${this.jvmId}/cassandra`,
            `/user/queue/profile/jvms/${this.jvmId}/mongodb`,
            `/user/queue/profile/jvms/${this.jvmId}/hotspot-analysis`,
            `/user/queue/profile/jvms/${this.jvmId}/gcState`,
            `/user/queue/profile/jvms/${this.jvmId}/gcLog`,
            `/user/queue/profile/jvms/${this.jvmId}/heap`,
            `/user/queue/profile/jvms/${this.jvmId}/error`,
            '/user/queue/profile/errors',
        ];
        if (this.stompService.stompClient) { this.stompService.stompClient.disconnect(); }
        this.stompService.client(profileSubs, '/cmd/start-profile', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
        });
        this.downloadService.downloadItems.profileInfo.jvmId = this.jvmId;
        this.downloadService.downloadItems.profileInfo.jvmName = this.profileName;
        this.subProfileErrors = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'profileErrors') {
                if (msg.data.body) {
                    const body = JSON.parse(msg.data.body);
                    const message = {
                        cmd: 'showInfoBox',
                        data: { info: body.message, type: 'error' },
                    };
                    if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                        this.vscodeService.showTuningInfo(body.message, 'error', 'killThread');
                    } else {
                        this.vscodeService.postMessage(message, null);
                    }
                }
            }
        });
    }
    /**
     * afterInit
     */
    ngAfterViewInit(): void {
        // 调整英文下的最小宽度
        if (this.currentLang === LANGUAGE_TYPE.EN) {
            $('html').addClass('html-min-width');
        }
        const proTitle = this.elementRef.nativeElement.querySelector('.pro-title');
        if (proTitle) {
            const proTitleWidth = proTitle.offsetWidth;
            if (proTitleWidth > 490) {
                this.showTip = true;
            }
        }

        // user-guide
        if ((self as any).webviewSession.getItem('flogin') === '1' &&
            (self as any).webviewSession.getItem('step') === '5') {
            this.userGuide.hideMask();
            setTimeout(() => {
                this.userGuide.showMask('user-guide-profile');
            }, 500);
        }
    }

    /**
     * tabs触发
     *
     * @param index tab数组索引
     * @param routelink 路由链接
     */
    tabsToggle(index: number, routelink: string) {
        const currentPage = this.profileTabs.filter(item => item.active);
        if (currentPage[0].link !== routelink) {
            const toggle = () => {
                this.tabLink = routelink;
                this.profileTabs.forEach((tab) => {
                    tab.active = false;
                });
                this.profileTabs[index].active = true;
                this.router.navigate([routelink], { relativeTo: this.route });
            };
            toggle();
        }
    }
    /**
     * 停止分析
     */
    stopAnalysis() {
        this.stopAnalysisIns.type = 'prompt';
        this.stopAnalysisIns.alert_show();
        this.stopAnalysisIns.width = '600px';
        this.stopAnalysisIns.title = this.i18n.common_term_has_profiling_stop_tip;
    }

    /**
     * 确认停止
     * @param data data
     */
    public confirmHandle_stop(data: any) {
        if (data) {
            this.stompService.startStompRequest('/cmd/stop-profile', {
                jvmId: this.jvmId,
                guardianId: this.guardianId,
            });
            this.subStopAnalysis();
            this.stompService.disConnect();
            this.stopAnalysisIns.alert_close();
            return;
        }
    }

    /**
     * 查询guardians
     */
    queryGuardins() {
        this.vscodeService.get({ url: '/guardians' }, (resp: any) => {
            this.queryGuardinsCallback(resp);
        });
    }
    private queryGuardinsCallback(resp: any) {
        if (resp.members.length) {
            this.guardianList = resp.members;

            this.curGuardian = this.guardianList.filter((item) => {
                return item.owner.username === (self as any).webviewSession.getItem('username')
                    && item.id === this.guardianId;
            });

            if (!this.curGuardian.length) {
                this.showInfoBox(this.i18nService.I18nReplace(this.i18n.guardian_not_fount,
                    { 0: this.guardianName }), 'warn');
                this.subStopAnalysis();
                this.stompService.disConnect();
                clearInterval(this.guarTimer);
                this.guarTimer = null;
            }
        } else {

            this.showInfoBox(this.i18nService.I18nReplace(this.i18n.guardian_not_fount,
                { 0: this.guardianName }), 'warn');

            this.subStopAnalysis();
            this.stompService.disConnect();
            clearInterval(this.guarTimer);
            this.guarTimer = null;
        }
    }
    /**
     * 弹出右下角提示消息
     * @param info info
     * @param type 提示类型
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
    private subStopAnalysis() {
        this.msgService.sendMessage({
            type: 'isStopPro',
            isStop: true,
        });
        (self as any).webviewSession.setItem('isProStop', 'true');
        this.showStopBtn = false;
    }

    /**
     * 导出报告弹框
     */
    public showReportView() {

    }
    /**
     * 快照
     */
    public doSnap() {
        if (this.isDoSnapClick) {
            this.isDoSnapClick = false;
            // 事件
            if (this.snapCount < 5) {
                this.doSnapFn();
            } else {
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: this.i18n.memorydump_snapshot_analysis_alert,
                        type: 'warn'
                    }
                };
                this.vscodeService.postMessage(message, null);
            }
            // 定时器
            setTimeout(() => {
                this.isDoSnapClick = true;
            }, 1000); // 一秒内不能重复点击
        }
    }

    /**
     * 保存内存转储
     */
    savedHeapdumpReport() {
        if (this.saveBtnDisable) {
            return;
        }
        if (this.downloadService.downloadItems.heapDump.histogram.length > 0 ||
            this.downloadService.downloadItems.heapDump.domtree.length > 0) {
            this.heapdumpSaved = true;
        } else {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.plugins_pref_java_saved_report_analysis_noData,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }
    }

    /**
     * 保存GC日志
     */
    savedGClogReport() {
        if (this.gcSaveDisable) {
            return;
        }
        if (this.downloadService.downloadItems.gclog.keyIndicatorArray.length > 0) {
            this.gclogSaved = true;
        } else {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.plugins_pref_java_saved_report_analysis_noData,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }
    }

    /**
     * 快照执行函数
     */
    public doSnapFn() {
        if (this.currentTabPage === 'httpRequest' || this.currentTabPage === 'web') {
            this.msgService.sendMessage({
                type: 'isHttp'
            });
            return;
        }
        if (this.currentTabPage === 'io' || this.currentTabPage === 'fileIo') {
            this.msgService.sendMessage({
                type: 'isFileIo'
            });
            return;
        }
        if (this.currentTabPage === 'socketIo') {
            this.msgService.sendMessage({
                type: 'isSocketIo'
            });
            return;
        }
        if (this.currentTabPage === 'memoryDump') {
            if (this.downloadService.downloadItems.heapDump.histogram.length > 0 ||
                this.downloadService.downloadItems.heapDump.domtree.length > 0) {
                if (this.snapCount < 5) {
                    const option = {
                        url: `/guardians/${this.guardianId}/jvms/${this.jvmId}/heaps/${this.downloadService.
                            downloadItems.heapDump.recordId}`
                    };
                    this.vscodeService.put(option, (resp: any) => {
                        if (resp.code === 0) {
                            this.preserveSnapShot('heapDump');
                        } else {
                            const message = {
                                cmd: 'showInfoBox',
                                data: {
                                    info: this.i18n.memorydump_snapshot_analysis_content1,
                                    type: 'warn'
                                }
                            };
                            this.vscodeService.postMessage(message, null);
                        }
                    });
                } else {
                    const message = {
                        cmd: 'showInfoBox',
                        data: {
                            info: this.i18n.memorydump_snapshot_analysis_alert,
                            type: 'warn'
                        }
                    };
                    this.vscodeService.postMessage(message, null);
                }
            } else {
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: this.i18n.snapshot_analysis_noData,
                        type: 'warn'
                    }
                };
                this.vscodeService.postMessage(message, null);
            }
        } else {
            this.msgService.sendMessage({
                type: 'getSnapShot',
            });
        }

    }
    /**
     * 保存快照调用接口
     */
    public preserveSnapShot(type: any) {
        if (this.isDownload) { return; }
        const snapCounts = 5;
        if (this.snapCount < snapCounts) {
            const nowTime = this.libService.getSnapTime();
            const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
                JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData) || {};
            if (!snapShot[type]) {
                snapShot[type] = {
                    label: this.i18n.protalserver_profiling_tab.memoryDump,
                    type,
                    children: [],
                };
            }
            snapShot[type].children.push({
                label: nowTime,
                snapShotId: this.downloadService.downloadItems.heapDump.recordId,
                type,
                value: {
                    file: [],
                    treeFile: [],
                    snapCount: this.snapCount + 1,
                    totalNumber: this.downloadService.downloadItems.heapDump.histogramStatus.totalNumber,
                    size: this.downloadService.downloadItems.heapDump.histogramStatus.size,
                    currentTotal: this.downloadService.downloadItems.heapDump.domtreeStatus.currentTotal,
                    totalNumberT: this.downloadService.downloadItems.heapDump.domtreeStatus.totalNumberT,
                }
            });
            const isOverSize = this.handleIsOverSize(JSON.stringify(snapShot));
            if (!isOverSize) { return; }
            this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
            this.downloadService.downloadItems.snapShot.data = snapShot;
            this.downloadService.downloadItems.heapDump.snapCount = ++this.snapCount;
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.vscodeService.showTuningInfo(this.i18n.snapshot_success_alert, 'info', 'ioSnapshot');
            }
        } else {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.memorydump_snapshot_analysis_alert,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }
    }
    /**
     * 更新快照数量
     */
    private handleSnapShotCount() {
        switch (this.currentTabPage) {
            case 'memoryDump':
                this.snapCount = this.downloadService.downloadItems.heapDump.snapCount;
                break;
            case 'web':
            case 'httpRequest':
                this.snapCount = this.downloadService.downloadItems.http.snapCount;
                break;
            case 'database':
                this.snapCount = this.downloadService.downloadItems.jdbc.snapCount;
                break;
            case 'jdbc':
                this.snapCount = this.downloadService.downloadItems.jdbc.snapCount;
                break;
            case 'jdbcpool':
                this.snapCount = this.downloadService.downloadItems.jdbcpool.snapCount;
                this.configTitle = this.downloadService.dataSave.configTitle;
                this.jdbcpoolConfig = this.downloadService.dataSave.jdbcpoolConfigData;
                break;
            case 'mongodb':
                this.snapCount = this.downloadService.downloadItems.mongodb.snapCount;
                break;
            case 'cassandra':
                this.snapCount = this.downloadService.downloadItems.cassandra.snapCount;
                break;
            case 'hbase':
                this.snapCount = this.downloadService.downloadItems.hbase.snapCount;
                break;
            default:
                break;
        }
        if (this.currentTabPage === 'fileIo' || this.currentTabPage === 'io') {
            this.snapCount = this.downloadService.downloadItems.pFileIO.snapCount;
        }
        if (this.currentTabPage === 'socketIo') {
            this.snapCount = this.downloadService.downloadItems.pSocketIO.snapCount;
        }
    }
    /**
     * 大小判定
     */
    public handleIsOverSize(data: any) {
        const newDataSize = data.length;
        const obj = window.sessionStorage;
        const sessionSize = 5120 * 1024;
        let size = 0;
        for (const item in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, item)) {
                size += obj.getItem(item).length;
            }
        }
        if (newDataSize + size > sessionSize) {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.snapshot_analysis_overSize,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
            return false;
        }
        return true;
    }
    /**
     * 数据清除
     */
    public typeChange(data: any): void {
        if (data.id === 'all') {
            this.deleteAll.type = 'warn';
            this.deleteAll.alert_show();
            this.deleteAll.title = this.i18n.plugins_javaperf_tip_delAll;
            this.deleteAll.haveContent = false;
            this.deleteAll.content = this.i18n.plugins_javaperf_tip_delAllTip;
        }
        if (data.id === 'one') {
            const page = this.downloadService.clearTabs.currentTabPage;
            // 快照页签清除数据提示
            if (this.currentTabPage === 'snapshot') {
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: this.i18n.profileMemorydump.snapShot.protalserver_profiling_delSnapshotTip,
                        type: 'warn'
                    }
                };
                this.vscodeService.postMessage(message, null);
                return;
            }
            this.deleteOne.content = this.i18nService.I18nReplace(
                this.i18n.plugins_javaperf_tip_delOneTip,
                { 0: page }
            );
            this.deleteOne.title = this.i18nService.I18nReplace(
                this.i18n.plugins_javaperf_tip_delOne,
                { 0: page }
            );
            this.deleteOne.type = 'warn';
            this.deleteOne.haveContent = false;
            this.deleteOne.alert_show();
        }
    }

    /**
     * 确认删除全部数据
     * params data Boolean true表示选择确定
     */
    public confirmHandle_delAll(data: any) {
        if (data) {
            const currentPage = this.downloadService.downloadItems.currentTabPage;
            this.reportData = this.downloadService.downloadItems.report;
            this.profileInfo = this.downloadService.downloadItems.profileInfo;
            (self as any).webviewSession.removeItem('gcLogState');
            this.downloadService.initData();
            this.suggestItem[3].suggest = [];
            this.downloadService.downloadItems.currentTabPage = currentPage;
            this.downloadService.downloadItems.overview.suggestArr = this.suggestItem[0].suggest;
            this.downloadService.downloadItems.gc.suggestArr = this.suggestItem[1].suggest;
            this.downloadService.downloadItems.jdbcpool.suggestArr = this.suggestItem[2].suggest;
            this.downloadService.downloadItems.report = this.reportData;
            this.downloadService.downloadItems.profileInfo = this.profileInfo;
            this.downloadService.downloadItems.profileInfo.allSuggestArr =
                this.suggestItem[0].suggest.concat(this.suggestItem[1].suggest,
                    this.suggestItem[2].suggest);
            this.suggestNum = this.suggestItem[0].suggest.length +
                this.suggestItem[1].suggest.length + this.suggestItem[2].suggest.length;
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.snapCount = 0;
            }
            this.msgService.sendMessage({
                type: 'isClear',
                isClear: true,
            });
        }
    }
    /**
     * 确认删除当前页签
     * params data Boolean true表示选择确定
     */
    public confirmHandle_delOne(data: any) {
        this.pageName = this.downloadService.clearTabs.currentTabPage;
        if (data) {
            if (this.pageName === this.i18n.protalserver_profiling_tab.gcLog) {
                this.downloadService.downloadItems.gclog.suggestArr = [];
                this.suggestItem[3].suggest = [];
                this.suggestNum = this.suggestItem[0].suggest.length +
                    this.suggestItem[1].suggest.length + this.suggestItem[2].suggest.length;
                this.downloadService.downloadItems.profileInfo.allSuggestArr =
                    [...this.suggestItem[0].suggest, ...this.suggestItem[1].suggest,
                    ...this.suggestItem[2].suggest];
            }
            this.msgService.sendMessage({
                type: this.pageName,
                isClear: true,
            });
        }
    }

    /**
     * 按钮active
     */
    public getActive(active: any) {
        this.profileExportActive = active;
    }

    /**
     * 页面销毁
     */
    ngOnDestroy(): void {
        if (this.subProfileErrors) { this.subProfileErrors.unsubscribe(); }
        if (this.getSnapShotCount) { this.getSnapShotCount.unsubscribe(); }
        if ((self as any).webviewSession.getItem('isProStop') === 'true') {
            (self as any).webviewSession.removeItem('springBootToken');
        }
        setTimeout(() => {
            clearInterval(this.guarTimer);
            this.guarTimer = null;
        }, 1000);
    }

    /**
     * configMouse
     * @param values values
     */
    public configMouse(value: any) {
        this.configContext = value;
        this.configPoolSrcData.data = value.detail;
    }
    /**
     * 处理数据库连接池配置信息
     */
    private handleJdbcpoolConfig(obj: any) {
        this.configTitle = obj.configTitle;
        this.jdbcpoolConfig = obj.jdbcpoolConfig;
    }
    /**
     * 计算优化建议的数
     */
    public parseData() {
        this.suggestItem[0].suggest = this.suggestArr.filter((item: any) => {
            return item.label === 1;
        });
        this.downloadService.downloadItems.overview.suggestArr = this.suggestItem[0].suggest;
        this.suggestItem[1].suggest = this.suggestArr.filter((item: any) => {
            return item.label === 2;
        });
        this.downloadService.downloadItems.gc.suggestArr = this.suggestItem[1].suggest;
        this.suggestItem[3].suggest = this.suggestArr.filter((item: any) => {
            return item.label === 5;
        });
        this.downloadService.downloadItems.gclog.suggestArr = this.suggestItem[3].suggest;
    }
    /**
     * 连接池配置参数
     */
    public openConfig() {
        this.tiModal.open(this.tipContent, {
            id: 'tipContent',
        });
    }
    /**
     * openSuggest弹框组件
     */
    public openSuggest() {
        this.allSuggestArr = this.downloadService.downloadItems.profileInfo.allSuggestArr;
        if (this.currentTabPage === 'jdbcpool') {
            this.tabLink = this.currentTabPage;
        }
        if (this.tabLink === 'database') {
            this.tabLink = 'jdbcpool';
        }
        if (this.currentTabPage === 'log') {
            this.tabLink = 'gcLog';
        }
        setTimeout(() => {
            this.analysis.setTypeTab();
            this.analysis.openSetType();
            this.analysis.show();
        }, 300);
    }

    /**
     * 处理内存转储数量
     */
    checkHeapdumpReportNum() {
        if (this.heapReportNum >= this.maxHeapCount) {
            this.saveBtnDisable = true;
            this.saveBtnTip = this.i18nService.I18nReplace(this.i18n.plugins_common_report.heapdump_tips_content, {
                0: this.heapReportNum,
                1: this.maxHeapCount
            });
            if (this.heapdumpSaved) {
                this.heapdumpSaved = false;
            }
        } else {
            this.saveBtnTip = this.i18n.plugins_common_report.saved_report;
            this.saveBtnDisable = false;
        }
    }
    /**
     * 查询线程转储的配置
     */
    public getThreaddumpReportNum() {
        // 获取数据列表-线程转储配置
        const heapDumpOption = {
            url: '/tools/settings/threadDump',
        };
        this.vscodeService.get(heapDumpOption, (data: any) => {
            this.downloadService.downloadItems.report.maxThreadDumpCount = data.maxThreadDumpCount;
            this.downloadService.downloadItems.report.alarmThreadDumpCount = data.alarmThreadDumpCount;
        });
    }
    /**
     * 处理gc日志数量
     */
    checkGClogReportNum() {
        if (this.gclogNum >= this.maxGclogCount) {
            this.gcSaveDisable = true;
            if (this.isIntellij) {
                this.saveBtnGcTip = this.i18nService.I18nReplace(
                    this.i18n.plugins_common_report.heapdump_tips_content, {
                    0: this.gclogNum,
                    1: this.maxGclogCount
                });
            } else {
                this.saveBtnTip = this.i18nService.I18nReplace(this.i18n.plugins_common_report.heapdump_tips_content, {
                    0: this.gclogNum,
                    1: this.maxGclogCount
                });
            }
            if (this.gclogSaved) {
                this.gclogSaved = false;
            }
        } else {
            if (this.isIntellij) {
                this.saveBtnGcTip = this.i18n.plugins_common_report.saved_report;
            } else {
                this.saveBtnTip = this.i18n.plugins_common_report.saved_report;
            }
            this.gcSaveDisable = false;
        }
    }
}
