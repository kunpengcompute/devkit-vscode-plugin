import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import { MessageService } from './message.service';
import { TreeGraph } from '../profile/profile-http/tree';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from './profile-download.service';
import { MytipService } from '../service/mytip.service';
import { LibService } from '../service/lib.service';
import { Router, NavigationEnd } from '@angular/router';
import { I18nService } from '../service/i18n.service';
@Injectable({
  providedIn: 'root'
})
export class StompService {
  public stompClient: any;
  public refreshClientSub: any;
  private subscribeStomp: any;
  public sampleDatas11: Array<any> = [];
  public sampleMethodJava: Array<any> = [];
  public sampleMethodNative: Array<any> = [];
  public profileDatas: Array<any> = [];
  public profileStates: Array<any> = [];
  public profileInstances: Array<any> = [];
  public profileThreadState: Array<any> = [];

  public updataHttpSub: Subscription;
  public httpSub: Subscription;
  public errorSub: Subscription;
  public errorSubs: Subscription;
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
  public deploystateSub: Subscription;
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
  public suggestionsSub: Subscription;
  public refreshSub: Subscription;
  public errSub: Subscription;
  public stateSub: Subscription;
  public threadListSub: Subscription;
  public webSocketId: WebSocket;

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
  public httpTimeInit: any = {};
  private healthTimeInit: any = {};
  private metricsTimeInit: any = {};
  private httptraceTimeInit: any = {};
  public jdbcTimeInit: any = {};
  private poolTimeInit: any = {};
  private fileIoTimeInit: any = {};
  private socketIoTimeInit: any = {};
  public hbaseTimeInit: any = {};
  public cassTimeInit: any = {};
  public mdbTimeInit: any = {};
  public httpStep = 3000;
  public jdbcStep = 3000;
  public poolStep = 1000;
  public fileIoStep = 5000;
  public socketIoStep = 1000;
  public pFileIOpath = '';
  public pSocketIp = '';
  public startReqList: any = [];
  public urlDatas = ['socket', 'file', 'jdbc', 'mongodb', 'connect-pool', 'hbase', 'cassandra'];
  public clearDisconnet: any;
  public treeGraph: any;
  public envUrl: any;
  public sampleDataStrategy: any = {
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
    GC_STATISTIC: 'sGC',
    GC_CONFIGURATION: 'sGC',
    METASPACE_STATISTICS: 'sGC',
    GC: 'sGC',
    THREAD_DUMP: 'sthreadDump',
    MONITOR_CLASS: 'slock',
    MONITOR_THREAD: 'slock',
    MONITOR_INSTANCE: 'slock',
    MONITOR_MAP: 'slock',
    LOCK: 'slock',
    MEMORY_LEAK: 'sreport',
    ANALYSE_REPORT: 'sreport',
    SUGGESTION: 'sreport',
    OLD_OBJECT_SAMPLE: 'sleak',
    OLD_STACK_POOL: 'sleak',
    REFER_POOL: 'sleak',
    FIELD_INDEX: 'sleak'
  };
  public suggestion: any = [];
  public profileDataStrategy: any = {
    state: (itemUrl: any) => {
      this.onHandleProfileState(itemUrl);
    },
    instance: (itemUrl: any) => {
      this.onHandleProfileInstance(itemUrl);
    },
    'thread-state': (itemUrl: any) => {
      this.onHandleProfileThreadState(itemUrl);
    },
    jdbc: (itemUrl: any) => {
      this.onHandleProfileJdbc(itemUrl);
    },
    'connect-pool-suggest': (itemUrl: any) => {
      this.onHandleProfileConnectPoolSuggest(itemUrl);
    },
    'connect-pool': (itemUrl: any) => {
      this.onHandlePorfileConnectPool(itemUrl);
    },
    file: (itemUrl: any) => {
      this.onHandleProfileFile(itemUrl);
    },
    socket: (itemUrl: any) => {
      this.onHandleProfileSocket(itemUrl);
    },
    hbase: (itemUrl: any) => {
      this.onHandleProfileHbase(itemUrl);
    },
    cassandra: (itemUrl: any) => {
      this.onHandleProfileCassandra(itemUrl);
    },
    mongodb: (itemUrl: any) => {
      this.onHandleProfileMongodb(itemUrl);
    },
    httptrace: (itemUrl: any) => {
      this.onHnaldeProfileHttptrace(itemUrl);
    },
    http: (itemUrl: any) => {
      this.onHandleProfileHttp(itemUrl);
    },
    health: (itemUrl: any) => {
      this.onHandleProfileHealth(itemUrl);
    },
    metrics: (itemUrl: any) => {
      this.onHandleProfileMetrics(itemUrl);
    },
    'hotspot-analysis': (itemUrl: any) => {
      this.onHandleProfileHotspotAnalysis(itemUrl);
    },
    gcState: (itemUrl: any) => {
      this.onHandleProfileGcState(itemUrl);
    },
    gcLog: (itemUrl: any) => {
      this.onHandleProfileGcLog(itemUrl);
    },
    heap: (itemUrl: any) => {
      this.onHandleProfileHeap(itemUrl);
    },
    errors: (itemUrl: any) => {
      this.onHandleProfileErrors(itemUrl);
    },
    error: (itemUrl: any) => {
      this.onHandleProfileError(itemUrl);
    },
    suggestions: (itemUrl: any) => {
      this.onHandleProfileSug(itemUrl);
    }
  };
  public refreshData: any = {
    data: (itemUrl: any) => {
      this.onHandleProfileRefresh(itemUrl);
    },
    deploystate: (itemUrl: any) => {
      this.onHandleDeploystate(itemUrl);
    },
    errors: (itemUrl: any) => {
      this.onHandleError(itemUrl);
    }
  };
  public i18n: any;
  constructor(
    private msgService: MessageService,
    public downSave: ProfileDownloadService,
    public mytip: MytipService,
    public libService: LibService,
    public router: Router,
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.envUrl = window.location.host + window.location.pathname;
  }
  public firstStateTime: any = 0;
  public socketState: any = true;
  client(topicUrl?: any, requestUrl?: string, data?: any, successCb?: any, errCb?: any) {
    const token = sessionStorage.getItem('token');
    const envUrl = `${window.location.host + window.location.pathname}api`;
    const encodeToken = encodeURI(token);
    const localIP = 'localhost';
    let localWsIp = '********';
    if (envUrl.indexOf('localhost') >= 0 || envUrl.indexOf(localIP) >= 0) {
      const config: any = require('projects/java/proxy.config.json');
      const target: string = config['/api'].target;
      localWsIp = target.split('http://')[1].split(':8080')[0];
    }
    if (topicUrl && topicUrl.length === 3) {
      if (envUrl.indexOf('localhost') >= 0 || envUrl.indexOf(localIP) >= 0) {
        this.refreshClientSub = Stomp.client(`ws://${localWsIp}:8080/api/ws`, [encodeToken]);
      } else {
        this.refreshClientSub = Stomp.client(`wss://${envUrl}/ws`, [encodeToken]);
      }
      this.refreshClientSub.onWebSocketError = (error: any) => {
        this.mytip.wsErrorTip({
          type: 'warn',
          content: this.i18n.webSocket_connect_error,
          time: 3500,
        });
      };
      this.refreshClientSub.onWebSocketClose = (error: any) => {
        if (this.socketState) {
          this.mytip.wsErrorTip({
            type: 'warn',
            content: this.i18n.webSocket_connect_error,
            time: 3500,
          });
        }
      };
      this.refreshClientSub.connect({ 'Accept-Language': sessionStorage.getItem('language') }, (conn: any) => {
        if (conn.command === 'ERROR') {
        } else {
          this.mytip.clearWsTip();
          this.refresubStomp(topicUrl);
          return this.refreshClientSub;
        }
      });
    } else {
      if (envUrl.indexOf('localhost') >= 0 || envUrl.indexOf(localIP) >= 0) {
        this.stompClient = Stomp.client(`ws://${localWsIp}:8080/api/ws`, [encodeToken]);
      } else {
        this.stompClient = Stomp.client(`wss://${envUrl}/ws`, [encodeToken]);
      }
      this.stompClient.onWebSocketError = (error: any) => {
        this.mytip.wsErrorTip({
          type: 'warn',
          content: this.i18n.webSocket_connect_error,
          time: 3500,
        });
      };
      // 关闭调试输出
      this.stompClient.debug = () => { };
      this.stompClient.connect({ 'Accept-Language': sessionStorage.getItem('language') }, (conn: any) => {
        if (conn.command === 'ERROR') {
        } else {
          this.mytip.clearWsTip();
          if (topicUrl) { this.subscribeStompFn(topicUrl, successCb, errCb); }
          if (requestUrl) { this.startStompRequest(requestUrl, data); }
          return this.stompClient;
        }
      }
      );
    }
  }
  refresubStomp(url: any) {
    if (!this.refreshClientSub) { return; }
    if (url instanceof Array) {
      url.forEach(itemUrl => {
        const topicList = itemUrl.split('/');
        const topic = topicList[topicList.length - 1];
        this.refreshData[topic](itemUrl);
      });
      return;
    }
  }
  subscribeStompFn(topicUrl: any, successCb?: any, errCb?: any) {
    if (!this.stompClient) { return; }
    if (topicUrl instanceof Array) {
      topicUrl.forEach(itemUrl => {
        const topicList = itemUrl.split('/');
        const topic = topicList[topicList.length - 1];
        this.profileDataStrategy[topic](itemUrl);
      });
      return;
    }
    this.onHandleSamplingTopicSubscribe(topicUrl, successCb, errCb);
  }
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
        } else if (this.sampleDataStrategy[newData.type]) {
          this.msgService.sendMessage({ type: this.sampleDataStrategy[newData.type], data: newData });
        } else {
          this.sampleDatas11.push(newData);
          return;
        }
      }
      if (successCb) { successCb(data.body); }
    }, { 'Accept-Language': sessionStorage.getItem('language') });
  }
  startStompRequest(requestUrl: string, data: any) {
    const Language = sessionStorage.getItem('language');
    const replyUrl = `/user/queue/reply${requestUrl}`;
    this.handleStartHttp(requestUrl);
    return new Promise(resolve => {
      this.jdbcSubStart = this.stompClient && this.stompClient.subscribe(replyUrl, (resp: any) => {
        this.jdbcSubStart.unsubscribe();
        resolve(resp);
        const newResp = JSON.parse(resp.body);
        if (resp.headers.destination === '/user/queue/reply/cmd/sub-record') {
          if (newResp.state === 'ERROR' || newResp.state === 'SUCCESS') {
            this.msgService.sendMessage({
              type: 'wsFinish'
            });
            sessionStorage.setItem('wsState', 'success');
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
      return this.stompClient && this.stompClient.send(requestUrl,
        { 'Accept-Language': Language }, JSON.stringify(data));
    });
  }
  public onHandleProfileState(itemUrl: any) {
    let initTime = 0;
    let endTime = 0;
    let startTime = 0;
    let preStartTime = 0;
    let sendFlag = true;
    const maxShowDur = 2 * 60 * 1000;
    this.stateSub = this.stompClient.subscribe(itemUrl, (data: any) => {
      const newDate: any = JSON.parse(data.body);
      if (initTime === 0) {
        initTime = newDate.startTime;
        preStartTime = newDate.startTime;
      }
      endTime = newDate.startTime - initTime;
      startTime = endTime === 0 ? 0 : endTime - 1000;
      const threadState: any = {
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
          threadState[thread.threadState]++;
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
          if (heap.startTime - preStartTime > maxShowDur || preStartTime - heap.startTime > maxShowDur) {
            preStartTime = heap.startTime;
            sendFlag = false;
            return;
          }
          preStartTime = heap.startTime;
          sendFlag = true;
          echartsData.heap_usedSize.push({
            value: [this.libService.dateFormat(heap.startTime, 'yyyy/MM/dd hh:mm:ss.S'), heap.usedSize]
          });
          echartsData.heap_committedSize.push({
            value: [this.libService.dateFormat(heap.startTime, 'yyyy/MM/dd hh:mm:ss.S'), heap.committedSize]
          });
        });
      } else {
        echartsData.heap_usedSize.push({
          value: [this.libService.dateFormat(newDate.startTime, 'yyyy/MM/dd hh:mm:ss.S'), 0]
        });
        echartsData.heap_committedSize.push({
          value: [this.libService.dateFormat(newDate.startTime, 'yyyy/MM/dd hh:mm:ss.S'), 0]
        });
      }

      if (!sendFlag) { return; }
      if (newDate.gcs.length) {
        newDate.gcs.forEach((gc: any) => {
          echartsData.gc_activity.push(
            {
              value: [this.libService.dateFormat(gc.startTime + gc.duration / 2,
                'yyyy/MM/dd hh:mm:ss.S'), gc.duration]
            }
          );
          newDate.heaps.forEach((heap: any) => {
            if (gc.startTime === heap.startTime || gc.startTime + gc.duration === heap.startTime) { return; }
          });
        });
      } else {
        newDate.heaps.forEach((item: any) => {
          echartsData.gc_activity.push({
            value: [this.libService.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S'), 0]
          });
        });
      }
      newDate.heaps.forEach((item: any) => {
        const startTimeData = this.libService.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S');
        echartsData.threads_RUNNABLE.push({
          value: [startTimeData, threadState.RUNNABLE]
        });
        echartsData.threads_WAITING.push({
          value: [startTimeData, threadState.WAITING]
        });
        echartsData.threads_BLOCKED.push({
          value: [startTimeData, threadState.BLOCKED]
        });
        echartsData.classes.push({
          value: [startTimeData, newDate.classCount]
        });
        echartsData.cpu_load_total.push({
          value: [startTimeData, Math.round(newDate.totalCpuUsage * 100) / 100]
        });
        echartsData.cpu_load_progress.push({
          value: [startTimeData, Math.round(newDate.totalCpuUsageOfProcess * 100) / 100]
        });
        echartsData.nonHeap_UsedSize.push({
          value: [startTimeData, newDate.nonHeap.nonHeapUsedSize]
        });
        echartsData.nonHeap_CommittedSize.push({
          value: [startTimeData, newDate.nonHeap.nonHeapCommittedSize]
        });
        echartsData.processPhysical_MemoryUsedSize.push({
          value: [startTimeData, newDate.physicalMemory.processPhysicalMemoryUsedSize]
        });
        echartsData.systemFreePhysical_MemorySize.push({
          value: [startTimeData, newDate.physicalMemory.systemFreePhysicalMemorySize]
        });
      });
      this.msgService.sendMessage({
        type: 'updata_state',
        state: {
          data: echartsData,
          startTime: newDate.startTime
        }
      });
    });
  }

  public onHandleProfileInstance(itemUrl: any) {
    this.stompClient.subscribe(itemUrl, (data: any) => {
      this.profileInstances = this.profileInstances.concat(
        JSON.parse(data.body)
      );
    });
  }
  public onHandleProfileThreadState(itemUrl: any) {
    this.stompClient.subscribe(itemUrl, (data: any) => {
      this.profileThreadState = this.profileThreadState.concat(
        JSON.parse(data.body)
      );
    });
  }
  public onHandleProfileJdbc(itemUrl: any) {
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
  }
  public onHandleProfileConnectPoolSuggest(itemUrl: any) {
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
      this.downSave.downloadItems.jdbcpool.suggestArr.push(pool);
      this.msgService.sendMessage({
        type: 'connect-pool-suggest',
        data: jdbcPoolSuggestDate
      });
    }, { 'Accept-Language': sessionStorage.getItem('language') });
  }
  public onHandlePorfileConnectPool(itemUrl: any) {
    this.poolSub = this.stompClient.subscribe(itemUrl, (data: any) => {
      const newData = JSON.parse(data.body);
      if (!newData.length) { return; }
      const jdbcPool: Array<any> = [];
      this.msgService.sendMessage({
        type: 'pool',
        data: newData
      });
    });
  }
  public onHandleProfileFile(itemUrl: any) {
    this.fileIoSub = this.stompClient.subscribe(itemUrl, (data: any) => {
      const newData = JSON.parse(data.body);
      if (!newData.length) { return; }

      this.msgService.sendMessage({
        type: 'pfileIO',
        data: newData
      });

    });
  }
  public onHandleProfileSocket(itemUrl: any) {
    this.socketIoSub = this.stompClient.subscribe(itemUrl, (data: any) => {
      const newData = JSON.parse(data.body);
      if (!newData.length) { return; }
      this.msgService.sendMessage({
        type: 'psocketIO',
        data: newData
      });
    });
  }
  public onHandleProfileHbase(itemUrl: any) {
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
  }
  public onHandleProfileCassandra(itemUrl: any) {
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
  }
  public onHandleProfileMongodb(itemUrl: any) {
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
  }
  public onHnaldeProfileHttptrace(itemUrl: any) {
    this.httptrace = this.stompClient.subscribe(itemUrl, (data: any) => {
      const httptraceDate = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'httptrace',
        data: httptraceDate
      });
    });
  }
  public onHandleProfileHttp(itemUrl: any) {
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

      parsedData.forEach(http => {
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
  }
  public onHandleProfileHealth(itemUrl: any) {
    this.health = this.stompClient.subscribe(itemUrl, (data: any) => {
      const healthDate: any = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'health',
        data: healthDate
      });
    });
  }
  public onHandleProfileMetrics(itemUrl: any) {
    this.metrics = this.stompClient.subscribe(itemUrl, (data: any) => {
      const metricsDate = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'metrics',
        data: metricsDate
      });
    });
  }
  public onHandleProfileHotspotAnalysis(itemUrl: any) {
    this.hotspotAnalysis = this.stompClient.subscribe(itemUrl, (data: any) => {
      const hotspotDate: any = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'hotspot-analysis',
        data: hotspotDate
      });
    });
  }
  public onHandleProfileGcState(itemUrl: any) {
    this.gcState = this.stompClient.subscribe(itemUrl, (data: any) => {
      const gcStateDate = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'gcState',
        data: gcStateDate
      });
    });
  }
  public onHandleProfileGcLog(itemUrl: any) {
    this.gcLog = this.stompClient.subscribe(itemUrl, (data: any) => {
      sessionStorage.setItem('gcLogState', data.body);
      const gcLogDate: any = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'gcLog',
        data: gcLogDate
      });
    });
    this.msgService.sendMessage({
      type: 'gcLogSubscribeFinish'
    });
  }
  public onHandleProfileHeap(itemUrl: any) {
    this.heapDump = this.stompClient.subscribe(itemUrl, (data: any) => {
      sessionStorage.setItem('dumpState', data.body);
      const heapDate: any = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'heap',
        data: heapDate
      });
    });
  }
  public onHandleProfileSug(itemUrl: any) {
    this.suggestionsSub = this.stompClient.subscribe(itemUrl, (data: any) => {
      const sug = JSON.parse(data.body);
      this.downSave.downloadItems.profileInfo.suggestArr.push(sug);
      this.msgService.sendMessage({
        type: 'suggestions',
        data: sug
      });
    });
  }
  public onHandleProfileRefresh(itemUrl: any) {
    this.refreshSub = this.refreshClientSub.subscribe(itemUrl, (data: any) => {
      const sug = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'data',
        data: sug
      });
    });
  }
  public onHandleDeploystate(itemUrl: any) {
    this.deploystateSub = this.refreshClientSub.subscribe(itemUrl, (data: any) => {
      const sug = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'deploystate',
        data: sug
      });
    });
  }
  public onHandleError(itemUrl: any) {
    const localIP = '*********';
    this.errSub = this.refreshClientSub.subscribe(itemUrl, (data: any) => {
      const sug = JSON.parse(data.body);
      this.downSave.downloadItems.profileInfo.nowTime = '';
      if (sug.message.includes('Signature has expired')) {
        this.socketState = false;
        this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500 });
        this.msgService.sendMessage({ type: 'loginOut' });
        sessionStorage.setItem('loginId', '');
        if (this.envUrl.indexOf('localhost') >= 0 || this.envUrl.indexOf(localIP) >= 0) {
          this.router.navigate(['/login']);
        } else {
          window.location.href =
            window.location.origin + '/' + 'user-management' + '/#/login';
        }
      } else if (sug.message.includes('user logged in elsewhere')) {
        this.socketState = false;
        this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.logged_in, time: 3500 });
        this.msgService.sendMessage({ type: 'loginOut' });
        sessionStorage.setItem('loginId', '');
        if (this.envUrl.indexOf('localhost') >= 0 || this.envUrl.indexOf(localIP) >= 0) {
          this.router.navigate(['/login']);
        } else {
          window.location.href =
            window.location.origin + '/' + 'user-management' + '/#/login';
        }
      }
      this.msgService.sendMessage({
        type: 'data',
        data: sug
      });
    });
  }
  public onHandleProfileError(itemUrl: any) {
    this.errorSub = this.stompClient.subscribe(itemUrl, (data: any) => {
      const errorSub = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'error',
        data: errorSub.message
      });
      this.mytip.alertInfo({
        type: 'warn',
        content: errorSub.message,
        time: 10000
      });
    });
  }
  public onHandleProfileErrors(itemUrl: any) {
    this.errorSubs = this.stompClient.subscribe(itemUrl, (data: any) => {
      const errorSubs = JSON.parse(data.body);
      this.msgService.sendMessage({
        type: 'errors',
        data: errorSubs
      });
      if (errorSubs.error === 'RESOURCE_GUARDIAN_ID_NOT_FOUND') {
        const gurdianName = sessionStorage.getItem('guardianName');
        if (gurdianName) {
          this.mytip.alertInfo({
            type: 'warn',
            content: this.i18nService.I18nReplace(this.i18n.guardian_not_fount, { 0: gurdianName }),
            time: 10000
          });
        }
      } else {
        this.mytip.alertInfo({
          type: 'warn',
          content: errorSubs.message,
          time: 10000
        });
      }
    });
  }
  public onHandleProfileTopicInit() {
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
    if (this.gcState) { this.gcState.unsubscribe(); }
    if (this.gcLog) { this.gcLog.unsubscribe(); }
    if (this.heapDump) { this.heapDump.unsubscribe(); }
    if (this.httptrace) { this.httptrace.unsubscribe(); }
    if (this.errorSub) { this.errorSub.unsubscribe(); }
    if (this.jdbcSubStart) { this.jdbcSubStart.unsubscribe(); }
    if (this.suggestionsSub) { this.suggestionsSub.unsubscribe(); }
  }

  handleStartHttp(requestUrl: string) {
    const baseUrl = '/cmd/start-instrument-';
    const baseUrl2 = '/cmd/stop-instrument-';
    const newUrl = requestUrl.split(baseUrl)[1];
    if (newUrl === 'http') {
      this.startReqList.forEach((item: any) => {
        const url = baseUrl2 + item;
        this.startStompRequest(url, {
          jvmId: sessionStorage.getItem('jvmId'),
          guardianId: sessionStorage.getItem('guardianId')
        });
      });
      if (this.startReqList.indexOf('file') > -1) {
        clearInterval(this.fileIOTimer);
        this.fileIOTimer = null;
        this.downSave.dataSave.isFileIOStart = false;
      }
      if (this.startReqList.indexOf('socket') > -1) {
        clearInterval(this.socketIOTimer);
        this.socketIOTimer = null;
        this.downSave.dataSave.isSocketIOStart = false;
      }
      if (this.startReqList.indexOf('jdbc') > -1) {
        clearInterval(this.jdbcTimer);
        this.jdbcTimer = null;
        this.downSave.dataSave.isJdbcStart = false;
      }
      if (this.startReqList.indexOf('hbase') > -1) {
        clearInterval(this.hbaseTimer);
        this.hbaseTimer = null;
        this.downSave.dataSave.isHbaseStart = false;
      }
      if (this.startReqList.indexOf('cassandra') > -1) {
        clearInterval(this.cassTimer);
        this.cassTimer = null;
        this.downSave.dataSave.isCassStart = false;
      }
      if (this.startReqList.indexOf('mongodb') > -1) {
        clearInterval(this.mdbTimer);
        this.mdbTimer = null;
        this.downSave.dataSave.isMongodbStart = false;
      }
      if (this.startReqList.indexOf('connect-pool') > -1) {
        clearInterval(this.poolTimer);
        this.poolTimer = null;
        this.downSave.dataSave.isjdbcPoolStart = false;
      }
      this.startReqList = [];
    } else if (this.urlDatas.indexOf(newUrl) > -1) {
      this.startReqList.push(newUrl);
      this.startReqList = Array.from(new Set(this.startReqList));
      if (this.downSave.dataSave.isHttpStart) {
        this.startStompRequest('/cmd/stop-instrument-http', {
          jvmId: sessionStorage.getItem('jvmId'),
          guardianId: sessionStorage.getItem('guardianId')
        });
        clearInterval(this.httpTimer);
        this.httpTimer = null;
        this.downSave.dataSave.isHttpStart = false;
      }
    }
  }



  public disConnect() {
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
      this.onHandleUnsubscribeAllTopic();
      this.clearDisconnet = null;
    }, this.httpStep * 2);
  }
  public clearTimeOut() {
    if (this.clearDisconnet) {
      clearTimeout(this.clearDisconnet);
      this.clearDisconnet = null;
      this.onHandleUnsubscribeAllTopic();
    }
  }
  public onHandleUnsubscribeAllTopic() {
    this.onHandleProfileTopicUnsubscribe();
    this.onHandleProfileEchartsUnsubscribe();
    this.onHandleProfileEchartsInterval();
    this.onHandleProfileIOCache();
    this.stompClient?.forceDisconnect();
  }
  public onHandleProfileTopicUnsubscribe() {
    if (this.jdbcSub) { this.jdbcSub.unsubscribe(); }
    if (this.poolSub) { this.poolSub.unsubscribe(); }
    if (this.jdbcPoolSuggest) { this.jdbcPoolSuggest.unsubscribe(); }
    if (this.fileIoSub) { this.fileIoSub.unsubscribe(); }
    if (this.socketIoSub) { this.socketIoSub.unsubscribe(); }
    if (this.hbaseSub) { this.hbaseSub.unsubscribe(); }
    if (this.cassSub) { this.cassSub.unsubscribe(); }
    if (this.mdbSub) { this.mdbSub.unsubscribe(); }
    if (this.httpSub) { this.httpSub.unsubscribe(); }
  }
  public onHandleProfileEchartsUnsubscribe() {
    if (this.updataHttpSub) { this.updataHttpSub.unsubscribe(); }
    if (this.updataJdbcSub) { this.updataJdbcSub.unsubscribe(); }
    if (this.updataFileIOSub) { this.updataFileIOSub.unsubscribe(); }
    if (this.updataSocketIOSub) { this.updataSocketIOSub.unsubscribe(); }
    if (this.updataHbaseSub) { this.updataHbaseSub.unsubscribe(); }
    if (this.updataCassSub) { this.updataCassSub.unsubscribe(); }
    if (this.updataMdbSub) { this.updataMdbSub.unsubscribe(); }
  }
  public onHandleProfileEchartsInterval() {
    clearInterval(this.httpTimer);
    clearInterval(this.jdbcTimer);
    clearInterval(this.poolTimer);
    clearInterval(this.hbaseTimer);
    clearInterval(this.cassTimer);
    clearInterval(this.mdbTimer);
    this.httpTimer = null;
    this.jdbcTimer = null;
    this.poolTimer = null;
    this.hbaseTimer = null;
    this.cassTimer = null;
    this.mdbTimer = null;
  }
  public onHandleProfileIOCache() {
    this.msgService.isClearProfile = true;
    this.msgService.isClearProSocket = true;
    this.msgService.clearProFileMessage();
    this.msgService.clearProSocketMessage();
  }

  public jdbcUpdata() {
    if (!this.jdbcTimeInit.startTime) {
      return;
    }
    this.jdbcTimeInit.endTime = this.jdbcTimeInit.startTime + this.jdbcStep;
    this.msgService.sendMessage({
      type: 'updata_jdbc',
      data: {
        executed: this.jdbcTimeInit.count_pre_s,
        aveTime: this.jdbcTimeInit.count_pre_s !== 0 ?
          (this.jdbcTimeInit.duration_pre_s / this.jdbcTimeInit.count_pre_s).toFixed(2) : 0,
        endTime: this.jdbcTimeInit.endTime
      }
    });

    this.jdbcTimeInit.duration_pre_s = 0;
    this.jdbcTimeInit.count_pre_s = 0;
    this.jdbcTimeInit.startTime = this.jdbcTimeInit.endTime;
  }

  public hbaseUpdata() {
    if (!this.hbaseTimeInit.startTime) {
      return;
    }
    this.hbaseTimeInit.endTime = this.hbaseTimeInit.startTime + this.jdbcStep;
    this.msgService.sendMessage({
      type: 'updata_hbase',
      data: {
        executed: this.hbaseTimeInit.count_pre_s,
        aveTime: this.hbaseTimeInit.count_pre_s !== 0 ?
          (this.hbaseTimeInit.duration_pre_s / this.hbaseTimeInit.count_pre_s).toFixed(2) : 0,
        endTime: this.hbaseTimeInit.endTime
      }
    });

    this.hbaseTimeInit.duration_pre_s = 0;
    this.hbaseTimeInit.count_pre_s = 0;
    this.hbaseTimeInit.startTime = this.hbaseTimeInit.endTime;
  }

  public cassUpdata() {
    if (!this.cassTimeInit.startTime) {
      return;
    }
    this.cassTimeInit.endTime = this.cassTimeInit.startTime + this.jdbcStep;
    this.msgService.sendMessage({
      type: 'updata_cassandra',
      data: {
        executed: this.cassTimeInit.count_pre_s,
        aveTime: this.cassTimeInit.count_pre_s !== 0 ?
          (this.cassTimeInit.duration_pre_s / this.cassTimeInit.count_pre_s).toFixed(2) : 0,
        endTime: this.cassTimeInit.endTime
      }
    });

    this.cassTimeInit.duration_pre_s = 0;
    this.cassTimeInit.count_pre_s = 0;
    this.cassTimeInit.startTime = this.cassTimeInit.endTime;
  }

  public mdbUpdata() {
    if (!this.mdbTimeInit.startTime) {
      return;
    }
    this.mdbTimeInit.endTime = this.mdbTimeInit.startTime + this.jdbcStep;
    this.msgService.sendMessage({
      type: 'updata_mongodb',
      data: {
        executed: this.mdbTimeInit.count_pre_s,
        aveTime: this.mdbTimeInit.count_pre_s !== 0 ?
          (this.mdbTimeInit.duration_pre_s / this.mdbTimeInit.count_pre_s).toFixed(2) : 0,
        endTime: this.mdbTimeInit.endTime
      }
    });

    this.mdbTimeInit.duration_pre_s = 0;
    this.mdbTimeInit.count_pre_s = 0;
    this.mdbTimeInit.startTime = this.mdbTimeInit.endTime;
  }

  public httpUpdata() {
    if (!this.httpTimeInit.startTime) {
      return;
    }
    this.httpTimeInit.endTime = this.httpTimeInit.startTime + this.httpStep;
    this.msgService.sendMessage({
      type: 'updata_http',
      data: {
        request: this.httpTimeInit.count_pre_s,
        aveTime: this.httpTimeInit.count_pre_s !== 0 ?
          (this.httpTimeInit.duration_pre_s / this.httpTimeInit.count_pre_s).toFixed(2) : 0,
        endTime: this.httpTimeInit.endTime
      }
    });
    this.httpTimeInit.duration_pre_s = 0;
    this.httpTimeInit.count_pre_s = 0;
    this.httpTimeInit.startTime = this.httpTimeInit.endTime;
  }
}
