import { Cat } from 'hyper';
import { OrderConfig } from 'sys/src-web/app/domain';
import {
  NetioTaskForm,
  NetioTaskInfoRaw,
  DiagnoseFunc,
  DialTestScene,
  NetworkDialing,
  NetworkCaught,
  NetworkPacketLoss,
  TcpDialTestForm,
  UdpDialTestForm,
} from '../domain';
import { BaseUtil } from '../util/base.util';

export class NetIoTransFormUtil {
  static transFormData(rawData: NetioTaskInfoRaw): NetioTaskForm {
    const {
      functions,
      dialing,
      load,
      netCaught,
      packetLoss,
      cycle,
      appointment,
      targetTime,
      cycleStart,
      cycleStop,
    } = rawData;

    const orderConfig = NetIoTransFormUtil.transFormOrderConfig(
      cycle,
      appointment,
      targetTime,
      cycleStart,
      cycleStop
    );
    const doOrder =
      Object.keys(JSON.parse(JSON.stringify(orderConfig))).length > 0;

    const formData: NetioTaskForm = {
      functions: NetIoTransFormUtil.transFormFunctions(functions),
      taskNodeIp:
        load?.taskNodeIp ?? netCaught?.taskNodeIp ?? packetLoss?.taskNodeIp,
      dialing: {
        dialScene: NetIoTransFormUtil.transFormDialScene(dialing),
        connection: dialing?.connection,
        tcp: NetIoTransFormUtil.transFormDialTcpUdp(dialing?.tcp),
        udp: NetIoTransFormUtil.transFormDialTcpUdp(dialing?.udp),
      },
      load: {
        loadDuration: load?.loadDuration,
        loadInterval: load?.loadInterval,
      },
      netCaught: NetIoTransFormUtil.transFormNetCaught(netCaught),
      packetLoss: NetIoTransFormUtil.transFormPacketLoss(packetLoss),
      orderConfig,
      doOrder,
      taskStartNow: !doOrder,
    };

    return BaseUtil.nullReplacer(formData, '');
  }

  private static transFormFunctions(
    rawData: NetioTaskInfoRaw['functions']
  ): Array<DiagnoseFunc> {
    const funcs: DiagnoseFunc[] = [];

    if (
      rawData.includes(DialTestScene.Connection) ||
      rawData.includes(DialTestScene.Tcp) ||
      rawData.includes(DialTestScene.Udp)
    ) {
      funcs.push(DiagnoseFunc.DialingTest);
    }
    if (rawData.includes(DiagnoseFunc.Load)) {
      funcs.push(DiagnoseFunc.Load);
    }
    if (rawData.includes(DiagnoseFunc.NetCaught)) {
      funcs.push(DiagnoseFunc.NetCaught);
    }
    if (rawData.includes(DiagnoseFunc.PacketLoss)) {
      funcs.push(DiagnoseFunc.PacketLoss);
    }

    return funcs;
  }

  private static transFormDialScene(rawData: NetworkDialing): DialTestScene {
    switch (true) {
      case !!rawData?.connection:
        return DialTestScene.Connection;
      case !!rawData?.tcp:
        return DialTestScene.Tcp;
      case !!rawData?.udp:
        return DialTestScene.Udp;
      default:
        return DialTestScene.Connection;
    }
  }

  private static transFormNetCaught(
    rawData: NetworkCaught
  ): NetioTaskForm['netCaught'] {
    if (NetIoTransFormUtil.isNothing(rawData)) {
      return void 0;
    }

    const {
      ethName,
      IP1,
      port1,
      IP2,
      port2,
      direction,
      protocolFilter,
      protocolType,
      caughtDuration,
      blockCount,
      fileSize,
      fileNumber,
    } = rawData;

    const formData = {
      ethName,
      filterCondition: {
        protocolType,
        protocolFilter,
        IP1,
        port1,
        IP2,
        port2,
        direction,
      },
      caughtDuration,
      blockCount,
      fileSize,
      fileNumber,
    };

    return formData;
  }

  private static transFormPacketLoss(
    rawData: NetworkPacketLoss
  ): NetioTaskForm['packetLoss'] {
    if (NetIoTransFormUtil.isNothing(rawData)) {
      return void 0;
    }

    const {
      ipAddress,
      ethName,
      collectDuration,
      isCollectKernel,
      interval,
      fileSize,
    } = rawData;

    const formData = {
      filterCondition: {
        ipAddress,
        ethName,
      },
      collectDuration,
      isCollectKernel,
      interval,
      fileSize,
    };

    return formData;
  }

  private static transFormOrderConfig(
    cycle: boolean,
    appointment: string,
    targetTime: string,
    cycleStart: string,
    cycleStop: string
  ): OrderConfig {
    const formData = {
      cycle,
      cycleStart,
      cycleStop,
      targetTime,
      appointment,
    };
    return formData;
  }

  private static transFormDialTcpUdp(
    rawData: NetworkDialing['udp'] | NetworkDialing['tcp']
  ): TcpDialTestForm | UdpDialTestForm {
    if (NetIoTransFormUtil.isNothing(rawData)) {
      return void 0;
    }

    const { interval, protocolType, server, client } = rawData;

    const formData = {
      protocolType,
      networkParam: {
        server: {
          serverIp: server?.serverIp,
          serverBindIp: server?.serverBindIp,
          listenPort: server?.listenPort,
        },
        client: {
          clientIp: client?.clientIp,
          sourceEth: client?.sourceEth,
          clientBindIp: client?.clientBindIp,
          connectPort: client?.connectPort,
        },
      },
      serverCPUAffinity: server?.serverCPUAffinity,
      clientCPUAffinity: client?.clientCPUAffinity,
      interval,
      bandwidth: client?.bandwidth,
      dialLimitVal: {
        duration: client?.duration,
        msgLen: client?.msgLen,
        blockCount: client?.blockCount,
      },
      packetSize: client?.packetSize,
      concurrency: client?.concurrency,
      windowSize: (client as any)?.windowSize,
      MSSLen: (client as any)?.MSSLen,
      zeroCopy: client?.zeroCopy,
    };
    return formData;
  }

  /**
   * 判断空对象、null、undefined
   * @param obj 任意对象
   */
  private static isNothing(obj: any) {
    return Cat.isNil(obj) || Cat.isEmpty(obj);
  }
}
