import { Cat } from 'hyper';
import {
  AnalysisTarget,
  DiagnoseAnaType,
  NetioTaskInfoRaw,
  NetioTaskForm,
  NetworkLoad,
  NetworkCaught,
  NetworkPacketLoss,
  NetworkDialing,
  TcpDialTestForm,
  UdpDialTestForm,
  ProjectInfo,
  DialTestScene,
  DiagnoseFunc,
  TransDirection,
  IpProtocolType,
} from './../domain';
import { BaseUtil } from '../util/base.util';

type NodeList = ProjectInfo['nodeList'];

export class NetIoTransRawUtil {
  private static COLLECT_SIZE = 1024; // 采集数据大小，固定值

  constructor() {}

  /**
   * 将表单的数据结构更改为接口的数据接口
   * @param pureData 表单数据结构
   * @param projectName 工程名称
   * @param taskName 任务名称
   * @param nodeList 节点列表
   */
  static transRawData(
    pureData: NetioTaskForm,
    projectName: string,
    taskName: string,
    nodeList: NodeList
  ): NetioTaskInfoRaw {
    const {
      functions,
      taskNodeIp,
      dialing,
      packetLoss,
      netCaught,
      load,
      orderConfig,
    } = pureData;

    const rawData: NetioTaskInfoRaw = {
      analysisTarget: AnalysisTarget.PROFILE_SYSTEM,
      analysisType: DiagnoseAnaType.Netio,
      projectName,
      taskName,
      collectSize: NetIoTransRawUtil.COLLECT_SIZE,
      switch: false,
      functions: NetIoTransRawUtil.transRawFunctios(
        functions,
        dialing?.dialScene
      ),
      dialing: functions.includes(DiagnoseFunc.DialingTest)
        ? {
            connection: dialing?.connection,
            tcp: NetIoTransRawUtil.transRawDialTcpUDP(dialing?.tcp),
            udp: NetIoTransRawUtil.transRawDialTcpUDP(dialing?.udp),
          }
        : void 0,
      load: functions.includes(DiagnoseFunc.Load)
        ? NetIoTransRawUtil.transRawLoad(load, taskNodeIp)
        : void 0,
      netCaught: functions.includes(DiagnoseFunc.NetCaught)
        ? NetIoTransRawUtil.transRawNetCaught(netCaught, taskNodeIp)
        : void 0,
      packetLoss: functions.includes(DiagnoseFunc.PacketLoss)
        ? NetIoTransRawUtil.transRawPacketLoss(packetLoss, taskNodeIp)
        : void 0,
      nodeConfig: [],
      cycle: orderConfig?.cycle,
      appointment: orderConfig?.appointment,
      targetTime: orderConfig?.targetTime,
      cycleStart: orderConfig?.cycleStart,
      cycleStop: orderConfig?.cycleStop,
    };

    rawData.nodeConfig = NetIoTransRawUtil.transRawNodeConfig(
      nodeList,
      rawData
    );

    return BaseUtil.nullReplacer(rawData, '');
  }

  private static transRawLoad(
    pureData: NetioTaskForm['load'],
    taskNodeIp: string[]
  ): NetworkLoad {
    if (null == pureData || Cat.isEmpty(pureData)) {
      return void 0;
    }

    const { loadDuration, loadInterval } = pureData;
    return { taskNodeIp, loadDuration, loadInterval };
  }

  private static transRawNetCaught(
    pureData: NetioTaskForm['netCaught'],
    taskNodeIp: string[]
  ): NetworkCaught {
    if (null == pureData || Cat.isEmpty(pureData)) {
      return {
        taskNodeIp,
        blockCount: 1000,
        caughtDuration: 10,
        direction: TransDirection.Send,
        ethName: void 0,
        fileNumber: 1,
        fileSize: 100,
        protocolFilter: [],
        protocolType: IpProtocolType.IPv4,
      };
    }

    const {
      ethName,
      filterCondition,
      caughtDuration,
      blockCount,
      fileSize,
      fileNumber,
    } = pureData;

    return {
      taskNodeIp,
      ethName,
      caughtDuration,
      blockCount,
      fileNumber,
      fileSize,
      ...filterCondition,
    };
  }

  private static transRawPacketLoss(
    pureData: NetioTaskForm['packetLoss'],
    taskNodeIp: string[]
  ): NetworkPacketLoss {
    if (null == pureData || Cat.isEmpty(pureData)) {
      return {
        taskNodeIp,
        collectDuration: 10,
        isCollectKernel: false,
        interval: void 0,
        fileSize: void 0,
        ipAddress: void 0,
        ethName: void 0,
      };
    }

    const {
      filterCondition,
      collectDuration,
      isCollectKernel,
      interval,
      fileSize,
    } = pureData;

    const rawData = {
      taskNodeIp,
      collectDuration,
      isCollectKernel,
      interval,
      fileSize,
      ...filterCondition,
    };

    return rawData;
  }

  private static transRawDialTcpUDP(
    pureData: TcpDialTestForm & UdpDialTestForm
  ): NetworkDialing['tcp'] & NetworkDialing['udp'] {
    if (null == pureData || Cat.isEmpty(pureData)) {
      return void 0;
    }

    const {
      protocolType,
      networkParam,
      serverCPUAffinity,
      clientCPUAffinity,
      interval,
      bandwidth,
      dialLimitVal,
      packetSize,
      concurrency,
      windowSize,
      MSSLen,
      zeroCopy,
    } = pureData;

    const rawData = {
      interval,
      protocolType,
      server: {
        serverIp: networkParam?.server?.serverIp,
        serverBindIp: networkParam?.server?.serverBindIp,
        listenPort: networkParam?.server?.listenPort,
        serverCPUAffinity,
      },
      client: {
        duration: dialLimitVal?.duration,
        clientIp: networkParam?.client?.clientIp,
        sourceEth: networkParam?.client?.sourceEth,
        clientBindIp: networkParam?.client?.clientBindIp,
        connectPort: networkParam?.client?.connectPort,
        cPort: networkParam?.server?.listenPort,
        clientCPUAffinity,
        bandwidth,
        msgLen: dialLimitVal?.msgLen,
        blockCount: dialLimitVal?.blockCount,
        packetSize,
        concurrency,
        windowSize,
        MSSLen,
        zeroCopy,
      },
    };

    return rawData;
  }

  private static transRawNodeConfig(
    nodeList: NodeList,
    rawData: Omit<NetioTaskInfoRaw, 'nodeConfig'>
  ): NetioTaskInfoRaw['nodeConfig'] {
    if (null == nodeList || Cat.isEmpty(nodeList)) {
      return void 0;
    }

    const nodeConfig = nodeList.map((node) => {
      const { id, nodeIp, nickName, nodeStatus } = node;
      const { dialing, load, netCaught, packetLoss } = rawData;

      const nodeInfo = {
        nodeId: id,
        nodeIp,
        nodeName: nickName,
        nodeStatus,
        taskParam: {
          dialing,
          load,
          netCaught,
          packetLoss,
        },
      };
      return nodeInfo;
    });

    return nodeConfig;
  }

  private static transRawFunctios(
    formFuntions: NetioTaskForm['functions'],
    dialScene?: DialTestScene
  ): NetioTaskInfoRaw['functions'] {
    const rawFuncs: NetioTaskInfoRaw['functions'] = formFuntions.filter(
      (func) => DiagnoseFunc.DialingTest !== func
    );

    if (formFuntions.includes(DiagnoseFunc.DialingTest)) {
      rawFuncs.push(dialScene);
    }

    return rawFuncs;
  }
}
