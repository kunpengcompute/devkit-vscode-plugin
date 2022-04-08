
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ListInfoService {

    constructor() { }
    private sub = new Subject<any>();

    /**
     * 消息发送
     * @param type 消息类型
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
