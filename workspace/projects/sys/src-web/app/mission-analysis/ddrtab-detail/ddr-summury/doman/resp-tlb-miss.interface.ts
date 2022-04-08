export interface RespTlbMiss {
  time: number[];
  values: {
    percentage: {
      l1i_tlb_missrate: number[],
      l1d_tlb_missrate: number[],
      l2i_tlb_missrate: number[],
      l2d_tlb_missrate: number[],
      itlb_walk_rate: number[],
      dtlb_walk_rate: number[],
    },
    mpki: {
      l1i_tlb_mpki: number[],
      l1d_tlb_mkpi: number[],
      l2i_tlb_mkpi: number[],
      l2d_tlb_mkpi: number[],
      itlb_walk_mpki: number[],
      dtlb_walk_mpki: number[],
    }
  };
}
