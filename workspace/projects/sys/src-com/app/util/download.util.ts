/**
 * 下载文件
 * @param content 文件内容
 * @param filename 文件名称
 */
  export function downloadFile(content: any, filename: any) {
    // 字符内容转变成blob地址
    const blob = new Blob([content]);
    // ie在客户端保存文件的方法
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // 创建隐藏的可下载链接
      const eleLink = document.createElement('a');
      eleLink.download = filename;
      eleLink.style.display = 'none';
      eleLink.href = URL.createObjectURL(blob);
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      // 然后移除
      document.body.removeChild(eleLink);
    }
  }
