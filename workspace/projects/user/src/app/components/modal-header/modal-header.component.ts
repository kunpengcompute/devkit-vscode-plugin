import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss']
})
export class ModalHeaderComponent implements OnInit {
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
