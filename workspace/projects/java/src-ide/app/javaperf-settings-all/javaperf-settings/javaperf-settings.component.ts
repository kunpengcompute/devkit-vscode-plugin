import { Component, OnInit } from '@angular/core';
import { MytipService } from '../../service/mytip.service';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { JavaPerfScoll } from './javaperf-setting-scroll.component';
import { Util } from '@cloud/tiny3';
import { MessageService } from '../../service/message.service';

@Component({
    selector: 'app-javaperf-settings',
    templateUrl: './javaperf-settings.component.html',
    styleUrls: ['./javaperf-settings.component.scss']
})

export class JavaperfSettingsComponent implements OnInit {

    constructor(
        public i18nService: I18nService,
        public router: Router,
        private route: ActivatedRoute,
        public vscodeService: VscodeService,
        public mytip: MytipService,
        private msgService: MessageService
    ) {
        JavaperfSettingsComponent.instance = this;
        this.i18n = this.i18nService.I18n();
        this.javaPerfScroll = new JavaPerfScoll(i18nService, vscodeService);
    }

    // 静态实例常量
    public static instance: JavaperfSettingsComponent;
    public i18n: any;
    public currTheme: any;
    public javaPerfScroll: JavaPerfScoll;
    public projects: any;
    // 判断是否是管理员或普通用户
    public userRoleFlag = false;
    // 判断当前是否加载完毕
    public isInited = false;
    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    /**
     * 组件初始化
     */
    ngOnInit() {
        // 跳转至页面指定位置
        this.route.queryParams.subscribe((data) => {
            if (!this.isInited) {
                setTimeout(() => {
                    this.jumpScroll(data.innerItem);
                }, 1000);
            }
            if (data.role) {
                ((self as any).webviewSession || {}).setItem('role', 'Admin');
                this.userRoleFlag = true;
            } else {
                this.userRoleFlag = VscodeService.isAdmin();
            }
        });

        // 用户角色判断

        this.msgService.getMessage().subscribe((msg) => {
            if (msg.value === 'javaperfsetting') {
                this.jumpScroll(msg.type);
            }
        });
        // 获取VSCode当前主题颜色
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        // 监听主题变更事件
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.highLightMenu();
        });

        // 注册滚动条事件
        this.ngScroll();

        // 页面加载完毕
        this.isInited = true;
    }

    /**
     * 时刻监听主题切换，适配高亮左侧菜单
     */
    public highLightMenu() {
        this.javaPerfScroll.highLightMenu(this);
    }

    /**
     * 滚动条跳转
     * @param：innerItem
     */
    public jumpScroll(innerItem: string) {
        this.javaPerfScroll.jumpScroll(innerItem, this);
    }

    /**
     * 左侧菜单跳转内容框内滚动位置
     */
    scrollToItem() {
        this.javaPerfScroll.scrollToItem(this);
    }

    /**
     * 主题颜色适配
     * @param:setList
     * @param:scrollLocationIncontent
     */
    updateSetThemeColor(setList: any, scrollLocationIncontent: any) {
        this.javaPerfScroll.updateSetThemeColor(setList, scrollLocationIncontent, this);
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
}
