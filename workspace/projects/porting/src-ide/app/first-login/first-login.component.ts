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

    ngOnInit() {
    }
    public Close() {
        this.myMask = false;

    }
    public Open() {
        this.myMask = true;
    }

}
