import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

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
