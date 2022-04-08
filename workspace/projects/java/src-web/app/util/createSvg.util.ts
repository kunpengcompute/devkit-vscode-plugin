import lottie from 'lottie-web';

/**
 * lottie 生成svg动图
 * @param ele 寄主元素id选择
 * @param path json文件路径
 */
export function createSvg(ele: string, path: string): void{
  const sysSelection = document.querySelector(ele);
  lottie.loadAnimation({
    container: sysSelection,
    renderer: 'svg',
    loop: true,
    path
  });
}
