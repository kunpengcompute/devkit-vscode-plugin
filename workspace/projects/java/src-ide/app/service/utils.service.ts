import { Injectable } from '@angular/core';
import { VscodeService } from './vscode.service';

@Injectable({
    providedIn: 'root'
})
export class Utils {

    constructor(private vscodeService: VscodeService) { }

    private KIB = 1024;
    private MIB = this.KIB * 1024;
    private GIB = this.MIB * 1024;
    private TIB = this.GIB * 1024;

    public second = 1000;

    /**
     * 将对象转化为 get 请求参数的格式
     * key=value&key1=value1&key2=value2
     */
    public static converUrl(data: any) {
        const result = [];
        for (const key of Object.keys(data)) {
            const value = data[key];
            if (value.constructor === Array) {
                value.forEach((val: any) => {
                    result.push(key + '=' + val);
                });
            } else {
                result.push(key + '=' + value);
            }
        }
        return result.join('&');
    }

    /**
     * uuid生成
     * @param len uuid长度
     */
    public static generateConversationId(len: number) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        const uuid = [];
        let i;
        const radix = chars.length;

        if (len) {
            for (i = 0; i < len; i++) {
                uuid[i] = chars[Math.round(window.crypto.getRandomValues(new Uint8Array(1))[0] * 0.001 * radix)];
            }
        } else {
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            let r;
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0] * 0.001 * 16);
                    uuid[i] = chars[i === 19 ?
                       Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0] * 0.001 * 4) + 8 : r];
                }
            }
        }
        return uuid.join('');
    }
    /**
     * 日期格式化函数
     * @param date 被格式化日期
     * @param fmt 格式化日期的格式
     */
    public dateFormat(date: any, fmt: any) {
        const getDate = new Date(date);
        const o = {
            'M+': getDate.getMonth() + 1,
            'd+': getDate.getDate(),
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: getDate.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substring(4 - RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1)
                    ? ((o as any)[k])
                    : (('00' + (o as any)[k]).substring(('' + (o as any)[k]).length)));
            }
        }
        return fmt;
    }

    /**
     * 将时间转化为时分秒毫秒的单位
     * @param isLessSec 传入的时间参数是否小于秒单位
     * @param timeValue 传入的时间参数
     */
    public timeAutoChange(timeValue: any, isLessSec?: boolean): any {
        let timeStr = '';
        let tempms = '';
        let tempSec = 0;
        if (isLessSec) { // 小于秒的单位
            tempms = (timeValue % 1000).toFixed(2) + ' ms ';
            tempSec = Math.floor(timeValue / 1000);
            timeValue = tempSec;
        }
        const hour = Math.floor(timeValue / 3600);
        const min = Math.floor(timeValue / 60) % 60;
        const sec = Number((timeValue % 60).toFixed(2));
        if (hour >= 1) {
            timeStr = hour + ' hour ';
        }
        if (min >= 1) {
            timeStr += min + ' min ';
        }
        if (sec >= 1) {
            timeStr += sec + ' sec ';
        } else {
            timeStr = !isLessSec ? sec + ' sec ' : '';
        }
        const tempTime = isLessSec ? timeStr + tempms : timeStr;
        return tempTime;
    }

    /**
     * 处理单位数据
     * num 数据大小
     * int 是否取整
     */
    public onChangeUnit(num: number, int?: boolean) {
        let bytes: any;
        switch (true) {
            case num < this.KIB:
                bytes = int ? this.setThousandSeparator(this.ceilNumber(num)) + 'B'
                    : this.setThousandSeparator(num.toFixed(2)) + 'B';
                break;
            case num < this.MIB:
                bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.KIB)) + 'KiB'
                    : this.setThousandSeparator((num / this.KIB).toFixed(2)) + 'KiB';
                break;
            case num < this.GIB:
                bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.MIB)) + 'MiB'
                    : this.setThousandSeparator((num / this.MIB).toFixed(2)) + 'MiB';
                break;
            case num < this.TIB:
                bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.GIB)) + 'GiB'
                    : this.setThousandSeparator((num / this.GIB).toFixed(2)) + 'GiB';
                break;
            default:
                bytes = int ? this.setThousandSeparator(this.ceilNumber(num / this.TIB)) + 'TiB'
                    : this.setThousandSeparator((num / this.TIB).toFixed(2)) + 'TiB';
                break;
        }
        return bytes;
    }

    /**
     * 时间单位换算
     * @param time time
     */
    public onChangeTime(timeLocal: any) {
        if (timeLocal < this.second) {
            return timeLocal.toFixed(2);
        } else {
            return (timeLocal / 1000).toFixed(2);
        }
    }

    /**
     * 处理时间轴数据
     * timeLength 时间戳数据
     */
    public getXAxisTime(timeLength: string | number | Date) {
        if (timeLength < 10000) {
            const timeData = [];
            let start = new Date(new Date().toLocaleDateString()).getTime();
            for (let i = 0; i < timeLength; i++) {
                start += 1000;
                const data = new Date(start);
                const h = data.getHours();
                const m = data.getMinutes();
                const s = data.getSeconds() < 10 ? '0' + data.getSeconds() : data.getSeconds();
                timeData.push(`${m}:${s}`);
            }
            return timeData;
        } else {
            const data = new Date(timeLength);
            const h = data.getHours();
            const m = data.getMinutes();
            const s = data.getSeconds() < 10 ? '0' + data.getSeconds() : data.getSeconds();
            return `${m}:${s}`;
        }
    }

    /**
     * 处理时间轴数据
     * timeLength 时间戳数据
     */
    public getXAxis(timeLength: string | number | Date) {
        if (timeLength < 10000) {
            const timeData = [];
            let start = new Date(new Date().toLocaleDateString()).getTime();
            for (let i = 0; i < timeLength; i++) {
                start += 1000;
                const data = new Date(start);
                const h = data.getHours();
                const m = data.getMinutes();
                const s = data.getSeconds() < 10 ? '0' + data.getSeconds() : data.getSeconds();
                timeData.push(``);
            }
            return timeData;
        } else {
            const data = new Date(timeLength);
            const h = data.getHours();
            const m = data.getMinutes();
            const s = data.getSeconds() < 10 ? '0' + data.getSeconds() : data.getSeconds();
            return ``;
        }
    }

    /**
     * ceilNumber
     */
    public ceilNumber(num: number) {
        num = Math.floor(num);
        const bite = Math.pow(10, String(num).length - 1 || 1);
        return Math.ceil(num / bite) * bite;
    }

    /**
     * 添加千位分隔符
     * @param value （有符号）整形、（有符号）浮点型的数字字符（可以带单位），如：'123324', '123324.12312', '-123324','123324ms', ...
     */
    public setThousandSeparator(value: string | number): string {
        function numFormat(numStr: string): string {
            const res = numStr.replace(/\d+/, (n) => { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
                    return $1 + ',';
                });
            });
            return res;
        }
        if (Array.isArray(value) && value.length === 1) {
            value = value[0];
        }
        if (typeof (value) === 'number' || typeof (value) === 'string') {
            return numFormat(value.toString());
        } else {
            return value;
        }
    }
    /**
     * 发送消息给vscode, 右下角弹出提醒框
     */
    public showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }
}
