import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-messagebox',
    templateUrl: './messagebox.component.html',
    styleUrls: ['./messagebox.component.scss']
})
export class MessageboxComponent implements OnInit {

    public myMask = false;
    public currLang = '';

    constructor() { }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.currLang = self.webviewSession.getItem('language');
    }

    /**
     * 弹窗关闭
     */
    public Close() {
        this.myMask = false;
    }

    /**
     * 弹窗打开
     */
    public Open() {
        this.myMask = true;
    }

    /**
     * 忽略语言
     */
    public clearLang() {
        this.currLang = '';
    }
}
