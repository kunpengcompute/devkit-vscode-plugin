export interface FunctionSourceInfo {
  childline: { [line: number]: any };
  selfline: { [line: number]: any };
  sourcecode: string;
}
