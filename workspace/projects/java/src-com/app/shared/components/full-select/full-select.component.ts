import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-full-select',
  templateUrl: './full-select.component.html',
  styleUrls: ['./full-select.component.scss']
})
export class FullSelectComponent implements OnInit {
  @Input() options: any;
  @Input() width: any;
  @Input() height: any;
  @Output() public ngModelChange = new EventEmitter<any>();
  /**
   * 返回父组件变化后的值
   */
  @Input()
  get ngModel() {
    return this.optionModel;
  }

  /**
   * 组件值产生变化后父组件改变
   */
  set ngModel(value) {
    this.optionModel = value.label;
  }
  constructor() {
    this.Options = this.options;
  }

  public optionModel: any;
  public Options: any = [];
  public selectWidth: any;
  public selectHeight: any;
  public show = false;
  public value: any;
  public clickBg: any;
  ngOnInit(): void {
    this.Options = this.options;
    if (this.width) {
      this.selectWidth = this.width;
    } else {
      this.selectWidth = 168;
    }
    if (this.height) {
      this.selectHeight = this.height;
    } else {
      this.selectHeight = 28;
    }
    $('.full-select').on('blur', () => {
      this.openValue();
    });
  }
  public openValue() {
    this.show = !this.show;
  }
  public getvalue(item: any) {
    if (!item.disabled) {
      this.ngModelChange.emit(item);
      this.optionModel = item.label;
      this.show = !this.show;
    }
  }
}
