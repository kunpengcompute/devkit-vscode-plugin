import { BYTESUNIT } from './vscode.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class LibService {

    private KIB = 1024;
    private MIB = this.KIB * 1024;
    private GIB = this.MIB * 1024;
    private TIB = this.GIB * 1024;
    constructor() {
    }
    /**
     * 快照时间
     */
    public getSnapTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const months = month < 10 ? `0${month}` : month;
        const dates = day < 10 ? `0${day}` : day;
        const hours = hour < 10 ? `0${hour}` : hour;
        const minutes = minute < 10 ? `0${minute}` : minute;
        const seconds = second < 10 ? `0${second}` : second;
        return `${year}/${months}/${dates} ${hours}:${minutes}:${seconds}`;
    }
    /**
     * 日期格式化函数
     * @param date 被格式化日期
     * @param fmt 格式化日期的格式
     */
    public dateFormat(date: string | number | Date, fmt: string) {
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
     * 字节单位转换
     * @param num 源数据
     * @param isInteger 是否取整
     * @param decimalNum 保留小数点后几位 默认2位
     * @param sourceUnit 源数据单位  默认 字节
     * @param resultUnit 结果数据单位  默认 最优显示单位
     */
    public onChangeUnit(num: number, isInteger?: boolean, decimalNum?: number,
                        sourceUnit?: BYTESUNIT, resultUnit?: BYTESUNIT) {
        if (num === undefined) {
            return '--';
        }

        // 给定保留小数位数默认值
        if (!isInteger && (!decimalNum || decimalNum <= 0)) {
            decimalNum = 2;
        }

        if (sourceUnit && sourceUnit !== BYTESUNIT.UNIT_BYTES) {
            num = this.bytesDataChange(num, sourceUnit);
        }

        let bytes: any;

        // 判断是否给定需要转换的单位,否则给定最右显示单位
        if (resultUnit) {
            switch (sourceUnit) {
                case BYTESUNIT.UNIT_BYTES:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num)) + 'B'
                        : this.setThousandSeparator(num.toFixed(decimalNum)) + 'B';
                    break;
                case BYTESUNIT.UNIT_KILOBYTES:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.KIB)) + 'KiB'
                        : this.setThousandSeparator((num / this.KIB).toFixed(decimalNum)) + 'KiB';
                    break;
                case BYTESUNIT.UNIT_MEGABYTES:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.MIB)) + 'MiB'
                        : this.setThousandSeparator((num / this.MIB).toFixed(decimalNum)) + 'MiB';
                    break;
                case BYTESUNIT.UNIT_GIGABYTES:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.GIB)) + 'GiB'
                        : this.setThousandSeparator((num / this.GIB).toFixed(decimalNum)) + 'GiB';
                    break;
                case BYTESUNIT.UNIT_TERABYTES:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.TIB)) + 'TiB'
                        : this.setThousandSeparator((num / this.TIB).toFixed(decimalNum)) + 'TiB';
                    break;
                default:
                    bytes = '--';
                    break;
            }
        } else {
            switch (true) {
                case num < this.KIB:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num)) + 'B'
                        : this.setThousandSeparator(num.toFixed(decimalNum)) + 'B';
                    break;
                case num < this.MIB:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.KIB)) + 'KiB'
                        : this.setThousandSeparator((num / this.KIB).toFixed(decimalNum)) + 'KiB';
                    break;
                case num < this.GIB:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.MIB)) + 'MiB'
                        : this.setThousandSeparator((num / this.MIB).toFixed(decimalNum)) + 'MiB';
                    break;
                case num < this.TIB:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.GIB)) + 'GiB'
                        : this.setThousandSeparator((num / this.GIB).toFixed(decimalNum)) + 'GiB';
                    break;
                default:
                    bytes = isInteger ? this.setThousandSeparator(this.ceilNumber(num / this.TIB)) + 'TiB'
                        : this.setThousandSeparator((num / this.TIB).toFixed(decimalNum)) + 'TiB';
                    break;
            }
        }

        return bytes;
    }

    /**
     * 向上取整十位
     * @param number 取整参数
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
        if (Array.isArray(value) && value.length === 1) {
            value = value[0];
        }
        if (typeof (value) === 'number' || typeof (value) === 'string') {
            return this.numFormat(value.toString());
        } else {
            return value;
        }
    }

    /**
     * 处理字符串，添加千位分隔符
     * @param numStr 源数据
     */
    public numFormat(numStr: string): string {
        const res = numStr.replace(/\d+/, (n) => {
            return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
                return $1 + ',';
            });
        });
        return res;
    }

    /**
     * 字节数据转换
     * @param num 源数据
     * @param sourceUnit 单位
     */
    public bytesDataChange(num: number, sourceUnit: BYTESUNIT): number {
        switch (sourceUnit) {
            case BYTESUNIT.UNIT_BYTES:
                break;
            case BYTESUNIT.UNIT_KILOBYTES:
                num = num * 1024;
                break;
            case BYTESUNIT.UNIT_MEGABYTES:
                num = num * 1024 * 1024;
                break;
            case BYTESUNIT.UNIT_GIGABYTES:
                num = num * 1024 * 1024 * 1024;
                break;
            case BYTESUNIT.UNIT_TERABYTES:
                num = num * 1024 * 1024 * 1024 * 1024;
                break;
            default:
                break;
        }
        return num;
    }
}

export class KeyFunction {
    private nodesIndex: any = null;
    private stackTreeNodes: string;
    private stackTreeAll: string;
    private stackTreeContainer: string;
    constructor(treeClass?: any) {
        this.stackTreeNodes = treeClass ? `${treeClass} .ti3-tree-content-box:visible` :
         '.ti3-tree-content-box:visible';
        this.stackTreeAll = treeClass ? `${treeClass} .ti3-tree-content-box` : '.ti3-tree-content-box';
        this.stackTreeContainer = treeClass ? `${treeClass} .ti3-tree-container` : '.ti3-tree-container';
    }
    /**
     * 监听键盘事件，上下左右
     */
    public keybordFun() {
        this.getCurrentNodeIndex();
        document.onkeydown = (key: any) => {
            switch (key.keyCode) {
                case 38:
                    this.keyUp();
                    break;
                case 40:
                    this.keyDown();
                    break;
                case 37:
                    this.keyLeft();
                    break;
                case 39:
                    this.keyRight();
                    break;
                default:
                    break;
            }
            return false;
        };
    }
    /**
     * 键盘上键事件
     */
    private keyUp() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || this.nodesIndex === 0 || !hasActiveClass) { return; }
        stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
        this.nodesIndex--;
        stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
        this.stackTreeScroll();
    }
    /**
     * 键盘下键事件
     */
    private keyDown() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || this.nodesIndex === stackTreeNodes.length - 1 || !hasActiveClass) { return; }
        stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
        this.nodesIndex++;
        stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
        this.stackTreeScroll();
    }
    /**
     * 键盘右键事件，获取子节点，focus到子级第一个节点
     */
    private keyRight() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const currentNodeChildren = stackTreeNodes.eq(this.nodesIndex).children();
        const childIClassName = currentNodeChildren.eq(1).attr('class');
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || !hasActiveClass) { return; }
        if (childIClassName.indexOf('ti3-icon-plus-square') > 0) {
            currentNodeChildren.eq(1).trigger('click');
        } else if (childIClassName.indexOf('ti3-icon-minus-square') > 0) {
            this.keyDown();
        } else {
            return;
        }
    }
    /**
     * 键盘左键事件，折叠子节点，focus到父级节点
     */
    private keyLeft() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const currentNodeChildren = stackTreeNodes.eq(this.nodesIndex).children();
        const childIClassName = currentNodeChildren.eq(1).attr('class');
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || !hasActiveClass) { return; }
        if (childIClassName.indexOf('ti3-icon-minus-square') > 0) {
            currentNodeChildren.eq(1).trigger('click');
        } else {
            const rootNode = stackTreeNodes.eq(this.nodesIndex).parent().parent();
            const rootName = rootNode.attr('class');
            if (rootName.indexOf('ti3-tree-container') > 0) { return; }
            this.getParentNodeIndex(rootNode.siblings()[0]);
        }
    }
    /**
     * focus到父级节点
     * @param node 父级节点
     */
    private getParentNodeIndex(node: any) {
        let parentIndex = null;
        const stackTreeNodes = $(this.stackTreeNodes);
        stackTreeNodes.each((index, el) => {
            if (el.isEqualNode(node)) {
                parentIndex = index;
                return;
            }
        });
        if (parentIndex === null) { return; }
        stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
        this.nodesIndex = parentIndex;
        stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
    }
    /**
     * 获取鼠标点击了某个节点
     */
    private getCurrentNodeIndex() {
        const that = this;
        const oldIndex = this.nodesIndex;
        const stackTreeNodes = $(this.stackTreeNodes);
        const stackTreeAll = $(this.stackTreeAll);
        stackTreeNodes.each((index, el) => {
            if (el.className.indexOf('ti3-tree-item-active') >= 0 && index !== oldIndex) {
                that.nodesIndex = index;
                return;
            }
        });
        if (oldIndex !== null && this.nodesIndex !== null && oldIndex !== this.nodesIndex) {
            stackTreeAll.eq(oldIndex).removeClass('ti3-tree-item-active');
            stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
        }
    }
    /**
     * 判断当前节点是否含有选中的节点
     * @param stackTreeNodes 当前节点
     */
    private hasActiveClass(stackTreeNodes: any): boolean {
        return this.nodesIndex !== null ? stackTreeNodes.eq(this.nodesIndex).hasClass('ti3-tree-item-active') : false;
    }
    /**
     * 将键盘选中的节点滚动到可视区域内
     */
    private stackTreeScroll() {
        const nodeHeight = $('.ti3-tree-item-active').height();
        const treeOffsetTop = $(this.stackTreeContainer).children(':first').offset().top;
        const activeOffsetTop = $(this.stackTreeNodes).eq(this.nodesIndex).offset().top;
        const height = activeOffsetTop - treeOffsetTop;
        const visibleHeight = $(this.stackTreeContainer).height();
        const scrollTop = $(this.stackTreeContainer).scrollTop();
        if ((height - scrollTop) > (visibleHeight - nodeHeight)) {
            $(this.stackTreeContainer).animate({
                scrollTop: height - visibleHeight + nodeHeight
            }, 50);
        } else if (scrollTop > height) {
            $(this.stackTreeContainer).animate({
                scrollTop: height
            }, 50);
        }
    }

    /**
     * 移除键盘监听事件
     */
    public movekeybordFun() {
        document.onkeydown = undefined;
    }

}

export class SetScreen {
    /**
     * 设置全屏
     * @param element dom
     */
    static onSetFullScreen(element: any) {
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
        }
    }
    /**
     * 退出全屏
     * @param element dom
     */
    static onExitFullScreen(element: any) {
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
