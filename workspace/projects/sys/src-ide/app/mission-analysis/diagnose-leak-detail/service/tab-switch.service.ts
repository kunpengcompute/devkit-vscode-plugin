import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MemLeakFuncListComponent } from '../component/mem-leak-func-list/mem-leak-func-list.component';

@Injectable({
  providedIn: 'root'
})
export class TabSwitchService<T> {

  public switchTab = new Subject<{
    tab: string,
    params?: T,
    [other: string]: any
  }>();

  public showSourceSlider = new Subject<T>();

  public memLeakFuncListStatus: MemLeakFuncListComponent;

}
