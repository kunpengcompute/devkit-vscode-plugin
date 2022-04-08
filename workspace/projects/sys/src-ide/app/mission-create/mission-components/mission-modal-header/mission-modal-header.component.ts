import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-mission-modal-header',
    templateUrl: './mission-modal-header.component.html',
    styleUrls: ['./mission-modal-header.component.scss']
})
export class MissionModalHeaderComponent implements OnInit {
    @Output() ongModalClose = new EventEmitter<any>();
    public myMask = false;
    public currLang = '';

    constructor() { }

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.currLang = self.webviewSession.getItem('language');
    }

    /**
     * Close
     */
    public Close() {
        this.myMask = false;
        this.ongModalClose.emit();
    }

    /**
     * Open
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
