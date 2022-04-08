import { Injectable } from '@angular/core';
import { HyReactIcon } from '../domain';
import { HyIconLibServiceModule } from './hy-icon-lib.service.module';
import { Cat } from '../../../util';

type ReactIconName = HyReactIcon['name'];
type ReactIconValue = HyReactIcon['data'];

@Injectable({
  providedIn: HyIconLibServiceModule
})
export class HyReactIconsRegistryService {

  /** icon 注册表映射 */
  private registry = new Map<ReactIconName, ReactIconValue>();

  constructor() { }

  /**
   * 注册新的图标
   * @param icons 图标集合
   */
  public registerIcons(icons: HyReactIcon[]): void {

    if (!Cat.isArr(icons)) { return; }

    icons.forEach((ic: HyReactIcon) => {
      this.registry.set(ic.name, ic.data);
    });
  }

  /**
   * 根据图标名称获取图标数据
   * @param iconName 图标名称
   * @returns 图标数据
   */
  public getIcon(iconName: string): ReactIconValue {

    if (!this.registry.has(iconName)) {
      throw new Error(`We could not find the icon with the name ${iconName}, did you add it to the Icon registry`);
    }

    return this.registry.get(iconName);
  }

  /**
   * 返回 Icon 的注册表
   */
  public getIconsRegistry(): IterableIterator<any> {

    return this.registry.entries();
  }
}
