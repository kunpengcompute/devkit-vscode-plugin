import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-management',
  template: `<div>
    <app-net-capture-source
      [headers]="headers"
      [functionDetails]="functionDetails"
    ></app-net-capture-source>
  </div>`,
})
export class NetCaptureSourceContainerComponent implements OnInit {

  headers: [];

  functionDetails: {
    sourceCode: { },
    assemblyCode: { },
    codeStream: { }
  };

  constructor(private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.queryParams.subscribe((params) => {
      const data = JSON.parse(params.data);
      this.headers = data.headers;
      this.functionDetails = data.functionDetails;
    });
  }

}
