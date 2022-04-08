import { Type } from '@angular/core';
import { StateBaseOpreation } from './batch-base-opreation.model';

export type OptStateInfo = {
  token: Type<StateBaseOpreation>;
  type: 'component' | 'service' | 'class';
};
