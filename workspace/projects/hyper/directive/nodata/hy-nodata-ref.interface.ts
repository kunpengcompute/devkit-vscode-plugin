import { ComponentRef } from '@angular/core';
import { HyNodataShowConfig } from './hy-nodata-show-config.interface';
import { NodataComponent } from './nodata.component';

export interface HyNodataRef {
  show(config?: HyNodataShowConfig): ComponentRef<NodataComponent>;
  hide(): void;
  destroy(): void;
}
