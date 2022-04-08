import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent implements OnInit {

  public myMask = false;
  constructor() {

  }

  ngOnInit() {
  }
  public close() {
    this.myMask = false;

  }
  public open() {
    this.myMask = true;
  }
}
