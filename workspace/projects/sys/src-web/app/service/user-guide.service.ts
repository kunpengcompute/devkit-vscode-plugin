import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { AxiosService } from '../service/axios.service';
import { Subject } from 'rxjs';
// user-guide
@Injectable({
  providedIn: 'root',
})
export class UserGuideService {
  public mask: any;
  public tips: any;
  public i18n: any;
  public maskList = ['topMask', 'leftMask', 'rightMask', 'bottomMask', 'centerMask'];
  public userGuideStep = new Subject<any>();
  public stepMap: any = {
    1: {
      id: 'user-guide-add-project',
      type: 'id'
    },
    2: {
      id: 'input-project-name',
      type: 'id'
    },
    3: {
      id: 'select-project-scene',
      type: 'id'
    },
    4: {
      id: 'select-project-node',
      type: 'id'
    },
    5: {
      id: 'create-project-sure',
      type: 'id'
    },
    6: {
      id: 'user-guide-toggle',
      type: 'id'
    },
    7: {
      id: 'user-guide-add-task',
      type: 'class'
    },
    8: {
      id: 'user-guide-taskname',
      type: 'id'
    },
    9: {
      id: 'select-analysis-target-type',
      type: 'id'
    },
    10: {
      id: 'user-guide-analysis-params',
      type: 'class'
    },
    11: {
      id: 'create-task-sure',
      type: 'id'
    },
    12: {
      id: 'ti3-modal-content',
      type: 'class'
    },
    13: {
      id: 'user-guide-run',
      type: 'id'
    },
    14: {
      id: 'user-guide-tree',
      type: 'class'
    },
    15: {
      id: 'user-guide-done',
      type: 'class'
    },
  };

  public elementId = '';

  constructor(
    public router: Router,
    public i18nService: I18nService,
    public Axios: AxiosService,
    private domSanitizer: DomSanitizer,
  ) {
    this.i18n = this.i18nService.I18n();
    this.tips = {
      'user-guide-add-project': {
        title: this.i18n.userGuide.addProject,
        des: this.i18n.userGuide.addProjectDes,
        btn: this.i18n.userGuide.next,
        step: '(1/15)',
      },
      'input-project-name': {
        title: this.i18n.userGuide.inputProjectName,
        des: this.i18n.userGuide.inputProjectNameDes,
        btn: this.i18n.userGuide.next,
        step: '(2/15)',
      },
      'select-project-scene': {
        title: this.i18n.userGuide.selectProjectScene,
        des: this.i18n.userGuide.selectProjectSceneDes,
        btn: this.i18n.userGuide.next,
        step: '(3/15)',
      },
      'select-project-node': {
        title: this.i18n.userGuide.selectNode,
        des: this.i18n.userGuide.selectNodeDes,
        btn: this.i18n.userGuide.next,
        step: '(4/15)',
      },
      'create-project-sure': {
        title: this.i18n.userGuide.createProject,
        des: this.i18n.userGuide.createProjectDes,
        btn: this.i18n.userGuide.next,
        step: '(5/15)',
      },
      'user-guide-toggle': {
        title: this.i18n.userGuide.collapseBanner,
        des: this.i18n.userGuide.collapseBannerDes,
        btn: this.i18n.userGuide.next,
        step: '(6/15)',
      },
      'user-guide-add-task': {
        title: this.i18n.userGuide.createTask,
        des: this.i18n.userGuide.createTaskDes,
        btn: this.i18n.userGuide.next,
        step: '(7/15)',
      },
      'user-guide-taskname': {
        title: this.i18n.userGuide.inpuTaskName,
        des: this.i18n.userGuide.inpuTaskNameDes,
        btn: this.i18n.userGuide.next,
        step: '(8/15)',
      },
      'select-analysis-target-type': {
        title: this.i18n.userGuide.selectAnalysisType,
        des: this.i18n.userGuide.selectAnalysisTypeDes,
        btn: this.i18n.userGuide.next,
        step: '(9/15)',
      },
      'user-guide-analysis-params': {
        title: this.i18n.userGuide.configParams,
        des: this.i18n.userGuide.configParamsDes,
        remarks: this.i18n.userGuide.createTaskRemarks,
        btn: this.i18n.userGuide.next,
        step: '(10/15)',
      },
      'create-task-sure': {
        title: this.i18n.userGuide.createTaskSure,
        des: this.i18n.userGuide.createTaskSureDes,
        btn: this.i18n.userGuide.next,
        step: '(11/15)',
      },
      'ti3-modal-content': {
        title: this.i18n.userGuide.analysModal,
        des: this.i18n.userGuide.analysModalDes,
        btn: this.i18n.userGuide.next,
        step: '(12/15)',
      },
      'user-guide-run': {
        title: this.i18n.userGuide.taskRun,
        des: this.i18n.userGuide.taskRunDes,
        btn: this.i18n.userGuide.next,
        step: '(13/15)',
      },
      'user-guide-tree': {
        title: this.i18n.userGuide.viewAnaReport,
        des: this.i18n.userGuide.viewAnaReportDes,
        btn: this.i18n.userGuide.next,
        step: '(14/15)',
      },
      'user-guide-done': {
        title: this.i18n.userGuide.viewWizard,
        des: this.i18n.userGuide.viewWizardDes,
        btn: this.i18n.userGuide.done,
        step: '(15/15)',
      }
    };
  }

  /**
   * 新手指导mask init
   * user-guide
   */
  public userGuideMaskInit() {
    this.maskList.forEach((mask) => {
      const topHtml = document.createElement('div');
      topHtml.id = mask;
      topHtml.style.position = 'absolute';
      topHtml.style.display = 'inline-block';
      topHtml.style.background = mask === 'centerMask' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.2)';
      topHtml.style.width = '0';
      topHtml.style.height = '0';
      topHtml.style.top = '0';
      topHtml.style.left = '0';
      topHtml.style.zIndex = '10000';
      document.body.appendChild(topHtml);
    });

    // 添加tipbox的容器div
    const tipBox = document.createElement('div');
    tipBox.id = 'tipBox';
    tipBox.style.position = 'absolute';
    tipBox.style.width = 'auto';
    tipBox.style.height = 'auto';
    tipBox.style.zIndex = '-1';
    tipBox.style.display = 'inline-block';
    document.body.appendChild(tipBox);

    // 使用箭头函数 改变this指向
    let resizeFlag: any;
    window.onresize = () => {
      if (resizeFlag) {
        clearTimeout(resizeFlag);
      }
      resizeFlag = setTimeout(() => {
        this.resizeHandler();
        resizeFlag = null;
      }, 100);
    };

    // 导航栏重新进入新手引导
    if (sessionStorage.getItem('SYS_DISCLAIMER') === '1') {
      let guideTimer: any;
      if (!guideTimer) {
        guideTimer = setTimeout(() => {
          this.showMask('user-guide-add-project');
          clearTimeout(guideTimer);
        }, 1500);
      }
    }
  }


  /**
   * 关闭新手引导将触发过新手引导的状态保存在服务器
   * @param: noKeep: 不保留页面
   */
  public closeUserGuide(noKeep?: boolean) {
    this.hideMask();
    sessionStorage.setItem('userGuidStatus-sys-perf', '1');
    const params = { SYS_GUIDE_FLAG: '1' };
    this.Axios.axios.post('/users/user-extend/', params, { baseURL: '../user-management/api/v2.2' })
      .then(() => {
        if (!noKeep) {
          sessionStorage.setItem('sysStep', '');
          this.router.navigate(['home']);
          window.location.reload();
        }
      });
  }

  /**
   * onresize 回调
   */
  public resizeHandler() {
    const step = sessionStorage.getItem('sysStep');
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
    let width = obj.offsetWidth;
    const height = obj.offsetHeight;
    // 获取该元素对应父容器的上边距
    let t = obj.getBoundingClientRect().top;
    // 对应父容器的上边距
    let l = obj.getBoundingClientRect().left;
    // 按钮涉及滚动条 微调
    if (this.elementId === 'user-guide-add-task') {
      l = obj.getBoundingClientRect().left - 2;
    } else if (this.elementId === 'user-guide-tree') {
      l = obj.getBoundingClientRect().left - 10;
      width += 5;
    } else if (this.elementId === 'user-guide-taskname') {
      width += 95;
      l -= 95;
    } else if (this.elementId === 'select-project-node') {
      t += 10;
    }

    return { top: t, left: l, width, height };
  }

  /**
   * 步骤提示
   * @param des 按钮描述
   * @param top 所选择元素上方距离
   * @param left 所选择元素上方距离
   * @param id 步骤id
   */
  public doTip(des: any, { top, left, width, height }: any, id: any) {
    const box = document.getElementById('tipBox');
    let html = '';
    const divBox = `
    <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
    border-radius: 4px;`;
    const btn = `<div id="close-guide" class="ti3-close ti3-icon ti3-icon-close"></div>
    <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
    <div style="font-size: 14px;color: #575B66;margin: 0 20px;">${des.des}</div>
    <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
    <button id=${id + '-btn'} class='ti3-btn-primary' style="position: absolute;
    bottom: 10px;
    right: 22px;
    width: 88px;
    height: 33px;
    background: #0067FF;
    border-style: none;
    border-radius: 2px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;">${des.btn}</button>`;
    // 170 是 tip 的宽度 340 的一半
    if (id === 'user-guide-add-project' || id === 'user-guide-toggle') {
      box.style.top = id === 'user-guide-toggle' ? `${top + 30}px` : `${top + 50}px`;
      box.style.left = id === 'user-guide-toggle' ? `${left - 156}px` : `${left - 170 + width / 2 + 5}px`;
      html = `${divBox}
        width: 340px;
        height: 150px;'>
        ${btn}
          <div style=" width: 0;
          height: 0;
          position: absolute;
          top: -25px;
          left: 44%;
          z-index: -1;
          border-width: 14px;
          border-style: solid;
          border-color: transparent transparent #fff transparent;"></div>
        </div>
        `;
      if (id === 'user-guide-toggle') {
        const upArr = `<img src="./assets/img/home/close-arr.svg" style="transform: rotate(180deg);">`;
        const downArr = `<img src="./assets/img/home/close-arr.svg">`;
        html = html.replace('∧', upArr).replace('∨', downArr);
      }
    }
    if (id === 'input-project-name' || id === 'select-project-scene'
      || id === 'select-project-node' || id === 'create-project-sure') {
      const lesTop = id === 'input-project-name' ? 80 : 30;
      const sureLeft = id === 'create-project-sure' ? 45 : 0;
      const sureHeight = id === 'create-project-sure' ? 150 : 165;
      box.style.top = `${top - lesTop}px`;
      box.style.left = `${left - 340 - 30 + sureLeft}px`;
      html = `${divBox}
            width: 300px;
            height: ${sureHeight}px;'>
            ${btn}
            <div style=" width: 0;
            height: 0;
            position: absolute;
            right: -25px;
            top: 43%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent transparent #fff;"></div>
          </div>
        `;
    }
    if (id === 'user-guide-add-task') {
      // 距离顶部超过 620px tips显示在上方
      if (top > 500) {
        box.style.top = `${top - 150 - 20}px`;
        box.style.left = `${left - 155}px`;
        html = `
        ${divBox}
        width: 340px;
        height: 150px;'>
        ${btn}
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
      } else {
        box.style.top = `${top + 54}px`;
        box.style.left = `${left - 155}px`;
        html = `
          ${divBox}
          width: 340px;
          height: 150px;'>
          ${btn}
            <div style=" width: 0;
            height: 0;
            position: absolute;
            top: -25px;
            left: 44%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent #fff transparent;"></div>
          </div>
          `;
      }
    }

    // 配置参数
    if (id === 'user-guide-taskname' || id === 'ti3-modal-content') {
      box.style.top = id === 'ti3-modal-content' ? `${top + height / 2 - 75}px` : `${top - 64}px`;
      box.style.left = id === 'ti3-modal-content' ? `${left + width + 70}px` : `${left + width + 20}px`;
      html = `
        ${divBox}
        width: 340px;
        height: 150px;'>
        ${btn}
          <div style=" width: 0;
          height: 0;
          position: absolute;
          left: -25px;
          top: 44%;
          z-index: -1;
          border-width: 14px;
          border-style: solid;
          border-color: transparent #fff transparent transparent;"></div>
        </div>
        `;
    }
    if (id === 'select-analysis-target-type' || id === 'user-guide-analysis-params' || id === 'create-task-sure') {
      const lang = sessionStorage.getItem('language');
      let height1 = id === 'select-analysis-target-type' ? 150 : 195;
      if (lang === 'en-us' && id === 'create-task-sure') { height1 = 220; }
      box.style.top = `${top - height1 - 25}px`;
      box.style.left = `${left + width / 2 - 170}px`;
      if (id === 'user-guide-analysis-params') {
        const marks = `<p style="font-size: 12px;color: #747984;margin: 0 20px;">${des.remarks}</p>`;
        html = `
        ${divBox}
        width: 340px;
        height: ${height1}px;'>
        ${btn}
        ${marks}
          <div style=" width: 0;
          height: 0;
          position: absolute;
          left: 44%;
          bottom: -25px;
          z-index: -1;
          border-width: 14px;
          border-style: solid;
          border-color: #fff transparent  transparent transparent;"></div>
        </div>
        `;
      } else {
        html = `
        ${divBox}
        width: 340px;
        height: ${height1}px;'>
        ${btn}
          <div style=" width: 0;
          height: 0;
          position: absolute;
          left: 44%;
          bottom: -25px;
          z-index: -1;
          border-width: 14px;
          border-style: solid;
          border-color: #fff transparent  transparent transparent;"></div>
        </div>
        `;
      }
    }
    if (id === 'user-guide-run') {
      box.style.top = `${top + height / 2 - 80}px`;
      box.style.left = `${left - 30 - 340}px`;
      html = `
        ${divBox}
        width: 340px;
        height: 160px;'>
          <div id="close-guide" class="ti3-close ti3-icon ti3-icon-close"></div>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin: 0 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
            <div style=" width: 0;
            height: 0;
            position: absolute;
            right: -25px;
            top: 44%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent transparent #fff;"></div>
          </div>
        `;
    }
    if (id === 'user-guide-tree') {
      if (top > 500) {
        box.style.top = `${top - 212 - 45}px`;
        box.style.left = `${left + width / 2 - 160}px`;
        html = `
        ${divBox}
        width: 340px;
        height: 225px;'>
        ${btn}
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
      } else {
        box.style.top = `${top - 58 - 16}px`;
        box.style.left = `${left + width + 20}px`;
        html = `
          ${divBox}
          width: 340px;
          height: 225px;'>
          ${btn}
              <div style=" width: 0;
              height: 0;
              position: absolute;
              left: -25px;
              top: 44%;
              z-index: -1;
              border-width: 14px;
              border-style: solid;
              border-color: transparent #fff transparent transparent;"></div>
            </div>
          `;
      }
      const analysisCircle = `<img src="./assets/img/home/running.svg" style="width: 12px;">`;
      const greenCircle = `<div style="display: inline-block;width: 10px;height: 10px;
      border-radius: 50%;background-color: #7adfa0;"></div>`;
      const blueCircle = `<div style="display: inline-block;width: 10px;
      height: 10px;border-radius: 50%;background-color: #60b0ff;"></div>`;
      const redCircle = `<div style="display: inline-block;width: 10px;
      height: 10px;border-radius: 50%;background-color: #f45c5e;"></div>`;
      html = html.replace(/analysisCircle/g, analysisCircle)
        .replace(/greenCircle/g, greenCircle)
        .replace('blueCircle', blueCircle)
        .replace('redCircle', redCircle);
    }

    // 70 是 tips 高度的一半 340 是 tips 的宽度
    if (id === 'user-guide-done') {
      box.style.top = `${top - 80 + 10}px`;
      box.style.left = `${left - 340 - 30}px`;
      html = `
        ${divBox}
        width: 340px;
        height: 165px;'>
        ${btn}
            <div style=" width: 0;
            height: 0;
            position: absolute;
            right: -25px;
            top: 43%;
            z-index: -1;
            border-width: 14px;
            border-style: solid;
            border-color: transparent transparent transparent #fff;"></div>
          </div>
        `;
    }

    box.innerHTML = html;
    box.style.zIndex = '10001';
    if (id === 'input-project-name') {
      $('#' + id + '-btn').on('click', () => {
        this.showMask('select-project-scene');
      });
    } else if (id === 'user-guide-tree') {
      $('#user-guide-tree-btn').on('click', () => {
        $('#user-guide-ul').css('display', 'block');
        document.querySelector('.user-guide-done').className += ' active';
        this.hideMask();
        setTimeout(() => {
          this.showMask('user-guide-done', 'class');
        }, 200);
      });
    } else if (id === 'user-guide-done') {
      $('#user-guide-done-btn').on('click', async () => {
        $('#user-guide-ul').css('display', '');
        document.querySelector('.user-guide-done').className = 'user-guide-done';
        await this.closeUserGuide(true);
        sessionStorage.setItem('sysStep', '');
        this.hideMask();
      });
    } else {
      $('#' + id + '-btn').on('click', () => {
        this.hideMask();
        this.userGuideStep.next(id);
      });
    }
  }

  /**
   * 遮罩
   * @param divOfsset 计算得到的元素宽度距离参数
   */
  public doMask(divOfsset: any, padding = 5): any {
    const pageWidth = document.body.offsetWidth;
    // 务必保证这里获取到页面可见区域宽度
    const pageHeight = document.body.offsetHeight;
    // 务必保证这里获取到页面可见区域高度

    // 最后一步新手引导 遮罩层显示全部 不可点击新手引导按钮
    if (this.elementId === 'user-guide-done') {
      const topMask1 = document.getElementById('topMask');
      topMask1.style.width = '100%';
      topMask1.style.height = '100%';
      topMask1.style.position = 'fixed';
      topMask1.style.top = '0';
      topMask1.style.left = '0';
      topMask1.style.zIndex = '10000';

      return false;
    }
    if (this.elementId === 'ti3-modal-content') { padding = 50; }
    let addTop = 0; // 超出中间遮罩层的框选
    let addLeft = 0;
    const topMask = document.getElementById('topMask');
    topMask.style.width = '100%';
    topMask.style.height = `${divOfsset.top - padding}px`;
    topMask.style.top = '0';
    topMask.style.left = '0';
    topMask.style.zIndex = '10000';

    const leftMask = document.getElementById('leftMask');
    leftMask.style.width = `${divOfsset.left - padding}px`;

    leftMask.style.height = `${divOfsset.height + padding * 2}px`;

    leftMask.style.top = `${divOfsset.top - padding}px`;
    leftMask.style.left = '0';
    leftMask.style.zIndex = '10000';

    const rightMask = document.getElementById('rightMask');

    rightMask.style.height = `${divOfsset.height + padding * 2}px`;

    rightMask.style.top = `${divOfsset.top - padding}px`;
    // 只显示新增按钮
    if (this.elementId === 'user-guide-add-task') {
      rightMask.style.width = `${pageWidth - (divOfsset.left + divOfsset.width) - padding + 62
        }px`;
      rightMask.style.left = `${divOfsset.left + divOfsset.width + padding - 62}px`;
    } else {
      rightMask.style.width = `${pageWidth - (divOfsset.left + divOfsset.width) - padding
        }px`;
      rightMask.style.left = `${divOfsset.left + divOfsset.width + padding}px`;
    }
    rightMask.style.zIndex = '10000';

    const bottomMask = document.getElementById('bottomMask');
    bottomMask.style.width = `100%`;

    bottomMask.style.height = `${pageHeight - (divOfsset.top + divOfsset.height) - padding
      }px`;
    bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding}px`;

    bottomMask.style.left = '0';
    bottomMask.style.zIndex = '10000';

    if (this.elementId === 'input-project-name'
      || this.elementId === 'select-project-scene'
      || this.elementId === 'select-project-node'
    ) {
      addTop = this.elementId === 'select-project-node' ? 40 : 30;
      addLeft = 10;
      topMask.style.height = `${divOfsset.top - padding - addTop}px`;
      leftMask.style.width = `${divOfsset.left - padding - addLeft}px`;
      leftMask.style.height = `${divOfsset.height + padding * 2 + addTop}px`;
      leftMask.style.top = `${divOfsset.top - padding - addTop}px`;
      rightMask.style.top = `${divOfsset.top - padding - addTop}px`;
      rightMask.style.height = `${divOfsset.height + padding * 2 + addTop}px`;
    } else if (this.elementId === 'create-project-sure') {
      addTop = -26;
      addLeft = -60;
      const num = 30;
      topMask.style.height = `${divOfsset.top - padding - addTop}px`;
      leftMask.style.width = `${divOfsset.left - padding - addLeft}px`;
      leftMask.style.height = `${divOfsset.height + padding * 2 + addTop - num}px`;
      leftMask.style.top = `${divOfsset.top - padding - addTop}px`;
      rightMask.style.top = `${divOfsset.top - padding - addTop}px`;
      rightMask.style.left = `${divOfsset.left + divOfsset.width + padding - addTop - 50}px`;
      rightMask.style.width = `${pageWidth - (divOfsset.left + divOfsset.width) - padding + 50}px`;
      rightMask.style.height = `${divOfsset.height + padding * 2 + addTop - num}px`;
      bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding - num}px`;
      bottomMask.style.height = `${pageHeight - (divOfsset.top + divOfsset.height) - padding + num}px`;
    } else if (this.elementId === 'create-task-sure') {
      addTop = -20;
      const addBottom = 0;

      topMask.style.height = `${divOfsset.top - padding - addTop}px`;
      leftMask.style.height = `${divOfsset.height + padding * 2 + addTop + addBottom}px`;
      leftMask.style.top = `${divOfsset.top - padding - addTop}px`;
      rightMask.style.top = `${divOfsset.top - padding - addTop}px`;
      rightMask.style.height = `${divOfsset.height + padding * 2 + addTop + addBottom}px`;
      bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding + addBottom}px`;
      bottomMask.style.height = `${pageHeight - (divOfsset.top + divOfsset.height) - padding - addBottom}px`;
    }

    // 中间遮罩层设置
    const centerMask = document.getElementById('centerMask');
    centerMask.style.top = `${divOfsset.top - padding - addTop}px`;
    centerMask.style.left = `${divOfsset.left - padding - addLeft}px`;
    centerMask.style.width = `${parseInt(rightMask.style.left, 10) - parseInt(centerMask.style.left, 10)}px`;
    centerMask.style.height = `${parseInt(bottomMask.style.top, 10) - parseInt(centerMask.style.top, 10)}px`;

    if (window.navigator.userAgent.indexOf('Trident') >= 0) {
      topMask.style.height = `${parseInt(topMask.style.height, 10) - 1}px`;
      leftMask.style.height = `${parseInt(leftMask.style.height, 10) + 1}px`;
      leftMask.style.top = `${parseInt(leftMask.style.top, 10) - 1}px`;
      rightMask.style.top = `${parseInt(rightMask.style.top, 10) - 1}px`;
      rightMask.style.height = `${parseInt(rightMask.style.height, 10) + 1}px`;
      if (this.elementId === 'user-guide-add-projec'
        || this.elementId === 'input-project-name'
        || this.elementId === 'user-guide-add-task'
        || this.elementId === 'user-guide-run') {
        bottomMask.style.top = `${parseInt(bottomMask.style.top, 10) - 1}px`;
      }
    }
  }

  /**
   * 显示遮罩
   * @param id 选中元素id
   */
  public showMask(id: any, type = 'id'): any {
    this.elementId = id;
    let obj: any =
      type === 'id'
        ? document.getElementById(id)
        : document.getElementsByClassName(id)[0];
    // 如果获取不到元素对象 则关闭新手引导
    if (!obj) {
      this.closeUserGuide();
      return false;
    }

    // 工程树需要包含任务名称及其所有节点
    if (id === 'user-guide-tree') {
      const aimTask = obj.parentNode.parentNode.parentNode.parentNode.parentNode;
      obj = aimTask;
    }
    const index = Object.keys(this.stepMap).find((step) => {
      return this.stepMap[step].id === id;
    });
    if (index) { sessionStorage.setItem('sysStep', index); }

    const divOfsset = this.getPoint(obj);
    this.doMask(divOfsset);
    this.doTip(this.tips[id], divOfsset, id);
    $('#close-guide').off();
    $('#close-guide').on('click', () => {
      this.closeUserGuide();
    });
  }

  /**
   * 隐藏遮罩
   */
  public hideMask() {
    this.maskList.forEach((mask) => {
      const topMask = document.getElementById(mask);
      topMask.style.width = '0';
      topMask.style.height = `0`;
    });
    const box = document.getElementById('tipBox');
    box.innerHTML = '';
  }
}
