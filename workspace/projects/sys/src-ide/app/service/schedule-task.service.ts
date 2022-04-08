import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScheduleTaskService {
    // 订阅的属性：用来给订阅方存储数据
    public taskId = new BehaviorSubject<number>(-1);
    public projectId = new BehaviorSubject<number>(-1);
    public preTaskLength = new BehaviorSubject<number>(0);
    constructor() { }

    // 订阅的方法：用来接收发布方的数据

    /**
     * 任务ID处理
     */
    handleTaskId(id: number): void {
        this.taskId.next(id);
    }

    /**
     * 工程ID处理
     */
    handleProjectId(id: number): void {
        this.projectId.next(id);
    }

    /**
     * 任务列表长度
     */
    handleTaskLength(id: number): void {
        this.preTaskLength.next(id);
    }
}
