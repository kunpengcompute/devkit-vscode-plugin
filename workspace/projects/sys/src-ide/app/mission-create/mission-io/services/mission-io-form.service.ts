import { Injectable, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, } from '@angular/forms';
import { MissionIoDataService } from './mission-io-data.service';
import { AnalysisModeEnum } from '../../mission-domain';
import { IoFormControls, NodeConfigItem } from '../io-domain';

/**
 * @description
 * 为组件初始化表单控件相关的服务, 具体包括： 初始化控件组，重启和更新状态下为控件组赋初值
 *
 * @publicApi buildProfileFormGroup 构建 Profile System 的控件组
 * @publicApi buildAttachFormGroup 构建 Attach to Process 下的控件组
 * @publicApi buildLaunchFormGroup 构建 Launch Application 下的控件组
 */
@Injectable({
  providedIn: 'root'
})
export class MissionIoFormService {

  constructor(
    private dataService: MissionIoDataService,
  ) { }

  /**
   * 根据分析模式初始化控件组
   * @param formGroup 表单控件组
   * @param mode 分析模式
   */
  public amendFormGroup(formGroup: FormGroup, analysisMode: AnalysisModeEnum, projectId: number) {
    const ctl: IoFormControls = formGroup.controls;
    // 处理私有参数
    switch (analysisMode) {
      case AnalysisModeEnum.PROFILE_SYSTEM:
        // 删除节点参数相关
        formGroup.removeControl('doNodeConfig');
        formGroup.removeControl('nodeConfig');
        break;
      default:
    }
  }
}
