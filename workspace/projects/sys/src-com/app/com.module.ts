import { StaticProvider, NgModule } from '@angular/core';
import { CommonInjector } from '../injector';


@NgModule()
export class ComModule {
  constructor(
    private commonInjector: CommonInjector
  ) {}

  injectProvider(providers: StaticProvider[]) {

    this.commonInjector.setInjector(providers, void 0);
  }
}
