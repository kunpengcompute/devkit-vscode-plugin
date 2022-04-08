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

    /**
     * 组件初始化
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
        if (this.showModal) {
            this.showModal = false;
            this.ongModalClose.emit();
        }
    }

}
