import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class RegService {

  constructor() { }

  /**
   * 编译命令正则匹配
   * @param value 匹配内容
   */
  public commandReg(value: string): boolean {
    const reg = new RegExp(/^\s*\bc?make\b\s*/);
    const regGo = new RegExp(/^\s*\bgo\b\s*/);
    return reg.test(value) || regGo.test(value);
  }

  /**
   * 匹配模式，根据匹配模式匹配字符串
   * @param value 任意字符串
   * @param pattern 任意匹配模式
   */
  public commonReg(value: string, pattern: any): boolean {
    const reg = new RegExp(pattern);
    return reg.test(value);
  }
}
