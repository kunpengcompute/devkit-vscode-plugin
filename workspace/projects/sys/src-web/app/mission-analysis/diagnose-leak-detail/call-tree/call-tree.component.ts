import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service';
import {
  FuncLeakInfo,
  FuncProps,
  FuncReleaseInfo,
  FunctionSourceInfo,
  GetMemoryLeakInfo, GetMemoryLeakRelation,
  GetMemoryReleaseInfo,
  MemLeakType, StackNode
} from '../doman';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
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
    private axiosService: AxiosService,
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
      function: funcName
    };
    const resp: any = await this.axiosService.axios.get(
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
      function: funcName,
      operationType: 'malloc'
    };
    const resp: any = await this.axiosService.axios.get(
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
    if (!funcRelation.length) { return; }
    funcRelation.sort((a, b) => a.length - b.length);
    const activeFuncName = this.currActiveFunc.funcName;
    // 构建当前激活函数的调用栈节点
    const activeStackNode: StackNode = {
      show: true,
      moduleName: this.funcMap[activeFuncName]?.moduleName || '',
      funcName: activeFuncName || '',
      leakType: this.funcMap[activeFuncName]?.leakType || [0, 0, 0, 0, 0, 0],
      childLeakCount: this.funcMap[activeFuncName]?.childLeakCount || 0,
      selfLeakCount: this.funcMap[activeFuncName]?.selfLeakCount || 0,
      childLeakSize: this.funcMap[activeFuncName]?.childLeakSize || 0,
      selfLeakSize: this.funcMap[activeFuncName]?.selfLeakSize || 0,
      childAbnormalReleaseCount: this.funcMap[activeFuncName]?.childAbnormalReleaseCount || 0,
      selfAbnormalReleaseCount: this.funcMap[activeFuncName]?.selfAbnormalReleaseCount || 0,
      nextNodeFuncNames: [],
    };
    // 将当前激活函数信息初始化的时候填入
    const stackNodeInfoListPrev: Array<Array<StackNode>> = [[activeStackNode]];
    const stackNodeInfoListNext: Array<Array<StackNode>> = [[activeStackNode]];
    // 函数名和调用栈节点引用的映射
    const allFuncNames: Map<string, StackNode> = new Map();
    allFuncNames.set(activeFuncName, activeStackNode);
    // 当前操作的行的下一行的索引
    let index = 0;
    for (const stack of funcRelation) {
      // 找到当前激活函数在源数据中的位置
      const activeIndex = stack.findIndex(funcName => funcName === this.currActiveFunc.funcName);
      // 从数组最后一个元素开始
      index = stackNodeInfoListPrev.length - 1;
      // 从这个函数的位置往前面遍历
      for (let i = activeIndex - 1; i >= 0; i--) {
        const funcName = stack[i];
        const nextFuncName = stack[i + 1];
        // 判断这个函数之前是否已经出现过，如果出现过，
        // 则将下一个函数添加到这个函数的调用栈节点的nextNodeFuncNames里面
        if (allFuncNames.has(funcName)) {
          index--;
          const nextNodeFuncNames = allFuncNames.get(funcName).nextNodeFuncNames;
          if (!nextNodeFuncNames.includes(nextFuncName)) {
            nextNodeFuncNames.push(nextFuncName);
          }
          continue;
        }
        // 下一层为第0层
        if (index < 1) {
          stackNodeInfoListPrev.unshift([]);
          index++;
        }
        const stackNode: StackNode = {
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
          nextNodeFuncNames: [nextFuncName],
        };
        stackNodeInfoListPrev[--index].push(stackNode);
        allFuncNames.set(funcName, stackNode);
      }
      // 从数组第一个元素开始
      index = 0;
      // 从这个函数的位置往后面遍历
      for (let i = activeIndex; i < stack.length; i++) {
        const funcName = stack[i];
        const nextFuncName = stack[i + 1];
        // 判断这个函数之前是否已经出现过，如果出现过，
        // 则将下一个函数添加到这个函数的调用栈节点的nextNodeFuncNames里面
        if (allFuncNames.has(funcName)) {
          index++;
          if (!nextFuncName) {
            continue;
          }
          const posNextFuncNames = allFuncNames.get(funcName).nextNodeFuncNames;
          if (!posNextFuncNames.includes(nextFuncName)) {
            posNextFuncNames.push(nextFuncName);
          }
          continue;
        }
        if (index >= stackNodeInfoListNext.length) {
          stackNodeInfoListNext.push([]);
        }
        const stackNode: StackNode = {
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
        };
        stackNodeInfoListNext[index++].push(stackNode);
        allFuncNames.set(funcName, stackNode);
      }
    }
    // 弹出Prev数组的最后一个元素，因为Prev最后一个元素和Next第一个元素重复
    stackNodeInfoListPrev.pop();
    this.stackNodeInfoList = stackNodeInfoListPrev.concat(stackNodeInfoListNext);
    // 最后遍历一遍，为parents和children赋值
    allFuncNames.forEach(item => {
      item.parents = item.parents || [];
      item.children = item.nextNodeFuncNames.map(funcName => {
        const curr = allFuncNames.get(funcName);
        if (curr.parents) {
          curr.parents.push(item);
        } else {
          curr.parents = [item];
        }
        return curr;
      });
    });
    // 清空allFuncNames
    allFuncNames.clear();
  }

  /**
   * 获取内存泄露函数信息
   */
  private async getMemLeakFuncInfo(funcName: string) {
    const params = {
      memoryLeak: 'mem_leak_function_info',
      nodeId: this.nodeId,
      pid: this.pid,
      function: funcName
    };
    const resp: GetMemoryLeakInfo = await this.axiosService.axios.get(
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
      function: funcName
    };
    const resp: GetMemoryLeakRelation = await this.axiosService.axios.get(
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
      function: funcName
    };
    const resp: GetMemoryReleaseInfo = await this.axiosService.axios.get(
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
      function: funcName
    };
    const resp: any = await this.axiosService.axios.get(
      `/memory-analysis/${this.taskId}/get-memory-release/`,
      { params }
    );
    return resp?.data?.memory_release?.data;
  }

  public onMemLeakTypeChange(memLeakType: MemLeakType) {
    const memLeakTypeArr = [MemLeakType.leakSize, MemLeakType.leakCount];
    if ((memLeakTypeArr.includes(this.memLeakType) && !memLeakTypeArr.includes(memLeakType))
      || (memLeakTypeArr.includes(memLeakType) && !memLeakTypeArr.includes(this.memLeakType))) {
      this.stackNodeInfoList = [];
    }
    this.memLeakType = memLeakType;
  }

  ngOnDestroy(): void {
    this.tabSwitchServiceSub.unsubscribe();
  }
}
