import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleUpdateService {

  constructor() { }
  private sub = new Subject<any>();
  sendMessage(type: any) {
    this.sub.next(type);
}
  getMessage(): Observable<any> {
    return this.sub.asObservable();
}
}
