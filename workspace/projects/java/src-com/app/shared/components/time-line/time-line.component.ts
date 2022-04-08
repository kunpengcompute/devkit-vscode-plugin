import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';
import { LeftShowService } from 'projects/java/src-com/app/service/left-show.service';
import { LibService } from 'projects/java/src-com/app/service/lib.service';

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrls: ['./time-line.component.scss']
})
export class TimeLineComponent implements OnInit, AfterViewInit {
  public timeDataVal: any = [];
  @Input()
  set timeData(val: any) {
    this.timeDataVal = val;
    if (this.timeBox.length > 0) {
      this.dataShow(val);
    }
  }
  get timeData() {
    return this.timeDataVal;
  }
  @Output() public timeLineData = new EventEmitter<any>();
  public show = false;
  public timeLine: any = [];
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

  constructor(public leftShowService: LeftShowService, public libServe: LibService) { }


  /**
   * 页面初始化时执行
   */
  ngOnInit() {
    this.timeBox = this.libServe.generateConversationId(12);
    this.timeSelect = this.libServe.generateConversationId(12);
    this.timeLeft = this.libServe.generateConversationId(12);
    this.timeRight = this.libServe.generateConversationId(12);
    this.dataShow(this.timeData);
    // 页面监听
    fromEvent(window, 'resize').subscribe(() => {
      // 这里处理页面变化时的操作
      this.adaptive();
    });
    this.leftShowService.leftIfShow.subscribe(() => {
      this.adaptive();
    });
  }

  /**
   * 页面初始化后执行
   */
  ngAfterViewInit(): void {
    // 盒子原始宽度
    this.OriginalTotalWidth = $('#' + this.timeBox).outerWidth();
    if (this.OriginalTotalWidth === 0) {
      this.OriginalTotalWidth = 1;
    }
    // 初始化选择区域宽度
    this.OriginalWidth = $('#' + this.timeBox).outerWidth();
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
  public right(e: any) {
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
          if (select) {
            select.style.left = this.leftData + 'px';
            select.style.width = cliX + 'px';
          }
          // 记录所选宽度 用于比例计算
          this.OriginalWidth = cliX;
        }
      };
    }
  }

  /**
   * left
   */
  public left(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.lestShow = true;
    const box = $('#' + this.timeBox);
    const select = document.getElementById(this.timeSelect);

    box.on('mousemove', (timeBox: any) => {
      if (this.lestShow) {
        let cliX = timeBox.clientX - box.offset().left;
        const boxWidth = box.outerWidth();
        let leftCliX = (this.rightData !== -1 ? this.rightData : boxWidth) - cliX;
        if (leftCliX >= (boxWidth - 2)) {
          leftCliX = boxWidth - 2;
        }
        if (leftCliX <= 0) {
          leftCliX = 0;
        }
        if (cliX <= 0) {
          cliX = 0;
        }
        this.leftData = cliX;
        if (select) {
          select.style.left = cliX + 'px';
          select.style.width = leftCliX + 'px';
        }
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
      box.on('mousemove', (event: any) => {
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
          if (select) {
            select.style.left = cliX + 'px';
          }
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
      let totalWidth = $('#' + this.timeBox).outerWidth();
      if (totalWidth === 0) {
        totalWidth = 1;
      }
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
          object.end = ((this.showWidth + this.leftData) / totalWidth) * 100;
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
  public dataShow(data: any) {
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
        data.forEach((element: any, index: number) => {
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
  public dataConfig(e: any) {
    const totalWidth = $('#' + this.timeBox).outerWidth() - 2;
    const select = document.getElementById(this.timeSelect);
    const left = (totalWidth * e.start) / 100;
    this.leftData = left;
    const width = ((totalWidth * e.end) - (totalWidth * e.start)) / 100;
    this.rightData = (totalWidth * e.end) / 100;
    this.showWidth = width;
    if (select) {
      select.style.left = left + 'px';
      select.style.width = width + 'px';
    }
  }

  /**
   * 自适应方法
   */
  public adaptive() {
    const width = $('#' + this.timeBox).outerWidth();
    const proportion = width / this.OriginalTotalWidth;
    const leftData = this.OriginalLeft * proportion;
    const widthData = this.OriginalWidth * proportion - 2;
    this.leftData = leftData;
    this.showWidth = widthData;
    const select = document.getElementsByClassName('select')[0] as HTMLElement;
    if (select) {
      select.style.left = leftData + 'px';
      select.style.width = widthData + 'px';
    }
  }

  /**
   * 移除监听事件
   */
  public removeMouseup() {
    document.removeEventListener('mouseup', this.listenerMouseup);
  }

  /**
   * 设置值
   */
  public setTimeData(val: any) {
    this.timeDataVal = val;
    if (this.timeBox.length > 0) {
      this.dataShow(val);
    }
  }

  /**
   * 初始化时间轴
   */
  public initTimeLine(){
    const box = $('#' + this.timeBox);
    const boxWidth = box.outerWidth();
    const select = document.getElementById(this.timeSelect);
    if (select) {
      select.style.left = 0 + 'px';
      select.style.width = boxWidth - 2 + 'px';
    }
  }
}
