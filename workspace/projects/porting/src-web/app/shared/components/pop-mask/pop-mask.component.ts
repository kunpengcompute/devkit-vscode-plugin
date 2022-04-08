import { Component } from '@angular/core';
import { CloseMaskService } from '../../../service/close-mask.service';

@Component({
  selector: 'app-pop-mask',
  templateUrl: './pop-mask.component.html',
  styleUrls: ['./pop-mask.component.scss']
})
export class PopMaskComponent {
  public myMask = false;
  constructor(private closeMaskServe: CloseMaskService) { }

  public Close() {
    this.myMask = false;
    this.closeMaskServe.sub.next(true);
  }
  public Open() {
    this.myMask = true;
  }
}
