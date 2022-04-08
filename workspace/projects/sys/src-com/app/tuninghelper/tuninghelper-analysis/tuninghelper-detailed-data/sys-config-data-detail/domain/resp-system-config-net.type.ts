import { IrqAffinityDetail } from 'sys/src-com/app/diagnose-analysis/net-io-detail/domain';

export type ContextInfo = {
  /** 接口名：numa数量信息 */
  [interfaceName: string]: number
};
export type RespNetInterface = {
  /** 接口名：27项数据 */
  /**
   * 27项数据分别是
   * status, ipv4, ipv6, supportPort,
   * speed, duplex, numaNode,
   * driver, version, firmwareVersion,
   * adaptiveRx, adaptiveTx,
   * rxUsecs, txUsecs, rxFramcs, txFramcs,
   * offLoadRx, offLoadTx, scattor, tso,
   * ufo, lro, gso, gro,
   * combined, tx, rx
   */
  [interfaceName: string]: string[]
};

export type RespBondInfoDict = {
  /** 绑定名：[绑定名称, ipv4, ipv6, 模式, Network Interface] */
  [bondName: string]: string[]
};

export type RespEthIrqAffinityInfo = {
  /** 接口名 */
  [interfaceName: string]: {
    /** 中断编号：中断信息 */
    [irqNumber: number]: IrqAffinityDetail
  }
};

export type RespNetConfig = {
  /** numa信息 */
  context_info: ContextInfo;
  /** 网络网口 */
  iface_config_info: RespNetInterface;
  /** 网络绑定 */
  bond_info_dict: RespBondInfoDict;
  /** 中断信息 */
  eth_irq_affinity_info: RespEthIrqAffinityInfo;
  /** 网口中断cpu信息，调优助手中暂时不需要 */
  eth_cpu_irq_info: any;
};

export type RespSystemConfigNet = {
  optimization: {
    data: RespNetConfig;
    info: string;
    status: number;
  };
};
