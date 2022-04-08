import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { ProfileCreateService } from '../../service/profile-create.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gc-detail',
  templateUrl: './gc-detail.component.html',
  styleUrls: ['./gc-detail.component.scss']
})
export class GcDetailComponent implements OnInit, OnDestroy {
  @ViewChild('leavePage') leavePage: any;
  public i18n: any;
  public isDownload = false;
  constructor(
    public router: Router,
    private i18nService: I18nService,
    public downloadService: ProfileDownloadService,
    public createProServise: ProfileCreateService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public ioTabs: any = [];
  public currentJvmName: any = '';
  public changePage = false;
  public changeIndex: any;

  ngOnInit() {
    this.currentJvmName = sessionStorage.getItem('currentSelectJvm');
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_tab.gcAnalysis;
    if (this.isDownload && this.downloadService.downloadItems.innerDataTabs.length) {
      this.downloadService.downloadItems.innerDataTabs[0].children.forEach((e: { link: string; children: any; }) => {
        if (e.link === 'gc') {
          this.ioTabs = e.children;
        }
      });
      const checkedArr = this.ioTabs.filter((item: any) => {
        return item.checked;
      });
      const index = this.ioTabs.findIndex((e: any) => e === checkedArr[0]);
      this.ioTabs.forEach((item: any) => {
        item.active = false;
      });
      let tempTimer = setTimeout(() => {
        this.ioTabs.forEach((tab: any, i: any) => {
          tab.active = i === index ? true : false;
        });
        this.router.navigate(['profiling', this.currentJvmName, 'gc', this.ioTabs[index].link]);
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 500);

    } else {
      this.createProServise.innerDataTabs[0].children.forEach((e: { link: string; children: any; }) => {
        if (e.link === 'gc') {
          this.ioTabs = e.children;
        }
      });
      this.ioTabs.forEach((item: any) => {
        item.active = false;
      });
      this.ioTabs[0].active = true;
    }
    this.activeChange(0);
  }

  public activeChange(index: number) {
    this.changeIndex = index;
    const nowPage = this.ioTabs.filter((item: any) => {
      return item.active === true;
    });
    const isStart = nowPage[0].link === 'gcAnalysis';
    const stop = JSON.parse(sessionStorage.getItem('isProStop'));
    if (!this.downloadService.leavePageCheck && !stop && !this.isDownload && isStart && this.leavePage) {
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
      this.ioTabs.forEach((tab: any, i: any) => {
        tab.active = i === this.changeIndex ? true : false;
      });
      this.downloadService.downloadItems.currentTabPage =
        this.i18n.protalserver_profiling_tab[this.ioTabs[this.changeIndex].link];
      this.router.navigate(['profiling', this.currentJvmName, 'gc', this.ioTabs[this.changeIndex].link]);
    } else {
      this.downloadService.leavePageCheck = false;
    }
  }

  /**
   * 销毁对象
   */
  ngOnDestroy(): void {
  }
}
