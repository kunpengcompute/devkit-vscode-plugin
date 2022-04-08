export interface RespICacheBandwidth {
  time: number[];
  values: {
    l1i_bandwidth: number[],
    l2i_bandwidth: number[],
  };
}
