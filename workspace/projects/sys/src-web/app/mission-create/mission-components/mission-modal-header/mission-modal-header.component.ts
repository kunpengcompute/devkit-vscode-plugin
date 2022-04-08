import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-mission-modal-header',
  templateUrl: './mission-modal-header.component.html',
  styleUrls: ['./mission-modal-header.component.scss']
})
export class MissionModalHeaderComponent implements OnInit {
  @Output() ongModalClose = new EventEmitter<any>();
  constructor() { }

  public showModal = false;

  ngOnInit() {
  }

  open() {
    this.showModal = true;
  }
  close() {
    if (this.showModal) {
      this.showModal = false;
      this.ongModalClose.emit();
    }
  }
}
