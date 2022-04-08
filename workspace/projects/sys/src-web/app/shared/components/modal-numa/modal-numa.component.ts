import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-numa',
  templateUrl: './modal-numa.component.html',
  styleUrls: ['./modal-numa.component.scss']
})
export class ModalNumaComponent implements OnInit {


  constructor() { }

  public showModal = false;

  ngOnInit() {
  }

  open() {
    this.showModal = true;
  }

  close() {
    this.showModal = false;
  }

}
