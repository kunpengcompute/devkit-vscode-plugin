import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, NgZone} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { StompService } from '../../service/stomp.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { MessageService } from '../../service/message.service';
import { Utils } from '../../service/utils.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { Subscription } from 'rxjs';
import { createSvg } from '../../util';

/**
 * 采样分析
 */
const enum SAMPLE_ANALYSIS {
    MAX_VALUE = 300 // 最大值
}

@Component({
    selector: 'app-sample-detail',
    templateUrl: './sample-detail.component.html',
    styleUrls: ['./sample-detail.component.scss']
})
export class SampleDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    public simplingName: string;
    i18n: any;
    @ViewChild('suggest', { static: false }) suggest: any;
    @ViewChild('caFileModal', { static: false }) caFileModal: { Open: () => void; Close: () => void; };
    constructor(
        public vscodeService: VscodeService,
        private router: Router,
        private route: ActivatedRoute,
        public i18nService: I18nService,
        private stompService: StompService,
        private msgService: MessageService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private downloadService: SamplieDownloadService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public simplimgTabs = [
        {
            tabName: 'enviroment',
            link: 'env',
            active: true,
            show: true,
        },
        {
            tabName: 'cpu',
            link: 'cpu',
            active: false,
            show: true,
        },
        {
            tabName: 'objects',
            link: 'objects',
            active: false,
            show: true
        },
        {
            tabName: 'gc',
            link: 'gc',
            active: false,
            show: true,
        },
        {
            tabName: 'io',
            link: 'io',
            active: false,
            show: false
        }
    ];
    public sampleRoute = '1';
    public topicUrl = '';
    public recordId = '';
    public guardianId = '';
    public recordTime = 0;
    public leftTime = 0;
    public rightTime = 0;
    public showTime = false;
    public recordTimeAll = 0;
    public percentage = '0%';
    public timer: any = null;
    public timeShow = '';
    public timeShowLeft = '';
    public timeShowRight = '';
    public response = '';
    public enableOldObjectSample = '';
    public suggestNum: any;
    public showDetail: boolean;
    public wsFinishSub: Subscription;
    public currentTab = 'enviroment';
    public suggestItem: any = [
        {
          tabName: 'enviroment',
          suggest: []
        },
        {
          tabName: 'gc',
          suggest: []
        },
        {
          tabName: 'objects',
          suggest: []
        }
    ];
    public startConnect = true;
    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme: any;
    /**
     * ngOnInit
     */
    ngOnInit() {
        // 获取VSCode当前主题颜色
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.route.queryParams.subscribe((res: any) => {
            if (res.sendMessage) {
                let message;
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    message = res.sendMessage.replace(/#/g, ':').replace(/%/g, '"');
                } else {
                    message = res.sendMessage.replace(/#/g, ':');
                }
                const response = JSON.parse(message);
                this.response = response;
                const enableMethodSample = response.selfInfo.enableMethodSample;
                const enableThreadDump = response.selfInfo.enableThreadDump;
                const enableFileIO = response.selfInfo.enableFileIO;
                const enableSocketIO = response.selfInfo.enableSocketIO;
                this.enableOldObjectSample = response.selfInfo.enableOldObjectSample;
                this.simplimgTabs.forEach((tab) => {
                    if (tab.tabName === 'io') {
                        tab.show = enableFileIO || enableSocketIO;
                    }
                });
                this.simplingName = response.selfInfo.name;
                this.recordId = response.selfInfo.id;
                this.guardianId = response.selfInfo.guardianId;
                const nowTime: any = + new Date() / 1000;
                const timeDiff = Math.trunc(nowTime) - Math.trunc(response.selfInfo.createTime);
                console.log(timeDiff);
                if (response.selfInfo.state !== 'FINISHED') {
                    if (response.selfInfo.duration === -1) {
                        console.log(timeDiff);
                        this.showTime = true;
                        if (timeDiff > SAMPLE_ANALYSIS.MAX_VALUE) {
                            this.leftTime = this.leftTime + timeDiff - SAMPLE_ANALYSIS.MAX_VALUE;
                        }
                        this.rightTime = this.rightTime + timeDiff;
                        this.timeShowLeft = this.secondToDate(this.leftTime);
                        this.timeShowRight = this.secondToDate(this.rightTime);
                        this.timer = setInterval(() => {
                            this.rightTime++;
                            if (this.rightTime >= SAMPLE_ANALYSIS.MAX_VALUE) {
                                this.leftTime++;
                            }
                            this.timeShowLeft = this.secondToDate(this.leftTime);
                            this.timeShowRight = this.secondToDate(this.rightTime);
                        }, 1000);
                    } else if (response.selfInfo.duration) {
                        this.recordTimeAll = response.selfInfo.duration / 1000;
                        this.recordTime = timeDiff;
                        if (this.recordTime > this.recordTimeAll) {
                            this.recordTime = this.recordTimeAll;
                        }
                        this.percentage = (this.recordTime /
                         this.recordTimeAll * 100).toFixed(0) + '%';
                        this.timeShow = this.secondToDate(this.recordTime);
                        this.startConnect = false;
                        console.log(this.percentage);
                        console.log(this.timeShow);
                        this.timer = setInterval(() => {
                            this.recordTime++;
                            this.percentage = (this.recordTime /
                             this.recordTimeAll * 100).toFixed(0) + '%';
                            this.timeShow = this.secondToDate(this.recordTime);
                            if (this.recordTime >= this.recordTimeAll) {
                                this.stopAnalysis();
                                clearInterval(this.timer);
                            }
                        }, 1000);
                    }
                } else {
                    this.connectWebsocket();
                }
                (self as any).webviewSession.setItem('recordId', this.recordId);
                (self as any).webviewSession.setItem('enableFileIO', enableFileIO);
                (self as any).webviewSession.setItem('enableSocketIO', enableSocketIO);
                (self as any).webviewSession.setItem('enableThreadDump', enableThreadDump);
                (self as any).webviewSession.setItem('enableMethodSample', enableMethodSample);
            }
        });
        this.handleCleanCache();
        this.wsFinishSub = this.msgService.getSampleAnalysMessage().subscribe((msg) => {
            if (msg.type === 'SUGGESTION') {
                if (!this.downloadService.downloadItems.env.isFinish) {
                  this.getSamplingData('env', this.recordId);
                  this.downloadService.downloadItems.env.isFinish = true;
                }
            }
            if (msg.type === 'SUGGESTION' && msg.label === 'GC') {
                let sug: any = [];
                if (msg.content.length > 0) {
                    msg.content.forEach((element: any) => {
                        element.state = false;
                        sug.push(element);
                    });
                    this.suggestItem[1].suggest = sug;
                    sug = [];
                }
            }
            if (msg.type === 'SUGGESTION' && msg.label === 'ENVIRONMENT') {
                if (msg.content.length > 0) {
                    let sug: any = [];
                    msg.content.forEach((element: any) => {
                        element.state = false;
                        sug.push(element);
                    });
                    this.suggestItem[0].suggest = sug;
                    sug = [];
                }
            }
            if (msg.type === 'SUGGESTION' && msg.label === 'MEMORY') {
                let sug: any = [];
                if (msg.content.length > 0) {
                    msg.content.forEach((element: any) => {
                        element.state = false;
                        sug.push(element);
                    });
                }
                this.suggestItem[2].suggest = sug;
                sug = [];
            }
            this.suggestNum = this.suggestItem[0].suggest.length + this.suggestItem[1].suggest.length
            + this.suggestItem[2].suggest.length;
            this.downloadService.downloadItems.env.suggestArr = this.suggestItem[0].suggest;
            this.downloadService.downloadItems.gc.suggestArr = this.suggestItem[1].suggest;
            this.downloadService.downloadItems.leak.suggestArr = this.suggestItem[2].suggest;
            this.msgService.sendMessage({
                type: 'GC',
                data: this.suggestItem[1].suggest
            });
            this.msgService.sendMessage({
                type: 'env',
                data: this.suggestItem[0].suggest
            });
            this.msgService.sendMessage({
                type: 'leak',
                data: this.suggestItem[2].suggest
            });
            this.updateWebViewPage();
        });
        this.msgService.getMessage().subscribe(msg => {
            if (msg.type === 'connectStatus'){
                if (msg.data && this.caFileModal){
                    this.caFileModal.Open();
                }
            }
        });
        this.updateWebViewPage();
    }
    /**
     * 渲染视图结束
     */
    ngAfterViewInit() {
        if (this.recordTime || this.showTime) {
            const path = this.currTheme === COLOR_THEME.Dark ? './assets/img/collecting/dark/loading-dark.json' :
                './assets/img/collecting/light/loading-light.json';
            createSvg('.createLoading', path);
        }
    }
    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        clearInterval(this.timer);
        this.timer = null;
        if (this.wsFinishSub) {
            this.wsFinishSub.unsubscribe();
        }
    }
    /**
     * tabsToggle
     * @param index index
     */
    tabsToggle(index: any) {
        this.simplimgTabs.forEach((tab) => {
            tab.active = false;
        });
        this.simplimgTabs[index].active = true;
        this.currentTab = this.simplimgTabs[index].tabName;
        this.downloadService.downloadItems.env.suggestArr.forEach((suggest) => {
            suggest.state = false;
        });
        this.downloadService.downloadItems.gc.suggestArr.forEach((suggest) => {
            suggest.state = false;
        });
        this.downloadService.downloadItems.leak.suggestArr.forEach((suggest) => {
            suggest.state = false;
        });
    }
    /**
     * 更新菜单
     */
    private updateMenu() {
        const message = {
            cmd: 'updateTree',
            data: {}
        };
        this.vscodeService.postMessage(message, null);
    }
    /**
     * 返回home页
     */
    goHome() {
        this.handleCleanCache();
        this.msgService.handleSampleFileIOClear();
        this.msgService.handleSampleSocketIOClear();
        this.msgService.handleSampleObjectClear();
        if (this.stompService.stompClient) {
            this.stompService.startStompRequest('/cmd/stop-record', {});
        }
        this.router.navigate(['home']);
    }
    /**
     * 停止记录
     */
    stopAnalysis() {
        const params = {
            recordId: this.recordId,
        };
        const option = {
            url: `/guardians/${this.guardianId}/cmds/stop-record`,
            params,
            timeout: 10000
        };
        this.vscodeService.post(option, (resp: any) => {
            this.recordTime = 0;
            this.showTime = false;
            this.updateMenu();
            this.connectWebsocket();
            clearInterval(this.timer);
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                setTimeout(() => {
                    this.tabsToggle(0);
                    this.updateWebViewPage();
                }, 300);
            }
        });
    }
    /**
     * 取消记录
     */
    cancelAnalysis() {
        const params = {
            recordId: this.recordId
        };
        const option = {
            url: `/guardians/${this.guardianId}/cmds/cancel-record`,
            params
        };
        this.vscodeService.post(option, () => {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                this.closeWebviewPage();
                this.updateWebViewPage();
            } else {
                const message = {
                    cmd: 'closePanel'
                };
                this.updateMenu();
                this.vscodeService.postMessage(message, null);
            }
        });
    }

    /**
     * 连接websocket，并开始传输数据
     */
    private connectWebsocket() {
        this.stompService.sampleDatas11 = [];
        this.stompService.sampleMethodJava = [];
        this.stompService.sampleMethodNative = [];
        const uuid = Utils.generateConversationId(8);
        this.topicUrl = `/user/queue/sample/records/${this.recordId}/${uuid}/suggestion`;
        setTimeout(() => {
            this.stompService.client(this.topicUrl, '/cmd/sub-record', {
                recordId: this.recordId,
                recordType: 'SUGGESTION',
                uuid
            });
            this.startConnect = true;
        }, 300);
    }

    /**
     * 时间格式化
     * @param result 秒
     */
    private secondToDate(result: any) {
        const h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600);
        const m = Math.floor((result / 60 % 60)) < 10 ? '0' +
         Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
        const s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
        return result = h + ':' + m + ':' + s;
    }
    /**
     * 开始传输数据
     * @param type 类型
     * @param data recordId
     */
    public getSamplingData(type: any, data: any) {
        const uuid = Utils.generateConversationId(8);
        const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
        this.stompService.subscribeStompFn(requestUrl);
        this.stompService.startStompRequest('/cmd/sub-record', {
            recordId: data,
            recordType: type.toUpperCase(),
            uuid
        });
    }
    /**
     * 清除切换页签时保存数据
     */
    public handleCleanCache() {
        this.downloadService.downloadItems = {
            env: {
                isFinish: false,
                cpuInofo: [],
                sysEnv: [],
                suggestArr: []
            },
            fileIO: {
                isFileFinish: false,
                isStackFinish: false,
                data: [],
                stackTraceMap: {}
            },
            socketIO: {
                isFileFinish: false,
                isStackFinish: false,
                data: [],
                stackTraceMap: {}
            },
            object: {
                isFileFinish: false,
                isStackFinish: false,
                data: [],
                stackTraceMap: {}
            },
            gc: {
                isFinish: false,
                baseConfig: [],
                heapConfig: [],
                youngGenConfig: [],
                survivorConfig: [],
                tlabConfig: [],
                activity: [],
                activeData: {},
                timeData: [],
                suggestArr: []
            },
            thread: {
                isFinish: false,
                data: []
            },
            lock: {
                isFinish: false,
                data: [],
                instances: [],
                lockThread: [],
                stackTraceMap: {}
            },
            method: {
                isFinishJava: false,
                isFinishNative: false,
                java: {},
                native: {},
                javaTree: {},
                nativeTree: {}
            },
            leak: {
                isFinish: false,
                referPool: [],
                stackPool: [],
                oldSample: [],
                finishReport: false,
                suggestArr: [],
                suggetSate: ''
            }
        };
    }
    /**
     * 优化建议汇总弹窗
     */
    public openModal() {
        let showFirst = false;
        if (this.currentTab === 'enviroment' && this.downloadService.downloadItems.env.suggestArr[0]) {
            this.downloadService.downloadItems.env.suggestArr[0].state = true;
        } else if (this.currentTab === 'gc' && this.downloadService.downloadItems.gc.suggestArr[0]) {
            this.downloadService.downloadItems.gc.suggestArr[0].state = true;
        } else if (this.currentTab === 'objects' && this.downloadService.downloadItems.leak.suggestArr[0]) {
            const isLeak = document.getElementsByClassName('leak-box');
            if (isLeak && isLeak.length > 0) {
                this.downloadService.downloadItems.leak.suggestArr[0].state = true;
            } else {
                showFirst = true;
            }
        } else {
            showFirst = true;
        }
        this.suggest.open(showFirst);
    }
    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
    /**
     * intellIj关闭webview页面
     */
    public closeWebviewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
          this.vscodeService.showTuningInfo('cancel', 'info', 'showSamplingTask');
        }
    }
}
