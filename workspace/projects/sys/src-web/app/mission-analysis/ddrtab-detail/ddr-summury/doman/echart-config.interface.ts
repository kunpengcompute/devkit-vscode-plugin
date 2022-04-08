export enum EchartYAxisUnit {
  percent = 'percent',
  mpki = 'mpki',
  gbs = 'gbs'
}

export type EchartConfig = {
  xAxisData: {
    min: Date;
    max: Date;
    interval: number;
    data: string[];
  };
  percent?: {
    legend: string[];
    time: number[];
    seriesData: { [legend: string]: number[]; };
  };
  mpki?: {
    legend: string[];
    time: number[];
    seriesData: { [legend: string]: number[]; };
  };
  gbs?: {
    legend: string[];
    time: number[];
    seriesData: { [legend: string]: number[]; };
  };
};
