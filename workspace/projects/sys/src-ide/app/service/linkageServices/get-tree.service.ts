import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetTreeService {
  public projectTree: any;
  public createLinkageTask = new Subject<any>();
  public linkageTaskInfo = new Subject<any>();
  constructor() { }
}
