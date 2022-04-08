import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-modal-numa',
    templateUrl: './modal-numa.component.html',
    styleUrls: ['./modal-numa.component.scss']
})
export class ModalNumaComponent implements OnInit {


    constructor() { }

    public showModal = false;

    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 弹窗打开
     */
    open() {
        this.showModal = true;
    }

    /**
     * 弹窗关闭
     */
    close() {
        this.showModal = false;
    }

}
