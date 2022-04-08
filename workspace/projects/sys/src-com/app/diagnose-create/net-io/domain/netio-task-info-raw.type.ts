import { AnalysisTarget } from 'sys/src-com/app/domain';

/**
 * 诊断调试 分析类型
 */
export enum DiagnoseAnaType {
  Netio = 'netio_diagnostic',
  Memory = 'memory_diagnostic',
}
/**
 * IP 协议类型
 */
export enum IpProtocolType {
  IPv4 = '4',
  IPv6 = '6',
}

/**
 * 拨测场景
 */
export enum DialTestScene {
  Connection = 'connection',
  Tcp = 'tcp',
  Udp = 'udp',
}

/**
 * 诊断功能
 */
export enum DiagnoseFunc {
  PacketLoss = 'packetLoss',
  Load = 'load',
  NetCaught = 'netCaught',
  DialingTest = 'dialing',
}

/**
 * 分片策略
 */
export enum Pathmtudis {
  Do = 'do',
  Want = 'want',
  Dont = 'bont',
}

/**
 * 传输方向
 */
export enum TransDirection {
  Send = 'send',
  Receive = 'receive',
  Full = 'full',
}

/**
 * 网络层协议
 */
export enum NetworkLayerProtocol {
  IP = 'ip',
  IP6 = 'ip6',
  ICMP = 'icmp',
  IGMP = 'igmp',
  RARP = 'rarp',
  ARP = 'arp',
}

/**
 * 传输层协议
 */
export enum TransLayerProtocol {
  TCP = 'tcp',
  UDP = 'udp',
}

/**
 * 网络拨测
 */
export type NetworkDialing = {
  // 拨测参数
  connection?: {
    // 连通性拨测参数
    servers: // 服务器信息列表	IP列表，选择工程中的哪些节点运行任务（可选工程中的一个或多个节点）
    {
      serverIp: string; // 运行任务的服务器IP地址		Ip地址参数
      sourceIp?: string; // 客户端发送IP		Ipv4参数
      sourceEth?: string; // 客户端发网口	Ipv6参数
      destinationIp: string; // 目标IP	目标IP
    }[];
    protocolType: IpProtocolType; // 协议类型	ipv4或ipv6
    // 高级参数
    duration?: number; // 拨测时长	1-60秒，默认10秒
    msgLen?: number; // 拨测报文长度 bytes	16-65507， 默认56
    interval?: number; // 拨测间隔，毫秒	（10-10000），默认1000
    pathmtudis?: Pathmtudis; // 分片策略	do 或 want 或 dont，默认want
    ttl?: number; // 报文生存期	1-255，默认30
  };
  tcp?: {
    // tcp拨测参数
    interval?: number; // 拨测间隔，秒	0.1-10，默认1
    protocolType: IpProtocolType; // 协议类型	连通性拨测必传，ipv4或ipv6
    server: {
      // 服务端参数
      serverIp: string; // 服务端IP	选择服务器端IP地址
      serverBindIp: string; // 服务器绑定IP	服务器端接收IP
      listenPort?: string; // 服务段监听端口		默认5021
      serverCPUAffinity?: string; // 服务端CPU亲和性	n，CPU核心编号
    };
    client: {
      // 客户端参数
      duration?: number; // 拨测时长	1 - 60秒，默认10秒
      clientIp: string; // 客户端IP	选择客户端IP地址
      sourceEth?: string; // 客户端发送网口	Ipv6时必选
      clientBindIp?: string; // 客户端绑定IP	客户端发送IP
      connectPort?: string; // 客户端连接端口	默认5021
      cPort?: string; // 客户端发送端口	默认系统选择临时端口
      clientCPUAffinity?: string; // 客户端CPU亲和性	n，CPU核心编号
      bandwidth?: string; // 拨测带宽	拨测带宽, 如： 1K (K | M)
      msgLen?: string; // 拨测报文总长	格式：123K / 123M
      blockCount?: number; // 拨测报文包数	格式：123K / 123M
      packetSize?: string; // 读写缓冲大小	拨测报文长度，TCP拨测默认128KB，UDP拨测默认1460B。格式：123K / 123M
      concurrency?: number; // 并发连接数	默认1
      windowSize?: string; // TCP 窗口大小	格式：123K最大416K
      MSSLen?: number; // TCP MSS长度	88 - 1448字节，默认1448
      zeroCopy?: boolean; // 使用零拷贝发送数据	布尔值，true或者false
    };
  };
  udp?: {
    // udp参数
    interval?: number; // 拨测间隔，秒	0.1 - 10，默认1
    protocolType: IpProtocolType; // 协议类型	连通性拨测必传，ipv4或ipv6
    server: {
      // 服务端参数
      serverIp: string; // 服务端IP	选择服务器端IP地址
      serverBindIp: string; // 服务器绑定IP	服务器端接收IP
      listenPort?: string; // 服务端监听端口	默认5021
      serverCPUAffinity: string; // 服务端CPU亲和性	n，CPU核心编号
    };
    client: {
      // 客户端参数
      duration?: number; // 拨测时长	1 - 60秒，默认10秒
      clientIp: string; // 客户端IP	选择客户端IP地址
      sourceEth?: string; // 客户端发送网口	Ipv6时必选
      clientBindIp?: string; // 客户端绑定IP	客户端发送IP
      connectPort?: string; // 客户端连接端口	默认5021
      cPort?: string; // 客户端发送端口	默认系统选择临时端口
      clientCPUAffinity?: string; // 客户端CPU亲和性	n，CPU核心编号
      bandwidth?: string; // 拨测带宽	拨测带宽, 如： 1K (K | M)
      msgLen?: string; // 拨测报文总长	格式：123K / 123M
      blockCount?: number; // 拨测报文包数	格式：123K / 123M
      packetSize?: string; // 读写缓冲大小	拨测报文长度，TCP拨测默认128KB，UDP拨测默认1460B。格式：123K / 123M
      concurrency?: number; // 并发连接数	默认1
      zeroCopy?: boolean; // 使用零拷贝发送数据	布尔值，true或者false
    };
  };
};

/**
 * 网络丢包
 */
export type NetworkPacketLoss = {
  taskNodeIp?: string[]; // 节点IP
  ipAddress: string; // 主机IP		Ip地址参数
  ethName: string; // 主机网口
  collectDuration: number; // 采样时长	1-300，默认10秒
  isCollectKernel: boolean; // 是否采集内核调用栈	布尔值，true或flase
  interval: number; // 采样频率	默认1ms，范围1-1000；高精度时固定710us，带单位
  fileSize: number; // 采集文件大小	MB, 默认1024，范围1-1024
};

/**
 * 网络抓包
 */
export type NetworkCaught = {
  taskNodeIp?: string[]; // 节点Ip	数组，Ip地址参数
  ethName?: string; // 抓包网口	字符串
  IP1?: string; // IP1		Ip地址参数
  port1?: string; // port1		端口参数
  IP2?: string; // IP2		Ip地址参数
  port2?: string; // Port2		端口参数
  direction?: TransDirection; // 传输方向	字符串，三选一send，receive，full
  /**
   * 协议类型	数组，[ip | ip6、icmp、arp、rarp、tcp、udp]，不选为空
   */
  protocolFilter?: (NetworkLayerProtocol | TransLayerProtocol | 'ip6')[];
  protocolType: IpProtocolType; // Ip协议类型
  caughtDuration?: number; // 抓包时长	1-300，默认10秒
  blockCount?: number; // 抓包包数	1-10000，默认1000
  fileSize?: number; // 文件大小	单位MB，默认10，10-1024
  fileNumber?: number; // 文件数	默认是1，范围1-10
};

/**
 * 网络负载
 */
export type NetworkLoad = {
  // 负载监控参数
  taskNodeIp?: string[]; // 节点IP	数组，Ip参数
  loadDuration: number; // 负载监控时长	2 - 300秒，默认10秒
  loadInterval: number; // 负载监控采集间隔	负载监控采集间隔，1 - 10，默认1
};

/**
 * 网络IO任务详情
 */
export type NetioTaskInfoRaw = {
  analysisTarget: AnalysisTarget; // 采集类型	Profile System
  analysisType: DiagnoseAnaType; // 分析类型 netio_diagnostic
  projectName: string; // 工程名	字符串，长度1-32个字符，符合工程名校验规则。
  taskName: string; // 任务名称，由用户指定	字符串，长度6-32个字符，符合任务名校验规则。
  collectSize: number; // 采集数据大小（MB）	数字
  switch: boolean; // 配置节点参数开关	布尔值
  /**
   * 情况一：（connection或tcp或upd）其一必选时， load、netCaught可选；
   * 情况二： packetLoss 必选时， load、netCaught可选；
   * 注意：（connection或tcp或upd）与 packetLoss 互斥。
   */
  functions: Array<DialTestScene | DiagnoseFunc>;
  dialing?: NetworkDialing;
  load?: NetworkLoad;
  netCaught?: NetworkCaught;
  packetLoss?: NetworkPacketLoss;
  // 节点配置	列表 任务选了哪些节点就传哪些
  nodeConfig: {
    nodeId: number; // 节点id
    nodeIp: string; // 节点ip
    nodeName: string; // 节点名
    nodeStatus: 'on' | 'off'; // 节点状态
    taskParam: {
      // 任务详情
      // collectSize: number;
      dialing?: NetworkDialing;
      load?: NetworkLoad;
      netCaught?: NetworkCaught;
      packetLoss?: NetworkPacketLoss;
    };
  }[];
  cycle?: boolean;
  appointment?: string;
  targetTime?: string;
  cycleStart?: string;
  cycleStop?: string;
  status?: string;
};
