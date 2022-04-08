import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AxiosService } from '../../../../../service/axios.service';
import { OrderConfig, AppAndParams, PidProcess } from '../../../../domain';
import { AnalysisTarget } from 'projects/sys/src-web/app/domain';
import { IoFormControls, NodeConfigItem, RawDataIO, RawDataIOBase, } from '../../../io-domain';

@Injectable({
  providedIn: 'root'
})
export class ScheduleModifyService {

  constructor(
    private http: AxiosService,
  ) { }

  /**
   * 根据分析模式初始化控件组
   * @param formGroup 表单控件组
   * @param mode 分析模式
   */
  public amendFormGroup(formGroup: FormGroup, analysisMode: AnalysisTarget) {
    const ctl: IoFormControls = formGroup.controls;
    // 修正控件
    switch (analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        // 删除节点参数相关
        formGroup.removeControl('doNodeConfig');
        formGroup.removeControl('nodeConfig');
        formGroup.removeControl('appAndParams');
        formGroup.removeControl('pidProcess');
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        // 节点参数开关失能
        formGroup.removeControl('pidProcess');
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        // 节点参数开关失能
        formGroup.removeControl('appAndParams');
        // 添加节点参数
        break;
      default:
        console.error('代码出错：amendFormGroup！');
    }
  }

  /**
   * 根据后端接口的数据，设置控件的值
   * @param formGroup 表单控件组
   * @param rawData 后端接口数据
   * @param analysisMode 分析模式
   */
  public setControlsByRawData(
    formGroup: FormGroup, rawData: RawDataIO, analysisMode: AnalysisTarget
  ) {

    const ctlTmp: any = formGroup.controls;
    const ctl: IoFormControls = ctlTmp;

    // 设置常规控件
    ctl.taskName.setValue(rawData.taskName);
    ctl.size.setValue(rawData.size);
    ctl.stack.setValue(rawData.stack);
    ctl.statistical.setValue(rawData.statistical);
    ctl.duration.setValue(rawData.duration);

    // 设置应用和应用参数控件 和 PID进程名控件
    switch (analysisMode) {
      case AnalysisTarget.LAUNCH_APPLICATION:
        {
          const temp: AppAndParams = {
            app: rawData.appDir,
            params: rawData['app-parameters'],
          };
          ctl.appAndParams.setValue(temp);
        }
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        {
          const temp: PidProcess = {
            pid: rawData.targetPid,
            process: rawData.process_name,
          };
          ctl.pidProcess.setValue(temp);
        }
        break;
      default:
    }

    // 设置预约控件
    if (!rawData.cycleStart
      && !rawData.cycleStop
      && !rawData.appointment
      && !rawData.targetTime
    ) {
      ctl.doOrder.setValue(false);
    } else {
      ctl.doOrder.setValue(true);
    }
    ctl.orderConfig.setValue({
      cycle: rawData.cycle,
      cycleStart: rawData.cycleStart,
      cycleStop: rawData.cycleStop,
      targetTime: rawData.targetTime,
      appointment: rawData.appointment,
    });

    // 设置节点参数控件
    const nodeConfig: NodeConfigItem[] = [];
    for (const rawNode of rawData.nodeConfig) {
      let taskParam: any = {};
      switch (analysisMode) {
        case AnalysisTarget.ATTACH_TO_PROCESS:
          taskParam = JSON.parse(
            JSON.stringify(rawNode.taskParam, ['status', 'targetPid', 'process_name'])
          );
          break;
        case AnalysisTarget.LAUNCH_APPLICATION:
          taskParam = JSON.parse(
            JSON.stringify(rawNode.taskParam, ['status', 'appDir', 'app-parameters'])
          );
          break;
        default:
      }

      // FIXME
      nodeConfig.push({
        nodeId: rawNode.nodeId,
        nickName: rawNode.nodeNickName || rawNode.nickName,
        nodeIp: rawNode.nodeIp,
        nodeStatus: rawNode.nodeStatus,
        taskParam,
        runUserData: {
          runUser: false,
          user: '',
          password: ''
        }
      });
    }

    switch (analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
      case AnalysisTarget.LAUNCH_APPLICATION:
        ctl.doNodeConfig.setValue(rawData.switch);
        ctl.nodeConfig.setValue(nodeConfig);
        break;
      default:
    }
  }

  /**
   * 将控件的值，转化为接口的数据
   * @param formGroup 表单控件组
   * @param analysisMode 分析模式
   */
  public getRawDataByControls(formGroup: FormGroup, rawDataIO: RawDataIO, analysisMode: AnalysisTarget): RawDataIO {
    // 控件组
    const ctl: IoFormControls = formGroup.controls;

    // 共有参数处理
    const baseRawData: RawDataIOBase = {
      analysisType: 'ioperformance',
      projectName: rawDataIO.projectName,
      taskName: rawDataIO.taskName,
      duration: ctl.duration.value,
      statistical: ctl.statistical.value,
      size: ctl.size.value,
      stack: ctl.stack.value,
    };
    if (ctl.doOrder.value) {
      const cycleConfig: OrderConfig = ctl.orderConfig.value;
      baseRawData.cycle = cycleConfig.cycle;
      baseRawData.cycleStart = cycleConfig.cycleStart || '';
      baseRawData.cycleStop = cycleConfig.cycleStop || '';
      baseRawData.targetTime = cycleConfig.targetTime || '';
      baseRawData.appointment = cycleConfig.appointment || '';
    }

    // 特有参数处理
    switch (analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        baseRawData.analysisTarget = 'Profile System';
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        baseRawData.analysisTarget = 'Launch Application';
        const { app, params } = ctl.appAndParams.value;
        baseRawData.appDir = app || '';
        baseRawData['app-parameters'] = params || '';
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        baseRawData.analysisTarget = 'Attach to Process';
        const { pid, process } = ctl.pidProcess.value;
        baseRawData.targetPid = pid || '';
        baseRawData.process_name = process || '';
        break;
      default:
        console.error('错误： getRawDataByControls');
    }

    // 嵌套节点参数
    const pushData: RawDataIO = { ...baseRawData };
    switch (analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        pushData.nodeConfig = [];
        rawDataIO.nodeConfig.forEach((item) => {
          const nodeItem: any = {
            nodeId: item.nodeId,
            nickName: item.nodeNickName,
            taskParam: JSON.parse(JSON.stringify(baseRawData)),
          };
          nodeItem.taskParam.status = false; // 默认
          pushData.nodeConfig.push(nodeItem);
        });
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        pushData.nodeConfig = [];
        ctl.nodeConfig.value.forEach((item: NodeConfigItem) => {
          const nodeItem: any = {
            nodeId: item.nodeId,
            nickName: item.nickName,
            taskParam: JSON.parse(JSON.stringify(baseRawData)),
          };
          nodeItem.taskParam.status = item.taskParam.status;
          nodeItem.taskParam.appDir = (item.taskParam.status ? item.taskParam.appDir : baseRawData.appDir) || '';
          nodeItem.taskParam['app-parameters'] = (item.taskParam.status ? item.taskParam['app-parameters']
            : baseRawData['app-parameters']) || '';
          pushData.nodeConfig.push(nodeItem);
        });
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        pushData.nodeConfig = [];
        ctl.nodeConfig.value.forEach((item: any) => {
          const nodeItem: any = {
            nodeId: item.nodeId,
            nickName: item.nickName,
            taskParam: JSON.parse(JSON.stringify(baseRawData)),
          };
          nodeItem.taskParam.status = item.taskParam.status;
          nodeItem.taskParam.targetPid = item.taskParam.status ? item.taskParam.targetPid : baseRawData.targetPid || '';
          nodeItem.taskParam.process_name = item.taskParam.status
          ? item.taskParam.process_name : baseRawData.process_name || '';
          pushData.nodeConfig.push(nodeItem);
        });
        break;
      default:
    }

    // 外层默认参数
    switch (analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
      case AnalysisTarget.LAUNCH_APPLICATION:
        pushData.switch = ctl.doNodeConfig.value;
        break;
      case AnalysisTarget.PROFILE_SYSTEM:
        pushData.switch = false;
        break;
      default:
    }

    return pushData;
  }

  /**
   * 获取 接口的节点 的数据
   * @param projectId 工程ID
   */
  public requestGetNodeInfo(projectId: any): Promise<NodeConfigItem[]> {
    const url = `projects/${encodeURIComponent(projectId)}/info/`;
    return new Promise<NodeConfigItem[]>((resolve, reject) => {
      const data: any = [];
      this.http.axios.get(url).then((res: any) => {
        res.data.nodeList.forEach((item: any) => {
          data.push({
            nodeId: item.id,
            nickName: item.nickName,
            nodeIp: item.nodeIp, // 节点IP
            nodeStatus: item.nodeStatus,
            taskParam: {
              status: false,
            },
          });
        });
        resolve(data);
      });
    });
  }
}
