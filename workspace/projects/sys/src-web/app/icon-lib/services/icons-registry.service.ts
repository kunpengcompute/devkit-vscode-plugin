import { Injectable } from '@angular/core';
import { IStaticIcon } from '../domain';

type IStaticIconName = IStaticIcon['name'];
type IStaticIconValue = IStaticIcon['data'];

@Injectable({
  providedIn: 'root'
})
export class IconsRegistryService {
  /** icon 注册表映射 */
  private registry = new Map<IStaticIconName, IStaticIconValue>();

  constructor() { }

  /**
   * 注册新的图标
   * @param icons 图标集合
   */
  public registerIcons(icons: IStaticIcon[]): void {
    icons.forEach((ic: IStaticIcon) => {
      this.registry.set(ic.name, ic.data);
    });
  }

  /**
   * 根据图标名称获取图标数据
   * @param iconName 图标名称
   * @returns 图标数据
   */
  public getIcon(iconName: string): IStaticIconValue {
    if (!this.registry.has(iconName)) {
      throw new Error(`We could not find the icon with the name ${iconName},did you add it to the Icon registry`);
    }
    return this.registry.get(iconName);
  }
}
