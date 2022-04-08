import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-infor-tip',
  templateUrl: './infor-tip.component.html',
  styleUrls: ['./infor-tip.component.scss']
})
export class InforTipComponent implements OnInit {
  @Input() tipType: any; // 根据tip类型判断不同的样式弹框，normal：普通的蓝色弹框，alarm：警告的黄色弹框，error：告警的红色弹框，
  @Input() inforText: any; // tip信息
  @Input() tipMinHeight: any; // tip的最小高度

  constructor() { }
  public showTip = true;

  ngOnInit(): void {
    if (!this.tipType) {
      this.tipType = 'normal';
    }
  }
  public close() {
    this.showTip = false;
  }

}
