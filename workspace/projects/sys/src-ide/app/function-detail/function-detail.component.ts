import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { AxiosService } from '../service/axios.service';
import { I18nService } from '../service/i18n.service';
import { MytipService } from '../service/mytip.service';
import { Utils } from '../service/utils.service';
@Component({
    selector: 'app-function-detail',
    templateUrl: './function-detail.component.html',
    styleUrls: ['./function-detail.component.scss'],
})
export class FunctionDetailComponent implements OnInit, AfterViewInit {
    constructor(
        private Axios: AxiosService,
        public i18nService: I18nService,
        public mytip: MytipService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() functionName: any;
    @Input() module: any;
    @Input() functionType: any;
    @Input() id: any;
    @Input() nodeid: any;
    public boxID: any;
    public svgScale = 1; // svg缩放倍数
    i18n: any;

    // source code
    public headers = {
        hardware: '',
        total: '',
        file: '',
    };
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData;
    public sourceData: Array<any> = [];
    public saveAssembleyData = {};
    public assemblyTarget = ''; // 当前选中的项
    public sourceTarget = ''; // 当前选中的项
    public columns: Array<TiTableColumns> = [];
    public nodeDataHtml: any;
    // Assembly Code

    public displayedTree: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcTreeData;
    public assembleyData: Array<TiTableRowData> = [];
    public columnsTree: Array<TiTableColumns> = [];
    public treeData: Array<any> = [];

    /**
     * geth
     * @param id id
     */
    public geth(id) { }

    /**
     * querySourceCode
     */
    public querySourceCode() {
        if (isNaN(this.functionType)) {
            this.functionType = 0;
        }
        const param = {
            'node-id': this.nodeid,

            func: encodeURIComponent(this.functionName),
            module: this.module,
            'nav-name': 'Code',
            javamix: this.functionType,
            field: 'CPU_CYCLES',
        };
        let url = `/tasks/${this.id}/common/code-mapping/?`;
        url += encodeURIComponent(this.Axios.converUrl(param));
        this.Axios.axios
            .get(url, { headers: { mask: false } })
            .then((resp: any) => {
                const data = resp.data;
                this.headers.file = data.filename;
                this.headers.hardware = 'CPU Cycles';
                this.headers.total = data.pmutotal.CPU_CYCLES;
                this.initSourceData(data.source.code);
                if (data.hasOwnProperty('bbb')) {
                    this.initTreeData(data.bbb);
                } else {
                    $('#' + this.boxID + ' #assembly').html(this.nodeDataHtml);
                }
                this.initSvg(data.svgpath, data.graph_status);
            })
            .catch((error) => {
                this.addError();
            });
    }
    /**
     * addError
     */
    public addError() {
        $('#' + this.boxID + ' #test').html(this.nodeDataHtml);
        $('#' + this.boxID + ' #assembly').html(this.nodeDataHtml);
        $('#' + this.boxID + ' #insvg').html(
            `<div class='chen-nodata-td'>
            <img src='./assets/img/projects/nodata-dark.png' />
            <span>` +
            this.i18n.common_term_task_nodata +
            `</span></div>`
        );
    }
    /**
     * initSvg
     * @param file file
     * @param status status
     */
    public initSvg(file, status) {
        if (status && status.status === 1) {
            let info = status.info_cn;
            self.webviewSession.getItem('language') === 'zh-cn'
                ? (info = status.info_cn)
                : (info = status.info_en);
            $('#' + this.boxID + ' #insvg').html(
                `<div class='chen-nodata-td'>
                <img src='./assets/img/projects/nodata-dark.png' />
                <span>` +
                info +
                `</span></div>`
            );
            return false;
        }
        if (file === undefined) {
            $('#' + this.boxID + ' #insvg').html(
                `<div class='chen-nodata-td'>
                <img src='./assets/img/projects/nodata-dark.png' />
                <span>` +
                this.i18n.common_term_task_nodata +
                `</span></div>`
            );
            return false;
        }
        this.Axios.axios
            .get(`/tasks/${this.id}/c-analysis/svg-content/?svg-name=` + file, {
                headers: { mask: false },
            })
            .then((resp: any) => {
                if (resp.length > 0) {
                    $('#' + this.boxID + ' #insvg').html(resp);
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
                } else {
                    $('#' + this.boxID + ' #insvg').html(
                        `<div class='chen-nodata-td'>
                        <img src='./assets/img/projects/nodata-dark.png' />
                        <span>` +
                        this.i18n.common_term_task_nodata +
                        `</span></div>`
                    );
                }
            })
            .catch((e) => {
                $('#' + this.boxID + ' #insvg').html(
                    `<div class='chen-nodata-td'>
                    <img src='./assets/img/projects/nodata-dark.png' />
                    <span>` +
                    this.i18n.common_term_task_nodata +
                    `</span></div>`
                );
            });
    }
    /**
     * initSourceData
     * @param data data
     */
    public initSourceData(data) {
        this.sourceData = data;
        const tdList = [
            { prop: 'line', style: 'width:20%;height:32px;padding:0 10px' },
            { prop: 'line_code', style: 'width:60%;height:32px;padding:0 10px' },
            { prop: 'CPU_CYCLES', style: 'width:20%;height:32px;padding:0 10px' },
        ];

        const fragment = document.createDocumentFragment();

        data.forEach((item) => {
            const tr = document.createElement('tr');
            tr.id = item.line;
            tr.className = 'lefttr';

            tdList.forEach(tdProp => {
                const td = document.createElement('td');
                td.style.cssText = tdProp.style;
                if (typeof td.textContent === 'string') {
                    td.textContent = item[tdProp.prop];
                } else {
                    td.innerText = item[tdProp.prop];
                }

                tr.appendChild(td);
            });

            fragment.appendChild(tr);
        });

        document.querySelector(`#${this.boxID} #test`).appendChild(fragment);

        if (
            this.sourceData.length === 0 ||
            this.sourceData === null ||
            this.sourceData === undefined ||
            this.sourceData === []
        ) {
            $('#' + this.boxID + ' #test').html(this.nodeDataHtml);
        }
        const self = this;
        $('#' + this.boxID + ' .lefttr').on('click', () => {
            const id = $(this).attr('id');
            $('#' + self.boxID + ' .lefttr.active').removeClass('active');
            $(this).addClass('active');
            self.sourceTarget = id;
            if (self.assemblyTarget !== '') {
                $('#' + self.boxID + ' .righttr.active').removeClass('active');
            }
            self.assembleyData.forEach((item) => {
                // 激活右边
                if (item.line === id && item.ins.indexOf('Basic') > -1) {
                    $('#' + self.boxID + ' #' + item.id)[0].scrollIntoView();
                    self.assemblyTarget = item.id;
                    $('#' + self.boxID + ' #' + item.id).addClass('active');
                }
            });
        });
    }

    /**
     * mouseScale
     * @param e e
     */
    public mouseScale(e) {
        e.stopPropagation();
        if (e.wheelDelta > 0) {
            this.scale(true);
        } else {
            this.scale(false);
        }
    }
    /**
     * scale
     * @param state state
     */
    public scale(state) {
        if (state) {
            this.svgScale = 1.1;
        } else {
            this.svgScale = 0.9;
        }

        const width = $('#' + this.boxID + ' svg')
            .attr('width')
            .slice(0, -2);
        $('#' + this.boxID + ' svg').attr(
            'width',
            parseInt(width, 10) * this.svgScale + 'px'
        );
    }

    /**
     * listenSvgClick
     */
    public listenSvgClick() {
        const list = document.getElementsByClassName('node');
        const self = this;

        for (const i of Object.keys(list)) {
            const element = list[i];
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const ins = $(element).children()[0].innerHTML;

                if (ins.indexOf('Basic') === -1) {
                    return false;
                }
                $('#' + self.boxID + ' svg .node').removeAttr('stroke-dasharray');
                $('#' + self.boxID + ' svg .node').attr('stroke-width', 1);

                element.setAttribute('stroke-dasharray', '4');

                element.setAttribute('stroke-width', 3);
                if (ins.indexOf('Basic') > -1) {
                    const temp = self.assembleyData.find((x) => {
                        return x.ins.indexOf(ins) > -1;
                    });

                    if (self.assemblyTarget !== '') {
                        $('#' + self.boxID + ' .righttr.active').removeClass('active');
                    }
                    document.querySelector('.assembly-right .table-box').scrollTop = $(
                        '#' + self.boxID + ' #' + temp.id
                    )[0].offsetTop;
                    self.assemblyTarget = temp.id;
                    $('#' + self.boxID + ' #' + temp.id).addClass('active');
                    self.scrorllLeft(temp.line);
                }
            });
        }
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
        $('#' + this.boxID)[0].onmousemove = (e) => {
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
    }

    /**
     * scrorllLeft
     * @param line line
     */
    public scrorllLeft(line) {
        this.sourceData.forEach((item) => {
            if (item.line === line) {
                if (this.sourceTarget !== '') {
                    $('#' + this.boxID + ' .lefttr.active').removeClass('active');
                }
                $('#' + this.boxID + ' #' + item.line)[0].scrollIntoView();
                this.sourceTarget = item.line;
                $('#' + this.boxID + ' #' + item.line).addClass('active');
            }
        });
    }
    /**
     * initTreeData
     * @param data data
     */
    public initTreeData(data) {
        data.forEach((item, index) => {
            item.id = Utils.generateConversationId(32);
            if (item.hasOwnProperty('end')) {
                item.children = [];
                this.treeData.push(item);
            } else {
                this.treeData[this.treeData.length - 1].children.push(item);
            }
        });

        this.initAssemTable();
    }
    /**
     * initAssemTable
     */
    public initAssemTable() {
        let html = '';
        this.assembleyData = this.getTreeTableArr(this.treeData);

        this.assembleyData.forEach((item) => {
            this.saveAssembleyData[item.id] = item;
        });

        this.assembleyData.forEach((item, index) => {
            const hasBlock = item.ins.indexOf('Basic Block') > -1 ? 'y' : 'n';
            const count = Number(
                item.CPU_CYCLES.slice(0, item.CPU_CYCLES.indexOf('('))
            );
            const hasCount = count > 0 ? 'y' : 'n';
            html += `
          <tr   id='${item.id}' class='righttr' line='${item.line}' hasBlock='${hasBlock}' hasCount='${hasCount}'>
            <td class='level${item.level} ' line='${item.line}' >
          `;
            if (item.hasChildren === true) {
                html += `
        <span class="ti3-table-tree active"  >
                        <img src='./assets/img/header/select-right.png' class='toggle' isopen="true" >
                    </span>
        `;
            }
            html += `<span>${item.offset}</span>
                </td>
            <td style='width:20%;height:32px;padding:0 10px'>${item.line}</td>
            <td style='width:40%;height:32px;padding:0 10px'>${item.ins}</td>
            <td style='width:20%;height:32px;padding:0 10px'>${item.CPU_CYCLES}</td>
         </tr>
      `;
        });

        $('#' + this.boxID + ' #assembly').html(html);
        if (
            this.assembleyData.length === 0 ||
            this.assembleyData === [] ||
            this.assembleyData === null ||
            this.assembleyData === undefined
        ) {
            $('#' + this.boxID + ' #assembly').html(this.nodeDataHtml);
        }
        $('#' + this.boxID + ' .toggle').on('click', (e) => {
            this.toggle(e);
        });
        const self = this;
        $('#' + this.boxID + ' .righttr').on('click', () => {
            const line = $(this).attr('line');
            if (self.assemblyTarget !== '') {
                $('#' + self.boxID + ' .righttr.active').removeClass('active');
            }
            $(this).addClass('active');
            self.assemblyTarget = $(this).attr('id');
            self.scrorllLeft(line);
        });
    }

    /**
     * preBlock
     * @param dirction dirction
     */
    public preBlock(dirction) {
        const a = $('#' + this.boxID + ' #assembly tr.active');
        let b = $('#' + this.boxID + ' #assembly tr.active');
        if (a.length > 0) {

            for (const i of Object.keys(this.assembleyData)) {
                if (dirction === 'pre') {
                    b = b.prev();
                } else {
                    b = b.next();
                }
                if (b.attr('hasBlock') === 'y' && b.attr('hasCount') === 'y') {
                    a.removeClass('active');
                    b.addClass('active');
                    b[0].scrollIntoView();
                    this.scrorllLeft(b.attr('line'));
                    break;
                }
            }
        } else {
            const node = $('#' + this.boxID + ' #assembly [hasBlock=y]');
            let target;

            for (const nodeItem of node) {
                if ($(nodeItem).attr('hasCount') === 'y') {
                    target = nodeItem;
                    break;
                }
            }

            $(target).addClass('active');
            target.scrollIntoView();
            this.scrorllLeft($(target).attr('line'));
        }
    }
    /**
     * nextBlock
     */
    public nextBlock() { }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.boxID = Utils.generateConversationId(16);
        this.nodeDataHtml =
            `<tr class='no-data'>
            <td class='chen-nodata-td'><img src='./assets/img/projects/nodata-dark.png' /><div>` +
            this.i18n.common_term_task_nodata +
            `</div></td></tr>`;
        this.columns = [
            {
                title: this.i18n.common_term_task_tab_function_source_line,
                width: '30%',
            },
            {
                title: this.i18n.common_term_task_tab_function_source_code,
                width: '40%',
            },
            {
                title: this.i18n.common_term_task_tab_function_count,
                width: '30%',
            },
        ];
        this.columnsTree = [
            {
                title: this.i18n.common_term_task_tab_function_assembley_address,
            },
            {
                title: this.i18n.common_term_task_tab_function_assembley_line,
            },
            {
                title: this.i18n.common_term_task_tab_function_assembley_code,
            },
            {
                title: this.i18n.common_term_task_tab_function_count,
            },
        ];
    }
    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
        this.querySourceCode();
    }
    // pArray: 父级数据， pLevel: 父级层数
    // 将有层级结构的数据扁平化
    private getTreeTableArr(
        pArray: Array<any>,
        pLevel?: number,
        pId?: any
    ): Array<any> {
        let tableArr: Array<any> = [];
        if (pArray === undefined) {
            return tableArr;
        }
        pLevel = pLevel === undefined ? 0 : pLevel + 1;
        pId = pId === undefined ? 'tiTableRoot' : pId;

        let temp: any;
        for (const item of pArray) {
            temp = this.deepClone(item);
            delete temp.children;
            temp.level = pLevel;
            temp.isShow = true;
            temp.pId = pId;
            temp.hasChildren = false;
            tableArr.push(temp); // 也可以在此循环中做其他格式化处理
            if (item.children && item.children.length) {
                temp.hasChildren = true;
                temp.expand = true;
                tableArr = tableArr.concat(
                    this.getTreeTableArr(item.children, pLevel, temp.id)
                );
            }
        }
        return tableArr;
    }

    /**
     * escapeHtml
     * @param strings strings
     */
    public escapeHtml(strings) {
        const entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;',
            '/': '&#x2F;',
        };
        return String(strings).replace(/[&<>"'\/]/g, (s) => {
            return entityMap[s];
        });
    }
    /**
     * toggle
     * @param e e
     */
    public toggle(e): void {
        const index = $(e.target).parent().parent().parent().attr('id');
        let open = $(e.target).attr('isopen');
        const node = this.saveAssembleyData[index];
        open === 'true' ? (open = 'false') : (open = 'true');
        if (open === 'true') {
            $(e.target).parent().addClass('active');
        } else {
            $(e.target).parent().removeClass('active');
        }
        $(e.target).attr('isopen', open);

        this.toggleChildren(this.assembleyData, node.id, open);
    }

    private toggleChildren(data: Array<any>, pId: any, pExpand): void {
        for (const node of data) {
            if (node.pId === pId) {
                if (pExpand === 'false') {
                    // 折叠时递归处理当前节点的子节点
                    $('#' + node.id).css({ display: 'none' });
                } else {
                    // 展开时递归处理当前节点的子节点

                    $('#' + node.id).css({ display: ' table-row' });
                }
            }
        }
    }

    /**
     * getLevelStyle
     * @param node node
     */
    public getLevelStyle(node: any): { 'padding-left': string } {
        return {
            'padding-left': `${node.level * 18 + 10}px`,
        };
    }

    private deepClone(obj: any): any {
        // 深拷贝，类似于1.x中的angular.copy()
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        let clone: any;

        clone = Array.isArray(obj) ? obj.slice() : { ...obj };

        const keys: Array<string> = Object.keys(clone);

        for (const key of keys) {
            clone[key] = this.deepClone(clone[key]);
        }

        return clone;
    }

    /**
     * sortSource
     * @param sort sort
     * @param key key
     * @param arr arr
     */
    public sortSource(sort, key, arr) {
        if (sort === 'up') {
            arr = arr.sort((a, b) => {
                if (key === 'line') {
                    return a[key] - b[key];
                }
                if (typeof a[key] === 'object') {
                    return a[key].value - b[key].value;
                } else if (typeof a[key] === 'string') {
                    return a[key].localeCompare(b[key]);
                } else {
                    return a[key] - b[key];
                }
            });
        } else {
            arr = arr.sort((a, b) => {
                if (key === 'line') {
                    return b[key] - a[key];
                }
                if (typeof a[key] === 'object') {
                    return b[key].value - a[key].value;
                } else if (typeof a[key] === 'string') {
                    return b[key].localeCompare(a[key]);
                } else {
                    return b[key] - a[key];
                }
            });
        }

        this.initSourceData(arr);
    }

    /**
     * sortAssem
     * @param sort sort
     * @param key key
     * @param arr arr
     */
    public sortAssem(sort, key, arr) {
        if (sort === 'up') {
            arr = arr.sort((a, b) => {
                if (key === 'line') {
                    return a[key] - b[key];
                }
                if (typeof a[key] === 'object') {
                    return a[key].value - b[key].value;
                } else if (typeof a[key] === 'string') {
                    return a[key].localeCompare(b[key]);
                } else {
                    return a[key] - b[key];
                }
            });
        } else {
            arr = arr.sort((a, b) => {
                if (key === 'line') {
                    return b[key] - a[key];
                }
                if (typeof a[key] === 'object') {
                    return b[key].value - a[key].value;
                } else if (typeof a[key] === 'string') {
                    return b[key].localeCompare(a[key]);
                } else {
                    return b[key] - a[key];
                }
            });
        }

        this.initAssemTable();
    }
    /**
     * handleTotal
     * @param headers headers
     */
    public handleTotal(headers) {
        return headers.total === '' ? '--' : headers.total;
    }
}
