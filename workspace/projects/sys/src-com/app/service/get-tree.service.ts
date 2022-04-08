import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetTreeService {
  public createLinkageTask = new Subject<any>();
  public linkageTaskInfo = new Subject<any>();
  public sceneInfo: any;
  constructor() { }
}
