import { Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VscodeService } from '../service/vscode.service';
import { MessageService } from '../service/message.service';

@Component({
    selector: 'app-byte-show',
    templateUrl: './byte-show.component.html',
    styleUrls: ['./byte-show.component.scss']
})
export class ByteShowComponent implements OnInit {
    @Input() diffPath: any;
    @Input() reportId: any;
    @Input() isCheck: any;
    @ViewChild('codeShow', { static: false }) codeShow: any;
    public temp: any = null;
    public step: any = null;
    public struckStep: any = null;
    public report: any;
    public routerFileDQJC: any;
    public routerFile: any;
    public currLang: any;
    public intellijFlag = false;
    constructor(
        public vscodeService: VscodeService,
        public activaedRoute: ActivatedRoute,
        public msgService: MessageService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.routerFile = (self as any).webviewSession.getItem('routerFile');
        this.routerFileDQJC = (self as any).webviewSession.getItem('routerFileDQJC');
        this.currLang = (self as any).webviewSession.getItem('language');
        if ((self as any).webviewSession.getItem('isFirst') !== '1') {
            this.activaedRoute.queryParams.subscribe((data: any) => {
                this.intellijFlag = (data.intellijFlag === 'true') ? true : false;
                this.getByteAlignmentInfo(data.diffPath, data.reportId);
            });
        }
    }

    getByteAlignmentInfo(diffPath: any, reportId: any) {
        const params = {
            file_path: diffPath,
            task_name: reportId
        };
        this.temp = null;
        this.vscodeService.post({ url: `/portadv/tasks/migration/bytealignment/taskresult/`, params }, (resp: any) => {
            if (resp.status === 0) {
                this.temp = resp.data;
            }
            if (this.intellijFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }
    /**
     * 隐藏
     */
    public layout() {
        this.codeShow.doLayout();
    }

    /**
     * 滚动右侧
     */
    public scrollToRight(data: any) {
        this.step = data;
        if (this.intellijFlag) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 滚动左侧
     */
    public scrollToLeft(data: any) {
        this.struckStep = data;
        if (this.intellijFlag) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
}
