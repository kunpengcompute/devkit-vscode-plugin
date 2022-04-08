export enum BatchOptEvent {
  BatchAction = 'batchAction', // 批量操作
  DownloadTpl = 'downloadTpl', // 下载模板
  UploadTpl = 'uploadTpl', // 上传模板
  Confirm = 'confirm', // 确认
  Fail = 'fail', // 失败
  Error = 'error', // 错误
  Replace = 'replace', // 替换
  Close = 'close', // 关闭弹框
  Success = 'success', // 成功
  Cancel = 'cancel', // 取消
  Relation = 'relation', // 有关联工程
  NoRelation = 'noRelation', // 无关联工程
  DeleteSuccess = 'deleteSuccess', // 批量删除成功
  ImportSuccess = 'importSuccess', // 批量添加成功
}
