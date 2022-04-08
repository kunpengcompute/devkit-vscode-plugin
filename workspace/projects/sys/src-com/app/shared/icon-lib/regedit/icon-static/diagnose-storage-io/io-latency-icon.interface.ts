/**
 * io时延图标
 */
export type LatencyIconName = 'ioLatencyFast' | 'ioLatencyGood' | 'ioLatencySlow' | 'ioLatencySuggestion';
export interface IoLatencyIcon {
  name: LatencyIconName;
  data: string;
}
