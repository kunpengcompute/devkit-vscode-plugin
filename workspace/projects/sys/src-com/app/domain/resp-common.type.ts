export type RespCommon<T> = {
  code: string;
  data: T;
  message: string;
  messageArgs: Array<any>;
};
