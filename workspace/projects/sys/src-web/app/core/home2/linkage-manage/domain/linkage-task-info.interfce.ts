import { ApiLinkageProject } from './api-linkage-project.interface';
import { ApiLinkageTask } from './api-linkage-task.interface';
import { TaskStatus } from 'sys/src-web/app/domain';

export type LinkageTaskInfo = {
  id: number,
  isDeletable: boolean,
  taskName: string,
  createTime: Date;
  taskTip: {
    taskName: string,
    analysisType: string,
    compareType: string
  },
  taskStatus: TaskStatus;
  projectInfo: Pick<ApiLinkageProject, 'ownerid' | 'projectname'>;
  taskInfo: ApiLinkageTask;
  hilight?: boolean;
};
