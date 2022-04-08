import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrls: ['./time-line.component.scss'],
})
export class TimeLineComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() timeData: any;
  @Input() lineData: any;
  @Output() public timeLineData = new EventEmitter<any>();
  public show = false;
  public timeLine: any = [];
  public rightData = -1;
  public moveing = false;
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

  constructor(private leftShowService: LeftShowService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timeData !== undefined && !changes.timeData.firstChange) {
      this.dataShow(this.timeData);
    }
  }

  ngOnInit() {
    this.timeBox = this.generateConversationId(12);
    this.timeSelect = this.generateConversationId(12);
    this.timeLeft = this.generateConversationId(12);
    this.timeRight = this.generateConversationId(12);
    this.dataShow(this.timeData);

    // 页面监听
    fromEvent(window, 'resize').subscribe(() => {
      // 这里处理页面变化时的操作
      this.adaptive();
    });
    this.leftShowService?.leftIfShow.subscribe(() => {
      setTimeout(() => {
        this.adaptive();
        setTimeout(() => {
          this.adaptive();
          this.initTimeLine();
        }, 300);
      }, 400);
    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataConfig(this.lineData);
    }, 1000);
    if (this.OriginalTotalWidth === 0) {
      this.OriginalTotalWidth = $('#' + this.timeBox).outerWidth(); // 盒子原始宽度
      this.OriginalWidth = $('#' + this.timeBox).outerWidth(); // 初始化选择区域宽度
    }
    this.listenerMouseup();
  }
  OnDestroy(): void {
    this.removeMouseup();
  }
  public right(e: any) {
    e.preventDefault();
    e.stopPropagation();
    const span = document.getElementById(this.timeRight);
    if (e.target === span) {
      this.show = true;
      const widthBox = document.getElementById(this.timeBox);
      const select = document.getElementById(this.timeSelect);
      widthBox.onmousemove = (mouseEvent) => {
        if (this.show) {
          this.moveing = true;
          let cliX = mouseEvent.clientX - widthBox.getBoundingClientRect().left;
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
          this.OriginalWidth = cliX; // 记录所选宽度 用于比例计算
        }
      };
    }
  }

  public left(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.lestShow = true;
    const box = $('#' + this.timeBox);
    const select = document.getElementById(this.timeSelect);
    box.on('mousemove', (mouseEvent) => {
      if (this.lestShow) {
        this.moveing = true;
        let cliX = mouseEvent.clientX - box.offset().left;
        const boxWidth = box.outerWidth();
        let leftCliX =
          (this.rightData !== -1 ? this.rightData : boxWidth - 2) - cliX;
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

  public move(e: any) {
    const select = document.getElementById(this.timeSelect);
    e.preventDefault();
    e.stopPropagation();
    if (e.target === select) {
      this.boxShow = true;
      const box = $('#' + this.timeBox);
      const left = e.offsetX;
      $(document).on('mousemove', (mouseEvent) => {
        if (this.boxShow) {
          this.moveing = true;
          let cliX = mouseEvent.clientX - box.offset().left - left;
          const boxWidth = box.outerWidth();
          const maxWidth =
            cliX + (this.showWidth !== -1 ? this.showWidth : boxWidth);
          if (maxWidth >= boxWidth + 2) {
            cliX = cliX - (maxWidth - boxWidth + 2);
          }
          if (cliX <= 0) {
            cliX = 0;
          }
          this.leftData = cliX;
          this.rightData =
            (this.showWidth !== -1 ? this.showWidth : boxWidth) + this.leftData;
          select.style.left = cliX + 'px';
          this.OriginalLeft = cliX;
        }
      });
    }
  }

  public listenerMouseup() {
    document.addEventListener('mouseup', (e) => {
      if (this.moveing) {
        this.moveing = false;
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
          const obj: any = {};
          if (this.showWidth === -1) {
            obj.end = 100;
          } else {
            obj.end = ((this.showWidth + this.leftData + 2) / totalWidth) * 100;
          }
          obj.start = (this.leftData / totalWidth) * 100;
          this.timeLineData.emit(obj);
        }
      }

      this.boxShow = false;
      this.lestShow = false;
      this.show = false;
    });
  }
  // 对数据进行选取展示
  public dataShow(data: any) {
    const width = $('#' + this.timeBox).outerWidth();
    let num = Math.floor(width / 95);
    if (width === undefined) {
      num = 15;
    }
    const arr = [];
    if (!data) {
      return;
    }
    if (data?.constructor === Array) {
      if (data.length >= num) {
        for (let i = 1; i <= num; i++) {
          const index: any = Math.floor(
            (data.length / (num * 2)) * (i * 2 - 1)
          );
          if (index !== data.length - 1 && index !== 0) {
            arr.push(String(data[index]));
          }
        }
      } else {
        data.forEach((element: any, index: any) => {
          if (index === 0 || index === data.length - 1) {
          } else {
            arr.push(String(element));
          }
        });
      }
      this.timeLine = arr;
    } else {
      for (let i = 1; i <= num; i++) {
        let index: any = Math.floor((data.end / (num * 2)) * (i * 2 - 1));
        index = (index / 1000).toFixed(2) + 'ms';
        arr.push(String(index));
      }
    }
    this.timeLine = arr;
  }
  // 数据筛选 反过来改变时间轴的开始结束时间
  public dataConfig(e: any) {
    const totalWidth = $('#' + this.timeBox).outerWidth() - 2;
    const select = document.getElementById(this.timeSelect);
    const left = (totalWidth * e.start) / 100;
    this.leftData = left;
    this.OriginalLeft = left;
    const width = (totalWidth * e.end - totalWidth * e.start) / 100;
    this.rightData = (totalWidth * e.end) / 100;
    this.showWidth = width;
    this.OriginalWidth = width;
    select.style.left = left + 'px';
    select.style.width = width + 'px';
  }

  // 随机ID
  public generateConversationId(len: any) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    const uuid = [];
    let i;
    const radix = chars.length;

    if (len) {
      for (i = 0; i < len; i++) {
        uuid[i] = chars[Math.floor(Math.random() * radix)];
      }
    } else {
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      let r;
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = Math.floor(Math.random() * 16);
          uuid[i] = chars[i === 19 ? Math.floor(Math.random() * 4) + 8 : r];
        }
      }
    }
    return uuid.join('');
  }
  // 自适应方法
  public adaptive() {
    const width = $('#' + this.timeBox).outerWidth();
    if (width === undefined) {
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
  // 移除监听事件
  public removeMouseup() {
    document.removeEventListener('mouseup', this.listenerMouseup);
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
