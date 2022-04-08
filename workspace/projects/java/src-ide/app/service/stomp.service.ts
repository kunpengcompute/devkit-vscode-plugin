import {Injectable} from '@angular/core';
import {Stomp} from '@stomp/stompjs';
import {MessageService} from './message.service';
import {TreeGraph} from '../profile/profile-http/tree';
import {Subscription} from 'rxjs';
import {ProfileDownloadService} from './profile-download.service';
import {VscodeService} from './vscode.service';
import {I18nService} from './i18n.service';
import {Utils} from './utils.service';

/**
 * 判断
 */
export enum STOMP_STATUS {
    INDEXOF_STATUS = -1,
    COUNT_NUMBER = 3
}
@Injectable({
    providedIn: 'root'
})
export class StompService {
    public stompClient: any;
    // 证书状态
    public flag: any;
    private subscribeStomp: any;
    public sampleDatas11: Array<any> = [];
    public sampleMethodJava: Array<any> = [];
    public sampleMethodNative: Array<any> = [];
    public profileDatas: Array<any> = [];
    public profileStates: Array<any> = [];
    public profileInstances: Array<any> = [];
    public profileThreadState: Array<any> = [];
    public i18n: any;
    public updataHttpSub: Subscription;
    public httpSub: Subscription;
    public errorSub: Subscription;
    public suggestionsSub: Subscription;
    public updataJdbcSub: Subscription;
    public updataFileIOSub: Subscription;
    public updataSocketIOSub: Subscription;
    public updataHbaseSub: Subscription;
    public updataCassSub: Subscription;
    public updataMdbSub: Subscription;
    public jdbcSub: Subscription;
    public jdbcSubStart: Subscription;
    public poolSub: Subscription;
    public jdbcPoolSuggest: Subscription;
    public fileIoSub: Subscription;
    public socketIoSub: Subscription;
    public hbaseSub: Subscription;
    public cassSub: Subscription;
    public mdbSub: Subscription;
    public health: Subscription;
    public metrics: Subscription;
    public hotspotAnalysis: Subscription;
    // gcStacte数据
    public gcState: Subscription;
    public gcLog: Subscription;
    public httptrace: Subscription;
    public updateHealth: Subscription;
    public updateMetrics: Subscription;
    public updateHttptrace: Subscription;
    public heapDump: Subscription;
    public updateHeapDump: Subscription;

    public stateSub: Subscription;
    public threadListSub: Subscription;
    public webSocketId: WebSocket;

    public connectFail = false;
    public treeGraph: any;

    public healthTimer: any = null;
    public metricsTimer: any = null;
    public httptraceTimer: any = null;
    public httpTimer: any = null;
    public jdbcTimer: any = null;
    public poolTimer: any = null;
    public fileIOTimer: any = null;
    public socketIOTimer: any = null;
    public hbaseTimer: any = null;
    public cassTimer: any = null;
    public mdbTimer: any = null;
    private httpTimeInit: any = {};
    private jdbcTimeInit: any = {};
    private fileIoTimeInit: any = {};
    private socketIoTimeInit: any = {};
    private hbaseTimeInit: any = {};
    private cassTimeInit: any = {};
    private mdbTimeInit: any = {};
    public httpStep = 3000;
    public jdbcStep = 3000;
    public poolStep = 1000;
    public fileIoStep = 1000;
    public socketIoStep = 1000;
    public pFileIOpath = '';
    public pSocketIp = '';
    public startReqList: any[] = [];
    public urlDatas = ['socket', 'file', 'jdbc', 'mongodb', 'connect-pool', 'hbase', 'cassandra'];
    public clearDisconnet: any;
    public listenCount = 0;
    public suggestion: any = [];
    public sampleDataStrategy = {
        JAVA_METHOD_SAMPLE: (newData: any) => {
            this.sampleMethodJava.push(newData);
        },
        NATIVE_METHOD_SAMPLE: (newData: any) => {
            this.sampleMethodNative.push(newData);
        },
        FILE_IO: 'sfileIO',
        FILE_STACKTRACE: 'sfileIOStacktrace',
        FILE_IO_MAP: 'sfileIOStacktrace',
        SOCKET_IO: 'sSocketIO',
        SOCKET_STACKTRACE: 'sSocketIOStacktrace',
        SOCKET_IO_MAP: 'sSocketIOStacktrace',
        OBJECT: 'sObject',
        OBJECT_STACKTRACE: 'sObjectStackstrace',
        OBJECT_FRAMES_MAP: 'sObject',
        HEAP_STATISTICS: 'sGC',
        METASPACE_STATISTICS: 'sGC',
        GC_STATISTIC: 'sGC',
        GC_CONFIGURATION: 'sGC',
        GC: 'sGC',
        THREAD_DUMP: 'sthreadDump',
        MONITOR_CLASS: 'slock',
        MONITOR_THREAD: 'slock',
        MONITOR_INSTANCE: 'slock',
        MONITOR_MAP: 'slock',
        LOCK: 'slock',
        ENV: 'sEnv',
        MEMORY_LEAK: 'sreport',
        ANALYSE_REPORT: 'sreport',
        SUGGESTION: 'sreport',
    };
    constructor(
        private vscodeService: VscodeService,
        private msgService: MessageService,
        public downSave: ProfileDownloadService,
        public i18nService: I18nService,
        public utils: Utils
    ) {
        this.i18n = this.i18nService.I18n();
    }
    /**
     * WebSocket Client
     * @param topicUrl url
     * @param requestUrl req
     * @param data data
     * @param successCb success
     * @param errCb err
     */
    client(topicUrl?: any, requestUrl?: string, data?: any, successCb?: any, errCb?: any) {
        let token: any;
        const params = {
            cmd: 'getGlobleState',
            data: { data: { keys: ['sysPerfToken'] } }
        };
        this.vscodeService.postMessage(params, (res: any) => {
            token = res.sysPerfToken;
            const msgData = { cmd: 'readConfig' };
            this.vscodeService.postMessage(msgData, (config: any) => {
                if (config.sysPerfConfig.length > 0) {
                    const port = config.sysPerfConfig[0].port;
                    const ip = config.sysPerfConfig[0].ip;
                    const envUrl = `${ip}:${port}/java-perf/api`;
                    const encodeToken = encodeURI(token);
                    if (this.stateSub) { this.stateSub.unsubscribe(); }
                    if (this.jdbcSub) { this.jdbcSub.unsubscribe(); }
                    if (this.poolSub) { this.poolSub.unsubscribe(); }
                    if (this.jdbcPoolSuggest) { this.jdbcPoolSuggest.unsubscribe(); }
                    if (this.fileIoSub) { this.fileIoSub.unsubscribe(); }
                    if (this.socketIoSub) { this.socketIoSub.unsubscribe(); }
                    if (this.httpSub) { this.httpSub.unsubscribe(); }
                    if (this.health) { this.health.unsubscribe(); }
                    if (this.metrics) { this.metrics.unsubscribe(); }
                    if (this.hotspotAnalysis) { this.hotspotAnalysis.unsubscribe(); }
                    // gcState
                    if (this.gcState) { this.gcState.unsubscribe(); }
                    if (this.gcLog) { this.gcLog.unsubscribe(); }
                    if (this.heapDump) { this.heapDump.unsubscribe(); }
                    if (this.httptrace) { this.httptrace.unsubscribe(); }
                    if (this.errorSub) { this.errorSub.unsubscribe(); }
                    if (this.suggestionsSub) { this.suggestionsSub.unsubscribe(); }
                    if (this.jdbcSubStart) { this.jdbcSubStart.unsubscribe(); }
                    const localIP = 'localhost';
                    const localWsIp = '********';
                    if (envUrl.indexOf('localhost') >= 0 || envUrl.indexOf(localIP) >= 0) {
                        this.stompClient = Stomp.client(`ws://${localWsIp}:8080/api/ws`, [
                            token
                        ]);
                    } else {
                        this.stompClient = Stomp.client(`wss://${envUrl}/ws`, [encodeToken]);
                    }
                    this.stompClient.debug = (debug: any) => {
                        // 为了区分是在创建websocket的时候断开了websocket，还是在连接wensocket成功之后断开了websocket
                        if (debug.search('closed') !== STOMP_STATUS.INDEXOF_STATUS && topicUrl.length > 1) {
                            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                                this.vscodeService.showTuningInfo('', 'info', '');
                            }else{
                                this.showInfoBox(this.i18n.webSocket_connect_error, 'warn');
                            }
                        }
                        if (debug.search(/closed/) !== STOMP_STATUS.INDEXOF_STATUS &&
                           this.listenCount <= STOMP_STATUS.COUNT_NUMBER) {
                            this.flag = false;
                        } else if (this.listenCount > 3) {
                            this.stompClient.debug = () => { };
                            this.flag = true;
                        }
                        this.listenCount++;
                    };
                    this.stompClient.onWebSocketError = (error: any) => {
                        this.connectFail = true;
                        this.msgService.sendMessage({
                            type: 'connectStatus',
                            data: this.connectFail
                        });
                        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                            this.vscodeService.showTuningInfo('', 'info', '');
                        } else {
                            this.showInfoBox(this.i18n.webSocket_connect_error, 'warn');
                        }
                    };
                    if (data.operation) {
                        const checkConnectTimer = setInterval(() => {
                            if (this.flag === false){
                                clearInterval(checkConnectTimer);
                                this.msgService.sendMessage({
                                    type: 'connected'
                                });
                            }
                            if (this.flag && this.stompClient) {
                                clearInterval(checkConnectTimer);
                                this.msgService.sendMessage({
                                    type: 'connected'
                                });
                            }
                        }, 500);
                    }
                    this.stompClient.connect({}, (conn: any) => {
                        if (conn.command !== 'ERROR') {
                            this.connectFail = false;
                            this.msgService.sendMessage({
                                type: 'connectStatus',
                                data: this.connectFail
                            });
                            if (topicUrl) {
                                this.subscribeStompFn(topicUrl, successCb, errCb);
                            }
                            if (requestUrl) {
                                this.startStompRequest(requestUrl, data);
                            }
                            return this.stompClient;
                        }
                    });
                }
            });
        });
    }

    /**
     * 弹出提示消息
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

    /**
     * subscribeStompFn
     * @param topicUrl topicUrl
     * @param successCb successCb
     * @param errCb errCb
     */
    subscribeStompFn(topicUrl: any, successCb?: any, errCb?: any) {
        if (!this.stompClient) { return; }
        if (topicUrl instanceof Array) {
            topicUrl.forEach((itemUrl) => {
                if (itemUrl.indexOf('/state') >= 0) {
                    let initTime = 0;
                    let endTime = 0;
                    let startTime = 0;
                    let preStartTime = 0;
                    let sendFlag = true;
                    const maxShowDur = 2 * 60 * 1000;
                    this.stateSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newDate = JSON.parse(data.body);
                        if (initTime === 0) {
                            initTime = newDate.startTime;
                            preStartTime = newDate.startTime;
                        }
                        endTime = newDate.startTime - initTime;
                        startTime = endTime === 0 ? 0 : endTime - 1000;
                        const threadState = {
                            RUNNABLE: 0,
                            WAITING: 0,
                            BLOCKED: 0
                        };
                        if (newDate.threads.length) {
                            if (endTime) {
                                this.msgService.sendMessage({
                                    type: 'updata_thread',
                                    data: {
                                        thread: newDate.threads,
                                        startTime,
                                        endTime
                                    }
                                });
                            }
                            newDate.threads.forEach((thread: any) => {
                                if (thread.threadState === 'TIMED_WAITING') {
                                    threadState.WAITING++;
                                    return;
                                }
                                (threadState as any)[thread.threadState]++;
                            });
                        }
                        const echartsData: any = {
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

                        if (newDate.heaps.length) {
                            newDate.heaps.forEach((heap: any) => {
                                if (heap.startTime - preStartTime > maxShowDur ||
                                   preStartTime - heap.startTime > maxShowDur) {
                                    preStartTime = heap.startTime;
                                    sendFlag = false;
                                    return;
                                }
                                preStartTime = heap.startTime;
                                sendFlag = true;
                                echartsData.heap_usedSize.push({
                                    value: [
                                        this.dateFormat(heap.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                        heap.usedSize
                                    ]
                                });
                                echartsData.heap_committedSize.push({
                                    value: [
                                        this.dateFormat(heap.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                        heap.committedSize
                                    ]
                                });
                            });
                        } else {
                            echartsData.heap_usedSize.push({
                                value: [
                                    this.dateFormat(newDate.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    0
                                ]
                            });
                            echartsData.heap_committedSize.push({
                                value: [
                                    this.dateFormat(newDate.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    0
                                ]
                            });
                        }
                        if (!sendFlag) { return; }

                        if (newDate.gcs.length) {
                            newDate.gcs.forEach((gc: any) => {
                                echartsData.gc_activity.push(
                                    { value: [this.dateFormat(gc.startTime + gc.duration / 2,
                                       'yyyy/MM/dd hh:mm:ss.S'), gc.duration] }
                                );
                                newDate.heaps.forEach((heap: any) => {
                                    if (gc.startTime === heap.startTime || gc.startTime +
                                       gc.duration === heap.startTime) { return; }
                                });
                            });
                        } else {
                            newDate.heaps.forEach((item: any) => {
                                echartsData.gc_activity.push({
                                    value: [this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'), 0]
                                });
                            });
                        }

                        newDate.heaps.forEach((item: any) => {
                            echartsData.threads_RUNNABLE.push({
                                value: [
                                    this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    threadState.RUNNABLE
                                ]
                            });
                            echartsData.threads_WAITING.push({
                                value: [
                                    this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    threadState.WAITING
                                ]
                            });
                            echartsData.threads_BLOCKED.push({
                                value: [
                                    this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    threadState.BLOCKED
                                ]
                            });
                            echartsData.classes.push({
                                value: [
                                    this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    newDate.classCount
                                ]
                            });
                            echartsData.cpu_load_total.push({
                                value: [
                                    this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    Math.round(newDate.totalCpuUsage * 100) / 100
                                ]
                            });
                            echartsData.cpu_load_progress.push({
                                value: [
                                    this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                    Math.round(newDate.totalCpuUsageOfProcess * 100) / 100
                                ]
                            });
                            echartsData.nonHeap_UsedSize.push({
                                value: [this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                newDate.nonHeap.nonHeapUsedSize]
                            });
                            echartsData.nonHeap_CommittedSize.push({
                                value: [this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                newDate.nonHeap.nonHeapCommittedSize]
                            });
                            echartsData.processPhysical_MemoryUsedSize.push({
                                value: [this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                newDate.physicalMemory.processPhysicalMemoryUsedSize]
                            });
                            echartsData.systemFreePhysical_MemorySize.push({
                                value: [this.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'),
                                newDate.physicalMemory.systemFreePhysicalMemorySize]
                            });

                        });

                        this.msgService.sendMessage({
                            type: 'updata_state',
                            state: {
                                data: echartsData,
                            }
                        });
                    });
                } else if (itemUrl.indexOf('/instance') >= 0) {
                    this.stompClient.subscribe(itemUrl, (data: any) => {
                        this.profileInstances = this.profileInstances.concat(
                            JSON.parse(data.body)
                        );
                    });
                } else if (itemUrl.indexOf('/thread-state') >= 0) {
                    this.stompClient.subscribe(itemUrl, (data: any) => {
                        this.profileThreadState = this.profileThreadState.concat(
                            JSON.parse(data.body)
                        );
                    });
                } else if (itemUrl.indexOf('/jdbc') >= 0) {
                    this.jdbcTimeInit = {
                        startTime: 0,
                        endTime: 0,
                        count_pre_s: 0,
                        duration_pre_s: 0
                    };
                    this.jdbcSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newData = JSON.parse(data.body);

                        if (!newData.length) { return; }
                        if (this.jdbcTimeInit.startTime === 0) {
                            this.jdbcTimeInit.startTime = newData[0].start_;
                            this.msgService.sendMessage({
                                type: 'updata_jdbc',
                                data: {
                                    executed: 0,
                                    aveTime: 0,
                                    endTime: this.jdbcTimeInit.startTime
                                }
                            });
                        }
                        const jdbcData: Array<any> = [];
                        newData.forEach((item: any) => {
                            jdbcData.push({
                                start: item.start_,
                                duration: item.duration_,
                                sql: item.attributes_.sql,
                                stackTraces: item.allStackTraces_ || []
                            });
                            this.jdbcTimeInit.count_pre_s++;
                            this.jdbcTimeInit.duration_pre_s += item.duration_;
                        });
                        this.msgService.sendMessage({
                            type: 'jdbc',
                            data: jdbcData
                        });
                    });
                } else if (itemUrl.indexOf('/connect-pool-suggest') >= 0) {
                    this.jdbcPoolSuggest = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const jdbcPoolSuggestDate = JSON.parse(data.body);
                        const detailAll: any = [];
                        const pool = jdbcPoolSuggestDate;
                        const detailArr = pool.suggestion.split(';').slice(0, -1);
                        detailArr.forEach((item: any) => {
                            const keyArr = item.split(':');
                            detailAll.push({
                                key: keyArr[0],
                                value: keyArr[1]
                            });
                        });
                        pool.detail = detailAll;
                        this.downSave.downloadItems.jdbcpool.suggestArr = [];
                        this.downSave.downloadItems.jdbcpool.suggestArr.push(pool);
                        this.msgService.sendMessage({
                            type: 'connect-pool-suggest',
                            data: jdbcPoolSuggestDate
                        });
                    }, { 'Accept-Language': (self as any).webviewSession.getItem('language') });
                } else if (itemUrl.indexOf('/connect-pool') >= 0) {
                    this.poolSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newData = JSON.parse(data.body);
                        if (!newData.length) { return; }
                        const jdbcPool: Array<any> = [];
                        this.msgService.sendMessage({
                            type: 'pool',
                            data: newData
                        });
                    });
                } else if (itemUrl.indexOf('/file') >= 0) {
                    this.fileIoTimeInit = {
                        startTime: 0,
                        endTime: 0,
                        rCount: 0,
                        wCount: 0,
                        rSpeed: 0,
                        wSpeed: 0,
                    };
                    this.fileIoSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newData = JSON.parse(data.body);
                        if (!newData.length) { return; }
                        if (this.fileIoTimeInit.startTime === 0) {
                            this.fileIoTimeInit.startTime = newData[0].start_;
                            this.msgService.sendMessage({
                                type: 'updata_fileIO',
                                data: {
                                    wSpeed: 0,
                                    rSpeed: 0,
                                    endTime: this.fileIoTimeInit.startTime
                                }
                            });
                        }
                        newData.forEach((item: any) => {
                            const isWrite = item.methodName_.indexOf('write') >= 0;
                            const isRead = item.methodName_.indexOf('read') >= 0;
                            if (!this.pFileIOpath) {
                                this.pFileIOpath = item.attributes_.description;
                            }
                            if (item.attributes_.description === this.pFileIOpath) {
                                this.fileIoTimeInit.rCount += isRead ? 1 : 0;
                                this.fileIoTimeInit.wCount += isWrite ? 1 : 0;
                                this.fileIoTimeInit.rSpeed += isRead ? Number(item.attributes_.speed) : 0;
                                this.fileIoTimeInit.wSpeed += isWrite ? Number(item.attributes_.speed) : 0;
                            }
                        });

                        this.msgService.sendMessage({
                            type: 'pfileIO',
                            data: newData
                        });

                    });
                } else if (itemUrl.indexOf('/socket') >= 0) {
                    this.socketIoTimeInit = {
                        startTime: 0,
                        endTime: 0,
                        rCount: 0,
                        wCount: 0,
                        rSpeed: 0,
                        wSpeed: 0,
                    };
                    this.socketIoSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newData = JSON.parse(data.body);

                        if (!newData.length) { return; }
                        if (this.socketIoTimeInit.startTime === 0) {
                            this.socketIoTimeInit.startTime = newData[0].start_;
                            this.msgService.sendMessage({
                                type: 'updata_socketIO',
                                data: {
                                    wSpeed: 0,
                                    rSpeed: 0,
                                    endTime: this.socketIoTimeInit.startTime
                                }
                            });
                        }
                        newData.forEach((item: any) => {
                            const desArr = item.attributes_.description.split(':');
                            const ip = desArr[0];
                            const host = desArr[1];
                            const isWrite = item.attributes_.type === 'write';
                            const isRead = item.attributes_.type === 'read';
                            if (!this.pSocketIp) {
                                this.pSocketIp = ip;
                            }
                            if (ip === this.pSocketIp) {
                                this.socketIoTimeInit.rCount += isRead ? 1 : 0;
                                this.socketIoTimeInit.wCount += isWrite ? 1 : 0;
                                this.socketIoTimeInit.rSpeed += isRead ? Number(item.attributes_.speed) : 0;
                                this.socketIoTimeInit.wSpeed += isWrite ? Number(item.attributes_.speed) : 0;
                            }
                        });

                        this.msgService.sendMessage({
                            type: 'psocketIO',
                            data: newData
                        });

                    });
                } else if (itemUrl.indexOf('/hbase') >= 0) {
                    this.hbaseTimeInit = {
                        startTime: 0,
                        endTime: 0,
                        count_pre_s: 0,
                        duration_pre_s: 0
                    };
                    this.hbaseSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newData = JSON.parse(data.body);

                        if (!newData.length) { return; }
                        if (this.hbaseTimeInit.startTime === 0) {
                            this.hbaseTimeInit.startTime = newData[0].start_;
                            this.msgService.sendMessage({
                                type: 'updata_hbase',
                                data: {
                                    executed: 0,
                                    aveTime: 0,
                                    endTime: this.hbaseTimeInit.startTime
                                }
                            });
                        }
                        const hbaseData: Array<any> = [];
                        newData.forEach((item: any) => {
                            hbaseData.push({
                                start: item.start_,
                                duration: item.duration_,
                                hql: item.attributes_.htabe,
                                tableName: item.attributes_.tableName,
                                eventType: item.attributes_.eventType,
                                stackTraces: item.allStackTraces_ || []
                            });
                            this.hbaseTimeInit.count_pre_s++;
                            this.hbaseTimeInit.duration_pre_s += item.duration_;
                        });
                        this.msgService.sendMessage({
                            type: 'hbase',
                            data: hbaseData
                        });

                    }, 1000);

                } else if (itemUrl.indexOf('/cassandra') >= 0) {

                    this.cassTimeInit = {
                        startTime: 0,
                        endTime: 0,
                        count_pre_s: 0,
                        duration_pre_s: 0
                    };
                    this.cassSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newData = JSON.parse(data.body);

                        if (!newData.length) { return; }
                        if (this.cassTimeInit.startTime === 0) {
                            this.cassTimeInit.startTime = newData[0].start_;
                            this.msgService.sendMessage({
                                type: 'updata_cassandra',
                                data: {
                                    executed: 0,
                                    aveTime: 0,
                                    endTime: this.cassTimeInit.startTime
                                }
                            });
                        }
                        const cassData: Array<any> = [];
                        newData.forEach((item: any) => {
                            cassData.push({
                                start: item.start_,
                                duration: item.duration_,
                                cql: item.attributes_.cql,
                                stackTraces: item.allStackTraces_ || []
                            });
                            this.cassTimeInit.count_pre_s++;
                            this.cassTimeInit.duration_pre_s += item.duration_;
                        });
                        this.msgService.sendMessage({
                            type: 'cassandra',
                            data: cassData
                        });

                    }, 1000);

                } else if (itemUrl.indexOf('/mongodb') >= 0) {

                    this.mdbTimeInit = {
                        startTime: 0,
                        endTime: 0,
                        count_pre_s: 0,
                        duration_pre_s: 0
                    };
                    this.mdbSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const newData = JSON.parse(data.body);

                        if (!newData.length) { return; }
                        if (this.mdbTimeInit.startTime === 0) {
                            this.mdbTimeInit.startTime = newData[0].start_;
                            this.msgService.sendMessage({
                                type: 'updata_mongodb',
                                data: {
                                    executed: 0,
                                    aveTime: 0,
                                    endTime: this.mdbTimeInit.startTime
                                }
                            });
                        }
                        const mdbData: Array<any> = [];
                        newData.forEach((item: any) => {
                            const sql = item.attributes_.collectionName + '.' + item.attributes_.methodName +
                                '(' + item.attributes_.document + ')';
                            mdbData.push({
                                start: item.start_,
                                duration: item.duration_,
                                sql,
                                stackTraces: item.allStackTraces_ || []
                            });
                            this.mdbTimeInit.count_pre_s++;
                            this.mdbTimeInit.duration_pre_s += item.duration_;
                        });
                        this.msgService.sendMessage({
                            type: 'mongodb',
                            data: mdbData
                        });

                    }, 1000);

                } else if (itemUrl.indexOf('/httptrace') >= 0) {
                    this.httptrace = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const httptraceDate = JSON.parse(data.body);
                        this.msgService.sendMessage({
                            type: 'httptrace',
                            data: httptraceDate
                        });
                    });
                } else if (itemUrl.indexOf('/http') >= 0) {
                    const root: any = null;
                    this.treeGraph = new TreeGraph(root);
                    this.httpTimeInit = {
                        startTime: 0,
                        endTime: 0,
                        count_pre_s: 0,
                        duration_pre_s: 0
                    };

                    this.httpSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const parsedData: Array<any> = JSON.parse(data.body);
                        if (!parsedData.length) { return; }
                        if (this.httpTimeInit.startTime === 0) {
                            this.httpTimeInit.startTime = Math.floor(parsedData[0].start_ / 1000) * 1000;
                            this.msgService.sendMessage({
                                type: 'updata_http',
                                data: {
                                    request: 0,
                                    aveTime: 0,
                                    endTime: this.httpTimeInit.startTime
                                }
                            });
                        }

                        parsedData.forEach((http) => {
                            if (!http.attributes_.method || !http.attributes_.uri) { return; }
                            const ReqRecording: any = {};
                            ReqRecording.method = http.attributes_.method;
                            ReqRecording.url = http.attributes_.uri;
                            ReqRecording.startTime = http.start_;
                            ReqRecording.duration = http.duration_ / 1000;
                            this.treeGraph.newRequest(ReqRecording);

                            this.httpTimeInit.count_pre_s++;
                            this.httpTimeInit.duration_pre_s += http.duration_;
                        });
                        this.msgService.sendMessage({
                            type: 'http',
                            data: {
                                tree: this.treeGraph.treeView()
                            }
                        });
                    });
                } else if (itemUrl.indexOf('/health') >= 0) {
                    this.health = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const healthDate: any = JSON.parse(data.body);
                        this.msgService.sendMessage({
                            type: 'health',
                            data: healthDate
                        });
                    });
                } else if (itemUrl.indexOf('/metrics') >= 0) {
                    this.metrics = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const metricsDate = JSON.parse(data.body);
                        this.msgService.sendMessage({
                            type: 'metrics',
                            data: metricsDate
                        });
                    });
                    //  gc数据订阅
                } else if (itemUrl.indexOf('/gcState') >= 0) {
                  this.gcState = this.stompClient.subscribe(itemUrl, (data: any) => {
                      const gcStateDate = JSON.parse(data.body);
                      this.msgService.sendMessage({
                          type: 'gcState',
                          data: gcStateDate
                      });
                  });
                } else if (itemUrl.indexOf('/metrics') >= 0) {
                  this.metrics = this.stompClient.subscribe(itemUrl, (data: any) => {
                      const metricsDate = JSON.parse(data.body);
                      this.msgService.sendMessage({
                          type: 'metrics',
                          data: metricsDate
                      });
                  });
                } else if (itemUrl.indexOf('/hotspot-analysis') >= 0) {
                    this.hotspotAnalysis = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const hotspotDate = JSON.parse(data.body);
                        this.msgService.sendMessage({
                            type: 'hotspot-analysis',
                            data: hotspotDate
                        });
                    });
                } else if (itemUrl.indexOf('/gcLog') >= 0) {
                    this.gcLog = this.stompClient.subscribe(itemUrl, (data: any) => {
                        (self as any).webviewSession.setItem('gcLogState', data.body);
                        const gcLogDate = JSON.parse(data.body);
                        this.msgService.sendMessage({
                            type: 'gcLog',
                            data: gcLogDate
                        });
                    });
                } else if (itemUrl.indexOf('/heap') >= 0) {
                    this.heapDump = this.stompClient.subscribe(itemUrl, (data: any) => {
                        (self as any).webviewSession.setItem('dumpState', data.body);
                        const heapDate = JSON.parse(data.body);
                        this.msgService.sendMessage({
                            type: 'heap',
                            data: heapDate
                        });
                    });
                } else if (itemUrl.indexOf('/suggestions') >= 0) {
                    this.suggestionsSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        const sug = JSON.parse(data.body);
                        this.downSave.downloadItems.profileInfo.suggestArr.push(sug);
                        this.msgService.sendMessage({
                            type: 'suggestions',
                            data: sug
                        });
                    }, { 'Accept-Language': (self as any).webviewSession.getItem('language') });
                } else if (itemUrl.endsWith('/errors') >= 0) {
                    this.errorSub = this.stompClient.subscribe(itemUrl, (data: any) => {
                        this.msgService.sendMessage({
                            type: 'profileErrors',
                            data
                        });
                    });
                } else {
                    this.stompClient.subscribe(itemUrl, () => {
                    });
                }
            });
            return;
        }

        this.onHandleSamplingTopicSubscribe(topicUrl, successCb, errCb);
    }
    /**
     * sample的数据订阅
     * @param topicUrl topicUrl
     * @param successCb successCb
     * @param errCb errCb
     */
    public onHandleSamplingTopicSubscribe(topicUrl: any, successCb?: any, errCb?: any) {
        this.sampleDatas11 = [];
        this.sampleMethodJava = [];
        this.sampleMethodNative = [];
        if (!this.stompClient) { return; }
        this.stompClient.subscribe(topicUrl, (data: any) => {
            const newData = JSON.parse(data.body);
            if (newData.type) {
                if (newData.type === 'JAVA_METHOD_SAMPLE' || newData.type === 'METHOD_SAMPLING') {
                    this.sampleMethodJava.push(newData);
                } else if (newData.type === 'NATIVE_METHOD_SAMPLE' || newData.type === 'NATIVE_METHOD_SAMPLING') {
                    this.sampleMethodNative.push(newData);
                } else if ((this.sampleDataStrategy as any)[newData.type]) {
                    this.msgService.sendMessage({ type: (this.sampleDataStrategy as any)[newData.type],
                       data: newData });
                } else {
                    this.sampleDatas11.push(newData);
                    return;
                }
            }
            if (successCb) { successCb(data.body); }
        }, { 'Accept-Language': (self as any).webviewSession.getItem('language') });
    }
    /**
     * handleStartHttp
     */
    handleStartHttp(requestUrl: string, data: any) {
        const baseUrl = '/cmd/start-instrument-';
        const baseUrl2 = '/cmd/stop-instrument-';
        const url = requestUrl.split(baseUrl)[1];
        if (url === 'http') {
            this.startReqList.forEach((item) => {
                const url1 = baseUrl2 + item;
                this.startStompRequest(url1, data);
            });
            if (this.startReqList.indexOf('file') > STOMP_STATUS.INDEXOF_STATUS) {
                clearInterval(this.fileIOTimer);
                this.fileIOTimer = null;
                this.downSave.dataSave.isFileIOStart = false;
            }
            if (this.startReqList.indexOf('socket') > STOMP_STATUS.INDEXOF_STATUS) {
                clearInterval(this.socketIOTimer);
                this.socketIOTimer = null;
                this.downSave.dataSave.isSocketIOStart = false;
            }
            if (this.startReqList.indexOf('jdbc') > STOMP_STATUS.INDEXOF_STATUS) {
                clearInterval(this.jdbcTimer);
                this.jdbcTimer = null;
                this.downSave.dataSave.isJdbcStart = false;
            }
            if (this.startReqList.indexOf('hbase') > STOMP_STATUS.INDEXOF_STATUS) {
                clearInterval(this.hbaseTimer);
                this.hbaseTimer = null;
                this.downSave.dataSave.isHbaseStart = false;
            }
            if (this.startReqList.indexOf('cassandra') > STOMP_STATUS.INDEXOF_STATUS) {
                clearInterval(this.cassTimer);
                this.cassTimer = null;
                this.downSave.dataSave.isCassStart = false;
            }
            if (this.startReqList.indexOf('mongodb') > STOMP_STATUS.INDEXOF_STATUS) {
                clearInterval(this.mdbTimer);
                this.mdbTimer = null;
                this.downSave.dataSave.isMongodbStart = false;
            }
            if (this.startReqList.indexOf('connect-pool') > STOMP_STATUS.INDEXOF_STATUS) {
                clearInterval(this.poolTimer);
                this.poolTimer = null;
                this.downSave.dataSave.isjdbcPoolStart = false;
            }
            this.startReqList = [];
        } else if (this.urlDatas.indexOf(url) > STOMP_STATUS.INDEXOF_STATUS) {
            this.startReqList.push(url);
            this.startReqList = Array.from(new Set(this.startReqList));
            if (this.downSave.dataSave.isHttpStart) {
                this.startStompRequest('/cmd/stop-instrument-http', data);
                clearInterval(this.httpTimer);
                this.httpTimer = null;
                this.downSave.dataSave.isHttpStart = false;
            }
        }
    }

    /**
     * startStompRequest
     */
    startStompRequest(requestUrl: string, data: any) {
        const replyUrl = `/user/queue/reply${requestUrl}`;
        this.handleStartHttp(requestUrl, data);
        return new Promise((resolve) => {
            this.jdbcSubStart = this.stompClient && this.stompClient.subscribe(replyUrl, (resp: any) => {
                this.jdbcSubStart.unsubscribe();
                resolve(resp);
                const newResp = JSON.parse(resp.body);
                if (resp.headers.destination === '/user/queue/reply/cmd/sub-record') {
                    if (newResp.state === 'ERROR' || newResp.state === 'SUCCESS') {
                        this.msgService.sendMessage({
                            type: 'wsFinish'
                        });
                        (self as any).webviewSession.setItem('wsState', 'success');
                    }
                }
                if (resp.headers.destination === '/user/queue/reply/cmd/start-hotspot-analysis') {
                  if (newResp.state === 'ERROR' || newResp.state === 'SUCCESS') {
                    this.msgService.sendMessage({
                      type: 'startHotspotState',
                      state: newResp.state,
                      message: newResp.message
                    });
                  }
                }
                if (resp.headers.destination === '/user/queue/reply/cmd/stop-hotspot-analysis') {
                  if (newResp.state === 'ERROR' || newResp.state === 'SUCCESS') {
                    this.msgService.sendMessage({
                      type: 'stopHotspotState',
                      state: newResp.state
                    });
                  }
                }
            });
            return this.stompClient && this.stompClient.send(requestUrl, {}, JSON.stringify(data));
        });
    }

    /**
     * disConnect
     */
    disConnect() {
        if (this.errorSub) { this.errorSub.unsubscribe(); }
        if (this.jdbcSubStart) { this.jdbcSubStart.unsubscribe(); }
        if (this.stateSub) { this.stateSub.unsubscribe(); }
        if (this.threadListSub) { this.threadListSub.unsubscribe(); }
        if (this.subscribeStomp) { this.subscribeStomp.unsubscribe(); }
        if (this.suggestionsSub) {
            this.suggestionsSub.unsubscribe();
            this.suggestion = [];
        }

        this.clearDisconnet = setTimeout(() => {
            if (this.jdbcSub) { this.jdbcSub.unsubscribe(); }
            if (this.poolSub) { this.poolSub.unsubscribe(); }
            if (this.jdbcPoolSuggest) { this.jdbcPoolSuggest.unsubscribe(); }
            if (this.fileIoSub) { this.fileIoSub.unsubscribe(); }
            if (this.socketIoSub) { this.socketIoSub.unsubscribe(); }
            if (this.hbaseSub) { this.hbaseSub.unsubscribe(); }
            if (this.cassSub) { this.cassSub.unsubscribe(); }
            if (this.mdbSub) { this.mdbSub.unsubscribe(); }
            if (this.httpSub) { this.httpSub.unsubscribe(); }
            if (this.updataHttpSub) { this.updataHttpSub.unsubscribe(); }
            if (this.updataJdbcSub) { this.updataJdbcSub.unsubscribe(); }
            if (this.updataFileIOSub) { this.updataFileIOSub.unsubscribe(); }
            if (this.updataSocketIOSub) { this.updataSocketIOSub.unsubscribe(); }
            if (this.updataHbaseSub) { this.updataHbaseSub.unsubscribe(); }
            if (this.updataCassSub) { this.updataCassSub.unsubscribe(); }
            if (this.updataMdbSub) { this.updataMdbSub.unsubscribe(); }

            clearInterval(this.httpTimer);
            clearInterval(this.jdbcTimer);
            clearInterval(this.poolTimer);
            clearInterval(this.fileIOTimer);
            clearInterval(this.socketIOTimer);
            clearInterval(this.hbaseTimer);
            clearInterval(this.cassTimer);
            clearInterval(this.mdbTimer);
            this.httpTimer = null;
            this.jdbcTimer = null;
            this.poolTimer = null;
            this.fileIOTimer = null;
            this.socketIOTimer = null;
            this.hbaseTimer = null;
            this.cassTimer = null;
            this.mdbTimer = null;
            this.clearDisconnet = null;
            this.msgService.isClearProfile = true;
            this.msgService.isClearProSocket = true;
            this.msgService.clearProFileMessage();
            this.msgService.clearProSocketMessage();
            this.stompClient?.forceDisconnect();
        }, this.httpStep * 2);  // 时间会影响profiling停止
    }

    /**
     * clearTimeOut
     */
    public clearTimeOut() {
        if (this.clearDisconnet) {
            clearTimeout(this.clearDisconnet);
            this.clearDisconnet = null;
        }
    }

    /**
     * socketIOUpdata
     */
    public socketIOUpdata() {
        if (!this.socketIoTimeInit.startTime) {
            return;
        }
        this.socketIoTimeInit.endTime = this.socketIoTimeInit.startTime + this.socketIoStep;
        if (this.updataSocketIOSub.closed) {
            const rSpeed = this.socketIoTimeInit.rCount ? (this.socketIoTimeInit.rSpeed /
               this.socketIoTimeInit.rCount).toFixed(2) : 0.01;
            const wSpeed = this.socketIoTimeInit.wCount ? (this.socketIoTimeInit.wSpeed /
               this.socketIoTimeInit.wCount).toFixed(2) : 0.01;
            const endTime = this.dateFormat(this.socketIoTimeInit.endTime, 'hh:mm:ss');
            if (this.downSave.downloadItems.pSocketIO.echarts.writeSpeed.length >
               this.downSave.dataLimit.socket_io.timeValue * 60) {
                this.downSave.downloadItems.pSocketIO.echarts.readSpeed.shift();
                this.downSave.downloadItems.pSocketIO.echarts.writeSpeed.shift();
                this.downSave.downloadItems.pSocketIO.echarts.timeList.shift();
            }
            this.downSave.downloadItems.pSocketIO.echarts.readSpeed.push(rSpeed);
            this.downSave.downloadItems.pSocketIO.echarts.writeSpeed.push(wSpeed);
            this.downSave.downloadItems.pSocketIO.echarts.timeList.push(endTime);
        }
        this.msgService.sendMessage({
            type: 'updata_socketIO',
            data: {
                rSpeed: this.socketIoTimeInit.rCount ? (this.socketIoTimeInit.rSpeed /
                   this.socketIoTimeInit.rCount).toFixed(2) : 0,
                wSpeed: this.socketIoTimeInit.wCount ? (this.socketIoTimeInit.wSpeed /
                   this.socketIoTimeInit.wCount).toFixed(2) : 0,
                endTime: this.socketIoTimeInit.endTime
            }
        });

        this.socketIoTimeInit.wCount = 0;
        this.socketIoTimeInit.rCount = 0;
        this.socketIoTimeInit.rSpeed = 0;
        this.socketIoTimeInit.wSpeed = 0;
        this.socketIoTimeInit.startTime = this.socketIoTimeInit.endTime;
    }

    /**
     * fileIOUpdata
     */
    public fileIOUpdata() {
        if (!this.fileIoTimeInit.startTime) {
            return;
        }
        this.fileIoTimeInit.endTime = this.fileIoTimeInit.startTime + this.fileIoStep;
        if (this.updataFileIOSub.closed) {
            const rSpeed = this.fileIoTimeInit.rCount ? (this.fileIoTimeInit.rSpeed /
               this.fileIoTimeInit.rCount).toFixed(2) : 0.001;
            const wSpeed = this.fileIoTimeInit.wCount ? (this.fileIoTimeInit.wSpeed /
               this.fileIoTimeInit.wCount).toFixed(2) : 0.001;
            const endTime = this.dateFormat(this.fileIoTimeInit.endTime, 'hh:mm:ss');
            if (this.downSave.downloadItems.pFileIO.echarts.writeSpeed.length >
               this.downSave.dataLimit.file_io.timeValue * 60) {
                this.downSave.downloadItems.pFileIO.echarts.readSpeed.shift();
                this.downSave.downloadItems.pFileIO.echarts.writeSpeed.shift();
                this.downSave.downloadItems.pFileIO.echarts.timeList.shift();
            }
            this.downSave.downloadItems.pFileIO.echarts.readSpeed.push(rSpeed);
            this.downSave.downloadItems.pFileIO.echarts.writeSpeed.push(wSpeed);
            this.downSave.downloadItems.pFileIO.echarts.timeList.push(endTime);
        }
        this.msgService.sendMessage({
            type: 'updata_fileIO',
            data: {
                rSpeed: this.fileIoTimeInit.rCount ? (this.fileIoTimeInit.rSpeed /
                   this.fileIoTimeInit.rCount).toFixed(2) : 0,
                wSpeed: this.fileIoTimeInit.wCount ? (this.fileIoTimeInit.wSpeed /
                   this.fileIoTimeInit.wCount).toFixed(2) : 0,
                endTime: this.fileIoTimeInit.endTime
            }
        });

        this.fileIoTimeInit.wCount = 0;
        this.fileIoTimeInit.rCount = 0;
        this.fileIoTimeInit.rSpeed = 0;
        this.fileIoTimeInit.wSpeed = 0;
        this.fileIoTimeInit.startTime = this.fileIoTimeInit.endTime;
    }

    /**
     * jdbcUpdata
     */
    public jdbcUpdata() {
        if (!this.jdbcTimeInit.startTime) {
            return;
        }
        this.jdbcTimeInit.endTime = this.jdbcTimeInit.startTime + this.jdbcStep;
        if (this.updataJdbcSub.closed) {
            const endTime = this.dateFormat(this.jdbcTimeInit.endTime, 'hh:mm:ss');
            this.downSave.downloadItems.jdbc.monitor.data[endTime] = {
                averTime: this.utils.onChangeTime(this.jdbcTimeInit.count_pre_s !== 0 ?
                   (this.jdbcTimeInit.duration_pre_s /
                    this.jdbcTimeInit.count_pre_s).toFixed(2) : 0),
                averCount: this.jdbcTimeInit.count_pre_s
            };
            this.downSave.downloadItems.jdbc.monitor.data =
             this.dataLimit(this.downSave.downloadItems.jdbc.monitor.data,
                20 * this.downSave.dataLimit.jdbc.timeValue);
        }
        this.msgService.sendMessage({
            type: 'updata_jdbc',
            data: {
                executed: this.jdbcTimeInit.count_pre_s,
                aveTime: this.utils.onChangeTime(this.jdbcTimeInit.count_pre_s !== 0 ?
                   (this.jdbcTimeInit.duration_pre_s /
                    this.jdbcTimeInit.count_pre_s).toFixed(2) : 0),
                endTime: this.jdbcTimeInit.endTime
            }
        });

        this.jdbcTimeInit.duration_pre_s = 0;
        this.jdbcTimeInit.count_pre_s = 0;
        this.jdbcTimeInit.startTime = this.jdbcTimeInit.endTime;
    }

    /**
     * hbaseUpdata
     */
    public hbaseUpdata() {
        if (!this.hbaseTimeInit.startTime) {
            return;
        }
        this.hbaseTimeInit.endTime = this.hbaseTimeInit.startTime + this.jdbcStep;
        if (this.updataHbaseSub.closed) {
            const endTime = this.dateFormat(this.hbaseTimeInit.endTime, 'hh:mm:ss');
            this.downSave.downloadItems.hbase.monitor.data[endTime] = {
                averCount: this.hbaseTimeInit.count_pre_s,
                averTime: this.utils.onChangeTime(this.hbaseTimeInit.count_pre_s !== 0 ?
                   (this.hbaseTimeInit.duration_pre_s /
                    this.hbaseTimeInit.count_pre_s).toFixed(2) : 0.001),
            };
            this.downSave.downloadItems.hbase.monitor.data =
             this.dataLimit(this.downSave.downloadItems.hbase.monitor.data,
                20 * this.downSave.dataLimit.hbase.timeValue);
        }
        this.msgService.sendMessage({
            type: 'updata_hbase',
            data: {
                executed: this.hbaseTimeInit.count_pre_s,
                aveTime: this.utils.onChangeTime(this.hbaseTimeInit.count_pre_s !== 0 ?
                   (this.hbaseTimeInit.duration_pre_s /
                    this.hbaseTimeInit.count_pre_s).toFixed(2) : 0),
                endTime: this.hbaseTimeInit.endTime
            }
        });

        this.hbaseTimeInit.duration_pre_s = 0;
        this.hbaseTimeInit.count_pre_s = 0;
        this.hbaseTimeInit.startTime = this.hbaseTimeInit.endTime;
    }

    /**
     * cassUpdata
     */
    public cassUpdata() {
        if (!this.cassTimeInit.startTime) {
            return;
        }
        this.cassTimeInit.endTime = this.cassTimeInit.startTime + this.jdbcStep;
        if (this.updataCassSub.closed) {
            const endTime = this.dateFormat(this.cassTimeInit.endTime, 'hh:mm:ss');
            this.downSave.downloadItems.cassandra.monitor.data[endTime] = {
                averCount: this.cassTimeInit.count_pre_s,
                averTime: this.utils.onChangeTime(this.cassTimeInit.count_pre_s !== 0 ?
                   (this.cassTimeInit.duration_pre_s /
                    this.cassTimeInit.count_pre_s).toFixed(2) : 0.001),
            };
            this.downSave.downloadItems.cassandra.monitor.data =
             this.dataLimit(this.downSave.downloadItems.cassandra.monitor.data,
                20 * this.downSave.dataLimit.cassandra.timeValue);
        }
        this.msgService.sendMessage({
            type: 'updata_cassandra',
            data: {
                executed: this.cassTimeInit.count_pre_s,
                aveTime: this.utils.onChangeTime(this.cassTimeInit.count_pre_s !== 0 ?
                   (this.cassTimeInit.duration_pre_s /
                    this.cassTimeInit.count_pre_s).toFixed(2) : 0),
                endTime: this.cassTimeInit.endTime
            }
        });

        this.cassTimeInit.duration_pre_s = 0;
        this.cassTimeInit.count_pre_s = 0;
        this.cassTimeInit.startTime = this.cassTimeInit.endTime;
    }

    /**
     * mdbUpdata
     */
    public mdbUpdata() {
        if (!this.mdbTimeInit.startTime) {
            return;
        }
        this.mdbTimeInit.endTime = this.mdbTimeInit.startTime + this.jdbcStep;
        if (this.updataMdbSub.closed) {
            const endTime = this.dateFormat(this.mdbTimeInit.endTime, 'hh:mm:ss');
            this.downSave.downloadItems.mongodb.monitor.data[endTime] = {
                averCount: this.mdbTimeInit.count_pre_s,
                averTime: this.utils.onChangeTime(this.mdbTimeInit.count_pre_s !== 0 ?
                   (this.mdbTimeInit.duration_pre_s /
                    this.mdbTimeInit.count_pre_s).toFixed(2) : 0.001),
            };
            this.downSave.downloadItems.mongodb.monitor.data =
             this.dataLimit(this.downSave.downloadItems.mongodb.monitor.data,
                20 * this.downSave.dataLimit.mongodb.timeValue);
        }
        this.msgService.sendMessage({
            type: 'updata_mongodb',
            data: {
                executed: this.mdbTimeInit.count_pre_s,
                aveTime: this.utils.onChangeTime(this.mdbTimeInit.count_pre_s !== 0 ? (this.mdbTimeInit.duration_pre_s /
                    this.mdbTimeInit.count_pre_s).toFixed(2) : 0),
                endTime: this.mdbTimeInit.endTime
            }
        });

        this.mdbTimeInit.duration_pre_s = 0;
        this.mdbTimeInit.count_pre_s = 0;
        this.mdbTimeInit.startTime = this.mdbTimeInit.endTime;
    }

    /**
     * httpUpdata
     */
    public httpUpdata() {
        if (!this.httpTimeInit.startTime) {
            return;
        }
        this.httpTimeInit.endTime = this.httpTimeInit.startTime + this.httpStep;
        if (this.updataHttpSub.closed) {
            const endTime = this.dateFormat(this.httpTimeInit.endTime, 'hh:mm:ss');
            this.downSave.downloadItems.http.monitor.data[endTime] = {
                averCount: this.httpTimeInit.count_pre_s,
                averTime: this.utils.onChangeTime(this.httpTimeInit.count_pre_s !== 0 ?
                   (this.httpTimeInit.duration_pre_s /
                    this.httpTimeInit.count_pre_s).toFixed(2) : 0.001),
            };
            this.downSave.downloadItems.http.monitor.data =
             this.dataLimit(this.downSave.downloadItems.http.monitor.data,
                20 * this.downSave.dataLimit.http.timeValue);
        }
        this.msgService.sendMessage({
            type: 'updata_http',
            data: {
                request: this.httpTimeInit.count_pre_s,
                aveTime: this.utils.onChangeTime(this.httpTimeInit.count_pre_s !== 0 ?
                   (this.httpTimeInit.duration_pre_s /
                    this.httpTimeInit.count_pre_s).toFixed(2) : 0),
                endTime: this.httpTimeInit.endTime
            }
        });
        this.httpTimeInit.duration_pre_s = 0;
        this.httpTimeInit.count_pre_s = 0;
        this.httpTimeInit.startTime = this.httpTimeInit.endTime;
    }
    private showLoding() {
        document.getElementById('loading-box').style.display = 'flex';
    }
    private closeLoding() {
        document.getElementById('loading-box').style.display = 'none';
    }

    /**
     * dateFormat
     */
    public dateFormat(date: any, fmt: any) {
        const getDate = new Date(date);
        const o = {
            'M+': getDate.getMonth() + 1,
            'd+': getDate.getDate(),
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: getDate.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (getDate.getFullYear() + '').substr(4 - RegExp.$1.length)
            );
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1
                        ? (o as any)[k]
                        : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length)
                );
            }
        }
        return fmt;
    }
    /**
     * 数据限定
     */
    public dataLimit(data: any, limit: any) {
        const keys = Object.keys(data);
        if (keys.length > limit) {
            keys.splice(0, keys.length - limit);
            const limitObj = {};
            keys.forEach((key) => {
                (limitObj as any)[key] = data[key];
            });
            return limitObj;
        } else {
            return data;
        }
    }
}
