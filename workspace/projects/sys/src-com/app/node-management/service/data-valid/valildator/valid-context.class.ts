import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IValidContext } from './model/valid-context.interface';
import { IValidator } from './model/validator.interface';

export class ValidContext implements IValidContext {
  private validator: IValidator;

  setValidator(validator: IValidator): ValidContext {
    this.validator = validator;
    return this;
  }

  valid(validFn: ValidatorFn): (control: AbstractControl) => string[] | null {
    return (control: AbstractControl) => {
      const errStr = this.validator.getError(validFn, control);
      return errStr ? Array.of(errStr) : null;
    };
  }
}
