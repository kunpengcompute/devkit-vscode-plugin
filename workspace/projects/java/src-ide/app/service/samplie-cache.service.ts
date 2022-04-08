import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SamplieDownloadService {

    public downloadItems = {
        env: {
            isFinish: false,
            cpuInofo: [] as any[],
            sysEnv: [] as any[],
            suggestArr: [] as any[]
        },
        fileIO: {
            isFileFinish: false,
            isStackFinish: false,
            data: [] as any[],
            stackTraceMap: {}
        },
        socketIO: {
            isFileFinish: false,
            isStackFinish: false,
            data: [] as any[],
            stackTraceMap: {}
        },
        object: {
            isFileFinish: false,
            isStackFinish: false,
            data: [] as any[],
            stackTraceMap: {}
        },
        gc: {
            isFinish: false,
            baseConfig: [] as any[],
            heapConfig: [] as any[],
            youngGenConfig: [] as any[],
            survivorConfig: [] as any[],
            tlabConfig: [] as any[],
            activity: [] as any[],
            activeData: {},
            timeData: [] as any[],
            suggestArr: [] as any[]
        },
        thread: {
            isFinish: false,
            data: [] as any[]
        },
        lock: {
            isFinish: false,
            data: [] as any[],
            instances: [] as any[],
            lockThread: [] as any[],
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
            referPool: [] as any[],
            stackPool: [] as any[],
            oldSample: [] as any[],
            finishReport: false,
            suggestArr: [] as any[],
            suggetSate: ''
        }
    };
    public dataSave = {
    };
    constructor() { }
}
