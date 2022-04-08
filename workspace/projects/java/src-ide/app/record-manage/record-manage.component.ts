import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Util } from '@cloud/tiny3';
import { ActivatedRoute } from '@angular/router';
import { VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';

@Component({
    selector: 'app-record-manage',
    templateUrl: './record-manage.component.html',
    styleUrls: ['./record-manage.component.scss']
})
export class RecordManageComponent implements OnInit, AfterViewInit {

    public i18n: any;
    public currLang = '';
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private route: ActivatedRoute
    ) {
        this.i18n = this.i18nService.I18n();
    }
    // 页面菜单-内容组件ID对应关系
    // 普通用户登录菜单
    public commonList: any = {
        profilling: {
            menu: 'profillingAnalysisRecord',
            commonContent: 'profillingAnalysisRecordManage'
        },
        sampling: {
            menu: 'samplingAnalysisRecord',
            commonContent: 'samplingAnalysisRecordManage'
        }
    };
    private commonContent = 'content';
    // 内容框偏移量
    public offsetTop = 0;
    private isClickJump = true;

    // 公共
    public changeRe = false;
    public comchange = false;

    // 阈值设置
    public safeMessage = '';
    public dangerousMessage = '';
    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 滚动条跳转
     * @param:innerItem
     */
    jumpScroll(innerItem: string) {
        this.isClickJump = true;

        this.updateSetThemeColor(this.commonList, innerItem);
        this.offsetTop = document.getElementById(this.commonList.profilling.commonContent).offsetTop;
        document.getElementById(this.commonContent).scrollTop =
         document.getElementById(innerItem).offsetTop - this.offsetTop;

    }

    /**
     * 左侧菜单跳转内容框内滚动位置
     */
    scrollToItem() {
        // 点击跳转
        if (this.isClickJump) {
            this.isClickJump = false;
            return;
        }

        this.offsetTop = document.getElementById(this.commonList.profilling.commonContent).offsetTop;
        const commonList = this.commonList;
        const scrollocation = document.getElementById(this.commonContent).scrollTop + this.offsetTop;
        let scrollLocationIncontent = '';
        // 获取滚动条在组件内的位置
        for (const key of Object.keys(commonList)) {
            if (commonList.hasOwnProperty(key)) {
                if (document.getElementById(commonList[key].commonContent).offsetTop <= scrollocation) {
                    scrollLocationIncontent = commonList[key].commonContent;
                }
            }
        }
        //  随滚动条更新菜单组件样式高亮
        this.updateSetThemeColor(commonList, scrollLocationIncontent);
    }

    /**
     * 主题颜色适配
     * @param:setList
     * @param:scrollLocationIncontent
     */
    updateSetThemeColor(setList: any, scrollLocationIncontent: any) {
        const themeClass = document.body.className;
        for (const key of Object.keys(setList)) {
            if (setList.hasOwnProperty(key)) {
                if (setList[key].commonContent === scrollLocationIncontent ||
                    setList[key].content === scrollLocationIncontent) {
                    document.getElementById(setList[key].menu).style.fontSize = '20px';
                    document.getElementById(setList[key].menu).style.outline = 'none';
                    if (themeClass === 'vscode-light') {
                        document.getElementById(setList[key].menu).style.color = '#222222';
                    } else {
                        document.getElementById(setList[key].menu).style.color = '#E8E8E8';
                    }
                } else {
                    document.getElementById(setList[key].menu).style.fontSize = '16px';
                    if (themeClass === 'vscode-light') {
                        document.getElementById(setList[key].menu).style.color = '#616161';
                    } else {
                        document.getElementById(setList[key].menu).style.color = '#AAAAAA';
                    }
                }
            }
        }
    }

    /**
     * 注册指定组件滚动条事件
     */
    ngScroll() {
        document.getElementById('content').addEventListener('scroll', () => {
            this.scrollToItem();
            Util.trigger(document, 'tiScroll');
        });
    }

    /**
     * 注册指定组件滚动条事件,初始化组件后调用
     */
    ngAfterViewInit() {
        this.route.queryParams.subscribe((data) => {
            this.jumpScroll(data.innerItem);
        });
        this.ngScroll();
    }
}
