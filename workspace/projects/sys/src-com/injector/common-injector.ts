/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AbstractType, Injectable, InjectionToken,
  Injector, StaticProvider, Type
} from '@angular/core';
import { Cat } from 'hyper';

@Injectable({
  providedIn: 'root'
})
export class CommonInjector {

  private injector: Injector;

  constructor() { }

  get<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>): T {
    if (Cat.isNil(this.injector)) {
      throw new Error(`the injector is initialized not yet`);
    }

    const instance: T = this.injector.get(token);

    if (Cat.isNil(instance)) {
      throw new Error(`instance not be found in the injector`);
    } else {
      return instance;
    }
  }

  setInjector(providers: StaticProvider[], parent: Injector) {
    this.injector = Injector.create({ providers, parent });
  }
}
