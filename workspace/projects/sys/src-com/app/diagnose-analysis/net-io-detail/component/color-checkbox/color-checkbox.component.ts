import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CheckboxOption = {
  label: string;
  value: string;
  color: string;
  checked?: boolean;
};

@Component({
  selector: 'app-color-checkbox',
  templateUrl: './color-checkbox.component.html',
  styleUrls: ['./color-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorCheckboxComponent),
      multi: true,
    },
  ],
})
export class ColorCheckboxComponent implements ControlValueAccessor {
  readonly defaultValueKey = 'value';
  readonly defaultLabelKey = 'label';
  readonly defaultColorKey = 'color';

  @Input()
  set options(val: CheckboxOption[]) {
    if (null == val) {
      return;
    }

    this.pureOptions = val.map((item) => {
      return { ...item, checked: false };
    });
  }
  @Input() valueKey: string;
  @Input() labelKey: string;
  @Input() colorKey: string;

  @Output() selectItem = new EventEmitter<(CheckboxOption | string)[]>();
  @Output() ngModelChange = new EventEmitter<(CheckboxOption | string)[]>();

  pureOptions: CheckboxOption[];

  private propagateChange = (_: (CheckboxOption | string)[]) => {};
  private propagateTunched = (_: any) => {};

  constructor() {}

  writeValue(val: (CheckboxOption | string)[]) {
    if (null == val) {
      return;
    }
    this.pureOptions = this.markCheckedOption(
      this.valueKey,
      this.pureOptions,
      val
    );
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  /**
   * 点击色块和文字时的处理函数
   * @param index 被点击的索引
   */
  onClick(index: number) {
    const option = this.pureOptions[index];
    option.checked = !option.checked;
    const checkedOptions = this.filterCheckedOptions(
      this.valueKey,
      this.pureOptions
    );
    this.propagateChange(checkedOptions);
    this.selectItem.emit(checkedOptions);
  }

  trackByFn(index: number, item: any): string {
    return null == this.valueKey
      ? item[this.defaultValueKey]
      : item[this.valueKey];
  }

  /**
   * 标记所有的选项中已选择的选项
   * @param valueKey value 的 key
   * @param sumOptions 所有的选项
   * @param selected 已选择的选项
   * @returns 新的选项列表
   */
  private markCheckedOption(
    valueKey: string,
    sumOptions: CheckboxOption[],
    selected: (CheckboxOption | string)[]
  ): CheckboxOption[] {
    const valueSele = selected.map((item: any) => {
      return null == valueKey ? item[this.defaultValueKey] : item;
    });

    const newOptions = sumOptions.map((item: any) => {
      const checked = valueSele.includes(
        null == valueKey ? item[this.defaultValueKey] : item[valueKey]
      );
      const option = {
        ...item,
        checked,
      };
      return option;
    });

    return newOptions;
  }

  /**
   * 筛选出所有的选项中已选择的选项
   * @param valueKey value 的 key
   * @param sumOptions 所有的选项
   * @returns 被选中的项
   */
  private filterCheckedOptions(
    valueKey: string,
    sumOptions: CheckboxOption[]
  ): (CheckboxOption | string)[] {
    const checkedItems = sumOptions
      .filter((item) => item.checked)
      .map((item) => {
        if (null == valueKey) {
          const value = { ...item };
          delete value.checked;
          return value;
        } else {
          return (item as any)[valueKey];
        }
      });

    return checkedItems;
  }
}
