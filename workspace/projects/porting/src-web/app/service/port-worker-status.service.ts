import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PortWorkerStatusService {

    // 任务分析状态
    public progressWaitWorkerStatus = '0x010a00';  // 无可用worker资源,任务等待中
    public progressWaitWorkerTimeoutStatus = '0x010a11';  // 任务等待worker超时

    // 创建任务的状态
    public createTaskLackWorkerStatus = '0x010a01';  // worker为1~3
    public createTaskNoWorkerStatus = '0x010a10';  // worker 为0

    // 缓存行对齐检查
    cachecheckTaskScanSuccess = '0x0d0c00';
    cachecheckTaskRunning = '0x0d0c01';
    cachecheckTaskNoPorted = '0x0d0c02';
    cachecheckTaskNotExist = '0x0d0c11';
    cachecheckTaskScanFail = '0x0d0c12';

    // 源码迁移创建任务状态
    public workerStatusCode: string = localStorage.getItem('workerStatusCode') || '';

    // 64位运行模式检查创建任务状态
    public workerStatusPre: string = localStorage.getItem('workerStatusPre') || '';

    // cacheline检查创建任务状态
    public workerStatusCache: string = localStorage.getItem('workerStatusCache') || '';

    // 结构体字节对齐检查创建任务状态
    public workerStatusByte: string =  localStorage.getItem('workerStatusByte') || '';

    // 弱内存序源码迁移创建任务状态
    public workerStatusWeak: string =  localStorage.getItem('workerStatusWeak') || '';

    constructor() {}
}
