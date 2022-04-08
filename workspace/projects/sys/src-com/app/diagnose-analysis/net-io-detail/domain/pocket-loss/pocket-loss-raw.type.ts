// 对比分析后端数数据接口
export type PocketLossRaw = {
  // 网络IO丢包统计
  net_err_stat: {
    [eth: string]: string[][];
  };
  // 点击网口后的网口统计信息
  eth_stat: {
    [eth: string]: string;
  };
  // 协议栈缓冲队列丢包
  softnet_stat: string[][];
  // 协议栈丢包信息
  proto_stat: {
    Ip: string,
    Icmp: string,
    Tcp: string,
    Udp: string
  };
  // 内核调用栈丢包（字典格式，子字典内部为二维数组，二维数组第一行为折叠表格的非折叠行，第二行以后数据为展开数据）
  kfree_skb: {
    [kfree: string]: string[][];
  };
};

// 排查建议
type ChildSug = {
  reason: string;
  suggList: string[];
};

export type SuggestionList = {
  title: string;
  isActive: boolean;
  children: ChildSug[];
};

