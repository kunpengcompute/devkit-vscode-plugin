import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TiModalService } from '@cloud/tiny3';
import { I18nService } from '../../../../service/i18n.service';

@Component({
    selector: 'app-details-pop-up',
    templateUrl: './details-pop-up.component.html',
    styleUrls: ['./details-pop-up.component.scss']
})
export class DetailsPopUpComponent implements OnInit {
    @Input() detailLists: any[];
    @ViewChild('oomDetailsModal') oomDetailsModal: any;
    constructor(
        private tiModal: TiModalService,
        public i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any;
    public modal: any;
    public searchValue: any;
    public currentIndex = 0;
    public diagnoseType: string;
    ngOnInit(): void {
    }
    public showMsg(type?: string): void {
        if (type === 'exception') {
            this.diagnoseType = 'exception';
        }
        this.modal = this.tiModal.open(this.oomDetailsModal, {
            id: 'oomDetailsModal', // 定义id防止同一页面出现多个相同弹框
            modalClass: 'oomDetailsModal',
            close: (): void => {
                this.searchValue = '';
            },
            dismiss: (): void => {
                this.searchValue = '';
            },
        });
    }

    public onModelChange(e: any) {
        this.currentIndex = 0;
    }
    public jumpNext(e: any) {
        if (e.keyCode === 13) {
            const searchWordAll = document.querySelectorAll('.oomHighlightWord') as NodeListOf<HTMLElement>;
            if (this.currentIndex > searchWordAll.length - 1) {
                this.currentIndex = 0;
            }
            searchWordAll.forEach((el: any) => {
                el.style.background = 'transparent';
            });
            const currentDom = searchWordAll[this.currentIndex];
            currentDom.style.background = 'yellow';
            const parentDom = currentDom.parentNode.parentNode as HTMLElement;
            parentDom.scrollIntoView(false);
            this.currentIndex++;
        }
    }
}
