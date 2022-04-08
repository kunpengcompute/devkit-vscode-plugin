import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class MessageService {
    public cache: any[] = [];
    public cacheUpdate: any[] = [];
    public fileCache: any[] = [];
    public fileCacheUpdate: any[] = [];

    public sampleFileIOCache: any[] = [];
    public sampleFileIOIsLock = false;
    public sampleFileInterval: any;
    public sampleFileIOStackCache: any[] = [];
    public sampleFileIOStackIsLock = false;
    public sampleFileIOStackInterval: any;

    public sampleSocketIOCache: any[] = [];
    public sampleSocketIOIsLock = false;
    public sampleSocketInterval: any;
    public sampleSocketIOStackCache: any[] = [];
    public sampleSocketIOStackIsLock = false;
    public sampleSocketIOStackInterval: any;

    public sampleObjectCache: any[] = [];
    public sampleObjectIsLock = false;
    public sampleObjectInterval: any;
    public sampleObjectStackCache: any[] = [];
    public sampleObjectStackIsLock = false;
    public sampleObjectStackInterval: any;

    public isClearProfile = false;
    public isClearProSocket = false;
    private subject = new Subject<any>();
    private socketSubject = new Subject<any>();
    private socketUpdate = new Subject<any>();
    private fileSubject = new Subject<any>();
    private fileUpdate = new Subject<any>();
    private sampleFileIO = new Subject<any>();
    private sampleFileIOStacktrace = new Subject<any>();
    private sampleScoketIO = new Subject<any>();
    private sampleScoketIOStacktrace = new Subject<any>();
    private sampleObject = new Subject<any>();
    private sampleObjectStacktrace = new Subject<any>();
    private sampleGC = new Subject<any>();
    private sampleThreadDump = new Subject<any>();
    private sampleLock = new Subject<any>();
    private sampleAnalyse = new Subject<any>();
    // Observable的每个订阅者之间，读取的发布数据是相对各自独立的。
    // Subject的订阅者之间，是共享一个发布数据的。
    private interval: any;
    private intervalUpdate: any;

    private fileInterval: any;
    private fileIntervalUpdate: any;
    public typeListStrategy = {
        psocketIO: (type: any) => {
            if (this.isClearProSocket) { return; }
            this.cache.push(type);
            if (!this.interval) {
                this.interval = setInterval(() => {
                    this.sendSubjectMsg(this.cache.shift());
                    if (this.cache.length === 0) {
                        clearInterval(this.interval);
                        this.interval = null;
                    }
                }, 300);
            }
        },
        updata_socketIO: (type: any) => {
            if (this.isClearProSocket) { return; }
            this.cacheUpdate.push(type);
            if (!this.intervalUpdate) {
                this.intervalUpdate = setInterval(() => {
                    this.sendSocketUpdateMsg(this.cacheUpdate.shift());
                    if (this.cacheUpdate.length === 0) {
                        clearInterval(this.intervalUpdate);
                        this.intervalUpdate = null;
                    }
                }, 300);
            }
        },
        pfileIO: (type: any) => {
            if (this.isClearProfile) { return; }
            this.fileCache.push(type);
            if (!this.fileInterval) {
                this.fileInterval = setInterval(() => {
                    this.sendFileSubjectMsg(this.fileCache.shift());
                    if (this.fileCache.length === 0) {
                        clearInterval(this.fileInterval);
                        this.fileInterval = null;
                    }
                }, 300);
            }
        },
        updata_fileIO: (type: any) => {
            if (this.isClearProfile) { return; }
            this.fileCacheUpdate.push(type);
            if (!this.fileIntervalUpdate) {
                this.fileIntervalUpdate = setInterval(() => {
                    this.sendFileUpdateMsg(this.fileCacheUpdate.shift());
                    if (this.fileCacheUpdate.length === 0) {
                        clearInterval(this.fileIntervalUpdate);
                        this.fileIntervalUpdate = null;
                    }
                }, 300);
            }
        },
        sfileIO: (type: any): any => {
            if (this.sampleFileIOIsLock) {
                return this.sampleFileIOCache.push(type.data);
            }
            this.sendSampleFileMsg(type.data);
        },
        sfileIOStacktrace: (type: any): any => {
            if (this.sampleFileIOStackIsLock) {
                return this.sampleFileIOStackCache.push(type.data);
            }
            this.sendSampleFileStacktraceMsg(type.data);
        },
        sSocketIO: (type: any): any => {
            if (this.sampleSocketIOIsLock) {
                return this.sampleSocketIOCache.push(type.data);
            }
            this.sendSampleScoketMsg(type.data);
        },
        sSocketIOStacktrace: (type: any): any => {
            if (this.sampleSocketIOStackIsLock) {
                return this.sampleSocketIOStackCache.push(type.data);
            }
            this.sendSampleSocketStacktraceMsg(type.data);
        },
        sObject: (type: any): any => {
            if (this.sampleObjectIsLock) {
                return this.sampleObjectCache.push(type.data);
            }
            this.sendSampleObjectMsg(type.data);
        },
        sObjectStackstrace: (type: any): any => {
            if (this.sampleObjectStackIsLock) {
                return this.sampleObjectStackCache.push(type.data);
            }
            this.sendSampleObjectStacktraceMsg(type.data);
        },
        sGC: (type: any) => {
            this.sendSampleGCMsg(type.data);
        },
        sthreadDump: (type: any) => {
            this.sendSampleThreadDumpMsg(type.data);
        },
        slock: (type: any) => {
            this.sendSampleLockMsg(type.data);
        },
        sreport: (type: { data: any; }) => {
            this.sendSampleAnalyseMsg(type.data);
        },
    };
    /**
     * sendMessage
     * @param type type
     */
    sendMessage(type: any) {
        const typeStr = type.type;
        if ((this.typeListStrategy as any)[typeStr]) {
            return (this.typeListStrategy as any)[type.type](type);
        } else {
            this.subject.next(type);
        }
    }
    /**
     * handleSampleFileIOInterval
     */
    public handleSampleFileIOInterval() {
        // 下次调用时需要先清除this.sampleFileInterval
        if (!this.sampleFileInterval && this.sampleFileIOCache.length > 0) {
            this.sampleFileInterval = setInterval(() => {
                this.sendSampleFileMsg(this.sampleFileIOCache.shift());
                if (this.sampleFileIOCache.length === 0) {
                    clearInterval(this.sampleFileInterval);
                    this.sampleFileInterval = null;
                }
            }, 0);
        }
    }
    /**
     * handelSampleFileIOStackInterval
     */
    public handelSampleFileIOStackInterval() {
        // 下次调用时需要先清除this.sampleFileInterval
        if (!this.sampleFileIOStackInterval && this.sampleFileIOStackCache.length > 0) {
            this.sampleFileIOStackInterval = setInterval(() => {
                this.sendSampleFileStacktraceMsg(this.sampleFileIOStackCache.shift());
                if (this.sampleFileIOStackCache.length === 0) {
                    clearInterval(this.sampleFileIOStackInterval);
                    this.sampleFileIOStackInterval = null;
                }
            }, 0);
        }
    }
    /**
     * handleSampleFileIOResend
     */
    public handleSampleFileIOResend() {
        this.sampleFileIOIsLock = false;
        this.sampleFileIOStackIsLock = false;
        this.sampleFileInterval = null;
        this.sampleFileIOStackInterval = null;
        this.handleSampleFileIOInterval();
        this.handelSampleFileIOStackInterval();
    }
    /**
     * handleSampleFileIOClear
     */
    public handleSampleFileIOClear() {
        this.sampleFileIOCache = [];
        this.sampleFileIOStackCache = [];
        this.sampleFileIOIsLock = false;
        this.sampleFileIOStackIsLock = false;
        clearInterval(this.sampleFileInterval);
        clearInterval(this.sampleFileIOStackInterval);
        this.sampleFileInterval = null;
        this.sampleFileIOStackInterval = null;
    }

    /**
     * handleSampleSocketIOInterval
     */
    public handleSampleSocketIOInterval() {
        // 下次调用时需要先清除this.sampleFileInterval
        if (!this.sampleSocketInterval && this.sampleSocketIOCache.length > 0) {
            this.sampleSocketInterval = setInterval(() => {
                this.sendSampleScoketMsg(this.sampleSocketIOCache.shift());
                if (this.sampleSocketIOCache.length === 0) {
                    clearInterval(this.sampleSocketInterval);
                    this.sampleSocketInterval = null;
                }
            }, 0);
        }
    }
    /**
     * handelSampleSocketIOStackInterval
     */
    public handelSampleSocketIOStackInterval() {
        // 下次调用时需要先清除this.sampleFileInterval
        if (!this.sampleSocketIOStackInterval && this.sampleSocketIOStackCache.length > 0) {
            this.sampleSocketIOStackInterval = setInterval(() => {
                this.sendSampleSocketStacktraceMsg(this.sampleSocketIOStackCache.shift());
                if (this.sampleSocketIOStackCache.length === 0) {
                    clearInterval(this.sampleSocketIOStackInterval);
                    this.sampleSocketIOStackInterval = null;
                }
            }, 0);
        }
    }
    /**
     * handleSampleSocketIOResend
     */
    public handleSampleSocketIOResend() {
        this.sampleSocketIOIsLock = false;
        this.sampleSocketIOStackIsLock = false;
        this.sampleSocketInterval = null;
        this.sampleSocketIOStackInterval = null;
        this.handleSampleSocketIOInterval();
        this.handelSampleSocketIOStackInterval();
    }
    /**
     * handleSampleSocketIOClear
     */
    public handleSampleSocketIOClear() {
        this.sampleSocketIOCache = [];
        this.sampleSocketIOStackCache = [];
        this.sampleSocketIOIsLock = false;
        this.sampleSocketIOStackIsLock = false;
        clearInterval(this.sampleSocketInterval);
        clearInterval(this.sampleSocketIOStackInterval);
        this.sampleSocketInterval = null;
        this.sampleSocketIOStackInterval = null;
    }

    /**
     * handleSampleObjectInterval
     */
    public handleSampleObjectInterval() {
        // 下次调用时需要先清除this.sampleFileInterval
        if (!this.sampleObjectInterval && this.sampleObjectCache.length > 0) {
            this.sampleObjectInterval = setInterval(() => {
                this.sendSampleScoketMsg(this.sampleObjectCache.shift());
                if (this.sampleObjectCache.length === 0) {
                    clearInterval(this.sampleObjectInterval);
                    this.sampleObjectInterval = null;
                }
            }, 0);
        }
    }
    /**
     * handelSampleObjectStackInterval
     */
    public handelSampleObjectStackInterval() {
        // 下次调用时需要先清除this.sampleFileInterval
        if (!this.sampleObjectStackInterval && this.sampleObjectStackCache.length > 0) {
            this.sampleObjectStackInterval = setInterval(() => {
                this.sendSampleObjectStacktraceMsg(this.sampleObjectStackCache.shift());
                if (this.sampleObjectStackCache.length === 0) {
                    clearInterval(this.sampleObjectStackInterval);
                    this.sampleObjectStackInterval = null;
                }
            }, 0);
        }
    }
    /**
     * handleSampleObjectResend
     */
    public handleSampleObjectResend() {
        this.sampleObjectIsLock = false;
        this.sampleObjectStackIsLock = false;
        this.sampleObjectInterval = null;
        this.sampleObjectStackInterval = null;
        this.handleSampleObjectInterval();
        this.handelSampleObjectStackInterval();
    }
    /**
     * handleSampleObjectClear
     */
    public handleSampleObjectClear() {
        this.sampleObjectCache = [];
        this.sampleObjectStackCache = [];
        this.sampleObjectIsLock = false;
        this.sampleObjectStackIsLock = false;
        clearInterval(this.sampleObjectInterval);
        clearInterval(this.sampleObjectStackInterval);
        this.sampleObjectInterval = null;
        this.sampleObjectStackInterval = null;
    }

    /**
     * sendSubjectMsg
     * @param type type
     */
    sendSubjectMsg(type: any) {
        this.socketSubject.next(type);
    }

    /**
     * sendSocketUpdateMsg
     * @param type type
     */
    sendSocketUpdateMsg(type: any) {
        this.socketUpdate.next(type);
    }
    /**
     * sendFileSubjectMsg
     * @param type type
     */
    sendFileSubjectMsg(type: any) {
        this.fileSubject.next(type);
    }
    /**
     * sendFileUpdateMsg
     * @param type type
     */
    sendFileUpdateMsg(type: any) {
        this.fileUpdate.next(type);
    }
    /**
     * sendSampleFileMsg
     * @param type type
     */
    sendSampleFileMsg(type: any) {
        this.sampleFileIO.next(type);
    }
    /**
     * sendSampleFileStacktraceMsg
     * @param type type
     */
    sendSampleFileStacktraceMsg(type: any) {
        this.sampleFileIOStacktrace.next(type);
    }
    /**
     * sendSampleScoketMsg
     * @param type type
     */
    sendSampleScoketMsg(type: any) {
        this.sampleScoketIO.next(type);
    }
    /**
     * sendSampleSocketStacktraceMsg
     * @param type type
     */
    sendSampleSocketStacktraceMsg(type: any) {
        this.sampleScoketIOStacktrace.next(type);
    }
    /**
     * sendSampleObjectMsg
     * @param type type
     */
    sendSampleObjectMsg(type: any) {
        this.sampleObject.next(type);
    }
    /**
     * sendSampleObjectStacktraceMsg
     * @param type type
     */
    sendSampleObjectStacktraceMsg(type: any) {
        this.sampleObjectStacktrace.next(type);
    }
    /**
     * sendSampleGCMsg
     * @param type type
     */
    sendSampleGCMsg(type: any) {
        this.sampleGC.next(type);
    }
    /**
     * sendSampleThreadDumpMsg
     * @param type type
     */
    sendSampleThreadDumpMsg(type: any) {
        this.sampleThreadDump.next(type);
    }
    /**
     * sendSampleLockMsg
     * @param type type
     */
    sendSampleLockMsg(type: any) {
        this.sampleLock.next(type);
    }
    /**
     * sendSampleLockMsg
     * @param type type
     */
    sendSampleAnalyseMsg(type: any) {
        this.sampleAnalyse.next(type);
    }
    /**
     * 清理信息
     */
    clearMessage() {
        this.subject.next();
    }
    /**
     * clearProFileMessage
     */
    clearProFileMessage() {
        this.fileCache = [];
        this.fileCacheUpdate = [];
        clearInterval(this.fileInterval);
        clearInterval(this.fileIntervalUpdate);
        this.fileInterval = null;
        this.fileIntervalUpdate = null;
    }
    /**
     * clearProSocketMessage
     */
    clearProSocketMessage() {
        this.cache = [];
        this.cacheUpdate = [];
        clearInterval(this.interval);
        clearInterval(this.intervalUpdate);
        this.interval = null;
        this.intervalUpdate = null;
    }
    /**
     * 获取信息,@returns { Observable<any> } 返回消息监听
     */
    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
    /**
     * getSocketMessage
     */
    getSocketMessage(): Observable<any> {
        return this.socketSubject.asObservable();
    }
    /**
     * getSocketUpdateMessage
     */
    getSocketUpdateMessage(): Observable<any> {
        return this.socketUpdate.asObservable();
    }
    /**
     * getFileMessage
     */
    getFileMessage(): Observable<any> {
        return this.fileSubject.asObservable();
    }
    /**
     * getFileUpdateMessage
     */
    getFileUpdateMessage(): Observable<any> {
        return this.fileUpdate.asObservable();
    }
    /**
     * getSampleFileMessage
     */
    getSampleFileMessage(): Observable<any> {
        return this.sampleFileIO.asObservable();
    }
    /**
     * getSampleFileStacktraceMessage
     */
    getSampleFileStacktraceMessage(): Observable<any> {
        return this.sampleFileIOStacktrace.asObservable();
    }
    /**
     * getSampleSocketMessage
     */
    getSampleSocketMessage(): Observable<any> {
        return this.sampleScoketIO.asObservable();
    }
    /**
     * getSampleSocketStacktraceMessage
     */
    getSampleSocketStacktraceMessage(): Observable<any> {
        return this.sampleScoketIOStacktrace.asObservable();
    }
    /**
     * getSampleObjectMessage
     */
    getSampleObjectMessage(): Observable<any> {
        return this.sampleObject.asObservable();
    }
    /**
     * getSampleObjectStacktraceMessage
     */
    getSampleObjectStacktraceMessage(): Observable<any> {
        return this.sampleObjectStacktrace.asObservable();
    }
    /**
     * getSampleGCMessage
     */
    getSampleGCMessage(): Observable<any> {
        return this.sampleGC.asObservable();
    }
    /**
     * getSampleThreadDumpMessage
     */
    getSampleThreadDumpMessage(): Observable<any> {
        return this.sampleThreadDump.asObservable();
    }
    /**
     * getSampleLockMessage
     */
    getSampleLockMessage(): Observable<any> {
        return this.sampleLock.asObservable();
    }
    /**
     * getSampleAnalysMessage
     */
    getSampleAnalysMessage(): Observable<any> {
        return this.sampleAnalyse.asObservable();
    }
}
