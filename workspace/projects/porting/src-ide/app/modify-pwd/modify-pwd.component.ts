import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-modify-pwd',
    templateUrl: './modify-pwd.component.html',
    styleUrls: ['./modify-pwd.component.scss']
})
export class ModifyPwdComponent implements OnInit {
    @Input() title: any;
    public myMask = false;
    constructor() {

    }

    ngOnInit() {
    }
    public Close() {
        this.myMask = false;

    }
    public Open() {
        this.myMask = true;
    }
}
