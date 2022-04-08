import { Component, OnInit, ViewChild, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { TiTableColumns, TiTableRowData, TiValidationConfig, TiMessageService, Util } from '@cloud/tiny3';
import { TiModalService, TiModalRef } from '@cloud/tiny3';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    MytipService, I18nService, UtilsService, CustomValidators, VscodeService, COLOR_THEME, MessageService
} from '../service';
import { Router, ActivatedRoute } from '@angular/router';
import { ThresholdSet } from './port-setting.threshold.component';
import { DepParamSet } from './port-setting.depparam.component';
import { UserManager } from './port-setting.usermanager.component';
import { LoginConfig } from './port-setting.loginconfig.component';
import {VerifierUtil} from '../../../../hyper';

const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

const enum MESSAGE_MAP {
    SHOW_PROGRESS = 'getStatus',
    SHOW_COMMON_PROGRESS = 'getMenuStatus',
    FILE_SIZE_EXCEEED = 'fileSizeExceed',
    FILE_UPLOAD = 'uploadFile',
    PROCESS_FAILED = 'processFailed'
}

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    MAXIMUM_TASK = '0x010125', // 文件上传任务已达到上限
    INSUFFICIENT_SPACE = 2
}

// 上传文件最大限制
const MAX_FILE_SIZE = 500;

// 异常情况，最小文件限制
const MIN_FILE_SIZE = 1;

@Component({
    selector: 'app-port-setting',
    templateUrl: './port-setting.component.html',
    styleUrls: ['./port-setting.component.scss']
})

export class PortsetComponent implements OnInit, OnDestroy {
    constructor(
        public tiModal: TiModalService,
        public timessage: TiMessageService,
        public fb: FormBuilder,
        public elementRef: ElementRef,
        public router: Router,
        public mytip: MytipService,
        public i18nService: I18nService,
        private $location: PlatformLocation,
        public vscodeService: VscodeService,
        private route: ActivatedRoute,
        public utilsService: UtilsService,
        public renderer2: Renderer2,
        private msgService: MessageService
    ) {
        PortsetComponent.instance = this;
        this.i18n = this.i18nService.I18n();
        $location.onPopState(() => { });
        this.depParamSet = new DepParamSet(i18nService, vscodeService, msgService);
        this.thresholdSet = new ThresholdSet(i18nService, vscodeService);
        this.userManager = new UserManager(timessage, fb, mytip, i18nService, vscodeService);
        this.loginConfig = new LoginConfig(i18nService, vscodeService);
        // 监听主题变化事件
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currentTheme = msg.colorTheme;
        });
    }
    // 静态实例常量
    public static instance: PortsetComponent;
    public currTheme = COLOR_THEME.Dark;
    public currentTheme = 1;
    public thresholdSet: ThresholdSet;
    public depParamSet: DepParamSet;
    public userManager: UserManager;
    public loginConfig: LoginConfig;

    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    // 普通用户菜单内容
    private commonContent = 'content';
    public textType: any = {
        type1: 'password',
        type2: 'password',
        type3: 'password',
        type4: 'password',
        type5: 'password',
        type6: 'password',
        type7: 'password',
        type8: 'password',
        type9: 'password',
        type10: 'password',
        type11: 'password',
        type12: 'password',
        type13: 'password',
        type14: 'password',
    };
    // port设置页面索引
    public menuList: any = {
        user: {
            menu: 'menuUser',
            content: 'itemUser'
        },
        weakPasswordDictionary: {
            menu: 'menuWeakPasswordDictionary',
            content: 'itemWeakPasswordDictionary'
        },
        sysSetting: {
            menu: 'menuSysSetting',
            content: 'itemSysSetting'
        },
        operatlog: {
            menu: 'menuOperatlog',
            content: 'itemOperatlog'
        },
        runlog: {
            menu: 'menuRunlog',
            content: 'itemRunlog'
        },
        whiteList: {
            menu: 'menuWhitelist',
            content: 'itemWhitelist'
        },
        migraTemp: {
            menu: 'menuMigratemp',
            content: 'itemMigratemp'
        },
        depParam: {
            menu: 'menuDepparam',
            content: 'itemDepparam'
        },
        threshold: {
            menu: 'menuThreshold',
            content: 'itemThreshold'
        },
        webServerCertificate: {
            menu: 'menuWebServerCertificate',
            content: 'itemWebServerCertificate'
        },
      certificateRevocationList: {
        menu: 'menuCertificateRevocationList',
        content: 'itemCertificateRevocationList'
      }
    };

    // 普通用户登录菜单
    public commonList: any = {
        modifyPsw: {
            menu: 'menuModifypsw',
            commonContent: 'itemModifypsw'
        },
        weakPasswordDictionary: {
            menu: 'menuWeakPasswordDictionary',
            commonContent: 'itemWeakPasswordDictionary'
        },
        loginConfig: {
            menu: 'menuLogin',
            commonContent: 'itemLogin'
        },
        operatlog: {
            menu: 'menuOperatlog',
            commonContent: 'itemOperatlog'
        },
        depParam: {
            menu: 'menuDepparam',
            commonContent: 'itemDepparam'
        },
        webServerCertificate: {
            menu: 'menuWebServerCertificate',
            commonContent: 'itemWebServerCertificate'
        },
      certificateRevocationList: {
        menu: 'menuCertificateRevocationList',
        commonContent: 'itemCertificateRevocationList'
      },
    };

    // 公共变量
    public changeRe = false;
    public userPwd: any = '';
    public username: string;
    public loginUserId: string;
    public role: string;
    public userRoleFlag = false;
    public i18n: any;
    public currLang: any;
    // 阈值设置
    public configData = {
        keepGoing: {
            label: '',
            selected: {
                label: '',
                value: 1
            },
            options: [
                {
                    label: '',
                    value: 1
                },
                {
                    label: '',
                    value: 0
                }
            ]
        },
        cLine: {
            label: '',
            value: '',
            required: true
        },
        asmLine: {
            label: '',
            value: '',
            required: true
        },
        pMonthFlag: {
            label: '',
            selected: {
                label: '',
                value: 1
            },
            options: [
                {
                    label: '',
                    value: 1
                },
                {
                    label: '',
                    value: 0
                }
            ]
        }
    };
    public safeMessage = '';
    public dangerousMessage = '';

    // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public displayed: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];
    public label: any;
    public createRoleForm: FormGroup;
    public resetPwdForm: FormGroup;
    public delRoleForm: FormGroup;
    public changePwdForm: FormGroup;
    public configForm: FormGroup;
    public isManager = false;
    public workspace: string;
    public workspaceOnlyRead: string;

    // 错误信息与弹框
    public isDangerous = false;
    public errorMessage: string;
    public isDangerousUser = false;
    public errorMessageUser: string;
    public isDangerousRes = false;
    public errorMessageRes: string;
    public isDangerousDel = false;
    public errorMessageDel: string;
    public isDangerousEdt = false;
    public errorMessageEdt: string;

    // 用户管理成功信息提示框
    public createUserTips: string;
    public deleteUserTips: string;
    public changePwdTips: string;
    public resetPwdTips: string;

    // 登录设置变量
    public changeLogin = false;
    public loginConfigForm: FormGroup;
    public rememberPwd: any;
    public autoLogin: any;
    public isSystem = false;
    public rememberPwdSelect = {
        label: '',
        selected: {
            label: '',
            value: 1
        },
        options: [
            {
                label: '',
                value: 1
            },
            {
                label: '',
                value: 0
            }
        ]
    };
    public autoLoginSelect = {
        label: '',
        selected: {
            label: '',
            value: 1
        },
        options: [
            {
                label: '',
                value: 1
            },
            {
                label: '',
                value: 0
            }
        ]
    };


    private isClickJump = true;
    public clickItem = '';
    private scrollInit = 0;
    // 内容滚动框id，当前页面内容区的定义
    private content = 'content';
    // 内容区域的偏移量
    public offsetTop = 0;
    public comchange = false;
    // 软件迁移模板
    public managePwdTips = '';
    public backupPwdFlag = false;
    public upgradePwdFlag = false;
    public recoveryPwdFlag = false;
    public twicepwd: any;
    public migBackupPwd: any;
    public migUpgradePwd: any;
    public migRecoveryPwd: any;
    public migBackupShow = false;
    public migRecoverShow = false;
    public migUpgradeShow = false;
    public isUploading: any;
    public managementTaskId: string;
    public inputPrompt: string;
    public startGrade = false;
    public startRecover = false;
    public info = {
        filename: '',
        filesize: ''
    };
    // 迁移操作
    public doings: string;
    // 迁移操作密码校验
    public pwdDoing: boolean;
    // 取消迁移模板操作
    public cancelDoing: any;
    // 表单数据
    public inputItems = {
        packpath: {
            label: '',
            value: '',
            required: true
        }
    };
    public cloudIdeInterval: any;
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    // 判断当前是否加载完毕
    public isInited = false;

    // 页面菜单-内容组件ID对应关系
    @ViewChild('CreateUserPage', { static: false }) CreateUserPage: any;
    @ViewChild('ResetPwdPage', { static: false }) ResetPwdPage: any;
    @ViewChild('ModifyPwdPage', { static: false }) ModifyPwdPage: any;
    @ViewChild('DelUserPage', { static: false }) DelUserPage: any;
    @ViewChild('report', { static: false }) reportMask: any;
    @ViewChild('container', { static: true }) containerRef: ElementRef;

    public modifyPwdModal: TiModalRef;

    public pluginUrlCfg: any = {
        portingPackages: '',
    };
    public updateUser = '';
    public showCreateModal: boolean;
    public showResetModal: boolean;
    public showDeleteModal: boolean;

    ngOnInit() {
        this.cloudIdeInterval = setInterval(() => {
            navigator.serviceWorker.ready.then((registration: any) => {
                if (registration.active) {
                    registration.active.postMessage({ channel: 'keepalive' });
                }
            });
        }, 20000);
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        if ((navigator.platform === 'Win32') || (navigator.platform === 'Windows')) {
            this.isSystem = true;
        }

        // 跳转至页面指定位置
        this.route.queryParams.subscribe(data => {
            if (!this.isInited) {
                setTimeout(() => {
                    this.clickItem = data.innerItem;
                    this.jumpScroll(data.innerItem);
                }, 1000);
            }
        });

        this.msgService.getMessage().subscribe(msg => {
            if (msg.value === 'portsettings') {
                this.jumpScroll(msg.type);
            }
        });
        if (document.body.className === 'vscode-light') {
            this.currTheme = COLOR_THEME.Light;
        }
        // 注册滚动条事件
        this.ngScroll();

        // 监听主题变更事件
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.highLightMenu();
        });
        if (((self as any).webviewSession || {}).getItem('role') === 'Admin') {
            this.userRoleFlag = true;
            this.comchange = true;
            this.userManager.getUserList();
            this.showReportMask();
        }
        this.label = {
            Name: this.i18n.common_term_user_label.name,
            Role: this.i18n.common_term_user_label.role,
            Setpwd: this.i18n.common_term_soinfo_reset,
            Pwd: this.i18n.common_term_user_label.password,
            Cpwd: this.i18n.common_term_user_label.confirmPwd,
            oldPwd: this.i18n.common_term_user_label.oldPwd,
            Workspace: this.i18n.common_term_user_label.workspace,
            AdminPwd: this.i18n.common_term_user_label.adminPwd,
            newPwd: this.i18n.common_term_user_label.newPwd,
            userPwd: this.i18n.common_term_userPwd_label,
        };

        this.safeMessage = this.i18n.commom_term_min_err;
        this.dangerousMessage = this.i18n.commom_term_max_err;
        this.managePwdTips = this.i18n.plugins_porting_tips_managePwdCheck;

        // 业务办理成功的提示
        this.createUserTips = this.i18n.plugins_porting_tips_createUser;
        this.deleteUserTips = this.i18n.plugins_porting_tips_deleteUser;
        this.changePwdTips = this.i18n.plugins_porting_tips_changePwd;
        this.resetPwdTips = this.i18n.plugins_porting_tips_resetPwd;

        // 用户管理，列名
        this.columns = [{
            title: this.i18n.common_term_user_label.name
        },
        {
            title: this.i18n.common_term_user_label.role
        },
        {
            title: this.i18n.common_term_user_label.workspace,
            width: '30%'
        },
        {
            title: this.i18n.common_term_operate,
            width: '30%'
        }
        ];
        this.configForm = new FormGroup({
            keepGoing: new FormControl('', []),
            cLine: new FormControl('', [CustomValidators.configVal(this.i18n)]),
            asmLine: new FormControl('', [CustomValidators.configVal(this.i18n)]),
            pMonthFlag: new FormControl('', []),
            userPwd: new FormControl('', [])
        });
        this.loginConfigForm = new FormGroup({
            rememberPwdSelect: new FormControl('', []),
            autoLoginSelect: new FormControl('', [])
        });
        this.createRoleForm = new FormGroup({
            name: new FormControl('', [CustomValidators.checkUserName(this.i18n)]),
            workspace: new FormControl('', []),
            cadminPwd: new FormControl('', [CustomValidators.checkAdminPwd(this.i18n)]),
            pwd: new FormControl('', [CustomValidators.checkPwd(this.i18n), this.compareCreateCpwd]),
            cpwd: new FormControl('', [this.createRoleConfirmPwd])
        });
        this.resetPwdForm = new FormGroup({
            name: new FormControl('', [CustomValidators.checkUserName(this.i18n)]),
            workspace: new FormControl('', []),
            radminPwd: new FormControl('', [CustomValidators.checkAdminPwd(this.i18n)]),
            pwd: new FormControl('', [CustomValidators.checkPwd(this.i18n), this.compareResetCpwd]),
            cpwd: new FormControl('', [this.resetPwdConfirmPwd])
        });
        this.delRoleForm = new FormGroup({
            dadminPwd: new FormControl('', [CustomValidators.checkAdminPwd(this.i18n)])
        });
        this.changePwdForm = new FormGroup({
            name: new FormControl('', []),
            oldPwd: new FormControl(
                '',
                [CustomValidators.checkOldPwd(this.i18n), CustomValidators.checkPwd(this.i18n)]
            ),
            pwd: new FormControl('', [this.updateInitPwdConfirm]),
            cpwd: new FormControl('', [this.userPwdConfirm])
        });
        this.userManager.pwdControl = new FormControl('', [CustomValidators.checkAdminPwd(this.i18n)]);
        this.loginUserId = ((self as any).webviewSession || {}).getItem('loginId');
        this.username = ((self as any).webviewSession || {}).getItem('username');
        this.role = ((self as any).webviewSession || {}).getItem('role');
        this.currLang = I18nService.getLang();
        this.configData.keepGoing.label = this.i18n.common_term_keep_going_tip;
        this.configData.cLine.label = this.i18n.plugins_porting_term_c_line;
        this.configData.asmLine.label = this.i18n.plugins_porting_term_asm_line;
        this.configData.pMonthFlag.label = this.i18n.plugins_porting_term_p_month_flag;
        this.configData.pMonthFlag.options[0].label = this.i18n.common_term_yes;
        this.configData.pMonthFlag.options[1].label = this.i18n.common_term_no;
        this.configData.pMonthFlag.selected.label = this.i18n.common_term_yes;
        this.configData.keepGoing.options[0].label = this.i18n.common_term_yes;
        this.configData.keepGoing.options[1].label = this.i18n.common_term_no;
        this.configData.keepGoing.selected.label = this.i18n.common_term_yes;
        this.showConfigMask();
        const option = {
            url: '/customize/'
        };

        this.vscodeService.get(option, (data: any) => {
            if (data.status === 0) {
                this.workspace = `${data.data.customize_path}/portadv/`;
                this.workspaceOnlyRead = `${data.data.customize_path}/portadv/`;
                this.inputPrompt =
                    this.i18n.plugins_porting_tips_upgrade_inputprompt
                    + `${data.data.customize_path}/admin/`
                    + this.i18n.plugins_porting_tips_upgrade_inputpromptsub;
            }
        });

        this.rememberPwdSelect.label = this.i18n.plugins_porting_label_rememberPwd;
        this.autoLoginSelect.label = this.i18n.plugins_porting_label_autoLogin;
        this.rememberPwdSelect.options[0].label = this.i18n.common_term_yes;
        this.rememberPwdSelect.options[1].label = this.i18n.common_term_no;
        this.rememberPwdSelect.selected.label = this.i18n.common_term_yes;
        this.autoLoginSelect.options[0].label = this.i18n.common_term_yes;
        this.autoLoginSelect.options[1].label = this.i18n.common_term_no;
        this.autoLoginSelect.selected.label = this.i18n.common_term_yes;

        this.loginConfig.getLoginConfig(this);

        // 页面加载完毕
        this.isInited = true;
    }

    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        clearInterval(this.cloudIdeInterval);
    }

    /**
     * 滚动条跳转
     * @param：innerItem
     */
    jumpScroll(innerItem: string) {
        this.isClickJump = true;
        if (this.userRoleFlag) {
            this.msgService.sendMessage({type: 'refreshOperationLog'});
            this.updateSetThemeColor(this.menuList, innerItem);
            this.offsetTop = document.getElementById(this.menuList.user.content).offsetTop;
            document.getElementById(this.content).scrollTop =
                document.getElementById(innerItem).offsetTop
                - this.offsetTop;
        } else {
            this.updateSetThemeColor(this.commonList, innerItem);
            this.offsetTop = document.getElementById(this.commonList.modifyPsw.commonContent).offsetTop;
            document.getElementById(this.commonContent).scrollTop =
                document.getElementById(innerItem).offsetTop
                - this.offsetTop;
        }
    }

    /**
     * 左侧菜单跳转内容框内滚动位置
     */
    scrollToItem() {
        // 点击跳转
        this.scrollInit = this.scrollInit + 1; // 进入设置界面点击web证书和吊销列表会进入两次，造成样式不正常
        if (this.isClickJump || this.scrollInit < 3) {
              this.isClickJump = false;
              return;
        }

        // 滚动条当前位置
        if (this.userRoleFlag) {
            const menuList = this.menuList;
            const menuListKeys = Object.keys(menuList);
            this.offsetTop = document.getElementById(menuList[menuListKeys[0]].content).offsetTop;
            const scrollocation = document.getElementById(this.content).scrollTop + this.offsetTop;
            let scrollLocationIncontent = '';
            // 获取滚动条在组件内的位置
            for (const key of menuListKeys) {
                if (menuList.hasOwnProperty(key)) {
                    if (document.getElementById(menuList[key].content).offsetTop <= scrollocation) {
                        scrollLocationIncontent = menuList[key].content;
                    }
                }
            }
            // 刷新操作日志
            if (scrollLocationIncontent !== this.menuList.operatlog.content) {
                this.msgService.sendMessage({type: 'refreshOperationLog'});
              }
            if (this.clickItem) {
              scrollLocationIncontent =
                this.clickItem === scrollLocationIncontent
                  ? scrollLocationIncontent
                  : this.clickItem;
              this.clickItem = '';
            }
            //  随滚动条更新菜单组件样式高亮
            this.updateSetThemeColor(menuList, scrollLocationIncontent);
        } else {
            const commonList = this.commonList;
            const commonListKeys = Object.keys(commonList);
            this.offsetTop = document.getElementById(commonList[commonListKeys[0]].commonContent).offsetTop;
            const scrollocation = document.getElementById(this.commonContent).scrollTop + this.offsetTop;
            let scrollLocationIncontent = '';
            // 获取滚动条在组件内的位置
            for (const key of commonListKeys) {
                if (commonList.hasOwnProperty(key)) {
                    if (document.getElementById(commonList[key].commonContent).offsetTop <= scrollocation) {
                        scrollLocationIncontent = commonList[key].commonContent;
                    }
                }
            }
            //  随滚动条更新菜单组件样式高亮
            if (this.clickItem) {
              scrollLocationIncontent =
                this.clickItem === scrollLocationIncontent
                  ? scrollLocationIncontent
                  : this.clickItem;
              this.clickItem = '';
            }
            this.updateSetThemeColor(commonList, scrollLocationIncontent);

        }
    }

    /**
     * 主题颜色适配
     * @param:setList
     * @param:scrollLocationIncontent
     */
    updateSetThemeColor(setList: any, scrollLocationIncontent: any) {
        for (const key of Object.keys(setList)) {
            if (setList.hasOwnProperty(key)) {
                const setListMenu = document.getElementById(setList[key].menu);
                setListMenu.style.outline = 'none';
                if (
                    setList[key].commonContent === scrollLocationIncontent
                    || setList[key].content === scrollLocationIncontent
                ) {
                    setListMenu.style.fontSize = '20px';
                    setListMenu.style.color = (this.currTheme === COLOR_THEME.Light) ? '#222222' : '#E8E8E8';
                } else {
                    setListMenu.style.fontSize = '16px';
                    setListMenu.style.color = (this.currTheme === COLOR_THEME.Light) ? '#616161' : '#AAAAAA';
                }
            }
        }
    }

    /**
     * 时刻监听主题切换，适配高亮左侧菜单
     */
    public highLightMenu() {
        const highLightList = (this.userRoleFlag) ? this.menuList : this.commonList;
        for (const key of Object.keys(highLightList)) {
            if (highLightList.hasOwnProperty(key)) {
                const menuItem = document.getElementById(highLightList[key].menu);
                if (!menuItem) {
                    return;
                }
                if (menuItem.style.fontSize === '20px') {
                    menuItem.style.color = (this.currTheme === COLOR_THEME.Light) ? '#222222' : '#E8E8E8';
                } else {
                    menuItem.style.color = (this.currTheme === COLOR_THEME.Light) ? '#616161' : '#AAAAAA';
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

    // 查询扫描参数设置数据
    public showConfigMask() {
        this.depParamSet.showConfigMask(this);
    }

    // 开始修改扫描参数
    public modifyDepParam() {
        this.depParamSet.modifyDepParam();
    }

    // C/C++代码前移工作量异常判断
    cLineCheck() {
        this.depParamSet.cLineCheck(this);
    }

    // 汇编代码代码前移工作量异常判断
    asmLineCheck() {
        this.depParamSet.asmLineCheck(this);
    }
    // 确认修改扫描参数
    public configOk() {
        this.depParamSet.configOk(this);
    }

    // 成功修改扫描参数，与Vscode交互
    modifyDepParaSuc(data: any) {
        this.depParamSet.modifyDepParaSuc(data);
    }

    // 取消修改扫描参数
    public configCancel() {
        this.depParamSet.configCancel(this);
    }

    // 校验扫描参数密码
    depparamPwdCheck() {
        this.depParamSet.depparamPwdCheck();
    }

    /**
     * 查询历史报告阈值
     */
    showReportMask() {
        this.thresholdSet.showReportMask();
    }

    /**
     * 修改历史报告阈值
     */
    public changeReport() {
        this.thresholdSet.changeReport(this);
    }

    /**
     * 取消修改历史报告阈值
     */
    changeReportCancel() {
        this.thresholdSet.changeReportCancel(this);
    }

    /**
     * 成功修改历史报告阈值设置
     */
    public reportOk() {
        this.thresholdSet.reportOk(this);
    }

    /**
     * 报告提示阈值异常判断
     */
    safenumsCheck() {
        this.thresholdSet.safenumsCheck();
    }

    /**
     * 报告最大阈值异常判断
     */
    dangerousnumsCheck() {
        this.thresholdSet.dangerousnumsCheck();
    }

    // 发送消息给vscode, 右下角弹出提醒框
    showMessageByLang(data: any, type: any) {
        if (this.currLang === LANGUAGE_TYPE.ZH) {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }

    // 发送消息给vscode, 右下角弹出提醒框
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    // 开始上传迁软件移包
    zipUpload() {
        this.elementRef.nativeElement.querySelector('#zipload').value = '';
        this.elementRef.nativeElement.querySelector('#zipload').click();
    }

    public isRight() {
        if (this.inputItems.packpath.value) {
            this.inputItems.packpath.value = this.inputItems.packpath.value.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
        }
    }

    // 上传迁移模板升级资源包
    uploadMigFile() {
        this.isUploading = true;
        const file = this.elementRef.nativeElement.querySelector('#zipload').files[0];
        this.info.filename = file.name;
        const size = file.size / 1024 / 1024;

        // 上传最大文件校验
        if (size > MAX_FILE_SIZE) {
            this.isUploading = false;
            this.showInfoBox(this.i18n.plugins_porting_message_fileExceedMaxSize, 'warn');
            return true;
        }
        this.info.filesize = size.toFixed(1);

        // 文件重复上传校验
        const options = {
            url: '/portadv/solution/package/status/?filename=' + encodeURIComponent(this.info.filename) +
                '&filesize=' + encodeURIComponent(file.size),
            method: 'GET'
        };
        this.vscodeService.get(options, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                // 文件校验成功，开始文件上传
                const uploadMsg = {
                    cmd: 'uploadProcess',
                    data: {
                        msgID: 'uploadFile',
                        url: '/portadv/solution/package/',
                        fileUpload: 'true',
                        filePath: file.path,
                        fileSize: file.size,
                        need_unzip: true,
                        fileName: file.name,
                        needHeaderFileName: true
                    }
                };

                // 迁移模板上传与Vscode交互提示
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    // 上传时，查询接口判断服务器状态
                    const option = {
                        url: '/users/' + encodeURIComponent(this.loginUserId) + '/config/',
                    };
                    this.inputItems.packpath.value = '';
                    this.isUploading = false;
                    if (resp.status === STATUS.SUCCESS) {
                        this.inputItems.packpath.value = this.info.filename;
                        this.showMessageByLang(resp, 'info');
                    } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                        this.isUploading = true;
                        this.handleUploadWaiting(uploadMsg, resp);
                    } else if (resp.status === STATUS.FAIL) {
                        this.inputItems.packpath.value = '';
                        this.showMessageByLang(resp, 'error');
                        this.isUploading = false;
                        return false;
                    } else if (resp.status === STATUS.INSUFFICIENT_SPACE) {
                        this.inputItems.packpath.value = '';
                        this.utilsService.sendDiskAlertMessage();
                    }

                    // 上传时，服务器异常状态判断
                    if (size > MIN_FILE_SIZE) {
                        this.vscodeService.post(option, () => {
                        });
                        this.isUploading = false;
                        return false;
                    }

                    return true;
                });
            } else if (data.status === STATUS.FAIL) {
                const message = {
                    cmd: 'uploadMigrateFile',
                    data: { info: (this.currLang === LANGUAGE_TYPE.ZH) ? data.infochinese : data.info }
                };
                this.vscodeService.postMessage(message, (res: any) => {
                    if (res.status === STATUS.SUCCESS) {
                        const option = {
                            url: '/portadv/solution/package/status/',
                            param: this.info.filename
                        };
                        this.vscodeService.post(option, () => {
                            this.showMessageByLang(data, 'info');
                        });
                    }
                    this.inputItems.packpath.value = '';
                });

            } else if (data.status === STATUS.INSUFFICIENT_SPACE) {
                this.inputItems.packpath.value = '';
                this.utilsService.sendDiskAlertMessage();
            } else {
                this.inputItems.packpath.value = '';
                this.showMessageByLang(data, 'error');
            }
        });

        this.isUploading = false;
        return true;
    }

    // 处理等待上传中
    handleUploadWaiting(uploadMsg: any, resp: any) {
        const newMsg = Object.assign({}, uploadMsg, { cmd: 'waitingUploadTask' });
        this.vscodeService.postMessage(newMsg, (res: any) => {
          this.isUploading = false;
          // 轮询达到最大次数
          if (res) {
            this.showMessageByLang(resp, 'error');
          }
        });
    }

    // 获取软件迁移模板升级状态
    public getMigStatus(infoKeys: any) {
        const statusUrl = '/task/progress/?task_type=4&task_id=' + encodeURIComponent(this.managementTaskId);
        const message = {
            cmd: 'analysisProcess',
            data: {
                url: statusUrl,
                method: 'GET',
                msgID: MESSAGE_MAP.SHOW_COMMON_PROGRESS,
                i18NInfoKeys: infoKeys
            }
        };
        // 创建task成功，发送消息给vscode,弹出刷新进度条框
        setTimeout(() => {
            this.vscodeService.postMessage(message, (data: any) => {
            });
        }, 500);
    }

    // 确认升级软件迁移模板
    public manageMigrationModel(operationType: any) {
        this.doings = operationType;
        this.managePwdTips = this.i18n.plugins_porting_tips_managePwdCheck;

        // 升级/恢复的密码分别校验
        switch (operationType) {
            case 'upgrade':
                this.twicepwd = this.migUpgradePwd;
                if (!this.twicepwd) {
                    this.upgradePwdFlag = true;
                    return false;
                }
                break;
            case 'recovery':
                this.twicepwd = this.migRecoveryPwd;
                if (!this.twicepwd) {
                    this.recoveryPwdFlag = true;
                    return false;
                }
                break;
            default:
                break;
        }
        const param = {
            operation: this.doings,
            password: this.twicepwd
        };
        if (!/so/.test(this.doings)) {
            const option = {
                url: '/portadv/solution/management/',
                params: param
            };

            // 备份/升级/恢复分别与Vscode交互提示
            this.vscodeService.post(option, (data: any) => {
                if (data.status === STATUS.SUCCESS) {
                    this.managementTaskId = data.data.id;

                    // 刷新进度条key：value标志
                    switch (operationType) {
                        case 'backup':
                            this.getMigStatus({
                                sucess: 'plugins_porting_migBackUpSuc',
                                sucProcessing: 'plugins_porting_migBackUping'
                            });
                            this.migBackupShow = false;
                            this.twicepwd = this.migBackupPwd = '';
                            break;
                        case 'upgrade':
                            this.getMigStatus({
                                sucess: 'plugins_porting_migUpgradSuc',
                                sucProcessing: 'plugins_porting_migUpgrading'
                            });
                            this.migUpgradeShow = false;
                            this.twicepwd = this.migUpgradePwd = '';
                            break;
                        case 'recovery':
                            this.getMigStatus({
                                sucess: 'plugins_porting_migRecoverSuc',
                                sucProcessing: 'plugins_porting_migRecovering'
                            });
                            this.migRecoverShow = false;
                            this.twicepwd = this.migRecoveryPwd = '';
                            break;
                        default:
                            break;
                    }
                    this.operaForbid();
                    this.inputItems.packpath.value = '';
                } else if (data.status === STATUS.INSUFFICIENT_SPACE) {
                    this.utilsService.sendDiskAlertMessage();
                    this.startMigDisable();
                } else if (data.status === STATUS.FAIL) {
                    this.pwdCheck(operationType);
                    if (!this.pwdCheck(operationType)) {
                        this.showMessageByLang(data, 'error');
                    } else {
                        this.managePwdTips = (this.currLang === LANGUAGE_TYPE.ZH) ? data.infochinese : data.info;
                    }
                }
            });
        }
        return true;
    }

    /**
     * 迁移模板管理密码校验
     * @param operationType 操作类型
     */
    public pwdCheck(operationType: any) {
        switch (operationType) {
            case 'backup':
                this.backupPwdFlag = true;
                break;
            case 'upgrade':
                this.upgradePwdFlag = true;
                break;
            case 'recovery':
                this.recoveryPwdFlag = true;
                break;
            default:
                break;
        }
        this.startMigDisable();
        return true;
    }

    // 迁移模板密码校验
    public checkMigPwd(operation: any) {
        this.pwdDoing = operation;
        this.pwdDoing = false;
    }

    // 迁移模板操作
    startMigDisable() {
        this.startGrade = true;
        this.startRecover = true;
    }

    // 开始迁移模板操作
    public startMigOpera(startOption: any) {
        switch (startOption) {
            case 'migUpgradeShow':
                this.migUpgradeShow = true;
                this.upgradePwdFlag = false;
                this.migUpgradePwd = '';
                break;
            case 'migRecoverShow':
                this.migRecoverShow = true;
                this.recoveryPwdFlag = false;
                this.migRecoveryPwd = '';
                break;
            default:
                break;
        }
        this.startMigDisable();
    }

    // 取消迁移模板操作
    public cancelMigOpera(operation: any) {
        switch (operation) {
            case 'migUpgradeShow':
                this.migUpgradeShow = false;
                this.migUpgradePwd = '';
                break;
            case 'migRecoverShow':
                this.migRecoverShow = false;
                this.migRecoveryPwd = '';
                break;
            default:
                break;
        }
        this.operaForbid();
    }

    // 禁止迁移模板同时操作
    operaForbid() {
        this.startGrade = false;
        this.startRecover = false;
    }

    /**
     * 打开创建用户页面
     */
    public openUserCreate() {
        this.showCreateModal = true;
        this.userManager.openUserCreate(this);
    }

    /**
     * 创建用户
     */
    public createUser() {
        this.userManager.createUser(this);
    }

    /**
     * 关闭创建用户页面
     */
    public closeUserCreate() {
        this.userManager.closeUserCreate(this);
        this.isDangerous = false;
        this.showCreateModal = false;
    }
    /**
     * 关闭错误信息
     */
    public closeErrMessageAdd() {
        this.isDangerous = false;
    }
    public closeErrMessageRes() {
        this.isDangerousRes = false;
    }
    public closeErrMessageDel() {
        this.isDangerousDel = false;
    }
    public closeErrMessageEdt() {
        this.isDangerousEdt = false;
    }


    /**
     * 创建用户时根据输入的用户名获取workspace信息
     */
    public getWorkSpace() {
        this.userManager.getWorkSpace(this);
    }

    /**
     * 打开修改密码页面
     */
    public openPwdChange(row?: any) {
        this.updateUser = row ? row.username : this.username;
        this.userManager.openPwdChange(this);
    }

    /**
     * 修改密码
     */
    public changePwd() {
        setTimeout(() => {
            this.userManager.changePwd(this);
        });
    }

    /**
     * 关闭修改密码页面
     */
    public closePwdChange() {
        this.userManager.closePwdChange(this);
        this.isDangerousEdt = false;
    }

    /* 打开重置密码页面
     * @param row 定位重置密码的用户
    */
    public openPwdReset(row: any) {
        this.updateUser = row.username;
        this.textType.type8 =  'password',
        this.textType.type9 =  'password',
        this.textType.type10 =  'password',
        this.workspace = row.workspace;
        this.showResetModal = true;
        this.userManager.openPwdReset(row, this);
    }

    /**
     * 重置用户密码
     */
    public resetPwd() {
        this.userManager.resetPwd(this);
    }

    /**
     * 关闭重置用户密码页面
     */
    public closePwdReset() {
        this.userManager.closePwdReset(this);
        this.isDangerousRes = false;
        this.showResetModal = false;
    }

    /**
     * 打开删除用户页面
     * @param row 定位删除用户
     */
    public openUserDelete(row: any) {
        this.showDeleteModal = true;
        this.isDangerousDel = false;
        this.userManager.openUserDelete(row, this);
    }

    /**
     * 删除用户
     */
    public deleteUser() {
        this.userManager.deleteUser(this);
    }

    /**
     * 关闭删除用户页面
     */
    public closeUserDelete() {
        this.userManager.closeUserDelete(this);
        this.isDangerousDel = false;
        this.showDeleteModal = false;
    }

    /**
     * 修改密码------获取输入的密码
     */
    getPwd() {
        this.userManager.getPwd(this);
    }

    compareCreateCpwd = (control: FormControl) => {
        if (!control.value) {
            return { required: true };
        } else if (this.createRoleForm.controls.cpwd.value) {
            this.createRoleForm.get('cpwd').updateValueAndValidity();
            return {};
        }
        return {};
    }
    compareResetCpwd = (control: FormControl) => {
        if (!control.value) {
            return { required: true };
        } else if (this.resetPwdForm.controls.cpwd.value) {
            this.resetPwdForm.get('cpwd').updateValueAndValidity();
            return {};
        }
        return {};
    }
    createRoleConfirmPwd = (control: FormControl) => {
        if (!control.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.common_term_no_password
                }
            };
        } else if (control.value !== this.createRoleForm.controls.pwd.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.common_term_no_samepwd
                }
            };
        }
        return {};
    }

    resetPwdConfirmPwd = (control: FormControl) => {
        if (!control.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.common_term_no_password
                }
            };
        } else if (control.value !== this.resetPwdForm.controls.pwd.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.common_term_no_samepwd
                }
            };
        }
        return {};
    }
    updateInitPwdConfirm = (control: FormControl) => {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{8,32}$/);
        let oldPwd = '';
        if (this.changePwdForm && this.changePwdForm.controls) {
            oldPwd = this.changePwdForm.controls.oldPwd.value;
        }
        if (!control.value) {
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
        } else if (control.value === oldPwd) { // 相同
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_sameoldpwd } };
        } else if (control.value === oldPwd.split('').reverse().join('')) { // 逆序
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_valition_rule2 } };
        } else if (!VerifierUtil.passwordVerification(control.value)) {
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_valition_password } };
        } else if (this.changePwdForm.controls.cpwd.value) {
            this.changePwdForm.get('cpwd').updateValueAndValidity();
            return {};
        } else {
            return {};
        }
    }
    userPwdConfirm = (control: FormControl) => {
        if (!control.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.common_term_no_password
                }
            };
        } else if (control.value !== this.changePwdForm.controls.pwd.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.common_term_no_samepwd
                }
            };
        }
        return {};
    }

    /**
     * 登出
     */
    public logOut() {
        this.vscodeService.post({ url: '/users/logout/' }, (data: any) => {
            if (data.status === 0) {
                ((self as any).webviewSession || {}).setItem('role', '');
                ((self as any).webviewSession || {}).setItem('username', '');
                ((self as any).webviewSession || {}).setItem('keepGoing', '1');
                ((self as any).webviewSession || {}).setItem('cLine', '');
                ((self as any).webviewSession || {}).setItem('asmLine', '');
                ((self as any).webviewSession || {}).setItem('pMonthFlag', '1');
                this.router.navigate(['/login']);
            } else {
                this.timessage.open({
                    type: 'warn',
                    content: data.info
                });
            }
        });
        const message = { cmd: 'getPwdLogOut' };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 保存自动登录配置
     */
    public saveConfig() {
        this.loginConfig.saveConfig(this);
    }

    /**
     * 取消自动登录配置
     */
    public configLoginCancel() {
        this.loginConfig.configCancel(this);
    }

    /**
     * 打开自动登录配置
     */
    public modifyLogin() {
        this.loginConfig.modifyLogin(this);
    }

    /**
     * 联动获取Auto的设置
     */
    public getAutoSet() {
        this.loginConfig.getAutoSet(this);
    }

    /**
     * 联动获取Remember的设置
     */
    public getRememberSet() {
        this.loginConfig.getRememberSet(this);
    }
    /**
     * 改变密文
     */
    changeType(type: string) {
        this.textType[type] = 'password';
    }

    /**
     *  改变明文
     */
    changeType1(type: string) {
        this.textType[type] = 'text';
    }
}
