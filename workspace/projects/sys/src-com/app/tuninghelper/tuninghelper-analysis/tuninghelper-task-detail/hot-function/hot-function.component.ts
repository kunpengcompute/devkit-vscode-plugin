import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'sys/src-com/app/service';
import { OptimizationTypeEnum } from '../domain';

@Component({
  selector: 'app-hot-function',
  templateUrl: './hot-function.component.html',
  styleUrls: ['./hot-function.component.scss']
})
export class HotFunctionComponent implements OnInit {

  @Input() optimizationType: OptimizationTypeEnum;

  public allSugList: Array<any>;

  constructor(
    private http: HttpService
  ) { }

  ngOnInit(): void {
  }

  /**
   * 改变当前选中优化建议
   */
   changeSelecedState(sugData: any) {
    if (!sugData.selected) {
      this.allSugList.map((sug: any) => {
        if (sug.id === sugData.id) {
          sug.selected = true;
        } else {
          sug.selected = false;
        }
      });
    }
  }

}
