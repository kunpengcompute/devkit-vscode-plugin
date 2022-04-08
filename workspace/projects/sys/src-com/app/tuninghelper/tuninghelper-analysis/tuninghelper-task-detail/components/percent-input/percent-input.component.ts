import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-percent-input',
  templateUrl: './percent-input.component.html',
  styleUrls: ['./percent-input.component.scss'],
})
export class PercentInputComponent implements OnInit {
  @Input()
  set value(value: number) {
    this.number = Number(String(value * 100).split('.')[0]);
  }
  @Output() valueChange = new EventEmitter<number>();
  public number: number;

  @Input()
  set min(min: number) {
    this.minValue = Number(String(min * 100).split('.')[0]);
  }
  public minValue: number;

  @Input()
  set max(max: number) {
    this.maxValue = Number(String(max * 100).split('.')[0]);
  }
  public maxValue: number;

  constructor() {}

  ngOnInit(): void {}

  public numberChange() {
    if (this.number < this.minValue) {
      this.number = this.minValue;
    } else if (this.number > this.maxValue) {
      this.number = this.maxValue;
    }
    this.number = +String(this.number).replace(/[e.+-]/g, '') || 0;
    this.valueChange.emit(this.number / 100);
  }

  /**
   * 在ngModelChange的方法中修改值无效，故做一下失焦赋值
   */
  public inputBlur(numberInput: HTMLInputElement) {
    numberInput.value = String(this.number);
  }

  public onKeypress(event: KeyboardEvent) {
    if (event.code === 'NumpadDecimal' || event.code === 'KeyE') {
      event.preventDefault();
    }
  }
}
