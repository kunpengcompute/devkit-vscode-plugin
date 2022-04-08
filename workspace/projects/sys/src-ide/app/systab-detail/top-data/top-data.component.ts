import { Component, EventEmitter, OnInit, Output, ElementRef } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import {currentTheme, VscodeService} from '../../service/vscode.service';
import { COLOR_THEME } from '../../service/vscode.service';
@Component({
    selector: 'app-top-data',
    templateUrl: './top-data.component.html',
    styleUrls: ['./top-data.component.scss']
})
export class TopDataComponent implements OnInit {
    @Output() getCodeData = new EventEmitter();

    public fileIndex = 0; // 当前查看文件的索引
    public fileList: ({ isHover: boolean, text: string })[] = []; // 文件列表【左侧】
    public fileData = { // 文件内容【右侧】
        title: '',
        totalContent: [],
        total: (undefined as number),
        indexBits: 1, // 文本内容index的最大位数，用来使index列表前补空格，保持宽度一致
    };
    public i18n: any;
    public currTheme: any;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    constructor(
        public i18nService: I18nService,
        private elementRef: ElementRef,
        public vscodeService: VscodeService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    /**
     * 组件初始化
     */
    ngOnInit() {
        // 获取VSCode当前主题颜色
        this.currTheme = currentTheme();
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        setTimeout(() => {
            this.getCodeData.emit(this.fileIndex);
        }, 1000);
    }
    /**
     * 切换其他file
     * @param index 文件索引
     */
    public fileChange(index) {
        this.getCodeData.emit(index);
    }
    /**
     * 查看文件
     * @param fileIndex 文件索引
     */
    public setCodeData({ fileIndex, fileList, fileData }) {
        if (fileIndex !== undefined) {
            this.fileIndex = fileIndex;
        }

        if (fileList !== undefined) {
            this.fileList = fileList.map(item => {
                return {
                    isHover: false,
                    text: item,
                };
            });
        }

        if (fileData !== undefined) {
            this.fileData.title = fileData.title;
            this.fileData.totalContent = fileData.content.map((item, index) => {
                return {
                    index: index + 1,
                    text: item,
                };
            });
            this.fileData.total = this.fileData.totalContent.length;
            this.fileData.indexBits = String(this.fileData.totalContent.length).length;
        }
    }
}
