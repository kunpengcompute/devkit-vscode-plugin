import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import {
    GetMemoryLeakTimes, ProcessLeakTimesStack,
    GetMemoryLeakSize, ProcessLeakSizeStack,
    GetMemoryRelease, ProcessReleaseStack,
    MemLeakType, FuncProps
} from '../../doman';
import { HttpService } from 'sys/src-ide/app/service/http.service';
import { TabSwitchService } from 'sys/src-ide/app/mission-analysis/diagnose-leak-detail/service/tab-switch.service';

@Component({
    selector: 'app-mem-leak-func-list',
    templateUrl: './mem-leak-func-list.component.html',
    styleUrls: ['./mem-leak-func-list.component.scss']
})
export class MemLeakFuncListComponent implements OnInit, OnChanges {

    @Input() taskId: number;
    @Input() nodeId: number;
    @Input() memType: string;
    @Input() currActiveFunc: FuncProps;
    /** 列表状态更新标志，当变更的时候从TabSwitchService读取值刷新整个列表状态 */
    @Input() updateTree: number;
    /** 组件状态是否更新到service */
    @Input() isUpdateService = true;
    @Output() functionClick = new EventEmitter<FuncProps>();
    @Output() pidChange = new EventEmitter<string>();
    @Output() memLeakTypeChange = new EventEmitter<MemLeakType>();
    /** 初始化完成后，返回函数名称和属性映射对象 */
    @Output() listInited = new EventEmitter<{ [funcName: string]: any }>();

    public i18n: any;
    // 选择进程
    public pidSelectOptions: Array<{ label: string, pid: string }> = [];
    public pid: string;

    // 选择内存泄露次数、内存泄露大小、内存异常释放次数
    public memLeakSelectOptions: Array<any> = [];
    public memLeakType = MemLeakType.leakCount;

    public searchKeyword: string;
    public isSelf = true;
    public sort: 'asc' | 'desc' | 'none' = 'none';
    public activeFunc: string;
    /** 函数列表数据 */
    public funcList: { [pid: string]: { [type: number]: Array<FuncProps> } } = {};
    public funcListDisplay: Array<FuncProps> = [];
    public exceptionFunList: any = [];
    public noFuncText: string[];
    /** 函数名称和属性的映射 */
    private funcMap: { [funcName: string]: any } = {};

    // 内存异常访问
    public exceptionPidList: any = [];
    public exPid: string;

    constructor(
        private i18nService: I18nService,
        private http: HttpService,
        private tabSwitchService: TabSwitchService<any>,
    ) {
        this.i18n = this.i18nService.I18n();
        this.memLeakSelectOptions = [
            { label: this.i18n.diagnostic.memException.memLeakTimes, value: MemLeakType.leakCount },
            { label: this.i18n.diagnostic.memException.memLeakSize, value: MemLeakType.leakSize },
            { label: this.i18n.diagnostic.memException.memAbnormalRelease, value: MemLeakType.abnormalRelease },
        ];
        this.noFuncText = [
            this.i18n.diagnostic.noLeak,
            this.i18n.diagnostic.noLeak,
            this.i18n.diagnostic.noAbnormalRelease,
            this.i18n.diagnostic.noException,
        ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currActiveFunc && changes.currActiveFunc.currentValue) {
            this.activeFunc = this.currActiveFunc.funcName;
            if (!this.funcListDisplay.find(item => item.funcName === this.activeFunc)) {
                this.filterFuncList(false);
            }
        }
        if (changes.updateTree) {
            this.pid = this.tabSwitchService.memLeakFuncListStatus.pid;
            this.memLeakType = this.tabSwitchService.memLeakFuncListStatus.memLeakType;
            this.isSelf = this.tabSwitchService.memLeakFuncListStatus.isSelf;
            this.sort = this.tabSwitchService.memLeakFuncListStatus.sort;
            this.activeFunc = this.tabSwitchService.memLeakFuncListStatus.activeFunc;
            this.searchKeyword = this.tabSwitchService.memLeakFuncListStatus.searchKeyword;
            this.funcListDisplay = this.funcListFilter(
              this.pid,
              this.memLeakType,
              this.isSelf,
              this.sort,
              this.searchKeyword
            );
        }
    }

    async ngOnInit() {
        if (this.isUpdateService) {
            this.tabSwitchService.memLeakFuncListStatus = this;
        }
        if (this.memType === 'mem_exception') {
            this.memLeakType = MemLeakType.exception;
            this.exceptionPidList = this.getExceptionPidList();
            return;
        }
        // 初始化列表
        await this.initMemLeakCount();
        await this.initMemLeakSize();
        await this.initMemAbnormalRelease();

        this.pid = this.pidSelectOptions[0]?.pid;

        if (this.pid) {
            this.pidChange.emit(this.pid);
            this.funcListDisplay = this.funcListFilter(this.pid, this.memLeakType);
        } else {
            this.noFuncText[0] = this.i18n.diagnostic.noLeakApp;
            this.noFuncText[1] = this.i18n.diagnostic.noLeakApp;
        }
        this.listInited.emit(this.funcMap);
    }

    /**
     * 初始化内存泄露次数数据
     */
    private async initMemLeakCount() {
        const resp: GetMemoryLeakTimes = await this.http.get(
            `/memory-analysis/${this.taskId}/get-memory-leak/?memoryLeak=mem_leak_times&nodeId=${this.nodeId}`,
        );
        if (resp?.data?.memory_leak?.status === 0) {
            const memLeakCountData = resp.data.memory_leak.data;
            this.initPidSelectOptions(memLeakCountData);
            this.initFuncMemLeakCountList(memLeakCountData);
        }
    }

    /**
     * 初始化进程选择列表
     */
    private initPidSelectOptions(data: any) {
        for (const pid of Object.keys(data)) {
            if (this.pidSelectOptions.find(item => (+item.pid === +pid))) {
                continue;
            }
            this.pidSelectOptions = this.pidSelectOptions.concat({
                label: pid + '/' + data[pid].process_name,
                pid
            });
        }
    }

    private initFuncMemLeakCountList(memLeakCountData: ProcessLeakTimesStack) {
        for (const pid of Object.keys(memLeakCountData)) {
            this.funcList[pid] = this.funcList[pid] || [];
            const pidMemLeakCount = memLeakCountData[pid].stack;
            this.funcList[pid][MemLeakType.leakCount] = [];
            pidMemLeakCount.forEach(item => {
                this.funcList[pid][MemLeakType.leakCount].push({
                    funcName: item.func_name,
                    childLeakCount: item.child_leak_times || 0,
                    selfLeakCount: item.self_leak_times || 0,
                    isSelf: !!item.self_leak_times
                });
                if (!this.funcMap[item.func_name]) {
                    this.funcMap[item.func_name] = {};
                }
                this.funcMap[item.func_name].funcName = item.func_name;
                this.funcMap[item.func_name].childLeakCount = item.child_leak_times;
                this.funcMap[item.func_name].selfLeakCount = item.self_leak_times;
            });
        }
    }

    /**
     * 初始化内存泄露大小数据
     */
    private async initMemLeakSize() {
        const resp: GetMemoryLeakSize = await this.http.get(
            `/memory-analysis/${this.taskId}/get-memory-leak/?memoryLeak=mem_leak_size&nodeId=${this.nodeId}`,
        );
        if (resp?.data?.memory_leak?.status === 0) {
            const memLeakSizeData = resp.data.memory_leak.data;
            this.initFuncMemLeakSizeList(memLeakSizeData);
        }
    }

    private initFuncMemLeakSizeList(memLeakSizeData: ProcessLeakSizeStack) {
        for (const pid of Object.keys(memLeakSizeData)) {
            this.funcList[pid] = this.funcList[pid] || [];
            const pidMemLeakSize = memLeakSizeData[pid].stack;
            this.funcList[pid][MemLeakType.leakSize] = [];
            pidMemLeakSize.forEach(item => {
                this.funcList[pid][MemLeakType.leakSize].push({
                    funcName: item.func_name,
                    childLeakSize: item.child_leak_size || '',
                    selfLeakSize: item.self_leak_size || '',
                    isSelf: !!item.self_leak_size
                });
                if (!this.funcMap[item.func_name]) {
                    this.funcMap[item.func_name] = {};
                }
                this.funcMap[item.func_name].funcName = item.func_name;
                this.funcMap[item.func_name].childLeakSize = item.child_leak_size;
                this.funcMap[item.func_name].selfLeakSize = item.self_leak_size;
            });
        }
    }

    /**
     * 初始化内存异常释放数据
     */
    private async initMemAbnormalRelease() {
        const resp: GetMemoryRelease = await this.http.get(
            `/memory-analysis/${this.taskId}/get-memory-release/?memoryRelease=mem_release_times&nodeId=${this.nodeId}`,
        );
        if (resp?.data?.memory_release?.status === 0) {
            const memAbnormalReleaseData = resp.data.memory_release.data;
            this.initPidSelectOptions(memAbnormalReleaseData);
            this.initFuncAbnormalReleaseList(memAbnormalReleaseData);
        }
    }

    private initFuncAbnormalReleaseList(memAbnormalReleaseData: ProcessReleaseStack) {
        for (const pid of Object.keys(memAbnormalReleaseData)) {
            this.funcList[pid] = this.funcList[pid] || [];
            const pidMemAbnormalRelease = memAbnormalReleaseData[pid];
            this.funcList[pid][MemLeakType.abnormalRelease] = [];
            pidMemAbnormalRelease.forEach(item => {
                this.funcList[pid][MemLeakType.abnormalRelease].push({
                    isSelf: !!item[2],
                    moduleName: item[0],
                    funcName: item[1],
                    leakType: item[4],
                    childAbnormalReleaseCount: item[3] || 0,
                    selfAbnormalReleaseCount: item[2] || 0,
                });
                if (!this.funcMap[item[1]]) {
                    this.funcMap[item[1]] = {};
                }
                this.funcMap[item[1]].moduleName = item[0];
                this.funcMap[item[1]].funcName = item[1];
                this.funcMap[item[1]].leakType = item[4];
                this.funcMap[item[1]].childAbnormalReleaseCount = +item[3];
                this.funcMap[item[1]].selfAbnormalReleaseCount = +item[2];
            });
        }
    }

    /**
     * 输出列表项点击事件
     */
    public handleFuncClick(func: FuncProps) {
        this.activeFunc = func.funcName;
        this.functionClick.emit(func);
    }

    /**
     * 根据情况返回列表节点左侧数字
     */
    public getNodeLeftText(funcProps: FuncProps) {
        if (this.memLeakType === 3) {
            return funcProps.exceptionDteail.length;
        }
        let leakCount: string | number = '';
        let leakSize: string | number = '';
        let abnormalReleaseCount: string | number = '';
        if (funcProps.selfLeakCount && funcProps.childLeakCount) {
            leakCount = funcProps.selfLeakCount + '/' + funcProps.childLeakCount;
        } else {
            leakCount = funcProps.selfLeakCount || funcProps.childLeakCount;
        }
        if (funcProps.selfLeakSize && funcProps.childLeakSize) {
            leakSize = funcProps.selfLeakSize + '/' + funcProps.childLeakSize;
        } else {
            leakSize = funcProps.selfLeakSize || funcProps.childLeakSize;
        }
        if (funcProps.selfAbnormalReleaseCount && funcProps.childAbnormalReleaseCount) {
            abnormalReleaseCount = funcProps.selfAbnormalReleaseCount + '/' + funcProps.childAbnormalReleaseCount;
        } else {
            abnormalReleaseCount = funcProps.selfAbnormalReleaseCount || funcProps.childAbnormalReleaseCount;
        }
        const leftTextArray = [
            leakCount,
            leakSize,
            abnormalReleaseCount,
        ];
        return leftTextArray[this.memLeakType];
    }

    /**
     * 根据是否自身泄露过滤函数列表
     *
     * @param filterMode 是否只显示自身泄露
     */
    public filterFuncList(filterMode: boolean) {
        this.isSelf = filterMode;
        this.funcListDisplay = this.funcListFilter(
          this.pid,
          this.memLeakType,
          this.isSelf,
          this.sort,
          this.searchKeyword
        );
    }

    public sortFuncList() {
        if (this.sort === 'none') {
            this.sort = 'asc';
        } else if (this.sort === 'asc') {
            this.sort = 'desc';
        } else {
            this.sort = 'none';
        }
        this.funcListDisplay = this.funcListFilter(
          this.pid,
          this.memLeakType,
          this.isSelf,
          this.sort,
          this.searchKeyword
        );
    }

    // 搜索函数
    public handleFuncNameSearch(searchKeyword: string) {
        this.searchKeyword = searchKeyword;
        this.funcListDisplay = this.funcListFilter(
          this.pid,
          this.memLeakType,
          this.isSelf,
          this.sort,
          this.searchKeyword
        );
    }

    // 清空搜索框
    public handleFuncNameClear(): void {
        this.searchKeyword = '';
        this.funcListDisplay = this.funcListFilter(
          this.pid,
          this.memLeakType,
          this.isSelf,
          this.sort,
          this.searchKeyword
        );
    }

    public handlePidChange(pid: string) {
        this.pidChange.emit(pid);
        this.funcListDisplay = this.funcListFilter(
          this.pid,
          this.memLeakType,
          this.isSelf,
          this.sort,
          this.searchKeyword
        );
    }

    public handleMemLeakTypeChange(memLeakType: MemLeakType) {
        this.memLeakTypeChange.emit(memLeakType);
        this.funcListDisplay = this.funcListFilter(
          this.pid,
          this.memLeakType,
          this.isSelf,
          this.sort,
          this.searchKeyword
        );
    }

    /**
     * 基于全部的条件对数据进行过滤
     */
    private funcListFilter(
        pid: string,
        memLeakType: MemLeakType,
        isSelf: boolean = true,
        sort: 'asc' | 'desc' | 'none' = 'none',
        searchKeyword: string = ''
    ) {
        if (!this.funcList[pid]?.[memLeakType] || this.funcList[pid]?.[memLeakType].length === 0) {
            return [];
        }
        let filterdFuncList: FuncProps[] = JSON.parse(JSON.stringify(this.funcList[pid][memLeakType]));
        switch (sort) {
            case 'asc':
                filterdFuncList.sort((item1, item2) => {
                    if (memLeakType === MemLeakType.leakCount) {
                        return ((item1.selfLeakCount + item1.childLeakCount)
                            - (item2.selfLeakCount + item2.childLeakCount));
                    } else if (memLeakType === MemLeakType.leakSize) {
                        return ((this.computedByteSize(item1.selfLeakSize) + this.computedByteSize(item1.childLeakSize))
                            - (this.computedByteSize(item2.selfLeakSize) + this.computedByteSize(item2.childLeakSize)));
                    } else {
                        return ((item1.selfAbnormalReleaseCount + item1.childAbnormalReleaseCount)
                            - (item2.selfAbnormalReleaseCount + item2.childAbnormalReleaseCount));
                    }
                });
                break;
            case 'desc':
                filterdFuncList.sort((item1, item2) => {
                    if (memLeakType === MemLeakType.leakCount) {
                        return ((item2.selfLeakCount + item2.childLeakCount)
                            - (item1.selfLeakCount + item1.childLeakCount));
                    } else if (memLeakType === MemLeakType.leakSize) {
                        return ((this.computedByteSize(item2.selfLeakSize) + this.computedByteSize(item2.childLeakSize))
                            - (this.computedByteSize(item1.selfLeakSize) + this.computedByteSize(item1.childLeakSize)));
                    } else {
                        return ((item2.selfAbnormalReleaseCount + item2.childAbnormalReleaseCount)
                            - (item1.selfAbnormalReleaseCount + item1.childAbnormalReleaseCount));
                    }
                });
                break;
            default: break;
        }
        if (isSelf) {
            filterdFuncList = filterdFuncList.filter(item => (item.isSelf));
        }
        if (searchKeyword) {
            filterdFuncList = filterdFuncList.filter(item => (item.funcName.includes(searchKeyword)));
        }
        return filterdFuncList;
    }

    private computedByteSize(size: string) {
        const numRegexp = /[\d\.\-]+/;
        const num = +numRegexp.exec(size || '0')[0] || 0;
        if (size.includes('K')) {
            return num * 1024;
        } else if (size.includes('M')) {
            return num * 1024 * 1024;
        } else if (size.includes('G')) {
            return num * 1024 * 1024 * 1024;
        } else {
            return num;
        }
    }

    /**
     * 获取内存异常访问PID列表
     */
    public async getExceptionPidList() {
        const resp: any = await this.http.get(
            `/memory-analysis/${this.taskId}/pid-list/?nodeId=${this.nodeId}&type=mem-exception`,
        );
        const keyList = resp.data.memory_pid.data.title;
        const valueList = resp.data.memory_pid.data.data;
        if (!valueList.length) { return; }
        const pidList: any = [];
        valueList.forEach((item: string, index: number) => {
            const pidItem: any = {};
            keyList.forEach((key: string, idx: number) => {
                pidItem[keyList[idx]] = item[idx];
            });
            pidList.push(pidItem);
        });
        this.exceptionPidList = pidList;
        this.exceptionPidList.forEach((el: any) => {
            el.label = `${el.pid}/${el.process}`;
        });
        this.exPid = this.exceptionPidList[0];
        this.getExceptionFun(pidList[0].pid, pidList[0].process);
    }

    public async getExceptionFun(currentPid: number, process: string) {
        const resp: any = await this.http.get(
            `/memory-analysis/${this.taskId}/exception-info/?nodeId=${this.nodeId}&pid=${currentPid}`,
        );
        const valueList = resp.data.exception_info.data.data;
        const keyList = resp.data.exception_info.data.title;
        const funcObj: any = {};
        const functionDisplay: Array<FuncProps> = [];
        Object.keys(valueList).forEach((key: string) => {
            const funList: any = [];
            valueList[key].forEach((item: string, index: number) => {
                const pidItem: any = {};
                keyList.forEach((titleKey: string, idx: number) => {
                    pidItem[keyList[idx]] = item[idx];
                });
                funList.push(pidItem);
            });
            funcObj.key = funList;
            const funArr: FuncProps = {
                funcName: key.split('|')[0],
                moduleName: key.split('|')[1],
                exceptionDteail: funList
            };
            functionDisplay.push(funArr);
        });
        this.funcListDisplay = functionDisplay;
        this.handleFuncClick(functionDisplay[0]);
    }

    public exceptionPidChange(event: any) {
        this.getExceptionFun(event.pid, event.process);
    }
}
