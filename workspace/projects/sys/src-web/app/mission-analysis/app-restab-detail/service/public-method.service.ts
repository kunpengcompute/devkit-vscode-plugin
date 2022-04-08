import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PublicMethodService {

  constructor() { }

  /**
   * 转换-1、:-1使用[unknown]来显示
   * @param label label
   */
  public transformLabel(label: any) {
    if ([-1, '-1', ':-1'].includes(label)) { return '[unknown]'; }
    if (['-1/:-1', '-1/-1', ':-1/:-1', ':-1/-1'].includes(label)) { return '[unknown]/[unknown]'; }
    return label;
  }

  /**
   * 转换 asc | desc | 'none' 为 true | false | null
   * @param sortStatus 任务id
   */
  public calcSortStatus(sortStatus: any) {
    return sortStatus === 'asc' ? true : sortStatus === 'desc' ? false : null;
  }
}
