import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-step-loading',
  templateUrl: './step-loading.component.html',
  styleUrls: ['./step-loading.component.scss']
})
export class StepLoadingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('svg') svg: any;

  public svgDom: any;
  public timer: any;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.svgDom = this.svg.nativeElement;
    this.show();
  }

  ngOnDestroy() {
    this.hide();
  }

  private show() {
    const c = 264;
    const	m = 15;
    const that = this;
    this.svgDom.style.display = 'block';
    move1();

    function move1() {
      let i = 0;
      let	o = 0;
      move();

      function move() {
        if (i === c) {
          move2();
        } else {
          i += 4;
          o += 8;
          that.svgDom.setAttribute('stroke-dasharray', i + ' ' + (c - i));
          that.svgDom.setAttribute('stroke-dashoffset', o);
          that.timer = setTimeout(move, m);
        }
      }
    }

    function move2() {
      let i = c;
      let o = c * 2;
      move();

      function move() {
        if (i === 0) {
          move1();
        } else {
          i -= 4;
          o += 4;
          that.svgDom.setAttribute('stroke-dasharray', i + ' ' + (c - i));
          that.svgDom.setAttribute('stroke-dashoffset', o);
          that.timer = setTimeout(move, m);
        }
      }
    }
  }

  private hide() {
    this.svgDom.style.display = 'none';
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.svgDom.setAttribute('stroke-dasharray', '0 264');
    this.svgDom.setAttribute('stroke-dashoffset', '0');
  }
}
