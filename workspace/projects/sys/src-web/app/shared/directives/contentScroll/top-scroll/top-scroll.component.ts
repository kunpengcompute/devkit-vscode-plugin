import { Component, OnInit, ElementRef } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
@Component({
  selector: 'app-top-scroll',
  templateUrl: './top-scroll.component.html',
  styleUrls: ['./top-scroll.component.scss']
})
export class TopScrollComponent implements OnInit {
  public i18n: any;
  constructor(
  public el: ElementRef,
  public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
   }
  ngOnInit() {
  }
  public toTop() {
    const ele = this.el.nativeElement.previousSibling;
    $(ele).animate({scrollTop: '0px'}, 500);
  }

  public show() {
    this.el.nativeElement.querySelector('.svg-box').style.display = 'block';
  }
  public hide() {
    this.el.nativeElement.querySelector('.svg-box').style.display = 'none';
  }
}
