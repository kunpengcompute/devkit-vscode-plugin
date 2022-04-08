import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-node-info-panel',
  template: `
<div class="panel">
  <ng-container *ngFor="let key of getPureKeys(nodeInfo)">
    <app-node-info-item [label]="key" [value]="nodeInfo[key]" [allData]="nodeInfo[key]">
    </app-node-info-item>
  </ng-container>
</div>`
})
export class NodeInfoPanelComponent {

  @Input() nodeInfo: { [key in string]: any };

  getPureKeys = (obj: {}) => {
    return Object.keys(obj || {}).filter(item =>
      item !== 'name'
      && item !== 'suggestion'
      && item !== 'annotation'
    );
  }
}
