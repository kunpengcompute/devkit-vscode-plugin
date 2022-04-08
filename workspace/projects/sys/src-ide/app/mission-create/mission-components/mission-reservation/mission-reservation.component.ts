import { Component, OnInit, OnChanges, Input, SimpleChange, ChangeDetectorRef, NgZone } from '@angular/core';
import { TiDatetimeFormat } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { VscodeService } from '../../../service/vscode.service';

/**
 * 时间枚举
 */
const enum TIME_NODE {
    FIRST_TTIME = 59,
    LAST_TTIME = 23
}
@Component({
    selector: 'app-mission-reservation',
    templateUrl: './mission-reservation.component.html',
    styleUrls: ['./mission-reservation.component.scss']
})
export class MissionReservationComponent implements OnInit, OnChanges {
    constructor(
        public i18nService: I18nService,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }
    /** 是否禁用switch */
    @Input() switch: boolean;
    @Input() switchTip: string;
    @Input() labelWidth: string;
    @Input() isModifySchedule: boolean;
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
    // 预约采集 是否预约定时
    public switchState = false;

    // 预约采集 当前服务时间
    public selectedTime = '';

    // 预约采集 采集方式 1  周期， 2 单次
    public selected = 1;
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
        date: 'yyyy-MM-dd',
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
    public changeTimeD;
    public changeTimeO;

    public isShowErrorTime: any;
    // 导入模板调用函数
    public isEdit = false;

    /**
     * 初始化
     */
    ngOnInit() {
        this.clearServerInterval();
    }
    /**
     * 监测传入值
     * @param changes 传入
     */
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (const propName of Object.keys(changes)) {
            switch (propName) {
                case 'switch':
                    if (changes.switch.currentValue) {
                        this.switchState = false;
                    }
                    break;
                default: break;
            }
        }
    }
    /**
     * 销毁
     */
    OnDestroy() {
        this.clear();
    }
    /**
     * 当switch组件开启时执行设置最大最小日期
     * @param e event事件
     */
    public onSwitchChange(e) {
        if (e) {
            this.getCurrentServerTime();
            this.selected = 1;
        } else {
            this.clear();
        }
        this.updateWebViewPage();
    }
    /**
     * 关闭循环
     */
    public clearServerInterval() {
        clearInterval(this.time);
        this.time = null;
        clearInterval(this.changeTimeD);
        this.changeTimeD = null;
        clearInterval(this.changeTimeO);
        this.changeTimeO = null;
    }
    /**
     * 获取当前服务器时间
     */
    public getCurrentServerTime() {
        this.vscodeService.get({ url: '/schedule-tasks/current-time/' }, (data: any) => {
            this.nowTime.nowFullTime = data.data.currentTime;
            this.firstInit(); // 设置当前日期时间
            this.setOnceTime(); // 设置单次采集最小最大日期
            this.setDuraTime(); // 设置周期采集最小日期，不设置最大日期
            this.firstInitDateAndTime(); // 设置采集时间，采集日期，采集日期和时间和数据
            this.onChangeOnce(this.onceDate); // 校验单次采集时间日期
            this.onChangeRange(this.duration); // 校验周期采集日期
            this.onChangeTime(this.pointTime); // 校验周期采集时间
        });
        this.updateWebViewPage();
    }
    /**
     * 首次数据格式化
     */
    public firstInit() {
        const timeArr = this.nowTime.nowFullTime.split(' ')[1].split(':');
        const dateArr = this.nowTime.nowFullTime.split(' ')[0].split('-');
        this.pointTime = timeArr.join(':'); // 设置周期采集，采集时间
        this.nowTime.nowYear = +dateArr[0];
        this.nowTime.nowMonth = +dateArr[1];
        this.nowTime.nowDay = +dateArr[2];
        this.nowTime.nowHour = +timeArr[0];
        this.nowTime.nowMinutes = +timeArr[1];
        this.nowTime.nowSecond = +timeArr[2];
        this.time = setInterval(() => {
            if (this.nowTime.nowSecond === TIME_NODE.FIRST_TTIME) {
                this.nowTime.nowSecond = 0;
                if (this.nowTime.nowMinutes === TIME_NODE.FIRST_TTIME) {
                    this.nowTime.nowMinutes = 0;
                    if (this.nowTime.nowHour === TIME_NODE.LAST_TTIME) {
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
            this.nowTime.nowFullTime = this.nowTime.nowYear + '-'
                + this.nowTime.nowMonth + '-' + this.nowTime.nowDay + ' '
                + this.nowTime.nowHour + ':' + this.nowTime.nowMinutes + ':' + this.nowTime.nowSecond;
        }, 1000);
        this.changeTimeD = setInterval(() => {
            this.onChangeTime(this.pointTime);
        }, 1000);
        this.updateWebViewPage();
    }
    /**
     *  首次数据格式化，日期 时间
     */
    public firstInitDateAndTime() {
        this.onceDate = new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1,
            this.nowTime.nowDay + 1, this.nowTime.nowHour, this.nowTime.nowMinutes, this.nowTime.nowSecond);
        this.duration = {
            begin: new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay + 1,
                this.nowTime.nowHour, this.nowTime.nowMinutes, this.nowTime.nowSecond),
            end: new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay + 8,
                this.nowTime.nowHour, this.nowTime.nowMinutes, this.nowTime.nowSecond)
        };
        this.onceTime = this.nowTime.nowYear + '-' + this.nowTime.nowMonth + '-' + (this.nowTime.nowDay + 1)
            + ' ' + this.nowTime.nowHour + ':' + this.nowTime.nowMinutes + ':' + this.nowTime.nowSecond;
        this.durationTime =
          this.nowTime.nowYear +
          '-' +
          this.nowTime.nowMonth +
          '-' +
          (this.nowTime.nowDay + 1) +
          ' ' +
          this.nowTime.nowYear +
          '-' +
          this.nowTime.nowMonth +
          '-' +
          (this.nowTime.nowDay + 8);
        this.pointTime = this.nowTime.nowHour + ':' + this.nowTime.nowMinutes + ':' + this.nowTime.nowSecond;
        this.updateWebViewPage();
    }
    /**
     * 切换采样方式 周期采集 单次采集
     * @param val number
     */
    public changeColect(val: number) {
        this.selected = val;
        clearInterval(this.changeTimeO);
        clearInterval(this.changeTimeD);
        this.firstInitDateAndTime();
        if (val === 1) {
            this.changeTimeD = setInterval(() => {
                this.onChangeTime(this.pointTime);
            }, 1000);
        } else {
            this.changeTimeO = setInterval(() => {
                this.onChangeOnce(this.onceDate);
            }, 1000);
        }
        this.getPreviewData();
        this.isErrorTime = false;
        this.isError = false;
        this.isErrorDate = false;
        this.updateWebViewPage();
    }
    /**
     * 设置单次采集最小最大日期
     */
    public setOnceTime() {
        this.minOnce = new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1,
            this.nowTime.nowDay, this.nowTime.nowHour, this.nowTime.nowMinutes, this.nowTime.nowSecond);
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
        this.updateWebViewPage();
    }
    /**
     * 设置周期采集最小日期，不设置最大日期
     */
    public setDuraTime() {
        this.minDura = new Date(this.nowTime.nowYear, this.nowTime.nowMonth - 1, this.nowTime.nowDay);
        this.updateWebViewPage();
    }
    /**
     * 周期 时间选择校验
     * @param e event事件
     */
    public onChangeTime(e: string): void {
        if (e === '') {
            this.isErrorTime = true;
            this.errorMsgTime = this.i18n.preSwitch.errorMsgTime;
        } else {
            const beginDate = new Date(+this.durationTime.split(' ')[0].split('-')[0],
                +this.durationTime.split(' ')[0].split('-')[1] - 1, +this.durationTime.split(' ')[0].split('-')[2]);
            const year = beginDate.getFullYear();
            const month = beginDate.getMonth();
            const day = beginDate.getDate();

            const dY = this.nowTime.nowYear - year;
            const dM = this.nowTime.nowMonth - 1 - month;
            const dD = this.nowTime.nowDay - day;
            if (this.isShowErrorTime === null) {
                this.isErrorTime = false;
                this.errorMsgTime = '';
            } else if (0 === dY && 0 === dM && 0 === dD) {
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
                    } else if (+timeArr[1] === this.nowTime.nowMinutes) {
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
        this.updateWebViewPage();
    }
    /**
     * 周期 日期范围校验
     * @param e event事件
     */
    public onChangeRange(e: any) {
        this.isShowErrorTime = e;
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
            this.isErrorTime = false;
            this.errorMsg = this.i18n.preSwitch.errorMsg;
        }
        this.getPreviewData();
        this.updateWebViewPage();
    }
    /**
     * 周期 日期是否合法校验
     * @param num 选择的时间
     * @param now 现在时间
     * @param e event事件
     */
    public isValidRange(num, now, e) {
        const date = new Date(now);
        const dateEnd = new Date(e);
        const dY = dateEnd.getFullYear() - date.getFullYear();
        let dM = dateEnd.getMonth() - date.getMonth();
        let dD = dateEnd.getDate() - date.getDate();
        if (dY === 0) {// 不跨年
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
        } else if (dY === 1) { // 跨年
            const beginMonth = dateEnd.getMonth() + 11;
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
        this.updateWebViewPage();
    }
    /**
     * 单次 日期时间校验并格式化函数
     * @param e event事件
     */
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
    }
    /**
     * 获取某月的天数，润二月天数
     * @param val number
     */
    public getDays(val) {
        let days = 0;
        if (
          (this.nowTime.nowYear % 4 === 0 &&
            this.nowTime.nowYear % 100 !== 0) ||
          this.nowTime.nowYear % 400 === 0
        ) {
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
    /**
     * 格式化日期时间
     * @param e event事件
     */
    public formatTime(e: any) {
        const date = new Date(e);
        const str = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
            date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        return str;
    }
    /**
     * 格式化时间，将小于两位数的时间填0
     * @param time string
     */
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
    /**
     * 是否全部校验成功，用于创建，修改预约任务确定按钮是否亮起
     */
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

    /**
     * 导入预约任务数据
     */
    async importTemp(e: any) {
        this.switchState = false;
        if (e.hasOwnProperty('cycle')) {
            this.switchState = true;
            this.clearServerInterval();
            await new Promise<void>((resolve) => {
                const option = {
                    url: '/schedule-tasks/current-time/',
                };
                this.vscodeService.get(option, (res: any) => {
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

                      end: new Date(
                        e.cycleStop.split('-')[0],
                        e.cycleStop.split('-')[1] - 1,
                        e.cycleStop.split('-')[2],
                        0,
                        0,
                        0
                      ),
                    };
                    this.onChangeTime(this.pointTime);
                    this.onChangeRange(this.duration);
                    this.setDuraTime();
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
                    this.changeTimeO = setInterval(() => {
                        this.onChangeOnce(this.onceDate);
                    }, 1000);
                }
            }
        }
    }

    /**
     * 关闭预约组件,清理数据
     */
    public clear() {
        this.switchState = false;
        this.selected = 1;
        this.clearServerInterval();
        this.isEdit = false;
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
