export interface RespL3cMiss {
  time: number[];
  values: {
    [l3cTag: string]: number[],
  };
}
