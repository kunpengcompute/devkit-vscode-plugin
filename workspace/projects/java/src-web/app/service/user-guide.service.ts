import { Injectable, SecurityContext } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { AxiosService } from '../service/axios.service';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class UserGuideService {
  public tipBox: any;
  public mask: any;
  public tips: any;
  public i18n: any;
  public elementId: any = '';
  public diffType: any = false;

  public stepMap: any = {
    1: {
      id: 'user-guide-add-project',
      type: 'id'
    },
    2: {
      id: 'user-guide-params',
      type: 'id'
    },
    3: {
      id: 'user-guide-add-guardian',
      type: 'id'
    },
    4: {
      id: 'user-guide-thread',
      type: 'class'
    },
    5: {
      id: 'user-guide-profile',
      type: 'id'
    },
    6: {
      id: 'user-guide-profile-manage',
      type: 'id'
    },
    7: {
      id: 'user-guide-done',
      type: 'class'
    },
    8: {
      id: 'user-guide-thread-fail',
      type: 'id'
    },
    9: {
      id: 'user-guide-thread-creating',
      type: 'id'
    },
  };

  constructor(
    public router: Router,
    public i18nService: I18nService,
    public Axios: AxiosService,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.tips = {
      'user-guide-add-project': {
        title: this.i18n.userGuide.addProject,
        des: this.i18n.userGuide.addProjectDes,
        step: '(1/8)',
      },
      'user-guide-params': {
        title: this.i18n.userGuide.configParams,
        des: this.i18n.userGuide.configParamsDes,
        step: '(2/8)',
      },
      'user-guide-add-guardian': {
        title: this.i18n.userGuide.confirmAdd,
        des: this.i18n.userGuide.confirmAddDes,
        step: '(3/8)',
      },
      'user-guide-thread-creating': {
        title: this.i18n.userGuide.targeEnvCreation,
        des: this.i18n.userGuide.targeEnvCreationDes,
        step: '(4/8)',
      },
      'user-guide-thread': {
        title: this.i18n.userGuide.createTask,
        des: this.diffType ? this.i18n.userGuide.createTaskContainerDes : this.i18n.userGuide.createTaskDes,
        step: '(5/8)',
      },
      'user-guide-thread-fail': {
        title: this.i18n.userGuide.missingJavaProcess,
        des: this.i18n.userGuide.missingJavaProcessDes,
        step: '(5/5)',
        btn: this.i18n.userGuide.endWizard,
      },
      'user-guide-profile': {
        title: this.i18n.userGuide.profileAna,
        des: this.i18n.userGuide.profileAnaDes,
        step: '(6/8)',
        btn: this.i18n.userGuide.next
      },
      'user-guide-profile-manage': {
        title: this.i18n.userGuide.profileManage,
        des: this.i18n.userGuide.profileManageDes,
        step: '(7/8)',
        btn: this.i18n.userGuide.next
      },
      'user-guide-done': {
        title: this.i18n.userGuide.viewWizard,
        des: this.i18n.userGuide.viewWizardDes,
        btn: this.i18n.userGuide.done,
        step: '(8/8)',
      }
    };
  }

  /**
   * 新手指导mask init
   * user-guide
   */
  public userGuideMaskInit() {
    const topHtml = document.createElement('div');
    topHtml.id = 'topMask';
    topHtml.style.position = 'absolute';
    topHtml.style.display = 'inline-block';
    topHtml.style.background = 'rgba(0,0,0,0.2)';
    topHtml.style.width = '0';
    topHtml.style.height = `0`;
    topHtml.style.top = '0';
    topHtml.style.left = '0';
    topHtml.style.zIndex = '10000';

    const leftHtml = document.createElement('div');
    leftHtml.id = 'leftMask';
    leftHtml.style.position = 'absolute';
    leftHtml.style.display = 'inline-block';
    leftHtml.style.background = 'rgba(0,0,0,0.2)';
    leftHtml.style.width = `0`;
    leftHtml.style.height = `0`;
    leftHtml.style.top = `0`;
    leftHtml.style.left = '0';
    leftHtml.style.zIndex = '10000';

    const rightHtml = document.createElement('div');
    rightHtml.id = 'rightMask';
    rightHtml.style.position = 'absolute';
    rightHtml.style.display = 'inline-block';
    rightHtml.style.background = 'rgba(0,0,0,0.2)';
    rightHtml.style.width = `0`;
    rightHtml.style.height = `0`;
    rightHtml.style.top = `0`;
    rightHtml.style.left = `0`;
    rightHtml.style.zIndex = '10000';

    const bottomHtml = document.createElement('div');
    bottomHtml.id = 'bottomMask';
    bottomHtml.style.position = 'absolute';
    bottomHtml.style.display = 'inline-block';
    bottomHtml.style.background = 'rgba(0,0,0,0.2)';
    bottomHtml.style.width = `100%`;
    bottomHtml.style.height = `0`;
    bottomHtml.style.top = `0`;
    bottomHtml.style.left = '0';
    bottomHtml.style.zIndex = '10000';
    document.body.appendChild(topHtml);
    document.body.appendChild(leftHtml);
    document.body.appendChild(rightHtml);
    document.body.appendChild(bottomHtml);

    const tipBox = document.createElement('div'); // 添加tipbox的容器div
    tipBox.id = 'tipBox';
    tipBox.style.position = 'absolute';
    tipBox.style.width = 'auto';
    tipBox.style.height = 'auto';
    tipBox.style.zIndex = '-1';
    tipBox.style.display = 'inline-block';
    document.body.appendChild(tipBox);

    // 使用箭头函数 改变this指向
    window.onresize = () => {
      setTimeout(() => {
        this.resizeHandler();
      }, 100);
    };
  }

  /**
   * 关闭新手指导
   */
  closeUserGuide() {
    this.hideMask();
    sessionStorage.setItem('userGuidStatus-java-perf', '1');
    sessionStorage.setItem('javaStep', '');
    this.router.navigate(['home']);
    this.uploadUserGuidStatus();
  }

  /**
   * 传入后端参数
   */
  public uploadUserGuidStatus() {
    sessionStorage.setItem('userGuidStatus-java-perf', '1');
    const params = { JAVA_GUIDE_FLAG: '1' };
    this.Axios.axios.post('/users/user-extend/', params, { baseURL: '../user-management/api/v2.2' })
      .then(() => {
        sessionStorage.removeItem('userGuidStatus-java-perf');
        window.location.reload();
      });
  }

  /**
   * onresize 回调
   */
  public resizeHandler() {
    const step = sessionStorage.getItem('javaStep');
    if (step && step !== '0') {
      const curStep = this.stepMap[step];
      this.showMask(curStep.id, curStep.type);
    }
  }

  /**
   * 获取某元素以浏览器左上角为原点的坐标
   * @param obj 元素
   */
  public getPoint(obj: any): any {
    if (!obj) { return; }
    const width = obj.offsetWidth;
    const height = obj.offsetHeight;
    // 获取该元素对应父容器的上边距
    let t = obj.offsetTop;
    // 对应父容器的上边距 //判断是否有父容器，如果存在则累加其边距
    let l = obj.offsetLeft;
    // 避免检测是为了防止书写为obj === obj.offsetParent新手引导功能出错
    // tslint:disable-next-line:no-conditional-assignment
    while ((obj = obj.offsetParent)) {
      // 等效 obj = obj.offsetParent;while (obj != undefined)
      t += obj.offsetTop; // 叠加父容器的上边距
      l += obj.offsetLeft; // 叠加父容器的左边距
    }
    return { top: t, left: l, width, height };
  }

  /**
   * 步骤提示
   */
  public doTip(des: any, { top, left, width, height }: any, id: any) {
    const box = document.getElementById('tipBox');
    let html = '';
    if (id === 'user-guide-add-project') {
      box.style.top = `${top + 40}px`;
      box.style.left = `${left - left / 2}px`;
      // 1/7
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 20px;font-size: 12px;color: #616161;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
          <div style=" width: 0;
            height: 0;
            position: absolute;
            top: -25px;
            left: 10%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent #fff transparent;">
          </div>
        </div>
      `;
    }

    // 2/7
    // 70 是 tips 高度的一半
    if (id === 'user-guide-params') {
      box.style.top = `${top + height / 2 + 4 - 70}px`;
      box.style.left = `${left - 340 - 30}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 20px;font-size: 12px;color: #616161;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
          <div style=" width: 0;
            height: 0;
            position: absolute;
            right: -25px;
            top: 43%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent transparent #fff;">
          </div>
        </div>
      `;
    }
    // 3/7
    if (id === 'user-guide-add-guardian') {
      box.style.top = `${top + height + 20}px`;
      box.style.left = `${left + width / 2 - 170 + 10}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 20px;font-size: 12px;color: #616161;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
          <div style=" width: 0;
            height: 0;
            position: absolute;
            top: -25px;
            left: 43%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent #fff transparent;">
          </div>
        </div>
      `;
    }

    // 4/7
    // 75 是遮罩sampling 宽度的一半
    if (id === 'user-guide-thread') {
      box.style.top = `${top + 40}px`;
      box.style.left = `${left + width - 130}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 350px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 20px;font-size: 12px;color: #616161;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
          <div style=" width: 0;
            height: 0;
            position: absolute;
            top: 43%;
            left: -25px;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent #fff transparent transparent;">
          </div>
        </div>
      `;
    }
    // 4/4 无目标环境
    // 75 是遮罩sampling 宽度的一半
    if (id === 'user-guide-thread-fail') {
      box.style.top = `${top + 3}px`;
      box.style.left = `${left + width / 2 + 288}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 20px 20px 22px 20px;font-size: 12px;color: #616161;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
          <button id="user-guide-thread-fail-btn"
            style="position: absolute;
            right: 22px;
            bottom: 14px;
            width: 124px;
            height: 32px;
            background: #0067FF;
            border-style: none;
            border-radius: 2px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;">${des.btn}
          </button>
          <div style="width: 0;
            height: 0;
            position: absolute;
            top: 80px;
            left: -8%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent #fff transparent transparent;">
          </div>
        </div>
      `;
    }

    // 4/4 连接超时
    // 75 是遮罩sampling 宽度的一半
    if (id === 'user-guide-thread-creating') {
      box.style.top = `${top + 3}px`;
      box.style.left = `${left + width / 2 + 180}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 20px 20px 22px 20px;font-size: 12px;color: #616161;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
          <div style="width: 0;
            height: 0;
            position: absolute;
            top: 80px;
            left: -8%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent #fff transparent transparent;">
          </div>
        </div>
      `;
    }

    // 5/7
    if (id === 'user-guide-profile') {
      box.style.top = `${top + 63}px`;
      box.style.left = `${left + width / 2 - 43}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 24px 20px; position: relative;">
            <div style="font-size: 12px;color: #616161;">
            ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
            <button id="user-guide-profile-btn"
              style="position: absolute;
              right: 0;
              bottom: -8px;
              width: 88px;
              height: 32px;
              background: #0067FF;
              border-style: none;
              border-radius: 2px;
              color: #fff;
              cursor: pointer;
              font-size: 14px;">${des.btn}
            </button>
          </div>
          <div style=" width: 0;
            height: 0;
            position: absolute;
            top: -25px;
            left: 8%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent #fff transparent;">
          </div>
        </div>
      `;
    }

    // 6/7
    if (id === 'user-guide-profile-manage') {
      box.style.top = `${top - 200 - 20}px`;
      box.style.left = `${left + width / 2 - 170}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);;
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div id="close-guid" style="margin: 20px 20px 0 20px;text-align: right;">
            <img style="cursor: pointer;" src=" ./assets/img/header/close_icon.svg">
          </div>
          <div style="font-size: 18px;margin: 0px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 24px 20px; position: relative">
            <div style="font-size: 12px;color: #616161;">
            ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
            <button id="user-guide-profile-manage-btn"
              style="position: absolute;
              right: 0;
              bottom: -8px;
              width: 88px;
              height: 32px;
              background: #0067FF;
              border-style: none;
              border-radius: 2px;
              color: #fff;
              cursor: pointer;
              font-size: 14px;">${des.btn}
            </button>
          </div>
          <div style=" width: 0;
            height: 0;
            position: absolute;
            bottom: -25px;
            left: 44%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: #fff transparent transparent transparent;"></div>
        </div>
      `;
    }
    // 7/7
    if (id === 'user-guide-done') {
      box.style.top = `${top - 70 + 5}px`;
      box.style.left = `${left - 340 - 30}px`;
      html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
          border-radius: 4px;
          width: 340px;
          height: auto;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.title)}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, des.des)}</p>
          <div style="margin: 24px 20px; position: relative">
            <div style="font-size: 12px;color: #616161;">
            ${this.domSanitizer.sanitize(SecurityContext.HTML, des.step)}</div>
            <button id="user-guide-done-btn"
              style="position: absolute;
              right: 0;
              bottom: -8px;
              width: 88px;
              height: 32px;
              background: #0067FF;
              border-style: none;
              border-radius: 2px;
              color: #fff;
              cursor: pointer;
              font-size: 14px;">${des.btn}
            </button>
          </div>
          <div style=" width: 0;
            height: 0;
            position: absolute;
            right: -25px;
            top: 43%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent transparent #fff;">
          </div>
        </div>
      `;
    }

    box.innerHTML = html;
    box.style.zIndex = '10001';
    const that = this;
    if (id === 'user-guide-profile') {
      $('#user-guide-profile-btn').on('click', () => {
        that.router.navigate(['home']);
        sessionStorage.setItem('javaStep', '6');
        that.hideMask();
        setTimeout(() => {
          that.showMask('user-guide-profile-manage');
        }, 300);
      });
    } else if (id === 'user-guide-profile-manage') {
      $('#user-guide-profile-manage-btn').on('click', () => {
        sessionStorage.setItem('javaStep', '7');
        that.hideMask();
        $('.user-guide-list-menu').trigger('click');
        $('.user-guide-tiplist').css('display', 'block');
        setTimeout(() => {
          $('.user-guide-done').css({
            color: '#fff',
            'background-color': '#022547'
          });
          that.showMask('user-guide-done', 'class');
        }, 300);
      });
    } else if (id === 'user-guide-done') {
      $('#user-guide-done-btn').on('click', () => {
        $('.user-guide-list-menu').trigger('click');
        $('.user-guide-done').css({
          color: '#aaa',
          'background-color': '#071829'
        });
        $('.user-guide-tiplist').css('display', '');
        sessionStorage.setItem('userGuidStatus-java-perf', '1');
        sessionStorage.setItem('javaStep', '');
        that.hideMask();
        that.uploadUserGuidStatus();
      });
    } else if (id === 'user-guide-thread-fail') {
      $('#user-guide-thread-fail-btn').on('click', () => {
        $('.user-guide-list-menu').trigger('click');
        $('.user-guide-done').css({
          color: '#aaa',
          'background-color': '#071829'
        });
        $('.user-guide-tiplist').css('display', '');
        sessionStorage.setItem('userGuidStatus-java-perf', '1');
        sessionStorage.setItem('javaStep', '');
        that.hideMask();
        that.uploadUserGuidStatus();
      });
    }
  }

  /**
   * 遮罩
   * @param divOfsset 遮罩偏移
   * @param padding 增加空白区域的大小
   */
  public doMask(divOfsset: any, padding = 5): any {
    // 务必保证这里获取到页面可见区域宽度
    const pageWidth = document.body.offsetWidth;
    // 务必保证这里获取到页面可见区域高度
    const pageHeight = document.body.offsetHeight;

    // 最后一步新手引导 遮罩层显示全部 不可点击新手引导按钮
    if (this.elementId === 'user-guide-done') {
      const topMaskEle = document.getElementById('topMask');
      topMaskEle.style.width = '100%';
      topMaskEle.style.height = '100%';
      topMaskEle.style.position = 'fixed';
      topMaskEle.style.top = '0';
      topMaskEle.style.left = '0';
      topMaskEle.style.zIndex = '10000';

      return false;
    }

    const topMask = document.getElementById('topMask');
    topMask.style.width = '100%';
    // 针对 user-guide-thread 特殊处理，原因是 id 定义在 Java进程元素上的 然后做了向下偏移到第一个进程上面
    if (this.elementId === 'user-guide-thread') {
      topMask.style.height = `${divOfsset.top - padding + 45 + 9}px`;
    } else {
      topMask.style.height = `${divOfsset.top - padding}px`;
    }
    topMask.style.top = '0';
    topMask.style.left = '0';
    topMask.style.zIndex = '10000';

    const leftMask = document.getElementById('leftMask');
    leftMask.style.width = `${divOfsset.left - padding}px`;
    leftMask.style.height = `${divOfsset.height + padding * 2}px`;
    if (this.elementId === 'user-guide-thread') {
      leftMask.style.height = `${divOfsset.height + padding * 2 + 33}px`;
      leftMask.style.top = `${divOfsset.top - padding + 45 + 9}px`;
    } else if (this.elementId === 'user-guide-params') {
      leftMask.style.height = `${divOfsset.height + padding * 2 + 35}px`;
      leftMask.style.top = `${divOfsset.top - padding}px`;
    } else {
      leftMask.style.top = `${divOfsset.top - padding}px`;
    }
    leftMask.style.left = '0';
    leftMask.style.zIndex = '10000';

    const rightMask = document.getElementById('rightMask');
    if (this.elementId === 'user-guide-thread') {
      rightMask.style.height = `${divOfsset.height + padding * 2 + 33}px`;
      rightMask.style.top = `${divOfsset.top - padding + 45 + 9}px`;
      rightMask.style.left = `${divOfsset.left + divOfsset.width - 168}px`;
      rightMask.style.width = `${pageWidth - (divOfsset.left + divOfsset.width - 169)}px`;
    } else if (this.elementId === 'user-guide-params') {
      rightMask.style.height = `${divOfsset.height + padding * 2 + 35}px`;
      rightMask.style.top = `${divOfsset.top - padding}px`;
      rightMask.style.width = `${pageWidth - (divOfsset.left + divOfsset.width) - padding
        }px`;
      rightMask.style.left = `${divOfsset.left + divOfsset.width + padding}px`;
    } else {
      rightMask.style.height = `${divOfsset.height + padding * 2}px`;
      rightMask.style.top = `${divOfsset.top - padding}px`;
      rightMask.style.left = `${divOfsset.left + divOfsset.width + padding}px`;
      rightMask.style.width = `${pageWidth - (divOfsset.left + divOfsset.width) - padding
        }px`;
    }
    rightMask.style.zIndex = '10000';

    const bottomMask = document.getElementById('bottomMask');
    bottomMask.style.width = `100%`;
    if (this.elementId === 'user-guide-thread') {
      bottomMask.style.height = `${pageHeight - (divOfsset.top + divOfsset.height) - padding - 45 + 3
        }px`;
      bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding + 90 - 3}px`;
    } else if (this.elementId === 'user-guide-params') {
      bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding + 35}px`;
      bottomMask.style.height = `${pageHeight - (divOfsset.top + divOfsset.height) - padding
        }px`;
    } else {
      bottomMask.style.height = `${pageHeight - (divOfsset.top + divOfsset.height) - padding
        }px`;
      bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding}px`;
    }
    bottomMask.style.left = '0';
    bottomMask.style.zIndex = '10000';
  }

  /**
   * 显示遮罩
   * @param id id名称
   * @param type 区分id class
   */
  public showMask(id: any, type = 'id', diffType?: boolean): any {
    this.diffType = diffType;
    this.tips['user-guide-thread'].des =
      this.diffType ? this.i18n.userGuide.createTaskContainerDes : this.i18n.userGuide.createTaskDes,
      this.elementId = id;
    let classObj = null;
    // user-guide-done 使用getElementsByClassName 获取后有4个元素 原因是 new-header.component.html headerInforList 有4个元素
    // 这里取最后一个元素 如果只有一个元素也适用
    if (type !== 'id') {
      const doneTmp = document.getElementsByClassName(id);
      classObj = doneTmp[doneTmp.length - 1];
    }

    const obj =
      type === 'id'
        ? document.getElementById(id)
        : classObj;
    // 如果获取不到元素对象 则关闭新手引导
    if (!obj) {
      this.closeUserGuide();
      return false;
    }
    setTimeout(() => {
      const divOfsset = this.getPoint(obj);
      this.doMask(divOfsset);
      this.doTip(this.tips[id], divOfsset, id);
      const that = this;
      $('#close-guid').off();
      $('#close-guid').on('click', () => {
        that.closeUserGuide();
      });
    }, 500);
  }

  /**
   * 隐藏遮罩
   */
  public hideMask() {
    const topMask = document.getElementById('topMask');
    topMask.style.width = `0`;
    topMask.style.height = `0`;
    const leftMask = document.getElementById('leftMask');
    leftMask.style.width = `0`;
    leftMask.style.height = `0`;
    const rightMask = document.getElementById('rightMask');
    rightMask.style.width = `0`;
    rightMask.style.height = `0`;
    const bottomMask = document.getElementById('bottomMask');
    bottomMask.style.width = `0`;
    bottomMask.style.height = `0`;
    const box = document.getElementById('tipBox');
    box.innerHTML = ``;
  }
}
