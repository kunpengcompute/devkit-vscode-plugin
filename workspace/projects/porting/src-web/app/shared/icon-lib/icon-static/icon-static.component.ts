import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, ElementRef,
  Input, Renderer2,
} from '@angular/core';
import { IconsRegistryService, SvgTransformService } from '../services';

/**
 * 静态图标组件
 *
 * @Input name: 图标的名称
 *
 * @example <app-icon-static [name]="'iconName'"></app-icon-static>
 */
@Component({
  selector: 'app-icon-static',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconStaticComponent {

  @Input()
  set name(iconName: string) {
    if (this.svgIcon) {
      this.render.removeChild(this.elementRef.nativeElement, this.svgIcon);
    }
    let svgData: string;
    try {
      svgData = this.irService.getIcon(iconName);
    } catch (error) {
      return;
    }
    this.svgIcon = this.svgService.getImgBySvgStr(svgData);
    this.render.appendChild(this.elementRef.nativeElement, this.svgIcon);
  }

  private svgIcon: Element;

  constructor(
    private render: Renderer2,
    private elementRef: ElementRef,
    private irService: IconsRegistryService,
    private svgService: SvgTransformService,
  ) { }
}

