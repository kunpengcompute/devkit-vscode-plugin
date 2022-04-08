import { Injectable } from '@angular/core';
import { StompService } from '../service/stomp.service';
import { ProfileDownloadService } from '../service/profile-download.service';
import { I18nService } from '../service/i18n.service';
import { MytipService } from '../service/mytip.service';
@Injectable({
  providedIn: 'root'
})
export class ProfileCreateService {
  public i18n: any;
  public innerDataTabs: any = [];
  public jdbcpoolTimeout: any = null;
  constructor(
    private stompService: StompService,
    private downloadService: ProfileDownloadService,
    public i18nService: I18nService,
    public mytip: MytipService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.innerDataTabs = [
      {
        tabName: this.i18n.common_term_clear_allData,
        expanded: true,
        checked: true,
        type: 'all',
        children: [
          {
            tabName: this.i18n.protalserver_profiling_tab.overview,
            link: 'overview',
            active: true,
            expanded: true,
            expand: true,
            checked: true
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.cpu,
            link: 'thread',
            active: false,
            expanded: true,
            expand: false,
            checked: true,
            children: [
              {
                tabName: this.i18n.protalserver_profiling_thread.list,
                link: 'list',
                active: true,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_thread.dump,
                link: 'dump',
                active: false,
                disabled: true,
                tipText: this.i18n.protalserver_profiling_memoryDump.exportThreadLimit,
                checked: true
              },
            ]
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.memoryDump,
            link: 'memoryDump',
            active: false,
            expanded: true,
            expand: false,
            checked: true,
            disabled: true,
            tipText: this.i18n.protalserver_profiling_memoryDump.exportLimit,
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.hot,
            link: 'hot',
            active: false,
            expanded: true,
            expand: false,
            checked: true,
            disabled: true,
            tipText: this.i18n.protalserver_profiling_memoryDump.exportHot,
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.gc,
            link: 'gc',
            active: false,
            expanded: true,
            expand: false,
            checked: true,
            children: [
              {
                tabName: this.i18n.protalserver_profiling_tab.gcAnalysis,
                link: 'gcAnalysis',
                active: true,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_tab.gcLog,
                link: 'gcLog',
                active: false,
                checked: true,
                disabled: true,
                tipText: this.i18n.protalserver_profiling_memoryDump.exportGClogLimit,
              },
            ]
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.io,
            link: 'io',
            expanded: true,
            expand: false,
            active: false,
            checked: true,
            children: [
              {
                tabName: this.i18n.protalserver_profiling_tab.fileIo,
                link: 'fileIo',
                active: true,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_tab.socketIo,
                link: 'socketIo',
                active: false,
                checked: true
              }
            ]
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.database,
            link: 'database',
            active: false,
            expanded: true,
            expand: false,
            checked: true,
            children: [
              {
                tabName: this.i18n.protalserver_profiling_tab.jdbc,
                link: 'jdbc',
                active: true,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_tab.jdbcpool,
                link: 'jdbcpool',
                active: false,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_tab.mongodb,
                link: 'mongodb',
                active: false,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_tab.cassandra,
                link: 'cassandra',
                active: false,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_tab.hbase,
                link: 'hbase',
                active: false,
                checked: true
              }
            ]
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.web,
            link: 'web',
            active: false,
            expanded: true,
            expand: false,
            checked: true,
            children: [
              {
                tabName: this.i18n.protalserver_profiling_tab.httpRequest,
                link: 'http',
                active: true,
                checked: true
              },
              {
                tabName: this.i18n.protalserver_profiling_tab.springBoot,
                link: 'springBoot',
                active: false,
                checked: true,
              },
            ]
          },
          {
            tabName: this.i18n.protalserver_profiling_tab.snapshot,
            link: 'snapshot',
            active: false,
            checked: true,
            expand: false,
            expanded: true,
          },
        ]
      }
    ];
  }

  /**
   *   创建profiling分析
   */
  public createProfiling(jvmId: any, guardianId: any) {
    const profileSubs = [
      `/user/queue/profile/jvms/${jvmId}/state`,
      `/user/queue/profile/jvms/${jvmId}/instance`,
      `/user/queue/profile/jvms/${jvmId}/thread-state`,
      `/user/queue/profile/jvms/${jvmId}/http`,
      `/user/queue/profile/jvms/${jvmId}/metrics`,
      `/user/queue/profile/jvms/${jvmId}/health`,
      `/user/queue/profile/jvms/${jvmId}/httptrace`,
      `/user/queue/profile/jvms/${jvmId}/jdbc`,
      `/user/queue/profile/jvms/${jvmId}/connect-pool`,
      `/user/queue/profile/jvms/${jvmId}/connect-pool-suggest`,
      `/user/queue/profile/jvms/${jvmId}/suggestions`,
      `/user/queue/profile/jvms/${jvmId}/file`,
      `/user/queue/profile/jvms/${jvmId}/socket`,
      `/user/queue/profile/jvms/${jvmId}/hbase`,
      `/user/queue/profile/jvms/${jvmId}/cassandra`,
      `/user/queue/profile/jvms/${jvmId}/mongodb`,
      `/user/queue/profile/jvms/${jvmId}/hotspot-analysis`,
      `/user/queue/profile/jvms/${jvmId}/gcState`,
      `/user/queue/profile/jvms/${jvmId}/gcLog`,
      `/user/queue/profile/jvms/${jvmId}/heap`,
      `/user/queue/profile/jvms/${jvmId}/error`,
      `/user/queue/profile/errors`,
    ];
    if (this.stompService.stompClient) { this.stompService.stompClient.disconnect(); }
    this.stompService.client(profileSubs, '/cmd/start-profile', {
      jvmId,
      guardianId,
    });
    this.downloadService.initDatabase();
    this.downloadService.leavePageCheck = false;
  }

  /**
   *   profiling文件导出
   */
  public exportProfile() {
    if (this.downloadService.downloadItems.profileInfo.jvmName === '') {
      this.downloadService.downloadItems.profileInfo.jvmName = sessionStorage.getItem('currentSelectJvm');
    }
    const lang = sessionStorage.getItem('language');
    this.downloadService.downloadItems.language = lang;
    const profileDatas = this.downloadService.downloadItems;
    const blob = new Blob([JSON.stringify(profileDatas)]);
    if ('msSaveOrOpenBlob' in navigator) {
      window.navigator.msSaveBlob(blob, this.downloadService.downloadItems.profileInfo.jvmName + '.json');
    } else {
      const elementA = document.createElement('a');
      if (this.downloadService.downloadItems.profileInfo.jvmName !== '') {
        elementA.download = this.downloadService.downloadItems.profileInfo.jvmName + '.json';
      } else {
        const fileName = sessionStorage.getItem('currentSelectJvm');
        if (fileName !== '') {
          elementA.download = fileName + '.json';
        } else {
          elementA.download = 'profiling' + '.json';
        }
      }
      elementA.style.display = 'none';
      elementA.href = URL.createObjectURL(blob);
      document.body.appendChild(elementA);
      elementA.click();
      document.body.removeChild(elementA);
    }
  }

  public initTabsData(arr: any) {
    for (const item of arr) {
      item.checked = true;
      if (item.children && item.children.length) {
        this.initTabsData(item.children);
      }
    }
    return arr;
  }

  /**
   *   同时启动连接池长时间无数据提示
   */

  public JdbcpoolTimerTip() {
    this.jdbcpoolTimeout = setTimeout(() => {
      this.mytip.alertInfo({
        type: 'warn',
        content: this.i18n.profileNodataTip.jdbcpool,
        time: 10000
      });
    }, 34000);

  }
  public clearJdbcpoolTimer() {
    clearTimeout(this.jdbcpoolTimeout);
    this.jdbcpoolTimeout = null;
  }
}
