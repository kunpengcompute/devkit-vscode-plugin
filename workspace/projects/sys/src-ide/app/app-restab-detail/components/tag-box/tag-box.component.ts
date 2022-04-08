import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { DomSanitizer } from '@angular/platform-browser';
import { COLOR_THEME, VscodeService } from 'sys/src-ide/app/service/vscode.service';

@Component({
    selector: 'app-tag-box',
    templateUrl: './tag-box.component.html',
    styleUrls: ['./tag-box.component.scss']
})
export class TagBoxComponent implements OnInit {
    public isExpand = false; // tag是否展开
    public i18n: any;
    public selected: Array<{ disable: boolean }>;
    public filterSrc = './assets/img/resource/toggleHover.svg';
    public moreSrc = '';
    @Input() label: string;
    @Input()
    get selecTag() { return this.selected; }
    set selecTag(select) {
        this.isExpand = false;
        this.selected = select;
    }
    @Output() deleteTag = new EventEmitter();
    constructor(
        public i18nService: I18nService,
        public sanitizer: DomSanitizer,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 点击tag，删除选中项
     * @param taskItem taskItem
     */
    public deleteTask(taskItem: any) {
        this.deleteTag.emit(taskItem);
    }

    /**
     * 关闭tags弹框
     */
    public closeBox() {
        this.isExpand = false;
        this.mouseleave();
    }

    /**
     * 筛选 鼠标移入
     */
    public mouseenter() {
        this.filterSrc = './assets/img/resource/toggleNormal.svg';
    }
    /**
     * 筛选 鼠标移出
     */
    public mouseleave() {
        this.filterSrc = './assets/img/resource/toggleHover.svg';
    }
    ngOnInit() {
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.handleImg(COLOR_THEME.Light);
        } else {
            this.handleImg(COLOR_THEME.Dark);
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.handleImg(msg.colorTheme);
        });
    }
    private handleImg(color: any){
        this.moreSrc = color === COLOR_THEME.Light ? './assets/img/resource/moreNormalWhite.svg'
        : './assets/img/resource/moreNormal.svg';
    }
}
