import {
  ChangeDetectionStrategy, Component, ElementRef, Input, Renderer2
} from '@angular/core';
import {
  HyStaticIconsRegistryService, HySvgTransformService
} from '../services';
import { Cat } from '../../../util';

/**
 * 静态图标组件
 *
 * @Input name: 图标的名称
 *
 * @example <hy-icon-static [name]="'iconName'"></hy-icon-static>
 */
@Component({
  selector: 'hy-icon-static',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HyIconStaticComponent {

  @Input()
  set name(iconName: string) {

    if (Cat.isNil(iconName)) { return; }

    if (this.svgIcon) {
      this.render.removeChild(this.hostEle, this.svgIcon);
    }

    const svgData = this.irService.getIcon(iconName);
    this.svgIcon = this.svgService.getImgBySvgStr(svgData);
    this.render.appendChild(this.hostEle, this.svgIcon);
  }

  private svgIcon: Element;
  private hostEle: Element;

  constructor(
    private render: Renderer2,
    private elementRef: ElementRef,
    private irService: HyStaticIconsRegistryService,
    private svgService: HySvgTransformService,
  ) {

    this.hostEle = this.elementRef.nativeElement;
  }
}
