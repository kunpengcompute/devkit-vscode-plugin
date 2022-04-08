import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
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

  public timerHandle: any = null;

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
  private sampleLeak = new Subject<any>();
  // Observable的每个订阅者之间，读取的发布数据是相对各自独立的。
  // Subject的订阅者之间，是共享一个发布数据的。
  private interval: any;
  private intervalUpdate: any;

  private fileInterval: any;
  private fileIntervalUpdate: any;
  private tempData = {};
  public onlineDev = false; // 是（true）否(false)开启本地代码连接线上服务器联调开发-上传代码务必改成false
  public typeListStrategy: any = {
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
    sfileIO: (type: { data: any; }): any => {
      if (this.sampleFileIOIsLock) {
        return this.sampleFileIOCache.push(type.data);
      }
      this.sendSampleFileMsg(type.data);
    },
    sfileIOStacktrace: (type: { data: any; }): any => {
      if (this.sampleFileIOStackIsLock) {
        return this.sampleFileIOStackCache.push(type.data);
      }
      this.sendSampleFileStacktraceMsg(type.data);
    },
    sSocketIO: (type: { data: any; }): any => {
      if (this.sampleSocketIOIsLock) {
        return this.sampleSocketIOCache.push(type.data);
      }
      this.sendSampleScoketMsg(type.data);
    },
    sSocketIOStacktrace: (type: { data: any; }): any => {
      if (this.sampleSocketIOStackIsLock) {
        return this.sampleSocketIOStackCache.push(type.data);
      }
      this.sendSampleSocketStacktraceMsg(type.data);
    },
    sObject: (type: { data: any; }): any => {
      if (this.sampleObjectIsLock) {
        return this.sampleObjectCache.push(type.data);
      }
      this.sendSampleObjectMsg(type.data);
    },
    sObjectStackstrace: (type: { data: any; }): any => {
      if (this.sampleObjectStackIsLock) {
        return this.sampleObjectStackCache.push(type.data);
      }
      this.sendSampleObjectStacktraceMsg(type.data);
    },
    sGC: (type: { data: any; }) => {
      this.sendSampleGCMsg(type.data);
    },
    sthreadDump: (type: { data: any; }) => {
      this.sendSampleThreadDumpMsg(type.data);
    },
    slock: (type: { data: any; }) => {
      this.sendSampleLockMsg(type.data);
    },
    sreport: (type: { data: any; }) => {
      this.sendSampleAnalyseMsg(type.data);
    },
    sleak: (type: { data: any; }) => {
      this.sendSampleLeakMsg(type.data);
    }
  };
  sendMessage(type: any) {
    const typeStr = type.type;
    const self = this;
    if (this.typeListStrategy[typeStr]) {
      return this.typeListStrategy[type.type](type);
    } else if (typeStr === 'getDeleteOne'){
      if (this.timerHandle !== null){
          clearTimeout(this.timerHandle);
      }
      this.timerHandle = setTimeout(() => {
        self.subject.next(type);
      }, 1 );
    } else {
      this.subject.next(type);
    }
  }
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
  public handleSampleFileIOResend() {
    this.sampleFileIOIsLock = false;
    this.sampleFileIOStackIsLock = false;
    this.sampleFileInterval = null;
    this.sampleFileIOStackInterval = null;
    this.handleSampleFileIOInterval();
    this.handelSampleFileIOStackInterval();
  }
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
  public handleSampleSocketIOResend() {
    this.sampleSocketIOIsLock = false;
    this.sampleSocketIOStackIsLock = false;
    this.sampleSocketInterval = null;
    this.sampleSocketIOStackInterval = null;
    this.handleSampleSocketIOInterval();
    this.handelSampleSocketIOStackInterval();
  }
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
  public handleSampleObjectResend() {
    this.sampleObjectIsLock = false;
    this.sampleObjectStackIsLock = false;
    this.sampleObjectInterval = null;
    this.sampleObjectStackInterval = null;
    this.handleSampleObjectInterval();
    this.handelSampleObjectStackInterval();
  }
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

  sendSubjectMsg(type: any) {
    this.socketSubject.next(type);
  }
  sendSocketUpdateMsg(type: any) {
    this.socketUpdate.next(type);
  }
  sendFileSubjectMsg(type: any) {
    this.fileSubject.next(type);
  }
  sendFileUpdateMsg(type: any) {
    this.fileUpdate.next(type);
  }
  sendSampleFileMsg(type: any) {
    this.sampleFileIO.next(type);
  }
  sendSampleFileStacktraceMsg(type: any) {
    this.sampleFileIOStacktrace.next(type);
  }
  sendSampleScoketMsg(type: any) {
    this.sampleScoketIO.next(type);
  }
  sendSampleSocketStacktraceMsg(type: any) {
    this.sampleScoketIOStacktrace.next(type);
  }
  sendSampleObjectMsg(type: any) {
    this.sampleObject.next(type);
  }
  sendSampleObjectStacktraceMsg(type: any) {
    this.sampleObjectStacktrace.next(type);
  }
  sendSampleGCMsg(type: any) {
    this.sampleGC.next(type);
  }
  sendSampleThreadDumpMsg(type: any) {
    this.sampleThreadDump.next(type);
  }
  sendSampleLockMsg(type: any) {
    this.sampleLock.next(type);
  }
  sendSampleAnalyseMsg(type: any) {
    this.sampleAnalyse.next(type);
  }
  sendSampleLeakMsg(type: any) {
    this.sampleLeak.next(type);
  }
  // 清理信息:
  clearMessage() {
    this.subject.next();
  }
  clearProFileMessage() {
    this.fileCache = [];
    this.fileCacheUpdate = [];
    clearInterval(this.fileInterval);
    clearInterval(this.fileIntervalUpdate);
    this.fileInterval = null;
    this.fileIntervalUpdate = null;
  }
  clearProSocketMessage() {
    this.cache = [];
    this.cacheUpdate = [];
    clearInterval(this.interval);
    clearInterval(this.intervalUpdate);
    this.interval = null;
    this.intervalUpdate = null;
  }
  // 获取信息,@returns { Observable<any> } 返回消息监听
  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
  getSocketMessage(): Observable<any> {
    return this.socketSubject.asObservable();
  }
  getSocketUpdateMessage(): Observable<any> {
    return this.socketUpdate.asObservable();
  }
  getFileMessage(): Observable<any> {
    return this.fileSubject.asObservable();
  }
  getFileUpdateMessage(): Observable<any> {
    return this.fileUpdate.asObservable();
  }
  getSampleFileMessage(): Observable<any> {
    return this.sampleFileIO.asObservable();
  }
  getSampleFileStacktraceMessage(): Observable<any> {
    return this.sampleFileIOStacktrace.asObservable();
  }
  getSampleSocketMessage(): Observable<any> {
    return this.sampleScoketIO.asObservable();
  }
  getSampleSocketStacktraceMessage(): Observable<any> {
    return this.sampleScoketIOStacktrace.asObservable();
  }
  getSampleObjectMessage(): Observable<any> {
    return this.sampleObject.asObservable();
  }
  getSampleObjectStacktraceMessage(): Observable<any> {
    return this.sampleObjectStacktrace.asObservable();
  }
  getSampleGCMessage(): Observable<any> {
    return this.sampleGC.asObservable();
  }
  getSampleThreadDumpMessage(): Observable<any> {
    return this.sampleThreadDump.asObservable();
  }
  getSampleLockMessage(): Observable<any> {
    return this.sampleLock.asObservable();
  }
  getSampleAnalysMessage(): Observable<any> {
    return this.sampleAnalyse.asObservable();
  }
  getSampleLeakMessage(): Observable<any> {
    return this.sampleLeak.asObservable();
  }
}
