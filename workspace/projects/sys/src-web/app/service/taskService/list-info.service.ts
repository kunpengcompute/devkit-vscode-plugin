
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListInfoService {

  constructor() { }
  private sub = new Subject<any>();
  sendMessage(type: any) {
    this.sub.next(type);
}
  getMessage(): Observable<any> {
    return this.sub.asObservable();
}
}
