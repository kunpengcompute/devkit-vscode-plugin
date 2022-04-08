import { Injectable } from '@angular/core';
import lottie from 'lottie-web';

@Injectable({
    providedIn: 'root'
})
export class Utils {
    constructor() { }

    /**
     * 加载过程，不允许修改页面数据
     */
    public static startLoading() {
        const loadingCover = $('#loadingcover');
        if (loadingCover && loadingCover.length > 0) {
            loadingCover.show();
        } else {
            const a = `<div class="loading-box" id="loadingcover">
                <div class="spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
            </div>`;
            $('body').append(a);
        }
    }

    /**
     * 加载结束，放开限制，允许修改页面数据
     */
    public static endLoading() {
        $('#loadingcover').hide();
    }

    /**
     * 将对象转化为 get 请求参数的格式
     * key=value&key1=value1&key2=value2
     */
    public static converUrl(data) {
        const result = [];
        for (const key of Object.keys(data)) {
            const value = data[key];
            if (value.constructor === Array) {
                value.forEach((val) => {
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
                    uuid[i] = chars[i === 19
                        ? Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0] * 0.001 * 4) + 8 : r];
                }
            }
        }
        return uuid.join('');
    }

    /**
     * 添加千位分隔符
     * @param value （有符号）整形、（有符号）浮点型的数字字符（可以带单位），如：'123324', '123324.12312', '-123324','123324ms', ...
     */
    public static setThousandSeparator(value: string | number): string {
        function numFormat(numStr: string): string {
            const res = numStr.replace(/\d+/, n => { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, $1 => {
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
     * 格式化采样范围
     * @param samplingRange 采样范围
     */
    public static formattingSamplingRange(i18n: any, samplingRange: string) {
        if (['all', 'ALL'].includes(samplingRange)) {
            return i18n.micarch.typeItem_all;
        } else if (['user', 'USER', 'all-user', '用户态'].includes(samplingRange)) {
            return i18n.micarch.typeItem_user;
        } else if (['kernel', 'SYS', 'all-kernel'].includes(samplingRange)) {
            return i18n.micarch.typeItem_kernel;
        } else {
            return samplingRange || '--';
        }
    }

    /**
     * lottie 生成svg动图
     * @param ele 寄主元素id选择
     * @param path json文件路径
     */
    public static createSvg(ele: string, path: string): void {
        const sysSelection = document.querySelector(ele);
        lottie.loadAnimation({
            container: sysSelection,
            renderer: 'svg',
            loop: true,
            path,
        });
    }

    /**
     * 填充字符串的占位符
     * 例如：'{0}事件所占总事件比例为{1}%'.format(a, b) => a事件所占总事件比例为b%
     * @param targetString 要替换的字符串
     * @param actualContent 实际内容
     */
    public static fillPlaceholder(targetString: string, ...actualContent: string[]) {
        for (let i = 0; i < actualContent.length; i++) {
            targetString = targetString.replace(new RegExp(`\\{${i}\\}`, 'g'), actualContent[i]);
        }
        return targetString;
    }

    /**
     *  资源调度转换-1、:-1使用[unknown]来显示
     * @param label string
     * @returns string
     */
    public static transformLabel(label: string) {
        if ([-1, '-1', ':-1'].includes(label)) { return '[unknown]'; }
        if (['-1/:-1', '-1/-1', ':-1/:-1', ':-1/-1'].includes(label)) { return '[unknown]/[unknown]'; }
        return label;
    }
}
