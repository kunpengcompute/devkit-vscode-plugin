import { Component, OnInit, Input, OnChanges, SimpleChanges, SecurityContext,
  NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
import { LibService } from 'projects/java/src-com/app/service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
const hardUrl: any = require('projects/java/src-com/assets/hard-coding/url.json');

@Component({
  selector: 'app-lock-graph',
  templateUrl: './lock-graph.component.html',
  styleUrls: ['./lock-graph.component.scss']
})
export class LockGraphComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() threadTime: string;
  @Input() isCompare: boolean;
  @Input() isObersver: boolean;
  constructor(
    public i18nService: CommonI18nService,
    private libService: LibService,
    public changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public graphData1: any = {
    threadData: [],
    addressData: []
  };
  public i18n: any;
  public currentType = 'lock';
  public currentHoverThread = '';
  public deadLockCount = 0;
  public deadLockThread: any = [];
  public deadLockAddress: any = [];
  public fondDeadLock = '';
  private relineTimer: any;
  private initTopTimer: any;
  private lastAddressId = '';
  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.isObersver && changes.isObersver.currentValue) {
      this.handleClearLine();
    }
    if (changes.isObersver && !changes.isObersver.currentValue) {
      this.handleClearLine();
      this.handleLineDraw();
      this.handleClearIsActive();
    }
    if (this.isObersver && changes.isCompare) {
      setTimeout(() => {
        this.handleClearLine();
        this.handleRelineDraw();
      }, 0);
    }
    this.updateWebViewPage();
  }
  // 画线
  public handleLineDraw() {
    this.graphData1.threadData.forEach((threadInfo: any) => {
      if (threadInfo.waitObj.length > 0) {
        threadInfo.waitObj.forEach((waitObj: any) => {
          const address = waitObj.split('_');
          const isLocked = address.length > 1;
          this.lineLink(`#${this.name}${threadInfo.id}`, `#${this.name}${address[0]}`, threadInfo.status, isLocked);
        });
      }
    });
    this.updateWebViewPage();
  }
  // 清空亮起的数据
  public handleClearIsActive() {
    this.graphData1.threadData.forEach((threadInfo: any) => {
      if (threadInfo.isActive) {
        threadInfo.isActive = false;
      }
    });
    this.graphData1.addressData.forEach((address: any) => {
      if (address.isActive) {
        address.isActive = false;
        address.activeCount = 0;
      }
    });
  }
  // 获取对应的元素
  public lineLink(id1: any, id2: any, status: any, locked?: any) {
    const divA = document.querySelector(id1);
    const divB = document.querySelector(id2);
    this.drawConnector(divA, divB, status, locked);
    this.updateWebViewPage();
  }
  // 原始连线
  public drawConnector(leftDiv: any, rightDiv: any, status: any, locked?: any) {
    const lineAttrList: any = {
      RUNNABLE: {
        gbox: 'green',
        lineColor: '#7ADFA0'
      },
      WAITING: {
        gbox: 'yellow',
        lineColor: '#ECE85F'
      },
      TIMED_WAITING: {
        gbox: 'orange',
        lineColor: '#E89954'
      },
      BLOCKED: {
        gbox: 'red',
        lineColor: '#F45C5E'
      }
    };
    const gId = 'g-box-' + lineAttrList[status].gbox + this.name;
    const leftTop = leftDiv.parentNode.offsetTop;
    const leftLeft = leftDiv.parentNode.offsetLeft;
    const rightTop = rightDiv.parentNode.offsetTop;
    const rightLeft = rightDiv.parentNode.offsetLeft;
    const h20 = leftLeft < rightLeft ? 'h20' : 'h-20';
    const plus20 = leftLeft < rightLeft ? 20 : -20;
    let posnALeft: any = { x: null, y: null };
    let posnBLeft: any = { x: null, y: null };
    if (leftLeft < rightLeft) {
      posnALeft = {
        x: leftDiv.offsetLeft + leftLeft + leftDiv.offsetWidth - 2,
        y: leftDiv.offsetTop + leftTop + leftDiv.offsetHeight / 2
      };
      posnBLeft = {
        x: rightDiv.offsetLeft + rightLeft - 8,
        y: rightDiv.offsetTop + rightTop + rightDiv.offsetHeight / 2
      };
    } else {
      posnALeft = {
        x: leftDiv.offsetLeft + leftLeft,
        y: leftDiv.offsetTop + leftTop + leftDiv.offsetHeight / 2
      };
      posnBLeft = {
        x: rightDiv.offsetLeft + rightLeft + rightDiv.offsetWidth + 8,
        y: rightDiv.offsetTop + rightTop + rightDiv.offsetHeight / 2
      };
    }
    const dStrLeft =
      'M' +
      posnALeft.x +
      ',' +
      posnALeft.y +
      h20 +
      'Q' +
      (posnALeft.x + plus20) +
      ',' +
      posnALeft.y +
      ' ' +
      (posnBLeft.x - plus20) +
      ',' +
      posnBLeft.y +
      h20;
    const p = document.createElementNS(hardUrl.w3cUrl, 'path');
    p.setAttribute('d', dStrLeft);
    if (!locked) {
      p.setAttribute('stroke-dasharray', '5,5');
    }
    const doc: any = document;
    doc.getElementById(gId).attributes.stroke.value = lineAttrList[status].lineColor;
    // ie 不支持 append
    document.getElementById(gId).appendChild(p);
    this.updateWebViewPage();
  }
  // 处理新数据
  public handleFileNewData(file: any) {
    this.graphData1.threadData = [];
    this.graphData1.addressData = [];
    this.deadLockCount = file.deadlockNum;
    this.fondDeadLock = this.i18nService.I18nReplace(this.i18n.newLockGraph.threadExistDeadLock,
      { 0: this.deadLockCount });
    this.handleDeadLockList(file);
    this.handleClearLine();
    const data = file.files;
    const statusList = ['RUNNABLE', 'WAITING', 'TIMED_WAITING', 'BLOCKED'];
    const relationIdReg = /<\w+>\s+(.*)\s?/g;
    data.forEach((item: any, index: any) => {
      if (item.type) {
        return;
      }
      const thread: any = {
        threadName: item.fileName,
        status: '',
        isActive: false,
        threadTip: '',
        threadExistDeadLock: false,
        id: this.libService.generateConversationId(8),
        waitObj: []
      };
      const waitObj: any = [];
      statusList.forEach(status => {
        if (item.content.indexOf(status) > -1) {
          thread.status = status;
        }
      });
      const lines = item.content.split('\n\t');
      thread.threadTip = `${thread.threadName}:<pre>${this.domSanitizer.sanitize(SecurityContext.HTML,
        this.handleThreadTip(lines))}</pre>`;
      lines.forEach((line: any) => {
        const target = line.match(relationIdReg);
        if (target) {
          const targetList = target[0].split(' ');
          this.handleIsThreadExistAddress(thread, targetList, line);
          this.handleIsExistLockAddress(waitObj, targetList, thread);
        }
      });
      this.handleThreadLoction(thread);
      this.handleLockLoction(waitObj);
    });
    this.handleNoLinkThread();
    if (!this.isObersver) {
      setTimeout(() => {
        this.handleLineDraw();
      }, 250);
    } else {
      this.handleClearLine();
    }
  }
  public handleNoLinkThread() {
    let allData: any = [];
    const noLinkData: any = [];
    const linkData: any = [];
    this.graphData1.threadData.forEach((item: any, index: any) => {
      if (item.waitObj.length === 0) {
        noLinkData.push(item);
      } else {
        linkData.push(item);
      }
    });
    allData = allData.concat(linkData, noLinkData);
    this.graphData1.threadData = allData;
    this.updateWebViewPage();
  }
  public handleThreadLoction(thread: any) {
    // 当线程为死锁线程时，顶部插入
    const flag = this.deadLockThread.indexOf(thread.threadName) > -1;
    if (flag) {
      this.graphData1.threadData.unshift(thread);
    } else {
      this.graphData1.threadData.push(thread);
    }
  }
  public handleLockLoction(waitObj: any) {
    waitObj.forEach((item: any) => {
      let flag = false;
      this.graphData1.addressData.forEach((addr: any) => {
        if (addr.waitObjAddr === item.waitObjAddr) {
          flag = true;
          addr.maxActive++;
        }
      });
      if (!flag) {
        if (this.deadLockAddress.indexOf(item.waitObjAddr) > -1) {
          this.graphData1.addressData.unshift(item);
        } else {
          this.graphData1.addressData.push(item);
        }
      }
    });
  }
  public handleDeadLockList(file: any) {
    if (this.deadLockCount > 0) {
      file.files.forEach((item: any, i: any) => {
        if (item.type && item.type === 'deadLockThread') {
          this.deadLockThread.push(item.name);
        }
      });
    }
    this.updateWebViewPage();
  }
  // 判断锁是否存在
  public handleIsThreadExistAddress(thread: any, targetList: any, line: any) {
    let isWaitObj = false;
    thread.threadExistDeadLock = this.deadLockThread.indexOf(thread.threadName) > -1;
    const linkAddr = targetList[0].slice(1, -1);
    thread.waitObj.forEach((item: any) => {
      if (item.indexOf(linkAddr) > -1) {
        isWaitObj = true;
      }
    });
    if (!isWaitObj) {
      if (thread.threadExistDeadLock && this.deadLockAddress.indexOf(linkAddr) === -1) {
        this.deadLockAddress.push(`<${linkAddr}>`);
      }
      const isLocked = line.indexOf('- locked') > -1 ? '_locked' : '';
      thread.waitObj.push(linkAddr + isLocked);
    }
  }
  public handleIsExistLockAddress(waitObj: any, targetList: any, thread: any) {
    let waitObjFlag = false;
    waitObj.forEach((item: any) => {
      if (item.waitObjAddr === targetList[0]) {
        waitObjFlag = true;
      }
    });
    if (!waitObjFlag) {
      const waitobjNode = {
        waitObjShortName: '',
        waitObjName: thread.status !== 'BLOCKED' ? targetList[2].slice(0, -1) :
        targetList[targetList.length - 1].slice(0, -1),
        waitObjAddr: targetList[0],
        id: targetList[0].slice(1, -1),
        isActive: false,
        activeCount: 0,
        maxActive: 1
      };
      const lastName = waitobjNode.waitObjName.split('.');
      waitobjNode.waitObjShortName = lastName[lastName.length - 1];
      waitObj.push(waitobjNode);
    }
  }
  // 判断提示信息nid的位置
  public handleThreadTip(lines: any) {
    const tips = lines[0].split(' ');
    let tipIndex: any = null;
    tips.forEach((item: any, i: any) => {
      if (item.indexOf('nid') > -1) {
        tipIndex = i;
      }
    });
    return tips.slice(0, tipIndex + 1).join(' ');
  }

  // 线程显示背景颜色
  public handleThreadStatus(status: any) {
    let bgc = '';
    switch (status) {
      case 'RUNNABLE':
        bgc = 'green';
        break;
      case 'TIMED_WAITING':
        bgc = 'orange';
        break;
      case 'BLOCKED':
        bgc = 'red';
        break;
      case 'WAITING':
        bgc = 'yellow';
        break;
      default:
        break;
    }
    return bgc;
  }
  // 添加透明度
  public handleTheadOpacity(isActive: any) {
    if (this.isObersver && !(this.isObersver && isActive)) {
      return 'obersverOpacity';
    } else {
      return '';
    }
  }
  // 切换线程或锁
  public currentTypeChange(type: any) {
    this.currentType = type;
    setTimeout(() => {
      this.handleRelineDraw();
    }, 0);
  }
  // 切换线程或者锁的时候重新连接已经点击的连线
  public handleRelineDraw() {
    this.graphData1.threadData.forEach((threadInfo: any) => {
      if (threadInfo.waitObj.length > 0 && threadInfo.isActive) {
        threadInfo.waitObj.forEach((waitObj: any, index: any) => {
          this.handleLineAndAddrVisibale(threadInfo, waitObj, 0);
        });
      }
    });
  }
  // 删除所有连线
  public handleClearLine() {
    const lineId = ['g-box-green', 'g-box-red', 'g-box-yellow', 'g-box-orange'];
    for (const id of lineId) {
      const gbox = id + this.name;
      const g = document.getElementById(gbox);
      let child: any;
      if (g) {
        child = g.firstElementChild;
      }
      while (child) {
        g.removeChild(child);
        child = g.firstElementChild;
      }
    }
  }
  // 点击左侧线程，连接对应锁，如果不是观察模式不可点击
  public handleThreadClick(index: any, fromAddr?: any, address?: any) {
    if (!this.isObersver) {
      return;
    }
    const threadInfo = this.graphData1.threadData[index];
    if (fromAddr && threadInfo.isActive) {
      return;
    }
    if (!threadInfo.isActive) {
      this.threadFocus(threadInfo, true);
    }
    threadInfo.isActive = !threadInfo.isActive;
    if (threadInfo.waitObj.length > 0) {
      threadInfo.waitObj.forEach((waitObj: any) => {
        this.handleAddressMove(waitObj, threadInfo.isActive);
        this.handleLineAndAddrVisibale(threadInfo, waitObj, threadInfo.isActive ? 1 : -1);
      });
    }
  }
  /**
   * 锁的移动
   * @param waitObj 锁信息
   */
  private handleAddressMove(waitObj: any, isActive: any) {
    const address = waitObj.split('_');
    if (!isActive || this.lastAddressId[0] === address[0]) { return; }
    this.lastAddressId = address;
    const addrInfo = this.graphData1.addressData.find((item: any) => {
      return address[0] === item.id;
    });
    if (addrInfo.activeCount !== addrInfo.maxActive) {
      this.threadFocus(addrInfo, false);
    }
  }
  // 判断是连线还是删除连线
  public handleLineAndAddrVisibale(threadInfo: any, waitObj: any, count: any) {
    const address = waitObj.split('_');
    const isLocked = address.length > 1;
    this.handleAttrDataVisiable(address[0], count);
    return count >= 0
      ? this.lineLink(`#${this.name}${threadInfo.id}`, `#${this.name}${address[0]}`, threadInfo.status, isLocked)
      : this.handleThreadDelete(`#${this.name}${threadInfo.id}`, `#${this.name}${address[0]}`, threadInfo.status);
  }
  // 删除指定连线
  public handleThreadDelete(id1: any, id2: any, status: any) {
    const divA = document.querySelector(id1);
    const divB = document.querySelector(id2);
    const pathAttr = this.getThreadLineAttr(divA, divB, status);
    const gBox = document.getElementById(pathAttr.gId);
    const gBoxChildList = gBox.childNodes;
    const dStrLeft = pathAttr.dStrLeft
      .split(' ')
      .join('')
      .replace(/,/g, '');
    gBoxChildList.forEach((path: any) => {
      const nodeValue = path.attributes.d.nodeValue
        .split(' ')
        .join('')
        .replace(/,/g, '');
      if (nodeValue === dStrLeft) {
        gBox.removeChild(path);
      }
    });
  }
  // 获取连线属性
  public getThreadLineAttr(leftDiv: any, rightDiv: any, status: any) {
    const lineAttrList: any = {
      RUNNABLE: {
        gbox: 'green',
        lineColor: '#7ADFA0'
      },
      WAITING: {
        gbox: 'yellow',
        lineColor: '#ECE85F'
      },
      TIMED_WAITING: {
        gbox: 'orange',
        lineColor: '#E89954'
      },
      BLOCKED: {
        gbox: 'red',
        lineColor: '#F45C5E'
      }
    };
    const gId = 'g-box-' + lineAttrList[status].gbox + this.name;
    const leftTop = leftDiv.parentNode.offsetTop;
    const leftLeft = leftDiv.parentNode.offsetLeft;
    const rightTop = rightDiv.parentNode.offsetTop;
    const rightLeft = rightDiv.parentNode.offsetLeft;
    const h20 = leftLeft < rightLeft ? 'h20' : 'h-20';
    const plus20 = leftLeft < rightLeft ? 20 : -20;
    let posnALeft: any = { x: null, y: null };
    let posnBLeft: any = { x: null, y: null };
    if (leftLeft < rightLeft) {
      posnALeft = {
        x: leftDiv.offsetLeft + leftLeft + leftDiv.offsetWidth - 2,
        y: leftDiv.offsetTop + leftTop + leftDiv.offsetHeight / 2
      };
      posnBLeft = {
        x: rightDiv.offsetLeft + rightLeft - 8,
        y: rightDiv.offsetTop + rightTop + rightDiv.offsetHeight / 2
      };
    } else {
      posnALeft = {
        x: leftDiv.offsetLeft + leftLeft,
        y: leftDiv.offsetTop + leftTop + leftDiv.offsetHeight / 2
      };
      posnBLeft = {
        x: rightDiv.offsetLeft + rightLeft + rightDiv.offsetWidth + 8,
        y: rightDiv.offsetTop + rightTop + rightDiv.offsetHeight / 2
      };
    }
    const dStrLeft =
      'M' +
      posnALeft.x +
      ',' +
      posnALeft.y +
      h20 +
      'Q' +
      (posnALeft.x + plus20) +
      ',' +
      posnALeft.y +
      ' ' +
      (posnBLeft.x - plus20) +
      ',' +
      posnBLeft.y +
      h20;
    return { dStrLeft, gId };
  }

  // 设置锁地址是否亮起
  public handleAttrDataVisiable(addr: any, count: any) {
    const address = `<${addr}>`;
    this.graphData1.addressData.forEach((addressInfo: any) => {
      if (addressInfo.waitObjAddr === address) {
        addressInfo.activeCount += count;
        addressInfo.activeCount = Math.min(addressInfo.activeCount, addressInfo.maxActive);
        if (addressInfo.activeCount > 0) {
          addressInfo.isActive = true;
        } else {
          addressInfo.isActive = false;
        }
      }
    });
  }

  // 点击锁地址
  public handleAddressClick(index: any) {
    if (!this.isObersver) {
      return;
    }
    const addressData = this.graphData1.addressData[index];
    const addr = addressData.waitObjAddr.slice(1, -1);
    const isVisiable = addressData.activeCount !== addressData.maxActive;
    this.graphData1.threadData.forEach((threadInfo: any, thrIndex: any) => {
      if (threadInfo.waitObj.length > 0) {
        threadInfo.waitObj.forEach((waitObj: any) => {
          const address = waitObj.split('_');
          if (address[0] === addr) {
            this.handleThreadClick(thrIndex, isVisiable, address);
          }
        });
      }
    });
  }

  // 线程hovertip
  public onThreadTipChange(threadInfo: any) {
    this.currentHoverThread = threadInfo;
  }
  /**
   * 获取当前选择节点的父节点类名
   * @param isThread 判断是否是线程
   */
  private getParentClassName(isThread: any) {
    let id = '';
    if (isThread) {
      switch (this.name) {
        case 'current':
          id = this.currentType === 'lock' ? '.lock-left' : '.thread-right';
          break;
        case 'compare':
          id = this.currentType === 'thread' ? '.thread-right' : '.lock-left';
          break;
      }
    } else {
      switch (this.name) {
        case 'current':
          id = this.currentType === 'lock' ? '.lock-right' : '.thread-left';
          break;
        case 'compare':
          id = this.currentType === 'thread' ? '.thread-left' : '.lock-right';
          break;
      }
    }
    return id;
  }
  /**
   * 聚焦显示线程和锁
   */
  public threadFocus(node: any, isThread: any) {
    const currentId = this.name + node.id;
    const id: any = this.getParentClassName(isThread);
    const threadNodeList = $(id).children();
    let index = null;
    threadNodeList.each((i, item) => {
      if (item.id === currentId) {
        index = i;
      }
    });
    setTimeout(() => {
      this.handleClearLine();
    }, 0);
    this.nodeMove(index, id, isThread);
  }
  private nodeMove(index: any, id: any, isThread: any) {
    const threadNodeList = $(id).children();
    const currentNodeTop = threadNodeList.eq(index)[0].offsetTop;
    const currentNodeId = `#${threadNodeList.eq(index)[0].id}`;
    const offsetHeight = threadNodeList.eq(1)[0].offsetHeight;
    let flag = false;
    const averTime = Math.floor(200 / (index ? index + 1 : 1));
    threadNodeList.each((i, node) => {
      if ((this.isCompare && isThread && i === 0) || (this.deadLockCount && !isThread && i === 0)) { return; }
      if (node.offsetTop < currentNodeTop) {
        const nodeId = `#${node.id}`;
        $(nodeId).animate({
          top: offsetHeight + 20 + 'px'
        }, averTime);
      }
    });
    if ((this.isCompare && isThread) || (this.deadLockCount && !isThread)) {
      flag = true;
      index = flag ? index - 1 : index;
    }
    $(currentNodeId).animate({ top: -index * (offsetHeight + 20) + 'px' }, 500);
    this.backTop();
    setTimeout(() => {
      this.initNodeTop(index, id, isThread);
    }, 501);
  }
  private initNodeTop(index: any, id: any, isThread: any) {
    const data = isThread ? this.graphData1.threadData : this.graphData1.addressData;
    const thread = data.splice(index, 1)[0];
    data.unshift(thread);
    const threadNodeList = $(id).children();
    threadNodeList.each((i, node) => {
      if ((this.isCompare && isThread && i === 0) || (this.deadLockCount && !isThread && i === 0)) { return; }
      $(`#${node.id}`).animate({
        top: 0 + 'px'
      }, 0);
    });
    if (this.relineTimer) { clearTimeout(this.relineTimer); }
    this.relineTimer = setTimeout(() => {
      this.handleClearLine();
      this.handleRelineDraw();
    }, 1000);
  }
  /**
   * 回到顶部
   */
  private backTop() {
    if (this.initTopTimer) { clearTimeout(this.initTopTimer); }
    if (!$('.lock-graph').scrollTop()) {
      this.initTopTimer = setTimeout(() => {
        $('.graph-content').animate({ scrollTop: 0 }, 1000);
      }, 10);
    } else {
      this.initTopTimer = setTimeout(() => {
        $('.lock-graph').animate({ scrollTop: 0 }, 1000);
      }, 10);
    }
  }

   /**
    * intellIj刷新webview页面
    */
    public updateWebViewPage() {
      if (sessionStorage.getItem('tuningOperation') === 'hypertuner'){
          this.zone.run(() => {
              this.changeDetectorRef.detectChanges();
              this.changeDetectorRef.checkNoChanges();
          });
      }
  }
}
