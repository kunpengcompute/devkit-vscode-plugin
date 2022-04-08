import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ConnectLegendsService {
  private subject = new Subject<any>();
  constructor() { }
  sendMessage(type: any) {
    this.subject.next(type);
}
  getMessage(): Observable<any> {
    return this.subject.asObservable();
}
}
