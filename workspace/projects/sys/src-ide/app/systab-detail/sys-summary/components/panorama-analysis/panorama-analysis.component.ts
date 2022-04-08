import {
    Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild,
    ElementRef, ViewEncapsulation, Input, EventEmitter, Output
} from '@angular/core';
import { AxiosService } from '../../../../service/axios.service';
import { I18nService } from '../../../../service/i18n.service';
import { PanoramaAnalysisSvgElementInfo } from '../../classes/panorama-analysis-svg-element-info';
import { MemorySubsystemSvgElementInfo } from '../../classes/memory-subsystem-svg-element-info';
import {
    TooltipManager, CpuPieceInfo,
    MemoryInfo, StoragePieceInfo, NetPieceInfo, MemPieceInfo
} from './panorama-analysis.component.helper';
import { isLightTheme} from './../../../../service/vscode.service';
import { HyThemeService, HyTheme } from 'hyper';

@Component({
    selector: 'app-panorama-analysis',
    templateUrl: './panorama-analysis.component.html',
    styleUrls: ['./panorama-analysis.component.scss']
})

export class PanoramaAnalysisComponent implements OnInit, AfterViewInit {
    static MEM_PIECE_NUM = 32;

    @ViewChild('panoramaWarpper', { static: true }) el: ElementRef;

    public panoramaDataCopy: any;
    @Input()
    set panoramaData(val) {
        this.panoramaDataCopy = val;
        this.renderSvgAction();
    }
    get panoramaData() {
        return this.panoramaDataCopy;
    }

    public memoryDataCopy: any;
    @Input()
    set memoryData(val) {
        this.memoryDataCopy = val;
        this.renderSvgAction();
    }
    get memoryData() {
        return this.memoryDataCopy;
    }

    @Output() clickElement = new EventEmitter<{
        element: 'storage' | 'memory' | 'cpu' | 'network' | string, cpu: 'cpu0' | 'cpu1' | string
    }>(); // 枚举

    // 是否渲染
    @Input() isAllSvgChartShow: boolean;

    public i18n: any;

    public isLight = false;

    // 记录被 mouseenter 事件污染（“触摸”）的元素对象
    public focusSvgElement: PanoramaAnalysisSvgElementInfo;

    // 存储所有SVG元素 和 其对应的信息的映射（map），便于提示引用
    public panoramaPieceInfoMap: Map<PanoramaAnalysisSvgElementInfo, any>;
    public memoryPieceInfoMap: Map<MemorySubsystemSvgElementInfo, MemPieceInfo>;

    // SVG元素的数组，便于批量操作
    public panoramaAnalysisArray: Array<PanoramaAnalysisSvgElementInfo> = [];
    public memorySubsystemPieceArray: Array<MemorySubsystemSvgElementInfo> = [];

    // 所有有效的SVG元素的对象
    public storageSubsystemLeft = new PanoramaAnalysisSvgElementInfo(); // 存储子系统 左边
    public storageSubsystemRight = new PanoramaAnalysisSvgElementInfo(); // 存储子系统 右边

    public networkSubSystemLeft = new PanoramaAnalysisSvgElementInfo(); // 网络子系统 左边
    public networkSubSystemRight = new PanoramaAnalysisSvgElementInfo(); // 网络子系统 右边

    public cpuLeft = new PanoramaAnalysisSvgElementInfo(); // kunpeng 920 左边
    public cpuRight = new PanoramaAnalysisSvgElementInfo(); // kunpeng 920 右边

    public memorySubsystemModule = new PanoramaAnalysisSvgElementInfo(); // 内存子系统模块

    public memorySubsystemPieceLeft1 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 1
    public memorySubsystemPieceLeft2 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 2
    public memorySubsystemPieceLeft3 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 3
    public memorySubsystemPieceLeft4 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 4
    public memorySubsystemPieceLeft5 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 5
    public memorySubsystemPieceLeft6 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 6
    public memorySubsystemPieceLeft7 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 7
    public memorySubsystemPieceLeft8 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 8
    public memorySubsystemPieceLeft9 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 9
    public memorySubsystemPieceLeft10 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 10
    public memorySubsystemPieceLeft11 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 11
    public memorySubsystemPieceLeft12 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 12
    public memorySubsystemPieceLeft13 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 13
    public memorySubsystemPieceLeft14 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 14
    public memorySubsystemPieceLeft15 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 15
    public memorySubsystemPieceLeft16 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 16

    public memorySubsystemPieceRight1 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 1
    public memorySubsystemPieceRight2 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 2
    public memorySubsystemPieceRight3 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 3
    public memorySubsystemPieceRight4 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 4
    public memorySubsystemPieceRight5 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 5
    public memorySubsystemPieceRight6 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 6
    public memorySubsystemPieceRight7 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 7
    public memorySubsystemPieceRight8 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 8
    public memorySubsystemPieceRight9 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 9
    public memorySubsystemPieceRight10 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 10
    public memorySubsystemPieceRight11 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 11
    public memorySubsystemPieceRight12 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 12
    public memorySubsystemPieceRight13 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 13
    public memorySubsystemPieceRight14 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 14
    public memorySubsystemPieceRight15 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 15
    public memorySubsystemPieceRight16 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 16

    // tooltip 管理器
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
        public axios: AxiosService,
        private cdr: ChangeDetectorRef,
        public i18nService: I18nService,
        private themeServe: HyThemeService
    ) {
        this.i18n = this.i18nService.I18n();
        this.panoramaAnalysisArray.push(this.storageSubsystemLeft);
        this.panoramaAnalysisArray.push(this.storageSubsystemRight);

        this.panoramaAnalysisArray.push(this.networkSubSystemLeft);
        this.panoramaAnalysisArray.push(this.networkSubSystemRight);

        this.panoramaAnalysisArray.push(this.cpuLeft);
        this.panoramaAnalysisArray.push(this.cpuRight);

        this.panoramaAnalysisArray.push(this.memorySubsystemModule);

        for (let i = 1; i < 17; i++) {
            this.memorySubsystemPieceArray.push(this['memorySubsystemPieceLeft' + i]);
        }

        for (let i = 1; i < 17; i++) {
            this.memorySubsystemPieceArray.push(this['memorySubsystemPieceRight' + i]);
        }
    }

    /**
     * 页面初始化方法
     */
    ngOnInit() {
        // vscode颜色主题
        this.isLight = isLightTheme;
        if (this.isLight) {
            this.setLightColor();
        }
    }

    /**
     * AfterView
     */
    ngAfterViewInit(): void {
        // 设置有效SVG元素选择器
        for (const item of this.panoramaAnalysisArray) {
            item.initSelectionById(this.el);
        }
        for (const item of this.memorySubsystemPieceArray) {
            item.initSelectionById(this.el);
        }

        // 设置渲染动作，并渲染(在设置完成有效SVG元素选择器之后)
        this.renderSvgAction = () => {
            if (!this.isAllSvgChartShow) {
                return;
            }
            if (this.panoramaDataCopy != null && Object.keys(this.panoramaDataCopy).length > 0
                && this.memoryDataCopy != null && Object.keys(this.memoryDataCopy).length > 0) {
                this.renderSVG(this.panoramaDataCopy, this.memoryDataCopy);
            }
        };
        this.renderSvgAction();

        this.tooltipManager = new TooltipManager(this);

        // 设置有效SVG元素的 mouseenter 、mouseleave 和 click 事件
        this.panoramaAnalysisArray.forEach((item: PanoramaAnalysisSvgElementInfo) => {
            item.selection
                .on('mouseenter', (evt) => {
                    this.focusSvgElement = item;
                    if (this.panoramaDataCopy != null && Object.keys(this.panoramaDataCopy).length > 0) {
                        this.tooltipManager.show(item, this.themeServe.getTheme() as HyTheme);
                    }
                    item.selection.attr('cursor', 'pointer');
                    item.outSelection.attr('display', 'unset');
                })
                .on('mouseleave', (evt) => {
                    this.tooltipManager.hidden();
                    item.outSelection.attr('display', 'none');
                }).on('click', (evt) => { // emit 被点击元素
                    let infoClicked = { element: '', cpu: '' };
                    switch (item) {
                        case this.storageSubsystemLeft:
                            infoClicked = { element: 'storage', cpu: 'cpu0' };
                            break;
                        case this.storageSubsystemRight:
                            infoClicked = { element: 'storage', cpu: 'cpu1' };
                            break;
                        case this.networkSubSystemLeft:
                            infoClicked = { element: 'network', cpu: 'cpu0' };
                            break;
                        case this.networkSubSystemRight:
                            infoClicked = { element: 'network', cpu: 'cpu1' };
                            break;
                        case this.cpuLeft:
                            infoClicked = { element: 'cpu', cpu: 'cpu0' };
                            break;
                        case this.cpuRight:
                            infoClicked = { element: 'cpu', cpu: 'cpu1' };
                            break;
                        case this.memorySubsystemModule:
                            infoClicked = { element: 'memory', cpu: 'both' };
                            break;
                        default:
                    }
                    this.clickElement.emit(infoClicked);
                });
        });
    }

    /**
     * SVG渲染
     * @param rawPanoramaData 总览Topo svg
     * @param rawMemData 内存原生数据
     */
    public renderSVG(rawPanoramaData: any, rawMemData: any) {
        // 渲染全景
        const panorPieceInfoMap = this.convertPanoramaData(rawPanoramaData);
        this.panoramaPieceInfoMap = panorPieceInfoMap;
        [...panorPieceInfoMap.keys()].forEach((item: PanoramaAnalysisSvgElementInfo) => {
            const pieceInfo = panorPieceInfoMap.get(item);
            switch (pieceInfo.state) {
                case '1':
                    break;
                case '0':
                    item.selection.attr('display', 'none');
                    item.textSelection.attr('display', 'none');
                    item.fenceSelection.attr('display', 'none');
                    item.pcieSelection.attr('display', 'none');
                    break;
                default:
            }
        });

        // 渲染内存子系统
        const memPieceInfoMap = this.convertMemoryData(rawMemData);
        this.memoryPieceInfoMap = memPieceInfoMap;
        [...memPieceInfoMap.keys()].forEach((item: MemorySubsystemSvgElementInfo) => {
            const pieceState = memPieceInfoMap.get(item).pieceState;
            switch (pieceState) {
                case '11':
                    break;
                case '10':
                    item.selection.attr('display', 'none');
                    break;
                case '00':
                    item.selection.attr('display', 'none');
                    item.slotSelection.attr('display', 'none');
                    break;
            }
        });
    }

    public setLightColor() {
        $('#linearGradient-2 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-2 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-6 > stop:nth-child(1)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-6 > stop:nth-child(2)').attr('stop-color', '#D5DAE5');
        $('#linearGradient-6 > stop:nth-child(3)').attr('stop-color', '#BFC5D2');
        $('#linearGradient-6 > stop:nth-child(4)').attr('stop-color', '#BAC0CE');
        $('#linearGradient-6 > stop:nth-child(5)').attr('stop-color', '#DCE3ED');
        $('#linearGradient-7 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-7 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-10 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-10 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-12 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-12 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-14 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-14 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-15 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-15 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-16 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-16 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-17 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-17 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-18 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-18 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-19 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-19 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-20 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-20 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-21 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-21 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-22 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-22 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-23 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-23 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-24 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-24 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-25 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-25 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-26 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-26 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-27 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-27 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-28 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-28 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-29 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-29 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('#linearGradient-32 > stop:nth-child(1)').attr('stop-color', '#E1E6EF');
        $('#linearGradient-32 > stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        $('.box').attr('stroke', '#E7E9F0');

        $('.memorySubsystemModuleBox' + '>g>g:nth-child(1)>g:nth-child(1)>path:nth-child(1)').attr('fill', '#C6CCDB');
        $('.memorySubsystemModuleBox' + '>g>g:nth-child(1)>g:nth-child(1)>path:nth-child(2)').attr('fill', '#D4DAE8');
        $('.memorySubsystemModuleBox' + '>g>g:nth-child(1)>g:nth-child(2)').attr('fill', '#C3CAD8');
        $('.memorySubsystemModuleBox' + '>g>g:nth-child(2)>g>polygon:nth-child(1)').attr('fill', '#C6CCDB');
        $('.memorySubsystemModuleBox' + '>g>g:nth-child(2)>g>rect').attr('fill', '#BAC0CE');
        $('.memorySubsystemModuleBox' + '>g:nth-child(2)>g:nth-child(2)').attr('fill', '#C3CAD8');
        $('.memorySubsystemModuleBox' + '>g>g:nth-child(1)>path:nth-child(1)').attr('fill', '#C6CCDB');
        $('.memorySubsystemModuleBox' + '>g>g:nth-child(1)>path:nth-child(2)').attr('fill', '#D4DAE8');
        $('.memorySubsystemModuleBox' + '>g>g>polygon:nth-child(1)').attr('fill', '#C6CCDB');
        $('.memorySubsystemModuleBox' + '>g>g>rect').attr('fill', '#BAC0CE');
        $('.memorySubsystemModuleOutBox').attr('stroke', '#576170');
        $('.memorySubsystemModuleTextBox').attr('fill', '#282B33');

        // 左侧CPU
        $('.cpuLeftBox' + '>g>polygon').attr('fill', '#BCC9DD');
        $('.cpuLeftBox' + '>g>path:nth-child(2)').attr('fill', '#C6CCDB');
        $('.cpuLeftBox' + '>g>g>polygon:nth-child(1)').attr('fill', '#B2BFD3');
        $('.cpuLeftBox' + '>g>g>polygon:nth-child(2)').attr('fill', '#D6E1F2');
        $('.cpuLeftOutBox').attr('stroke', '#576170');
        $('.cpuLeftTextBox').attr('fill', '#222222');

        // 左侧存储子系统
        $('.storageSubsystemLeftBox' + '>g>rect').attr('fill', '#B1B7C4');
        $('.storageSubsystemLeftBox' + '>g>path:nth-child(5)').attr('fill', '#DCE3ED');
        $('.storageSubsystemLeftOutBox').attr('stroke', '#576170');
        $('.storageSubsystemLeftTextBox').attr('fill', '#aaaaaa');

        // 左侧网络子系统
        $('.networkSubSystemLeftBox' + '>g>path:nth-child(1)').attr('fill', '#DCE3ED');
        $('.networkSubSystemLeftBox' + '>g>path:nth-child(2)').attr('fill', '#C6CCDB');
        $('.networkSubSystemLeftBox' + '>g>polygon').attr('fill', '#B1B7C4');
        $('.networkSubSystemLeftBox' + '>g:nth-child(5)>circle').attr('fill', '#B1B8CB');
        $('.networkSubSystemLeftBox' + '>g:nth-child(5)>use').attr('fill', '#333D57');
        $('.networkSubSystemLeftOutBox').attr('stroke', '#576170');

        // 右侧CPU
        $('.cpuRightBox' + '>g>polygon').attr('fill', '#BCC9DD');
        $('.cpuRightBox' + '>g>path:nth-child(1)').attr('fill', '#BCC9DD');
        $('.cpuRightBox' + '>g>g>polygon:nth-child(1)').attr('fill', '#B2BFD3');
        $('.cpuRightBox' + '>g>g>polygon:nth-child(2)').attr('fill', '#D6E1F2');
        $('.cpuRightOutBox').attr('stroke', '#576170');
        $('.cpuRightTextBox').attr('fill', '#222222');

        // 右侧存储子系统
        $('.storageSubsystemRightBox' + '>g>rect').attr('fill', '#B1B7C4');
        $('.storageSubsystemRightBox' + '>g>path:nth-child(5)').attr('fill', '#DCE3ED');
        $('.storageSubsystemRightOutBox').attr('stroke', '#576170');
        $('.storageSubsystemRightTextBox').attr('fill', '#aaaaaa');

        // 右侧网络子系统
        $('.networkSubSystemRightBox' + '>g>g>path').attr('fill', '#CED3DB');
        $('.networkSubSystemRightBox' + '>g>g>g').attr('fill', '#C6CCDB');
        $('.networkSubSystemRightBox' + '>g>g>polygon').attr('fill', '#B1B7C4');
        $('.networkSubSystemRightBox' + '>g:nth-child(5)>circle').attr('fill', '#B1B8CB');
        $('.networkSubSystemRightBox' + '>g:nth-child(5)>use').attr('fill', '#333D57');
        $('.networkSubSystemRightOutBox').attr('stroke', '#576170');
    }

    /**
     * 处理接口数据并返回 渲染全景
     * @param rawData 接口数据
     */
    public convertPanoramaData(rawData: any): Map<PanoramaAnalysisSvgElementInfo, any> {
        const panoramaPieceInfoMap = new Map<PanoramaAnalysisSvgElementInfo, any>();

        const layoutInfo = rawData.relation.cpu;
        const cpu0 = layoutInfo.cpu0;
        const cpu1 = layoutInfo.cpu1;
        const memInfo = rawData.res_mem;

        if (memInfo != null && Object.keys(memInfo).length > 0) {
            const memoryInfo = new MemoryInfo(
              '1',
              memInfo.dimm,
              (
                (parseInt(memInfo.max_capacity, 10) * 1024 * 1024 * 1024) /
                1000 /
                1000 /
                1000
              ).toFixed(2),
              memInfo.null
            );
            panoramaPieceInfoMap.set(this.memorySubsystemModule, memoryInfo);
        } else {
            panoramaPieceInfoMap.set(this.memorySubsystemModule, new MemoryInfo('0'));
        }

        if (cpu0 != null && Object.keys(cpu0).length > 0) {
            const { res, storage, net } = cpu0;
            const cpuPieceInfo = new CpuPieceInfo('1', res.cpu_type, res.cpu_cores, res.current_freq, res.max_freq);
            // 左侧CPU
            panoramaPieceInfoMap.set(this.cpuLeft, cpuPieceInfo);
            if (storage != null && Object.keys(storage).length > 0) {
                const typeArr = [];
                const typeObj = storage.count_type;
                for (const item of Object.keys(typeObj)) {
                    const typeItem = { type: item, size: typeObj[item].total, num: typeObj[item].num };
                    typeArr.push(typeItem);
                }
                const storagePieceInfo = new StoragePieceInfo('1', storage.count, typeArr);
                panoramaPieceInfoMap.set(this.storageSubsystemLeft, storagePieceInfo);
                // 存储子系统
            } else {
                panoramaPieceInfoMap.set(this.storageSubsystemLeft, new StoragePieceInfo('0'));
            }
            if (net != null && Object.keys(net).length > 0) {
                const netPieceInfo = new NetPieceInfo('1', net.net_port);
                panoramaPieceInfoMap.set(this.networkSubSystemLeft, netPieceInfo);
            } else {
                panoramaPieceInfoMap.set(this.networkSubSystemLeft, new NetPieceInfo('0'));
            }
        } else {
            panoramaPieceInfoMap.set(this.cpuLeft, new CpuPieceInfo('0'));
        }

        if (cpu1 != null && Object.keys(cpu1).length > 0) {
            const { res, storage, net } = cpu1;

            const cpuPieceInfo = new CpuPieceInfo('1', res.cpu_type, res.cpu_cores, res.current_freq, res.max_freq);
            // 右侧cpu
            panoramaPieceInfoMap.set(this.cpuRight, cpuPieceInfo);
            if (storage != null && Object.keys(storage).length > 0) {
                const typeArr = [];
                const typeObj = storage.count_type;
                for (const item of Object.keys(typeObj)) {
                    const typeItem = { type: item, size: typeObj[item].total, num: typeObj[item].num };
                    typeArr.push(typeItem);
                }
                const storagePieceInfo = new StoragePieceInfo('1', storage.count, typeArr);
                panoramaPieceInfoMap.set(this.storageSubsystemRight, storagePieceInfo);
                // 存储子系统
            } else {
                panoramaPieceInfoMap.set(this.storageSubsystemRight, new StoragePieceInfo('0'));
            }

            if (net != null && Object.keys(net).length > 0) {
                const netPieceInfo = new NetPieceInfo('1', net.net_port);
                panoramaPieceInfoMap.set(this.networkSubSystemRight, netPieceInfo);
                // 右侧网络子系统
            } else {
                panoramaPieceInfoMap.set(this.networkSubSystemRight, new NetPieceInfo('0'));
            }
        } else {
            panoramaPieceInfoMap.set(this.cpuRight, new CpuPieceInfo('0'));
        }
        return panoramaPieceInfoMap;
    }

    /**
     * 处理接口数据并返回  内存子系统
     * @param rawData 接口数据
     */
    public convertMemoryData(rawData: any): Map<MemorySubsystemSvgElementInfo, MemPieceInfo> {
        const memPieceInfoMap = new Map<MemorySubsystemSvgElementInfo, MemPieceInfo>();

        const dimm = rawData.dimm;
        const posArr: string[] = dimm.pos;
        const capArr: string[] = dimm.cap;
        const cfgSpeedArr: string[] = dimm.cfg_speed;
        const maxSpeedArr: string[] = dimm.max_speed;

        const posArrLen = posArr.length;
        if (posArrLen === PanoramaAnalysisComponent.MEM_PIECE_NUM) { // 32 个插槽的情况
            for (let i = 0; i < PanoramaAnalysisComponent.MEM_PIECE_NUM; i++) {
                const pos = posArr[i].trim();
                const cap = capArr[i].trim();
                const cfgSpeed = cfgSpeedArr[i].trim();
                const maxSpeed = maxSpeedArr[i].trim();
                const pieceState = cap === 'No Module Installed' ? '10' : '11';

                const pieceInfo = new MemPieceInfo(pieceState, pos, cap, cfgSpeed, maxSpeed);
                memPieceInfoMap.set(this.memorySubsystemPieceArray[i], pieceInfo);

            }
        } else if (posArrLen === PanoramaAnalysisComponent.MEM_PIECE_NUM / 2) { // 16 个插槽的情况
            for (let i = 0; i < PanoramaAnalysisComponent.MEM_PIECE_NUM; i++) {
                let pieceInfo: MemPieceInfo;
                if (i % 2 === 0) {
                    const pos = posArr[i / 2].trim();
                    const cap = capArr[i / 2].trim();
                    const cfgSpeed = cfgSpeedArr[i / 2].trim();
                    const maxSpeed = maxSpeedArr[i / 2].trim();
                    const pieceState = cap === 'No Module Installed' ? '10' : '11';
                    pieceInfo = new MemPieceInfo(pieceState, pos, cap, cfgSpeed, maxSpeed);
                } else {
                    const pieceState = '00';
                    pieceInfo = new MemPieceInfo(pieceState);
                }
                memPieceInfoMap.set(this.memorySubsystemPieceArray[i], pieceInfo);
            }
        } else { // 虚拟机的情况
            const pos = posArr[0].trim();
            const cap = capArr[0].trim();
            const cfgSpeed = cfgSpeedArr[0].trim();
            const maxSpeed = maxSpeedArr[0].trim();
            const pieceState = cap === 'No Module Installed' ? '10' : '11';

            const pieceInfo = new MemPieceInfo(pieceState, pos, cap, cfgSpeed, maxSpeed);
            memPieceInfoMap.set(this.memorySubsystemPieceArray[0], pieceInfo);

            for (let i = 1; i < PanoramaAnalysisComponent.MEM_PIECE_NUM; i++) {
                const pieceStateLocal = '10';
                const pieceInfoLocal = new MemPieceInfo(pieceStateLocal);
                memPieceInfoMap.set(this.memorySubsystemPieceArray[i], pieceInfoLocal);
            }
        }

        return memPieceInfoMap;
    }
}
