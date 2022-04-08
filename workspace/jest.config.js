module.exports = {
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    "<rootDir>/test"
  ],
  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  modulePaths: [
    "<rootDir>/projects/",
    "<rootDir>/"
  ],
  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  testEnvironment: "node",
  globals: {
    window: {sessionStorage:{getItem: () => {}}},
    sessionStorage:{getItem: () => {}},
    acquireVsCodeApi: ()=>{},
    self: {webviewSession:{getItem: () => {}}},
    navigator: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36"
    }
  }
};
