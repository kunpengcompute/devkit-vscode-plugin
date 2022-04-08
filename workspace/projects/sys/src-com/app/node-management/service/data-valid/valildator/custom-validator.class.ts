import { AbstractControl } from '@angular/forms';
import { IValidator } from './model/validator.interface';
import {
  CustomValidationErrors,
  CustomValidatorFn,
} from 'sys/src-com/app/service/custom-validators.service';

export class CustomValidator implements IValidator {
  getError(
    validFn: CustomValidatorFn,
    control: AbstractControl
  ): string | null {
    const errors: CustomValidationErrors = validFn(control);

    if (null != errors) {
      const errValues = Object.values(errors);
      return errValues[0].tiErrorMessage;
    } else {
      return null;
    }
  }
}
