import {
  Directive, Input, ElementRef, OnDestroy, ComponentRef
} from '@angular/core';
import { HyNodataService } from './hy-nodata.service';
import { HyNodataRef } from './hy-nodata-ref.interface';
import { HyNodataShowConfig } from './hy-nodata-show-config.interface';
import { NodataComponent } from './nodata.component';
import { Cat } from '../../util';

@Directive({
  selector: '[hyNodata]'
})
export class HyNodataDirective implements OnDestroy {

  @Input('hyNodata')
  set hyNodataConfig(config: HyNodataShowConfig) {

    this.hyNodataConfigStash = config;
    if (!Cat.isNil(this.nodataComp)) {
      this.nodataComp.instance.showConfig = config;
    }
  }
  get hyNodataConfig() {

    return this.hyNodataConfigStash;
  }

  @Input()
  set nodataShow(isShow: boolean) {

    if (isShow) {
      this.nodataComp = this.nodataRef?.show(this.hyNodataConfig);
    } else {
      this.nodataRef?.hide();
      this.nodataComp = undefined;
    }
  }

  private nodataRef: HyNodataRef;
  private nodataComp: ComponentRef<NodataComponent>;
  private hyNodataConfigStash: HyNodataShowConfig;

  constructor(
    private elementRef: ElementRef,
    private nodataService: HyNodataService
  ) {

    this.nodataRef = this.nodataService.create(this.elementRef);
  }

  ngOnDestroy() {

    this.nodataRef.destroy();
  }
}
