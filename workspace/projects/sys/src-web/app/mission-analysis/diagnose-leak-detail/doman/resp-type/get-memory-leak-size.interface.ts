export interface ProcessLeakSizeStack {
  [pid: string]: {
    process_name: string,
    stack: Array<{
      func_name: string;
      child_leak_size?: string;
      self_leak_size?: string;
    }>
  };
}

export interface GetMemoryLeakSize {
  code: string;
  message: string;
  messageArgs: Array<string>;
  data: {
    memory_leak: {
      status: number;
      info: string;
      data: ProcessLeakSizeStack;
    };
  };
}
