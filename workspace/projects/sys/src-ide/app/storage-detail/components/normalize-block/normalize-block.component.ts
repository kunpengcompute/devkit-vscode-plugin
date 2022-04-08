import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NormalizeBlockData, POIBlockData } from './domain/index';
import { I18nService } from '../../../service/i18n.service';
import {COLOR_THEME, currentTheme} from './../../../service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';

@Component({
    selector: 'app-normalize-block',
    templateUrl: './normalize-block.component.html',
    styleUrls: ['./normalize-block.component.scss'],
})
export class NormalizeBlockComponent implements OnInit {
    @ViewChild('followTip', { static: true }) followTipTpl: TemplateRef<any>;
    @ViewChild('container', { static: true }) containerEl: ElementRef;
    /** 输入数据 */
    @Input() rawData: NormalizeBlockData;
    /** 色块字典 */
    public colors: any = {};
    public i18n: any;
    public followTipData: {
        html: string | TemplateRef<any>,
        pos: { top: number, left: number },
        context?: any
    };
    public isFollowTipShow = false;
    public currTheme = COLOR_THEME.Dark;
    public darkColorList = ['#fdeee0', '#f8e0cb', '#f8dcc5', '#fedcbf', '#fdd7b6', '#f5c8a1',
                            '#fdc99b', '#f7bf8d', '#eeb27d', '#f3b57e', '#f5b47c', '#f6ac6c',
                            '#f5a45d', '#ed9549', '#ed8c39', '#e5832f', '#d27827', '#c0691c'];
    public lighColorList = ['#fff2e4', '#feead4', '#fddfbe', '#fdd3a6', '#fddcb7', '#fdd5ab',
                            '#fccd9a', '#fcc78f', '#fabb76', '#fabb76', '#fab66c', '#faaf5f',
                            '#f9a953', '#f9a448', '#f89d3b', '#f89730', '#f89225', '#f78a15'];
    constructor(
        public i18nService: I18nService,
        private cdr: ChangeDetectorRef,
        private themeServe: HyThemeService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        this.themeServe.subscribe((msg) => {
            this.setTheme(msg);
        });
        // 根据值的大小排序构造颜色块
        const colorList = this.currTheme === COLOR_THEME.Dark ? this.darkColorList : this.lighColorList;
        const dataKeys = Object.keys(this.rawData.data).sort();
        Object.keys(this.rawData.data).forEach(key => {
            const index = dataKeys.indexOf(key);
            if (index < colorList.length) {
                this.colors[key] = colorList[index];
            }
        });
    }
    private setTheme(theme: HyTheme) {
        if (!theme) {
            return;
        }
        this.currTheme = theme === 'light' ? COLOR_THEME.Light : COLOR_THEME.Dark;
        const colorList = this.currTheme === COLOR_THEME.Dark ? this.darkColorList : this.lighColorList;
        const dataKeys = Object.keys(this.rawData.data).sort();
        Object.keys(this.rawData.data).forEach(key => {
            const index = dataKeys.indexOf(key);
            if (index < colorList.length) {
                this.colors[key] = colorList[index];
            }
        });
    }

    /**
     * 鼠标指针穿过（进入）块元素时
     * @param poi 块数据
     */
    onBlockMouseenter(poi: POIBlockData) {
        const blockRect: DOMRectReadOnly = poi.domRect;
        const conRect: DOMRectReadOnly = this.containerEl.nativeElement.getBoundingClientRect();
        const top = blockRect.top - conRect.top + blockRect.height / 2;
        const left = blockRect.left - conRect.left + blockRect.width / 2;

        poi.data.percent = Math.round(poi.data.percent * 100) / 100;
        poi.data.value = Math.round(poi.data.value);
        this.followTipData = {
            html: this.followTipTpl,
            context: poi.data,
            pos: {
                top,
                left,
            },
        };
        this.isFollowTipShow = true;
        this.cdr.markForCheck();
    }

    /**
     * 鼠标指针离开块元素时
     */
    onBlockMouseleave() {
        this.isFollowTipShow = false;
        this.cdr.markForCheck();
    }
}
