/* 64位运行模式检查 start */
interface AnalysePrecheck {
  scan_file: string;
}
/* 64位运行模式检查 end */

/* 结构体字节对齐检查 start */
interface AnalyseBytecheck {
  info: {
    sourcedir: string;
    constructtool: string;
    compilecommand: string;
  };
}
/* 结构体字节对齐检查 end */

export {
  AnalysePrecheck,
  AnalyseBytecheck
};
