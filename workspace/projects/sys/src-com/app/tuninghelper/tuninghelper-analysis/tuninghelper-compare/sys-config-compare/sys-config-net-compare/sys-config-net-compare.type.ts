export enum QueryTypeEnum {
  IfaceConfigInfo = 'iface_config_info',  // 网络网口
  BondInfoDict = 'bond_info_dict',  // 网络绑定
  EthIrqAffinityInfo = 'eth_irq_affinity_info',  // 中断信息
}

/** 接口返回的数据类型 */
export type RespNetConfigCompare = {
  /** 网络网口 */
  iface_config_info?: RespNetInterfaceCompare;
  /** 网络绑定 */
  bond_info_dict?: RespBondInfoDictCompare;
  /** 中断信息 */
  eth_irq_affinity_info?: RespEthIrqAffinityInfoCompare;
};

export type NetworkType = {
  node1: string[];
  node2: string[];
  status: 'True' | 'False';
};

export type RespNetInterfaceCompare = {
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
  [network: string]: NetworkType;
};

export type RespBondInfoDictCompare = {
  /** 绑定名：
   * {
   *  node1: [绑定名称, ipv4, ipv6, 模式, Network Interface],
   *  node2: [绑定名称, ipv4, ipv6, 模式, Network Interface],
   *  status: 'True' | 'False'
   * }
   */
  [bondName: string]: NetworkType
};

/** 硬中断编号对象信息 */
export type IrqNumberType = {
  /** 列名：中断信息 */
  [keyName: string]: {
    node1: any;
    node2: any;
    status: 'True' | 'False';
  }
};
export type RespEthIrqAffinityInfoCompare = {
  /** 中断编号：中断信息 */
  [irqNumber: number]: IrqNumberType
};

/** 显示类型选择值 */
export enum CompareSelectValue {
  All = 'all',
  Difference = 'False'
}
