import {
  Component, OnInit, Input, forwardRef, OnDestroy
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl
} from '@angular/forms';
import { TiDatetimeFormat } from '@cloud/tiny3';
import { OrderConfig } from '../../../domain';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';

/**
 * 在原组件 app-mission-reservation 的基础上，将其改造为表单控件
 */
@Component({
  selector: 'app-mission-reservation-plus',
  templateUrl: './mission-reservation-plus.component.html',
  styleUrls: ['./mission-reservation-plus.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MissionReservationPlusComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MissionReservationPlusComponent),
      multi: true
    }
  ],
})
export class MissionReservationPlusComponent implements OnInit, OnDestroy, ControlValueAccessor {
  constructor(
    public i18nService: I18nService,
    private http: HttpService,
    private themeServe: HyThemeService
  ) {
    this.theme$ = this.themeServe.getObservable();
    this.i18n = this.i18nService.I18n();
  }
  @Input() labelWidth: string;
  @Input() isModifySchedule: boolean;
  @Input() switchState: boolean;
  public i18n: any;
  public nowFullTime: any = '';
  public nowTime = {
    nowFullTime: '',
    nowYear: 0,
    nowMonth: 0,
    nowDay: 0,
    nowHour: 0,
    nowMinutes: 0,
    nowSecond: 0
  };
  // 预约采集 当前服务时间
  public selectedTime = '';

  // 预约采集 采集方式 1  周期， 2 单次
  public selected: 1 | 2 = 1;
  // 预约采集 单次采集
  public onceDate = new Date();

  // 预约采集 周期采集
  // 指定时间
  public pointTime = '00:00:00';
  // 指定周期
  public duration = {
    begin: new Date(),
    end: new Date()
  };
  // 预约采集 单次采集
  public minOnce: Date;
  public maxOnce: Date;
  public format: TiDatetimeFormat = {
    date: 'yyyy/MM/dd',
    time: 'HH:mm:ss'
  };
  public isErrorDate = false;
  public errorMsgDate = '';
  // 预约采集 周期采集
  // 指定时间
  public minPoint: string;
  public maxPoint: string;
  public isErrorTime = false;
  public errorMsgTime = '';
  // 指定周期
  public minDura: Date;
  public maxDura: Date;
  public isError = false;
  public errorMsg = '';

  public formatD: TiDatetimeFormat = {
    date: 'yyyy/MM/dd',
    time: 'HH:mm:ss'
  };
  // 字符串形式 onceTime durationTime 用于接口联调 内容是日期
  public onceTime = '';
  public durationTime = '';
  // 是否全部校验成功
  public previewState = true;
  // 重启时禁用
  public isDisable = false;
  public time: any;
  // 选择单次采集还是周期采集
  // 切换时，将循环校验时间
  public changeTimeD: any;
  public changeTimeO: any;
  // 导入模板调用函数
  public isEdit = false;
  theme$: Observable<HyTheme>;

  /**
   * 这里是做一个空函数体，真正使用的方法在 registerOnChange 中
   * 由框架注册，然后我们使用它把变化发回表单
   */
  private propagateChange = (_: any) => { };

  /**
   * 这里是做一个空函数体，真正使用的方法在 registerOnTouched 中
   * 由框架注册，然后我们使用它把变化发回表单
   */
  private propagateTunched = (_: any) => { };

  ngOnInit() {
    this.clearServerInterval();

    // 初始化
    this.getCurrentServerTime();
    this.selected = 1;
  }

  ngOnDestroy() {
    this.clear();
  }

  /**
   * 控件 --> DOM
   * @param obj 写入的控件值
   */
  public writeValue(obj: OrderConfig) {
    if ((obj != null) && (typeof obj === 'object')) {
      this.importTemp(obj);
    }
  }

  /**
   * DOM --> 控件
   * 当表单控件值改变时，函数 fn 会被调用
   * 这也是我们把变化 emit 回表单的机制
   * @param fn 通知回调
   */
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * 验证表单，验证结果正确返回 null 否则返回一个验证结果对象
   * @param ctl 控件
   */
  public validate(ctl: FormControl) {
    return this.previewState ? null : { orderConfig: { valid: false } };
  }

  /**
   * 这里没有使用，用于注册 touched 状态
   * @param fn 通知回调
   */
  public registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  public clearServerInterval() {
    clearInterval(this.time);
    clearInterval(this.changeTimeD);
    clearInterval(this.changeTimeO);
  }
  // 获取当前服务器时间
  public getCurrentServerTime() {
    this.http.get('/schedule-tasks/current-time/').then((res: any) => {
      this.nowTime.nowFullTime = res.data.currentTime;
      this.firstInit();
      this.setOnceTime();
      this.setDuraTime();
      this.firstInitDateAndTime();
    });
  }
  // 首次数据格式化
  public firstInit() {
    const timeArr = this.nowTime.nowFullTime.split(' ')[1].split(':');
    const dateArr = this.nowTime.nowFullTime.split(' ')[0].split('-');
    this.pointTime = timeArr.join(':');
    this.nowTime.nowYear = +dateArr[0];
    this.nowTime.nowMonth = +dateArr[1];
    this.nowTime.nowDay = +dateArr[2];
    this.nowTime.nowHour = +timeArr[0];
    this.nowTime.nowMinutes = +timeArr[1];
    this.nowTime.nowSecond = +timeArr[2];
    clearInterval(this.time);
    this.time = setInterval(() => {
      if (this.nowTime.nowSecond === 59) {
        this.nowTime.nowSecond = 0;
        if (this.nowTime.nowMinutes === 59) {
          this.nowTime.nowMinutes = 0;
          if (this.nowTime.nowHour === 23) {
            this.nowTime.nowHour = 0;
          } else {
            this.nowTime.nowHour++;
          }
        } else {
          this.nowTime.nowMinutes++;
        }
      } else {
        this.nowTime.nowSecond++;
      }
      // 在内部保存当前服务器时间
      this.nowTime.nowFullTime = this.nowTime.nowYear + '-' + this.nowTime.nowMonth + '-' + this.nowTime.nowDay + ' '
        + this.nowTime.nowHour + ':' + this.nowTime.nowMinutes + ':' + this.nowTime.nowSecond;
    }, 1000);
    clearInterval(this.changeTimeD);
    this.changeTimeD = setInterval(() => {
      this.onChangeTime(this.pointTime);
    }, 1000);
  }
  // 首次数据格式化，日期 时间
  public firstInitDateAndTime() {
    this.onceDate = new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay + 1,
      this.nowTime.nowHour, this.nowTime.nowMinutes, this.nowTime.nowSecond);
    this.duration = {
      begin: new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay + 1,
        this.nowTime.nowHour, this.nowTime.nowMinutes, this.nowTime.nowSecond),
      end: new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay + 8,
        this.nowTime.nowHour, this.nowTime.nowMinutes, this.nowTime.nowSecond)
    };
    this.onceTime = this.nowTime.nowYear + '-' + this.nowTime.nowMonth + '-' + (this.nowTime.nowDay + 1) + ' '
      + this.nowTime.nowHour + ':' + this.nowTime.nowMinutes + ':' + this.nowTime.nowSecond;
    this.durationTime = this.nowTime.nowYear + '-' + this.nowTime.nowMonth + '-' + (this.nowTime.nowDay + 1) + ' '
      + this.nowTime.nowYear + '-' + this.nowTime.nowMonth + '-' + (this.nowTime.nowDay + 8);
    this.pointTime = this.nowTime.nowHour + ':' + this.nowTime.nowMinutes + ':' + this.nowTime.nowSecond;
    this.onChangeOnce(this.onceDate);
    this.onChangeRange(this.duration);
    this.onChangeTime(this.pointTime);
  }
  public changeColect() {
    this.firstInitDateAndTime();
    if (this.selected === 1) {
      clearInterval(this.changeTimeD);
      this.changeTimeD = setInterval(() => {
        this.onChangeTime(this.pointTime);
      }, 1000);
    } else {
      clearInterval(this.changeTimeO);
      this.changeTimeO = setInterval(() => {
        this.onChangeOnce(this.onceDate);
      }, 1000);
    }
    this.getPreviewData();
  }
  // 设置单次采集最小最大日期
  public setOnceTime() {
    this.minOnce = new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay, this.nowTime.nowHour,
      this.nowTime.nowMinutes, this.nowTime.nowSecond);
    const days = this.getDays(this.nowTime.nowMonth - 1);
    let preDay = this.nowTime.nowDay + 7;
    let preMonth = this.nowTime.nowMonth - 1;
    let preYear = this.nowTime.nowYear;
    if (preDay > days) {
      preMonth += 1;
      if (preMonth > 12) {
        preMonth = preMonth % 12;
        preYear++;
      }
      preDay = preDay % days;
    }
    this.maxOnce = new Date(
      preYear,
      preMonth,
      preDay,
      this.nowTime.nowHour,
      this.nowTime.nowMinutes,
      this.nowTime.nowSecond
    );
  }
  // 设置周期采集最小日期，不设置最大日期
  public setDuraTime() {
    this.minDura = new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay);
  }
  // 周期 时间选择校验
  public onChangeTime(e: any): void {
    if (e === '') {
      this.isErrorTime = true;
      this.errorMsgTime = this.i18n.preSwitch.errorMsgTime;
    } else {
      const beginDate = new Date(
        +this.durationTime.split(' ')[0].split('-')[0],
        +this.durationTime.split(' ')[0].split('-')[1] - 1,
        +this.durationTime.split(' ')[0].split('-')[2]
      );
      const year = beginDate.getFullYear();
      const month = beginDate.getMonth();
      const day = beginDate.getDate();

      const dY = this.nowTime.nowYear - year;
      const dM = this.nowTime.nowMonth - 1 - month;
      const dD = this.nowTime.nowDay - day;
      if (0 === dY && 0 === dM && 0 === dD) {
        const timeArr = this.pointTime.split(':');
        if (+timeArr[0] < this.nowTime.nowHour) {
          this.isErrorTime = true;
          this.errorMsgTime = this.i18n.preSwitch.errorMsgTime1;
        } else if (+timeArr[0] > this.nowTime.nowHour) {
          this.isErrorTime = false;
          this.errorMsgTime = '';
        } else {
          if (+timeArr[1] < this.nowTime.nowMinutes) {
            this.isErrorTime = true;
            this.errorMsgTime = this.i18n.preSwitch.errorMsgTime1;
          } else if (+timeArr[1] > this.nowTime.nowMinutes) {
            this.isErrorTime = false;
            this.errorMsgTime = '';
          } else {
            if (+timeArr[2] < this.nowTime.nowSecond) {
              this.isErrorTime = true;
              this.errorMsgTime = this.i18n.preSwitch.errorMsgTime1;
            } else if (+timeArr[2] > this.nowTime.nowSecond) {
              this.isErrorTime = false;
              this.errorMsgTime = '';
            } else {
              this.isErrorTime = false;
              this.errorMsgTime = '';
            }
          }
        }
      } else {
        this.isErrorTime = false;
        this.errorMsgTime = '';
      }
    }
    this.getPreviewData();
    this.propagateOrderConfig();
  }
  // 周期 日期范围校验
  public onChangeRange(e: any) {
    this.isError = false;
    this.errorMsg = '';
    if (e !== null) {
      const beginTime = this.formatTime(e.begin);
      const endTime = this.formatTime(e.end);
      this.durationTime = beginTime.split(' ')[0] + ' ' + endTime.split(' ')[0];
      const nowDate = new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay);
      const flagBegin = this.isValidRange(7, nowDate, e.begin);
      if (!flagBegin) {
        this.isError = true;
        this.errorMsg = this.i18n.preSwitch.errorMsg1;
        this.getPreviewData();
        return;
      } else {
        this.isError = false;
        this.errorMsg = '';
      }
      const flagEnd = this.isValidRange(30, e.begin, e.end);
      if (!flagEnd) {
        this.isError = true;
        this.errorMsg = this.i18n.preSwitch.errorMsg1;
        this.getPreviewData();
        return;
      } else {
        this.isError = false;
        this.errorMsg = '';
      }
    } else {
      this.isError = true;
      this.errorMsg = this.i18n.preSwitch.errorMsg;
    }
    this.getPreviewData();
    this.propagateOrderConfig();
  }
  // 周期 日期是否合法校验
  public isValidRange(num: any, now: any, e: any) {
    const date = new Date(now);
    const dateEnd = new Date(e);
    const dY = dateEnd.getFullYear() - date.getFullYear();
    let dM = dateEnd.getMonth() - date.getMonth();
    let dD = dateEnd.getDate() - date.getDate();
    if (dY === 0) {
      if (dM === 0) {
        if (dD > num || dD < 0) {
          return false;
        } else if (dD === 0 && this.pointTime !== '') {
          this.onChangeTime(this.pointTime);
          return true;
        } else {
          this.onChangeTime(this.pointTime);
          return true;
        }
      } else if (dM === 1) {
        const beginDay = this.getDays(date.getMonth() + 1) + dateEnd.getDate();
        dD = beginDay - date.getDate();
        return dD > num ? false : true;
      } else {
        return false;
      }
    } else if (dY === 1) {
      const beginMonth = dateEnd.getMonth() + 12;
      dM = beginMonth - date.getMonth();
      if (dM === 1) {
        const beginDay = this.getDays(date.getMonth() + 1) + dateEnd.getDate();
        dD = beginDay - date.getDate();
        return dD > num ? false : true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // 单次 日期时间校验并格式化函数
  public onChangeOnce(e: any) {
    this.isErrorDate = false;
    this.errorMsgDate = '';
    if (e !== null) {
      this.onceTime = this.formatTime(e);
      const dateAndTime = this.onceTime.split(' ');

      const dateArr = dateAndTime[0].split('-');
      const timeArr = dateAndTime[1].split(':');
      const year = +dateArr[0];
      const month = +dateArr[1];
      const day = +dateArr[2];

      const dY = this.nowTime.nowYear - year;
      const dM = this.nowTime.nowMonth - month;
      const dD = this.nowTime.nowDay - day;
      if (0 === dY && 0 === dM && 0 === dD) {
        if (+timeArr[0] < this.nowTime.nowHour) {
          this.isErrorDate = true;
          this.errorMsgDate = this.i18n.preSwitch.errorMsgTime1;
        } else if (+timeArr[0] === this.nowTime.nowHour) {
          if (+timeArr[1] < this.nowTime.nowMinutes) {
            this.isErrorDate = true;
            this.errorMsgDate = this.i18n.preSwitch.errorMsgTime1;
          } else if (+timeArr[1] === this.nowTime.nowMinutes) {
            if (+timeArr[2] < this.nowTime.nowSecond) {
              this.isErrorDate = true;
              this.errorMsgDate = this.i18n.preSwitch.errorMsgTime1;
            } else if (+timeArr[2] === this.nowTime.nowSecond) {
              this.isErrorDate = false;
              this.errorMsgDate = '';
            } else {
              this.isErrorDate = false;
              this.errorMsgDate = '';
            }
          } else {
            this.isErrorDate = false;
            this.errorMsgDate = '';
          }
        } else {
          this.isErrorDate = false;
          this.errorMsgDate = '';
        }
      } else {
        this.isErrorDate = false;
        this.errorMsgDate = '';
      }
      this.onceTime = dateAndTime[0] + ' ' + this.formatSelectTime(dateAndTime[1]);
    } else {
      this.isErrorDate = true;
      this.errorMsgDate = this.i18n.preSwitch.errorMsgDate;
    }
    this.getPreviewData();
    this.propagateOrderConfig();
  }
  // 获取某月的天数，润二月天数
  public getDays(val: any) {
    let days = 0;
    if ((this.nowTime.nowYear % 4 === 0 && this.nowTime.nowYear % 100 !== 0) || (this.nowTime.nowYear % 400 === 0)) {
      days = 29;
    } else {
      days = 28;
    }
    switch (val) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        return 31;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
        break;
      default:
        return days;
    }
  }
  // 格式化日期时间
  public formatTime(e: any) {
    const date = new Date(e);
    const str = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
      date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    return str;
  }
  // 格式化时间，将小于两位数的时间填0
  public formatSelectTime(time: string) {
    const arr = time.split(':');
    if (+arr[0] < 10) {
      arr[0] = '0' + arr[0];
    }
    if (+arr[1] < 10) {
      arr[1] = '0' + arr[1];
    }
    if (+arr[2] < 10) {
      arr[2] = '0' + arr[2];
    }
    return arr.join(':');
  }
  // 是否全部校验成功，用于创建，修改预约任务确定按钮是否亮起
  public getPreviewData(): void {
    if (this.selected === 1) {
      if (this.isError || this.isErrorTime) {
        this.previewState = false;
      } else {
        this.previewState = true;
      }
    } else {
      if (this.isErrorDate) {
        this.previewState = false;
      } else {
        this.previewState = true;
      }
    }
  }
  async importTemp(e: any) {
    if (Object.prototype.hasOwnProperty.call(e, 'cycle')) {
      this.clearServerInterval();
      await new Promise<void>((resolve, reject) => {
        this.http.get('/schedule-tasks/current-time/').then((res: any) => {
          this.nowTime.nowFullTime = res.data.currentTime;
          this.firstInit();
          resolve();
        });
      });
      if (this.nowTime.nowFullTime) {
        if (e.cycle) {
          this.selected = 1;
          this.durationTime = e.cycleStart + ' ' + e.cycleStop;
          this.pointTime = e.targetTime;
          this.duration = {
            begin: new Date(
              e.cycleStart.split('-')[0],
              e.cycleStart.split('-')[1] - 1,
              e.cycleStart.split('-')[2],
              0,
              0,
              0
            ),
            end: new Date(e.cycleStop.split('-')[0], e.cycleStop.split('-')[1] - 1, e.cycleStop.split('-')[2], 0, 0, 0)
          };
          this.onChangeTime(this.pointTime);
          this.onChangeRange(this.duration);
          this.setDuraTime();
          clearInterval(this.changeTimeD);
          this.changeTimeD = setInterval(() => {
            this.onChangeTime(this.pointTime);
          }, 1000);
        } else {
          this.selected = 2;
          const date = e.appointment.split('-');
          const time = e.targetTime.split(':');
          this.onceDate = new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
          this.onceTime = e.appointment + ' ' + e.targetTime;
          this.onChangeOnce(this.onceDate);
          this.setOnceTime();
          clearInterval(this.changeTimeO);
          this.changeTimeO = setInterval(() => {
            this.onChangeOnce(this.onceDate);
          }, 1000);
        }
      }
    } else {
      this.clear();
    }
  }
  // 关闭预约组件,清理数据
  public clear() {
    this.selected = 1;
    this.clearServerInterval();
    // 用于修改时将开关按钮设置为disable
    this.isEdit = false;
    // 用于重启时将开关按钮设置为disable
    this.isDisable = false;
    this.nowTime = {
      nowFullTime: '',
      nowYear: 0,
      nowMonth: 0,
      nowDay: 0,
      nowHour: 0,
      nowMinutes: 0,
      nowSecond: 0
    };
  }

  get labelWidthAddedStaricon() {
    return parseInt(this.labelWidth, 10) + 16 + 'px';
  }

  private propagateOrderConfig() {
    const orderConfig: OrderConfig = {
      cycle: false,
    };
    switch (this.selected) {
      case 1:
        const durationArr = this.durationTime.split(' ');
        orderConfig.cycle = true;
        orderConfig.targetTime = this.pointTime;
        orderConfig.cycleStart = durationArr[0];
        orderConfig.cycleStop = durationArr[1];
        orderConfig.appointment = '';
        break;
      case 2:
        // 单次
        const onceArr = this.onceTime.split(' ');
        orderConfig.cycle = false;
        orderConfig.targetTime = onceArr[1];
        orderConfig.appointment = onceArr[0];
        break;
      default:
    }
    this.propagateChange(orderConfig);
  }
}

