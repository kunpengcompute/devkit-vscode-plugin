import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { TiModalService, TiValidationConfig } from '@cloud/tiny3';
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
    selector: 'app-guardian-create',
    templateUrl: './guardian-create.component.html',
    styleUrls: ['./guardian-create.component.scss']
})
export class GuardianCreateComponent implements OnInit {

    public i18n: any;

    @ViewChild('guardianCreateModalComponent', { static: false }) guardianCreateModalComponent: any;
    @ViewChild('guardianCreateConfirmModalComponent', { static: false }) guardianCreateConfirmModalComponent: any;
    @Output() createGuardianSuccess = new EventEmitter();
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public guardianCreateModal: any;
    public guardianCreateConfirmModal: any;
    public addFormGroup: FormGroup;
    public fingerprint: any;
    public fingerprintTip: any;
    public isClick = false;
    public currLang: any;
    public textType = 'password';
    public currTheme = COLOR_THEME.Dark;
    public isRoot = false;
    public guardianAddip: any;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private tiModal: TiModalService,
        public fb: FormBuilder,
    ) {
        this.i18n = this.i18nService.I18n();
        this.addFormGroup = fb.group({
            host: new FormControl('', CustomValidators.hostValid(this.i18n)),
            sshUsername: new FormControl('', [TiValidators.required]),
            sshPassword: new FormControl('', [TiValidators.required]),
            sshPort: new FormControl('', CustomValidators.sshPortValid(this.i18n))
        });
    }
    public pluginUrlCfg: any = {
        guardian_createFAQ6: '',
    };

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

        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });

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
     * show
     */
    public show() {
        this.addFormGroup.reset();
        this.addModalForms.selected.value = false;
        this.addFormGroup.controls.host.setValue('');
        this.addFormGroup.patchValue({
            sshPort: 22
        });
        this.fingerprint = '';
        this.isClick = false;
        this.isRoot = false;
        this.currLang = this.getLang();
        this.guardianCreateModal = this.tiModal.open(this.guardianCreateModalComponent, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'guardianCreate',
            modalClass: 'guardianManagementModal',
            draggable: true,
            dismiss: (): void => {
                this.addFormGroup.patchValue({
                    sshPassword: null
                });
            }
        });
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
    public createGuardian(context: any) {
        if (!this.isClick) {
            this.isClick = true;
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
                    this.fingerprintTip = this.addFormGroup.controls.sshUsername.value +
                        '@' + this.addFormGroup.controls.host.value +
                        this.i18nService.I18nReplace(this.i18n.common_term_guardian_fingerprint_tip, {
                            0: this.fingerprint
                        });
                    context.close();
                    this.isClick = false;
                    this.guardianCreateConfirmModal = this.tiModal.open(this.guardianCreateConfirmModalComponent, {
                        // 定义id防止同一页面出现多个相同弹框
                        id: 'guardianCreateConfirm',
                        modalClass: 'guardianManagementModal',
                        draggable: true,
                        close: (): void => {
                            this.addFormGroup.patchValue({
                                sshPassword: null
                            });
                        },
                        dismiss: (): void => {
                            this.addFormGroup.patchValue({
                                sshPassword: null
                            });
                        }
                    });
                } else {
                    this.isClick = false;
                    this.showInfoBox(resp.message, 'error');
                }
            });
        }
    }
    /**
     * 确认
     */
    public confirm(context: any) {
        if (!this.isClick) {
            this.isClick = true;
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
                if (!resp.id) {
                    this.showInfoBox(resp.message, 'error');
                } else {
                    this.createGuardianSuccess.emit({ guardian: resp });
                }
                params.sshPassword = null;
            });
        }
    }
    /**
     * 加载中
     */
    public startLoading() {
        const loadingCover = $('#loadingcover');
        if (loadingCover && loadingCover.length > 0) {
            loadingCover.show();
        } else {
            const html = `<div class="loadingBox" id="loadingcover">
                <div class="spinner">
                <div class="rect1"></div>
                <div class="rect2"></div>
                <div class="rect3"></div>
                <div class="rect4"></div>
                <div class="rect5"></div>
                </div>
            </div>`;
            $('.javaPerfSet').append(html);
        }
    }
    /**
     * 加载结束
     */
    public endLoading() {
        $('#loadingcover').hide();
    }

    /**
     * 改变密文
     */
    changeType() {
        this.textType = 'password';
    }

    /**
     *  改变明文
     */
    changeType1() {
        this.textType = 'text';
    }

    public guardianChangeIp(ip: any) {
        if (!this.addModalForms.selected.value) {
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
