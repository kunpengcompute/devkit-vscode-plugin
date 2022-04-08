export interface RespCoreCacheMiss {
  time: number[];
  values: {
    mpki: {
      l1d_mpki: number[],
      l1i_mpki: number[],
      l2d_mpki: number[],
      l2i_mpki: number[],
    },
    percentage: {
      l1d_missrate: number[],
      l1i_missrate: number[],
      l2d_missrate: number[],
      l2i_missrate: number[],
    }
  };
}
