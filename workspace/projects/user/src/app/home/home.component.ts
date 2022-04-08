import { Component, ElementRef, OnInit } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { AxiosService } from '../service/axios.service';
import { Router } from '@angular/router';
import { ToolType } from 'projects/domain';
type EnterType = '' | 'both' | 'java' | 'sys';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public i18n: any;
  year: number = new Date().getFullYear();
  enterType: EnterType = '';

  constructor(
    private el: ElementRef,
    private i18nService: I18nService,
    private http: AxiosService,
    private router: Router
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public basicTitle: any;
  public topTitle: any;
  public celintwidth: any;
  public title = '';
  public imgsrc: any;
  public msg = {
    title: '',
    imgsrc: ''
  };
  public bg: any;
  async ngOnInit() {
    this.basicTitle = this.i18n.basic_title;
    this.topTitle = this.i18n.top_title;
    try {
      this.enterType = await this.getEnterType();
    } catch (error) { }
    sessionStorage.setItem('enterType', this.enterType);
  }

  onSysPerfClick() {
    if (this.enterType === 'both' || this.enterType === 'sys') {
      sessionStorage.setItem('toolType', ToolType.SYSPERF);
      this.jumpTo('sys-perf');
    }
  }

  onSysPerfOut() {
    this.el.nativeElement.querySelector('.popup').style.display = 'none';
  }

  onSysPerfMove() {
    this.msg = {
      title: '',
      imgsrc: ''
    };
    this.msg.title = this.i18n.SysPertitle_title;
    this.msg.imgsrc = './assets/img/home/module/sys-turning.png';
    this.el.nativeElement.querySelector('.popup').style.display = 'block';
    this.el.nativeElement.querySelector('.popup').style.left = '613px';
  }

  onJavaPerfClick() {
    if (this.enterType === 'both' || this.enterType === 'java') {
      sessionStorage.setItem('toolType', ToolType.JAVAPERF);
      this.jumpTo('java-perf');
    }
  }

  onJavaPerfOut() {
    this.el.nativeElement.querySelector('.popup').style.display = 'none';
  }

  onJavaPerfMove() {
    this.msg = {
      title: '',
      imgsrc: ''
    };
    this.msg.title = this.i18n.JavaPerf_title;
    this.msg.imgsrc = './assets/img/home/module/java-turning.png';
    this.el.nativeElement.querySelector('.popup').style.left = '360px';
    this.el.nativeElement.querySelector('.popup').style.display = 'block';
  }

  onMemPerfClick() {
    if (this.enterType === 'both' || this.enterType === 'sys') {
      sessionStorage.setItem('toolType', ToolType.DIAGNOSE);
      sessionStorage.removeItem('userGuidStatus-sys-perf');
      this.jumpTo('sys-perf');
    }
  }

  onMemPerfOut() {
    this.el.nativeElement.querySelector('.popup').style.display = 'none';
  }

  onMemPerfMove() {
    this.msg = {
      title: '',
      imgsrc: ''
    };
    this.msg.title = this.i18n.MemPerf_title;
    this.msg.imgsrc = './assets/img/home/module/diagnose-turning.png';
    this.el.nativeElement.querySelector('.popup').style.left = '590px';
    this.el.nativeElement.querySelector('.popup').style.display = 'block';
  }

  onTuninghelperClick() {
    if (this.enterType === 'both' || this.enterType === 'sys') {
      sessionStorage.setItem('toolType', ToolType.TUNINGHELPER);
      sessionStorage.removeItem('userGuidStatus-sys-perf');
      this.jumpTo('sys-perf');
    }
  }

  onTuninghelperOut() {
    this.el.nativeElement.querySelector('.popup').style.display = 'none';
  }

  onTuninghelperMove() {
    this.msg = {
      title: '',
      imgsrc: ''
    };
    this.msg.title = this.i18n.Tuninghelper_title;
    this.msg.imgsrc = './assets/img/home/module/helper-turning.png';
    this.el.nativeElement.querySelector('.popup').style.left = '180px';
    this.el.nativeElement.querySelector('.popup').style.display = 'block';
  }

  private getEnterType(): Promise<EnterType> {
    return new Promise<EnterType>((resolve, reject) => {
      this.http.axios.get('/users/install-info/')
        .then((res: any) => {
          const listType = res?.data?.data;
          let type: EnterType = '';
          switch (true) {
            case listType === 'all':
              type = 'both';
              break;
            case listType.indexOf('sys') > -1 && listType.indexOf('java') === -1:
              type = 'sys';
              break;
            case listType.indexOf('java') > -1 && listType.indexOf('sys') === -1:
              type = 'java';
              break;
            case listType.indexOf('sys') > -1 && listType.indexOf('java') > -1:
              type = 'both';
              break;
            default:
              type = 'both';
          }
          resolve(type);
        }).catch(() => {
          reject();
        });
    });
  }

  private jumpTo(url: string) {
    if (!sessionStorage.getItem('role')) {
      sessionStorage.setItem('fromHomeLogin', url);
      this.router.navigate(['/login']);
      return;
    }
    this.http.axios.get('/users/user-extend/') // 登陆之后从home页进入工具,请求新手引导状态;
      .then((res: any) => {
        if (sessionStorage.getItem('toolType') === ToolType.SYSPERF
          || sessionStorage.getItem('toolType') === ToolType.JAVAPERF) {
          const userGuidStatus = url === 'sys-perf' ? res.data.SYS_GUIDE_FLAG : res.data.JAVA_GUIDE_FLAG;
          sessionStorage.setItem('userGuidStatus-' + url, userGuidStatus);
        }
        window.location.href = window.location.origin + '/' + url + '/';
      });
  }

  onPopMove() {
    this.el.nativeElement.querySelector('.popup').style.display = 'block';
  }
  onPopOut() {
    this.el.nativeElement.querySelector('.popup').style.display = 'none';
  }
}
