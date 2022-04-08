import { Component, Input, OnInit, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import lottie from 'lottie-web';

@Component({
  selector: 'app-brush-tips',
  templateUrl: './brush-tips.component.html',
  styleUrls: ['./brush-tips.component.scss']
})
export class BrushTipsComponent implements OnInit, AfterViewInit {
  public i18n: any;
  public tips = '';
  public readChecked = false;
  @Input() type: string;
  @Output() public firstTip = new EventEmitter<any>();
  constructor(
    public i18nService: I18nService,
    private elementRef: ElementRef
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    if (this.type === 'iops') {
      this.tips = this.i18n.storageIO.apis_tips;
    } else {
      this.tips = this.i18n.storageIO.diskio_tips;
    }
  }
  ngAfterViewInit() {
    this.createSvg();
    const bool = sessionStorage.getItem('brushTip');
    this.readChecked = bool === 'true' ? true : false;
    if (!this.readChecked) {
      this.firstTip.emit('first');
    }
  }
  public createSvg() {
    const that = this;
    const sysSelection = that.elementRef.nativeElement.querySelector('.brushTips');
    lottie.loadAnimation({
      container: sysSelection,
      renderer: 'svg',
      loop: true,
      path: './assets/img/brush.json'
    }).addEventListener('DOMLoaded', () => {

    });
  }
  public changeBrushTip(e: any) {
    sessionStorage.setItem('brushTip', e);
  }
}
