import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AnalysisTarget } from 'sys/src-com/app/domain';
import { AppAndParams, PidProcess } from '../../../domain';
import { CustomValidatorsService } from '../../../../service';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';

@Component({
  selector: 'app-mission-hpc-node-params',
  templateUrl: './mission-hpc-node-params.component.html',
  styleUrls: ['./mission-hpc-node-params.component.scss']
})
export class MissionHpcNodeParamsComponent implements OnInit {

  @Input() labelWidth = '200px';
  @Input() drawerLevel: number;
  @Output() private handleConfigData = new EventEmitter<any>();
  @ViewChild('missionPublic') missionPublic: any;

  /** 节点参数 */
  public nodeParams: any = {};
  /** 节点参数的表单 */
  public formGroup = new FormGroup({
    pidProcess: new FormControl(),
    appAndParams: new FormControl(),
    openMpParams: new FormControl(null, [this.customValidatorsService.checkOpenMPParam()]),
  });
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  /** 控件的显隐配置 */
  public options: { [key: string]: { display: boolean } };
  public analysisMode: AnalysisTarget;

  constructor(
    public customValidatorsService: CustomValidatorsService
  ) {
  }

  ngOnInit(): void {
    /** 控件的显隐控制 */
    this.options = {
      pidProcess: {
        display: false,
      },
      appAndParams: {
        display: false,
      },
      openMpParams: {
        display: false,
      }
    };
  }

  // 打开
  public open(nodeParams: any) {
    this.nodeParams = nodeParams;
    this.missionPublic.open();

    const e = nodeParams.param;
    if (Object.keys(e).length !== 0) {
      this.analysisMode = e['analysis-target'];
      const pidProcess: PidProcess = {
        pid: e.targetPid,
        process: e.process_name,
      };
      const appAndParams: AppAndParams = {
        app: e['app-dir'],
        params: e['app-parameters'],
      };
      switch (this.analysisMode) {
        case AnalysisTarget.LAUNCH_APPLICATION:
          this.options.appAndParams.display = true;
          this.options.pidProcess.display = false;
          this.formGroup.controls.appAndParams.setValue(appAndParams);
          this.formGroup.get('pidProcess').disable();
          this.formGroup.get('appAndParams').enable();
          if (!e.mpi_status) {
            this.options.openMpParams.display = true;
            this.formGroup.get('openMpParams').enable();
            this.formGroup.controls.openMpParams.setValue(e.open_mp_param);
          }
          break;
        case AnalysisTarget.ATTACH_TO_PROCESS:
          this.formGroup.controls.pidProcess.setValue(pidProcess);
          this.options.appAndParams.display = false;
          this.options.pidProcess.display = true;
          this.options.openMpParams.display = false;
          this.formGroup.get('pidProcess').enable();
          this.formGroup.get('appAndParams').disable();
          break;
        default:
      }
    }
  }

  /**
   * 确认
   */
  public onConfirm() {
    // 将数据写入父组件的控件
    const { pidProcess, appAndParams, openMpParams } = this.formGroup.value;
    let formData = {};
    switch (this.analysisMode) {
      case AnalysisTarget.LAUNCH_APPLICATION:
        formData = {
          'app-dir': appAndParams?.app || '',
          'app-parameters': appAndParams?.params || ''
        };
        if (!this.nodeParams.param.mpi_status) {
          formData = Object.assign({}, formData, {open_mp_param: openMpParams});
        }
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        formData = {
          targetPid: pidProcess?.pid || '',
          process_name: pidProcess?.process || '',
        };
        break;
      default:
    }
    const params = {
      nickName: this.nodeParams.title.split('(')[0],
      nodeIp: this.nodeParams.nodeIP,
      formData,
    };
    this.handleConfigData.emit(params);
    this.onClose();
  }
  // 关闭
  public onClose() {
    this.missionPublic.close();
  }
}
