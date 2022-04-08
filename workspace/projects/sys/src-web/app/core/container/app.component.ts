import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Util } from '@cloud/tiny3';
import { ToolType } from 'projects/domain';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';
import { MessageService } from '../../service/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('container', { static: true }) private containerRef: ElementRef;
  @ViewChild('memInfo') memInfo: any;

  public showHeader = false;
  public showAdviceIcon = false;

  constructor(
    public router: Router,
    private renderer2: Renderer2,
    private msgService: MessageService,
    public userGuide: UserGuideService
  ) { }

  ngOnInit() {
    // 接收登录成功之后发送过来的消息以确认是否登录成功
    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'getLoginId') {
        setTimeout(() => {
          sessionStorage.getItem('language') === 'zh-cn'
            ? this.showAdviceIcon = true : this.showAdviceIcon = false;
        }, 2000);
      }
    });

    // 接收登出之后发送过来的消息以确认是否登出成功
    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'loginOut') {
        setTimeout(() => {
          sessionStorage.getItem('loginId') && sessionStorage.getItem('language') === 'zh-cn'
            ? this.showAdviceIcon = true : this.showAdviceIcon = false;
        }, 1000);
      }
    });


    if (!sessionStorage.getItem('toolType')) {
      sessionStorage.setItem('toolType', ToolType.SYSPERF);
    }

    this.renderer2.listen(this.containerRef.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
    this.router.events.subscribe((data) => {
      if (data instanceof NavigationEnd) {
        const token = sessionStorage.getItem('token');
        data.url === '/login' || !token
          ? (this.showHeader = false)
          : (this.showHeader = true);
        this.memInfo.startMemInterval();
      }
    });
  }

  ngAfterViewInit(): void {
    sessionStorage.getItem('loginId') && sessionStorage.getItem('language') === 'zh-cn'
      ? this.showAdviceIcon = true : this.showAdviceIcon = false;

    if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
      // 初始化遮罩层 user-guide
      this.userGuide.userGuideMaskInit();
    }
  }
}
