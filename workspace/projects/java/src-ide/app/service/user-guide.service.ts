import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';

// user-guide
@Injectable({
    providedIn: 'root',
})
export class UserGuideService {
    public tipBox: any;
    public mask: any;
    public tips: any;
    public i18n: any;
    public elementId: any = '';

    public stepMap = {
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
    };

    constructor(
        public router: Router,
        public i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
        this.tips = {
            'user-guide-add-project': {
                title: this.i18n.userGuide.addProject,
                des: this.i18n.userGuide.addProjectDes,
                step: '(1/7)',
            },
            'user-guide-params': {
                title: this.i18n.userGuide.configParams,
                des: this.i18n.userGuide.configParamsDes,
                step: '(2/7)',
            },
            'user-guide-add-guardian': {
                title: this.i18n.userGuide.confirmAdd,
                des: this.i18n.userGuide.confirmAddDes,
                step: '(3/7)',
            },
            'user-guide-thread': {
                title: this.i18n.userGuide.createTask,
                des: this.i18n.userGuide.createTaskDes,
                step: '(4/7)',
            },
            'user-guide-profile': {
                title: this.i18n.userGuide.profileAna,
                des: this.i18n.userGuide.profileAnaDes,
                step: '(5/7)',
                btn: this.i18n.userGuide.next
            },
            'user-guide-profile-manage': {
                title: this.i18n.userGuide.profileManage,
                des: this.i18n.userGuide.profileManageDes,
                step: '(6/7)',
                btn: this.i18n.userGuide.next
            },
            'user-guide-done': {
                title: '查看新手引导',
                des: '以上就是Java性能分析的主要操作步骤，您可在导航栏菜单中再次查看新手引导。',
                btn: this.i18n.userGuide.done,
                step: '(7/7)',
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

        // 关闭新手引导
        const closeUserGuideBtn = document.createElement('div'); // 添加tipbox的容器div
        closeUserGuideBtn.id = 'user-guide-close';
        closeUserGuideBtn.style.position = 'absolute';
        closeUserGuideBtn.style.width = '103px';
        closeUserGuideBtn.style.height = '24px';
        closeUserGuideBtn.style.top = '60px';
        closeUserGuideBtn.style.right = '60px';
        closeUserGuideBtn.style.zIndex = '10002';
        closeUserGuideBtn.style.color = '#BFC1C5';
        closeUserGuideBtn.style.fontSize = '14px';
        closeUserGuideBtn.style.cursor = 'pointer';
        if ((self as any).webviewSession.getItem('flogin') === '1') {
            closeUserGuideBtn.style.display = 'inline-block';
            if ((self as any).webviewSession.getItem('language') === 'zh-cn') {
                closeUserGuideBtn.innerHTML = '关闭新手引导&nbsp;&times'; // todo
            } else {
                closeUserGuideBtn.innerHTML = 'Close Wizard&nbsp;&times'; // todo
            }
        } else {
            closeUserGuideBtn.style.display = 'none'; // todo
        }
        closeUserGuideBtn.onclick = () => {
            this.hideMask();
            (self as any).webviewSession.setItem('flogin', '0');
            (self as any).webviewSession.setItem('step', '');
            this.router.navigate(['home']);
            window.location.reload();
        };
        closeUserGuideBtn.onmouseenter = () => {
            closeUserGuideBtn.style.color = '#6c92fa';
        };
        closeUserGuideBtn.onmouseleave = () => {
            closeUserGuideBtn.style.color = '#BFC1C5';
        };
        document.body.appendChild(closeUserGuideBtn);

        // 使用箭头函数 改变this指向
        window.onresize = () => {
            setTimeout(() => {
                this.resizeHandler();
            }, 100);
        };
    }

    /**
     * onresize 回调
     */
    public resizeHandler() {
        const step = (self as any).webviewSession.getItem('step');
        if (step && step !== '0') {
            const curStep = (this.stepMap as any)[step];
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
        let t = obj.offsetTop; // 获取该元素对应父容器的上边距
        let l = obj.offsetLeft; // 对应父容器的上边距 //判断是否有父容器，如果存在则累加其边距

        obj = obj.offsetParent;
        while (obj) {
            // 等效 obj = obj.offsetParent;while (obj != undefined)
            t += obj.offsetTop; // 叠加父容器的上边距
            l += obj.offsetLeft; // 叠加父容器的左边距
            obj = obj.offsetParent;
        }
        return { top: t, left: l, width, height };
    }

    /**
     * 步骤提示
     */
    public doTip(des: any, rect: any, id: any) {
        const { top, left, width, height } = rect;
        const box = document.getElementById('tipBox');
        let html = '';
        if (id === 'user-guide-add-project') {
            box.style.top = `${top + 40}px`;
            box.style.left = `${left - left / 2}px`;
            html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
        border-radius: 4px;
        width: 340px;
        height: 150px;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin-left: 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
          <div style=" width: 0;
          height: 0;
          position: absolute;
          top: -25px;
          left: 10%;
          z-index: -1;
          border-width: 14px;
          border-style: solid;
          border-color: transparent transparent #fff transparent;"></div>
        </div>
        `;
        }

        // 70 是 tips 高度的一半
        if (id === 'user-guide-params') {
            box.style.top = `${top + height / 2 + 4 - 70}px`;
            box.style.left = `${left - 340 - 30}px`;
            html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
        border-radius: 4px;
        width: 340px;
        height: 140px;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin-left: 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
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

        if (id === 'user-guide-add-guardian') {
            box.style.top = `${top + height + 20}px`;
            box.style.left = `${left + width / 2 - 170 + 10}px`;
            html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
        border-radius: 4px;
        width: 340px;
        height: 180px;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin-left: 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
          <div style=" width: 0;
          height: 0;
          position: absolute;
          top: -25px;
          left: 43%;
          z-index: -1;
          border-width: 14px;
          border-style: solid;
          border-color: transparent transparent #fff transparent;"></div>
        </div>
        `;
        }

        // 75 是遮罩sampling 宽度的一半
        if (id === 'user-guide-thread') {
            box.style.top = `${top + 70 + 45}px`;
            box.style.left = `${left + width / 2 - 170 - 75}px`;
            html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
        border-radius: 4px;
        width: 340px;
        height: 150px;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin-left: 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
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

        if (id === 'user-guide-profile') {
            box.style.top = `${top + 63}px`;
            box.style.left = `${left + width / 2 - 170}px`;
            html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
        border-radius: 4px;
        width: 340px;
        height: 265px;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin-left: 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
          <button id="user-guide-profile-btn" style="position: absolute;
            bottom: 10px;
            right: 22px;
            width: 88px;
            height: 33px;
            background: #0067FF;
            border-style: none;
            border-radius: 2px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;">${des.btn}</button>
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

        if (id === 'user-guide-profile-manage') {
            box.style.top = `${top - 200 - 20}px`;
            box.style.left = `${left + width / 2 - 170}px`;
            html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);;
        border-radius: 4px;
        width: 340px;
        height: 200px;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin-left: 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
          <button id="user-guide-profile-manage-btn" style="position: absolute;
            bottom: 10px;
            right: 22px;
            width: 88px;
            height: 33px;
            background: #0067FF;
            border-style: none;
            border-radius: 2px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;">${des.btn}</button>
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

        // 70 是 tips 高度的一半 340 是 tips 的宽度
        if (id === 'user-guide-done') {
            box.style.top = `${top - 70 + 15}px`;
            box.style.left = `${left - 340 - 30}px`;
            html = `
        <div style='position:relative;display:inline-block;background-image: linear-gradient(to bottom, #fff, #F1F7FF);
        border-radius: 4px;
        width: 340px;
        height: 150px;'>
          <div style="font-size: 18px;margin: 30px 20px 10px 20px;color: #0067FF;">${des.title}</div>
          <p style="font-size: 14px;color: #575B66;margin-left: 20px;">${des.des}</p>
          <div style="position: absolute;bottom: 10px;left: 20px;font-size: 12px;color: #616161;">${des.step}</div>
          <button id="user-guide-done-btn" style="position: absolute;
            bottom: 10px;
            right: 22px;
            width: 88px;
            height: 33px;
            background: #0067FF;
            border-style: none;
            border-radius: 2px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;">${des.btn}</button>
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
        const that = this;
        if (id === 'user-guide-profile') {
            $('#user-guide-profile-btn').on('click', () => {
                that.router.navigate(['home']);
                (self as any).webviewSession.setItem('step', '6');
                that.hideMask();
                setTimeout(() => {
                    that.showMask('user-guide-profile-manage');
                }, 300);
            });
        } else if (id === 'user-guide-profile-manage') {
            $('#user-guide-profile-manage-btn').on('click', () => {
                (self as any).webviewSession.setItem('step', '7');
                that.hideMask();
                $('.user-guide-list-menu').trigger('click');
                $('.user-guide-tiplist').css('display', 'block');
                setTimeout(() => {
                    that.showMask('user-guide-done', 'class');
                }, 300);
            });
        } else if (id === 'user-guide-done') {
            $('#user-guide-done-btn').on('click', () => {
                $('.user-guide-tiplist').css('display', '');
                (self as any).webviewSession.setItem('flogin', '0');
                (self as any).webviewSession.setItem('step', '');
                that.hideMask();
            });
        }
    }

    /**
     * 遮罩
     * @param divOfsset 遮罩偏移
     * @param padding 增加空白区域的大小
     */
    public doMask(divOfsset: any, padding = 5) {
        const pageWidth = document.body.offsetWidth; // 务必保证这里获取到页面可见区域宽度
        const pageHeight = document.body.offsetHeight; // 务必保证这里获取到页面可见区域高度

        const topMask = document.getElementById('topMask');
        topMask.style.width = '100%';
        // 针对 user-guide-thread 特殊处理，原因是 id 定义在 Java进程元素上的 然后做了向下偏移到第一个进程上面
        if (this.elementId === 'user-guide-thread') {
            topMask.style.height = `${divOfsset.top - padding + 45}px`;
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
            leftMask.style.top = `${divOfsset.top - padding + 45}px`;
        } else {
            leftMask.style.top = `${divOfsset.top - padding}px`;
        }
        leftMask.style.left = '0';
        leftMask.style.zIndex = '10000';

        const rightMask = document.getElementById('rightMask');
        rightMask.style.height = `${divOfsset.height + padding * 2}px`;
        if (this.elementId === 'user-guide-thread') {
            rightMask.style.top = `${divOfsset.top - padding + 45}px`;
            rightMask.style.left = `${divOfsset.left + divOfsset.width + padding - 150}px`;
            rightMask.style.width = `${
                pageWidth - (divOfsset.left + divOfsset.width) - padding + 150
                }px`;
        } else {
            rightMask.style.top = `${divOfsset.top - padding}px`;
            rightMask.style.left = `${divOfsset.left + divOfsset.width + padding}px`;
            rightMask.style.width = `${
                pageWidth - (divOfsset.left + divOfsset.width) - padding
                }px`;
        }
        rightMask.style.zIndex = '10000';

        const bottomMask = document.getElementById('bottomMask');
        bottomMask.style.width = `100%`;
        if (this.elementId === 'user-guide-thread') {
            bottomMask.style.height = `${
                pageHeight - (divOfsset.top + divOfsset.height) - padding - 45
                }px`;
            bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding + 45}px`;
        } else {
            bottomMask.style.height = `${
                pageHeight - (divOfsset.top + divOfsset.height) - padding
                }px`;
            bottomMask.style.top = `${divOfsset.top + divOfsset.height + padding}px`;
        }
        bottomMask.style.left = '0';
        bottomMask.style.zIndex = '10000';

        const closeBtn = document.getElementById('user-guide-close');
        closeBtn.style.display = 'inline-block';
    }

    /**
     * 显示遮罩
     * @param id id
     * @param type 区分id class
     */
    public showMask(id: any, type = 'id') {
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

        const divOfsset = this.getPoint(obj);
        this.doMask(divOfsset);
        // 最后一步不显示 关闭按钮
        if (id === 'user-guide-done') {
            const close = document.getElementById('user-guide-close');
            close.style.display = 'none';
        }
        this.doTip(this.tips[id], divOfsset, id);
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
        const close = document.getElementById('user-guide-close');
        close.style.display = 'none';
    }
}
