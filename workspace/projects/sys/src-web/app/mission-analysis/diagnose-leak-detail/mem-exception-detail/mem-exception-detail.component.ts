import { Component, Input, OnInit } from '@angular/core';
import { LeftShowService } from '../../../service/left-show.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { FuncProps } from '../doman';
import { I18nService } from 'projects/sys/src-web/app/service';

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
    public nodataDiaplay = true;
    constructor(
        private leftShowService: LeftShowService,
        private Axios: AxiosService,
        private i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    ngOnInit(): void {
        this.getExceptionPidList();
    }
    public chart() {
        this.isTable = !this.isTable;
        this.leftShowService.leftIfShow.next();
    }

    /**
     * 获取源码数据
     */
    public async getExceptionFunSource(pid: number, funcName: string, moduleName?: string) {
        const func = `${funcName}|${moduleName}`;
        const resp: any = await this.Axios.axios.get(
            `/memory-analysis/${this.taskId}/exception-source-info/?nodeId=${this.nodeId}&pid=${pid}&function=${func}`,
        );
        const respData = resp.data.exception_source_info.data;
        const accessLine: any = [];
        if (respData.access_line){
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
                selfline: accessLine.reduce((obj: any, line: any) => {
                    obj[line] = respData.access_line[line]; return obj;
                }, {}),
                sourcecode: respData.source_code
            }
        };
    }

    public handleFuncClick(func: FuncProps) {
        this.tabListData = func;
        this.getExceptionFunSource(func.exceptionDteail[0].pid, func.funcName, func.moduleName);
    }
    public async getExceptionPidList() {
        const resp: any = await this.Axios.axios.get(
            `/memory-analysis/${this.taskId}/pid-list/?nodeId=${this.nodeId}&type=mem-exception`,
        );
        const valueList = resp.data.memory_pid.data.data;
        this.nodataDiaplay = valueList?.length > 0 ? false : true;
    }
}
