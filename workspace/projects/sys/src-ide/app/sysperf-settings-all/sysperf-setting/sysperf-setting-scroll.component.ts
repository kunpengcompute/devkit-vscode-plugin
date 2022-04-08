import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { SysperfSettingComponent } from './sysperf-setting.component';
import { ToolType } from 'projects/domain';

export class SysPerfScoll {
    public static instance: SysPerfScoll;
    // 页面是否跳转
    private isClickJump = true;
    // 内容滚动框id，当前页面内容区的定义
    private content = 'content';
    // 内容区域的偏移量
    public offsetTop = 0;
    // 页面滚动索引：管理员
    public menuList: any;

    // 普通用户菜单
    private commonContent = 'content';
    public commonList: any;
    public toolType: ToolType;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        SysPerfScoll.instance = this;
        this.toolType = sessionStorage.getItem('toolType') as ToolType;
        this.setMenuListAndCommonList();
    }

    /**
     * 设置导航列数据
     */
    private setMenuListAndCommonList() {
        if (this.toolType === ToolType.TUNINGHELPER) {
            this.menuList = {
                nodeManaga: {
                    menu: 'menuNodeManaga',
                    content: 'itemNodeManaga'
                },
                agent: {
                    menu: 'menuAgent',
                    content: 'itemAgent'
                },
                path: {
                    menu: 'menuPath',
                    content: 'applicationPath'
                },
                operaLog: {
                    menu: 'menuOperaLog',
                    content: 'itemOperaLog'
                },
            };
            this.commonList = {
                nodeManaga: {
                    menu: 'menuNodeManaga',
                    commonContent: 'itemNodeManaga'
                },
                agent: {
                    menu: 'menuAgent',
                    commonContent: 'itemAgent'
                },
                path: {
                    menu: 'menuPath',
                    commonContent: 'applicationPath'
                },
                operaLog: {
                    menu: 'menuOperaLog',
                    commonContent: 'itemOperaLog'
                },
            };
        } else {
            this.menuList = {
                nodeManaga: {
                    menu: 'menuNodeManaga',
                    content: 'itemNodeManaga'
                },
                agent: {
                    menu: 'menuAgent',
                    content: 'itemAgent'
                },
                appointTask: {
                    menu: 'menuAppointTask',
                    content: 'itemAppointTask'
                },
                importAndExport: {
                    menu: 'menuImportAndExportManage',
                    content: 'itemImportAndExportTask'
                },
                taskModel: {
                    menu: 'menuTaskModel',
                    content: 'itemTaskModel'
                },
                path: {
                    menu: 'menuPath',
                    content: 'applicationPath'
                },
                operaLog: {
                    menu: 'menuOperaLog',
                    content: 'itemOperaLog'
                },
            };
            this.commonList = {
                nodeManaga: {
                    menu: 'menuNodeManaga',
                    commonContent: 'itemNodeManaga'
                },
                agent: {
                    menu: 'menuAgent',
                    commonContent: 'itemAgent'
                },
                appointTask: {
                    menu: 'menuAppointTask',
                    commonContent: 'itemAppointTask'
                },
                importAndExport: {
                    menu: 'menuImportAndExportManage',
                    commonContent: 'itemImportAndExportTask'
                },
                taskModel: {
                    menu: 'menuTaskModel',
                    commonContent: 'itemTaskModel'
                },
                path: {
                    menu: 'menuPath',
                    commonContent: 'applicationPath'
                },
                operaLog: {
                    menu: 'menuOperaLog',
                    commonContent: 'itemOperaLog'
                },
            };
        }
    }

    /**
     * 滚动条跳转
     * @param：innerItem
     */
    public jumpScroll(innerItem: string, sysPerfSet: SysperfSettingComponent) {
        this.isClickJump = true;
        this.updateSetThemeColor((sysPerfSet.userRoleFlag) ? this.menuList : this.commonList,
            innerItem, sysPerfSet);
        const contentTopItem = document.getElementById((sysPerfSet.userRoleFlag) ? this.menuList.nodeManaga.content :
            this.commonList.nodeManaga.commonContent);
        this.offsetTop = (contentTopItem.offsetTop) ? contentTopItem.offsetTop : this.offsetTop;
        const contentItem = document.getElementById((sysPerfSet.userRoleFlag) ? this.content : this.commonContent);
        const jumpToItem = document.getElementById(innerItem);
        contentItem.scrollTop = (typeof (contentItem.scrollTop) !== 'undefined' && jumpToItem.offsetTop) ?
            (jumpToItem.offsetTop - this.offsetTop) : this.offsetTop;
    }

    /**
     * 左侧菜单跳转内容框内滚动位置
     */
    public scrollToItem(sysPerfSet: SysperfSettingComponent) {
        // 点击跳转
        if (this.isClickJump) {
            this.isClickJump = false;
            return;
        }
        // 滚动条当前位置
        if (sysPerfSet.userRoleFlag) {
            this.offsetTop = document.getElementById(this.menuList.nodeManaga.content).offsetTop;
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
            this.updateSetThemeColor(menuList, scrollLocationIncontent, sysPerfSet);
        } else {
            this.offsetTop = document.getElementById(this.commonList.nodeManaga.commonContent).offsetTop;
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
            this.updateSetThemeColor(commonList, scrollLocationIncontent, sysPerfSet);
        }
    }

    /**
     * 主题颜色适配
     * @param:setList
     * @param:scrollLocationIncontent
     */
    public updateSetThemeColor(setList: any, scrollLocationIncontent: any, sysPerfSet: SysperfSettingComponent) {
        for (const key of Object.keys(setList)) {
            const menuItem = document.getElementById(setList[key].menu);
            if (menuItem) {
                menuItem.style.outline = 'none';
                if (setList[key].commonContent === scrollLocationIncontent ||
                    setList[key].content === scrollLocationIncontent) {
                    menuItem.style.fontSize = '20px';
                    menuItem.style.color = (sysPerfSet.currTheme === COLOR_THEME.Light) ? '#222222' : '#E8E8E8';
                } else {
                    menuItem.style.fontSize = '16px';
                    menuItem.style.color = (sysPerfSet.currTheme === COLOR_THEME.Light) ? '#616161' : '#AAAAAA';
                }
            }
        }
    }

    /**
     * 时刻监听主题切换，适配高亮左侧菜单
     */
    public highLightMenu(sysPerfSet: SysperfSettingComponent) {
        const highLightList = (sysPerfSet.userRoleFlag) ? this.menuList : this.commonList;
        for (const key of Object.keys(highLightList)) {
            if (highLightList.hasOwnProperty(key)) {
                const menuItem = document.getElementById(highLightList[key].menu);
                if (!menuItem) {
                    return;
                }
                if (menuItem.style.fontSize === '20px') {
                    menuItem.style.color = (sysPerfSet.currTheme === COLOR_THEME.Light) ? '#222222' : '#E8E8E8';
                } else {
                    menuItem.style.color = (sysPerfSet.currTheme === COLOR_THEME.Light) ? '#616161' : '#AAAAAA';
                }
            }
        }
    }
}
