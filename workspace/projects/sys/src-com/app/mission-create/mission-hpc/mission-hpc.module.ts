import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TiFormfieldModule } from '@cloud/tiny3';
import { NodeRankConfigComponent } from './control/node-rank-config/node-rank-config.component';
import { RankNumberSetComponent } from './control/node-rank-config/rank-number-set/rank-number-set.component';
import { NotHpcSelectNodesComponent } from './control/not-hpc-select-nodes/not-hpc-select-nodes.component';
import { NodesSelectComponent } from './control/nodes-select/nodes-select.component';
import { PartAllSelectComponent } from './control/nodes-select/component/part-all-select/part-all-select.component';

@NgModule({
  imports: [CommonModule, SharedModule, TiFormfieldModule],
  exports: [NodeRankConfigComponent, NotHpcSelectNodesComponent],
  declarations: [
    NodeRankConfigComponent,
    RankNumberSetComponent,
    NotHpcSelectNodesComponent,
    NodesSelectComponent,
    PartAllSelectComponent,
  ],
})
export class MissionHpcModule {
  constructor() {}
}
