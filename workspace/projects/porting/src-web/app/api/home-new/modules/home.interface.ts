interface Compiler {
  type: string;
  version: string;
}

interface AnalyseSourcePackage {
  info: {
    sourcedir: string;
    compiler: Compiler;
    constructtool: string;
    interpreted: boolean;
    compilecommand: string;
    targetos: string;
    gfortran: string
    targetkernel: string;
  };
}

export {
  AnalyseSourcePackage
};
