import { filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AppAndParams, OrderConfig, INodeInfo, PidProcess
} from '../../domain';
import {
  AnalysisTarget, AnalysisType, HpcPresetType
} from 'projects/sys/src-web/app/domain';
import {
  IHpcFormGroupValue, IHpcSchTaskInfo, IHpcSendTaskInfo,
  IHpcTaskInfo
} from '../domain';

@Injectable({
  providedIn: 'root'
})
export class MissionHpcFormService {

  constructor() { }

  /**
   * 将控件的值，转化为接口的数据
   * @param formGroup 表单控件组
   * @param analysisMode 分析模式
   */
  transData(
    analysisMode: AnalysisTarget, fGroup: FormGroup, projactName: string,
    nodeInfo?: INodeInfo[]
  ): IHpcSendTaskInfo {

    const ctlData: IHpcFormGroupValue = fGroup.getRawValue();

    // 共有参数处理
    const baseRawData: any = {
      'analysis-target': analysisMode,
      'analysis-type': AnalysisType.Hpc,
      projectname: projactName,
      taskname: ctlData.taskName,
      duration: ctlData.duration,
      preset: ctlData.preset,
      switch: false,
    };
    if (ctlData.doOrder) {
      const cycleConfig: OrderConfig = ctlData.orderConfig;
      baseRawData.cycle = !!cycleConfig.cycle;
      baseRawData.cycleStart = cycleConfig.cycleStart || '';
      baseRawData.cycleStop = cycleConfig.cycleStop || '';
      baseRawData.targetTime = cycleConfig.targetTime || '';
      baseRawData.appointment = cycleConfig.appointment || '';
    }

    // 特有参数处理
    switch (analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        {
          const appParams: AppAndParams = ctlData.appAndParams;
          baseRawData['app-dir'] = appParams.app || '';
          baseRawData['app-parameters'] = appParams.params || '';
          baseRawData.open_mp_param = ctlData.openMpParams || undefined;
          baseRawData.mpi_status = ctlData.mpiStatus;
          if (baseRawData.mpi_status) {
            baseRawData.mpi_env_dir = ctlData.mpiEnvDir || '';
            baseRawData.mpi_param = ctlData.mpiParams;
            baseRawData.rank = ctlData.rank;
            baseRawData.master_ip = ctlData.selectNode;
            baseRawData.hpc_mlt_rank_info = ctlData.hpc_mlt_rank_info.map(
              (item: any) => {
                return { IP: item.nodeIp, rank: item.rank };
              }
            );
          }
          break;
        }
      case AnalysisTarget.ATTACH_TO_PROCESS:
        {
          const pidProcess: PidProcess = ctlData.pidProcess;
          baseRawData.targetPid = pidProcess.pid || '';
          baseRawData.process_name = pidProcess.process || '';
          baseRawData.mpi_status = ctlData.mpiStatus;
          break;
        }
      default:
    }
    // 嵌套节点参数
    const rawData: IHpcSendTaskInfo = JSON.parse(JSON.stringify(baseRawData));
    if (nodeInfo) {
      rawData.nodeConfig = nodeInfo.map((node: INodeInfo) => {
        const item = {
          nodeId: node.nodeId,
          nodeIP: node.nodeIp,
          nickName: node.nickName,
          task_param: {
            ...node.taskParam,
            ...JSON.parse(JSON.stringify(baseRawData)),
          },
        };
        return item;
      });
    }
    return rawData;
  }

  transForm(rawData: IHpcTaskInfo | IHpcSchTaskInfo): IHpcFormGroupValue {
    const appAndParams: AppAndParams = JSON.parse(
      JSON.stringify({
        app: rawData?.['app-dir'],
        params: rawData?.['app-parameters'],
      })
    );
    const pidProcess: PidProcess = JSON.parse(
      JSON.stringify({
        pid: rawData.targetPid,
        process: rawData.process_name,
      })
    );

    const orderConfig: OrderConfig = JSON.parse(
      JSON.stringify({
        cycle: rawData?.cycle,
        cycleStart: rawData?.cycleStart,
        cycleStop: rawData?.cycleStop,
        targetTime: rawData?.targetTime,
        appointment: rawData?.appointment,
      })
    );
    const doOrder = Object.keys(orderConfig).length > 0;

    const formValue: IHpcFormGroupValue = {
      taskName: rawData.taskname,
      appAndParams,
      pidProcess,
      duration: rawData.duration,
      preset: (rawData.preset as HpcPresetType),
      openMpParams: rawData?.open_mp_param,
      mpiStatus: rawData?.mpi_status,
      mpiEnvDir: rawData?.mpi_env_dir || '',
      mpiParams: rawData?.mpi_param,
      rank: rawData?.rank,
      doOrder,
      orderConfig,
      taskStartNow: true,
      switch: false,
    };

    return JSON.parse(JSON.stringify(formValue));
  }

  public getRawDataByControls(
    analysisMode: AnalysisTarget,
    fGroup: FormGroup,
    projactName: string,
    nodeInfo: INodeInfo[],
    nodeConfigC: any,
  ): IHpcSendTaskInfo {
    const ctlData: IHpcFormGroupValue = fGroup.getRawValue();

    // 共有参数处理
    const baseRawData: any = {
      'analysis-target': analysisMode,
      'analysis-type': AnalysisType.Hpc,
      projectname: projactName,
      taskname: ctlData.taskName,
      duration: ctlData.duration,
      preset: ctlData.preset,
      switch: false,
    };
    if (ctlData.doOrder) {
      const cycleConfig: OrderConfig = ctlData.orderConfig;
      baseRawData.cycle = !!cycleConfig.cycle;
      baseRawData.cycleStart = cycleConfig.cycleStart || '';
      baseRawData.cycleStop = cycleConfig.cycleStop || '';
      baseRawData.targetTime = cycleConfig.targetTime || '';
      baseRawData.appointment = cycleConfig.appointment || '';
    }

    // 特有参数处理
    switch (analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        {
          const appParams: AppAndParams = ctlData.appAndParams;
          baseRawData['app-dir'] = appParams.app || '';
          baseRawData['app-parameters'] = appParams.params || '';
          baseRawData.open_mp_param = ctlData.openMpParams || undefined;
          baseRawData.mpi_status = ctlData.mpiStatus;
          baseRawData.switch = nodeConfigC.switchStatus;
          if (baseRawData.mpi_status) {
            baseRawData.mpi_env_dir = ctlData.mpiEnvDir || '';
            baseRawData.mpi_param = ctlData.mpiParams;
            baseRawData.rank = ctlData.rank;
            baseRawData.master_ip = ctlData.selectNode;
            baseRawData.hpc_mlt_rank_info = ctlData.hpc_mlt_rank_info.map(
              (item: any) => {
                return { IP: item.nodeIp, rank: item.rank };
              }
            );
          }
          break;
        }
      case AnalysisTarget.ATTACH_TO_PROCESS:
        {
          const pidProcess: PidProcess = ctlData.pidProcess;
          baseRawData.targetPid = pidProcess.pid || '';
          baseRawData.process_name = pidProcess.process || '';
          baseRawData.mpi_status = ctlData.mpiStatus;
          baseRawData.switch = nodeConfigC.switchStatus;
          break;
        }
      default:
    }
    // 嵌套节点参数
    const rawData: IHpcSendTaskInfo = JSON.parse(JSON.stringify(baseRawData));
    if (analysisMode !== AnalysisTarget.PROFILE_SYSTEM && nodeConfigC && nodeConfigC.switchStatus) {
      const nodeConfig = nodeConfigC.getNodesConfigParams();
      rawData.nodeConfig = nodeConfig.map((node: any) => {
        const tempBaseRawData = JSON.parse(JSON.stringify(baseRawData));
        if (analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
          tempBaseRawData['app-dir'] = node.task_param['app-dir'];
          tempBaseRawData['app-parameters'] = node.task_param['app-parameters'];
          tempBaseRawData.status = node.task_param.status;
          if (!baseRawData.mpi_status) {
            tempBaseRawData.open_mp_param = node.task_param.open_mp_param;
          }
        } else {
          tempBaseRawData.targetPid = node.task_param.targetPid;
          tempBaseRawData.process_name = node.task_param.process_name;
          tempBaseRawData.status = node.task_param.status;
        }
        const item = {
          nodeId: node.nodeId,
          nickName: node.nickName,
          task_param: {
            ...node.taskParam,
            ...tempBaseRawData,
          },
        };
        return item;
      });
    } else {
      rawData.nodeConfig = nodeInfo.map((node: INodeInfo) => {
        const item = {
          nodeId: node.nodeId,
          // nodeIP: node.nodeIp,
          nickName: node.nickName,
          task_param: {
            ...node.taskParam,
            ...JSON.parse(JSON.stringify(baseRawData)),
          },
        };
        return item;
      });
    }
    return rawData;
  }
}
