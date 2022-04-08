import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
    TiTableColumns,
    TiTableRowData,
    TiTableSrcData,
    TiTableDataState,
    TiValidationConfig,
    TiValidators,
} from '@cloud/tiny3';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { FormGroup, FormControl, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { disableCtrlZ } from 'projects/java/src-web/app/service/lib.service';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
@Component({
    selector: 'app-user-manage',
    templateUrl: './user-manage.component.html',
    styleUrls: ['./user-manage.component.scss']
})
export class UserManageComponent implements OnInit {
    constructor(
        public i18nService: I18nService,
        public Axios: AxiosService,
        public mytip: MytipService,
        private elementRef: ElementRef,
        public regularVerify: RegularVerify,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('creatUser') creatUser: any;
    @ViewChild('userListTable') userListTable: any;
    @ViewChild('deleteUser') deleteUser: any;
    i18n: any;
    public editRole: FormGroup;
    public editPwd: FormGroup;
    public userPwd: FormGroup;
    public delUserFormGroup: FormGroup;
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {},
    };
    public label = {
        Pwd: '',
        Cpwd: '',
        Role: '',
        Name: '',
        oldPwd: '',
        newPwd: '',
        managerPwd: '',
    };
    public RoleOptions = [
        {
            englishname: 'test',
            label: 'User',
        },
    ];
    public msg: any;
    public maskTitle: any = '';
    public create = true;
    public setpwd = false;
    public userId: any;
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public userList: TiTableSrcData;
    public columns: Array<TiTableColumns> = [];
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>; size: number } = {
        options: [10, 20, 50, 100],
        size: 20,
    };
    public loginUserId: any; // 登录用户的相关信息
    public loginPwd: any; // 确认当前用户的密码
    public managementPwd: any = '';
    public manageBtn: any = false;
    public delRow: any = '';
    public delContent: any = '';
    public pwdTrue: any = true;
    public redColor: any = false;
    public language: 'zh-cn' | 'en-us' | string;
    public hoverClose: any;
    public isLoading: any = false;
    public creatUserEyes: any = true;
    public deleteEyes: any = true;
    public deleteBtnDis: any = true;
    ngOnInit() {
        this.language = sessionStorage.getItem('language');
        this.RoleOptions = [
            {
                englishname: this.i18n.common_term_admin_user_normal,
                label: 'User',
            }
        ];
        this.columns = [
            {
                title: this.i18n.common_term_admin_user_name,
                width: '25%',
            },
            {
                title: this.i18n.common_term_admin_user_role,
                width: '25%',
            },
            {
                title: this.i18n.common_term_operate,
                width: '25%',
            },
        ];
        this.label = {
            Name: this.i18n.common_term_user_label.name,
            Role: this.i18n.common_term_user_label.role,
            Pwd: this.i18n.common_term_user_label.password,
            Cpwd: this.i18n.common_term_user_label.confirmPwd,
            oldPwd: this.i18n.common_term_user_label.oldPwd,
            newPwd: this.i18n.common_term_user_label.newPwd,
            managerPwd: this.i18n.common_term_user_label.adminPwd
        };
        // 删除用户管理员密码校验
        this.delUserFormGroup = new FormGroup({
            manPwd: new FormControl('', [
                CustomValidators.manPwd(this.i18n.newHeader.validata.req),
            ])
        });

        // 用户身份与用户名校验
        this.editRole = new FormGroup({
            name: new FormControl('', [
                this.regularVerify.username(this.i18n),
            ])
        });

        // 重置密码校验
        this.editPwd = new FormGroup({
            managerPwd: new FormControl('', {
                validators: [this.confirmationValidatorManage],
                updateOn: 'change'
            }),
            pwd: new FormControl('', [
                this.regularVerify.password(this.i18n, this.editRole),
            ]),
            cpwd: new FormControl('', [this.confirmationValidator])
        });
        this.getUserList(this.currentPage, this.pageSize.size, 1);
    }

    // 弹出创建用户 或 重置密码model框
    public createUser(): any {
        if (this.creatUser.myMask === true) {
            return false;
        } // 在编辑或创建框打开时无法再点击这个按钮
        this.maskTitle = this.i18n.common_term_admin_user_create_title;
        this.create = true;
        this.creatUser.open();
        this.hoverClose = '';
        this.creatUserEyes = true;
        this.editPwd.reset();
        this.editRole.reset();
        this.editRole.controls.name.enable();
    }
    public closeUserOpt() {
        this.editPwd.reset();
        this.editRole.reset();
        this.creatUser.close();
        this.creatUserEyes = false;
    }
    public onHoverClose(msg: any) {
        this.hoverClose = msg;
    }

    // 点击删除动作 打开删除model框
    public doDeleteUser(row: any) {
        this.delRow = row;
        this.delUserFormGroup.reset();
        this.managementPwd = '';
        this.hoverClose = '';
        this.deleteUser.open();
        this.deleteEyes = true;
    }

    // 删除用户操作
    public toDeleteUser(): void {
        if (this.managementPwd === '') {
            this.deleteBlur();
            return;
        }
        this.Axios.axios
            .delete(`/users/${encodeURIComponent(this.delRow.id)}/`, {
                data: { admin_password: this.managementPwd }, baseURL: '../user-management/api/v2.2'
            })
            .then((data: any) => {
                this.managementPwd = '';
                this.userListUpdate(this.userListTable, 0);
                this.mytip.alertInfo({
                    type: 'success',
                    content: this.i18n.tip_msg.delete_ok,
                    time: 3500
                });
                this.deleteUser.close();
                this.deleteEyes = false;
            })
            .catch((error: any) => {
                this.managementPwd = '';
                this.mytip.alertInfo({ type: 'warn', content: error.response.data.message, time: 3500 });
                this.deleteUser.close();
                this.deleteEyes = false;
            });
    }
    // 关闭删除model框
    public deleteClose() {
        this.deleteUser.close();
        this.managementPwd = '';
        this.deleteEyes = false;
        this.redColor = false;
    }
    public userListUpdate(e: any, num: any) {
        const dataState: TiTableDataState = e.getDataState();
        // num:状态标志,删除之后请求为0,默认应为1
        this.getUserList(dataState.pagination.currentPage, dataState.pagination.itemsPerPage, num);
    }
    public getUserList(currentPage = this.currentPage, pageSize = this.pageSize.size, num: number) {
        this.isLoading = true;
        if (+this.totalNumber % +pageSize === 1
            && currentPage === Math.ceil(this.totalNumber / pageSize) && num === 0) {
            currentPage = currentPage - 1;
        }
        !currentPage ? currentPage = 1 : currentPage = currentPage;
        this.Axios.axios.get('/users/?page=' + encodeURIComponent(currentPage)
            + '&per-page=' + encodeURIComponent(pageSize) +
            '&include-admin=false', { baseURL: '../user-management/api/v2.2', headers: { showLoading: false } })
            .then((data: any) => {
                this.isLoading = false;
                data.data.users = data.data.users.filter((item: any) => {
                    return item.role !== 'Admin';
                });
                data.data.users.forEach((item: any) => {
                    if (item.role === 'Guest') {
                        item.displayRole = this.i18n.common_term_admin_user_guest;
                    } else if (item.role === 'User') {
                        item.displayRole = this.i18n.common_term_admin_user_normal;
                    }
                });
                this.userList = {
                    data: data.data.users,
                    state: {
                        searched: false, // 源数据未进行搜索处理
                        sorted: false, // 源数据未进行排序处理
                        paginated: true // 源数据未进行分页处理
                    }
                };
                this.totalNumber = data.data.totalCounts;
            }).catch(() => {
                this.isLoading = false;
            });
    }


    // 创建用户 以及 重置密码
    public userOpt(): any {
        let url = '';
        let method = 'post';
        let okmasg = this.i18n.tip_msg.add_ok;
        if (this.checkGroup() === false) { return false; }
        const params = {
            role: this.RoleOptions[0].label,
            username: this.editRole.get('name').value || '',
            password: this.editPwd.get('pwd').value || '',
            confirm_password: this.editPwd.get('cpwd').value || '',
            admin_password: this.editPwd.get('managerPwd').value || ''
        };
        if (this.create) {
            url = '/users/';
            okmasg = this.i18n.tip_msg.add_ok;
            method = 'post';
        } else {
            url = '/users/' + encodeURIComponent(this.userId) + '/';
            okmasg = this.i18n.tip_msg.edite_ok;
            method = 'put';
        }   // 修改用户
        this.Axios.axios[method](url, params, { baseURL: '../user-management/api/v2.2' })
            .then((data: any) => {
                this.loginPwd = '';
                this.editPwd.reset();
                this.editRole.reset();
                this.creatUser.close();
                this.creatUserEyes = false;
                this.userListUpdate(this.userListTable, 1);
                this.mytip.alertInfo({ type: 'success', content: okmasg, time: 3500 });
            })
            .catch((error: any) => {
                this.loginPwd = '';
            });
    }

    public deleteBlur() {
        if (this.managementPwd.length > 0) {
            this.redColor = false;
        } else {
            this.redColor = true;
        }
    }
    public doEditUser(row: { id: any; username: any; }) {
        this.creatUser.open();
        this.hoverClose = '';
        this.creatUserEyes = true;
        this.create = false;
        this.editPwd.reset();
        this.maskTitle = this.i18n.common_term_admin_user_edit_user;
        this.userId = row.id;
        this.editRole.controls.name.disable();
        this.editRole.controls.name.setValue(row.username);
        this.setpwd = true;
        if (!this.create && !this.setpwd) {
            this.editPwd.controls.pwd.setValue('');
            this.editPwd.controls.cpwd.setValue('');
        }
    }

    public disableCtrlZ(event: any) {
        return disableCtrlZ(event);
    }
    checkGroup(): any {
        const errors: ValidationErrors | null = TiValidators.check(this.editRole);
        // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
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
        if (this.create || this.setpwd) {
            const errorPwd: ValidationErrors | null = TiValidators.check(
                this.editPwd
            );
            if (errorPwd) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const pwdError: any = Object.keys(errorPwd)[0];
                this.elementRef.nativeElement
                    .querySelector(`[formControlName=${pwdError}]`)
                    .focus();
                this.elementRef.nativeElement
                    .querySelector(`[formControlName=${pwdError}]`)
                    .blur();
                return false;
            }
        }
    }
    public checkManPwd(): any {
        const manPwderr: ValidationErrors | null = TiValidators.check(
            this.delUserFormGroup
        );
        if (manPwderr) {
            // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
            const pwdError: any = Object.keys(manPwderr)[0];
            this.elementRef.nativeElement
                .querySelector(`[formControlName=${pwdError}]`)
                .focus();
            this.elementRef.nativeElement
                .querySelector(`[formControlName=${pwdError}]`)
                .blur();
            return false;
        }
    }
    public updatePwdValidator() {
        Promise.resolve().then(() => {
            this.editPwd.controls.pwd.updateValueAndValidity();
        });
    }
    public manPwdValidator() {
        this.deleteBtnDis = this.managementPwd.length > 0 ? false : true;
    }
    public updateConfirmValidator() {
        Promise.resolve().then(() => {
            this.editPwd.controls.cpwd.updateValueAndValidity();
        });
    }
    public updateConfirmValidator2() {
        Promise.resolve().then(() => {
            this.userPwd.controls.cpwd.updateValueAndValidity();
        });
    }
    confirmationValidatorManage = (control: FormControl) => {
        if (!control.value) {
            return {
                managerPwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.newHeader.validata.req,
                },
            };
        } else {
            return null;
        }
    }

    confirmationValidator = (control: FormControl) => {
        if (!control.value) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.newHeader.validata.req,
                },
            };
        } else if (
            this.editPwd.controls.cpwd.value !== this.editPwd.controls.pwd.value
        ) {
            return {
                cpwd: {
                    confirm: true,
                    error: true,
                    tiErrorMessage: this.i18n.newHeader.validata.pwd_conf,
                },
            };
        }
        return {};
    }
    resetPassword = (control: FormControl) => {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value)) || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(control.value)) {
            return { pwd: { tiErrorMessage: this.i18n.newHeader.validata.pwd_rule } };
        }
        if (this.userPwd.controls.oldPwd.value &&
            control.value === this.userPwd.controls.oldPwd.value.split('').reverse().join('')) {
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
                    tiErrorMessage: this.i18n.validata.pwd_conf,
                },
            };
        } else if (control.value !== this.userPwd.controls.pwd.value) {
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
}
export class CustomValidators {
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
    public static manPwd(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return !control.value ? { oldPwd: { tiErrorMessage: i18n } } : null;
        };
    }
}

