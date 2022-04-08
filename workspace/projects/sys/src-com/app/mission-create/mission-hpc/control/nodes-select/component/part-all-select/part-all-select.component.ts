import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-part-all-select',
  templateUrl: './part-all-select.component.html',
  styleUrls: ['./part-all-select.component.scss'],
})
export class PartAllSelectComponent implements OnInit {
  @Input() data: [number, number] = [0, 0];
  @Input() isAll: boolean;
  @Output() selectChange = new EventEmitter<boolean>(); // true -- all, false -- part

  constructor() {}

  ngOnInit(): void {}

  onAllClick() {
    this.isAll = true;
    this.selectChange.emit(true);
  }

  onPartClick() {
    this.isAll = false;
    this.selectChange.emit(false);
  }
}
