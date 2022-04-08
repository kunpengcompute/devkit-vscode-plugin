// 源码信息
export type SourceData = {
  line: string;
  line_code: string;
  CPU_CYCLES: string;
};

export type BbbData = {
  num: number;
  offset: string;
  line: string;
  CPU_CYCLES: string;
  CPU_CYCLES_COUNT: number;
  target1: string;
  target2: string;
  end: string;
  call: number;
  ins: string;
  ins_list: {
    offset: string;
    encode: string;
    ins: string;
    branch: number;
    call: number;
    conditional: number;
    address: string;
    line: string;
    CPU_CYCLES: string;
    CPU_CYCLES_COUNT: number;
  }[];
};

export type NetIoSrcCode = {
  // 文件名
  filename: string;
  // 源码信息
  source: SourceData[];
  // 汇编码及代码流程图
  bbb: BbbData[];
  // svg 图名称
  svgpath: string;
  // 是否可以生产svg的状态信息
  graph_status: {
    status: number;
    info_cn: string;
    info_en: string;
  };
};
