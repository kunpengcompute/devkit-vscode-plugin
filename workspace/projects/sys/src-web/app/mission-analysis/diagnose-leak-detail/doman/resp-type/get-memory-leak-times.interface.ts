export interface ProcessLeakTimesStack {
  [pid: string]: {
    process_name: string,
    stack: Array<{
      func_name: string;
      child_leak_times?: number;
      self_leak_times?: number;
    }>
  };
}

export interface GetMemoryLeakTimes {
  code: string;
  message: string;
  messageArgs: Array<string>;
  data: {
    memory_leak: {
      status: number;
      info: string;
      data: ProcessLeakTimesStack;
    };
  };
}
