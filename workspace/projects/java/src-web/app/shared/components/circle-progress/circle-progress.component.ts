import { Component, OnInit, ElementRef, Input, SimpleChanges, AfterViewInit, OnChanges } from '@angular/core';


@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss']
})
export class CircleProgressComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() progressData: any;
  @Input() progressPercent: any;
  @Input() theme: any;
  constructor(private el: ElementRef) { }
  private elCircle: any;
  private elBorder: any;
  public elId: string;
  public language: string;

  ngOnInit() {
    this.loadPercent(this.progressPercent);
    this.elId = this.progressData.id;
    this.language = sessionStorage.getItem('language');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.elCircle || !this.elCircle.length) { return; }
    this.rotateCircle();
    this.loadPercent(this.progressPercent);
  }

  ngAfterViewInit(): void {
    this.elCircle = $(`#${this.progressData.id}`);
    this.elBorder = $(`#${this.elId}-border`);
    if (!this.elCircle || !this.elCircle.length) { return; }
    this.rotateCircle();
  }

  public rotateCircle() {
    const that = this;
    this.elCircle.each(function(idx: any, el: any) {
      let deg = that.progressPercent * 360 / 100;
      deg = Number(deg);
      const color = that.colorFormat(that.progressData.remain, that.progressData.minVal, that.progressData.maxVal);
      $(this).css('background', color);
      that.elBorder.css('background', color);
    });
  }

  private colorFormat(val: any, min: any, max: any) {
    let color = '';
    if (val >= min && val <= max) { color = '#fdca5a'; }
    else if (val <= min) { color = '#f45c5e'; }
    else { color = '#7adfa0'; }
    return color;
  }
  loadPercent(percent: any) {
    const rotate = percent * 360 / 100;
    let rotateRight = 0;
    let rotateLeft = 0;
    if (rotate < 180) {
      rotateRight = rotate;
    } else {
      rotateRight = 135;
      rotateLeft = (rotate - 180);
      $('.left').css({
        '-webkit-transform': 'rotate(' + rotateLeft + 'deg)'
      });
    }
    $('.right').css({
      '-webkit-transform': 'rotate(180deg)',
    });
  }
}
