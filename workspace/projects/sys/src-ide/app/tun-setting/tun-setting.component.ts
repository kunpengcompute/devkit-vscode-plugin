import { Component, OnInit, ViewChild, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { TiTableColumns, TiTableRowData, TiValidationConfig, Util, TiValidators } from '@cloud/tiny3';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from './tun-setting.usermanager.component';
import { UserManager } from './tun-setting.usermanager.component';
import { OperationLog } from './tun-setting.operationlog.component';
import { SysConfigure } from './tun-setting.sysconfigure.component';
import { TimeOutManager } from './tun-setting.timeout.component';
import { AgentServerManager } from './tun-setting.agentserver.component';
import { PwdExpiredManager } from './tun-setting.pwdexpire.component';
import { WebServerManager } from './tun-setting.webserver.component';
import { RunningLog } from './tun-setting.runlog.component';
import { VscodeService, COLOR_THEME, currentTheme } from '../service/vscode.service';
import { LoginConfig } from './tun-setting.loginconfig.component';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';

@Component({
    selector: 'app-tun-setting',
    templateUrl: './tun-setting.component.html',
    styleUrls: ['./tun-setting.component.scss']
})
export class TunsetComponent implements OnInit, AfterViewInit {
    constructor(
        public fb: FormBuilder,
        public elementRef: ElementRef,
        public router: Router,
        public mytip: MytipService,
        public i18nService: I18nService,
        private $location: PlatformLocation,
        public vscodeService: VscodeService,
        private route: ActivatedRoute,
        public renderer2: Renderer2,
        public customValidatorsService: CustomValidatorsService
    ) {

        TunsetComponent.instance = this;
        this.i18n = this.i18nService.I18n();
        $location.onPopState(() => { });
        this.userManager = new UserManager(fb, mytip, i18nService, vscodeService);
        this.operationLog = new OperationLog(fb, mytip, i18nService, vscodeService);
        this.sysConfigure = new SysConfigure(fb, mytip, i18nService, vscodeService);
        this.timeOutManager = new TimeOutManager(vscodeService);
        this.agentServerManager = new AgentServerManager(i18nService, vscodeService);
        this.pwdExpiredManager = new PwdExpiredManager(i18nService, vscodeService);
        this.webServerManager = new WebServerManager(i18nService, vscodeService);
        this.runningLog = new RunningLog(fb, mytip, i18nService, vscodeService);
        this.loginConfig = new LoginConfig(i18nService, vscodeService);
    }
    // ??????????????????
    public static instance: TunsetComponent;
    public userManager: UserManager;
    public operationLog: OperationLog;
    public sysConfigure: SysConfigure;
    public timeOutManager: TimeOutManager;
    public agentServerManager: AgentServerManager;
    public pwdExpiredManager: PwdExpiredManager;
    public webServerManager: WebServerManager;
    public runningLog: RunningLog;
    public currTheme: any;
    public loginConfig: LoginConfig;
    public flag = true;

    // ??????????????????
    private isClickJump = true;
    // ???????????????id?????????????????????????????????
    private content = 'content';
    // ????????????????????????
    public offsetTop = 0;
    // ??????????????????????????????
    public menuList: any = {
        user: { // ????????????
            menu: 'menuUser',
            content: 'itemUser'
        },
        // ???????????????
        WeakServer: {
            menu: 'menuWeakServer',
            content: 'itemWeakServer'
        },
        // ????????????
        sysConfigure: {
            menu: 'menuSysConfigure',
            content: 'itemSysConfigure'
        },
        // ??????????????????
        runningLog: {
            menu: 'menuRunningLog',
            content: 'itemRunningLog'
        },
        // ??????????????????
        operationLog: {
            menu: 'menuOperationLog',
            content: 'itemOperationLog'
        },
        // web???????????????
        WebServer: {
            menu: 'menuWebServer',
            content: 'itemWebServer'
        },

    };

    // ????????????????????????
    private commonContent = 'content';
    public commonList: any = {
        modifyPsw: { // ????????????
            menu: 'menuModifypsw',
            commonContent: 'itemModifypsw'
        },
        WeakServer: { // ???????????????
            menu: 'menuWeakServer',
            commonContent: 'itemWeakServer'
        },
        sysConfigure: { // ????????????
            menu: 'menuSysConfigure',
            commonContent: 'itemSysConfigure'
        },
        loginConfig: { // ????????????
            menu: 'menuLogin',
            commonContent: 'itemLogin'
        },
        operationLog: { // ??????????????????
            menu: 'menuOperationLog',
            commonContent: 'itemOperationLog'
        },
        WebServer: { // web???????????????
            menu: 'menuWebServer',
            commonContent: 'itemWebServer'
        },
    };

    // ????????????
    public username: string;
    public loginUserId: string;
    public role: string;
    public userRoleFlag = false;
    public i18n: any;
    public currLang: any;
    public keepGoing = {
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
    public safeMessage = '';
    public dangerousMessage = '';
    public createUserRole: string;
    public isShow = false;
    public msg: string;
    public createUserTips: string;
    public deleteUserTips: string;
    public changePwdTips: string;
    public resetPwdTips: string;
    public changeNumsTips: string;
    public operationgNumsTips: string;
    public LogLevelNumsTips: string;
    public changeOutTimeTips: string;
    public changeMinNumsTips: string;
    // ????????????????????????????????????????????????????????????[]?????????
    public displayed: Array<TiTableRowData> = [];
    public displayedLog: Array<TiTableRowData> = [];
    public displayRunLog: Array<TiTableRowData> = [];
    // ??????????????????????????????
    public displayedRunningLog: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];
    public columsLog: Array<TiTableColumns> = [];
    public columsRunningLog: Array<TiTableColumns> = [];
    public label: any;
    public createRoleForm: FormGroup;
    public resetPwdForm: FormGroup;
    public delRoleForm: FormGroup;
    public editPwd: FormGroup;
    public changePwdForm: FormGroup;
    public isManager = false;

    public comchange = false;
    public tunType = {
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
    };
    public managementTaskId: string;
    public inputPrompt: string;
    public info = {
        filename: '',
        filesize: ''
    };
    // ????????????
    public inputItems = {
        packpath: {
            label: '',
            value: '',
            required: true
        }
    };

    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };

    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    // ??????????????????
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

    public pluginUrlCfg: any = { };

    // ????????????-????????????ID????????????
    @ViewChild('CreateUserPage', { static: false }) CreateUserPage: any;
    @ViewChild('ResetPwdPage', { static: false }) ResetPwdPage: any;
    @ViewChild('ModifyPwdPage', { static: false }) ModifyPwdPage: any;
    @ViewChild('DelUserPage', { static: false }) DelUserPage: any;
    @ViewChild('DownloadLogPage', { static: false }) DownloadLogPage: any;


    /**
     * ???????????????
     */
    ngOnInit() {
        if ((navigator.platform === 'Win32') || (navigator.platform === 'Windows')) {
            this.isSystem = true;
        }

        // ????????????url????????????
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });

        this.sysConfigure.getUserNum();

        // ??????VSCode??????????????????
        this.currTheme = currentTheme();
        // VSCode???????????????????????????
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.highLightMenu();
        });

        this.currLang = I18nService.getLang();
        this.loginUserId = self.webviewSession.getItem('loginId');
        this.username = self.webviewSession.getItem('username');
        this.role = self.webviewSession.getItem('role');
        this.userRoleFlag = VscodeService.isAdmin();
        this.createUserRole = this.i18n.plugins_perf_input_role;
        // ???????????????????????????
        this.createUserTips = this.i18n.plugins_perf_tips_createUser;
        this.deleteUserTips = this.i18n.plugins_perf_tips_deleteUser;
        this.changePwdTips = this.i18n.plugins_perf_tips_changePwd;
        this.resetPwdTips = this.i18n.plugins_perf_tips_resetPwd;
        this.changeNumsTips = this.i18n.plugins_perf_tips_changeNum;
        this.operationgNumsTips = this.i18n.plugins_perf_tips_operationgNum;
        this.LogLevelNumsTips = this.i18n.plugins_perf_tips_LogLevelNum;
        this.changeOutTimeTips = this.i18n.plugins_perf_tips_changeOutTime;
        this.changeMinNumsTips = this.i18n.plugins_perf_tips_changeOutMinNums;
        if (this.userRoleFlag) {
            this.userManager.getUserList();
            this.runningLog.showRunningLogList();
        }
        // ?????????????????????
        this.pwdExpiredManager.showConfig();
        // ??????web??????????????????????????????
        this.webServerManager.showConfig();
        // ??????????????????
        this.timeOutManager.showConfig();
        // ????????????????????????
        this.sysConfigure.getLogLevelNum();
        // ??????????????????
        this.operationLog.showLogList(1, 20);
        // ???????????????????????????
        this.operationLog.initOperationData();
        this.label = {
            Name: this.i18n.plugins_perf_label_userManager.name,
            Role: this.i18n.plugins_perf_label_userManager.role,
            Pwd: this.i18n.plugins_perf_label_userManager.password,
            Cpwd: this.i18n.plugins_perf_label_userManager.confirmPwd,
            oldPwd: this.i18n.plugins_perf_label_userManager.oldPwd,
            User: this.i18n.plugins_perf_label_userManager.user,
            AdminPwd: this.i18n.plugins_perf_label_userManager.adminPwd,
            newPwd: this.i18n.plugins_perf_label_userManager.newPwd,
        };

        // ???????????????????????????
        this.columns = [{
            title: this.i18n.plugins_perf_label_userManager.name
        },
        {
            title: this.i18n.plugins_perf_label_userManager.role
        },
        {
            title: this.i18n.plugins_perf_title_columsOperate,
            width: '30%'
        }
        ];

        // ????????????????????????

        this.displayedRunningLog = [{
            title: this.i18n.plugins_perf_label_runningLogs.userRunningLog,
            operation: this.i18n.plugins_perf_label_runningLogs.download,
        }];

        // ???????????????????????????
        this.columsRunningLog = [
            {
                title: this.i18n.plugins_perf_title_columsRunningLog.logName,
                width: '70%',
            },
            {
                title: this.i18n.plugins_perf_title_columsRunningLog.operation,
                width: '30%',
            },
        ];

        // ???????????????????????????
        this.columsLog = [
            {
                title: this.i18n.plugins_perf_title_columsLog.user,
                width: '12%',
            },
            {
                title: this.i18n.plugins_perf_title_columsLog.event,
                width: '13%',
            },
            {
                title: this.i18n.plugins_perf_title_columsLog.result,
                sortKey: 'age',
                width: '15%',
            },
            {
                title: this.i18n.plugins_perf_title_columsLog.ip,
                width: '15%',
            },
            {
                title: this.i18n.plugins_perf_title_columsLog.time,
                width: '20%',
            },
            {
                title: this.i18n.plugins_perf_title_columsLog.detail,
                width: '25%',
            },
        ];
        this.createRoleForm = new FormGroup({
            name: new FormControl('', [this.customValidatorsService.checkUserName()]),
            userRole: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
            cadminPwd: new FormControl('', [
                this.customValidatorsService.checkEmpty(this.i18n.common_term_login_error_info[1])
            ])
        });
        this.editPwd = new FormGroup({
            pwd: new FormControl('', [
                this.customValidatorsService.checkPassword(this.createRoleForm.get('name'))
            ]),
            cpwd: new FormControl('', [
                this.customValidatorsService.checkConfirmPassword(this)
            ])
        });
        this.resetPwdForm = new FormGroup({
            radminPwd: new FormControl('', [
                this.customValidatorsService.checkEmpty(this.i18n.common_term_login_error_info[1])
            ])
        });
        this.delRoleForm = new FormGroup({
            dadminPwd: new FormControl('', [
                this.customValidatorsService.checkEmpty(this.i18n.common_term_login_error_info[1])
            ])
        });
        this.changePwdForm = new FormGroup({
            oldPwd: new FormControl('', [
                this.customValidatorsService.checkEmpty(this.i18n.common_term_login_error_info[1])
            ]),
            pwd: new FormControl('', [this.pwdValidator, this.customValidatorsService.checkPassword(this.username)]),
            cpwd: new FormControl('', [this.userPwdConfirm])
        });
        this.loginConfigForm = new FormGroup({
            rememberPwdSelect: new FormControl('', []),
            autoLoginSelect: new FormControl('', [])
        });

        this.rememberPwdSelect.label = this.i18n.plugins_perf_label_rememberPwd;
        this.autoLoginSelect.label = this.i18n.plugins_perf_label_autoLogin;
        this.rememberPwdSelect.options[0].label = this.i18n.plugins_common_term_yes;
        this.rememberPwdSelect.options[1].label = this.i18n.plugins_common_term_no;
        this.rememberPwdSelect.selected.label = this.i18n.plugins_common_term_yes;
        this.autoLoginSelect.options[0].label = this.i18n.plugins_common_term_yes;
        this.autoLoginSelect.options[1].label = this.i18n.plugins_common_term_no;
        this.autoLoginSelect.selected.label = this.i18n.plugins_common_term_yes;
        // ??????????????????????????????
        this.loginConfig.getLoginConfig(this);
        // ?????????????????????
        this.ngScroll();
    }

    /**
     * ???????????????
     * @param???innerItem
     */
    public jumpScroll(innerItem: string) {
        this.isClickJump = true;
        if (this.userRoleFlag) {
            this.updateSetThemeColor(this.menuList, innerItem);
            this.offsetTop = document.getElementById(this.menuList.user.content).offsetTop;
            document.getElementById(this.content).scrollTop = document.getElementById(innerItem).offsetTop
                - this.offsetTop;
        } else {
            this.updateSetThemeColor(this.commonList, innerItem);
            this.offsetTop = document.getElementById(this.commonList.modifyPsw.commonContent).offsetTop;
            document.getElementById(this.commonContent).scrollTop = document.getElementById(innerItem).offsetTop
                - this.offsetTop;
        }
    }

    /**
     * ??????????????????????????????????????????
     */
    scrollToItem() {
        // ????????????
        if (this.isClickJump) {
            this.isClickJump = false;
            return;
        }

        // ?????????????????????
        if (this.userRoleFlag) {
            this.offsetTop = document.getElementById(this.menuList.user.content).offsetTop;
            const menuList = this.menuList;
            const scrollocation = document.getElementById(this.content).scrollTop + this.offsetTop;
            let scrollLocationIncontent = '';
            // ????????????????????????????????????
            for (const key of Object.keys(menuList)) {
                if (menuList.hasOwnProperty(key)) {
                    if (document.getElementById(menuList[key].content).offsetTop <= scrollocation) {
                        scrollLocationIncontent = menuList[key].content;
                    }
                }
            }
            //  ??????????????????????????????????????????
            this.updateSetThemeColor(menuList, scrollLocationIncontent);
        } else {
            this.offsetTop = document.getElementById(this.commonList.modifyPsw.commonContent).offsetTop;
            const commonList = this.commonList;
            const scrollocation = document.getElementById(this.commonContent).scrollTop + this.offsetTop;
            let scrollLocationIncontent = '';
            // ????????????????????????????????????
            for (const key of Object.keys(commonList)) {
                if (commonList.hasOwnProperty(key)) {
                    if (document.getElementById(commonList[key].commonContent).offsetTop <= scrollocation) {
                        scrollLocationIncontent = commonList[key].commonContent;
                    }
                }
            }
            //  ??????????????????????????????????????????
            this.updateSetThemeColor(commonList, scrollLocationIncontent);

        }
    }

    /**
     * ??????????????????
     * @param:setList
     * @param:scrollLocationIncontent
     */
    updateSetThemeColor(setList: any, scrollLocationIncontent: any) {
        for (const key of Object.keys(setList)) {
            const setlistMenu = this.elementRef.nativeElement.querySelector(`#${setList[key].menu}`);
            if (setList.hasOwnProperty(key)) {
                setlistMenu.style.outline = 'none';
                if (setList[key].commonContent === scrollLocationIncontent
                    || setList[key].content === scrollLocationIncontent) {
                    setlistMenu.style.fontSize = '20px';
                    setlistMenu.style.color = (this.currTheme === COLOR_THEME.Light) ? '#222222' : '#E8E8E8';
                } else {
                    setlistMenu.style.fontSize = '16px';
                    setlistMenu.style.color = (this.currTheme === COLOR_THEME.Light) ? '#616161' : '#AAAAAA';
                }
            }
        }
    }

    /**
     * ???????????????????????????????????????????????????
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
     * ?????????????????????????????????
     */
    ngScroll() {
        document.getElementById('content').addEventListener('scroll', () => {
            this.scrollToItem();
            Util.trigger(document, 'tiScroll');
        });
    }

    /**
     * ?????????????????????????????????,????????????????????????
     */
    ngAfterViewInit() {
        this.route.queryParams.subscribe(data => {
            this.jumpScroll(data.innerItem);
        });
    }

    /**
     * ????????????????????????
     */
    public openUserCreate() {
        this.userManager.openUserCreate(this);
    }

    /**
     * ??????????????????????????????
     */
    public openRunningLog() {
        this.runningLog.openRunningLog(this);
    }

    /**
     * ????????????????????????
     */
    public sureToDownloadRunLog() {
        this.runningLog.sureToDownloadRunLog(this);
    }

    /**
     * ????????????
     */
    public createUser() {
        this.userManager.createUser(this);
    }

    /**
     * ????????????????????????
     */
    public closeUserCreate() {
        this.userManager.closeUserCreate(this);
    }

    /**
     * ????????????????????????
     */
    public openPwdChange() {
        this.userManager.openPwdChange(this);
    }

    /**
     * ????????????
     */
    public changePwd() {
        this.userManager.changePwd(this);
    }

    /**
     * ????????????????????????
     */
    public closePwdChange() {
        this.userManager.closePwdChange(this);
    }

    /**
     * ????????????????????????
     * @param row ???????????????????????????
     */
    public openPwdReset(row: any) {
        this.userManager.openPwdReset(row, this);
    }

    /**
     * ??????????????????
     */
    public resetPwd() {
        this.userManager.resetPwd(this);
    }

    /**
     * ??????????????????????????????
     */
    public closePwdReset() {
        this.userManager.closePwdReset(this);
    }

    /**
     * ????????????????????????
     * @param row ??????????????????
     */
    public openUserDelete(row: any) {
        this.userManager.openUserDelete(row, this);
    }

    /**
     * ????????????
     */
    public deleteUser() {
        this.userManager.deleteUser(this);
    }

    /**
     * ????????????????????????
     */
    public closeUserDelete() {
        this.userManager.closeUserDelete(this);
    }

    /**
     * ??????????????????????????????
     */
    public closeDownloadLog() {
        this.runningLog.closeDownloadLog(this);
    }

    /**
     * ????????????------?????????????????????
     */
    getPwd() {
        this.userManager.getPwd(this);
    }

    /**
     * ????????????????????????
     */
    public openTimeOutChange() {
        this.timeOutManager.openNumChange();
    }

    /**
     * ??????????????????
     */
    public changeTimeOut() {
        this.timeOutManager.changeNum(this);
    }

    /**
     * ????????????Web????????????
     */
    public closeTimeOut() {
        this.timeOutManager.closeNumChange();
    }
    /**
     * ????????????Web????????????
     */
    public openWebChange() {
        this.webServerManager.openNumChange();
    }

    /**
     * ??????Web????????????
     */
    public changeWeb() {
        this.webServerManager.changeNum(this);
    }

    /**
     * ????????????Web????????????
     */
    public closeWeb() {
        this.webServerManager.closeNumChange();
    }
    /**
     * ????????????Agent????????????
     */
    public openAgentChange() {
        this.agentServerManager.openNumChange();
    }
    /**
     * ??????????????????????????????
     */
    public openPwdPeriodChange() {
        this.pwdExpiredManager.openNumChange();
    }

    /**
     * ??????Agent????????????
     */
    public changeAgent() {
        this.agentServerManager.changeNum(this);
    }

    /**
     * ????????????????????????
     */
    public changePwdPeriod() {
        this.pwdExpiredManager.changeNum();
    }

    /**
     * ????????????Agent????????????
     */
    public closeAgent() {
        this.agentServerManager.closeNumChange();
    }
    /**
     * ????????????Agent????????????
     */
    public closePwdPeriod() {
        this.pwdExpiredManager.closeNumChange();
    }
    /**
     * ?????????????????????------?????????????????????????????????
     */
    public changeNum() {
        this.sysConfigure.changeNum(this);
    }

    /**
     * ????????????------????????????????????????????????????
     */
    public changeLogLevelNum() {
        this.sysConfigure.changeLogLevelNum(this);
    }
    /**
     * ????????????------??????????????????
     */
    public openLogLevelChange() {
        this.sysConfigure.openLogLevelChange();
    }
    /**
     * ????????????------??????????????????????????????
     */
    public closeLogLevelNumChange() {
        this.sysConfigure.closeLogLevelNumChange();
    }

    pwdValidator = (control: FormControl) => {
        if (this.changePwdForm && this.changePwdForm.controls.oldPwd.value) {
            if (control.value === this.changePwdForm.controls.oldPwd.value) {
                return {
                    cpwd: {
                        confirm: true,
                        error: true,
                        tiErrorMessage: this.i18n.validata.pwd_rule4
                    }
                };
            } else if (control.value === this.changePwdForm.controls.oldPwd.value.split('').reverse().join('')) {
                return {
                    cpwd: {
                        confirm: true,
                        error: true,
                        tiErrorMessage: this.i18n.validata.pwd_rule3
                    }
                };
            }
        }
        return null;
    }

    userPwdConfirm = (control: FormControl) => {
        if (!control.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.common_term_login_error_info[1]
                }
            };
        } else if (control.value !== this.changePwdForm.controls.pwd.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.validata.pwd_conf
                }
            };
        }
        return {};
    }
    /**
     * ????????????
     */
    public updateConfirmValidator2() {
        Promise.resolve().then(() => {
            this.changePwdForm.controls.cpwd.updateValueAndValidity();
        });
    }
    /**
     * ????????????
     */
    public updateConfirmValidator() {
        Promise.resolve().then(() => {
            this.editPwd.controls.cpwd.updateValueAndValidity();
        });
    }
    /**
     * ????????????
     */
    public updateConfirmValidator3() {
        Promise.resolve().then(() => {
            this.editPwd.controls.cpwd.updateValueAndValidity();
        });
    }
    /**
     * ????????????
     */
    public resetConfirmValidator(pwd: any) {
        Promise.resolve().then(() => {
            pwd.updateValueAndValidity();
        });
    }
    /**
     * ??????????????????
     * @param data ????????????
     */
    showErrMsg(data: any) {
        this.isShow = true;
        this.msg = data.message;
        this.vscodeService.showInfoBox(data.message, 'warn');
    }


    /**
     * ??????????????????
     * @param data ????????????
     */
    showWarningMsg(data: any) {

        this.isShow = true;
        setTimeout(() => {
            this.isShow = false;
        }, 3000);

        this.msg = data.message;
    }

    /**
     * ??????
     */
    public logOut() {
        const message = { cmd: 'getPwdLogOut' };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * ????????????????????????
     */
    public saveConfig() {
        this.loginConfig.saveConfig(this);
    }

    /**
     * ????????????????????????
     */
    public configLoginCancel() {
        this.loginConfig.configCancel(this);
    }

    /**
     * ????????????????????????
     */
    public modifyLogin() {
        this.loginConfig.modifyLogin(this);
    }

    /**
     * ????????????Auto?????????
     */
    public getAutoSet() {
        this.loginConfig.getAutoSet(this);
    }

    /**
     * ????????????Remember?????????
     */
    public getRememberSet() {
        this.loginConfig.getRememberSet(this);
    }

    /**
     * ????????????
     */
    changeType(type) {
        switch (type) {
            case 1:
                this.tunType.type1 = 'password';
                break;
            case 2:
                this.tunType.type2 = 'password';
                break;
            case 3:
                this.tunType.type3 = 'password';
                break;
            case 4:
                this.tunType.type4 = 'password';
                break;
            case 5:
                this.tunType.type5 = 'password';
                break;
            case 6:
                this.tunType.type6 = 'password';
                break;
            case 7:
                this.tunType.type7 = 'password';
                break;
            case 8:
                this.tunType.type8 = 'password';
                break;
            case 9:
                this.tunType.type9 = 'password';
                break;
            case 10:
                this.tunType.type10 = 'password';
                break;
            default:
                break;
        }
    }

    /**
     *  ????????????
     */
    changeType1(type) {
        switch (type) {
            case 1:
                this.tunType.type1 = 'text';
                break;
            case 2:
                this.tunType.type2 = 'text';
                break;
            case 3:
                this.tunType.type3 = 'text';
                break;
            case 4:
                this.tunType.type4 = 'text';
                break;
            case 5:
                this.tunType.type5 = 'text';
                break;
            case 6:
                this.tunType.type6 = 'text';
                break;
            case 7:
                this.tunType.type7 = 'text';
                break;
            case 8:
                this.tunType.type8 = 'text';
                break;
            case 9:
                this.tunType.type9 = 'text';
                break;
            case 10:
                this.tunType.type10 = 'text';
                break;
            default:
                break;
        }
    }

    public blurFock() {
        if (this.delRoleForm.controls.dadminPwd.value) {
            this.flag = false;
        } else {
            this.flag = true;
        }
    }
}
