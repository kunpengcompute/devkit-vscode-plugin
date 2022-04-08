import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mask',
  templateUrl: './mask.component.html',
  styleUrls: ['./mask.component.scss']
})

export class MaskComponent implements OnInit {

  public myMask = false;
  constructor() {

  }

  ngOnInit() {
  }
  public Close() {
    this.myMask = false;

  }
  public Open() {
    this.myMask = true;
  }
}
