import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import {
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    AbstractControl,
} from '@angular/forms';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { disableCtrlZ } from 'projects/java/src-web/app/service/lib.service';
@Component({
    selector: 'app-modifypwd',
    templateUrl: './modifypwd.component.html',
    styleUrls: ['./modifypwd.component.scss']
})
export class ModifypwdComponent implements OnInit {

    @ViewChild('modal') modal: any;
    constructor(
        public i18nServe: I18nService,
        public Axios: AxiosService,
        public myTip: MytipService,
        private elementRef: ElementRef,
    ) {
        this.i18n = this.i18nServe.I18n();
        this.pwdFormGroup = new FormGroup({
            oldPwd: new FormControl('', [
                CustomValidators.oldPwd(this.i18n.newHeader.validata.oldPwd_rule),
            ]),
            pwd: new FormControl('', [this.resetPassword]),
            cpwd: new FormControl('', [this.userPwdConfirm]),
        });
        this.pwdForm = {
            oldPwd: {
                required: true,
                title: this.i18n.common_term_user_label.oldPwd,
            },
            newPwd: {
                required: true,
                title: this.i18n.common_term_user_label.newPwd,
            },
            confirmPwd: {
                required: true,
                title: this.i18n.common_term_user_label.confirmPwd,
            }
        };
    }

    public i18n: any;
    public isOpen = false;
    public hoverClose = '';
    // 使用TiValidation定义接口类型
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {},
    };
    public loginUserId: any;
    public pwdFormGroup: FormGroup;
    public pwdForm = {
        oldPwd: {
            required: true,
            title: '',
        },
        newPwd: {
            required: true,
            title: '',
        },
        confirmPwd: {
            required: true,
            title: '',
        }
    };
    ngOnInit() {
        this.loginUserId = sessionStorage.getItem('loginId');
    }
    public open() {
        this.pwdFormGroup.reset();
        this.modal.open();
        this.isOpen = true;
        $('.toggleSpan').css({ display: 'none' });
    }
    public close() {
        this.modal.close();
        $('.toggleSpan').css({ display: 'block' });
        this.isOpen = false;
        this.pwdFormGroup.reset();
        this.hoverClose = '';
    }
    public logOut() {
        const roleId = sessionStorage.getItem('loginId');
        this.Axios.axios.delete('/users/session/' + encodeURIComponent(roleId) + '/',
            { baseURL: '../user-management/api/v2.2' })
            .then((data: any) => {
                this.myTip.alertInfo({ type: 'success', content: this.i18n.logout_ok, time: 3500 });
                setTimeout(() => {
                    sessionStorage.setItem('role', '');
                    sessionStorage.setItem('token', '');
                    sessionStorage.setItem('username', '');
                    sessionStorage.setItem('loginId', '');
                    sessionStorage.setItem('topState', '');
                    window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
                }, 1000);
            });
    }
    public confirm(): any {
        const errors: ValidationErrors | null = TiValidators.check(this.pwdFormGroup);
        if (errors) {
            // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
            const firstError: any = Object.keys(errors)[0];
            this.elementRef.nativeElement
                .querySelector(`[formControlName=${firstError}]`)
                .focus();
            this.elementRef.nativeElement
                .querySelector(`[formControlName=${firstError}]`)
                .blur();
            return false;
        }
        const params = {
            old_password: this.pwdFormGroup.get('oldPwd').value,
            new_password: this.pwdFormGroup.get('pwd').value,
            confirm_password: this.pwdFormGroup.get('cpwd').value,
        };
        this.Axios.axios.put('/users/' + this.loginUserId + '/password/',
            params, { baseURL: '../user-management/api/v2.2' })
            .then((data: any) => {
                this.pwdFormGroup.reset();
                this.logOut();
                this.close();
            })
            .catch((error: any) => { });
    }
    public onHoverClose(msg: any) {
        this.hoverClose = msg;
    }
    /** 禁用Ctrl + Z 【目前包含密码框】 */
    public disableCtrlZ(event: any) {
        return disableCtrlZ(event);
    }
    resetPassword = (control: FormControl) => {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value)) || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(control.value)) {
            return {
                pwd: {
                    tiErrorMessage: control.value ?
                        this.i18n.newHeader.validata.pwd_rule : this.i18n.newHeader.validata.req
                }
            };
        }
        if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value)) || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(control.value)) {
            return { pwd: { tiErrorMessage: this.i18n.newHeader.validata.pwd_rule } };
        }
        if (control.value === this.pwdFormGroup.controls.oldPwd.value) {
            return { pwd: { tiErrorMessage: this.i18n.newHeader.validata.pwd_rule4 } };
        }
        if (
            this.pwdFormGroup.controls.oldPwd.value &&
            control.value === this.pwdFormGroup.controls.oldPwd.value.split('').reverse().join('')
        ) {
            return { pwd: { tiErrorMessage: this.i18n.newHeader.validata.pwd_rule3 } };
        }
        if (
            control.value === sessionStorage.getItem('username') ||
            control.value === sessionStorage.getItem('username').split('').reverse().join('')
        ) {
            return { pwd: { tiErrorMessage: this.i18n.newHeader.validata.pwd_rule2 } };
        } else {
            return null;
        }
    }
    userPwdConfirm = (control: FormControl) => {
        if (!control.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.newHeader.validata.req,
                },
            };
        } else if (control.value !== this.pwdFormGroup.controls.pwd.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.validata.pwd_conf,
                },
            };
        }
        return {};
    }
    public updateConfirmValidator2() {
        Promise.resolve().then(() => {
            this.pwdFormGroup.controls.cpwd.updateValueAndValidity();
        });
    }
}
export class CustomValidators {
    // 自定义校验规则
    public static password(i18n: any, editRole: any): ValidatorFn {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value)) ||
                (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(control.value)) {
                return { pwd: { tiErrorMessage: i18n.newHeader.validata.pwd_rule } };
            }
            if (control.value === editRole.get('name').value ||
                control.value === editRole.get('name').value.split('').reverse().join('')) {
                return { pwd: { tiErrorMessage: i18n.newHeader.validata.pwd_rule2 } };
            } else {
                return null;
            }
        };
    }
    public static cinputPassword(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return (control.value !== '') === false ?
                { pwd: { tiErrorMessage: i18n.common_term_password_check } } : null;
        };
    }
    public static oldPwd(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return !control.value ? { oldPwd: { tiErrorMessage: i18n } } : null;
        };
    }
    public static username(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            return reg.test(control.value) === false
                ? { oldPwd: { tiErrorMessage: i18n } }
                : null;
        };
    }
}
