import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SamplieDownloadService {

  public downloadItems: any = {
    env: {
      isFinish: false,
      cpuInofo: [],
      sysEnv: [],
      suggestArr: [],
      suggetSate: '',
      btnIcon: ''
    },
    fileIO: {
      isStackFinish: false,
      data: {},
      stackTraceMap: {}
    },
    socketIO: {
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
      suggestArr: [],
      suggetSate: '',
      btnIcon: ''
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
      native: {}
    },
    leak: {
      isFinish: false,
      referPool: [],
      stackPool: [],
      oldSample: [],
      finishReport: false,
      suggestArr: [],
      suggetSate: '',
      btnIcon: ''
    }
  };
  public dataSave = {
    toolTipDate: ''
  };
  constructor() { }
}
