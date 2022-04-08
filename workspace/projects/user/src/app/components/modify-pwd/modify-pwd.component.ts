import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Util } from '@cloud/tiny3';

@Component({
  selector: 'app-modify-pwd',
  templateUrl: './modify-pwd.component.html',
  styleUrls: ['./modify-pwd.component.scss']
})
export class ModifyPwdComponent implements OnInit {
  public myMask = false;
  constructor(
    private renderer2: Renderer2,
  ) {}
  @ViewChild('tiSelectConModify', { static: true }) private tiSelectConModifyRef: ElementRef;
  ngOnInit() {
    this.renderer2.listen(this.tiSelectConModifyRef.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
  }
  public Close($event: any) {
    this.myMask = false;
  }
  public Open() {
    this.myMask = true;
  }
}
