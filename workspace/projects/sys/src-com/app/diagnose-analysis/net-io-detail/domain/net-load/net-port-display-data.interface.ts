import { IrqAffinityDetail, ICpuIrqDetail } from './net-load-raw-data.interface';

// 网络 IO 详细信息列表
interface NetIODetailList {
  title: string;
  isActive: boolean;
}

// 网口信息
interface NetPortTableData {
  [key: string]: string[];
}
interface NetPortRowData {
  network: string;
  status: string;
  ipv4: string;
  ipv6: string;
  speed: string;
  supportPort: string;
  duplex: string;
  numaNodem: string;
  driver: string;
  version: string;
  firmwareVersion: string;
  adaptiveRx: string;
  adaptiveTx: string;
  rxUsecs: string;
  txUsecs: string;
  rxFramcs: string;
  txFramcs: string;
  offLoadRx: string;
  offLoadTx: string;
  scattor: string;
  tso: string;
  ufo: string;
  lro: string;
  gso: string;
  gro: string;
  combined: string;
  tx: string;
  rx: string;
}

// 网络绑定信息
interface NetworkBindRowInfo {
  name: string;
  ipV4: string;
  ipV6: string;
  mode: string;
  network: string;
}

// 硬中断信息
interface HartInterSingleTableData {
  [key: string]: IrqAffinityDetail;
}
// 硬中断 CPU 信息
interface HartInterSingleCPUTableData {
  [key: string]: ICpuIrqDetail;
}

// 网络 IO 进程消耗
interface ConsumeIOTableData {
  [key: string]: string[][];
}

export {
  NetIODetailList,
  NetworkBindRowInfo,
  NetPortRowData,
  NetPortTableData,
  ConsumeIOTableData,
  HartInterSingleTableData,
  HartInterSingleCPUTableData
};

