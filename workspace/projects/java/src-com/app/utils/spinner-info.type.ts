import { AbstractControl } from '@angular/forms';

/* 微调器 */
export interface SpinnerBlurInfo {
    control: AbstractControl;
    min: number;
    max: number;
}

/* 微调器 */
export interface SpinnerBlurDefaultInfo {
  control: AbstractControl;
  min: number;
  max: number;
  defaultValue: number;
}
