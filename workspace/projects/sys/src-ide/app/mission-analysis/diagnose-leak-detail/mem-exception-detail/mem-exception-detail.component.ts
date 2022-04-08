import { Component, Input, OnInit } from '@angular/core';
import { LeftShowService } from '../../../service/left-show.service';
import { FuncProps } from '../doman';
import {VscodeService, COLOR_THEME, currentTheme} from '../../../service/vscode.service';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';

@Component({
    selector: 'app-mem-exception-detail',
    templateUrl: './mem-exception-detail.component.html',
    styleUrls: ['./mem-exception-detail.component.scss']
})
export class MemExceptionDetailComponent implements OnInit {
    @Input() taskId: number;
    @Input() nodeId: number;
    @Input() isActive: boolean;
    @Input() diagnosticType: number;
    public i18n: any;
    public isTable = false;
    public sourceCodeData: any;
    public tabListData: any;
    constructor(
        private vscodeService: VscodeService,
        private leftShowService: LeftShowService,
        private i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public nodataDisplay = 'loading';
    public currTheme: any;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    ngOnInit(): void {
        this.currTheme = currentTheme();
        this.getExceptionPidList();
    }

    /**
     * 获取源码数据
     */
    public async getExceptionFunSource(pid: number, funcName: string, moduleName?: string) {
        const func = `${funcName}|${moduleName}`;
        const resp1: any = await this.vscodeService.get({
            url: `/memory-analysis/${
                this.taskId}/exception-source-info/?nodeId=${this.nodeId}&pid=${pid}&function=${func}` },
            (resp: any) => {
                const respData = resp.data.exception_source_info.data;
                const accessLine: any = [];
                if (respData.access_line) {
                    Object.keys(respData.access_line).forEach((key: string) => {
                        accessLine.push(key);
                    });
                }
                this.sourceCodeData = {
                    currActiveFunc: {
                        funcName,
                        moduleName,
                    },
                    functionSourceInfo: {
                        childline: {},
                        selfline: accessLine.reduce((obj: any, line: any) => { obj[line] = 0; return obj; }, {}),
                        sourcecode: respData.source_code
                    }
                };
            });
    }

    public handleFuncClick(func: FuncProps) {
        this.tabListData = func;
        this.getExceptionFunSource(func.exceptionDteail[0].pid, func.funcName, func.moduleName);
    }

    public chart() {
        this.isTable = !this.isTable;
        this.leftShowService.leftIfShow.next();
    }

    public async getExceptionPidList() {
        const resp1 = await this.vscodeService.get({
            url: `/memory-analysis/${this.taskId}/pid-list/?nodeId=${this.nodeId}&type=mem-exception`,
        }, (resp: { data: { memory_pid: { data: { title: any; data: any; }; }; }; }) => {
            const valueList = resp.data.memory_pid.data.data;
            this.nodataDisplay = valueList?.length > 0 ? 'isData' : 'isNoData';
        });
        return resp1;
    }
}
