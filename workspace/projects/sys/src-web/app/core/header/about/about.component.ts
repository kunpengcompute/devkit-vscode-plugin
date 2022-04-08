import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  @Input() title: any ;
  public myMask = false;
  constructor() { }

  ngOnInit() {
  }
  public Close() {
    this.myMask = false;

  }
  public Open() {
    this.myMask = true;
  }
}
