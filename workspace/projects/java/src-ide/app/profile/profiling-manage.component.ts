import { Component, OnInit, OnDestroy } from '@angular/core';
import { TiTableSrcData, TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';

@Component({
    selector: 'app-profiling-manage',
    templateUrl: './profiling-manage.component.html',
    styleUrls: ['./profiling-manage.component.scss']
})
export class ProfilingManageComponent implements OnInit, OnDestroy {
    public i18n: any;
    public tableColumns: Array<TiTableColumns>;
    // 在线分析表格属性
    public profilingSrcData: TiTableSrcData;
    public profilingDisplayed: Array<TiTableRowData> = [];
    // 在线分析查询定时器
    private profilingQueryInterval: any;
    // 在线分析表格属性
    public samplingSrcData: TiTableSrcData;
    public samplingDisplayed: Array<TiTableRowData> = [];
    // 采样分析记录id和表格列表项索引
    private samplingIdMap: Map<string, number> = new Map();
    // 采样分析查询定时器
    private samplingQueryInterval: any;

    constructor(private i18nService: I18nService, private vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
        this.tableColumns = [
            {
                title: this.i18n.plugins_perf_java_record_manage.table_head.record_name,
                width: '32%'
            },
            {
                title: this.i18n.plugins_perf_java_record_manage.table_head.record_state,
                width: '20%'
            },
            {
                title: this.i18n.plugins_perf_java_record_manage.table_head.record_time,
                width: '28%'
            },
            {
                title: this.i18n.plugins_perf_java_record_manage.table_head.operation,
                width: '20%',
            },
        ];
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.initProfilingTable();
        this.initSamplingTable();

        this.profilingQueryInterval = setInterval(() => {
            this.queryProfiling();
        }, 1000);
        this.samplingQueryInterval = setInterval(() => {
            this.querySampling();
        }, 1000);
    }

    private initProfilingTable() {
        this.profilingSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };
        this.queryProfiling();
    }

    private initSamplingTable() {
        this.samplingSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };
        this.querySampling();
    }

    /**
     * 查询在线分析记录
     */
    private queryProfiling() {
        this.vscodeService.postMessage({ cmd: 'queryProfiling' }, (data: any) => {
            if (data) {
                if (this.profilingSrcData.data.length === 0) {
                    this.profilingSrcData.data[0] = {};
                }
                this.profilingSrcData.data[0].name = data.name;
                this.profilingSrcData.data[0].state = data.state;
                this.profilingSrcData.data[0].createTime = this.datetimeFormatter(new Date(data.createTime));
            } else {
                this.profilingSrcData.data = [];
            }
        });
    }

    /**
     * 查询采样分析记录
     */
    private querySampling() {
        this.vscodeService.postMessage({ cmd: 'querySampling' }, (data: any) => {
            // 为防止每次查询都刷新整个列表，只能采用稍微复杂点的办法修改列表数组
            // 添加新列表中多出来的
            data.forEach((item: any) => {
                if (!this.samplingIdMap.has(item.id)) {
                    this.samplingIdMap.set(item.id, this.samplingSrcData.data.push({
                        id: item.id,
                        name: item.name,
                        state: item.state,
                        createTime: this.datetimeFormatter(new Date(item.createTime * 1000))
                    }));
                } else {
                    // 更新现有的state
                    const index = this.samplingIdMap.get(item.id);
                    this.samplingSrcData.data[index].state = item.state;
                }
            });
            // 删除旧列表不在新列表里的
            const dataIdSet = new Set(data.map((item: any) => item.id));
            this.samplingSrcData.data.forEach((item, index) => {
                if (!dataIdSet.has(item.id)) {
                    this.samplingSrcData.data.splice(index, 1);
                }
            });
            // 刷新map中的索引
            this.samplingIdMap.clear();
            this.samplingSrcData.data.forEach((item, index) => {
                this.samplingIdMap.set(item.id, index);
            });

        });
    }

    /**
     * 导入在线分析记录
     */
    public importProfiling() {
        this.vscodeService.postMessage({ cmd: 'importProfiling' });
    }

    /**
     * 导出在线分析记录
     */
    public exportProfiling() {
        this.vscodeService.postMessage({ cmd: 'exportProfiling' });
    }

    /**
     * 停止在线分析
     */
    public stopProfiling() {
        this.vscodeService.postMessage({ cmd: 'stopProfiling' });
    }

    /**
     * 导入采样分析记录
     */
    public importSampling() {
        this.vscodeService.postMessage({ cmd: 'importSampling' });
    }

    /**
     * 导出采样分析记录
     */
    public exportSampling(samplingId: string, samplingName: string) {
        this.vscodeService.postMessage({ cmd: 'exportSampling', data: { samplingId, samplingName } });
    }

    /**
     * 删除采样分析记录
     */
    public deleteSampling(samplingId: string) {
        this.vscodeService.postMessage({ cmd: 'deleteSampling', data: { samplingId } });
    }

    /**
     * 时间格式化
     *
     * @param date Date类型时间
     */
    private datetimeFormatter(date: Date) {
        const year = date.getFullYear();
        const mouth = this.padStart(String(date.getMonth() + 1), 2, '0');
        const day = this.padStart(String(date.getDate()), 2, '0');
        const hours = this.padStart(String(date.getHours()), 2, '0');
        const minutes = this.padStart(String(date.getMinutes()), 2, '0');
        const seconds = this.padStart(String(date.getSeconds()), 2, '0');
        return `${year}/${mouth}/${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 字符串补全，在开始位置补全字符串
     *
     * @param origin 源字符串
     * @param length 要填充的长度
     * @param char 要填充的字符
     */
    private padStart(origin: string, length: number, char: string) {
        if (origin.length < length) {
            for (let i = 0; i < length - origin.length; i++) {
                origin = char + origin;
            }
        }
        return origin;
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy() {
        clearInterval(this.profilingQueryInterval);
        clearInterval(this.samplingQueryInterval);
    }
}
