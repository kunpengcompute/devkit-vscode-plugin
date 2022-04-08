import {
    Component,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges,
    ElementRef, NgZone, ChangeDetectorRef
} from '@angular/core';
import { MytipService } from '../../service/mytip.service';
import { MessageService } from '../../service/message.service';
import { I18nService } from '../../service/i18n.service';
import * as d3 from 'd3';
import { COLOR_THEME, currentTheme, VscodeService } from '../../service/vscode.service';
import { Utils } from '../../service/utils.service';
import { select } from 'd3-selection';
@Component({
    selector: 'app-flame',
    templateUrl: './flame.component.html',
    styleUrls: ['./flame.component.scss'],
})
export class FlameComponent implements OnInit, OnChanges {
    private flamegraph = require('d3-flame-graph');
    public flameJson: any;

    @Input() projectName: any;
    @Input() taskName: any;
    @Input() Active: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() flame: any;
    public hoverTimer: any;
    public updateInstans: any;
    public str: any;
    public showfire = true;
    public fireID: any;
    public subscription: any;
    public i18n;
    public showMenu: boolean;
    public menuX: any = '0px';
    public menuY: any = '0px';
    public targetHover: any;
    public hoverFunctionName: any;
    public isStack = false;
    constructor(
        public mytip: MytipService,
        private msgService: MessageService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private elementRef: ElementRef,
        private zone: NgZone,
        public changeDetectorRef: ChangeDetectorRef,

    ) {
        this.i18n = this.i18nService.I18n();
    }
    public picData = '';
    public hasData = true;

    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public showNoData = false;
    /**
     *  初始化
     */
    ngOnInit() {

        this.currTheme = currentTheme();
        this.initSvg();

        this.subscription = this.msgService.getMessage().subscribe((msg) => {
        });
    }

    /**
     *  初始化svg
     */
    public initSvg() {
        this.fireID = Utils.generateConversationId(16);
        self.webviewSession.setItem('fireID', this.fireID);
        const fireUrl = `/tasks/${this.taskid}/common/flame-graph/?node-id=${this.nodeid}&query-type=${this.flame}`;
        this.vscodeService
            .get({ url: fireUrl },
                (resp: { code: string | string[]; data: { children: any; }; }) => {
                    if (resp.code.includes('Success')) {
                        if (resp.data.children) {
                            this.flameJson = resp.data;
                            this.initChart();
                            this.hasData = true;
                        } else {
                            this.hasData = false;
                        }

                    } else {
                        this.showNoData = true;
                        this.vscodeService.showInfoBox(this.i18n.tip_msg.get_flame_error, 'error');
                    }
                });
    }

    /**
     * 初始化表格
     */
    public initChart() {
        // d3
        $('#' + this.fireID).html('');
        const data = this.flameJson;
        let width = $('.ti3-tab-content').width() * 0.85;
        if (!width) {
            width = width = $('.tab-content').width() * 0.85;
        }
        const flamegraph = this.flamegraph
            .flamegraph()
            .width(width)
            .cellHeight(18)
            .transitionEase(d3.easeCubic)
            .minFrameSize(1)
            .selfValue(true)
            .onClick((d: any) => {
              this.setTip();
            });
        if (this.flame !== 'onCPU') {
            flamegraph
                .setColorMapper((d: any) => '#0925F6');
        }
        d3.select('#' + this.fireID)
            .datum(data)
            .call(flamegraph);
        this.updateInstans = flamegraph;
        this.setTip();
    }
    private setTip() {
        const that = this;
        that.updateInstans.tooltip(false);
        that.updateInstans.setLabelHandler((d: any) => '');
        const g = d3.select('#' + this.fireID).selectAll('g');
        g.select('foreignObject')
            .each(function(d: any) {
                select(this).attr('label', '');
                select(this).attr('name', d.data.name || '--');
                select(this).attr('isStack', d.data.value || '');
                select(this).attr('module', d.data.module || '');
            });
        this.listSVGRightClick();
    }
    /**
     * 更新表格
     */
    public update() {
        this.updateInstans.update();
        this.setTip();
    }
    /**
     * 火焰图hover事件
     */
    public listSVGRightClick() {
        if (document.addEventListener) {
            document.addEventListener('DOMMouseScroll', () => { this.showMenu = false; }, false);
        }// W3C
        const mouseWheel = 'onmousewheel';
        const mouseOver = 'onmouseover';
        window.onmousewheel = document[mouseWheel] = () => { this.showMenu = false; }; // IE/Opera/Chrome
        // 鼠标滚动时隐藏menu
        document.onclick = () => { this.showMenu = false; }; // 鼠标点击页面隐藏menu
        document.querySelectorAll('#' + this.fireID + ' svg')[0][mouseOver]
            = (e: any) => {
                this.showMenu = false;
                const svgWidth = this.elementRef.nativeElement.querySelector('#' + this.fireID).offsetWidth;
                let targetElE;
                const tag = e.target || e.srcElement;
                if (tag.tagName === 'rect' || tag.tagName === 'title') {
                    targetElE = tag.parentNode.querySelector('foreignObject');
                } else if (tag.getAttribute('class') === 'd3-flame-graph-label') {
                    targetElE = tag.parentNode;
                } else {
                    targetElE = tag;
                }
                if (!targetElE) { clearTimeout(this.hoverTimer); return false; }
                if (targetElE.tagName !== 'foreignObject') {
                    clearTimeout(this.hoverTimer); return false;
                } // 如果不是text 则不出现菜单
                if (this.hoverTimer) { clearTimeout(this.hoverTimer); }
                this.targetHover = targetElE;
                // 栈顶函数判断: value为0,name含有[]不能查看详情
                const ifFunction = /^\[(.*?)\]$/.test(this.targetHover.getAttribute('name'));
                this.isStack = this.targetHover.getAttribute('isStack') === 0
                    || !this.targetHover.getAttribute('isStack')
                    || this.targetHover.getAttribute('name') === '[unknow]' ? false : true;
                this.isStack = this.isStack && !ifFunction;
                this.hoverFunctionName = this.targetHover.getAttribute('name');
                let layOut = this.flame === 'offCPU' ? 100 : 500;
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    layOut = 0;
                }
                this.hoverTimer = setTimeout(() => {
                    this.updateWebViewPage();
                    setTimeout(() => {
                        const num = 500;
                        this.menuY = e.clientY + 'px';
                        const tipWidth = this.elementRef.nativeElement.querySelector('#flame-menu')?.offsetWidth;
                        if (svgWidth - e.layerX + 100 < num) {
                            this.menuX = e.clientX - tipWidth + 'px';
                        } else {
                            this.menuX = e.clientX + 'px';
                        }
                        this.showMenu = true;
                        this.updateWebViewPage();
                    }, ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner'
                    ? layOut + 10 : 0);
                    this.targetHover.parentNode.onmouseleave = (event: { relatedTarget: any; toElement: any; }) => {
                        const relateEle = event.relatedTarget || event.toElement;
                        if (!(relateEle.getAttribute('id') === 'flame-menu')) {
                            this.menuX = -500 + 'px';
                            this.menuY = -500 + 'px';
                            this.showMenu = false;
                        } else {
                            this.elementRef.nativeElement.querySelectorAll('#flame-menu')[0].onmouseleave = () => {
                                this.menuX = -500 + 'px';
                                this.menuY = -500 + 'px';
                                this.showMenu = false;
                            };
                        }
                        this.updateWebViewPage();
                    };
                }, layOut);
                return false;
            };
        this.elementRef.nativeElement.querySelectorAll('.d3-container')[0].onmouseleave = (e: any) => {
            if (e.relatedTarget && e.relatedTarget.className.indexOf('ti3-tab-active') > -1) {
                clearTimeout(this.hoverTimer);
                this.showMenu = false;
            }
        };
    }

    /**
     * 查看详情
     */
    public clickMenu1() {
        const detail = {
            module: this.targetHover.getAttribute('module'),
            functionName: this.targetHover.getAttribute('name'),
        };
        this.msgService.sendMessage({
            function: 'openFunction',
            detail
        });
        this.showMenu = false;
        // 调用自己的业务代码 业务代码最后需要将 #flame-menu 的display设置为none
    }
    /**
     * change
     */
    ngOnChanges(changes: SimpleChanges): void {
        self.webviewSession.setItem('fireID', this.fireID);
        if (changes.Active.currentValue) {
            setTimeout(() => {
                if (this.updateInstans) {
                    this.update();
                }
            }, 50);
        }
    }

    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
}

