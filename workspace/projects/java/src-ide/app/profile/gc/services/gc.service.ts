import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MessageService } from '../../../service/message.service';
import { StompService } from '../../../service/stomp.service';

@Injectable({
    providedIn: 'root'
})
export class GcService {
    private subject = new Subject<any>();

    constructor(
        private stompService: StompService,
        private msgService: MessageService,
    ) { }

    /**
     * 发送消息-实时获取值
     */
    sendMessage() {
        this.stompService.gcState = this.msgService.getMessage().subscribe((msg) => {
            this.subject.next(msg);
        });
    }

    /**
     * 接收消息-获取值
     */
    getMessage() {
        return this.subject.asObservable();
    }
}
