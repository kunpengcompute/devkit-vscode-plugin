import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

    constructor() { }

    public showModal = false;

    /**
     * 初始化
     */
    ngOnInit() {
    }

    /**
     * 打开弹窗
     */
    open() {
        this.showModal = true;
    }

    /**
     * 关闭弹窗
     */
    close() {
        this.showModal = false;
    }

}
