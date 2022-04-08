import { Component, OnInit, Input, AfterViewInit, OnDestroy, ElementRef, } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';

@Component({
  selector: 'app-mem-info',
  templateUrl: './mem-info.component.html',
  styleUrls: ['./mem-info.component.scss']
})
export class MemInfoComponent implements OnInit, AfterViewInit {
  constructor(
    public el: ElementRef,
    public i18nService: I18nService,
    public Axios: AxiosService,
    private router: Router,
    public msgService: MessageService
  ) {
    this.i18n = this.i18nService.I18n();
    this.lang = sessionStorage.getItem('language');
  }
  public memInfo = false;  // 内存报警显示
  public subscription: any;
  public sendAlarmInfo = false; // 是否向节点管理界面发送数据
  public memInfoData = { color: '#FF6868' };
  public total = 0;
  public free = 0;
  public suggestSpace = 0;
  public percent = 0;
  public lang: any; // 语言,zh-cn: 中文, 'en-us': 英文
  public i18n: any;
  public memTimer: any;
  public stopStatus = false; // 清除定时器,阻止事件执行
  public title: any;
  public tip = 'tip1';
  public memInfoComponent: any;
  public memTip: any;
  ngOnInit() {
    this.title = this.i18n.memInfo.space;

    this.subscription = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'sendAlarmInfo') { // 开始|停止向节点管理界面发送数据
        this.sendAlarmInfo = msg.status;

        if (msg.status) {
          this.getMemInfo();
        }
      } else if (msg.type === 'getAlarmInfoOnce') { // 立即获取一次容量监控信息
        this.getMemInfo();
      }
    });
  }

  ngAfterViewInit() {
    this.memTip = this.el.nativeElement.querySelector('.alerm-tip');
    this.memInfoComponent = this.el.nativeElement.querySelector('.mem-info');
    const win: any = window;
    if (!!win.ActiveXObject || 'ActiveXObject' in window) {
      this.memInfoComponent.style.cursor = 'move';
    }
  }
  public startMemInterval() {
    this.stopStatus = false;
    const urlHref = window.location.href;
    if (urlHref.indexOf('user-management') > -1 || urlHref.indexOf('login') > -1) {
      this.stopStatus = true;
      this.stopMemInterval();
      return;
    }

    if (!this.memTimer) {
      this.memTimer = setInterval(() => {
        this.getMemInfo();
      }, 6000);
    }
  }
  public getMemInfo() {
    this.Axios.axios.get('/projects/1/alarm/?auto-flag=on&date=' + Date.now()).then((res: any) => {
      const data = res.data;
      if (data.data.alarm !== 'Normal') {
        this.title = this.i18n.memInfo.space;
        this.delData('data', data);
      } else {
        if (data.data_all.alarm !== 'Normal') {
          this.title = this.i18n.memInfo.disk;
          this.delData('data_all', data);
        } else {
          this.memInfo = false;
        }
      }

      if (this.sendAlarmInfo) {
        this.msgService.sendMessage({
          type: 'alarmInfo',
          data: res.data.agent_alarm_data,
        });
      }
    }).catch((error: any) => {
      this.memInfo = false;
    });
  }
  public delData(params: any, data: any) {
    const that = this;
    that.total = Number(data[params].total);
    that.suggestSpace = Number(data[params].suggest_space);
    that.free = Number(data[params].free);
    that.percent = (that.total - that.free) / that.total;
    if (data[params].alarm === 'True') {
      that.memInfoData.color = '#ED4B4B';
      that.tip = 'tip2';
    } else {
      that.memInfoData.color = '#E18406';
      that.tip = 'tip1';
    }
    that.setMemInfo();
  }

  public setMemInfo() {
    const svg = d3.select('.mem-info').select('svg');
    svg.select('.percentCircle')
      .datum(this.percent)
      .attr('stroke-dasharray', (p) => 226 * p + ',227')
      .data([this.memInfoData.color])
      .attr('stroke', (d) => d);
    this.memInfo = !this.stopStatus;
  }
  public stopMemInterval() {
    this.memInfo = false;
    if (!this.memTimer) {
      clearInterval(this.memTimer);
      return;
    }
  }

  public mousedDown(e: any) {
    const win: any = window;
    if (!!win.ActiveXObject || 'ActiveXObject' in window) {
    } else {
      this.memInfoComponent.style.cursor = 'grabbing';
    }
    e.preventDefault();
    this.memTip.style.opacity = 0;
    const memCircle = this.el.nativeElement.querySelector('#memCircle');
    const tipHeight = this.memTip.offsetHeight;
    const diffX = e.clientX - memCircle.getBoundingClientRect().left;
    const diffY = e.clientY - memCircle.getBoundingClientRect().top;
    document.onmousemove = (ev) => {

      let left = ev.clientX - diffX;
      let top = ev.clientY - diffY;
      if (left < 0) {
        left = 0;
      } else if (left > window.innerWidth - memCircle.offsetWidth) {
        left = window.innerWidth - memCircle.offsetWidth;
      }
      if (top < 0) {
        top = 0;
      } else if (top > window.innerHeight - memCircle.offsetHeight) {
        top = window.innerHeight - memCircle.offsetHeight;
      }
      this.memInfoComponent.style.left = left + 'px';
      this.memInfoComponent.style.top = top + 'px';

      // tip提示框
      if (top < 130) {
        this.memTip.style.bottom = -(tipHeight + 16) + 'px';
        this.memTip.classList.add('bottom');
      } else {
        this.memTip.style.bottom = '96px';
        this.memTip.classList.remove('bottom');
      }
      if (left < 285) {
        this.memTip.style.right = '';
        this.memTip.style.left = 0;
        this.memTip.classList.add('right');
      } else {
        this.memTip.style.left = '';
        this.memTip.style.right = 0;
        this.memTip.classList.remove('right');
      }

    };
    document.onmouseup = (ev) => {
      document.onmousemove = null;
      document.onmouseup = null;
      document.onmousedown = null;
      this.memTip.style.opacity = 1;
      const wins: any = window;
      if (!!wins.ActiveXObject || 'ActiveXObject' in window) {
      } else {
        this.memInfoComponent.style.cursor = 'grab';
      }
    };

  }
}
