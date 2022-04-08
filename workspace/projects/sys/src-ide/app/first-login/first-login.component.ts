import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-first-login',
    templateUrl: './first-login.component.html',
    styleUrls: ['./first-login.component.scss']
})
export class FirstLoginComponent implements OnInit {

    public myMask = false;
    constructor() {

    }

    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 关闭弹窗
     */
    public Close() {
        this.myMask = false;

    }

    /**
     * 打开弹窗
     */
    public Open() {
        this.myMask = true;
    }

}
