import { Component } from '@angular/core';

@Component({
    selector: 'app-popalert-modal',
    templateUrl: './popalert-modal.component.html',
    styleUrls: ['./popalert-modal.component.scss']
})
export class PopAlertModalComponent {

    public isShow = false;

    /**
     * close
     */
    public close() {
        this.isShow = false;

    }
    /**
     * open
     */
    public open() {
        this.isShow = true;
    }
}
