import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InputConfig } from '../profile-setting.component';
import { I18nService } from '../../../../service/i18n.service';
import { VscodeService } from '../../../../service/vscode.service';
import {
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    AbstractControl,
} from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';

@Component({
    selector: 'app-profile-setting-item',
    templateUrl: './profile-setting-item.component.html',
    styleUrls: ['./profile-setting-item.component.scss'],
})
export class ProfileSettingItemComponent implements OnInit {

    @Input() options: InputConfig;
    @Input() type: 'times' | 'records';
    public valueCopy: number;
    @Input()
    set value(val) {
        this.valueCopy = val;
        this.sysConfForm.patchValue({ inputValue: val });
    }
    get value() {
        return this.valueCopy;
    }
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {},
    };

    /**
     * 输出确定修改事件
     */
    @Output() confirm = new EventEmitter<string>();

    /**
     * 输出恢复默认值事件
     */
    @Output() restore = new EventEmitter<void>();

    public i18n: any;
    public modifying = false;
    public validateError = false;
    public checkText = '';
    public errorMsg = '';
    public sysConfForm: any;

    constructor(
        private i18nService: I18nService,
        private vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.sysConfForm = new FormGroup({
            inputValue: new FormControl(this.valueCopy, [this.inputValueValidator(this.i18nService.I18n())])
        });
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.sysConfForm.controls.inputValue.disable();
    }

    public inputValueValidator(i18n: any): ValidatorFn {
        const reg = new RegExp(
            /^[1-9]\d*$/
        );
        return (control: AbstractControl): ValidationErrors | null => {
            const tmpValue = control.value;
            if (tmpValue === '' || tmpValue == null) {
                return { inputValue: { tiErrorMessage: i18n.newHeader.nullNotice } };
            }
            const isNum = reg.test(tmpValue);
            if (isNum) {
                if (+tmpValue >= this.options.range[0] && +tmpValue <= this.options.range[1]) {
                    return null;
                } else {
                    return { inputValue: { tiErrorMessage: i18n.newHeader.errNotice } };
                }
            } else {
                return { inputValue: { tiErrorMessage: i18n.newHeader.plugins_java_tip_onlyDigits } };
            }
        };
    }



    /**
     * 恢复默认值
     *
     * @param valueInput 输入框
     */
    public reset() {
        if (Number(this.sysConfForm.controls.inputValue.value) === this.options.range[0]) {
            return;
        }
        this.restore.emit();
    }

    public onFixConfig() {
        this.modifying = true;
        this.sysConfForm.controls.inputValue.enable();
    }
    public onCancel(evt: any) {
        evt.preventDefault();
        this.modifying = false;
        this.sysConfForm.controls.inputValue.setValue(this.valueCopy);
        this.sysConfForm.controls.inputValue.disable();
        this.sysConfForm.clearValidators();
    }

    /**
     * 提交修改
     *
     * @param valueInput 输入框
     */
    public submit() {
        this.sysConfForm.controls.inputValue.disable();
        this.modifying = false;
        if (Number(this.sysConfForm.controls.inputValue.value) === this.options.value) {
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.vscodeService.showTuningInfo(this.i18n.plugins_perf_java_profiling_limitation.notice.defaultValue,
                   'warn', 'dataLimitation');
                return;
            }else{
                return;
            }
        }
        this.confirm.emit(this.sysConfForm.controls.inputValue.value);
    }

}
