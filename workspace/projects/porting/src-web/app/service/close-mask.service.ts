import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloseMaskService {

  constructor() { }

  sub = new Subject<any>();
}
