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

    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 打开弹窗
     */
    public open(): void {
        this.showModal = true;
    }

    /**
     * 关闭弹窗
     */
    public close(): void {
        if (this.showModal) {
            this.showModal = false;
            this.ongModalClose.emit();
        }
    }
}
