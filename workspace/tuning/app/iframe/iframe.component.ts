import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME, DEFAULT_PORT } from '../service/vscode.service';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-config',
    templateUrl: './iframe.component.html',
    styleUrls: ['./iframe.component.scss']
})
export class IFrameComponent implements OnInit {

    public i18n: any;
    public src = 'https://www.baidu.com/';

    constructor(
        private route: ActivatedRoute, private i18nService: I18nService,
        private elementRef: ElementRef, public vscodeService: VscodeService) {
    }

    ngOnInit() {
        this.vscodeService.regVscodeMsgHandler('getProxyPort', (msg: any) => {
            this.src = `http://127.0.0.1:${msg.port}`;
        });
    }
    loadFinish() {
        const myFrame = this.elementRef.nativeElement.querySelector('#myFrame');
        const mask = this.elementRef.nativeElement.querySelector('#maskBox');
        mask.style.display = 'none';
        myFrame.style.opacity = 1;
    }
}
