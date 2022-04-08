import {
    AfterViewInit, Component, ElementRef, EventEmitter,
    Input, OnDestroy, OnInit, Output, Renderer2, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { EventManager } from '@angular/platform-browser';
/**
 * 需要注意的是，如果web端需要适配esc触发全屏和退出全屏事件的话，要给需要全屏的DOM，它的父级加一个padding-top: 1px;
 */
@Component({
    selector: 'app-zoom-screen',
    templateUrl: './zoom-screen.component.html',
    styleUrls: ['./zoom-screen.component.scss']
})
export class ZoomScreenComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() fullEl: any; // 需要全屏的dom
    @Input() draggableEl: any; // 需要放大缩小的dom
    @Input() wheelShowScale: any; // 放大缩小比例状态
    @Output() public zoomBn = new EventEmitter<any>();
    @Output() public reduceBn = new EventEmitter<any>();
    @Output() public zoomParam = new EventEmitter<any>();
    constructor(
        private renderer2: Renderer2,
        private eventManager: EventManager,
    ) { }
    @ViewChild('fullScreen', { static: false }) fullScreen: ElementRef;
    public fullScreenState: any = false; // 标记是否全屏
    private unFullScreenClickFn: () => void;

    /**
     * 初始化
     */
    ngOnInit(): void {
        this.eventManager.addGlobalEventListener('window', 'keyup.esc',
            () => { this.fullScreenState = false; });
        this.eventManager.addGlobalEventListener('window', 'keyup.f11',
            () => { this.onExitFullScreen(document); });
    }
    /**
     * dom
     */
    ngAfterViewInit(): void {
        this.onClickFullScreen();
    }
    /**
     * 页面销毁
     */
    ngOnDestroy() {
        this.unFullScreenClickFn();
    }
    /**
     * 全屏点击事件
     */
    public onClickFullScreen() {
        this.unFullScreenClickFn = this.renderer2.listen(this.fullScreen.nativeElement, 'click', () => {
            if (!this.fullScreenState) {
                this.onSetFullScreen(this.fullEl);
                this.zoomBn.emit(true);
                this.fullScreenState = true;
            } else {
                this.onExitFullScreen(document);
                this.zoomBn.emit(false);
                this.fullScreenState = false;
            }

        });

        this.fullEl.onmousewhell = this.onScrollZoom;
        // 退出全屏
        fromEvent(window, 'resize').subscribe(() => {
            if (this.fullEl.offsetTop > 0) {
                this.zoomBn.emit(false);
                this.fullScreenState = false;
            }
        });
    }
    /**
     * 放大缩小
     */
    public onWheelShowZoom(num: number) {
        this.wheelShowScale *= num;
        this.zoomParam.emit(this.wheelShowScale);
        this.renderer2.setStyle(this.draggableEl.nativeElement, 'transform', `scale(${this.wheelShowScale})`);
    }
    /**
     * 放大缩小
     */
    public onScrollZoom = (e: any) => {
        e = e || (window as any).event;
        // e.detail用来兼容FireFox
        e.wheelDelta > 0 || e.detail > 0 ? this.onWheelShowZoom(1.1) : this.onWheelShowZoom(0.9);
    }
    /**
     * 设置全屏
     * @param element dom
     */
    private onSetFullScreen(element: any) {
        if (element.requestFullScreen) {
            element.requestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.oRequestFullScreen) {
            element.oRequestFullScreen();
        } else if (element.msRequestFullScreen) {
            element.msRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
    }
    /**
     * 退出全屏
     * @param element dom
     */
    private onExitFullScreen(element: any) {
        if (element.exitFullscreen) {
            element.exitFullscreen();
        } else if (element.webkitExitFullscreen) {
            element.webkitExitFullscreen();
        } else if (element.mozCancelFullScreen) {
            element.mozCancelFullScreen();
        } else if (element.msExitFullscreen) {
            element.msExitFullscreen();
        }
    }
}
