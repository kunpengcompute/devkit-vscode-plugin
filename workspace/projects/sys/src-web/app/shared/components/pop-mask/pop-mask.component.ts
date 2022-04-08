import { Component, OnInit } from '@angular/core';
import { CloseMaskService } from '../../../service/close-mask.service';
@Component({
  selector: 'app-pop-mask',
  templateUrl: './pop-mask.component.html',
  styleUrls: ['./pop-mask.component.scss']
})
export class PopMaskComponent implements OnInit {
  public myMask = false;
  constructor(private closeMaskService: CloseMaskService) { }

  ngOnInit() {
  }
  public Close() {
    this.myMask = false;
    this.closeMaskService.sub.next(true);
  }
  public Open() {
    this.myMask = true;
  }
}
