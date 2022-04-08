import { Component, ViewChild } from '@angular/core';
import { TiModalService } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';

@Component({
  selector: 'app-sample-suggest',
  templateUrl: './sample-suggest.component.html',
  styleUrls: ['./sample-suggest.component.scss']
})
export class SampleSuggestComponent {
    @ViewChild('suggestionModal', { static: false }) suggestionModal: any;
    constructor(
        private tiModal: TiModalService,
        public i18nService: I18nService,
        private downloadService: SamplieDownloadService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any;
    public suggestNum = 0;
    public showDetail = true;
    public modal: any;
    public modalTitle: any;
    public suggestItem: any = [
        {
          tabName: 'enviroment',
          suggest: []
        },
        {
          tabName: 'gc',
          suggest: []
        },
        {
          tabName: 'objects',
          suggest: []
        }
    ];
    /**
     * 展开、收起内容
     */
    public unfoldContent(item: any) {
        item.state = !item.state;
    }
    /**
     * 优化建议汇总弹窗,
     * @param showFirst:是否默认展开第一个
     */
    public open(showFirst: any) {
        this.suggestItem[0].suggest = this.downloadService.downloadItems.env.suggestArr;
        this.suggestItem[1].suggest = this.downloadService.downloadItems.gc.suggestArr;
        this.suggestItem[2].suggest = this.downloadService.downloadItems.leak.suggestArr;
        const suggestArr = this.suggestItem[0].suggest.concat(this.suggestItem[1].suggest, this.suggestItem[2].suggest);
        this.suggestNum = suggestArr.length;
        if (showFirst && this.suggestNum > 0) {
            suggestArr[0].state = true;
        }
        this.modalTitle = this.i18n.protalserver_sampling_tab.suggestions;
        if (this.suggestNum) {
            this.modalTitle += ' (' + this.suggestNum + ')';
        }
        this.modal = this.tiModal.open(this.suggestionModal, {
            id: 'suggestionModal',
            draggable: true
        });
    }
}
