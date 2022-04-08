import { Component, OnDestroy, OnInit, ViewChild, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { Util } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { StompService } from '../../service/stomp.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { MessageService } from '../../service/message.service';
import { LibService } from '../../service/lib.service';
import { Subscription } from 'rxjs';
import { MytipService } from '../../service/mytip.service';
@Component({
  selector: 'app-sample-detail',
  templateUrl: './sample-detail.component.html',
  styleUrls: ['./sample-detail.component.scss']
})
export class SampleDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container') private containerRef: ElementRef;
  public simplingName: string;
  i18n: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public i18nService: I18nService,
    private stompService: StompService,
    private msgService: MessageService,
    private downloadService: SamplieDownloadService,
    private profileDownloadService: ProfileDownloadService,
    private libService: LibService,
    public myTip: MytipService,
    private renderer2: Renderer2
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public simplimgTabs = [
    {
      tabName: 'enviroment',
      link: 'env',
      active: true,
      show: true,
    },
    {
      tabName: 'cpu',
      link: 'cpu',
      active: false,
      show: true,
    },
    {
      tabName: 'objects',
      link: 'objects',
      active: false,
      show: true
    },
    {
      tabName: 'gc',
      link: 'gc',
      active: false,
      show: true,
    },
    {
      tabName: 'io',
      link: 'io',
      active: false,
      show: false
    }
  ];
  public currentHover: any;
  public sampleRoute = '1';
  public recordId = '';
  public hoverSuggest: string;
  public suggestTip: string;
  public wsFinishSub: Subscription;
  public refreshSub: Subscription;
  public suggestItem: any = [
    {
      tabName: 'enviroment',
      expend: false,
      show: false,
      label: 'ENVIRONMENT',
      subLabel: false,
      suggest: []
    },
    {
      tabName: 'gc',
      expend: false,
      show: false,
      label: 'GC',
      subLabel: false,
      suggest: []
    },
    {
      tabName: 'objects',
      expend: false,
      show: false,
      label: 'MEMORY',
      subLabel: true,
      suggest: [],
      object: 'leak'
    }
  ];
  public suggestNum = 0;
  public suggestEnv: any = [];
  public suggestGC: any = [];
  public suggestLeak: any = [];
  public finishENV = false;
  public samplingCreateTime: any;
  @ViewChild('suggestion ', { static: false }) suggestion: any;
  ngOnInit() {
    this.samplingCreateTime = sessionStorage.getItem('sampling_createTime');
    sessionStorage.setItem('sampleWsOpen', 'sampleWsOpen');
    $('.header').css({ background: '#061829' });
    const enableMethodSample = JSON.parse(sessionStorage.getItem('enableMethodSample'));
    const enableThreadDump = JSON.parse(sessionStorage.getItem('enableThreadDump'));
    const enableFileIO = JSON.parse(sessionStorage.getItem('enableFileIO'));
    const enableSocketIO = JSON.parse(sessionStorage.getItem('enableSocketIO'));
    this.suggestTip = this.i18n.protalserver_sampling_tab.suggestions;
    this.recordId = this.getRecordId();
    this.simplimgTabs.forEach(tab => {
      if (tab.tabName === 'threadDump') { tab.show = enableThreadDump; }
      if (tab.tabName === 'methodSample') { tab.show = enableMethodSample; }
      if (tab.tabName === 'io') {
        tab.show = enableFileIO || enableSocketIO;
      }
    });
    this.route.children[0].url.subscribe((url) => {
      if (url[0]) {
        const index = this.simplimgTabs.findIndex(tab => {
          return tab.link === url[0].path;
        });
        this.tabsToggle(index);
      }
    });
    this.simplingName = sessionStorage.getItem('record_name');
    this.sampleRoute = sessionStorage.getItem('sample_route');
    this.handleCleanCache();
    if (this.sampleRoute === '0') {
      this.router.navigate(['home']);
    }
    sessionStorage.setItem('sample_route', '0');
    this.wsFinishSub = this.msgService.getSampleAnalysMessage().subscribe(msg => {
      if (msg.type === 'SUGGESTION') {
        if (!this.downloadService.downloadItems.env.isFinish) {
          this.getSamplingData('env', this.recordId);
          this.finishENV = true;
          this.downloadService.downloadItems.env.isFinish = true;
        }
      }
      if (msg.type === 'SUGGESTION' && msg.label === 'GC') {
        let sug: any = [];
        if (msg.content.length > 0) {
          msg.content.forEach((element: any) => {
            element.state = false;
            sug.push(element);
          });
          this.suggestItem[1].suggest = sug;
          sug = [];
        }
      }
      if (msg.type === 'SUGGESTION' && msg.label === 'ENVIRONMENT') {
        if (msg.content.length > 0) {
          let sug: any = [];
          msg.content.forEach((element: any) => {
            element.state = false;
            sug.push(element);
          });
          this.suggestItem[0].suggest = sug;
          sug = [];
        }
      }
      if (msg.type === 'SUGGESTION' && msg.label === 'MEMORY') {
        let sug: any = [];
        if (msg.content.length > 0) {
          msg.content.forEach((element: any) => {
            element.state = false;
            sug.push(element);
          });
        }
        this.suggestItem[2].suggest = sug;
        sug = [];
      }
      if (msg.type === 'data') {
        if (msg.data.type === 'REMOVE_GUARDIAN') {
          this.myTip.alertInfo({
            type: 'warn',
            content: msg.data.message,
            time: 3000,
          });
        }
      }
      this.suggestNum = this.suggestItem[0].suggest.length +
        this.suggestItem[1].suggest.length + this.suggestItem[2].suggest.length;
      this.downloadService.downloadItems.env.suggestArr = this.suggestItem[0].suggest;
      this.downloadService.downloadItems.gc.suggestArr = this.suggestItem[1].suggest;
      this.downloadService.downloadItems.leak.suggestArr = this.suggestItem[2].suggest;
      this.msgService.sendMessage({
        type: 'GC',
        data: this.suggestItem[1].suggest
      });
      this.msgService.sendMessage({
        type: 'env',
        data: this.suggestItem[0].suggest
      });
      this.msgService.sendMessage({
        type: 'leak',
        data: this.suggestItem[2].suggest
      });
    });
    this.refreshSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'data') {
        if (msg.data.type === 'REMOVE_GUARDIAN') {
          this.myTip.alertInfo({
            type: 'warn',
            content: msg.data.message,
            time: 3000,
          });
        }
      }
    });
  }
  ngAfterViewInit(): void {
    this.renderer2.listen(this.containerRef.nativeElement, 'scroll', () => {
      // tiScroll 是tiny3的自定义事件，可以触发面板收起
      Util.trigger(document, 'tiScroll');
    });
  }
  ngOnDestroy() {
    document.getElementById('sample-loading-box').style.display = 'none';
    if (this.wsFinishSub) {
      this.wsFinishSub.unsubscribe();
    }
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }
  tabsToggle(index: any) {
    this.simplimgTabs.forEach(tab => {
      tab.active = false;
    });
    this.simplimgTabs[index].active = true;
  }
  goHome() {
    sessionStorage.removeItem('sampleWsOpen');
    this.handleCleanCache();
    this.msgService.handleSampleFileIOClear();
    this.msgService.handleSampleSocketIOClear();
    this.msgService.handleSampleObjectClear();
    if (this.stompService.stompClient) {
      this.stompService.startStompRequest('/cmd/stop-record', {});
    }
    this.profileDownloadService.downloadItems.report.reportTab = 'sample';
    this.router.navigate(['home']);
  }
  public handleCleanCache() {
    this.downloadService.downloadItems = {
      env: {
        isFinish: false,
        cpuInofo: [],
        sysEnv: [],
        suggestArr: [],
        suggetSate: '',
        btnIcon: ''
      },
      fileIO: {
        isStackFinish: false,
        data: {},
        stackTraceMap: {}
      },
      socketIO: {
        isStackFinish: false,
        data: [],
        stackTraceMap: {}
      },
      object: {
        isFileFinish: false,
        isStackFinish: false,
        data: [],
        stackTraceMap: {}
      },
      gc: {
        isFinish: false,
        baseConfig: [],
        heapConfig: [],
        youngGenConfig: [],
        survivorConfig: [],
        tlabConfig: [],
        activity: [],
        activeData: {},
        timeData: [],
        suggestArr: [],
        suggetSate: '',
        btnIcon: ''
      },
      thread: {
        isFinish: false,
        data: []
      },
      lock: {
        isFinish: false,
        data: [],
        instances: [],
        lockThread: [],
        stackTraceMap: {}
      },
      method: {
        isFinishJava: false,
        isFinishNative: false,
        java: {},
        native: {}
      },
      leak: {
        isFinish: false,
        referPool: [],
        stackPool: [],
        oldSample: [],
        finishReport: false,
        suggestArr: [],
        suggetSate: '',
        btnIcon: ''
      }
    };
  }
  public onHoverList(label?: any) {
    this.currentHover = label;
  }
  public getSamplingData(type: any, data: any) {
    const uuid = this.libService.generateConversationId(8);
    const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
    this.stompService.subscribeStompFn(requestUrl);
    this.stompService.startStompRequest('/cmd/sub-record', {
      recordId: data,
      recordType: type.toUpperCase(),
      uuid
    });
  }
  private getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    if (path) {
      params = params.slice(0);
    }
    return params;
  }
  public onHoverSuggest(msg?: any) {
    this.hoverSuggest = msg;
  }
  public openModal() {
    this.suggestion.Open();
  }
  public unfold(item: any) {
    item.expend = !item.expend;
  }
  public unfoldTitle(item: any) {
    item.show = !item.show;
  }
  public unfoldContent(item: any) {
    item.state = !item.state;
  }
  public closeSuggest() {
    this.suggestion.Close();
  }
}
