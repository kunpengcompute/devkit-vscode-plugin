export enum BatchOptState {
  EmptyStatus = 'emptyStatus', // 空状态
  TemplateUpDown = 'templateUpDown', // 模板的上传与下载
  ExcelParse = 'excelParse', // Excel解析
  DataValid = 'dataValid', // 数据有效性验证(逻辑)
  DataValidFail = 'dataValidFail', // 数据有效性验证失败
  BackValid = 'backValid', // 后端校验(逻辑)
  BackValidFail = 'backValidFail', // 后端校验失败
  Fingerprint = 'fingerprint', // 确认指纹信息
  AddNodes = 'addNodes', // 添加节点(逻辑)
  QueryNodeProject = 'queryNodeProject', // 查询节点关联工程(逻辑)
  DisplayNodeProject = 'displayNodeProject', // 展示节点关联工程
  DeleteNodeProject = 'deleteNodeProject', // 删除节点关联工程(逻辑)
  DeleteNodes = 'deleteNodes', // 删除节点(逻辑)
}
