import { AbstractControl } from '@angular/forms';

export interface HySpinnerBlurInfo {
    control: AbstractControl;
    min: number;
    max: number;
    defaultValue?: number;
}
