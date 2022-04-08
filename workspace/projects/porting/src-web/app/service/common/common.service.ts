import { Injectable } from '@angular/core';
import { ResStatus } from './interface';
import { ONLINE_HELP } from '../../global/url';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // 全局公用的方法
  constructor() { }

  /**
   * 前往联机帮助
   * @param type 类型
   */
  goHelp(type?: string) {
    const isEN = sessionStorage.getItem('language') === 'en-us';
    let link = '';
    switch (type) {
      case 'file':
        link = isEN ? ONLINE_HELP.EN_FILE_HELP : ONLINE_HELP.ZH_FILE_HELP;
        break;
      // 编译命令
      case 'command':
        link = isEN ? ONLINE_HELP.EN_COMMAND_HELP : ONLINE_HELP.ZH_COMMAND_HELP;
        break;
      // 内存一致性
      case 'weak':
        link = isEN ? ONLINE_HELP.EN_WEAK_HELP : ONLINE_HELP.ZH_WEAK_HELP;
        break;
      // 软件包重构失败联机帮助
      case 'rebuildFaild':
        link = isEN ? ONLINE_HELP.rebuildFaildEn : ONLINE_HELP.rebuildFaildZh;
        break;
      // 依赖字典操作失败联机帮助
      case 'depDictionaryFaild':
        link = isEN ? ONLINE_HELP.depDictionaryFaildEn : ONLINE_HELP.depDictionaryFaildZh;
        break;
      // 迁移模板操作失败联机帮助
      case 'migTemplateFaild':
        link = isEN ? ONLINE_HELP.MigTemplateFaildEn : ONLINE_HELP.MigTemplateFaildZh;
        break;
      // 扫描无权限联机帮助
      case 'scanNoPermission':
        link = isEN ? ONLINE_HELP.scanNoPermissionEn : ONLINE_HELP.scanNoPermissionZh;
        break;
      // 专项软件迁移yum命令无法执行联机帮助
      case 'yumFailed':
        link = isEN ? ONLINE_HELP.yumFailedEn : ONLINE_HELP.yumFailedZh;
        break;
      default:
        link = isEN ? ONLINE_HELP.EN_HELP : ONLINE_HELP.ZH_HELP;
        break;
    }
    window.open(link);
  }

  /**
   * 点击下载链接下载
   * @param url 地址
   */
  downloadLink(url: string): void {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * 将图片转换为 base64 格式
   * @param imgUrl 图片地址
   * @param return 返回 Promise 对象
   */
  public getBase64(imgUrl: string): Promise<any> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('get', imgUrl, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        if (this.status === 200) {
          // 得到一个blob对象
          const blob = this.response;
          //  至关重要
          const oFileReader = new FileReader();
          oFileReader.onloadend = (e: any) => {
            let base64 = e.currentTarget.result;
            base64 = base64.replace('; charset=UTF-8', '');
            resolve(base64);
          };
          oFileReader.readAsDataURL(blob);
        }
      };
      xhr.send();
    });
  }

  /**
   * 对表格时间进行格式化处理
   * @param time 2019_08_22_11_43_55 => 2019/08/22 11:43:55
   */
  formatCreatedId(time: any): string {
    const years = time.slice(0, 4);
    const months = time.slice(4, 6);
    const days = time.slice(6, 8);
    const hours = time.slice(8, 10);
    const minutes = time.slice(10, 12);
    const seconds = time.slice(12, 14);
    return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 禁止ctrl+Z事件
   * @param e 按键
   */
  public stopBack(e: any): boolean{
    if (e.ctrlKey && e.keyCode === 90) {
        return false;
    }
    return true;
  }

  /**
   * 对响应状态码进行处理
   * @param res 响应数据
   */
  public handleStatus(res: ResStatus): number {
    return Number(String(res.status).substr(-2, 1));
  }

  // 判断浏览器环境 是否为 IE11
  isIE11(): boolean {
    const userAgent = navigator.userAgent;
    return (userAgent.indexOf('Trident') >= 0);
  }

  // 判断当前是否有同名文件夹正在扫描
  public scanSameTask(fileName: any, taskPath: any, workspace: any) {
    let uploadFlag = false;
    if (taskPath) {
      taskPath = JSON.parse(taskPath);
      const taskList = taskPath.split(',');
      taskList.forEach((item: string) => {
        if (workspace + this.getFilePre(fileName) === item) {
          uploadFlag = true;
        }
      });
    }
    return uploadFlag;
  }

  // 获取文件前缀名
  public getFilePre(fileName: string) {
    const suffixList = ['.tar.bz', '.tar.bz2', '.tar.gz', '.tar.xz'];
    let name = '';
    name = fileName.substring(0, fileName.lastIndexOf('.'));
    suffixList.forEach(item => {
      if (fileName.endsWith(item)) {
        name = fileName.substr(0, fileName.indexOf(item));
      }
    });
    return name;
  }
}
