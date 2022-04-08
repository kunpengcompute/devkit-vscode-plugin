export interface RespL3cBandwidth {
  time: number[];
  values: {
    [l3cTag: string]: number[],
  };
}
