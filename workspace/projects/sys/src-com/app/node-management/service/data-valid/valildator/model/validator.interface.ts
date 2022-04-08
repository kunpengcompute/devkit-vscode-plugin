import { AbstractControl, ValidatorFn } from '@angular/forms';

export interface IValidator {
  getError(validFn: ValidatorFn, control: AbstractControl): string | null;
}
