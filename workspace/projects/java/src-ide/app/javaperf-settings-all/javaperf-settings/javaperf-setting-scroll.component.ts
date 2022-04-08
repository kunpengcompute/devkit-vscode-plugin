import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { JavaperfSettingsComponent } from './javaperf-settings.component';

export class JavaPerfScoll {
    public static instance: JavaPerfScoll;
    // 页面是否跳转
    private isClickJump = true;
    // 内容滚动框id，当前页面内容区的定义
    private content = 'content';
    // 内容区域的偏移量
    public offsetTop = 0;
    // 页面滚动索引：管理员
    public menuList: any = {
        guardianManage: {
            menu: 'menuGuardianManage',
            content: 'itemguardianManage'
        },
        workingKey: {
            menu: 'menuWorkingkey',
            content: 'itemWorkingkey'
        },
        itemConfiguration: {
            menu: 'menuConfiguration',
            content: 'itemConfiguration'
        },
        runLog: {
            menu: 'menuRunLog',
            content: 'itemRunLog'
        },
        menuSecretkey: {
            menu: 'menuSecretkey',
            content: 'itemSecretKey'
        },
        samplingReportManage: {// 采样报告阈值
            menu: 'menuReportManage',
            content: 'itemReportManage'
        },
    };

    // 普通用户菜单
    private commonContent = 'content';
    public commonList: any = {
        guardianManage: {
            menu: 'menuGuardianManage',
            commonContent: 'itemguardianManage'
        },
        itemConfiguration: {
            menu: 'menuConfiguration',
            commonContent: 'itemConfiguration'
        },
        operaLog: {
            menu: 'menuOperaLog',
            commonContent: 'itemOperaLog'
        },
        samplingReportManage: {// 采样报告阈值
            menu: 'menuReportManage',
            commonContent: 'itemReportManage'
        },
    };

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        JavaPerfScoll.instance = this;
    }

    /**
     * 滚动条跳转
     * @param：innerItem
     */
    public jumpScroll(innerItem: string, javaPerfSet: JavaperfSettingsComponent) {
        this.isClickJump = true;
        if (javaPerfSet.userRoleFlag) {
            this.updateSetThemeColor(this.menuList, innerItem, javaPerfSet);
            this.offsetTop = document.getElementById(this.menuList.guardianManage.content).offsetTop;
            document.getElementById(this.content).scrollTop =
            document.getElementById(innerItem).offsetTop - this.offsetTop;
        } else {
            this.updateSetThemeColor(this.commonList, innerItem, javaPerfSet);
            this.offsetTop = document.getElementById(this.commonList.guardianManage.commonContent).offsetTop;
            document.getElementById(this.commonContent).scrollTop =
            document.getElementById(innerItem).offsetTop - this.offsetTop;
        }
    }

    /**
     * 左侧菜单跳转内容框内滚动位置
     */
    public scrollToItem(javaPerfSet: JavaperfSettingsComponent) {
        // 点击跳转
        if (this.isClickJump) {
            this.isClickJump = false;
            return;
        }
        // 滚动条当前位置
        if (javaPerfSet.userRoleFlag) {
            this.offsetTop = document.getElementById(this.menuList.guardianManage.content).offsetTop;
            const menuList = this.menuList;
            const scrollocation = document.getElementById(this.content).scrollTop + this.offsetTop;
            let scrollLocationIncontent = '';
            // 获取滚动条在组件内的位置
            for (const key of Object.keys(menuList)) {
                if (menuList.hasOwnProperty(key)) {
                    if (document.getElementById(menuList[key].content).offsetTop <= scrollocation) {
                        scrollLocationIncontent = menuList[key].content;
                    }
                }
            }
            //  随滚动条更新菜单组件样式高亮
            this.updateSetThemeColor(menuList, scrollLocationIncontent, javaPerfSet);
        } else {
            this.offsetTop = document.getElementById(this.commonList.guardianManage.commonContent).offsetTop;
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
            this.updateSetThemeColor(commonList, scrollLocationIncontent, javaPerfSet);

        }
    }

    /**
     * 主题颜色适配
     * @param:setList
     * @param:scrollLocationIncontent
     */
    public updateSetThemeColor(setList: any, scrollLocationIncontent: any, javaPerfSet: JavaperfSettingsComponent) {
        for (const key of Object.keys(setList)) {
            const setListMenu = document.getElementById(setList[key].menu);
            if (!setListMenu) {
                return;
            }
            setListMenu.style.outline = 'none';
            if (setList.hasOwnProperty(key)) {
                if (setList[key].commonContent === scrollLocationIncontent ||
                    setList[key].content === scrollLocationIncontent) {
                    setListMenu.style.fontSize = '20px';
                    setListMenu.style.color = (javaPerfSet.currTheme === COLOR_THEME.Light) ? '#222222' : '#E8E8E8';
                } else {
                    setListMenu.style.fontSize = '16px';
                    setListMenu.style.color = (javaPerfSet.currTheme === COLOR_THEME.Light) ? '#616161' : '#AAAAAA';
                }
            }
        }
    }

    /**
     * 时刻监听主题切换，适配高亮左侧菜单
     */
    public highLightMenu(javaPerfSet: JavaperfSettingsComponent) {
        const highLightList = (javaPerfSet.userRoleFlag) ? this.menuList : this.commonList;
        for (const key of Object.keys(highLightList)) {
            if (highLightList.hasOwnProperty(key)) {
                const menuItem = document.getElementById(highLightList[key].menu);
                if (!menuItem) {
                    return;
                }
                if (menuItem.style.fontSize === '20px') {
                    menuItem.style.color = (javaPerfSet.currTheme === COLOR_THEME.Light) ? '#222222' : '#E8E8E8';
                } else {
                    menuItem.style.color = (javaPerfSet.currTheme === COLOR_THEME.Light) ? '#616161' : '#AAAAAA';
                }
            }
        }
    }
}
