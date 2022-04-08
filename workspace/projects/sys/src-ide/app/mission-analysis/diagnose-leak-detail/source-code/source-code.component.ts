import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { MemLeakType, FuncProps, FuncReleaseInfo, FunctionSourceInfo, GetMemoryReleaseInfo } from '../doman';
import { TabSwitchService } from '../service/tab-switch.service';
import { HttpService } from 'sys/src-ide/app/service/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-source-code',
  templateUrl: './source-code.component.html',
  styleUrls: ['./source-code.component.scss']
})
export class SourceCodeComponent implements OnInit, OnDestroy {
  @ViewChild('sourceCodeSlider') sourceCodeSlider: any;
  @Input() isActive: boolean;
  @Input() taskId: number;
  @Input() nodeId: number;

  /** 更新左侧列表的标志，列表会在值变更时触发更新，从TabSwitchService读取值 */
  public updateTree = 0;

  public pid = '';
  public memLeakType = MemLeakType.leakCount;

  public memReleaseData: FuncReleaseInfo;

  public i18n: any;
  public sourceCodeData: {
    /** 当前显示的函数信息 */
    currActiveFunc: FuncProps;
    functionSourceInfo: FunctionSourceInfo;
  };
  /** 函数名称和属性的映射 */
  public funcMap: { [funcName: string]: any } = {};

  private tabSwitchServiceSub: Subscription;
  private showSourceSlider: Subscription;

  constructor(
    private i18nService: I18nService,
    private http: HttpService,
    private tabSwitchService: TabSwitchService<any>,
  ) {
    this.i18n = this.i18nService.I18n();

    this.tabSwitchServiceSub = this.tabSwitchService.switchTab.subscribe({
      next: ({ params }) => {
        if (params.memLeakType === MemLeakType.abnormalRelease) {
          this.getMemAbnormalReleaseFuncSource(params.funcName).then(functionSourceInfo => {
            this.sourceCodeData = {
              currActiveFunc: params,
              functionSourceInfo
            };
          });
        } else {
          this.getMemLeakFuncSource(params.funcName).then(functionSourceInfo => {
            this.sourceCodeData = {
              currActiveFunc: params,
              functionSourceInfo
            };
          });
        }
        this.updateTree++;
      }
    });
    this.showSourceSlider = this.tabSwitchService.showSourceSlider.subscribe({
      next: (funcInfo) => {
        if (!this.isActive) { return; }
        if (this.memLeakType === MemLeakType.abnormalRelease) {
          this.getMemAbnormalReleaseFuncSource(funcInfo.function_name, 'malloc').then(functionSourceInfo => {
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

  public async handleFuncClick(func: FuncProps) {
    const currActiveFunc = func;
    let functionSourceInfo;
    if (this.memLeakType === MemLeakType.abnormalRelease) {
      functionSourceInfo = await this.getMemAbnormalReleaseFuncSource(func.funcName);
      const funcInfo = await this.getMemAbnormalReleaseFuncInfo(func.funcName);
      this.memReleaseData = funcInfo;
    } else {
      functionSourceInfo = await this.getMemLeakFuncSource(func.funcName);
    }

    this.sourceCodeData = {
      currActiveFunc,
      functionSourceInfo
    };
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
  private async getMemAbnormalReleaseFuncSource(funcName: string, type?: string): Promise<FunctionSourceInfo> {
    const params = {
      memoryRelease: 'mem_release_func_source',
      nodeId: this.nodeId,
      pid: this.pid,
      function: encodeURIComponent(funcName),
      operationType: type || 'free'
    };
    const resp: any = await this.http.get(
      `/memory-analysis/${this.taskId}/get-memory-release/`,
      { params }
    );
    return resp?.data?.memory_release?.data;
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

  ngOnDestroy(): void {
    this.tabSwitchServiceSub.unsubscribe();
    this.showSourceSlider.unsubscribe();
  }
}
