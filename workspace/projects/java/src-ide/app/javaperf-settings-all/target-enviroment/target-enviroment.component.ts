import { Component, OnInit, ViewChild, EventEmitter, Output, NgZone } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { TiMessageService, TiModalService, TiValidationConfig } from '@cloud/tiny3';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    AbstractControl,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
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
                return { name: { tiErrorMessage: validata.plugins_perf_java_guardianManage_nameError } };
            }
            return null;
        };
    }
    /**
     * IP校验规则
     * @param validata 校验对象
     */
    public static hostValid(validata: any): ValidatorFn {
        const reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        const invalidIp = /0.0.0.0|255.255.255.255/;
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) { return { name: { tiErrorMessage: validata.validata.req } }; }
            if (!reg.test(control.value) || invalidIp.test(control.value)) {
                return { name: { tiErrorMessage: validata.plugins_common_message_ipError } };
            }
            return null;
        };
    }
    /**
     * 端口校验规则
     * @param validata 校验对象
     */
    public static sshPortValid(validata: any): ValidatorFn {
        const reg = /^[1-9]\d*$/;
        const CONFIG_RADIX = 10;
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) { return { name: { tiErrorMessage: validata.validata.req } }; }
            if (reg.test(control.value) && parseInt(control.value, CONFIG_RADIX) <= 65535 &&
                parseInt(control.value, CONFIG_RADIX) > 0) {
                return null;
            } else {
                return { name: { tiErrorMessage: validata.plugins_common_message_installPortError } };
            }
        };
    }
}

@Component({
    selector: 'app-target-enviroment',
    templateUrl: './target-enviroment.component.html',
    styleUrls: ['./target-enviroment.component.scss']
})
export class TargetEnviromentComponent implements OnInit {
    public i18n: any;

    @ViewChild('guardianCreateModalComponent', { static: false }) guardianCreateModalComponent: any;
    @ViewChild('guardianCreateConfirmModalComponent', { static: false }) guardianCreateConfirmModalComponent: any;
    @Output() createGuardianSuccess = new EventEmitter();
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public guardianCreateModal: any;
    public isRoot = false;
    public guardianCreateConfirmModal: any;
    public addFormGroup: FormGroup;
    public fingerprint: any;
    public fingerprintTip: any;
    public currLang: any;
    public textType = 'password';
    public currTheme = COLOR_THEME.Dark;
    public guardianAddip: any;
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private tiModal: TiModalService,
        private tiMessage: TiMessageService,
        private zone: NgZone,
        public fb: FormBuilder) {
        this.i18n = this.i18nService.I18n();
        this.addFormGroup = fb.group({
            host: new FormControl('', CustomValidators.hostValid(this.i18n)),
            sshUsername: new FormControl('', [TiValidators.required]),
            sshPassword: new FormControl('', [TiValidators.required]),
            sshPort: new FormControl('22', CustomValidators.sshPortValid(this.i18n))
        });
    }
    public addModalForms = {
        selected: {
            label: 'Manually stop',
            value: false,
            required: true,
        },
        host: {
            required: true,
        },
        sshUsername: {
            required: true,
        },
        sshPassword: {
            required: true,
        },
        sshPort: {
            required: true
        },
    };
    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.addModalForms.selected.value = false;
        this.addFormGroup.controls.host.setValue('');

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
    }

    /**
     * sshName失焦校验
     */
    public checkRoot() {
        if (this.addFormGroup.controls.sshUsername.value === 'root') {
            this.isRoot = true;
        } else {
            this.isRoot = false;
        }
    }


    /**
     * 当界面语言为英文时，返回LANGUAGE_TYPE.EN
     * 当界面语言为非英文时，返回LANGUAGE_TYPE.ZH
     * 默认返回LANGUAGE_TYPE.ZH
     */
    public getLang() {
        const language: string = ((self as any).webviewSession || {}).getItem('language');
        if (language) {
            return language.indexOf('en') !== -1 ? LANGUAGE_TYPE.EN : LANGUAGE_TYPE.ZH;
        } else {
            return LANGUAGE_TYPE.ZH;
        }
    }
    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
     */
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
    /**
     * 新建
     */
    public createGuardian() {
        const params = {
            host: this.addFormGroup.controls.host.value,
            port: this.addFormGroup.controls.sshPort.value,
            username: this.addFormGroup.controls.sshUsername.value,
        };
        const option = {
            url: '/tools/fetch-fingerprint',
            params
        };
        this.vscodeService.post(option, (resp: any) => {
            if (resp.fingerprint) {
                this.fingerprint = resp.fingerprint;
                this.fingerprintTip = this.addFormGroup.controls.sshUsername.value + '@' +
                    this.addFormGroup.controls.host.value +
                    this.i18nService.I18nReplace(this.i18n.common_term_guardian_fingerprint_tip, {
                        0: this.fingerprint
                    });
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    this.openIntellijDialog();
                } else {
                    this.guardianCreateConfirmModal = this.tiModal.open(this.guardianCreateConfirmModalComponent, {
                        // 定义id防止同一页面出现多个相同弹框
                        id: 'guardianCreateConfirm',
                        modalClass: 'guardianManagementModal',
                        draggable: true,
                    });
                }
            } else {
                this.showInfoBox(resp.message, 'error');
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    this.vscodeService.showTuningInfo(resp.message, 'error',
                        'AddTargetEnvironment');
                }
            }
        });
    }
    public openIntellijDialog() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            const createGuardianInstance = this.tiMessage.open({
                id: 'createGuardian',
                type: 'prompt',
                title: this.i18n.plugins_javaperf_add_guardian_modalTitle,
                content: this.fingerprintTip,
                dismiss: (): void => {
                    this.zone.run(() => {
                        createGuardianInstance.close();
                    });
                },
                okButton: {
                    show: true,
                    click: (): void => {
                        this.zone.run(() => {
                            createGuardianInstance.close();
                        });
                        this.confirm(createGuardianInstance);
                    }
                },
                cancelButton: {
                    show: true,
                    click: (): void => {
                        this.zone.run(() => {
                            createGuardianInstance.close();
                        });
                    }
                }
            });
        } else {
            const createGuardianInstance = this.tiMessage.open({
                id: 'createGuardian',
                type: 'warn',
                title: this.i18n.plugins_javaperf_add_guardian_modalTitle,
                content: this.fingerprintTip,
                dismiss: (): void => {
                    this.zone.run(() => {
                        createGuardianInstance.close();
                    });
                },
                okButton: {
                    show: true,
                    click: (): void => {
                        this.zone.run(() => {
                            createGuardianInstance.close();
                        });
                        this.confirm(createGuardianInstance);
                    }
                },
                cancelButton: {
                    show: true,
                    click: (): void => {
                        this.zone.run(() => {
                            createGuardianInstance.close();
                        });
                    }
                }
            });
        }
    }
    /**
     * 确认
     */
    public confirm(context: any) {
        const params = {
            host: this.addFormGroup.controls.host.value,
            sshPort: this.addFormGroup.controls.sshPort.value,
            sshUsername: this.addFormGroup.controls.sshUsername.value,
            fingerprint: this.fingerprint,
            sshPassword: this.addFormGroup.controls.sshPassword.value
        };
        const option = {
            url: '/guardians',
            params
        };
        context.close();
        this.vscodeService.post(option, (resp: any) => {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                if (!resp.id) {
                    this.vscodeService.showTuningInfo(resp.message, 'error', 'AddTargetEnvironment');
                } else {
                    this.createGuardianSuccess.emit({ guardian: resp });
                    this.vscodeService.showTuningInfo(resp.id, 'info',
                        'AddTargetEnvironment');
                }
            } else {
                if (!resp.id) {
                    this.showInfoBox(resp.message, 'error');
                } else {
                    this.createGuardianSuccess.emit({ guardian: resp });
                    this.showInfoBox(this.i18n.common_term_add_guardian_success, 'info');
                    this.vscodeService.postMessage({ cmd: 'closeTargetEnvirpoment', data: {} });
                }
            }
        });
    }

    /**
     * 改变密文/明文
     */
    changeType(str: any) {
        this.textType = str;
    }

    /**
     * 按键判断
     */
    public keyUpOrKeyDown(event: any): any {
        if (event.ctrlKey && event.keyCode === 90) {
            return false;
        }
    }

    public guardianChangeIp( ip: any ) {
        if ( !this.addModalForms.selected.value ) {
          this.guardianAddip = ip;
        }
    }

    /**
     * 切换目标环境类型
     */
    public changeEnvType(localtype: any) {
        this.addModalForms.selected.value = localtype;
        const inputDom = (document as any).getElementsByClassName('ip-input')[0];
        if (localtype === true) {
            const option = {
                url: `/guardians/getLocalIpAddress`
            };
            this.vscodeService.get(option, (resp: any) => {
                this.addFormGroup.controls.host.setValue(resp);
                inputDom.setAttribute('disabled', 'disabled');
            });
        } else {
            inputDom.removeAttribute('disabled');
            this.addFormGroup.controls.host.setValue(this.guardianAddip);
        }
    }
}
