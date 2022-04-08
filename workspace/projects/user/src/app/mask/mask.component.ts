import { Component, OnInit , Input} from '@angular/core';
import { CloseMaskService } from '../service/close-mask.service';

@Component({
  selector: 'app-mask',
  templateUrl: './mask.component.html',
  styleUrls: ['./mask.component.scss']
})

export class MaskComponent implements OnInit {

  public myMask = false;
  constructor(private closeMaskService: CloseMaskService) {

   }

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
