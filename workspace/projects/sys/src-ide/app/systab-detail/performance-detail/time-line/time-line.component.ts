import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { AxiosService } from '../../../service/axios.service';
import { fromEvent } from 'rxjs';
import { LeftShowService } from './../../../service/left-show.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { MyTimeLineData } from '../../../service/myTimeLineData.service';

@Component({
    selector: 'app-time-line',
    templateUrl: './time-line.component.html',
    styleUrls: ['./time-line.component.scss']
})
export class TimeLineComponent implements OnInit, AfterViewInit {
    @Input() timeData: any;
    @Input() lineData: any;
    @Output() public timeLineData = new EventEmitter<any>();
    public show = false;
    public timeLine = [];
    public rightData = -1;
    public leftData = 0;
    public lestShow = false;
    public boxShow = false;
    public showWidth = -1;
    public start = 0;
    public endData = -1;
    public timeBox = '';
    public timeSelect = '';
    public timeLeft = '';
    public timeRight = '';
    public OriginalTotalWidth = 0;
    public OriginalLeft = 0;
    public OriginalWidth = 0;

    constructor(
        public Axios: AxiosService,
        public leftShowService: LeftShowService,
        private myTimeLineData: MyTimeLineData
    ) { }


    /**
     * 页面初始化时执行
     */
    ngOnInit() {
        this.timeBox = Utils.generateConversationId(12);
        this.timeSelect = Utils.generateConversationId(12);
        this.timeLeft = Utils.generateConversationId(12);
        this.timeRight = Utils.generateConversationId(12);
        this.dataShow(this.timeData);
        this.myTimeLineData.timeList = this.timeLine;
        setTimeout(() => {
            if (this.lineData) {
                this.dataConfig(this.lineData);
            }
        }, 200);
        // 页面监听
        fromEvent(window, 'resize')
            .subscribe((event) => {
                // 这里处理页面变化时的操作
                this.adaptive();
            });
        this.leftShowService.leftIfShow.subscribe(() => {
            setTimeout(() => {
                this.adaptive();
                setTimeout(() => {
                    this.adaptive();
                }, 300);
            }, 400);
        });
    }

    /**
     * 页面初始化后执行
     */
    ngAfterViewInit(): void {
        if (this.OriginalTotalWidth === 0) {
            this.OriginalTotalWidth = $('#' + this.timeBox).outerWidth();  // 盒子原始宽度
            this.OriginalWidth = $('#' + this.timeBox).outerWidth();  // 初始化选择区域宽度
        }
        this.listenerMouseup();
    }
    /**
     * OnDestroy
     */
    OnDestroy(): void {
        this.removeMouseup();
    }
    /**
     * right
     */
    public right(e) {
        e.preventDefault();
        e.stopPropagation();
        const span = document.getElementById(this.timeRight);
        if (e.target === span) {
            this.show = true;
            const widthBox = document.getElementById(this.timeBox);
            const select = document.getElementById(this.timeSelect);

            widthBox.onmousemove = (box: any) => {
                if (this.show) {
                    let cliX = box.clientX - widthBox.getBoundingClientRect().left;
                    const boxWidth = widthBox.offsetWidth;
                    if (cliX >= boxWidth - 2) {
                        cliX = boxWidth - 2;
                    }
                    if (cliX <= 0) {
                        cliX = 0;
                    }
                    cliX = cliX - this.leftData;
                    this.rightData = cliX + this.leftData;
                    this.showWidth = cliX;
                    select.style.left = this.leftData + 'px';
                    select.style.width = cliX + 'px';
                    this.OriginalWidth = cliX;  // 记录所选宽度 用于比例计算
                }
            };
        }
    }

    /**
     * left
     */
    public left(e) {
        e.preventDefault();
        e.stopPropagation();
        this.lestShow = true;
        const box = $('#' + this.timeBox);
        const select = document.getElementById(this.timeSelect);
        const widthBox = document.getElementById(this.timeBox);

        box.on('mousemove', (timeBox: any) => {
            if (this.lestShow) {
                let cliX = timeBox.clientX - box.offset().left;
                const boxWidth = box.outerWidth();
                let leftCliX = (this.rightData !== -1 ? this.rightData : boxWidth - 2) - cliX;
                if (leftCliX <= 0) {
                    leftCliX = 0;
                }
                if (cliX <= 0) {
                    cliX = 0;
                }
                this.leftData = cliX;
                select.style.left = cliX + 'px';
                select.style.width = leftCliX + 'px';
                this.showWidth = leftCliX;
                this.OriginalWidth = leftCliX;
                this.OriginalLeft = cliX;
            }
        });
    }

    /**
     * move
     */
    public move(e: any) {
        const select = document.getElementById(this.timeSelect);
        e.preventDefault();
        e.stopPropagation();
        if (e.target === select) {
            this.boxShow = true;
            const box = $('#' + this.timeBox);
            const left = e.offsetX;
            $(document).on('mousemove', (event: any) => {
                if (this.boxShow) {
                    let cliX = event.clientX - box.offset().left - left;
                    const boxWidth = box.outerWidth();
                    const maxWidth = cliX + (this.showWidth !== -1 ? this.showWidth : boxWidth);
                    if (maxWidth >= (boxWidth + 2)) {
                        cliX = cliX - (maxWidth - boxWidth + 2);
                    }
                    if (cliX <= 0) {
                        cliX = 0;
                    }
                    this.leftData = cliX;
                    this.rightData = (this.showWidth !== -1 ? this.showWidth : boxWidth) + this.leftData;
                    select.style.left = cliX + 'px';
                    this.OriginalLeft = cliX;
                }
            });
        }
    }

    /**
     * 监听鼠标动作
     */
    public listenerMouseup() {
        document.addEventListener('mouseup', () => {
            const totalWidth = $('#' + this.timeBox).outerWidth();
            if (this.showWidth !== -1 && this.showWidth !== this.endData) {
                this.endData = JSON.parse(JSON.stringify(this.showWidth));
                const obj: any = {};
                if (this.leftData === 0) {
                    obj.start = 0;
                    obj.end = ((this.showWidth + 2) / totalWidth) * 100;
                } else {
                    obj.start = (this.leftData / totalWidth) * 100;
                    obj.end = ((this.showWidth + this.leftData + 2) / totalWidth) * 100;
                }
                this.timeLineData.emit(obj);

            }
            if (this.leftData !== this.start) {
                this.start = JSON.parse(JSON.stringify(this.leftData));
                const object: any = {};
                if (this.showWidth === -1) {
                    object.end = 100;
                } else {
                    object.end = ((this.showWidth + this.leftData + 2) / totalWidth) * 100;
                }
                object.start = (this.leftData / totalWidth) * 100;
                this.timeLineData.emit(object);
            }
            this.boxShow = false;
            this.lestShow = false;
            this.show = false;
        });
    }

    /**
     * 对数据进行选取展示
     */
    public dataShow(data) {
        const width = $('#' + this.timeBox).outerWidth();
        let num = Math.floor(width / 95);
        if (width === undefined) {
            num = 15;
        }
        const arr = [];
        if (data.constructor === Array) {
            if (data.length >= num) {
                for (let i = 1; i <= num; i++) {
                    const index: any = Math.floor((data.length / (num * 2)) * (i * 2 - 1));
                    if (index !== data.length - 1 && index !== 0) {
                        arr.push(data[index]);
                    }
                }
            } else {
                data.forEach((element, index) => {
                    if (index === 0 || index === data.length - 1) {
                    } else {
                        arr.push(element);
                    }
                });
            }
            this.timeLine = arr;
        } else {
            for (let i = 1; i <= num; i++) {
                let index: any = Math.floor((data.end / (num * 2)) * (i * 2 - 1));
                index = (index / 1000).toFixed(2) + 'ms';
                arr.push(index);
            }
        }
        this.timeLine = arr;

    }

    /**
     * 数据筛选 反过来改变时间轴的开始结束时间
     */
    public dataConfig(e) {
        const totalWidth = $('#' + this.timeBox).outerWidth() - 2;
        const select = document.getElementById(this.timeSelect);
        const left = (totalWidth * e.start) / 100;
        this.leftData = left;
        this.OriginalLeft = left;
        const width = ((totalWidth * e.end) - (totalWidth * e.start)) / 100;
        this.rightData = (totalWidth * e.end) / 100;
        this.showWidth = width;
        this.OriginalWidth = width;
        select.style.left = left + 'px';
        select.style.width = width + 'px';
    }

    /**
     * 自适应方法
     */
    public adaptive() {
        const width = $('#' + this.timeBox).outerWidth();
        if (!width) {
            return;
        }
        const proportion = width / this.OriginalTotalWidth;
        const leftData = this.OriginalLeft * proportion;
        const widthData = this.OriginalWidth * proportion - 2;
        this.leftData = leftData;
        this.showWidth = widthData;
        const select = document.getElementById(this.timeSelect);
        select.style.left = leftData + 'px';
        select.style.width = widthData + 'px';
        this.dataShow(this.timeData);
    }

    /**
     * 移除监听事件
     */
    public removeMouseup() {
        document.removeEventListener('mouseup', this.listenerMouseup);
    }
}
