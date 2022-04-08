import {
  DialTestScene,
  DiagnoseFunc,
  IpProtocolType,
  NetworkLayerProtocol,
  TransLayerProtocol,
  TransDirection,
  Pathmtudis,
} from './netio-task-info-raw.type';
import { OrderConfig } from 'sys/src-com/app/domain';

/**
 * 组网参数
 */
export type NetworkParam = {
  server: {
    // 服务端参数
    serverIp: string; // 服务端任务节点
    serverBindIp: string; // 服务端IP
    listenPort: string; // 服务端端口
  };
  client: {
    // 客户端参数
    clientIp: string; // 客户端任务节点
    sourceEth?: string; // 客户端网口，Ipv6
    clientBindIp?: string; // 客户端IP，Ipv4
    connectPort: string; // 客户端端口，默认5021
  };
};

/**
 * 连通性拨测参数
 */
export type ConnectDialForm = {
  protocolType: IpProtocolType; // IP协议类型
  // 节点信息
  servers: {
    serverIp: string; // 任务节点
    sourceIp?: string; // 源IP，Ipv4 参数
    sourceEth?: string; // 源端网口，Ipv6 参数
    destinationIp: string; // 目标服务器IP
  }[];
  // 高级参数
  msgLen?: number; // 拨测报文长度, 16-65507， 默认56
  interval?: number; // 拨测间隔，单位：ms,（10-10000），默认1000
  duration?: number; // 拨测时长，单位：s, 1-60，默认 10s
  pathmtudis?: Pathmtudis; // 分片策略
  ttl?: number; // TLL, 1-255，默认30
};

/**
 * TCP拨测参数
 */
export type TcpDialTestForm = {
  protocolType: IpProtocolType; // IP协议类型
  networkParam: NetworkParam; // 组网参数
  serverCPUAffinity?: string; // 服务端CPU亲和性
  clientCPUAffinity?: string; // 客户端CPU亲和性
  interval?: number; // 报告间隔，单位：ms
  bandwidth?: string; // 拨测带宽
  // 拨测限值
  dialLimitVal: {
    duration?: number; // 拨测时长，单位：s
    msgLen?: string; // 拨测报文总长
    blockCount?: number; // 拨测报文包数
  };
  packetSize?: string; // 拨测报文长度
  concurrency?: number; // 并发连接数
  windowSize?: string; // 套接字缓冲区，最大值：416
  MSSLen?: number; // MSS长，88 - 1448，默认1448
  zeroCopy?: boolean; // 支持零拷贝
};

/**
 * UDP拨测参数
 */
export type UdpDialTestForm = Omit<TcpDialTestForm, 'windowSize' | 'MSSLen'>;

/**
 * 网络IO创建任务表格
 */
export type NetioTaskForm = {
  functions: Array<DiagnoseFunc>; // 诊断功能
  taskNodeIp?: string[]; // 节点IP, 有效于：网络丢包、网络抓包、网络负载
  // 网络拨测参数
  dialing?: {
    dialScene: DialTestScene;
    // 连通性拨测
    connection?: ConnectDialForm;
    // TCP拨测
    tcp?: TcpDialTestForm;
    // UDP拨测
    udp?: UdpDialTestForm;
  };
  // 丢包诊断参数
  packetLoss?: {
    // 过滤条件
    filterCondition?: {
      ipAddress: string; // IP地址
      ethName: string; // 网口名称
    };
    collectDuration: number; // 采样时长，单位：s
    isCollectKernel?: boolean; // 采集内核调用栈
    interval?: number; // 采样频率，单位：us, ms
    fileSize?: number; // 采集文件大小, 单位：MiB
  };
  // 网络抓包参数
  netCaught?: {
    ethName?: string; // 抓包网口
    // 过滤条件
    filterCondition: {
      protocolType: IpProtocolType; // Ip协议类型
      protocolFilter?: (NetworkLayerProtocol | TransLayerProtocol | 'ip6')[]; // 协议
      IP1?: string; // IP1
      port1?: string; // 端口1
      IP2?: string; // IP2
      port2?: string; // 端口2
      direction?: TransDirection; // 传输方向
    };
    caughtDuration: number; // 抓包时长	1-300，默认10秒
    blockCount: number; // 抓包包数	1-10000，默认1000
    fileSize?: number; // 文件大小	单位MB，默认10，10-1024
    fileNumber?: number; // 文件数	默认是1，范围1-10
  };
  // 网络负载监控参数
  load?: {
    loadDuration: number; // 采集时长，单位：s
    loadInterval: number; // 采样间隔，单位：s
  };
  doOrder: boolean; // 预约定时启动
  orderConfig?: OrderConfig; // 预约定时启动信息
  taskStartNow: boolean; // 是否立即启动
};
