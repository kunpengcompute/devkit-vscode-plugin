import { Injectable } from '@angular/core';
import { PartialObserver, Subject } from 'rxjs';
import { AnalysisType } from 'projects/sys/src-web/app/domain';
import { TuningSysMessageService } from 'sys/model/service';

interface TabDetailInfo {
  title: string;
  id: number;
  nodeid: number;
  taskId: number;
  taskType: AnalysisType;
  status: string;
  projectName: string;
}

@Injectable({
  providedIn: 'root'
})
export class Home2MainMsgService{

  // tab数据暂存
  tmpTabList: any[];

  // 订阅源
  private tabListSource = new Subject<any[]>();
  private closeTabSource = new Subject<{ detail: TabDetailInfo | {}, index: number }>();
  private deletingProjSource = new Subject<boolean>();

  // 通知订阅流
  tabListLister$ = this.tabListSource.asObservable();
  closeTabLister$ = this.closeTabSource.asObservable();
  deletingProjLister$ = this.deletingProjSource.asObservable();

  constructor(
    private tuningSysMessageService: TuningSysMessageService,
  ) {
    const tabObserver: PartialObserver<any[]> = {
      next: tList => {
        this.tmpTabList = tList;
        this.getCurrActiveTab();
      }
    };
    this.tabListLister$.subscribe(tabObserver);
  }

  /**
   * 发布 tab 列表信息
   * @param tabList tab 列表
   */
  emitTabList(tabList: any[]) {
    this.tabListSource.next(tabList);
  }

  /**
   * 发布关闭 tab 列表信息
   * @param detail 详情
   * @param tab 的索引
   */
  emitCloseTab(detail: TabDetailInfo | {}, index: number) {
    this.closeTabSource.next({ detail, index });
  }

  /**
   * 发布删除工程的信息
   * @param isDeleting 是否在删除
   */
  emitDeletingProj(isDeleting: boolean) {
    this.deletingProjSource.next(isDeleting);
  }

  /**
   * 获取当前active的tab
   */
  getCurrActiveTab() {
    this.tuningSysMessageService.currActiveTab = this.tmpTabList.find(tab => tab.active);
  }
}
