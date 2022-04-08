import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IValidator } from './validator.interface';

export interface IValidContext {
  setValidator(validator: IValidator): IValidContext;

  valid(validFn: ValidatorFn): (control: AbstractControl) => string[] | null;
}
