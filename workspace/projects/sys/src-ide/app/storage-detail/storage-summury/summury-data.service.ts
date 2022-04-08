import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SummuryDataService {

  constructor() { }

  public diskTableData = [];
  public ioTableData = [];
  public ioColumns = [];
  public ioOriginData;
}
