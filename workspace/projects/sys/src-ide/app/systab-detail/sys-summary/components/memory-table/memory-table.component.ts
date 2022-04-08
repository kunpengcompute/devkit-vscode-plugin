import { Component, OnInit, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../../../service/i18n.service';
import {COLOR_THEME, currentTheme, VscodeService} from '../../../../service/vscode.service';

@Component({
    selector: 'app-memory-table',
    templateUrl: './memory-table.component.html',
    styleUrls: ['./memory-table.component.scss']
})
export class MemoryTableComponent implements OnInit {
    @Input() memoryData: any;
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    // 内存子系统 DIMM列表
    public DIMMListTitle: Array<TiTableColumns> = [];
    public DIMMListDisplayData: Array<TiTableRowData> = [];
    public DIMMListContentData: TiTableSrcData;
    public DIMMCurrentPage = 1;
    public DIMMPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public DIMMTotalNumber = 0;
    public ifDIMMList = true;
    public DIMMList = '';

    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    constructor(public i18nService: I18nService, public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // 内存子系统表格title
        this.DIMMList = this.i18n.common_term_task_nodata2;
        this.DIMMListTitle = [
            {
                title: this.i18n.sys_cof.sum.mem_info.slot_site,
            },
            {
                title: this.i18n.sys_cof.sum.mem_info.mem_cap,
            },
            {
                title: this.i18n.sys_cof.sum.mem_info.max_t,
            },
            {
                title: this.i18n.sys_cof.sum.mem_info.match_t,
            },
            {
                title: this.i18n.sys_summary.mem_subsystem.tip.dimm_type,
            }
        ];
        if (JSON.stringify(this.memoryData) !== '{}') {
            this.getMemoryData(this.memoryData);
        }
    }

    /**
     * 获取数据长度
     * @param data 数据
     */
    public maxLength(data: any) {
        let num = 0;
        for (const item in data) {
            if (data[item].length > num) {
                num = data[item].length;
            }
        }
        return num;
    }

    /**
     * 内存子系统数据
     * @param data 内存数据
     */
    public getMemoryData(data: any) {
        // 内存子系统 DIMM列表
        const DIMMListData = [];
        for (let i = 0; i < data.dimm.cap.length; i++) {
            const position = data.dimm.pos[i];
            const capacity = data.dimm.cap[i];
            const max = data.dimm.max_speed[i];
            const configRate = data.dimm.cfg_speed[i];
            const type = data.dimm.mem_type[i];
            const obj = {
                position,
                capacity,
                max,
                configRate,
                type
            };
            DIMMListData.push(obj);
        }
        this.DIMMTotalNumber = DIMMListData.length;
        if (DIMMListData.length === 0) {
            this.ifDIMMList = true;
        } else {
            this.ifDIMMList = false;
        }
        this.DIMMListContentData = {
            data: DIMMListData,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }

}
