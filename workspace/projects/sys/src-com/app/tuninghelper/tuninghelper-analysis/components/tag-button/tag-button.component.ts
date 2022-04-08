import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tag-button',
  templateUrl: './tag-button.component.html',
  styleUrls: ['./tag-button.component.scss']
})
export class TagButtonComponent implements OnInit {

  // 默认颜色色值 默认值：#2aa956
  @Input() normalColor: any = '#2aa956';
  // 选中颜色色值 默认值：#2aa956
  @Input() selectColor: any = '#2aa956';
  // 当前是否选中状态 默认非选中
  @Input() isSelected = false;
  // 左边图标iconname（tiny3图标） 默认值：checkmark
  @Input() iconName: any = 'checkmark';
  // 是否有权限
  @Input() hasAuthotity = false;

  @Output() tagBtnClickEnv = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }


  /**
   * 点击事件
   */
  public tagBtnClick() {
    this.tagBtnClickEnv.emit();
  }

}
