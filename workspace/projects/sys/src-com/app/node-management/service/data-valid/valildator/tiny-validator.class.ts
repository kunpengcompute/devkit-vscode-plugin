import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TiLocale, TiValidationConfig, Util } from '@cloud/tiny3';
import { IValidator } from './model/validator.interface';
import { Cat } from 'hyper';

export class TinyValidator implements IValidator {
  getError(validFn: ValidatorFn, control: AbstractControl): string | null {
    const errors = validFn(control);
    return null != errors ? this.getErrorStr(errors) : null;
  }

  // 获取错误提示字符串，思路是：
  // 1.先获取错误信息源字串（可能带params标识{0}/{1}等）;
  // 2.将获取的源字串中的参数替换为真实数据
  private getErrorStr(
    errors: ValidationErrors,
    validationConf: TiValidationConfig = {}
  ): string {
    const ruleKey: string = Object.keys(errors)[0];
    const ruleErrors: any = errors[ruleKey];
    const msgStr: string = this.getSourceStr(
      ruleKey,
      ruleErrors,
      validationConf
    );
    // 获取错误信息参数,无参数情况下,不需做格式匹配直接返回
    // errors格式示例：{required:true,{'maxlength': {'requiredLength': maxLength, 'actualLength': length}}}
    if (typeof ruleErrors !== 'object') {
      return msgStr;
    }
    const params: Array<string> = Object.values(ruleErrors); // 此处对错误信息定义有要求：要求错误返回对象与词条中的参数次序与一致

    return Util.formatEntry(msgStr, params);
  }

  private getSourceStr(
    ruleKey: string,
    ruleErrors: any,
    validationConf: TiValidationConfig
  ): string {
    // 优先使用tiValidation中的规则项配置errorMsg
    const errMsgConf: any = validationConf && validationConf.errorMessage;
    if (!Cat.isUndef(errMsgConf) && Cat.isStr(errMsgConf[ruleKey])) {
      return errMsgConf[ruleKey];
    }
    // 获取自定义校验规则中的tiErrorMsg
    if (
      typeof ruleErrors === 'object' &&
      Cat.isStr(ruleErrors.tiErrorMessage)
    ) {
      return ruleErrors.tiErrorMessage;
    }

    // 获取到的tiValidation errorMsg无效情况下,使用默认规则提示
    return (TiLocale.getLocaleWords() as any).tiValid.errorMsg[ruleKey] || '';
  }
}
