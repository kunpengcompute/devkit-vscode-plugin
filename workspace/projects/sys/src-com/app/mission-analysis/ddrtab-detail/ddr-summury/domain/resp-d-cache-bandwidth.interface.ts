export interface RespDCacheBandwidth {
  time: number[];
  values: {
    l1d_bandwidth: number[],
    l2d_bandwidth: number[],
  };
}
