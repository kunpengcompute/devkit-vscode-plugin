import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {

    // 开启，关闭
    public isOpen = new BehaviorSubject<string>('');
    // 传递节点名
    public nodeTitle = new BehaviorSubject<string>('');
    // 承接数据
    public params = new BehaviorSubject<object>({});
    // 返回数据
    public formData = new BehaviorSubject<object>({});

    // 控制是否显示配置节点参数
    public nodeList = new BehaviorSubject<boolean>(false);

    /**
     * 控制开关
     */
    handleOpen(taskName: string): void {
        this.isOpen.next(taskName);
    }

    /**
     * 开关关闭
     */
    handleClose(): void {
        this.isOpen.next('');
    }


    /**
     * 节点名处理
     */
    handleNodeName(params: string): void {
        if (params) {
            this.nodeTitle.next(params);
        }
    }

    /**
     * 任务参数处理
     */
    handleTaskParams(params: object): void {
        if (Object.keys(params).length !== 0) {
            this.params.next(params);
        }
    }

    /**
     * 传递数据
     */
    handleBackParams(params: object): void {
        if (Object.keys(params).length !== 0) {
            this.formData.next(params);
        }
    }

    /**
     * 节点可见
     */
    handleVisiableNode(show: boolean) {
        this.nodeList.next(show);
    }
}
