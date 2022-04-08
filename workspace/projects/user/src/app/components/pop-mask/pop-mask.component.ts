import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-pop-mask',
  templateUrl: './pop-mask.component.html',
  styleUrls: ['./pop-mask.component.scss']
})
export class PopMaskComponent implements OnInit {
  public myMask = false;

  ngOnInit() {
  }
  public Close() {
    this.myMask = false;
  }
  public Open() {
    this.myMask = true;
  }
}
