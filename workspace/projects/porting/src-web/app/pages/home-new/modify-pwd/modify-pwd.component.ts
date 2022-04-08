import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modify-pwd',
  templateUrl: './modify-pwd.component.html',
  styleUrls: ['./modify-pwd.component.scss']
})
export class ModifyPwdComponent {
  @Input() title: any;

  public myMask = false;

  constructor() {
  }

  public Close() {
    this.myMask = false;
  }

  public Open() {
    this.myMask = true;
  }
}
