import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { AxiosService } from '../../service/axios.service';
import { MessageService } from '../../service/message.service';
import { I18nService } from '../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { LibService } from '../../service/lib.service';
import { Subscription } from 'rxjs';
import { MytipService } from '../../service/mytip.service';
@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.scss']
})
export class ProfileOverviewComponent implements OnInit, OnDestroy {
  i18n: any;
  constructor(
    private Axios: AxiosService,
    private msgService: MessageService,
    public i18nService: I18nService,
    private downloadService: ProfileDownloadService,
    public libService: LibService,
    public mytip: MytipService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.propColumns = [
      {
        title: this.i18n.protalserver_profiling_overview_env.keyword,
        width: '50%',
        isSort: true,
        sortKey: 'keyword'
      },
      {
        title: this.i18n.protalserver_profiling_overview_env.value,
        width: '50%'
      }
    ];
    this.selectData.searchOptions = [
      {
        label: this.i18n.protalserver_profiling_overview_env.keyword,
        value: 'keyword'
      },
      {
        label: this.i18n.protalserver_profiling_overview_env.value,
        value: 'value'
      }
    ];
    this.searchProp.placeholder = this.i18n.searchBox.mutlInfo;
    this.selectData.searchKey = this.selectData.searchOptions[0];
    this.searchKeys.push(this.selectData.searchKey.value);
  }
  @ViewChild('overveiwEcharts') overveiwEcharts: any;
  @ViewChild('analysis ', { static: false }) analysis: any;
  public suggestArr: any = [];
  public suggestTip: string;
  public hoverClose: any;
  public isSuggest = false;
  public sugtype = 1;
  private jvmId: string;
  private guardianId = '';
  private isStopMsgSub: Subscription;
  public deleteOneTab: Subscription;
  private stateSubs: Subscription;
  public count = 180;
  public updateOptions: any;
  private overviewItems = [
    'heap_usedSize',
    'heap_committedSize',
    'nonHeap_UsedSize',
    'nonHeap_CommittedSize',
    'processPhysical_MemoryUsedSize',
    'systemFreePhysical_MemorySize',
    'gc_activity',
    'classes',
    'threads_RUNNABLE',
    'threads_WAITING',
    'threads_BLOCKED',
    'cpu_load_total',
    'cpu_load_progress'
  ];
  public overViewDatas: any = {
    heap_usedSize: [],
    heap_committedSize: [],
    nonHeap_UsedSize: [],
    nonHeap_CommittedSize: [],
    processPhysical_MemoryUsedSize: [],
    systemFreePhysical_MemorySize: [],
    gc_activity: [],
    classes: [],
    threads_RUNNABLE: [],
    threads_WAITING: [],
    threads_BLOCKED: [],
    cpu_load_total: [],
    cpu_load_progress: []
  };
  public clickOver: any = true;
  public overviewEnv = {
    title: 'Env',
    items: [
      {
        label: 'PID',
        value: '',
        key: 'lvmid'
      },
      {
        label: 'Host',
        value: '',
        key: 'host'
      },
      {
        label: 'Main Class',
        value: '',
        key: 'name'
      },
      {
        label: 'Arguments',
        value: '',
        key: 'java_command'
      },
      {
        label: 'JVM',
        value: '',
        key: 'vmVersion'
      },
      {
        label: 'Java',
        value: '',
        key: 'jdkVersion'
      }
    ]
  };

  public overviewArgs = {
    title: 'Args',
    value: ''
  };

  public propDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public propSrcData: TiTableSrcData;
  public propColumns: Array<TiTableColumns> = [];
  private pushCount = 0;
  public noDadaInfo = '';
  private isDownload = false;
  public isNoEchartsFlag = false;
  public isNoArgsFlag = false;
  public startBtnDisabled: any;
  public searchProp: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchProp.value];
  public selectData: any = {
    searchOptions: [],
    searchKey: {
      label: '',
      value: ''
    }
  };
  public searchKeys: Array<string> = [];
  public isLoading: any = false;
  ngOnInit() {
    this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_tab.overview;
    this.overviewItems.forEach(key => {
      this.overViewDatas[key] = [];
    });
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.propSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    if (Object.keys(this.downloadService.downloadItems.overview.echarts).length !== 0) {
      const echartsDta: any = this.downloadService.downloadItems.overview.echarts;
      const keywords = this.downloadService.downloadItems.overview.keyword;
      const args = this.downloadService.downloadItems.overview.arguments;
      const envs = this.downloadService.downloadItems.overview.environment;
      const series: any = [];
      this.isNoEchartsFlag = echartsDta.heap_usedSize.length > 0 ? false : true;
      this.overviewItems.forEach(item => {
        series.push({
          data: this.overViewDatas[item] || []
        });
      });
      this.updateOptions = { series };
      this.overviewEnv.items.map(item => {
        item.value = envs[item.label] || '';
      });
      this.propSrcData.data = Object.keys(keywords).map(key => {
        return {
          keyword: key,
          value: keywords[key].replace(/(\r\n|\n|\r)/gm, '<br />') || ''
        };
      });
      const argStr = args ? args.trim() : '';
      this.overviewArgs.value = argStr.split(/\s+/).join('</br>');
      this.isNoArgsFlag = argStr === '';
    }
    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.startBtnDisabled = true;
      }
      if (msg.type === 'isRestart') {
        this.startBtnDisabled = false;
        this.suggestArr = [];
        this.getParams();
      }
      if (msg.type === 'suggest') {
        this.suggestArr = msg.data.filter((item: any) => {
          return item.label === 1;
        });
        this.downloadService.downloadItems.overview.suggestArr = this.suggestArr;
      }
    });
    this.deleteOneTab = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'setDeleteOne') {
        if (this.downloadService.downloadItems.overview.showNodate) {
          this.msgService.sendMessage({
            type: 'getDeleteOne',
            isNoData: 'true',
          });
        } else {
          this.msgService.sendMessage({
            type: 'getDeleteOne',
            isNoData: 'false',
          });
        }
      }
    });
    this.suggestArr = this.downloadService.downloadItems.overview.suggestArr;
    this.stateSubs = this.msgService.getMessage()
      .subscribe(msg => {
        if (msg.type === 'updata_state') {
          const valueData = msg.state.data;
          this.updateData(valueData);
          this.pushCount++;
        }
      });
    if (!this.isDownload) {
      this.getParams();
    }
  }

  private updateData(data: any) {
    this.downloadService.downloadItems.overview.showNodate = false;
    this.overviewItems.forEach(item => {
      if (data[item] instanceof Array) {
        this.overViewDatas[item] = data[item];
      } else {
        this.overViewDatas[item].push(data[item]);
      }
    });
    this.isNoEchartsFlag = this.overViewDatas.length === 0;
    this.overveiwEcharts.updateEchartsData(this.overViewDatas);
  }

  private getParams() {
    this.Axios.axios
      .get(`/guardians/${encodeURIComponent(this.guardianId)}/jvms/${encodeURIComponent(this.jvmId)}`)
      .then((resp: any) => {
        this.propSrcData.data = [];
        if (resp.id) {
          this.overviewEnv.items.forEach(item => {
            item.value = resp[item.key] || resp.jvmArguments[item.key];
            this.downloadService.downloadItems.overview.environment[item.label] = item.value;
          });
          if (resp.jvmArguments.jvm_args) {
            const argStr = resp.jvmArguments.jvm_args.trim();
            this.overviewArgs.value = argStr.split(/\s+/).join('</br>');
            this.downloadService.downloadItems.overview.arguments = resp.jvmArguments.jvm_args;
          }
          this.isNoArgsFlag = !resp.jvmArguments.jvm_args;
          this.downloadService.downloadItems.overview.keyword = resp.properties;
          this.propSrcData.data = Object.keys(resp.properties).map(key => {
            return {
              keyword: key,
              value: resp.properties[key].replace(/(\r\n|\n|\r)/gm, '↵') || ''
            };
          });
        }
      });
  }

  public dumpHandle() {
    if (this.clickOver) {
      this.clickOver = false;
      this.getDumpData();
      let tempTimer = setTimeout(() => {
        this.clickOver = true;
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 1000);
    }
  }
  public getDumpData() {
    const guardianId = sessionStorage.getItem('guardianId');
    const gId = encodeURIComponent(guardianId);
    const params = {
      jvmId: sessionStorage.getItem('jvmId'),
    };
    this.isLoading = true;
    this.Axios.axios
      .post(`/guardians/${gId}/cmds/dump-thread`, params, { headers: { showLoading: false } })
      .then((resp: any) => {
        this.isLoading = false;
        this.getFiles(resp);
      })
      .catch((err: any) => {
        this.isLoading = false;
      });
  }

  public getFiles(resp: any) {
    const itemFile: any = {};
    itemFile.name = this.libService.dateFormat(resp.startTime, 'yyyy/MM/dd hh:mm:ss');
    itemFile.startTime = resp.startTime;
    itemFile.isOpen = false;
    itemFile.expanded = false;
    itemFile.checked = false;
    itemFile.files = [];
    itemFile.children = itemFile.files;
    itemFile.deadlockNum = 0;
    itemFile.content = resp.content;
    const content = resp.content;
    const files = content.split('\n\n');
    const deadlockReg = /Found\s+\d+\s+deadlock./;
    const deadLockStrIdx = files.findIndex((item: any) => {
      return deadlockReg.test(item);
    });
    if (deadLockStrIdx >= 0) {
      const deadlock = files[deadLockStrIdx].match(/\d+/);
      itemFile.deadlockNum = deadlock[0];
    }
    const reg = /\s+#\d+\s+/;
    const deadLockThreads: any = [];
    const deadLockStrReg = /Found one Java-level deadlock:/;
    files.forEach((file: any) => {
      const matchObj = file.match(reg);
      if (matchObj) {
        itemFile.files.push({
          fileName: file.slice(1, matchObj.index - 1),
          name: file.slice(1, matchObj.index - 1),
          content: file.slice(matchObj.index + matchObj[0].length),
          isActive: itemFile.files.length === 0,
          disabled: false
        });
      }
      if (deadLockStrReg.test(file)) {
        const threads = file.split('\n');
        threads.forEach((item: any, index: any) => {
          if (deadLockStrReg.test(item)) { return; }
          const idx = item.indexOf(':');
          if (idx >= 0) {
            deadLockThreads.push({
              type: 'deadLockThread',
              name: item.slice(1, idx - 1),
            });
          }
        });
      }
    });
    itemFile.files = itemFile.files.concat(deadLockThreads);
    this.downloadService.downloadItems.thread.threadDump.push(itemFile);
    this.mytip.alertInfo({
      type: 'success',
      content: this.i18n.protalserver_sampling_tab.dumpSuccess,
      time: 3500
    });
  }
  ngOnDestroy(): void {
    this.downloadService.downloadItems.overview.suggestArr = this.suggestArr;
    if (this.deleteOneTab) { this.deleteOneTab.unsubscribe(); }
    if (this.stateSubs) { this.stateSubs.unsubscribe(); }
    this.msgService.sendMessage({type: 'getDeleteOne' });  // 清除本页面的发送事件
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
  }
  /**
   * 搜索
   */
  propSearch(value: string): void {
    this.searchKeys[0] = this.selectData.searchKey.value;
    this.searchWords[0] = value;
  }
  propClear(value: string): void {
    this.searchWords[0] = '';
  }
  public closeSuggest() {
    this.hoverClose = '';
    this.isSuggest = false;
  }
  public closeHandle(e: any) {
    this.isSuggest = false;
  }
  public openSuggest() {
    this.isSuggest = true;
  }
}
