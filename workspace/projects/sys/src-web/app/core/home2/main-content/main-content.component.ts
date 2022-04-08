import {
  Component, OnInit, OnDestroy
} from '@angular/core';
import { ToolType } from 'projects/domain';
import { PartialObserver, Subscription } from 'rxjs';
import { Home2MainMsgService } from '../service/home2-main-msg.service';
import { MessageService } from 'sys/src-web/app/service/message.service';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit, OnDestroy {
  tabList: any[];
  deletingProject: boolean;

  private tabListSub: Subscription;
  private deletingProjSub: Subscription;

  constructor(
    private home2MainMsgService: Home2MainMsgService,
    private messageService: MessageService
  ) { }
  public isDiagnose: boolean;
  ngOnInit(): void {
    this.isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
    // 同步暂存数据
    this.tabList = this.home2MainMsgService.tmpTabList;

    // tab 列表的订阅流
    const tabObserver: PartialObserver<any[]> = {
      next: tList => {
        this.tabList = tList;
      }
    };
    this.tabListSub = this.home2MainMsgService.tabListLister$.subscribe(tabObserver);

    // 删除工程的订阅流
    const deletingObserver: PartialObserver<boolean> = {
      next: isdeleting => {
        this.deletingProject = isdeleting;
      }
    };
    this.deletingProjSub
      = this.home2MainMsgService.deletingProjLister$.subscribe(deletingObserver);
  }

  ngOnDestroy() {
    this.tabListSub?.unsubscribe();
    this.deletingProjSub?.unsubscribe();
  }

  onCloseTabAndOpenDetail(evt: any, index: number) {
    if (evt.type === 'tuningAssistantProjectSuccess') {
      this.messageService.sendMessage({
        type: 'tuningAssistantProjectSuccess'
      });
      this.home2MainMsgService.emitCloseTab({}, index);
    } else {
      this.home2MainMsgService.emitCloseTab(evt, index);
    }
  }
}
