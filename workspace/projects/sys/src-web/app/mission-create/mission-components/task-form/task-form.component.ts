import { Component, Input } from '@angular/core';
import { TiValidationConfig } from '@cloud/tiny3';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {
  @Input() displayedElementList: any[];
  @Input() allFormElements: any;
  @Input() formGroup: any;
  @Input() type: string;
  @Input() labelWidth = '200px';
  @Input() from: string;  // template 表示是查看模板信息，添加对应的css
  @Input() widthIsLimited = false;  // 表单父容器的宽度是否受限，例如在 home 界面提示信息在输入框的后面显示，在修改预约任务的drawer里面提示信息需要在输入框的下面显示

  public validation: TiValidationConfig = { // [tiValidation]='validation' 可以更改提示规则
    type: 'blur'
  };

  constructor() { }

  public trackByFn(a: any, b: any) {
    return a.value.order - b.value.order;
  }

  public identify(index: any, item: any) {
    return item.key;
  }

  get tipInfoLeftPosition() {
    return -parseInt(this.labelWidth, 10) - 20 + 'px';
  }

  /**
   * 获取当前微调器
   */
  getspinnerBlur(formControlName: string, min: number, max: number) {
    return {
      control: this.formGroup.controls[formControlName],
      min,
      max,
    };
  }
}
