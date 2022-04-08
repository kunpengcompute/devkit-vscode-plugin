import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-messagebox',
    templateUrl: './messagebox.component.html',
    styleUrls: ['./messagebox.component.scss']
})
export class MessageboxComponent implements OnInit {

    public myMask = false;
    public currLang = '';
    intelliJFlagDef = false;
    constructor(
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
        this.route.queryParams.subscribe((data) => {
            this.intelliJFlagDef = (data.intelliJFlag || data.intellijFlag) ? true : false;
        });
    }

    public Close() {
        this.myMask = false;
    }

    public Open() {
        this.myMask = true;
    }

    /*
     *忽略语言
     */
    public clearLang() {
        this.currLang = '';
    }
}
