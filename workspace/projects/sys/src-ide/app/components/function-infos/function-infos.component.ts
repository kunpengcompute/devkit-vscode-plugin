import {
    Component, OnInit, Input, AfterViewInit, ChangeDetectorRef, NgZone
} from '@angular/core';
import {
    TiTableColumns, TiTableRowData, TiTableSrcData
} from '@cloud/tiny3';
import {  ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { TableService } from '../../service/table.service';
import { Utils } from '../../service/utils.service';
import { HyThemeService, HyTheme } from 'hyper';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * 临界值
 */
export const enum CRITICAL_VALUE {
    WIDTH_THRESHOLD = 1000,
}

@Component({
    selector: 'app-function-infos',
    templateUrl: './function-infos.component.html',
    styleUrls: ['./function-infos.component.scss'],
})
export class FunctionInfosComponent implements OnInit, AfterViewInit {
    @Input() headers?: [{  // 头部，可以不传，表示没有
        label: string,
        content: string,
    }];
    @Input() functionDetails: { // 函数详情
        sourceCode: { // 源代码
            data: any[],  // 表格数据
        }
        assemblyCode: { // 汇编代码
            data: any[],  // 表格数据
            hasCodeBlock?: boolean,  // 是否有代码块【跳转代码块功能】【暂时只有Miss事件没有，所以值为false才表示没有， 默认不传表示有】
        },
        codeStream?: {  // 代码流【undefined表示没有代码流图】
            svgpath: any,  // 代码流的svg图
            graph_status?: { // 状态
                status: any,  // 是1的时候表示没有代码流图且后端返回原因
                info_cn: string,  // 没有代码流图时的显示词【中文】
                info_en: string,  // 没有代码流图时的显示词【英文】
            },
        },
    };
    // 主题相关属性
    hyTheme = HyTheme;
    currTheme = HyTheme.Dark;

    public boxID: any;
    public viewInit = false;
    public svgScale = 1; // svg缩放倍数
    i18n: any;

    // 源代码表格
    public sourceData = {
        currentRow: undefined,
        activeRow: [],  // 通过行号选择时可能有多个高亮的行
        displayed: ([] as Array<TiTableRowData>),
        srcData: ({} as TiTableSrcData),
        originalSrcData: [],
        columns: ([] as Array<TiTableColumns>),
    };

    // 汇编代码
    public assemblerData = {
        currentRow: undefined,
        activeRow: [],  // 通过行号选择时可能有多个高亮的行
        nonZeroBlock: [], // 数量不为0的代码块【点击汇编代码的上一个/下一个代码块使用】
        displayed: ([] as Array<TiTableRowData>),
        srcData: ({} as TiTableSrcData),
        originalSrcData: [],
        columns: ([] as Array<TiTableColumns>),
    };
    public disableBlock = {  // 是否禁用上一个/下一个代码块
        pre: false,
        next: false,
    };
    public blockClickFlag: boolean;  // 判断是否第一次点击
    public firstHasDataIndex = 0;  // 汇编代码中最后一个有proportion数据的索引
    public lastHasDataIndex = 0;  // 汇编代码中最后一个有proportion数据的索引
    public showLoading = false;
    public isFold = false;
    public isIntellij = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    preImgSrc: string;
    nextImgSrc: string;

    constructor(
        public sanitizer: DomSanitizer,
        public i18nService: I18nService,
        public mytip: MytipService,
        public tableService: TableService,
        private route: ActivatedRoute,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private themeServe: HyThemeService,
    ) {
        this.i18n = this.i18nService.I18n();

        // vscode颜色主题适配
        this.themeServe.subscribe((msg: HyTheme) => {
            this.currTheme = msg;

            this.preImgSrc = this.currTheme === HyTheme.Light
            ? './assets/img/light-projects/preBlockNew.svg'
            : './assets/img/projects/preBlockNew.svg';

            this.nextImgSrc = this.currTheme === HyTheme.Light
            ? './assets/img/light-projects/nextBlockNew.svg'
            : './assets/img/projects/nextBlockNew.svg';
        });

        this.sourceData.columns = [
            { label: this.i18n.common_term_task_tab_function_source_line, prop: 'line', width: '20%' },
            { label: this.i18n.common_term_task_tab_function_source_code, prop: 'line_code', width: '60%' },
            { label: this.i18n.common_term_task_tab_function_count, prop: 'countAndProportion', width: '20%' },
        ];
        this.sourceData.srcData = {
            data: [],
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };

        this.assemblerData.columns = [
            { label: this.i18n.common_term_task_tab_function_assembley_address, prop: 'offset', width: '120px' },
            { label: this.i18n.common_term_task_tab_function_assembley_line, prop: 'line', width: '90px' },
            { label: this.i18n.common_term_task_tab_function_assembley_code, prop: 'ins' },
            { label: this.i18n.common_term_task_tab_function_count, prop: 'countAndProportion', width: '90px' },
        ];
        this.assemblerData.srcData = {
            data: [],
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }

    /**
     * 组件初始化
     */
    ngOnInit(): void {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.route.queryParams.subscribe((data) => {
               let message = data.message;
               message = message.replace(/#single#/g, '"').replace(/#colon#/g, ':').replace(/&n@/g, '<br/>')
                .replace(/#slash#/g, '\\\"').replace(/#\!#/g, '!').replace(/#LINE#/g, '\\');
               message = JSON.parse(message);
               this.headers = message.headers;
               this.functionDetails  = message.functionDetails;
               this.updateWebViewPage();
            });
        }else {
            this.route.queryParams.subscribe(data => {
                this.destory();
                this.boxID = Utils.generateConversationId(16);
                this.headers = JSON.parse(data.headers);
                this.functionDetails = JSON.parse(data.functionDetails);
                if (this.viewInit) {
                    this.init();
                }
            });
        }
    }

    /**
     * 页面init后
     */
    ngAfterViewInit() {
        this.viewInit = true;
        this.init();
    }

    /**
     * 加载数据
     */
    public init() {
        this.showLoading = true;
        setTimeout(() => {
            // 源代码
            this.sourceData.originalSrcData = this.functionDetails.sourceCode.data;
            this.sourceData.srcData.data = this.functionDetails.sourceCode.data;

            // 汇编代码
            this.formatTreeData(this.functionDetails.assemblyCode.data);
            for (let i = this.functionDetails.assemblyCode.data.length - 1; i >= 0; i--) {
                if (this.functionDetails.assemblyCode.data[i].proportion !== '0') {
                    this.lastHasDataIndex = i;
                    break;
                }
            }
            for (let i = 0; i < this.functionDetails.assemblyCode.data.length; i++) {
                if (this.functionDetails.assemblyCode.data[i].proportion !== '0') {
                    this.firstHasDataIndex = i;
                    break;
                }
            }

            // 代码流
            if (this.functionDetails.codeStream) {
                const status = this.functionDetails.codeStream.graph_status;

                if (status && status.status === 1) {
                    this.setSvgNoData((self as any)
                        .webviewSession.getItem('language') === 'zh-cn' ? status.info_cn : status.info_en);
                } else if (this.functionDetails.codeStream.svgpath) {
                  this.initSvg(this.functionDetails.codeStream.svgpath);
                } else {
                    this.setSvgNoData(this.i18n.common_term_task_nodata2);
                }
            }
            this.showLoading = false;
        }, 500);
    }

    /**
     * 还原数据
     */
    public destory() {
        this.sourceData.currentRow = undefined;
        this.sourceData.activeRow = [];
        this.sourceData.srcData.data = [];
        this.sourceData.originalSrcData = [];
        this.assemblerData.currentRow = undefined;
        this.assemblerData.activeRow = [];
        this.assemblerData.nonZeroBlock = [];
        this.assemblerData.srcData.data = [];
        this.assemblerData.originalSrcData = [];
        $(`#${this.boxID} #insvg`).empty();
    }

    /**
     * 禁用与解禁用上一个/下一个代码块功能
     * @param codeBlock 上一个/下一个代码块功能
     * @param disableFlag 是否禁用的标志
     */
    public disableCodeBlock(codeBlock: string, disableFlag: boolean) {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.disableBlock[codeBlock] = disableFlag;
            let preBlockSrc = './assets/img/projects/preNormalBlock.svg';
            let nextBlockSrc = './assets/img/projects/nextBlockNew.svg';
            let disablePreBlockSrc = './assets/img/projects/preBlockClick.svg';
            let disableNextBlockSrc = './assets/img/projects/nextBlockClick.svg';
            if (this.currTheme === HyTheme.Light) {
                preBlockSrc = './assets/img/light-projects/PreBlockNew.svg';
                nextBlockSrc = './assets/img/light-projects/nextBlockNew.svg';
                disablePreBlockSrc = './assets/img/light-projects/disablePreBlockNew.svg';
                disableNextBlockSrc = './assets/img/light-projects/disableNextBlockNew.svg';
            }

            if (disableFlag) {
                if (codeBlock === 'pre') {
                    this.disableBlock.pre = true;
                    $('#pre-block').attr('src', disablePreBlockSrc);
                } else {
                    this.disableBlock.next = true;
                    $('#next-block').attr('src', disableNextBlockSrc);
                }
            } else {
                codeBlock === 'pre' ?
                    $('#pre-block').attr('src', preBlockSrc) :
                    $('#next-block').attr('src', nextBlockSrc);
            }
        }else{
            this.disableBlock[codeBlock] = disableFlag;
            let preBlockSrc = './assets/img/projects/PreBlockNew.svg';
            let nextBlockSrc = './assets/img/projects/nextBlockNew.svg';
            let disablePreBlockSrc = './assets/img/projects/disablePreBlockNew.svg';
            let disableNextBlockSrc = './assets/img/projects/disableNextBlockNew.svg';
            if (this.currTheme === HyTheme.Light) {
                preBlockSrc = './assets/img/light-projects/PreBlockNew.svg';
                nextBlockSrc = './assets/img/light-projects/nextBlockNew.svg';
                disablePreBlockSrc = './assets/img/light-projects/disablePreBlockNew.svg';
                disableNextBlockSrc = './assets/img/light-projects/disableNextBlockNew.svg';
            }

            if (disableFlag) {
                if (codeBlock === 'pre') {
                    this.disableBlock.pre = true;
                    $('#pre-block').attr('src', disablePreBlockSrc);
                } else {
                    this.disableBlock.next = true;
                    $('#next-block').attr('src', disableNextBlockSrc);
                }
            } else {
                codeBlock === 'pre' ?
                    $('#pre-block').attr('src', preBlockSrc) :
                    $('#next-block').attr('src', nextBlockSrc);
            }
        }
    }

    // -- 源代码 --
    /**
     * 高亮源代码表格
     */
    public highlightSourceCodeTr(
        { line, row, scrollIntoView = false }: {
            line?: any,  // 通过行号寻找要高亮的行【点击汇编代码和代码流的方块是通过这个】
            row?: any,  // 直接传递要高亮的行【自身表格点击高亮是通过这个，因为伪共享分析存在行号重复的情况】
            scrollIntoView?: boolean,  // 是否需要滚动至可视区域内【点击表格高亮不需要】【点击代码流需要】
        },
        i?: number,  // 行数
        blockIndex?  // 子元素blockIndex
    ) {
        if (i === -1) {
            Math.ceil(blockIndex) <= this.firstHasDataIndex ?
                this.disableCodeBlock('pre', true) :
                this.disableCodeBlock('pre', false);
            Math.floor(blockIndex) >= this.lastHasDataIndex ?
                this.disableCodeBlock('next', true) :
                this.disableCodeBlock('next', false);
        } else if (i !== undefined) {
            i === 0 ?
                this.disableCodeBlock('pre', true) :
                this.disableCodeBlock('pre', false);
        }
        this.sourceData.activeRow.forEach(item => item.active = false);
        this.sourceData.activeRow = [];

        if (row !== undefined) {
            row.active = true;
            this.sourceData.activeRow = [row];
        } else if (line !== undefined) {
            this.sourceData.srcData.data.forEach(item => {
                if (item.line === line) {
                    item.active = true;
                    this.sourceData.activeRow.push(item);
                }
            });
        }

        this.sourceData.currentRow = this.sourceData.activeRow[0];
        if (scrollIntoView && this.sourceData.currentRow) {
            const scroll = () => {
                const selectedDom = document.querySelector(
                    `#${this.boxID} .source-left #${this.sourceData.currentRow.id}`
                );
                if (selectedDom) {
                    selectedDom.scrollIntoView();
                }
            };

            setTimeout(scroll, 200);
        }
    }


    // -- 汇编代码 --
    /**
     * 格式化汇编代码数据
     */
    public formatTreeData(data) {
        // 添加代码块索引和id
        data.forEach((item, index) => {
            item.blockIndex = index;
            item.id = `asm_${index}`;

            if (item.children) {
                const childrenLength = item.children.length;

                item.children.forEach((child, childIndex) => {
                    child.blockIndex = index + (childIndex + 1) / (childrenLength + 1);
                    child.id = `asm_${index}_${child.blockIndex}`;
                });

                item.showChildren = true;
            }
        });
        this.assemblerData.originalSrcData = data;
        this.assemblerData.srcData.data = data;
        this.assemblerData.nonZeroBlock = data.filter(item => (item.ins.indexOf('Basic Block') > -1) && item.count);
        this.disableCodeBlock('pre', !this.assemblerData.nonZeroBlock.length);
        this.disableCodeBlock('next', !this.assemblerData.nonZeroBlock.length);
    }

    /**
     * 高亮汇编代码表格
     */
    public highlightAssemblerCodeTr({ line, row, scrollIntoView = false }: {
        line?: any,  // 通过行号寻找要高亮的行【点击源代码是通过这个】
        row?: any,  // 直接传递要高亮的行【点击代码流和自身表格点击高亮是通过这个】
        scrollIntoView?: boolean,  // 是否需要滚动至可视区域内【点击表格高亮不需要】【点击代码流需要】
    }) {
        this.assemblerData.activeRow.forEach(item => item.active = false);
        this.assemblerData.activeRow = [];

        if (row !== undefined) {
            row.active = true;
            this.assemblerData.activeRow = [row];
        } else if (line !== undefined) {
            this.assemblerData.srcData.data.forEach(item => {
                if (item.line === line && item.ins.indexOf('Basic') > -1) {
                    item.active = true;
                    this.assemblerData.activeRow.push(item);
                }
            });
        }

        this.assemblerData.currentRow = this.assemblerData.activeRow[0];
        if (this.assemblerData.nonZeroBlock.length) {
            this.disableCodeBlock(
                'pre', this.assemblerData.currentRow.blockIndex <= this.assemblerData.nonZeroBlock[0].blockIndex
            );
            this.disableCodeBlock('next', this.assemblerData.currentRow.blockIndex
                >= this.assemblerData.nonZeroBlock.slice(-1)[0].blockIndex);
        }
        if (scrollIntoView && this.assemblerData.currentRow) {
            const scroll = () => {
                const selectedDom = document.querySelector(`#${this.boxID} .assembly-right #${
                    this.assemblerData.currentRow.id}`);
                if (selectedDom) {
                    selectedDom.scrollIntoView();
                }
            };

            setTimeout(scroll, 200);
        }
    }

    /**
     * 代码块的移入、移出、按下和松开效果
     * @param imgId 图片id
     * @param imgUrl 图片路径
     */
    public changeBlockColor(imgId: string, imgUrl: string) {
        if ((this.disableBlock.pre && imgId.includes('pre')) || (this.disableBlock.next && imgId.includes('next'))) {
            return;
        }
        if (this.currTheme === HyTheme.Light) {
            imgUrl = imgUrl.replace('projects', 'light-projects');
        }
        imgId === '#pre-block'
        ? this.preImgSrc = imgUrl
        : this.nextImgSrc = imgUrl;
    }

    /**
     * 上一个/下一个代码块【只跳转是代码块且有数量不为0的】
     * @param direction 上一个/下一个代码块
     * @param flag 判断下次点击图标是否处于禁用状态的一个标志
     */
    public clickBlock(direction: string, flag?: number) {
        const nonZeroBlock = this.assemblerData.nonZeroBlock;
        let block;
        if (this.assemblerData.currentRow) {
            const currentIndex = this.assemblerData.currentRow.blockIndex;

            if (direction === 'pre') {
                for (let index = nonZeroBlock.length - 1; index >= 0; index--) {
                    if (nonZeroBlock[index].blockIndex < currentIndex) {
                        block = nonZeroBlock[index];
                        break;
                    }
                }
            } else {
                for (const iterator of nonZeroBlock) {
                    if (iterator.blockIndex > currentIndex) {
                        block = iterator;
                        break;
                    }
                }
            }
        } else {  // 表格中没有选中的，跳至第一个有数量的代码块
            block = this.assemblerData.nonZeroBlock[0];
        }

        if (block) {
            if (flag === 1) {
                return;
            }
            this.highlight(block);
            if (direction === 'pre') {
                this.disableCodeBlock('next', false);
                this.clickBlock('pre', 1);
                if (!this.blockClickFlag) { this.clickBlock('next', 1); }
            } else {
                this.disableCodeBlock('pre', false);
                this.clickBlock('next', 1);
                if (!this.blockClickFlag) { this.clickBlock('pre', 1); }
            }
        } else {
            direction === 'pre' ?
                this.disableCodeBlock('pre', true) :
                this.disableCodeBlock('next', true);
        }
        if (!this.blockClickFlag) { this.blockClickFlag = true; }
    }

    /**
     * 高亮源代码界面、汇编代码界面、代码流界面
     */
    public highlight(row: { line: any; ins: string | any[]; }) {
        // 高亮源代码界面、汇编代码界面
        this.highlightAssemblerCodeTr({ row, scrollIntoView: true });
        this.highlightSourceCodeTr({ line: row.line, scrollIntoView: true });

        // 高亮代码流界面
        const list = document.getElementsByClassName('node');
        const self = this;
        Array.prototype.forEach.call(list, (i: any) => {
            const ins = i.children[0].innerHTML || i.children[0].textContent;
            if (ins && row.ins.indexOf(ins) > -1) {
                $(`#${self.boxID} svg .node`).attr('stroke-width', '0');
                i.setAttribute('stroke-width', '2');
            }
        });
    }

    // -- 代码流 --
    /**
     * initSvg
     */
    public initSvg(svgpath) {
        $(`#${this.boxID} #insvg`).html(svgpath);
        (document.querySelector(`#${this.boxID} #insvg`) as any).onmousewheel = e => {
            // 滚轮事件
            this.mouseScale(e);
            e.preventDefault();
        };

        setTimeout(() => {
            if ($(`#${this.boxID} svg`).width() > CRITICAL_VALUE.WIDTH_THRESHOLD) {
                // 设置svg的宽高
                $(`#${this.boxID} svg`).attr('width', $(`#${this.boxID} #source-img`)[0].offsetWidth - 22 + 'px');
                $(`#${this.boxID} svg`).removeAttr('height');
            } else {
                $(`#${this.boxID} svg`).attr('width', $(`#${this.boxID} svg`).width() + 'px');
                $(`#${this.boxID} svg`).removeAttr('height');
            }
            this.resizeSvg();
            this.listenSvg();
            this.listenSvgClick();

            // 修改svg样式适配暗主题
            const background: any = document.querySelector('#insvg>svg>g>polygon');
            const nodes = document.querySelectorAll('#insvg>svg>g>g.node');
            const edges = document.querySelectorAll('#insvg>svg>g>g.edge');
            const colorTheme = 'dark';
            const colors = {  // light就是接口返回的类型
                background: { // 背景
                    light: { fill: '#ffffff' },
                    dark: { fill: 'transparent' },
                },
                block: {
                    BasicBlock: { // 黄色代码块
                        light: { polygonFill: '#ffffcc', textFill: '#000000' },
                        dark: { polygonFill: '#BAB42B', textFill: '#333333' },
                    },
                    Addr: { // 灰色Addr
                        light: { polygonFill: '#d3d3d3', textFill: '#000000' },
                        dark: { polygonFill: '#AAAAAA', textFill: '#333333' },
                    },
                    redBasicBlock: {  // 标红的 BasicBlock
                        light: { polygonFill: '#e31a1c', textFill: '#000000' },
                        dark: { polygonFill: '#A44017', textFill: '#E8E8E8' },
                    },
                },
                edge: { // 边
                    light: { stroke: '#000000' },
                    dark: { stroke: '#888888' },
                },
                polygon: {
                    light: {
                        stroke: '#000000'
                    },
                    dark: {
                        stroke: '#ffffff'
                    }
                }
            };

            background.style.fill = colors.background[colorTheme].fill;
            background.setAttribute('stroke', 'none');

            nodes.forEach(node => {
                node.setAttribute('stroke-width', '0');
                const polygon = node.querySelector('polygon');
                polygon.setAttribute('stroke', colors.polygon[colorTheme].stroke);
                const text = node.querySelector('text');
                const blockColor = Object.values(colors.block)
                    .find(item => item.light.polygonFill === polygon.getAttribute('fill'));
                if (blockColor) {
                    polygon.style.fill = blockColor[colorTheme].polygonFill;
                    text.style.fill = blockColor[colorTheme].textFill;
                }
            });

            edges.forEach(edge => {
                edge.querySelector('path').style.stroke = colors.edge[colorTheme].stroke;
                edge.querySelector('polygon').style.stroke = colors.edge[colorTheme].stroke;
                edge.querySelector('polygon').style.fill = colors.edge[colorTheme].stroke;
            });
        }, 200);
        this.updateWebViewPage();
    }

    /**
     * setSvgNoData
     */
    public setSvgNoData(info) {
        $(`#${this.boxID} #insvg`).html(
            `<div class='chen-nodata-td'>
                <img style='width:9.5%;display:block;margin-bottom:15px' src='./assets/img/projects/nodata-dark.png' />
                <span style='display: inline-block'>${info}</span>
            </div>`
        );
        this.updateWebViewPage();
    }

    /**
     * mouseScale
     */
    public mouseScale(e) {
        e.stopPropagation();
        if (e.wheelDelta > 0) {
            this.scale(true);
        } else {
            this.scale(false);
        }
        this.updateWebViewPage();
    }

    /**
     * scale
     */
    public scale(state) {
        if (state) {
            this.svgScale = 1.1;
        } else {
            this.svgScale = 0.9;
        }

        const boxDom: any = document.querySelector(`#${this.boxID} #insvg`);
        const svgDom = document.querySelector(`#${this.boxID} svg`);
        const width = svgDom.getClientRects()[0].width * this.svgScale;
        const height = svgDom.getClientRects()[0].height * this.svgScale;

        // 最小缩放到代码流框的80%
        if (Math.max(width - boxDom.offsetWidth * 0.8, height - boxDom.offsetHeight * 0.8) < 0) {
            return;
        }

        $(`#${this.boxID} svg`).attr('width', width + 'px');
        this.updateWebViewPage();
    }

    /**
     * listenSvgClick
     */
    public listenSvgClick() {
        const self = this;
        const list = document.getElementsByClassName('node');
        if (list.length > 0) {
            Array.prototype.forEach.call(list, item => {
                item.addEventListener('click', function aaa(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const ins = $(this).children()[0].innerHTML;
                    if (ins.indexOf('Basic') === -1) {
                        return false;
                    }
                    $(`#${self.boxID} svg .node`).attr('stroke-width', '0');
                    this.setAttribute('stroke-width', '2');

                    if (ins.indexOf('Basic') > -1) {
                        const temp = self.assemblerData.srcData.data.find(x => x.ins.indexOf(ins) > -1);
                        self.highlightAssemblerCodeTr({ row: temp, scrollIntoView: true });
                        self.highlightSourceCodeTr({ line: temp.line, scrollIntoView: true });
                    }
                });
            });
        }
        this.updateWebViewPage();
    }

    /**
     * resizeSvg
     */
    public resizeSvg() {
        const svgw = document
            .querySelectorAll(`#${this.boxID} svg`)[0]
            .getClientRects()[0].width;
        const svgh = document
            .querySelectorAll(`#${this.boxID} svg`)[0]
            .getClientRects()[0].height;
        const boxw = document
            .querySelectorAll(`#${this.boxID} #insvg`)[0]
            .getClientRects()[0].width;
        const boxh = document
            .querySelectorAll(`#${this.boxID} #insvg`)[0]
            .getClientRects()[0].height;
        if (boxh < svgh) {
            this.scale(false);
            this.resizeSvg();
        } else {
            if (boxw < svgw) {
                this.scale(false);
                this.resizeSvg();
            } else {
                return false;
            }
        }
        this.updateWebViewPage();
    }

    /**
     * listenSvg
     */
    public listenSvg() {
        const dv = $(`#${this.boxID} #insvg`)[0];
        let x = 0;
        let y = 0;
        let l = 0;
        let t = 0;
        let isDown = false;
        // 鼠标按下事件
        dv.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            const regex1 = /\((.+?)\)/g;
            if (dv.style.transform.indexOf('translate') > -1) {
                const transform = dv.style.transform.match(regex1);
                const tempx = transform[0].split('');
                tempx.length = tempx.length - 3;
                tempx.shift();

                const tempy = transform[1].split('');
                tempy.length = tempy.length - 3;
                tempy.shift();

                l = parseInt(tempx.join(''), 10);
                t = parseInt(tempy.join(''), 10);
            } else {
                l = 10;
                t = 10;
            }
            dv.style.cursor = 'move';
            // 获取x坐标和y坐标
            x = e.clientX;
            y = e.clientY;

            // 获取左部和顶部的偏移量

            // 开关打开
            isDown = true;
            // 设置样式
            dv.style.cursor = 'move';
        };

        // 鼠标移动
        dv.onmousemove = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isDown === false) {
                return;
            }

            // 获取x和y
            const nx = e.clientX;
            const ny = e.clientY;

            // 计算移动后的左偏移量和顶部的偏移量
            const nl = nx - (x - l);
            const nt = ny - y + t;

            $(`#${this.boxID} #insvg`).css({
                transform: 'translateX(' + nl + 'px) translateY(' + nt + 'px) ',
            });
        };
        // 鼠标抬起事件
        $(`#${this.boxID} .func-main`)[0].onmouseup = e => {
            x = 0;
            y = 0;
            l = 0;
            t = 0;
            // 开关关闭
            isDown = false;
            dv.style.cursor = 'default';
        };
        dv.onmouseup = e => {
            x = 0;
            y = 0;
            l = 0;
            t = 0;
            e.stopPropagation();
            // 开关关闭
            isDown = false;
            dv.style.cursor = 'default';
        };
        dv.onmouseleave = e => {
            e.stopPropagation();
            e.preventDefault();
            x = 0;
            y = 0;
            l = 0;
            t = 0;
            e.stopPropagation();
            // 开关关闭
            isDown = false;
            dv.style.cursor = 'default';
        };
        this.updateWebViewPage();
    }

    /**
     * 代码流图的展开与折叠切换
     */
    public toggleTop() {
        this.isFold = !this.isFold;
        this.updateWebViewPage();
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
