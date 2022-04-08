import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeNewService {

  private subject = new Subject<any>();
  // Observable的每个订阅者之间，读取的发布数据是相对各自独立的。
  // Subject的订阅者之间，是共享一个发布数据的。
  // /**
  // *content 模块里进行信息传输,类似广播@param type 发送的信息类型
  // * 1-你的信息1
  // * 2-你的信息2
  // * 3-你的信息3
  // */

  sendMessage(type: any) {
      this.subject.next(type);
  }

  // 清理信息:
  clearMessage() {
      this.subject.next();
  }

  // 获取信息,@returns { Observable<any> } 返回消息监听
  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }

}
