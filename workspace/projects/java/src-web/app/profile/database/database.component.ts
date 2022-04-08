import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { Subscription } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { ProfileCreateService } from '../../service/profile-create.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit, OnDestroy {
  @ViewChild('leavePage') leavePage: any;
  public i18n: any;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private i18nService: I18nService,
    private msgService: MessageService,
    public downloadService: ProfileDownloadService,
    public createProServise: ProfileCreateService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public showDatabaseTab: boolean;
  public databaseTabs: any = [];
  private showSourceSub: Subscription;
  public isDownload = false;
  public currentJvmName: any = '';
  public changePage = false;
  public changeIndex: any;
  private routerObj: any;
  ngOnInit() {
    this.currentJvmName = sessionStorage.getItem('currentSelectJvm');
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_tab.jdbc;
    this.showDatabaseTab = JSON.parse(sessionStorage.getItem('showSourceCode'));
    if (this.isDownload && this.downloadService.downloadItems.innerDataTabs.length) {
      this.downloadService.downloadItems.innerDataTabs[0].children.forEach((e: { link: string; children: any; }) => {
        if (e.link === 'database') {
          this.databaseTabs = e.children;
        }
      });
      const checkedArr = this.databaseTabs.filter((item: any) => {
        return item.checked;
      });
      const index = this.databaseTabs.findIndex((e: any) => e === checkedArr[0]);
      this.databaseTabs.forEach((item: any) => {
        item.active = false;
      });
      this.databaseTabs[index].active = true;
      this.routerObj = this.route;
      const url = this.routerObj.snapshot._routerState.url;
      const routerArr = url.split('/');
      if (routerArr.indexOf(this.databaseTabs[index].link) < 0 && this.showDatabaseTab) {
        this.router.navigate(['profiling', this.currentJvmName, 'database', this.databaseTabs[index].link]);
      }
    } else {
      this.createProServise.innerDataTabs[0].children.forEach((e: { link: string; children: any; }) => {
        if (e.link === 'database') {
          this.databaseTabs = e.children;
        }
      });
      this.databaseTabs.forEach((item: any) => {
        item.active = false;
      });
      this.databaseTabs[0].active = true;
    }
    this.showSourceSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'showDatabaseTab') {
        this.showDatabaseTab = msg.data;
        if (this.isDownload) {
          const checkedArr = this.databaseTabs.filter((item: any) => {
            return item.checked;
          });
          const index = this.databaseTabs.findIndex((e: any) => e === checkedArr[0]);
          this.router.navigate(['profiling', this.currentJvmName, 'database', this.databaseTabs[index].link]);
          this.databaseTabs.forEach((item: any) => {
            item.active = false;
          });
          this.databaseTabs[index].active = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.showSourceSub) { this.showSourceSub.unsubscribe(); }
  }

  public activeChange(index: number) {
    this.changeIndex = index;
    const nowPage = this.databaseTabs.filter((item: any) => {
      return item.active === true;
    });
    if (this.databaseTabs[index].link === nowPage[0].link) {
      return;
    }
    const isStart =
      nowPage[0].link === 'jdbc' && this.downloadService.dataSave.isJdbcStart ||
      nowPage[0].link === 'jdbcpool' && this.downloadService.dataSave.isjdbcPoolStart ||
      nowPage[0].link === 'mongodb' && this.downloadService.dataSave.isMongodbStart ||
      nowPage[0].link === 'cassandra' && this.downloadService.dataSave.isCassStart ||
      nowPage[0].link === 'hbase' && this.downloadService.dataSave.isHbaseStart;
    const stop = JSON.parse(sessionStorage.getItem('isProStop'));
    if (!this.downloadService.leavePageCheck && !stop && !this.isDownload && isStart) {
      this.leavePage.type = 'prompt';
      this.leavePage.alert_show();
      this.leavePage.alertTitle = this.i18n.leavePage.leave_page_title;
      this.leavePage.content = this.i18n.leavePage.leave_page_content;
    } else {
      this.confirmLeavePage(true);
    }
  }
  /**
   * confirmLeavePage
   * 离开当前页签弹出提示
   */
  public confirmLeavePage(flag: any) {
    this.changePage = flag;
    if (flag) {
      this.databaseTabs.forEach((tab: any) => {
        tab.active = false;
      });
      this.databaseTabs[this.changeIndex].active = true;
      this.downloadService.downloadItems.currentTabPage =
      this.i18n.protalserver_profiling_tab[this.databaseTabs[this.changeIndex].link];
      this.router.navigate(['profiling', this.currentJvmName, 'database', this.databaseTabs[this.changeIndex].link]);
    } else {
      this.downloadService.leavePageCheck = false;
    }
  }
}
