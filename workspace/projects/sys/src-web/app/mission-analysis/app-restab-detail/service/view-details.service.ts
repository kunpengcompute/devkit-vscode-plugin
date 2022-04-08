import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewDetailsService {
  public subject = new Subject<any>();
  constructor() { }
}
