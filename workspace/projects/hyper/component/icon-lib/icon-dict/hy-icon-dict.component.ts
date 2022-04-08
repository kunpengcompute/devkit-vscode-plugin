import { Component, OnInit } from '@angular/core';
import {
  HyStaticIconsRegistryService, HyReactIconsRegistryService
} from '../services';

@Component({
  selector: 'hy-icon-dict',
  templateUrl: './icon-dict.component.html',
  styleUrls: ['./icon-dict.component.scss']
})
export class HyIconDictComponent {

  staticIcons: string[] = [];
  reactIcons: string[] = [];

  private staticRegistry: IterableIterator<any>;
  private reactRegistry: IterableIterator<any>;

  constructor(
    private staticIRService: HyStaticIconsRegistryService,
    private reactIRService: HyReactIconsRegistryService
  ) {

    this.staticRegistry = this.staticIRService.getIconsRegistry();
    this.reactRegistry = this.reactIRService.getIconsRegistry();

    for (const icon of this.staticRegistry) {
      this.staticIcons.push(icon[0]);
    }

    for (const icon of this.reactRegistry) {
      this.reactIcons.push(icon[0]);
    }
  }
}
