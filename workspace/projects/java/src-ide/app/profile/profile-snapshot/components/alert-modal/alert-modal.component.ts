import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-alert-modal',
    templateUrl: './alert-modal.component.html',
    styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent implements OnInit {

    public myMask = false;
    constructor() {

    }

    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 关闭弹框
     */
    public close() {
        this.myMask = false;

    }

    /**
     * 打开弹框
     */
    public open() {
        this.myMask = true;
    }
}
