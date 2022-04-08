import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScheduleUpdateService {

    constructor() { }
    private sub = new Subject<any>();

    /**
     * 发送消息
     */
    sendMessage(type: any) {
        this.sub.next(type);
    }

    /**
     * 获取消息
     */
    getMessage(): Observable<any> {
        return this.sub.asObservable();
    }
}
