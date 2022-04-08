import { Component, Input, Output, EventEmitter } from '@angular/core';

interface Crumb {
    title: string;
    id?: number | string;
}
@Component({
    selector: 'app-timing-breadcrumb',
    templateUrl: './timing-breadcrumb.component.html',
    styleUrls: ['./timing-breadcrumb.component.scss']
})
export class TimingBreadcrumbComponent {
    // crumbList  crumbList:面包屑详细信息{title, id, action}
    public crumbListCopy: Array<Crumb> = [];
    @Input()
    set crumbList(val) {
        if (val == null) { return; }
        this.crumbListCopy = val;
    }
    get crumbList() {
        return this.crumbListCopy;
    }

    // 点击事件
    @Output() crumbClick = new EventEmitter<Crumb[]>();

    constructor() { }

    /**
     * 点击面包屑
     * @param index index
     */
    public onBreadClick(index) {
        this.crumbList = this.crumbList.slice(0, index + 1);
        if (this.crumbList.length === 1) {
            this.crumbList = [];
        }
        this.crumbClick.emit(this.crumbList);
    }
}
