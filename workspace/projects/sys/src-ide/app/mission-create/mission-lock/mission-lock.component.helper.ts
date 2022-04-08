import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
/**
 * 校验规则
 */
export class FunctionNameValidators {
    /**
     * 自定义校验规则
     * @param i18n 参数
     */
    public static functionName(i18n): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let validate = true;
            const arr = control.value.split(',');
            if (arr.length > 0) {
                arr.forEach((item) => {
                    if (item === '*') {
                        validate = false;
                    }
                });
            }
            return validate ? null : { pwd: { tiErrorMessage: i18n } };
        };
    }
}

