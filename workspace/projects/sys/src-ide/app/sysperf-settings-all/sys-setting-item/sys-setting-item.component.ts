import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import {
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    AbstractControl,
} from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { VscodeService } from '../../service/vscode.service';

@Component({
    selector: 'app-sys-setting-item',
    templateUrl: './sys-setting-item.component.html',
    styleUrls: ['./sys-setting-item.component.scss']
})
export class SysSettingItemComponent implements OnInit {
    constructor(
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.sysConfForm = new FormGroup({
            inputValue: new FormControl(this.valueCopy, [this.inputValueValidator(this.i18nService.I18n())])
        });
    }

    @Input()
    set value(val) {
        this.valueCopy = val;
        this.sysConfForm.patchValue({ inputValue: val });
    }
    get value() {
        return this.valueCopy;
    }
    @Input() hideRange: boolean; // 是否展示输入数据范围值字段
    @Input() config: {
        label: string,
        range: Array<number>,
        value: number
    };
    @Output() confirm = new EventEmitter<any>();
    public i18n: any;
    public mode: 'read' | 'write' = 'read';
    public sysConfForm: any;
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {},
    };
    public valueCopy: number;
    public language: 'zh-cn' | 'en-us' | string;

    // 用户角色判断
    public isAdmin = false;

    /**
     * 组件初始化
     */
    ngOnInit() {
        // 用户角色判断
        this.isAdmin = VscodeService.isAdmin();

        this.sysConfForm.controls.inputValue.disable();
        this.language = (self as any).webviewSession.getItem('language');
    }

    /**
     * 输入框可用
     */
    public onFixConfig() {
        this.mode = 'write';
        this.sysConfForm.controls.inputValue.enable();
    }

    /**
     * 取消修改
     */
    public onCancel(evt) {
        evt.preventDefault();
        this.mode = 'read';
        this.sysConfForm.controls.inputValue.setValue(this.valueCopy);
        this.sysConfForm.controls.inputValue.disable();
        this.sysConfForm.clearValidators();
    }

    /**
     * 确认
     */
    public onSubmit() {
        this.mode = 'read';
        this.sysConfForm.controls.inputValue.disable();
        this.confirm.emit(this.sysConfForm.controls.inputValue.value);
    }

    /**
     * 表单提示信息
     */
    public inputValueValidator(i18n: any): ValidatorFn {
        const reg = new RegExp(
            /^[1-9]\d*$/
        );
        return (control: AbstractControl): ValidationErrors | null => {
            const tmpValue = control.value;
            if (tmpValue === '' || tmpValue == null) {
                return { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_empty_judge } };
            }
            const isNum = reg.test(tmpValue);
            if (isNum) {
                if (+tmpValue >= this.config.range[0] && +tmpValue <= this.config.range[1]) {
                    return null;
                } else {
                    return { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_vaild_value } };
                }
            } else {
                return { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_vaild_value } };
            }
        };
    }
}
