import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import {
  FuncLeakInfo,
  FuncProps,
  FuncReleaseInfo,
  FunctionSourceInfo,
  GetMemoryLeakInfo,
  GetMemoryLeakRelation,
  GetMemoryReleaseInfo,
  MemLeakType, StackNode
} from '../doman';
import { HttpService } from 'sys/src-ide/app/service/http.service';
import { SourceCodeViewerSliderComponent } from '../component/source-code-viewer-slider/source-code-viewer-slider.component';
import { TabSwitchService } from '../service/tab-switch.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-call-tree',
  templateUrl: './call-tree.component.html',
  styleUrls: ['./call-tree.component.scss']
})
export class CallTreeComponent implements OnInit, OnDestroy {

  @ViewChild('sourceCodeSlider') sourceCodeSlider: SourceCodeViewerSliderComponent;

  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() isActive: boolean;

  public pid = '';
  public memLeakType = MemLeakType.leakCount;
  /** 函数名称和属性的映射 */
  public funcMap: { [funcName: string]: any } = {};
  /** 当前激活函数 */
  public currActiveFunc: FuncProps;

  // 调用栈数据列表
  public stackNodeInfoList: Array<Array<StackNode>> = [];

  public memReleaseData: FuncReleaseInfo;
  public memLeakData: FuncLeakInfo;

  public i18n: any;
  private tabSwitchServiceSub: Subscription;

  constructor(
    private i18nService: I18nService,
    private http: HttpService,
    private tabSwitchService: TabSwitchService<any>,
  ) {
    this.i18n = this.i18nService.I18n();

    this.tabSwitchServiceSub = this.tabSwitchService.showSourceSlider.subscribe({
      next: (funcInfo) => {
        if (!this.isActive) { return; }
        if (this.memLeakType === MemLeakType.abnormalRelease) {
          this.getMemAbnormalReleaseFuncSource(funcInfo.function_name).then(functionSourceInfo => {
            this.sourceCodeSlider.open({
              funcName: funcInfo.function_name,
              stack: funcInfo.stack,
              memReleaseType: this.funcMap[funcInfo.function_name]?.selfAbnormalReleaseCount ?
                this.i18n.diagnostic.stack.memLeakTable.memReleaseTableSelf :
                this.i18n.diagnostic.stack.memLeakTable.memReleaseTableChild,
              sourceCodeData: { functionSourceInfo }
            });
          });
        } else {
          this.getMemLeakFuncSource(funcInfo.function_name).then(functionSourceInfo => {
            this.sourceCodeSlider.open({
              funcName: funcInfo.function_name,
              stack: funcInfo.stack,
              memReleaseType: this.funcMap[funcInfo.function_name]?.selfAbnormalReleaseCount ?
                this.i18n.diagnostic.stack.memLeakTable.memReleaseTableSelf :
                this.i18n.diagnostic.stack.memLeakTable.memReleaseTableChild,
              sourceCodeData: { functionSourceInfo }
            });
          });
        }
      }
    });
  }

  ngOnInit(): void {
  }

  /**
   * 获取内存泄露函数源码
   */
  private async getMemLeakFuncSource(funcName: string): Promise<FunctionSourceInfo> {
    const params = {
      functionType: 'mem_leak_function_source',
      nodeId: this.nodeId,
      pid: this.pid,
      function: encodeURIComponent(funcName)
    };
    const resp: any = await this.http.get(
      `/memory-analysis/${this.taskId}/get-memory-function/`,
      { params }
    );
    return resp?.data?.memory_function?.data;
  }

  /**
   * 获取内存异常释放函数源码
   */
  private async getMemAbnormalReleaseFuncSource(funcName: string): Promise<FunctionSourceInfo> {
    const params = {
      memoryRelease: 'mem_release_func_source',
      nodeId: this.nodeId,
      pid: this.pid,
      function: encodeURIComponent(funcName),
      operationType: 'malloc'
    };
    const resp: any = await this.http.get(
      `/memory-analysis/${this.taskId}/get-memory-release/`,
      { params }
    );
    return resp?.data?.memory_release?.data;
  }

  public async handleFuncClick(func: FuncProps) {
    this.currActiveFunc = func;
    if (this.memLeakType !== MemLeakType.abnormalRelease) {
      const funcInfo = await this.getMemLeakFuncInfo(func.funcName);
      this.memLeakData = funcInfo;
      const funcRelation = await this.getMemLeakFuncRelation(func.funcName);
      this.buildStackNodeInfoList(funcRelation);
    } else {
      const funcInfo = await this.getMemAbnormalReleaseFuncInfo(func.funcName);
      this.memReleaseData = funcInfo;
      const funcRelation = await this.getMemAbnormalReleaseRelation(func.funcName);
      this.buildStackNodeInfoList(funcRelation);
    }
  }

  private buildStackNodeInfoList(funcRelation: Array<Array<string>>) {
    const stackNodeInfoList: Array<Array<StackNode>> = [];
    if (!funcRelation.length) { return; }
    const allFuncNames: Map<string, number[]> = new Map();
    for (const stack of funcRelation) {
      for (let row = 0; row < stack.length; row++) {
        const funcName = stack[row];
        const nextFuncName = stack[row + 1];
        if (allFuncNames.has(funcName)) {
          const pos = allFuncNames.get(funcName);
          if (nextFuncName) {
            const posNextFuncNames = stackNodeInfoList[pos[1]][pos[0]].nextNodeFuncNames;
            if (!posNextFuncNames.includes(nextFuncName)) {
              posNextFuncNames.push(nextFuncName);
            }
          }
          continue;
        }
        if (!stackNodeInfoList[row]) {
          stackNodeInfoList[row] = [];
        }
        const newLength = stackNodeInfoList[row].push({
          show: true,
          moduleName: this.funcMap[funcName]?.moduleName || '',
          funcName: funcName || '',
          leakType: this.funcMap[funcName]?.leakType || [0, 0, 0, 0, 0, 0],
          childLeakCount: this.funcMap[funcName]?.childLeakCount || 0,
          selfLeakCount: this.funcMap[funcName]?.selfLeakCount || 0,
          childLeakSize: this.funcMap[funcName]?.childLeakSize || 0,
          selfLeakSize: this.funcMap[funcName]?.selfLeakSize || 0,
          childAbnormalReleaseCount: this.funcMap[funcName]?.childAbnormalReleaseCount || 0,
          selfAbnormalReleaseCount: this.funcMap[funcName]?.selfAbnormalReleaseCount || 0,
          nextNodeFuncNames: nextFuncName ? [nextFuncName] : [],
        });
        allFuncNames.set(funcName, [newLength - 1, row]);
      }
    }
    this.stackNodeInfoList = stackNodeInfoList.filter(Boolean);
  }

  /**
   * 获取内存泄露函数信息
   */
  private async getMemLeakFuncInfo(funcName: string) {
    const params = {
      memoryLeak: 'mem_leak_function_info',
      nodeId: this.nodeId,
      pid: this.pid,
      function: encodeURIComponent(funcName)
    };
    const resp: GetMemoryLeakInfo = await this.http.get(
      `/memory-analysis/${this.taskId}/get-memory-leak/`,
      { params }
    );
    return resp?.data?.memory_leak?.data;
  }

  /**
   * 获取内存泄露函数调用栈信息
   */
  private async getMemLeakFuncRelation(funcName: string) {
    const params = {
      memoryLeak: 'mem_leak_function_relation',
      nodeId: this.nodeId,
      pid: this.pid,
      function: encodeURIComponent(funcName)
    };
    const resp: GetMemoryLeakRelation = await this.http.get(
      `/memory-analysis/${this.taskId}/get-memory-leak/`,
      { params }
    );
    return resp?.data?.memory_leak?.data;
  }

  /**
   * 获取内存异常释放函数信息
   */
  private async getMemAbnormalReleaseFuncInfo(funcName: string) {
    const params = {
      memoryRelease: 'mem_release_func_info',
      nodeId: this.nodeId,
      pid: this.pid,
      function: encodeURIComponent(funcName)
    };
    const resp: GetMemoryReleaseInfo = await this.http.get(
      `/memory-analysis/${this.taskId}/get-memory-release/`,
      { params }
    );
    return resp?.data?.memory_release?.data;
  }

  /**
   * 获取内存异常释放函数调用栈信息
   */
  private async getMemAbnormalReleaseRelation(funcName: string) {
    const params = {
      memoryRelease: 'mem_release_func_relationship',
      nodeId: this.nodeId,
      pid: this.pid,
      function: encodeURIComponent(funcName)
    };
    const resp: any = await this.http.get(
      `/memory-analysis/${this.taskId}/get-memory-release/`,
      { params }
    );
    return resp?.data?.memory_release?.data;
  }

  ngOnDestroy(): void {
    this.tabSwitchServiceSub.unsubscribe();
  }

}
