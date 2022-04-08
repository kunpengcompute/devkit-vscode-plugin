import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-mission-modal',
  templateUrl: './mission-modal.component.html',
  styleUrls: ['./mission-modal.component.scss']
})
export class MissionModalComponent implements OnInit {

  @Output() private ongModalClose = new EventEmitter<any>();
  constructor() { }

  public showModal = false;

  /**
   * ngOnInit
   */
  ngOnInit() {
  }

  /**
   * open
   */
  open() {
    this.showModal = true;
  }
  /**
   * close
   */
  close() {
    if (this.showModal) {
      this.showModal = false;
      this.ongModalClose.emit();
    }
  }
}
