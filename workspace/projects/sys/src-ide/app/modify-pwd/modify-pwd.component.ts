import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-modify-pwd',
    templateUrl: './modify-pwd.component.html',
    styleUrls: ['./modify-pwd.component.scss']
})
export class ModifyPwdComponent implements OnInit {


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
