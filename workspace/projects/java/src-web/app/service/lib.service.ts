import { Injectable } from '@angular/core';
import { I18nService } from '../service/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class LibService {

  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public hoverIcon: any = '';
  private KIB = 1024;
  private MIB = this.KIB * 1024;
  private GIB = this.MIB * 1024;
  private TIB = this.GIB * 1024;
  private US = 1;
  private MS = this.US * 1000;
  private SEC = this.MS * 1000;
  public getSnapTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const months = month < 10 ? `0${month}` : month;
    const dates = day < 10 ? `0${day}` : day;
    const hours = hour < 10 ? `0${hour}` : hour;
    const minutes = minute < 10 ? `0${minute}` : minute;
    const seconds = second < 10 ? `0${second}` : second;
    return `${year}/${months}/${dates} ${hours}:${minutes}:${seconds}`;
  }
  /**
   * 图标hover状态处理
   */
  public onHoverIcon(label?: any) {
    this.hoverIcon = label;
  }
  public changeColor(id: string, color: any) {
    const svgElement: any = document.getElementById(id);
    const doc = svgElement.getSVGDocument();
    const rect = doc.querySelector('#use_svg');
    rect.getAttribute('stroke') ? rect.setAttribute('stroke', color) : rect.setAttribute('fill', color);
  }
  /**
   * 获取len长度的随机数
   * @param len 随机数长度
   */
  public generateConversationId(len: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
      ''
    );
    const uuid = [];
    let i: number;
    const radix = chars.length;
    if (len) {
      for (i = 0; i < len; i++) {
        uuid[i] = chars[Math.floor(Math.random() * radix)];
      }
    } else {
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      let r: number;
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = Math.floor(Math.random() * 16);
          uuid[i] = chars[i === 19 ? Math.floor(Math.random() * 4) + 8 : r];
        }
      }
    }
    return uuid.join('');
  }
  // 字节单位转换
  public onChangeUnit(num: number, int?: boolean) {
    let bytes: any;
    let numAbs = 0;
    numAbs = Math.abs(num);
    switch (true) {
      case numAbs < this.KIB:
        bytes = int ? this.setThousandSeparator(this.ceilNumber(num)) + ' B'
          : this.setThousandSeparator(num.toFixed(2)) + ' B';
        break;
      case numAbs < this.MIB:
        bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.KIB)) + ' KiB'
          : this.setThousandSeparator((num / this.KIB).toFixed(2)) + ' KiB';
        break;
      case numAbs < this.GIB:
        bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.MIB)) + ' MiB'
          : this.setThousandSeparator((num / this.MIB).toFixed(2)) + ' MiB';
        break;
      case numAbs < this.TIB:
        bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.GIB)) + ' GiB'
          : this.setThousandSeparator((num / this.GIB).toFixed(2)) + ' GiB';
        break;
      default:
        bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.TIB)) + ' TiB'
          : this.setThousandSeparator((num / this.TIB).toFixed(2)) + ' TiB';
        break;
    }
    return bytes;
  }
  /**
   * 向上取整十位
   * @param number 取整参数
   */
  public ceilNumber(num: number) {
    num = Math.floor(num);
    const bite = Math.pow(10, String(num).length - 1 || 1);
    return Math.ceil(num / bite) * bite;
  }

  /**
   * 日期格式化函数
   * @param date 被格式化日期
   * @param fmt 格式化日期的格式
   */
  public dateFormat(date: string | number | Date, fmt: string) {
    const getDate = new Date(date);
    const o: any = {
      'M+': getDate.getMonth() + 1,
      'd+': getDate.getDate(),
      'h+': getDate.getHours(),
      'm+': getDate.getMinutes(),
      's+': getDate.getSeconds(),
      'q+': Math.floor((getDate.getMonth() + 3) / 3),
      S: getDate.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substring(4 - RegExp.$1.length));
    }
    for (const k of Object.keys(o)) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substring(('' + o[k]).length)));
      }
    }
    return fmt;
  }
  /**
   * 获取固定的X轴时间
   * @param timeLength 秒数
   * @param timeLength 时间戳
   */
  public getXAxisTime(timeLength: string | number | Date) {
    if (timeLength < 10000) {
      const timeData = [];
      let start = +new Date(new Date().setHours(0, 0, 0, 0));
      for (let i = 0; i < timeLength; i++) {
        const data = new Date(start);
        const h = data.getHours();
        const m = data.getMinutes();
        const s = data.getSeconds() < 10 ? '0' + data.getSeconds() : data.getSeconds();
        const S = data.getMilliseconds() / 100;
        timeData.push(`${m}:${s}`);
        start += 1000;
      }
      return timeData;
    } else {
      const data = new Date(timeLength);
      const h = data.getHours();
      const m = data.getMinutes();
      const s = data.getSeconds() < 10 ? '0' + data.getSeconds() : data.getSeconds();
      const S = data.getMilliseconds() / 100;
      return `${m}:${s}`;
    }
  }
  /**
   * 将秒转化为时分秒
   * @param timeLength 秒数
   */
  public secondToHMS(value: string | number | Date) {
    const strSecond = String(value);
    let theTime = parseInt(strSecond, 10); // 秒
    let middle = 0; // 分
    let hour = 0; // 小时

    if (theTime > 60) {
      middle = parseInt(String(theTime / 60), 10);
      theTime = parseInt(String(theTime % 60), 10);
      if (middle > 60) {
        hour = parseInt(String(middle / 60), 10);
        middle = parseInt(String(middle % 60), 10);
      }
    }
    let result = '' + parseInt(String(theTime), 10) + this.i18n.common_time_second;
    if (middle > 0) {
      result = '' + parseInt(String(middle), 10) + this.i18n.common_time_min + result;
    }
    if (hour > 0) {
      result = '' + parseInt(String(hour), 10) + this.i18n.common_time_hour + result;
    }
    return result;
  }
  /**
   * 将时间转化为时分秒毫秒
   * @param isLessSec 传入的时间参数是否小于单位秒
   * @param timeLength 秒数
   */
  public timeAutoChange(timeValue: any, isLessSec?: boolean): any {
    let timeStr = '';
    let tempms = '';
    let tempSec = 0;
    if (isLessSec) { // 小于秒的单位
      tempms = (timeValue % 1000).toFixed(2) + ' ms ';
      tempSec = Math.floor(timeValue / 1000);
      timeValue = tempSec;
    }
    const hour = Math.floor(timeValue / 3600);
    const min = Math.floor(timeValue / 60) % 60;
    const sec = Number((timeValue % 60).toFixed(2));
    if (hour >= 1) {
      timeStr = hour + ' hour ';
    }
    if (min >= 1) {
      timeStr += min + ' min ';
    }
    if (sec >= 1) {
      timeStr += sec + ' sec ';
    } else {
      timeStr = !isLessSec ? sec + ' sec ' : '';
    }
    const tempTime = isLessSec ? timeStr + tempms : timeStr;
    return tempTime;
  }
  /**
   * 添加千位分隔符
   * @param value （有符号）整形、（有符号）浮点型的数字字符（可以带单位），如：'123324', '123324.12312', '-123324','123324ms', ...
   */
  public setThousandSeparator(value: string | number): string {
    function numFormat(numStr: string): string {
      const res = numStr.replace(/\d+/, (n) => { // 先提取整数部分
        return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
          return $1 + ',';
        });
      });
      return res;
    }
    if (Array.isArray(value) && value.length === 1) {
      value = value[0];
    }
    if (typeof (value) === 'number' || typeof (value) === 'string') {
      return numFormat(value.toString());
    } else {
      return value;
    }
  }
}
export class KeyFunction {
  private nodesIndex: any = null;
  private stackTreeNodes: string;
  private stackTreeAll: string;
  public isRight = false;
  constructor(treeClass?: any) {
    this.stackTreeNodes = treeClass ? `${treeClass} .ti3-tree-content-box:visible` : '.ti3-tree-content-box:visible';
    this.stackTreeAll = treeClass ? `${treeClass} .ti3-tree-content-box` : '.ti3-tree-content-box';
  }
  /**
   * 监听键盘事件，上下左右
   */
  public keybordFun() {
    this.getCurrentNodeIndex();
    document.onkeydown = (key: any) => {
      switch (key.keyCode) {
        case 38:
          this.keyUp();
          break;
        case 40:
          this.keyDown();
          break;
        case 37:
          this.keyLeft();
          break;
        case 39:
          this.keyRight();
          break;
        default:
          break;
      }
      return false;
    };
  }
  /**
   * 键盘上键事件
   */
  private keyUp() {
    const stackTreeNodes = $(this.stackTreeNodes);
    const hasActiveClass = this.hasActiveClass(stackTreeNodes);
    if (this.nodesIndex === null || this.nodesIndex === 0 || !hasActiveClass) { return; }
    stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
    this.nodesIndex--;
    stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
    if (this.isRight) {
      $('#stackDataRight').scrollTop($('#nodeData').height() * this.nodesIndex);
    } else {
      $('#stackData').scrollTop($('#nodeData').height() * this.nodesIndex -
        $('#stackData').height() + $('#nodeData').height() * 3);
    }
  }
  /**
   * 键盘下键事件
   */
  private keyDown() {
    const stackTreeNodes = $(this.stackTreeNodes);
    const hasActiveClass = this.hasActiveClass(stackTreeNodes);
    if (this.nodesIndex === null || this.nodesIndex >= stackTreeNodes.length - 1 || !hasActiveClass) { return; }
    stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
    this.nodesIndex++;
    stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
    if (this.isRight) {
      $('#stackDataRight').scrollTop($('#nodeData').height() * this.nodesIndex);
    } else {
      $('#stackData').scrollTop($('#nodeData').height() * this.nodesIndex -
        $('#stackData').height() + $('#nodeData').height() * 3);
    }
  }
  /**
   * 键盘右键事件，获取子节点，focus到子级第一个节点
   */
  private keyRight() {
    const stackTreeNodes = $(this.stackTreeNodes);
    const currentNodeChildren = stackTreeNodes.eq(this.nodesIndex).children();
    const childIClassName = currentNodeChildren.eq(1).attr('class');
    const hasActiveClass = this.hasActiveClass(stackTreeNodes);
    if (this.nodesIndex === null || !hasActiveClass) { return; }
    if (childIClassName.indexOf('ti3-icon-plus-square') > 0) {
      currentNodeChildren.eq(1).trigger('click');
    } else if (childIClassName.indexOf('ti3-icon-minus-square') > 0) {
      this.keyDown();
    } else {
      return;
    }
  }
  /**
   * 键盘左键事件，折叠子节点，focus到父级节点
   */
  private keyLeft() {
    const stackTreeNodes = $(this.stackTreeNodes);
    const currentNodeChildren = stackTreeNodes.eq(this.nodesIndex).children();
    const childIClassName = currentNodeChildren.eq(1).attr('class');
    const hasActiveClass = this.hasActiveClass(stackTreeNodes);
    if (this.nodesIndex === null || !hasActiveClass) { return; }
    if (childIClassName.indexOf('ti3-icon-minus-square') > 0) {
      currentNodeChildren.eq(1).trigger('click');
    } else {
      const rootNode = stackTreeNodes.eq(this.nodesIndex).parent().parent();
      const rootName = rootNode.attr('class');
      if (rootName.indexOf('ti3-tree-container') > 0) { return; }
      this.getParentNodeIndex(rootNode.siblings()[0]);
      if (this.isRight) {
        $('#stackDataRight').scrollTop($('#nodeData').height() * this.nodesIndex);
      } else {
        $('#stackData').scrollTop($('#nodeData').height() * this.nodesIndex -
          $('#stackData').height() + $('#nodeData').height() * 3);
      }
    }
  }
  /**
   * focus到父级节点
   * @param node 父级节点
   */
  private getParentNodeIndex(node: any) {
    let parentIndex = null;
    const stackTreeNodes = $(this.stackTreeNodes);
    stackTreeNodes.each((index, el) => {
      if (el.isEqualNode(node)) {
        parentIndex = index;
        return;
      }
    });
    if (parentIndex === null) { return; }
    stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
    this.nodesIndex = parentIndex;
    stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
  }
  /**
   * 获取鼠标点击了某个节点
   */
  private getCurrentNodeIndex() {
    const that = this;
    const oldIndex = this.nodesIndex;
    const stackTreeNodes = $(this.stackTreeNodes);
    const stackTreeAll = $(this.stackTreeAll);
    stackTreeNodes.eq(this.nodesIndex).attr('id', 'nodeData');
    if (this.stackTreeNodes.indexOf('.end-tree') >= 0) {
      this.isRight = true;
    }
    if (oldIndex !== null) {
      stackTreeAll.eq(oldIndex).removeClass('ti3-tree-item-active');
    }
    stackTreeNodes.each((index, el) => {
      if (el.className.indexOf('ti3-tree-item-active') >= 0) {
        that.nodesIndex = index;
        return;
      }
    });
    if (oldIndex !== null && that.nodesIndex !== null) {
      stackTreeAll.eq(oldIndex).removeClass('ti3-tree-item-active');
      stackTreeNodes.eq(that.nodesIndex).addClass('ti3-tree-item-active');
    }
  }
  /**
   * 判断当前节点是否含有选中的节点
   * @param stackTreeNodes 当前节点
   */
  private hasActiveClass(stackTreeNodes: any): boolean {
    return this.nodesIndex !== null ? stackTreeNodes.eq(this.nodesIndex).hasClass('ti3-tree-item-active') : false;
  }
  /**
   * 移除键盘监听事件
   */
  public movekeybordFun() {
    document.onkeydown = undefined;
  }
}
/**
 * 处理profile数据限定
 */
interface Buffer {
  startTime: string;
  currentTime: string;
  data: object;
}

export const disableCtrlZ = (event: any): any => {
  if (event.ctrlKey && event.keyCode === 90) {
    return false;
  }
};
