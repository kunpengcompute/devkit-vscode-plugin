import { Component, OnInit, ElementRef, Input, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss']
})
export class CircleProgressComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() progressData: any;
  @Input() progressPercent: any;
  @Input() theme: any;
  constructor(private el: ElementRef) { }
  private elCircle: any;
  private elBorder: any;
  public elId = '';
  public language = '';

  ngOnInit() {
    this.elId = this.progressData.id;
    this.language = sessionStorage.getItem('language');
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.elCircle) { return; }
    this.rotateCircle();
  }
  ngAfterViewInit(): void {
    this.elCircle = $(`#${this.elId}`);
    this.elBorder = $(`#${this.elId}-border`);
    if (!this.elCircle) { return; }
    this.rotateCircle();
  }
  public rotateCircle() {
    const that = this;
    this.elCircle.each(function(idx: any, el: any) {
      const deg = that.progressPercent * 360 / 100;
      let color: string;
      if (that.progressData.alarmStatus === 2) {
        color = '#f45c5e';
      } else {
        color = '#fdca5a';
      }
      if (deg <= 180) {
        $(this).find('.right').css('transform', 'rotate(' + deg + 'deg)');
      } else {
        $(this).find('.right').css('transform', 'rotate(180deg)');
        $(this).find('.left').css('transform', 'rotate(' + (deg - 180) + 'deg)');
      }
      $(this).css('background', color);
      that.elBorder.css('background', color);
    });
  }
}
