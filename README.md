# 鲲鹏性能分析工具

## 构建命令

### VsCode 端

- 运行`npm run package:vscode`
- 在目录`extension/tuning/out/`下会生成 Kunpeng-DevKit-IDE-hyper-tuner-plugin_2.5.0.vsix，可进行插件安装

### IDEA 端

- 运行`npm run package:intellij`
- 在目录`extension/tuning-intellIJ/out/`下会生成 tuning.zip，将该压缩包复制到 IDEA 项目仓库的路径下`/hypertuner/src/main/resources/webview/`。
- 在 IDEA 进行`buildPlugin`操作，即可构建 IDEA 插件
