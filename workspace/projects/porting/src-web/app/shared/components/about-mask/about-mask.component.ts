import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-about-mask',
  templateUrl: './about-mask.component.html',
  styleUrls: ['./about-mask.component.scss']
})
export class AboutMaskComponent implements OnInit {
  @Input() title: any;
  @Input() isFirstDisclaimer: boolean; // 是否为首次免责声明弹窗
  @Input() isDisclaimer: boolean; // 是否为免责声明弹窗
  public myMask = false;
  constructor() { }

  public currLang: any;

  ngOnInit() {
    this.currLang = sessionStorage.getItem('language');
  }
  public Close() {
    this.myMask = false;

  }
  public Open() {
    this.myMask = true;
  }
}
