export interface RespL3cHhaRate {
  time: number[];
  values: {
    l3_missrate_total: number[],
    hha_cross_sccl_rate_total: number[],
    hha_cross_socket_rate_total: number[]
  };
}
