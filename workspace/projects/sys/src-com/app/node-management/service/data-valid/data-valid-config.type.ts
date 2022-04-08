import { FormControl, ValidationErrors } from '@angular/forms';

/**
 * 数据验证配置规则
 */
export type DataValidConfig = {
  base: { [key: string]: FormControl };
  crossover: ValidationErrors;
};
