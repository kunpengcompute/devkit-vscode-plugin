import { DialTestType } from './dial-test-type.enum';

export enum DialTestIndex {
  Loss = 'Loss',
  Latency = 'Latency',
  Jitter = 'Jitter',
  Bandwidth = 'bandwidth',
}

export enum DialTestIndexStatus {
  excellent = 'excellent',
  good = 'good',
  bad = 'bad',
  Unknown = 'Unknown',
}

export type IDialKpi = {
  [key in DialTestIndex]?: {
    data: string;
    status: DialTestIndexStatus;
  };
} & {
  // 连通性特有
  destip?: string;
  // 连通性特有
  sourceip?: string;
  // udp 和 tcp 才有
  clientIp?: string;
  // udp 和 tcp 才有
  clientPort?: string;
  // udp 和 tcp 才有
  serverIp?: string;
  // udp 和 tcp 才有
  serverPort?: string;
};

export type DialSequeBase = {
  interval: string;
  // 传输量
  transfer: string;
  // 带宽
  bandwidth: number;
};

export type TcpDialSequeClient = DialSequeBase & {
  // 重传
  retr: number;
  // 窗口大小
  cwnd: number;
};

export type TcpDialSequeServer = DialSequeBase;

export type UdpDialSequeClient = DialSequeBase & {
  // 数据包
  total: string;
  // 丢包率
  lost_rate: string;
};

export type UdpDialSequeServer = DialSequeBase & {
  // 时延
  jitter: number;
  // 丢失数据包/总数据包
  'lost/total': string;
  // 丢包率
  lost_rate: string;
};

/**
 * CPU 中断详情信息
 */
export interface IDialTestRaw {
  test_mode: DialTestType;
  connection?: {
    ping: {
      send_packets: number;
      received_packets: number;
      lost_rate: number;
      rtt_max: number;
      rtt_min: number;
      rtt_arg: number;
      rtt_md: number;
    };
    traceroute: {
      num: string;
      data: {
        serial: string;
        getway: string;
        reptime: string[];
      }[];
    };
    RTT: {
      interval: string;
      data: string[];
    };
    KPI: IDialKpi;
    route_info: string[][];
    arp_info: string[][];
  };
  tcp?: {
    CONNECTION: {
      id: string;
      local_ip: string;
      localport: string;
      remoteiP: string;
      remoteiPport: string;
    };
    SEQUENTIAL: {
      server?: {
        [key in string | number]: TcpDialSequeServer[];
      };
      client?: {
        [key in string | number]: TcpDialSequeClient[];
      };
    };
    STATISTICIAL: {
      server?: {
        [key in string | number]: {
          interval: string;
          transfer: string;
          bandwidth: number;
        };
      };
      client?: {
        [key in string | number]: {
          interval: string;
          transfer: string;
          bandwidth: number;
          retr: number;
        };
      };
    };
    KPI: IDialKpi;
  };
  udp?: {
    CONNECTION: {
      id: string;
      local_ip: string;
      localport: string;
      remoteiP: string;
      remoteiPport: string;
    };
    SEQUENTIAL: {
      server?: {
        [key in string | number]: UdpDialSequeServer[];
      };
      client?: {
        [key in string | number]: UdpDialSequeClient[];
      };
    };
    STATISTICIAL: {
      server?: {
        [key in string | number]: {
          interval: string;
          transfer: string;
          bandwidth: number;
          jitter: number;
          'lost/total': string;
          lost_rate: string;
        };
      };
      client?: {
        [key in string | number]: {
          interval: string;
          transfer: string;
          bandwidth: number;
          jitter: number;
          'lost/total': string;
          lost_rate: string;
        };
      };
    };
    KPI: IDialKpi;
  };
}
