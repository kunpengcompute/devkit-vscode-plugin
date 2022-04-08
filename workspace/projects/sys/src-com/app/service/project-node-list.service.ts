import { Injectable } from '@angular/core';
import { ProjectInfo } from '../domain';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectNodeListService {
  constructor(public http: HttpService) {}

  getProjectNodes(
    projectId: number
  ): Promise<{
    code: string;
    data: ProjectInfo;
    message: string;
    messageArgs: Array<any>;
  }> {
    const url = `/projects/${projectId}/info/`;
    return this.http.get(url);
  }
}
