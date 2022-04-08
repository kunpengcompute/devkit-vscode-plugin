import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-information-description',
  templateUrl: './information-description.component.html',
  styleUrls: ['./information-description.component.scss']
})
export class InformationDescriptionComponent implements OnInit {
  @Input() title: string;
  @Input() column = 1;
  @Input() data: any;
  constructor() { }
  ngOnInit(): void {
  }

}
