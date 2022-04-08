import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-diff-td',
  template: `
  <div class="diff-td">
    <img *ngIf="diff" src="./assets/img/linkage/abnormal.svg">
    <span *ngIf="!diff && hasEmptyPlace" class="empty-place"></span>
    <span tiOverflow>{{ value }}</span>
  </div>
  `,
  styles: [`
    .diff-td {
      height: var(--ti-table-td-line-height);
      display: flex;
      align-items: center;
    }

    .diff-td img {
      margin-right: 8px;
    }

    .diff-td span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .diff-td .empty-place {
      flex: none;
      display: inline-block;
      width: 24px;
    }
  `]
})
export class DiffTdComponent {
  @Input() value: string;
  @Input() diff: boolean;
  @Input() hasEmptyPlace: boolean;
}
