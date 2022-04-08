import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Output() private ongModalClose = new EventEmitter<any>();
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
