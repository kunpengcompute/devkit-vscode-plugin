import { IReactIcon } from './domain';
import {
    addActive, addDisabled, addHover, addNormal,
} from './icons.static.regedit';

import {
  deleteProjectClick, deleteProjectDisabled, deleteProjectHover,
  deleteProjectNormal
} from './regedit/project-management/deleteProject.regedit';
import {
  uploadHistoryClick, uploadHistoryDisabled, uploadHistoryHover,
  uploadHistoryNormal
} from './regedit/project-management/uploadHistory.regedit';
import { prevClick, prevDisabled, prevHover, prevNormal } from './regedit/project-management/prev.regedit';
import { nextClick, nextDisabled, nextHover, nextNormal } from './regedit/project-management/next.regedit';

export default {
    addIcon: ({
        name: 'addIcon',
        data: {
            normal: addNormal.name,
            hover: addHover.name,
            active: addActive.name,
            disabled: addDisabled.name
        },
    } as IReactIcon),
    deleteProject: ({
        name: 'deleteProject',
        data: {
            normal: deleteProjectNormal.name,
            hover: deleteProjectHover.name,
            active: deleteProjectClick.name,
            disabled: deleteProjectDisabled.name
        },
    } as IReactIcon),
    uploadHistory: ({
        name: 'uploadHistory',
        data: {
            normal: uploadHistoryNormal.name,
            hover: uploadHistoryHover.name,
            active: uploadHistoryClick.name,
            disabled: uploadHistoryDisabled.name
        },
    } as IReactIcon),
    prev: ({
        name: 'prev',
        data: {
            normal: prevNormal.name,
            hover: prevHover.name,
            active: prevClick.name,
            disabled: prevDisabled.name
        },
    } as IReactIcon),
    next: ({
        name: 'next',
        data: {
            normal: nextNormal.name,
            hover: nextHover.name,
            active: nextClick.name,
            disabled: nextDisabled.name
        },
    } as IReactIcon)
};
