
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-panoramic-mask',
  templateUrl: './panoramic-mask.component.html',
  styleUrls: ['./panoramic-mask.component.scss']
})
export class PanoramicMaskComponent implements OnInit {
  @Output() closeMask = new EventEmitter<any>();
  public myMask = false;
  constructor() {

  }

  ngOnInit() {
  }
  public CloseIO(str?: any) {
    this.myMask = false;
  }
  public Close() {
    this.myMask = false;
    this.closeMask.emit('mask');

  }
  public Open() {
    this.myMask = true;
  }

}
