import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TableService } from '../../../../service/table.service';
import { VscodeService } from '../../../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-hpc-top-down',
    templateUrl: './hpc-top-down.component.html',
    styleUrls: ['./hpc-top-down.component.scss']
})
export class HpcTopDownComponent implements OnInit {
    @Input() projectName: string;
    @Input() taskName: string;
    @Input() analysisType: string;
    @Input() taskId: number;
    @Input() nodeId: number;
    public i18n: any;
    public isTable = '';
    public displayed: Array<TiTableRowData>;
    public srcData: TiTableSrcData;
    public columns: Array<TiTableColumns>;
    public levelIndex = 0;
    public topDownData: any = [];
    public echartsData: any;
    public imgObj = {
        chart: {
            url: './assets/img/micarch/chart_selected_dark.svg',
            isTable: true
        },
        table: {
            url: './assets/img/micarch/table_dark.svg',
            isTable: false
        }
    };
    public isTableType = false;
    public onIcicleHeightChange: any = 600;

    constructor(
        public sanitizer: DomSanitizer,
        private tableService: TableService,
        private i18nService: I18nService,
        public vscodeService: VscodeService,
        private el: ElementRef,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    /**
     * 初始化
     */
    ngOnInit() {
        this.columns = [
            { title: this.i18n.mission_modal.hpc.hpc_target.event_name, width: '50%' },
            { title: this.i18n.mission_modal.hpc.hpc_target.event_rate, width: '50%' }
        ];
        this.srcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.getTopDownData();
    }
    /**
     * 鼠标移入
     * @param type 类型
     */
    public mouseEnterChange(type: string) {
        if (type === 'chart') {
            this.imgObj.chart.url = './assets/img/micarch/chart_hover_dark.svg';
        } else {
            this.imgObj.table.url = './assets/img/micarch/table_hover_dark.svg';
        }
    }
    /**
     * 鼠标移出
     * @param type 类型
     */
    public mouseLeaveChange(type: string) {
        if (type === 'chart') {
            if (this.imgObj.chart.isTable) {
                this.imgObj.chart.url = './assets/img/micarch/chart_selected_dark.svg';
            } else {
                this.imgObj.chart.url = './assets/img/micarch/chart_dark.svg';
            }
        } else {
            if (this.imgObj.table.isTable) {
                this.imgObj.table.url = './assets/img/micarch/table_selected_dark.svg';
            } else {
                this.imgObj.table.url = './assets/img/micarch/table_dark.svg';
            }
        }
    }
    /**
     * 选中
     * @param type 类型
     */
    public mouseClickChange(type: string) {
        if (type === 'chart') {
            this.imgObj.chart = {
                url: './assets/img/micarch/chart_selected_dark.svg',
                isTable: true
            };
            this.imgObj.table = {
                url: './assets/img/micarch/table_dark.svg',
                isTable: false
            };
        } else {
            this.imgObj.table = {
                url: './assets/img/micarch/table_selected_dark.svg',
                isTable: true
            };
            this.imgObj.chart = {
                url: './assets/img/micarch/chart_dark.svg',
                isTable: false
            };
        }
    }
    /**
     * 获取数据
     */
    public getTopDownData() {
        const option = {
            url: `/tasks/${this.taskId}/hpc-analysis/topdown/?node-id=${this.nodeId}&query-type=top-down`,
        };
        this.vscodeService.get(option, (res: any) => {
            if (res.data.hpc.data) {
                this.topDownData = res.data.hpc.data;
                this.srcData.data = this.getTopDown(this.topDownData, this.levelIndex);
                this.echartsData = {
                    children: this.srcData.data,
                    expand: true,
                    levelIndex: 0,
                    name: this.i18n.mission_modal.hpc.hpc_target.hpc_top_down,
                    proportion: 100
                };
                this.isTable = 'chart';
            }
        });
    }
    /**
     * 数据处理
     */
    public getTopDown(data: [], index: number): any {
        const levelIndex = index;
        data.map((item: any) => {
            item.levelIndex = levelIndex;
            item.proportion = Number(item.value.replace('%', '').trim());
            item.max = true;
            if (item.hasOwnProperty('children')) {
                item.expand = false;
                this.getTopDown(item.children, levelIndex + 1);
            }
        });
        return data;
    }
    /**
     * 表格展开
     */
    public toggle(node: any) {
        node.expand = !node.expand;
        this.srcData.data = this.tableService.getTreeTableArr(this.topDownData);
    }

    public changeHeight(msg: any) {
      this.onIcicleHeightChange = msg;
      const svgDom = this.el.nativeElement.querySelector('#echartsSvg');
      svgDom.style.height = `${msg}px`;
    }
}
