export interface RespDdrBandwidth {
  time: number[];
  values: {
    ddrc_read: number[],
    ddrc_write: number[],
  };
}
