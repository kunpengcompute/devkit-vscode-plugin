import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';

@Component({
    selector: 'app-porting-password',
    templateUrl: './porting-password.component.html',
    styleUrls: ['./porting-password.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => PortingPasswordComponent),
        multi: true,
    }],
})
export class PortingPasswordComponent implements ControlValueAccessor {

    @Input() appTiValidation: TiValidationConfig;
    @Input() canCut = false;
    @Input() canCopy = false;
    @Input() canPaste = true;

    public inputType: 'text' | 'password' = 'password';
    public inputValue = '';
    public isDisabled = false;

    onChange: (value: string) => void;
    onTouched: () => void;

    public changeHandler(event: any) {
        this.onChange(event.target.value);
    }

    writeValue(value: string): void {
        this.inputValue = value;
    }

    registerOnChange(onChange: any): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    public cutHandler(event: Event) {
        if (!this.canCut) {
            event.preventDefault();
        }
    }

    public copyHandler(event: Event) {
        if (!this.canCopy) {
            event.preventDefault();
        }
    }

    public pasteHandler(event: Event) {
        if (!this.canPaste) {
            event.preventDefault();
        }
    }

    public keyEventHandler(event: KeyboardEvent) {
        if (!this.canCut && event.ctrlKey && event.key === 'x') {
            event.preventDefault();
        }
        if (!this.canCopy && event.ctrlKey && event.key === 'c') {
            event.preventDefault();
        }
        if (!this.canPaste && event.ctrlKey && event.key === 'v') {
            event.preventDefault();
        }
    }

    public eyesClickHandler() {
        if (this.inputType === 'password') {
            this.inputType = 'text';
        } else {
            this.inputType = 'password';
        }
    }

}
