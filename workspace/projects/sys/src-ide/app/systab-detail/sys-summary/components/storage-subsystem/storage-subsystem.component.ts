import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, Input } from '@angular/core';
import { AxiosService } from '../../../../service/axios.service';
import { StorageSubsystemSvgElementInfo } from '../../classes/storage-subsystem-svg-element-info';
import { TooltipManager, PieceInfo } from './storage-subsystem.component.helper';
import { I18nService } from '../../../../service/i18n.service';
import {isLightTheme, VscodeService} from '../../../../service/vscode.service';
@Component({
    selector: 'app-storage-subsystem',
    templateUrl: './storage-subsystem.component.html',
    styleUrls: ['./storage-subsystem.component.scss']
})

export class StorageSubsystemComponent implements OnInit, AfterViewInit {
    static STORAGE_PIECE_NUM = 27;
    public i18n: any;

    @ViewChild('storageWarpper', { static: true }) el: ElementRef;

    public storageDataCopy: any;
    @Input()
    set storageData(val) {
        this.storageDataCopy = val;
        this.renderSvgAction();
    }
    get storageData() {
        return this.storageDataCopy;
    }

    // 指明点击下转的cpu
    public currentCpuCopy: string;
    @Input()
    set currentCpu(val) {
        this.currentCpuCopy = val;
        this.renderSvgAction();
    }
    get currentCpu() {
        return this.currentCpuCopy;
    }

    // 是否渲染
    @Input() isAllSvgChartShow: boolean;

    /**
     * 头部信息
     */
    public headInfo = {
        diskNum: 0,
        totalSize: 0
    };
    public isLight = false;
    public currentTheme: any;
    private itemColor = [
        {
            title: '#e8e8e8',
            subTitle: '#aaaaaa',
            content: '#e8e8e8',
            border: '#353535'
        },
        {
            title: '#2a2f35',
            subTitle: '#50596f',
            content: '#282b33',
            border: '#e1e6ee'
        }
    ];
    // 记录被 mouseenter 事件污染（“触摸”）的元素对象
    public currentSvgElement: StorageSubsystemSvgElementInfo;

    // 存储所有SVG元素的数组，便于批量操作
    public storageSubsystemArray: Array<StorageSubsystemSvgElementInfo> = [];

    // 存储所有SVG元素 和 其对应的内存条的信息的映射（map），便于提示引用
    public storagePieceInfoMap: Map<StorageSubsystemSvgElementInfo, PieceInfo>;

    // 所有有效的SVG元素的对象
    public storageRow1Col1 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 1 列
    public storageRow1Col2 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 2 列
    public storageRow1Col3 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 3 列
    public storageRow1Col4 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 4 列
    public storageRow1Col5 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 5 列
    public storageRow1Col6 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 6 列
    public storageRow1Col7 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 7 列
    public storageRow1Col8 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 8 列
    public storageRow1Col9 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 9 列

    public storageRow2Col1 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 1 列
    public storageRow2Col2 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 2 列
    public storageRow2Col3 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 3 列
    public storageRow2Col4 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 4 列
    public storageRow2Col5 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 5 列
    public storageRow2Col6 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 6 列
    public storageRow2Col7 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 7 列
    public storageRow2Col8 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 8 列
    public storageRow2Col9 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 9 列

    public storageRow3Col1 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 1 列
    public storageRow3Col2 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 2 列
    public storageRow3Col3 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 3 列
    public storageRow3Col4 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 4 列
    public storageRow3Col5 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 5 列
    public storageRow3Col6 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 6 列
    public storageRow3Col7 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 7 列
    public storageRow3Col8 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 8 列
    public storageRow3Col9 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 9 列

    // tooltip
    private tooltipManager: TooltipManager;
    public niceTooltipInfo: {
        html: string,
        top: { pointX: number, pointY: number },
        bottom: { pointX: number, pointY: number }
    };
    public niceTooltipShowCopy = false;
    set niceTooltipShow(val) {
        this.niceTooltipShowCopy = val;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }
    get niceTooltipShow() {
        return this.niceTooltipShowCopy;
    }

    // 渲染动作
    public renderSvgAction = () => { };

    constructor(
        private axios: AxiosService,
        private cdr: ChangeDetectorRef,
        public i18nService: I18nService,
        private vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
        // 设置有效SVG元素的选择器
        for (let i = 1; i < 4; i++) {
            for (let j = 1; j < 10; j++) {
                this.storageSubsystemArray.push(this['storageRow' + i + 'Col' + j]);
            }
        }
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        if (isLightTheme) {
            this.currentTheme = this.itemColor[1];
        } else {
            this.currentTheme = this.itemColor[0];
        }
        this.isLight = isLightTheme;

        // linearGradient-3
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currentTheme = this.itemColor[msg.colorTheme - 1];
        });
    }
    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
        // 初始化选择器
        for (const item of this.storageSubsystemArray) {
            item.initSelectionById(this.el);
        }

        // 渲染
        this.renderSvgAction = () => {
            if (!this.isAllSvgChartShow) {
                return;
            }
            if (this.storageDataCopy != null && Object.keys(this.storageDataCopy).length > 0) {
                this.renderSVG(this.storageDataCopy);
            }
        };
        this.renderSvgAction();
        if (this.isLight) {
            this.svgInit();
        }


        // 初始化tooltip管理器
        this.tooltipManager = new TooltipManager(this);

        // 设置有效SVG元素的 mouseenter 和 mouseleave 事件
        this.storageSubsystemArray.forEach((item: StorageSubsystemSvgElementInfo) => {
            item.selection
                .on('mouseenter', () => {
                    this.currentSvgElement = item;
                    if (this.storageDataCopy != null && Object.keys(this.storageDataCopy).length > 0) {
                        this.tooltipManager.show(item);
                    }
                    item.outSelection.attr('display', 'unset');
                })
                .on('mouseleave', () => {
                    this.tooltipManager.hidden();
                    item.outSelection.attr('display', 'none');
                });
        });
    }
    private svgInit() {
        $('#linearGradient-3 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-3 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-3 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-3 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-3 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-5 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-5 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-5 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-5 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-5 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-7 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-7 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-7 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-7 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-7 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-19 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-19 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-19 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-19 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-19 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-21 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-21 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-21 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-21 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-21 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-23 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-23 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-23 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-23 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-23 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-25 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-25 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-25 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-25 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-25 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-36 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-36 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-36 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-36 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-36 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-38 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-38 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-38 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-38 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-38 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-40 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-40 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-40 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-40 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-40 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-42 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-42 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-42 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-42 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-42 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-53 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-53 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-53 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-53 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-53 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');

        $('#linearGradient-9 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-9 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-9 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-9 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-11 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-11 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-11 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-11 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-13 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-13 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-13 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-13 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-17 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-17 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-17 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-17 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-28 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-28 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-28 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-28 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-30 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-30 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-30 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-30 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-34 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-34 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-34 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-34 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-44 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-44 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-44 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-44 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-46 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-46 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-46 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-46 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-48 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-48 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-48 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-48 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');

        $('#linearGradient-15 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-15 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-15 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');

        $('#linearGradient-32 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-32 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-32 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');

        $('#linearGradient-50 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-50 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-50 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');

        $('#BigBorder').attr('stroke', '#E7E9F0');
    }

    /**
     * 渲染svg
     * @param rawData 数据
     */
    renderSVG(rawData: any) {
        const pieceInfoMap = this.convertMemoryData(rawData);
        this.storagePieceInfoMap = pieceInfoMap;
        [...pieceInfoMap.keys()].forEach((item: StorageSubsystemSvgElementInfo) => {
            const pieceInfo = pieceInfoMap.get(item);
            switch (pieceInfo.state) {
                case '1':
                    item.textSelection.find('tspan').text(pieceInfo.name);
                    item.selection.attr('display', 'unset');
                    item.textSelection.attr('display', 'unset');
                    break;
                case '0':
                    item.selection.attr('display', 'none');
                    item.textSelection.attr('display', 'none');
                    break;
                default:
            }
        });
    }

    /**
     * 处理接口数据并返回
     * @param rawData 接口数据
     */
    public convertMemoryData(rawData: any): Map<StorageSubsystemSvgElementInfo, PieceInfo> {
        const targetCpnRawData = rawData[this.currentCpuCopy]; // 选择目标cpu
        const diskConfiglist = targetCpnRawData.storage;

        const storagePieceInfoMap = new Map<StorageSubsystemSvgElementInfo, PieceInfo>();
        let actLen = diskConfiglist.length;
        for (let i = 0; i < StorageSubsystemComponent.STORAGE_PIECE_NUM; i++, actLen--) {
            let pieceInfo: PieceInfo;
            if (actLen > 0) {
                const diskConfig = diskConfiglist[i];
                pieceInfo = new PieceInfo('1', diskConfig.name, diskConfig.type, diskConfig.cap, diskConfig.model,
                    diskConfig.util, diskConfig.avg, diskConfig.await, diskConfig.svctm);
            } else {
                pieceInfo = new PieceInfo('0');
            }
            storagePieceInfoMap.set(this.storageSubsystemArray[i], pieceInfo);
            if (this.isLight) {
                $('#' + this.storageSubsystemArray[i].id + '>path:nth-child(2)').attr('fill', '#F2F6FF');
                $('#' + this.storageSubsystemArray[i].id + '>path:nth-child(3)').attr('fill', '#DCE3ED');
                $('#' + this.storageSubsystemArray[i].id + '>path:nth-child(4)').attr('fill', '#99A6BA');
                $('#' + this.storageSubsystemArray[i].id + '>path:nth-child(5)').attr('fill', '#99A6BA');
                $('#' + this.storageSubsystemArray[i].outId).attr('stroke', '#576170');
                $('#' + this.storageSubsystemArray[i].textId).attr('fill', '#282B33');
            }
        }

        this.headInfo = targetCpnRawData.introduction;
        this.cdr.detectChanges();

        return storagePieceInfoMap;
    }
}
