import { Component, OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-messagebox',
    templateUrl: './messagebox.component.html',
    styleUrls: ['./messagebox.component.scss']
})
export class MessageboxComponent implements OnInit {

    public myMask = false;
    public currLang = '';
    constructor(
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
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

    /**
     * 修改content-box宽度
     * @param width
     */
    public setContentBoxWidth(width: string) {
        $('.content-box')[0].style.setProperty( 'width', width, 'important' );
    }
}
