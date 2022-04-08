import {Component, OnInit, Input, AfterViewInit, SecurityContext, ChangeDetectorRef, NgZone} from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { TableService } from '../../service/table.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-function-info',
    templateUrl: './function-info.component.html',
    styleUrls: ['./function-info.component.scss'],
})
export class FunctionInfoComponent implements OnInit, AfterViewInit {
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
            graph_status: { // 状态
                status: any,  // 是1的时候表示没有代码流图且后端返回原因
                info_cn: string,  // 没有代码流图时的显示词【中文】
                info_en: string,  // 没有代码流图时的显示词【英文】
            },
        },
    };

    public boxID: any;
    public svgScale = 1; // svg缩放倍数
    i18n: any;

    // 源代码表格
    public sourceData = {
        currentRow: undefined,
        activeRow: [],  // 通过行号选择时可能有多个高亮的行
        displayed: ([] as Array<TiTableRowData>),
        srcData: ({} as TiTableSrcData),
        columns: ([] as Array<TiTableColumns>),
    };

    // 汇编代码
    public assemblerData = {
        currentRow: undefined,
        activeRow: [],  // 通过行号选择时可能有多个高亮的行
        nonZeroBlock: [], // 数量不为0的代码块【点击汇编代码的上一个/下一个代码块使用】
        displayed: ([] as Array<TiTableRowData>),
        srcData: ({} as TiTableSrcData),
        columns: ([] as Array<TiTableColumns>),
    };
    public nodeDataHtml: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public i18nService: I18nService,
        public mytip: MytipService,
        public sanitizer: DomSanitizer,
        public tableService: TableService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
    ) {
        this.i18n = this.i18nService.I18n();

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
     * ngOnInit
     */
    ngOnInit(): void {
        this.boxID = Utils.generateConversationId(16);
        this.nodeDataHtml =
            `<tr class='no-data'>
                <td class='chen-nodata-td'>
                <img src='./assets/img/projects/nodata-dark.png' />
            <div>` +
            this.i18n.common_term_task_nodata2 +
            `</div></td></tr>`;
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.route.queryParams.subscribe((data) => {
                const message = JSON.parse( data.message);
                this.headers = message.headers;
                this.functionDetails  = message.functionDetails;
                this.updateWebViewPage();
          });
        }
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
        setTimeout(() => {
            // 源代码
            this.sourceData.srcData.data = this.functionDetails.sourceCode.data;

            // 汇编代码
            this.formatTreeData(this.functionDetails.assemblyCode.data);

            // 代码流
            if (this.functionDetails.codeStream) {
                const status = this.functionDetails.codeStream.graph_status;

                if (status && status.status === 1) {
                    this.setSvgNoData(sessionStorage.getItem('language') === 'zh-cn' ? status.info_cn : status.info_en);
                } else if (this.functionDetails.codeStream.svgpath) {
                    this.initSvg(this.functionDetails.codeStream.svgpath);
                } else {
                    this.setSvgNoData(this.i18n.common_term_task_nodata2);
                }
            }
        }, 500);
    }

    /**
     *  -- 源代码 --
     * 高亮源代码表格
     * @param param0 参数
     */
    public highlightSourceCodeTr({ line, row, scrollIntoView = false }: {
        line?: any,  // 通过行号寻找要高亮的行【点击汇编代码和代码流的方块是通过这个】
        row?: any,  // 直接传递要高亮的行【自身表格点击高亮是通过这个，因为伪共享分析存在行号重复的情况】
        scrollIntoView?: boolean,  // 是否需要滚动至可视区域内【点击表格高亮不需要】【点击代码流需要】
    }) {
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
            document.querySelector(`.source-left #${this.sourceData.currentRow.id}`).scrollIntoView();
        }
    }


    /**
     * -- 汇编代码 --
     * 格式化汇编代码数据
     * @param data 参数
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

        this.assemblerData.srcData.data = data;
        this.assemblerData.nonZeroBlock = data.filter(item => (item.ins.indexOf('Basic Block') > -1) && item.count);
    }

    /**
     * 高亮汇编代码表格
     * @param param0 参数
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
        if (scrollIntoView && this.assemblerData.currentRow) {
            document.querySelector(`.assembly-right #${this.assemblerData.currentRow.id}`).scrollIntoView();
        }
    }

    /**
     * 上一个/下一个代码块【只跳转是代码块且有数量不为0的】
     * @param dirction 参数
     */
    public preBlock(dirction) {
        const nonZeroBlock = this.assemblerData.nonZeroBlock;
        let block;

        if (this.assemblerData.currentRow) {
            const currentIndex = this.assemblerData.currentRow.blockIndex;

            if (dirction === 'pre') {
                for (let index = nonZeroBlock.length - 1; index >= 0; index--) {
                    if (nonZeroBlock[index].blockIndex < currentIndex) {
                        block = nonZeroBlock[index];
                        break;
                    }
                }
            } else {
                for (const item of nonZeroBlock) {
                    if (item.blockIndex > currentIndex) {
                        block = item;
                        break;
                    }
                }
            }
        } else {  // 表格中没有选中的，跳至第一个有数量的代码块
            block = this.assemblerData.nonZeroBlock[0];
        }

        if (block) {
            this.highlightAssemblerCodeTr({ row: block, scrollIntoView: true });
            this.highlightSourceCodeTr({ line: block.line, scrollIntoView: true });
        }
    }

    /**
     * 代码流
     * @param svgpath 参数
     */
    public initSvg(svgpath) {
        $('#' + this.boxID + ' #insvg').html(svgpath);
        (document.querySelector('#insvg') as any).onmousewheel = e => {
            this.mouseScale(e);
            e.preventDefault();
        };

        setTimeout(() => {
            $('#' + this.boxID + ' svg').attr(
                'width',
                $('#' + this.boxID + ' #source-img')[0].offsetWidth - 22 + 'px'
            );
            $('#' + this.boxID + ' svg').removeAttr('height');
            this.resizeSvg();
            this.listenSvg();
            this.listenSvgClick();
        }, 20);
        this.updateWebViewPage();
    }

    /**
     * setSvgNoData
     * @param info 参数
     */
    public setSvgNoData(info) {
        $('#' + this.boxID + ' #insvg').html(
            `<div class='chen-nodata-td'>
            <img src='./assets/img/projects/nodata-dark.png' />
            <span>` +
            this.sanitizer.sanitize(SecurityContext.HTML, info) +
            `</span></div>`
        );
        this.updateWebViewPage();
    }

    /**
     * mouseScale
     * @param e 参数
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
     * @param state 参数
     */
    public scale(state) {
        if (state) {
            this.svgScale = 1.1;
        } else {
            this.svgScale = 0.9;
        }

        const width = +$('#' + this.boxID + ' svg').attr('width').slice(0, -2) * this.svgScale;

        // 最小缩放到代码流框的80%
        if (width < (document.querySelector('#source-img') as HTMLElement).offsetWidth * 0.8) {
            return;
        }

        $('#' + this.boxID + ' svg').attr('width', width + 'px');
        this.updateWebViewPage();
    }

    /**
     * listenSvgClick
     *  测试修改
     */
    public listenSvgClick() {
        const list = document.getElementsByClassName('node');
        const self = this;
        Array.prototype.forEach.call(list, item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                const ins = $(this).children()[0].innerHTML;

                if (ins.indexOf('Basic') === -1) {
                    return false;
                }
                $('#' + self.boxID + ' svg .node').removeAttr('stroke-dasharray');
                $('#' + self.boxID + ' svg .node').attr('stroke-width', 1);
                this.setAttribute('stroke-dasharray', '4');
                this.setAttribute('stroke-width', 3);
                if (ins.indexOf('Basic') > -1) {
                    const temp = self.assemblerData.srcData.data.find((x) => {
                        return x.ins.indexOf(ins) > -1;
                    });

                    self.highlightAssemblerCodeTr({ row: temp, scrollIntoView: true });
                    self.highlightSourceCodeTr({ line: temp.line, scrollIntoView: true });
                }
            });
        });
        this.updateWebViewPage();
    }

    /**
     * resizeSvg
     */
    public resizeSvg() {
        const svgw = document
            .querySelectorAll('#' + this.boxID + ' svg')[0]
            .getClientRects()[0].width;
        const svgh = document
            .querySelectorAll('#' + this.boxID + ' svg')[0]
            .getClientRects()[0].height;
        const boxw = document
            .querySelectorAll('#' + this.boxID + ' #insvg')[0]
            .getClientRects()[0].width;
        const boxh = document
            .querySelectorAll('#' + this.boxID + ' #insvg')[0]
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
        const dv = $('#' + this.boxID + ' #insvg')[0];
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

            $('#' + this.boxID + ' #insvg').css({
                transform: 'translateX(' + nl + 'px) translateY(' + nt + 'px) ',
            });
        };
        // 鼠标抬起事件
        $('#' + this.boxID + ' .func-main')[0].onmouseup = (e) => {
            x = 0;
            y = 0;
            l = 0;
            t = 0;
            // 开关关闭
            isDown = false;
            dv.style.cursor = 'default';
        };
        dv.onmouseup = (e) => {
            x = 0;
            y = 0;
            l = 0;
            t = 0;
            e.stopPropagation();
            // 开关关闭
            isDown = false;
            dv.style.cursor = 'default';
        };
        dv.onmouseleave = (e) => {
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
