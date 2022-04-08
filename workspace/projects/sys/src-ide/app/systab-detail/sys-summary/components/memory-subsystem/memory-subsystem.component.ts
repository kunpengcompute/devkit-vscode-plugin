import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import {VscodeService, COLOR_THEME, isLightTheme} from '../../../../service/vscode.service';

/**
 * 常量
 */
const constant = {
    SLOT_NUM: 32,
    SOCKET_0: 0,
    SOCKET_1: 1,
    MEM_UNINSTALL: 'No Module Installed',
    // tooltip箭头长度
    TOOLTIP_ARROW_LENGTH: 10,
    // tooltip位置偏移
    TOOLTIP_POS_OFFSET: 28
};

@Component({
    selector: 'app-memory-subsystem',
    templateUrl: './memory-subsystem.component.html',
    styleUrls: ['./memory-subsystem.component.scss']
})
export class MemorySubsystemComponent implements OnInit {

    @Input() memoryData: any;

    public i18n: any;
    public pieceInfo: any = {};
    public tooltipStyle = {
        opacity: '0',
        top: '0',
        left: '0'
    };

    private highlineBorder: HTMLElement;

    constructor(
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        private el: ElementRef<HTMLElement>) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        if (isLightTheme) {
            this.svgColorUpdate(COLOR_THEME.Light);
        } else {
            this.svgColorUpdate(COLOR_THEME.Dark);
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.svgColorUpdate(msg.colorTheme);
        });

        const [socket0, socket1] = this.processMemoryData();

        this.highlineBorder = this.el.nativeElement.querySelector('#highline-border');
        const cpu1 = this.el.nativeElement.querySelector('#cpu1');
        const cpu1Translate = cpu1.getAttribute('transform');
        const cpu1ItemList = this.el.nativeElement.getElementsByClassName('cpu1-item');
        for (let i = 0; i < cpu1ItemList.length; i++) {
            const cpu1Item = cpu1ItemList.item(i);
            const cpu1ItemTranslate = cpu1Item.getAttribute('transform');
            const highlineTranslate = computeHighlineTranslate(
                cpu1Translate,
                cpu1ItemTranslate
            );

            const memLeft: HTMLElement = cpu1Item.querySelector('.cpu1-mem-left');
            // 乘2对应上左边插槽
            if (socket0[i * 2]) {
                this.bindHoverEvent(memLeft, highlineTranslate, 'left', socket0[i * 2]);
            } else {
                memLeft.style.display = 'none';
            }
            const memRight: HTMLElement = cpu1Item.querySelector('.cpu1-mem-right');
            // 乘2加1对应上右边插槽
            if (socket0[i * 2 + 1]) {
                this.bindHoverEvent(memRight, highlineTranslate, 'left', socket0[i * 2 + 1]);
            } else {
                memRight.style.display = 'none';
            }
        }

        const cpu2 = this.el.nativeElement.querySelector('#cpu2');
        const cpu2Translate = cpu2.getAttribute('transform');
        const cpu2ItemList = this.el.nativeElement.getElementsByClassName('cpu2-item');
        for (let i = 0; i < cpu2ItemList.length; i++) {
            const cpu2Item = cpu2ItemList.item(i);
            const cpu2ItemTranslate = cpu2Item.getAttribute('transform');
            const highlineTranslate = computeHighlineTranslate(
                cpu2Translate,
                cpu2ItemTranslate
            );

            const memLeft: HTMLElement = cpu2Item.querySelector('.cpu2-mem-left');
            // 乘2对应上左边插槽
            if (socket1[i * 2]) {
                this.bindHoverEvent(memLeft, highlineTranslate, 'right', socket1[i * 2]);
            } else {
                memLeft.style.display = 'none';
            }
            const memRight: HTMLElement = cpu2Item.querySelector('.cpu2-mem-right');
            // 乘2加1对应上右边插槽
            if (socket1[i * 2 + 1]) {
                this.bindHoverEvent(memRight, highlineTranslate, 'right', socket1[i * 2 + 1]);
            } else {
                memRight.style.display = 'none';
            }
        }
    }

    private processMemoryData(): Array<any> {
        const socket0 = [];
        const socket1 = [];
        for (let i = 0; i < constant.SLOT_NUM; i++) {
            const position = this.memoryData.dimm.pos[i];
            // 匹配位置数字
            const posNum = /SOCKET (\d) CHANNEL \d DIMM \d/.exec(position)[1];
            const cap = this.memoryData.dimm.cap[i];
            const pieceInfo = {
                pos: this.memoryData.dimm.pos[i],
                cap: Utils.setThousandSeparator(this.memoryData.dimm.cap[i]),
                max_speed: Utils.setThousandSeparator(this.memoryData.dimm.max_speed[i]),
                cfg_speed: Utils.setThousandSeparator(this.memoryData.dimm.cfg_speed[i]),
                mem_type: this.memoryData.dimm.mem_type[i],
            };
            if (Number(posNum) === constant.SOCKET_0) {
                if (cap === constant.MEM_UNINSTALL) {
                    socket0.push(null);
                } else {
                    socket0.push(pieceInfo);
                }
            } else if (Number(posNum) === constant.SOCKET_1) {
                if (cap === constant.MEM_UNINSTALL) {
                    socket1.push(null);
                } else {
                    socket1.push(pieceInfo);
                }
            }
        }
        return [socket0, socket1];
    }

    private bindHoverEvent(mem: HTMLElement, highlineTranslate: string, direction: 'left' | 'right', info: any): void {
        if (!mem) { return; }
        const polygonList = getChildren(mem, 'polygon');
        let highlinePoints: string;
        if (direction === 'left') {
            highlinePoints = computeHighlinePointsLeft(polygonList);
        } else {
            highlinePoints = computeHighlinePointsRight(polygonList);
        }
        mem.addEventListener('mouseover', () => {
            this.showTip(mem, info, direction);
            this.highlineBorder.style.display = 'block';
            this.highlineBorder.setAttribute('transform', highlineTranslate);
            this.highlineBorder.setAttribute('points', highlinePoints);
        });
        mem.addEventListener('mouseleave', () => {
            this.hideTip();
            this.highlineBorder.style.display = 'none';
        });
    }

    private showTip(target: HTMLElement, info: any, direction: 'left' | 'right'): void {
        this.pieceInfo = info;
        this.tooltipStyle.opacity = '1';
        const rect = target.getBoundingClientRect();
        let delta = 0;
        if (direction === 'right') {
          delta = rect.width - constant.TOOLTIP_POS_OFFSET;
        }
        this.tooltipStyle.left = rect.left + delta + 'px';
        this.tooltipStyle.top = rect.top + rect.height + constant.TOOLTIP_ARROW_LENGTH + 'px';
    }

    private hideTip(): void {
        this.tooltipStyle.opacity = '0';
    }

    private svgColorUpdate(colorTheme: COLOR_THEME) {
        colorTheme--;
        $('.border-box').attr('stroke', ['#434549', '#E7E9F0'][colorTheme]);
        $('.cpu-item > .cpu-base > path').attr('fill', ['#505259', '#D4DAE8'][colorTheme]);
        $('.cpu-item > .cpu-base > polygon').attr('fill', ['#3C3E44', '#C7CDDC'][colorTheme]);
        $('.cpu-item > .cpu-base > g path').attr('fill', ['#3C3E44', '#C7CDDC'][colorTheme]);
        $('.cpu-item > polygon').attr('fill', ['#38393C', '#C3CAD8'][colorTheme]);
        $('.cpu-item .cpu-mem > polygon:nth-of-type(1)').attr('fill', ['#8C8F98', '#F2F6FF'][colorTheme]);
        $(
          '.cpu-item > .cpu1-mem-group > .cpu-mem > polygon:nth-of-type(2)'
        ).attr('fill', ['#424348', '#C6CCDB'][colorTheme]);
        $(
          '.cpu-item > .cpu1-mem-group > .cpu-mem > polygon:nth-of-type(3)'
        ).attr('fill', ['#343639', '#BDC3D0'][colorTheme]);
        $(
          '.cpu-item > .cpu2-mem-group > .cpu-mem > polygon:nth-of-type(2)'
        ).attr('fill', ['#343639', '#BDC3D0'][colorTheme]);
        $(
          '.cpu-item > .cpu2-mem-group > .cpu-mem > polygon:nth-of-type(3)'
        ).attr('fill', ['#424348', '#C6CCDB'][colorTheme]);
        $('#highline-border').attr('stroke', ['#E8E8E8', '#222222'][colorTheme]);
        $('.cpu-label').attr('fill', ['#AAAAAA', '#616161'][colorTheme]);
        $('.numa-node').attr('fill', ['#AAAAAA', '#616161'][colorTheme]);
    }
}

/**
 * 计算高亮边框偏移量
 *
 * @param cpuTranslate 最外层大框偏移量
 * @param memTranslate 上级小框偏移量
 */
function computeHighlineTranslate(
    cpuTranslate: string,
    memTranslate: string
): string {
    const regexp = /translate\(([\d\.]+),\s([\d\.]+)\)/;
    const cpuTransMatched = regexp.exec(cpuTranslate);
    const [cpuTranslateX, cpuTranslateY] = [
        cpuTransMatched[1],
        cpuTransMatched[2],
    ].map((item) => Number(item));
    const memTransMatched = regexp.exec(memTranslate);
    const [memTranslateX, memTranslateY] = [
        memTransMatched[1],
        memTransMatched[2],
    ].map((item) => Number(item));
    const highlineTransX = cpuTranslateX + memTranslateX;
    const highlineTransY = cpuTranslateY + memTranslateY;
    return `translate(${highlineTransX}, ${highlineTransY})`;
}

/**
 * (左侧图片规则)
 * 根据内存方块的polygon节点的points计算
 * 得到高亮边框的points
 *
 * @param polygonList 内存方块的polygon节点
 */
function computeHighlinePointsLeft(polygonList: Array<Element>): string {
    const pointsList = polygonList.map((item) =>
        item.attributes.getNamedItem('points').value.split(' ')
    );
    // 根据已有方块的坐标点，获取高亮边框的坐标点
    const point1 = [pointsList[0][0], pointsList[0][1]];
    const point2 = [pointsList[1][2], pointsList[1][3]];
    const point3 = [pointsList[1][4], pointsList[1][5]];
    const point4 = [pointsList[2][0], pointsList[2][1]];
    const point5 = [pointsList[2][6], pointsList[2][7]];
    const point6 = [pointsList[0][6], pointsList[0][7]];
    return [...point1, ...point2, ...point3, ...point4, ...point5, ...point6].join(' ');
}

/**
 * (右侧图片规则)
 * 根据内存方块的polygon节点的points计算
 * 得到高亮边框的points
 *
 * @param polygonList 内存方块的polygon节点
 */
function computeHighlinePointsRight(polygonList: Array<Element>): string {
    const pointsList = polygonList.map((item) =>
        item.attributes.getNamedItem('points').value.split(' ')
    );
    // 根据已有方块的坐标点，获取高亮边框的坐标点
    const point1 = [pointsList[0][0], pointsList[0][1]];
    const point2 = [pointsList[0][2], pointsList[0][3]];
    const point3 = [pointsList[1][2], pointsList[1][3]];
    const point4 = [pointsList[1][0], pointsList[1][1]];
    const point5 = [pointsList[2][4], pointsList[2][5]];
    const point6 = [pointsList[2][6], pointsList[2][7]];
    return [...point1, ...point2, ...point3, ...point4, ...point5, ...point6].join(' ');
}

/**
 * 获取节点相应选择器的子节点
 *
 * @param dom svg节点
 * @param selector 标签选择器
 */
function getChildren(dom: Element, selector: string): Array<Element> {
    const children = [];
    for (let i = 0; i < dom.children.length; i++) {
        const child = dom.children.item(i);
        if (child.tagName === selector) {
            children.push(child);
        }
    }
    return children;
}
