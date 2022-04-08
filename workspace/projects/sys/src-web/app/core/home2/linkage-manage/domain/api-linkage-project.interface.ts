import { ApiLinkageTask } from './api-linkage-task.interface';

export interface ApiLinkageProject {
  ownerid: string;
  projectname: string;
  tasklist: ApiLinkageTask[];
  totalCounts: number;
  type: 'task_contrast';
}
