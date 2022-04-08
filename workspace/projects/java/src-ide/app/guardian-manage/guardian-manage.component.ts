import { Component, OnInit, ViewChild } from '@angular/core';
import {
    TiTableRowData, TiTableColumns, TiTableSrcData,
    TiModalService, TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { COLOR_THEME, VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    AbstractControl,
} from '@angular/forms';

/**
 * Guardian操作类型
 */
const enum GUARDIAN_OPER_TYPE {
    ADD = 0,
    RESTART,
    DEL,
    DEL_COMPLETE,
    DEL_PART,
    DEL_OUT
}
/**
 * radio类型
 */
const enum RADIO_ACTION {
    ACTION_INIT = 0,
    PART_ACTIVE = 1,
    ALL_ACTIVE = 2
}
const RADIO_LABLE_COLOR = [
    {
        theme: 'vscode-light',
        actions: [
            {
                action: RADIO_ACTION.ACTION_INIT,
                part_radio_color: '#222222',
                all_radio_color: '#333333'
            },
            {
                action: RADIO_ACTION.PART_ACTIVE,
                part_radio_color: '#222222',
                all_radio_color: '#333333'
            },
            {
                action: RADIO_ACTION.ALL_ACTIVE,
                part_radio_color: '#333333',
                all_radio_color: '#222222'
            }
        ]
    },
    {
        theme: 'vscode-dark',
        actions: [
            {
                action: RADIO_ACTION.ACTION_INIT,
                part_radio_color: '#E8E8E8',
                all_radio_color: '#AAAAAA'
            },
            {
                action: RADIO_ACTION.PART_ACTIVE,
                part_radio_color: '#E8E8E8',
                all_radio_color: '#AAAAAA'
            },
            {
                action: RADIO_ACTION.ALL_ACTIVE,
                part_radio_color: '#AAAAAA',
                all_radio_color: '#E8E8E8'
            }
        ]
    }
];
/**
 * 语言类型
 */
const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}
export class CustomValidators {
    /**
     * 自定义校验规则
     * @param validata 校验对象
     */
    public static guardianNameValid(validata: any): ValidatorFn {
        const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9._]{5,31}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) { return { name: { tiErrorMessage: validata.validata.req } }; }
            if (!reg.test(control.value)) {
              return { name: { tiErrorMessage: validata.plugins_perf_java_guardianManage_nameError } }; }
            return null;
        };
    }
}

@Component({
    selector: 'app-javaguardian-manage',
    templateUrl: './guardian-manage.component.html',
    styleUrls: ['./guardian-manage.component.scss']
})
export class GuardianManageComponent implements OnInit {

    public i18n: any;
    public currLang: any;
    public currentUser: string;

    public currTheme = COLOR_THEME.Dark;

    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public guardiansSrcData: TiTableSrcData;
    public columns: Array<TiTableColumns> = [];
    public members: any;
    @ViewChild('guardianModifyModalComponent', { static: false }) guardianModifyModalComponent: any;
    public guardianModifyModal: any;
    public guardianModifyForm = {
        guardianName: '',
    };

    @ViewChild('guardianRestartModalComponent', { static: false }) guardianRestartModalComponent: any;
    public guardianRestartModal: any;

    @ViewChild('guardianDeleteModalComponent', { static: false }) guardianDeleteModalComponent: any;
    public guardianDeleteModal: any;
    @ViewChild('guardianOutlineDeleteModalComponent', { static: false }) guardianOutlineDeleteModalComponent: any;
    public guardianOutlineDeleteModal: any;
    @ViewChild('guardianCreateModalComponent', { static: false }) guardianCreateModalComponent: any;
    @ViewChild('guardianWarnModalComponent', { static: false }) guardianWarnModalComponent: any;
    public guardianWarnModal: any;
    public deleteType = 'all';
    public isClick = false;
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public restartFormGroup: FormGroup;
    public deleteFormGroup: FormGroup;
    public deletePartFormGroup: FormGroup;
    public textType = {
        type1: 'password',
        type2: 'password',
    };
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public showError = false;
    public errorMessage: any;
    public showLoading = false;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private tiModal: TiModalService,
        public fb: FormBuilder
    ) {
        this.i18n = this.i18nService.I18n();
        this.restartFormGroup = fb.group({
            userName: new FormControl('', [TiValidators.required]),
            password: new FormControl('', [TiValidators.required])
        });
        this.deleteFormGroup = fb.group({
            userName: new FormControl('', [TiValidators.required]),
            password: new FormControl('', [TiValidators.required])
        });
        this.deletePartFormGroup = fb.group({
            userName: new FormControl('', [TiValidators.required])
        });
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.currLang = this.getLang();
        this.currentUser = this.getWebViewSession('username');

        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.columns = [
            { title: this.i18n.plugins_perf_java_guardianManage_name, width: '20%' },
            { title: this.i18n.plugins_perf_java_guardianManage_status, width: '20%' },
            { title: this.i18n.plugins_perf_java_guardianManage_ip, width: '15%' },
            { title: this.i18n.plugins_perf_java_guardianManage_port, width: '15%' },
            { title: this.i18n.plugins_perf_java_guardianManage_owner, width: '15%' },
            { title: this.i18n.plugins_perf_java_guardianManage_oper, width: '15%' }
        ];

        this.showLoading = true;
        this.getGuardianList();

        this.vscodeService.regVscodeMsgHandler('updateMenu', () => {
            this.getGuardianList();
        });
    }

    private getWebViewSession(paramName: string) {
        return ((self as any).webviewSession || {}).getItem(paramName);
    }
    private getGuardianList() {
        const option = {
            url: '/guardians/'
        };
        this.vscodeService.get(option, (resp: any) => {
            this.guardiansSrcData = {
                data: this.getGuardiansSrcData(resp.members),
                state: {
                    searched: false, // 源数据未进行搜索处理
                    sorted: false, // 源数据未进行排序处理
                    paginated: false // 源数据未进行分页处理
                }
            };

            this.showLoading = false;
        });
    }

    private getGuardiansSrcData(guardians: any) {
        const guardiansData = JSON.parse(JSON.stringify(guardians));
        if (guardians.length > 0) {
            guardiansData.forEach((guardian: any) => {
                guardian.stateDisplay = this.getStateDisplay(guardian.state);
            });
        }

        return guardiansData;
    }

    private getStateDisplay(state: string) {
        if (state === 'CONNECTED') {
            return {
                name: this.i18n.plugins_perf_java_guardianManage_status_connected,
                iconPath: './assets/img/guardian/guardian-connected.svg'
            };
        } else if (state === 'DISCONNECTED') {
            return {
                name: this.i18n.plugins_perf_java_guardianManage_status_disconnected,
                iconPath: './assets/img/guardian/guardian-disconnected.svg'
            };
        } else {
            return {
                name: this.i18n.plugins_perf_java_guardianManage_status_creating,
                iconPath: './assets/img/guardian/guardian-creating.gif'
            };
        }
    }
    /**
     * 添加Guardian
     */
    public addGuardian() {
        this.guardianCreateModalComponent.show();
    }
    /**
     * 添加Guardian成功事件
     */
    public successEvent(e: any) {
        const context = {
            guardian: e.guardian,
            oper: GUARDIAN_OPER_TYPE.ADD
        };
        this.getGuardianList();
        this.updateMenu(context);
    }
    /**
     * 确认
     */
    public confirm(context: any) {
        if (!this.isClick) {
            this.isClick = true;
            this.showError = false;
            if (GUARDIAN_OPER_TYPE.DEL === context.oper) {
                this.delConfirm(context);
            } else if (GUARDIAN_OPER_TYPE.DEL_OUT === context.oper) {
                this.delOutConfirm(context);
            } else if (GUARDIAN_OPER_TYPE.RESTART === context.oper) {
                this.restartConfirm(context);
            }
        }
    }
    private getLang() {
        const language: string = ((self as any).webviewSession || {}).getItem('language');
        if (language) {
            return language.indexOf('en') !== -1 ? LANGUAGE_TYPE.EN : LANGUAGE_TYPE.ZH;
        } else {
            return LANGUAGE_TYPE.ZH;
        }
    }
    private showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }
    private restartConfirm(context: any) {
        const guardian = context.guardian;
        const params = {
            sshPassword: this.restartFormGroup.controls.password.value,
            sshUsername: this.restartFormGroup.controls.userName.value
        };
        const option = {
            url: `/guardians/${guardian.id}`,
            params
        };
        this.vscodeService.patch(option, (resp: any) => {
            if (resp.message) {
                this.showInfoBox(resp.message, 'error');
            } else {
                this.afterProcess(context);
            }
            params.sshPassword = null;
            this.isClick = false;
        });
    }

    private delConfirm(context: any) {
        const option = {
            url: `/guardians/${context.guardian.id}`
        };
        this.vscodeService.delete(option, (resp: any) => {
            if (resp.message) {
                this.showInfoBox(resp.message, 'error');
            } else {
                this.afterProcess(context);
            }
            this.isClick = false;
        });
    }

    private delOutConfirm(context: any) {
        if (this.deleteType === 'part' && !this.guardianWarnModal) {
            context.close();
            this.showDelWarnModal(context, this.i18n.plugins_perf_java_guardianManage_part_delete_tip);
        } else {
            this.delOutlineGuradian(context);
        }
    }

    private showDelWarnModal(context: any, tip: any) {
        this.isClick = false;
        let name = context.guardian.name;
        if (context.guardian.owner.username !== this.currentUser) {
            name += ' (' + context.guardian.owner.username + ')';
        }
        this.guardianWarnModal = this.tiModal.open(this.guardianWarnModalComponent, {
            id: 'guardianWarn',
            modalClass: 'guardianManagementModal',
            context: {
                guardian: context.guardian,
                username: context.username,
                title: context.title,
                tip: this.i18nService.I18nReplace(tip, { 0: name }),
                oper: GUARDIAN_OPER_TYPE.DEL_OUT
            },
            draggable: true
        });
    }

    private delOutlineGuradian(context: any) {
        const guardian = context.guardian;
        let params = {};
        let url = '';
        if (this.deleteType === 'part') {
            url = `/guardians/${guardian.id}?force=true`;
            params = {
                username: this.deletePartFormGroup.controls.userName.value,
                password: 'xxx'
            };
        } else {
            url = `/guardians/${guardian.id}`;
            params = {
                username: this.deleteFormGroup.controls.userName.value,
                password: this.deleteFormGroup.controls.password.value
            };
        }
        const option = {
            url,
            params
        };
        this.vscodeService.delete(option, (resp: any) => {
            if (resp.code && resp.code.indexOf('BadRequest') >= 0) {
                this.showError = true;
                this.errorMessage = resp.message;
            } else if (resp.code && resp.code.indexOf('UninstallGuardianFailure') >= 0) {
                this.showInfoBox(resp.message, 'error');
                context.close();
                this.deleteType = 'part';
                this.showDelWarnModal(context, this.i18n.plugins_perf_java_guardianManage_all_delete_tip);
            } else {
                this.afterProcess(context);
            }
            params = {};
            this.isClick = false;
        });
    }

    private afterProcess(context: any) {
        context.close();
        this.getGuardianList();

        // 刷新左侧菜单
        this.updateMenu(context);
    }

    private updateMenu(context: any) {
        const message = {
            cmd: 'updateMenu',
            data: {
                menuType: 'guardianList', operType: context.oper,
                guardian: context.guardian
            }
        };
        this.vscodeService.postMessage(message, null);
    }
    /**
     * 重启离线
     */
    public restartGuardian(guardian: any) {
        this.isClick = false;
        this.restartFormGroup.reset();
        this.guardianRestartModal = this.tiModal.open(this.guardianRestartModalComponent, {
            id: 'guardianRestart',
            modalClass: 'guardianManagementModal',
            context: { guardian, userName: '', password: '', oper: GUARDIAN_OPER_TYPE.RESTART },
            draggable: true,
            close: (): void => {
                this.restartFormGroup.patchValue({
                    password: null
                });
            },
            dismiss: (): void => {
                this.restartFormGroup.patchValue({
                    password: null
                });
            }
        });
    }

    /**
     * 删除
     */
    public deleteGuardian(guardian: any) {
        this.isClick = false;
        let name = guardian.name;
        if (guardian.owner.username !== this.currentUser) {
            name += ' (' + guardian.owner.username + ')';
        }
        if (guardian.state === 'CONNECTED') {
            this.guardianDeleteModal = this.tiModal.open(this.guardianDeleteModalComponent, {
                id: 'guardianDelete',
                modalClass: 'guardianManagementModal',
                context: {
                    guardian,
                    title: this.i18nService.I18nReplace(this.i18n.plugins_perf_java_guardianManage_delete_title,
                       { 0: name }),
                    tip: this.i18nService.I18nReplace(this.i18n.plugins_perf_java_guardianManage_delete_tip,
                       { 0: name }),
                    oper: GUARDIAN_OPER_TYPE.DEL
                },
                draggable: true
            });
        } else {
            this.guardianWarnModal = '';
            this.showError = false;
            this.errorMessage = '';
            this.deleteType = 'all';
            this.deleteFormGroup.reset();
            this.guardianOutlineDeleteModal = this.tiModal.open(this.guardianOutlineDeleteModalComponent, {
                id: 'guardianOutlineDelete',
                modalClass: 'guardianManagementModal',
                context: {
                    guardian,
                    title: this.i18nService.I18nReplace(this.i18n.plugins_perf_java_guardianManage_delete_title,
                       { 0: name }),
                    username: '',
                    pwd: '',
                    oper: GUARDIAN_OPER_TYPE.DEL_OUT
                },
                draggable: true,
                close: (): void => {
                    this.deleteFormGroup.patchValue({
                        password: null
                    });
                },
                dismiss: (): void => {
                    this.deleteFormGroup.patchValue({
                        password: null
                    });
                }
            });
        }
    }
    /**
     * 选择删除方式
     * @param model 事件
     */
    public onLocationChange(): void {
        if (this.deleteType === 'part') {
            this.setRadioColor(RADIO_ACTION.PART_ACTIVE);
            this.deletePartFormGroup.patchValue({
                userName: this.deleteFormGroup.controls.userName.value
            });
            this.deleteFormGroup.reset();
        } else {
            this.setRadioColor(RADIO_ACTION.ALL_ACTIVE);
            this.deleteFormGroup.patchValue({
                userName: this.deletePartFormGroup.controls.userName.value
            });
            this.deletePartFormGroup.reset();
        }
    }
    private setRadioColor(radioAction: any) {
        const themeClass = document.body.className;
        let radioActions = null;
        for (const radioLabel of RADIO_LABLE_COLOR) {
            if (radioLabel.theme === themeClass) {
                radioActions = radioLabel.actions;
                break;
            }
        }

        if (radioActions) {
            for (const radioStatus of radioActions) {
                if (radioStatus.action === radioAction) {
                    document.documentElement.style.setProperty('--lable-radio-part-clr', radioStatus.part_radio_color);
                    document.documentElement.style.setProperty('--lable-radio-all-clr', radioStatus.all_radio_color);
                    break;
                }
            }
        }
    }
    /**
     * 验证
     */
    public check() {
        if (this.deleteType === 'part') {
            if (!this.deletePartFormGroup.controls.userName.value) {
                this.showError = false;
            } else {
                this.showError = true;
            }
        } else {
            if (!this.deleteFormGroup.controls.userName.value || !this.deleteFormGroup.controls.password.value) {
                this.showError = false;
            } else {
                this.showError = true;
            }
        }
    }

    /**
     * 改变密文
     */
    changeType(type: any) {
        if (type === 1) {
            this.textType.type1 = 'password';
        } else {
            this.textType.type2 = 'password';
        }
    }

    /**
     *  改变明文
     */
    changeType1(type: any) {
        if (type === 1) {
            this.textType.type1 = 'text';
        } else {
            this.textType.type2 = 'text';
        }
    }
}
